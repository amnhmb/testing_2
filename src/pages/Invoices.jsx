import React, { useState, useEffect } from 'react';
import { getInvoices, deleteInvoice } from '../services/storage';
import { Search, Plus, Eye, Edit2, RefreshCw, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ITEMS_PER_PAGE = 10;

export default function Invoices({ onOpenInvoiceModal, onOpenPaymentModal, onOpenInvoiceDetail }) {
  const { tr, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All'); // 'All' or '0' - '11' representing Jan - Dec
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Status counts for quick view
  const [statusCounts, setStatusCounts] = useState({ unpaid: 0, deposit: 0, paid: 0, total: 0 });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);

      let unpaid = 0;
      let deposit = 0;
      let paid = 0;
      data.forEach(inv => {
        if (inv.status === 'Unpaid') unpaid++;
        else if (inv.status === 'Deposit') deposit++;
        else if (inv.status === 'Paid') paid++;
      });
      setStatusCounts({ unpaid, deposit, paid, total: data.length });
    } catch (e) {
      console.error('Error loading invoices list:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, invoiceNo) => {
    if (window.confirm(`Adakah anda pasti mahu memadam invoice "${invoiceNo}"?`)) {
      await deleteInvoice(id);
      loadInvoices();
    }
  };

  // --- FILTER LOGIC ---
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    
    let matchesMonth = true;
    if (monthFilter !== 'All') {
      const invDate = new Date(inv.date);
      matchesMonth = invDate.getMonth() === parseInt(monthFilter, 10);
    }

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, monthFilter]);

  // Pagination calculation
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-paid';
      case 'Deposit': return 'badge-deposit';
      case 'Unpaid': return 'badge-unpaid';
      default: return '';
    }
  };

  
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

  return (
    <div className="main-content">
      {/* Header */}
      <div className="invoices-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">{tr('ordersTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('ordersTitle')}</h1>
        </div>
        <button onClick={() => onOpenInvoiceModal(null)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={16} /> {tr('newOrder')}
        </button>
      </div>

      {/* Advanced Filters Bar */}
      <div className="search-filters-bar card">
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

          <div className="filter-box">
            <span className="select-label">{tr('status')}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="All">{tr('allStatus')}</option>
              <option value="Paid">Paid</option>
              <option value="Deposit">{tr('deposit')}</option>
              <option value="Unpaid">{tr('unpaid')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state">{tr('loadingInvoice')}</div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="empty-state">{tr('noInvoice')}</div>
        ) : (
          <>
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>{tr('invNo')}</th>
                    <th style={{ textAlign: 'left' }}>{tr('clientName')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('date')}</th>
                    <th style={{ textAlign: 'right' }}>{tr('amount')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('status')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ textAlign: 'center' }} className="font-bold">{inv.invoice_no}</td>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{inv.client_name}</span>
                          <span className="client-phone-sub">{inv.client_phone}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{inv.date}</td>
                      <td style={{ textAlign: 'right' }} className="font-bold">
                        {parseFloat(inv.grand_total).toFixed(2)}
                        {inv.status === 'Deposit' && inv.deposit && (
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            D: {parseFloat(inv.deposit).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell">
                          <button
                            onClick={() => onOpenInvoiceDetail(inv)}
                            className="btn btn-secondary btn-sm"
                            title="Lihat / Cetak"
                          >
                            <Eye size={12} /> {tr('view')}
                          </button>
                          <button
                            onClick={() => onOpenInvoiceModal(inv)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Invois"
                          >
                            <Edit2 size={12} /> {tr('edit')}
                          </button>
                          <button
                            onClick={() => onOpenPaymentModal(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#D97706', borderColor: '#FEF3C7' }}
                            title="Rekod Bayaran"
                          >
                            <RefreshCw size={12} /> {tr('deposit') === 'Deposit' ? 'Bayar' : 'Bayar'}
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id, inv.invoice_no)}
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: '#FEE2E2', color: '#B91C1C' }}
                            title="Padam Invois"
                          >
                            <Trash2 size={12} /> {tr('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards-list mobile-only">
              {paginatedInvoices.map((inv) => (
                <div key={inv.id} className="mobile-card">
                  <div className="mobile-card-row">
                    <span className="mobile-card-title">{inv.invoice_no}</span>
                    <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <div className="mobile-card-detail">
                      <div className="mobile-card-bold">{inv.client_name}</div>
                      <div>Tel: {inv.client_phone}</div>
                      <div>Tarikh: {inv.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mobile-card-detail">Jumlah: <span className="mobile-card-bold">RM {parseFloat(inv.grand_total).toFixed(2)}</span></div>
                      {inv.status === 'Deposit' && inv.deposit && (
                        <div className="mobile-card-detail" style={{ color: '#B45309', fontWeight: 'bold' }}>Depo: RM {parseFloat(inv.deposit).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  <div className="mobile-card-actions" style={{ flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onOpenInvoiceDetail(inv)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={12} /> {tr('view')}
                    </button>
                    <button
                      onClick={() => onOpenInvoiceModal(inv)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit2 size={12} /> {tr('edit')}
                    </button>
                    <button
                      onClick={() => onOpenPaymentModal(inv)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#D97706', borderColor: '#FEF3C7' }}
                    >
                      <RefreshCw size={12} /> {tr('deposit') === 'Deposit' ? 'Bayar' : 'Bayar'}
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id, inv.invoice_no)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#FEE2E2', color: '#B91C1C' }}
                    >
                      <Trash2 size={12} /> {tr('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary btn-sm pag-btn"
          >
            {tr('previous')}
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`btn btn-secondary btn-sm pag-num-btn ${currentPage === pageNum ? 'active-page' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-sm pag-btn"
          >
            {tr('next')}
          </button>
        </div>
      )}

      <style>{`
        .invoices-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-filters-bar {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-end !important;
          gap: 1.5rem !important;
          padding: 1.25rem 2rem !important;
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
          display: flex !important;
          flex-direction: row !important;
          gap: 1rem !important;
          flex-shrink: 0 !important;
          align-items: flex-end !important;
        }

        .filter-box {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .select-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0;
        }

        .filter-select {
          min-width: 150px;
          height: 42px;
          font-size: 0.85rem;
        }

        .client-cell {
          display: flex;
          flex-direction: column;
        }

        .client-name {
          font-weight: 600;
        }

        .client-phone-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-state, .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
          font-family: var(--font-primary);
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .text-red {
          color: var(--primary-red);
        }

        .font-bold {
          font-weight: 600;
        }

        /* Pagination Styles */
        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          margin-bottom: 3rem;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .pag-btn {
          width: 110px;
        }

        .pag-num-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem !important;
        }

        .active-page {
          background-color: var(--primary-red) !important;
          color: var(--white) !important;
          border-color: var(--primary-red) !important;
        }

        @media (max-width: 992px) {
          .search-filters-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
            padding: 1.25rem !important;
          }
          .filter-group-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            width: 100% !important;
            gap: 1rem !important;
          }
          .filter-box {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
          }
          .filter-select {
            width: 100%;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
