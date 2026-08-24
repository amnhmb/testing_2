import React, { useState, useEffect, useRef } from 'react';
import { getInvoices, getSettings, updateManufacturingStatus } from '../services/storage';
import { Search, Printer, X, Save } from 'lucide-react';
import KilangVoucherModal from '../components/KilangVoucherModal';
import { useLanguage } from '../context/LanguageContext';

export default function Manufacturing() {
  const { tr, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // States for inline editing
  const [editedData, setEditedData] = useState({});

  // State for Kilang Statement Modal (Monthly Summary Voucher)
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // State for printing single Invoice Payment Voucher
  const [selectedVoucherInvoice, setSelectedVoucherInvoice] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Modal zoom/scale states for the monthly print modal
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const lastTapRef = useRef(0);

  const monthsList = [
    { value: '0', label: language === 'EN' ? 'January' : 'Januari' },
    { value: '1', label: language === 'EN' ? 'February' : 'Februari' },
    { value: '2', label: language === 'EN' ? 'March' : 'Mac' },
    { value: '3', label: language === 'EN' ? 'April' : 'April' },
    { value: '4', label: language === 'EN' ? 'May' : 'Mei' },
    { value: '5', label: language === 'EN' ? 'June' : 'Jun' },
    { value: '6', label: language === 'EN' ? 'July' : 'Julai' },
    { value: '7', label: language === 'EN' ? 'August' : 'Ogos' },
    { value: '8', label: language === 'EN' ? 'September' : 'September' },
    { value: '9', label: language === 'EN' ? 'October' : 'Oktober' },
    { value: '10', label: language === 'EN' ? 'November' : 'November' },
    { value: '11', label: language === 'EN' ? 'December' : 'Disember' }
  ];

  useEffect(() => {
    loadInvoicesAndSettings();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        const targetWidth = window.innerWidth - 32;
        const scaleFactor = Math.min(1, targetWidth / 794);
        setScale(scaleFactor);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadInvoicesAndSettings = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      const setts = await getSettings();
      const sortedData = data.sort((a, b) => b.invoice_no.localeCompare(a.invoice_no));
      setInvoices(sortedData);
      setSettings(setts);
    } catch (e) {
      console.error('Error loading data in manufacturing:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      setZoom(prev => (prev > 1 ? 1 : 1.8));
    }
    lastTapRef.current = now;
  };

  const handleFieldChange = (id, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveInline = async (inv) => {
    const rawKos = editedData[inv.id]?.pengeluaran;
    const kos = rawKos !== undefined ? (parseFloat(rawKos) || 0) : (inv.pengeluaran || 0);
    const status = editedData[inv.id]?.order_status !== undefined ? editedData[inv.id].order_status : (inv.order_status || 'BELUM_DRAFT');
    
    setLoading(true);
    try {
      const success = await updateManufacturingStatus(inv.id, status, kos);
      if (success) {
        alert('Kemaskini berjaya disimpan!');
        setEditedData(prev => {
          const copy = { ...prev };
          delete copy[inv.id];
          return copy;
        });
        loadInvoicesAndSettings();
      } else {
        alert('Gagal menyimpan kemaskini.');
      }
    } catch (err) {
      console.error(err);
      alert('Ralat semasa menyimpan kemaskini.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesMonth = true;
    if (monthFilter !== 'All') {
      const invDate = new Date(inv.date);
      matchesMonth = invDate.getMonth() === parseInt(monthFilter, 10);
    }

    return matchesSearch && matchesMonth;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-paid';
      case 'Deposit': return 'badge-deposit';
      case 'Unpaid': return 'badge-unpaid';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Paid': return 'Paid';
      case 'Deposit': return 'Deposit';
      case 'Unpaid': return 'Unpaid';
      default: return status;
    }
  };

  const getItemSummary = (inv) => {
    if (!inv.items || !Array.isArray(inv.items)) return '-';
    return inv.items.map((item, idx) => {
      let qty = 0;
      if (item.item_type === 'banner') {
        qty = parseInt(item.qty || 0, 10);
      } else if (item.sizes) {
        qty = Object.values(item.sizes).reduce((sum, s) => {
          return sum + parseInt(s?.short || 0, 10) + parseInt(s?.long || 0, 10) + parseInt(s?.pants || 0, 10);
        }, 0);
      }
      const typeLabel = item.item_type === 'banner' ? 'unit' : 'pcs';
      const itemName = item.design_name || (item.item_type ? (item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)) : 'Item');
      return (
        <div key={item.id || idx} style={{ padding: '2px 0' }}>
          • {itemName} ({qty} {typeLabel})
        </div>
      );
    });
  };

  // Summary counts
  const belumDraftCount = filteredInvoices.filter(inv => (inv.order_status || 'BELUM_DRAFT') === 'BELUM_DRAFT').length;
  const draftCount = filteredInvoices.filter(inv => inv.order_status === 'DRAFT').length;
  const pendingCount = filteredInvoices.filter(inv => inv.order_status === 'PENDING').length;
  const processingCount = filteredInvoices.filter(inv => inv.order_status === 'PROCESSING').length;
  const completedCount = filteredInvoices.filter(inv => inv.order_status === 'COMPLETED').length;
  const maintenanceCount = filteredInvoices.filter(inv => inv.order_status === 'MAINTENANCE').length;

  const totalNilaiInvois = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
  const totalDuitDiterima = filteredInvoices.reduce((sum, inv) => {
    if (inv.status === 'Paid') return sum + parseFloat(inv.grand_total || 0);
    if (inv.status === 'Deposit') return sum + parseFloat(inv.deposit || 0);
    return sum;
  }, 0);
  const totalPengeluaran = filteredInvoices.reduce((sum, inv) => {
    // Check if there is an unsaved edit first
    const rawKos = editedData[inv.id]?.pengeluaran;
    return sum + (rawKos !== undefined ? (parseFloat(rawKos) || 0) : parseFloat(inv.pengeluaran || 0));
  }, 0);
  const untungSebenar = totalDuitDiterima - totalPengeluaran;

  const currentMonthLabel = monthFilter === 'All'
    ? 'Semua Bulan'
    : monthsList.find(m => m.value === monthFilter)?.label || '';

  const finalScale = scale * zoom;

  return (
    <div className="main-content">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="section-tag">{tr('mfgTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('mfgTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', letterSpacing: '0.5px' }}>
            {tr('mfgSubtitle')}
          </p>
        </div>
      </div>

      {/* RINGKASAN STATUS KERJA KILANG */}
      <div className="mfg-summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #64748B' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            📥 Belum Draft
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {belumDraftCount}
          </span>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #94A3B8' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ✏️ Draft
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {draftCount}
          </span>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-red)' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ⏳ Pending
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {pendingCount}
          </span>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #EAB308' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ⚙️ Processing
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {processingCount}
          </span>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #15803D' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ✅ Completed
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {completedCount}
          </span>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #DC2626' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            🛠️ Maintenance
          </h3>
          <span className="summary-val" style={{ fontSize: '1.2rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            {maintenanceCount}
          </span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="search-filters-bar card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={tr('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control search-input"
          />
        </div>

        <div className="filter-group-row">
          <div className="filter-box">
            <span className="select-label">{tr('month')}</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="All">{tr('allMonths')}</option>
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="btn btn-primary print-stmt-btn"
            title="Cetak Monthly Statement"
          >
            <Printer size={16} /> Print Statement
          </button>
        </div>
      </div>

      {/* SENARAI TEMPAHAN TABLE */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="card-title" style={{ fontSize: '0.85rem' }}>SENARAI TEMPAHAN</h3>
        </div>

        {loading && invoices.length === 0 ? (
          <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>{tr('loadingData')}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>{tr('noData')}</div>
        ) : (
          <>
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{tr('invNo')} & {tr('clientName')}</th>
                    <th style={{ textAlign: 'left' }}>{tr('items')}</th>
                    <th style={{ textAlign: 'center', width: '160px' }}>{tr('kosKilang')}</th>
                    <th style={{ textAlign: 'center', width: '160px' }}>{tr('status')}</th>
                    <th style={{ textAlign: 'center', width: '180px' }}>{tr('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const currentKos = editedData[inv.id]?.pengeluaran !== undefined 
                      ? editedData[inv.id].pengeluaran 
                      : (inv.pengeluaran || '');
                    
                    const currentStatus = editedData[inv.id]?.order_status !== undefined 
                      ? editedData[inv.id].order_status 
                      : (inv.order_status || 'BELUM_DRAFT');

                    return (
                      <tr key={inv.id}>
                        <td>
                          <div className="font-bold">#{inv.invoice_no}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.client_name}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', whiteSpace: 'normal', maxWidth: '300px' }}>
                            {getItemSummary(inv)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RM</span>
                            <input 
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentKos}
                              onChange={e => handleFieldChange(inv.id, 'pengeluaran', e.target.value)}
                              className="form-control"
                              style={{ width: '90px', padding: '0.25rem 0.5rem', textAlign: 'right' }}
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <select
                            value={currentStatus}
                            onChange={e => handleFieldChange(inv.id, 'order_status', e.target.value)}
                            className="form-control"
                            style={{ padding: '0.25rem 0.5rem', width: '130px', margin: '0 auto', fontSize: '0.85rem' }}
                          >
                            <option value="BELUM_DRAFT">📥 Belum Draft</option>
                            <option value="DRAFT">✏️ Draft</option>
                            <option value="PENDING">⏳ Pending</option>
                            <option value="PROCESSING">⚙️ Processing</option>
                            <option value="COMPLETED">✅ Completed</option>
                            <option value="MAINTENANCE">🛠️ Maintenance</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleSaveInline(inv)}
                              className="btn btn-primary btn-sm font-bold"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Save size={12} /> {tr('save')}
                            </button>
                            <button 
                              onClick={() => { setSelectedVoucherInvoice(inv); setIsVoucherModalOpen(true); }}
                              className="btn btn-secondary btn-sm font-bold"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Printer size={12} /> {tr('print')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards-list mobile-only">
              {filteredInvoices.map((inv) => {
                const currentKos = editedData[inv.id]?.pengeluaran !== undefined 
                  ? editedData[inv.id].pengeluaran 
                  : (inv.pengeluaran || '');
                
                const currentStatus = editedData[inv.id]?.order_status !== undefined 
                  ? editedData[inv.id].order_status 
                  : (inv.order_status || 'BELUM_DRAFT');

                return (
                  <div key={inv.id} className="mobile-card">
                    <div className="mobile-card-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="mobile-card-title">#{inv.invoice_no} - {inv.client_name}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <strong>Items:</strong> {getItemSummary(inv)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Kos Kilang:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>RM</span>
                          <input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentKos}
                            onChange={e => handleFieldChange(inv.id, 'pengeluaran', e.target.value)}
                            className="form-control"
                            style={{ width: '90px', padding: '0.25rem 0.5rem', textAlign: 'right' }}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Status:</span>
                        <select
                          value={currentStatus}
                          onChange={e => handleFieldChange(inv.id, 'order_status', e.target.value)}
                          className="form-control"
                          style={{ padding: '0.25rem 0.5rem', width: '130px' }}
                        >
                          <option value="BELUM_DRAFT">📥 Belum Draft</option>
                          <option value="DRAFT">✏️ Draft</option>
                          <option value="PENDING">⏳ Pending</option>
                          <option value="PROCESSING">⚙️ Processing</option>
                          <option value="COMPLETED">✅ Completed</option>
                          <option value="MAINTENANCE">🛠️ Maintenance</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => handleSaveInline(inv)}
                          className="btn btn-primary btn-sm font-bold"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Save size={12} /> {tr('save')}
                        </button>
                        <button 
                          onClick={() => { setSelectedVoucherInvoice(inv); setIsVoucherModalOpen(true); }}
                          className="btn btn-secondary btn-sm font-bold"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Printer size={12} /> {tr('print')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* --- PAYMENT VOUCHER A4 MODAL --- */}
      {showVoucherModal && settings && (
        <div className="modal-overlay print-modal-overlay" onClick={() => setShowVoucherModal(false)}>
          <div className="modal-content A4-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header print-controls no-print">
              <div className="print-compact-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-dark)' }}>
                    STATEMENT
                  </span>

                  <button
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Printer size={13} /> PRINT
                  </button>
                </div>

                <button className="modal-close" onClick={() => setShowVoucherModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="A4-scroll-wrapper" style={{ overflow: 'auto', flex: 1, padding: '0.25rem 0 1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <div
                className="A4-scale-container"
                onTouchEnd={handleDoubleTap}
                onDoubleClick={() => setZoom(prev => (prev > 1 ? 1 : 1.8))}
                style={{
                  width: `${794 * finalScale}px`,
                  height: `${1122 * finalScale}px`,
                  overflow: 'visible',
                  flexShrink: 0,
                  cursor: zoom > 1 ? 'zoom-out' : 'zoom-in'
                }}
              >
                <div
                  className="modal-body A4-sheet"
                  style={{
                    transform: `scale(${finalScale})`,
                    transformOrigin: 'top left',
                    margin: 0,
                    flex: 'none',
                    width: '210mm',
                    minHeight: '297mm',
                    overflow: 'visible'
                  }}
                >
                  <div className="invoice-container">
                    <div className="invoice-header print-avoid-break">
                      <div className="company-info-block">
                        {settings.company_logo ? (
                          <img src={settings.company_logo} alt="Company Logo" className="invoice-print-logo" />
                        ) : (
                          <img src={`${import.meta.env.BASE_URL}Logo%20Header.webp`} alt="Company Logo" className="invoice-print-logo" />
                        )}
                        <div className="company-text">
                          <h1 className="company-print-name">
                            {settings.company_name && settings.company_name.toUpperCase().includes('LAB') ? (
                              <>
                                {settings.company_name.toUpperCase().split('LAB')[0]}
                                <span style={{ color: 'var(--primary-red)' }}>LAB</span>
                                <sup style={{ color: 'var(--primary-red)', fontSize: '0.5em', fontWeight: '700' }}>&reg;</sup>
                                {settings.company_name.toUpperCase().split('LAB')[1]}
                              </>
                            ) : (
                              settings.company_name
                            )}
                          </h1>
                          <p className="company-print-details address">{settings.company_address}</p>
                          <p className="company-print-details">Tel: {settings.company_phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="document-meta-block print-avoid-break">
                      <h2 className="document-type-title">PAYMENT VOUCHER</h2>
                      <div className="meta-details-box">
                        <div className="meta-row">
                          <span className="meta-lbl">Voucher No:</span>
                          <span className="meta-val font-bold">
                            &nbsp;PV-{new Date().getFullYear()}-{(new Date().getMonth() + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-lbl">Date:</span>
                          <span className="meta-val">&nbsp;{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-lbl">Month:</span>
                          <span className="meta-val font-bold">&nbsp;{currentMonthLabel.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="divider-line print-avoid-break" />

                    <div className="invoice-billing-block print-avoid-break" style={{ marginBottom: '0.2rem' }}>
                      <span className="section-title-print">PRODUCTION & REVENUE DETAILS:</span>
                    </div>

                    <div className="invoice-table-section">
                      <table className="table invoice-print-table">
                        <thead>
                          <tr>
                            <th style={{ width: '35px', textAlign: 'center' }}>No</th>
                            <th style={{ textAlign: 'left' }}>No. Invoice</th>
                            <th style={{ textAlign: 'left' }}>Client Name</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Total Invoice<br/>(RM)</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Production Cost<br/>(RM)</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Profit<br/>(RM)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInvoices.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '0.75rem' }}>No production records for this month.</td>
                            </tr>
                          ) : (
                            filteredInvoices.map((inv, idx) => {
                              const total = parseFloat(inv.grand_total || 0);
                              const pengeluaran = parseFloat(inv.pengeluaran || 0);
                              const paid = inv.status === 'Paid' ? total : parseFloat(inv.deposit || 0);
                              const untung = paid - pengeluaran;

                              return (
                                <tr key={inv.id} className="print-avoid-break">
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.35rem 0.25rem' }}>{idx + 1}.</td>
                                  <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '0.35rem 0.25rem' }} className="font-bold">{inv.invoice_no}</td>
                                  <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '0.35rem 0.25rem' }}>{inv.client_name}</td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.35rem 0.25rem' }}>
                                    <span className={`badge ${getStatusBadgeClass(inv.status)}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>
                                      {getStatusText(inv.status)}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.35rem 0.25rem' }}>{total.toFixed(2)}</td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.35rem 0.25rem', color: 'var(--primary-red)' }}>{pengeluaran.toFixed(2)}</td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0.35rem 0.25rem', color: '#15803D' }} className="font-bold">{untung.toFixed(2)}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <hr className="divider-line print-avoid-break" style={{ margin: '0.4rem 0' }} />

                    <div className="invoice-calculations-section print-avoid-break" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'flex-start', margin: '0.2rem 0' }}>
                      <div style={{ flex: 1, paddingRight: '2rem' }}>
                        <span className="section-title-print" style={{ marginBottom: '0.3rem', display: 'block' }}>TOTAL SALES VALUE</span>
                        <div className="summary-print-row" style={{ justifyContent: 'space-between', fontSize: '0.72rem', color: '#111' }}>
                          <span>Total Invoice Value:</span>
                          <span className="font-bold">RM {totalNilaiInvois.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="calculation-invoice-summary" style={{ width: '340px' }}>
                        <span className="section-title-print" style={{ marginBottom: '0.3rem', display: 'block', textAlign: 'left' }}>CASHFLOW & PROFIT</span>
                        <div className="summary-print-row" style={{ fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Cash Received (Paid + Deposit):</span>
                          <span className="font-bold" style={{ color: '#111' }}>RM {totalDuitDiterima.toFixed(2)}</span>
                        </div>
                        <div className="summary-print-row" style={{ fontSize: '0.72rem', color: 'var(--primary-red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span>Production Cost:</span>
                          <span className="font-bold">- RM {totalPengeluaran.toFixed(2)}</span>
                        </div>
                        <div className="summary-print-row grand-total-row-print" style={{ borderTop: '1px solid #111', marginTop: '0.35rem', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>NET PROFIT:</span>
                          <span style={{ color: '#15803D', fontSize: '0.82rem', fontWeight: 800 }}>RM {untungSebenar.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="divider-line print-avoid-break" style={{ margin: '0.4rem 0' }} />

                    <div className="invoice-bottom-grid print-avoid-break" style={{ marginBottom: 0 }}>
                      <div className="bottom-grid-left" style={{ width: '100%' }}>
                        <div className="terms-container">
                          <span className="section-title-print">NOTES:</span>
                          <p style={{ fontSize: '0.72rem', color: '#555', marginTop: '0.1rem' }}>
                            This payment voucher is automatically generated for internal production and financial records.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="thank-you-footer print-avoid-break" style={{ marginTop: 'auto', paddingTop: '0.3rem' }}>
                      <p style={{ margin: 0 }}>THIRTYONE LAB DESIGN - INTERNAL FINANCIAL STATEMENT</p>
                      <p style={{ textTransform: 'none', fontWeight: '500', fontStyle: 'italic', letterSpacing: '0.5px', marginTop: '0.1rem', color: '#777', fontSize: '0.6rem', margin: 0 }}>Wear With Pride.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SINGLE INVOICE KILANG VOUCHER MODAL --- */}
      {isVoucherModalOpen && selectedVoucherInvoice && (
        <KilangVoucherModal 
          isOpen={isVoucherModalOpen}
          onClose={() => {
            setIsVoucherModalOpen(false);
            setSelectedVoucherInvoice(null);
          }}
          invoice={selectedVoucherInvoice}
          settings={settings}
        />
      )}

      <style>{`
        /* Common Print Voucher Styles */
        .invoice-header {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .company-info-block {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .invoice-print-logo {
          height: 52px;
          max-width: 120px;
          object-fit: contain;
        }

        .logo-placeholder {
          height: 44px;
          width: 44px;
          background-color: var(--primary-red);
          color: #fff;
          font-family: var(--font-primary);
          font-weight: 800;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .company-text {
          display: flex;
          flex-direction: column;
        }

        .company-print-name {
          font-family: var(--font-primary);
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 0.1rem;
          color: #111111;
        }

        .company-print-details {
          font-size: 0.68rem;
          color: #555555;
          line-height: 1.25;
          margin: 0;
        }

        .company-print-details.address {
          max-width: 320px;
        }

        .document-meta-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-top: 0.25rem;
        }

        .document-type-title {
          font-family: var(--font-primary);
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: 1px;
          color: var(--primary-red);
          margin-bottom: 0.15rem;
        }

        .meta-details-box {
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .meta-row {
          display: flex;
          justify-content: flex-start;
          gap: 0.5rem;
        }

        .A4-sheet {
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          background: #ffffff;
          padding: 12mm;
          box-shadow: none;
          border: none;
          margin: 0 auto;
          overflow: visible;
        }

        .invoice-container {
          font-family: var(--font-secondary);
          color: #111111;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          height: 100%;
          justify-content: space-between;
        }

        .divider-line {
          border: none;
          border-top: 1px solid #111111;
          margin: 0.15rem 0;
        }

        .section-title-print {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #111111;
          text-transform: uppercase;
          margin-bottom: 0.1rem;
        }

        .invoice-print-table {
          width: 100%;
          margin: 0.15rem 0;
        }

        .invoice-print-table th {
          border-bottom: 2px solid #111111 !important;
          color: #111111 !important;
          padding: 0.35rem 0.25rem !important;
          font-size: 0.65rem !important;
          text-transform: uppercase;
        }

        .invoice-print-table td {
          border-bottom: 1px solid #e6e2dc !important;
          padding: 0.5rem 0.25rem !important;
          font-size: 0.72rem !important;
          color: #111111 !important;
        }

        .summary-print-row {
          display: flex;
          justify-content: space-between;
          color: #555555;
        }

        .grand-total-row-print {
          font-family: var(--font-primary);
          font-weight: 800;
          color: #111111;
          font-size: 0.78rem;
          border-top: 1px solid #111111;
          padding-top: 0.3rem;
          margin-top: 0.1rem;
        }

        .thank-you-footer {
          text-align: center;
          font-family: var(--font-primary);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #555555;
          margin-top: 0.5rem;
        }

        .meta-lbl {
          color: #555555;
          min-width: 85px;
          font-weight: 600;
        }

        .meta-val {
          color: #111111;
          font-weight: 700;
        }

        .summary-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1.25rem;
        }

        .summary-label {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .summary-val {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .search-filters-bar {
          display: flex;
          gap: 1.25rem;
          align-items: flex-end;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          height: 42px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-light);
        }

        .search-input {
          padding-left: 2.75rem;
          width: 100%;
          height: 42px;
        }

        .filter-group-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .filter-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .select-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-select {
          min-width: 140px;
          height: 42px;
        }

        .print-stmt-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          height: 42px;
          align-self: flex-end;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .modal-header.print-controls {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
          .mfg-summary-row {
            grid-template-columns: 1fr !important;
          }

          .search-filters-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
            padding: 1.25rem !important;
          }

          .search-box {
            width: 100%;
          }

          .filter-group-row {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
            align-items: stretch;
          }

          .filter-box {
            width: 100%;
          }

          .print-stmt-btn {
            width: 100%;
            justify-content: center;
            height: 42px;
          }
        }

        @media (max-width: 768px) {
          .A4-scroll-wrapper {
            align-items: flex-start !important;
            padding-top: 0.25rem !important;
          }
          .A4-scale-container {
            width: 100% !important;
            height: auto !important;
          }
          .A4-sheet {
            width: 100% !important;
            min-height: auto !important;
            transform: none !important;
            padding: 12mm 10mm !important;
          }
          .modal-header.print-controls {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
        }
      `}</style>
    </div>
  );
}
