import React, { useState, useEffect, useRef } from 'react';
import { getInvoices, getLedger, getSettings } from '../services/storage';
import { Printer, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Reports() {
  const { tr } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Scale states for mobile responsiveness
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1122);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const sheetRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
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

  // Auto-fit the whole document into the phone screen (mobile only)
  useEffect(() => {
    if (!isMobile) {
      setFitScale(1);
      setSheetHeight(1122);
      return;
    }

    const computeFit = () => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const sheetW = sheet.offsetWidth || 794;
      const sheetH = sheet.offsetHeight || 1122;
      setSheetHeight(sheetH);
      const availW = window.innerWidth - 48;
      const availH = window.innerHeight - 180;
      const s = Math.min(availW / sheetW, availH / sheetH);
      setFitScale(Math.max(0.05, Math.min(1, s)));
    };

    computeFit();
    const t = setTimeout(computeFit, 150);
    window.addEventListener('resize', computeFit);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computeFit);
    };
  }, [isMobile, loading]);

  // Reset zoom when leaving / re-entering mobile
  useEffect(() => {
    setZoomMultiplier(1);
    touchStartRef.current = null;
  }, [isMobile, loading]);

  // Pinch-to-zoom handlers (mobile only)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { distance: d || 1, zoom: zoomMultiplier };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = d / touchStartRef.current.distance;
      setZoomMultiplier(Math.max(0.5, Math.min(3, touchStartRef.current.zoom * ratio)));
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleDoubleTap = () => {
    setZoomMultiplier(prev => (prev > 1 ? 1 : 2));
  };

  const totalScale = isMobile ? fitScale * zoomMultiplier : scale;

  const loadData = async () => {
    setLoading(true);
    try {
      const invs = await getInvoices();
      setInvoices(invs);
      const ledg = await getLedger();
      setLedger(ledg);
      const setts = await getSettings();
      setSettings(setts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatRM = (val) => {
    return parseFloat(val || 0).toFixed(2);
  };

  // Calculations — scoped to the selected month so the "Statement Month" label matches the numbers
  const safeInvoices = (Array.isArray(invoices) ? invoices : []).filter(inv => typeof inv?.date === 'string' && inv.date.startsWith(selectedMonth));
  const safeLedger = (Array.isArray(ledger) ? ledger : []).filter(l => typeof l?.date === 'string' && l.date.startsWith(selectedMonth));

  const totalNilaiInvois = safeInvoices.reduce((sum, inv) => sum + parseFloat(inv?.grand_total || 0), 0);
  const totalPengeluaranInvois = safeInvoices.reduce((sum, inv) => sum + parseFloat(inv?.pengeluaran || 0), 0);

  const revenueInvoices = totalNilaiInvois;
  const outstandingBalance = safeInvoices
    .filter(inv => inv?.status !== 'Paid')
    .reduce((sum, inv) => sum + Math.max(0, parseFloat(inv?.grand_total || 0) - parseFloat(inv?.deposit || 0)), 0);

  // Ledger IN
  // Ledger IN
  const jualanLuar = safeLedger.filter(l => l && l.type === 'IN' && l.category === 'Jualan Luar').reduce((s, l) => s + (l.amount || 0), 0);
  const revenueLain = safeLedger.filter(l => l && l.type === 'IN' && (l.category === 'Modal Tambahan' || l.category === 'Lain-lain Pendapatan')).reduce((s, l) => s + (l.amount || 0), 0);
  const totalRevenue = totalNilaiInvois + jualanLuar + revenueLain;
  
  // Ledger OUT
  const belanjaOperasi = safeLedger.filter(l => l && l.type === 'OUT' && l.category === 'Belanja Operasi').reduce((s, l) => s + (l.amount || 0), 0);
  const gajiPekerja = safeLedger.filter(l => l && l.type === 'OUT' && l.category === 'Gaji Pekerja').reduce((s, l) => s + (l.amount || 0), 0);
  const kosBahan = safeLedger.filter(l => l && l.type === 'OUT' && l.category === 'Kos Bahan Mentah').reduce((s, l) => s + (l.amount || 0), 0);
  const lainBelanja = safeLedger.filter(l => l && l.type === 'OUT' && l.category === 'Lain-lain Belanja').reduce((s, l) => s + (l.amount || 0), 0);

  const expensesKilang = totalPengeluaranInvois + kosBahan;
  const grossProfit = totalRevenue - expensesKilang;

  const totalOperatingExpenses = belanjaOperasi + gajiPekerja + lainBelanja;
  const netProfit = grossProfit - totalOperatingExpenses;

  const companyNameStr = String(settings?.company_name || 'THIRTYONE LAB');
  const companyAddress = settings?.company_address || 'No 12, Jalan Niaga 1, 43000 Kajang, Selangor';
  const companyPhone = settings?.company_phone || '012-3456789';

  const dateObj = new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB');
  const monthNames = ["JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"];
  const [selYearStr, selMonthStr] = selectedMonth.split('-');
  const monthStr = monthNames[parseInt(selMonthStr, 10) - 1] + ' ' + selYearStr;

  return (
    <div className="main-content print-page-target">
      <div className="dashboard-header no-print" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">{tr('reportsTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('reportsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {tr('reportsSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          />
          <button onClick={loadData} className="btn btn-secondary" title="Refresh Data">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Printer size={16} /> {tr('printReport')}
          </button>
        </div>
      </div>

      <div className="A4-scroll-wrapper" style={{ overflow: 'auto', flex: 1, padding: '0.25rem 0 1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem', width: '100%', maxWidth: '800px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Menganalisis data...</span>
          </div>
        ) : (
          <div
            className="A4-scale-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleTap}
            style={{
              width: `${794 * totalScale}px`,
              height: `${sheetHeight * totalScale}px`,
              overflow: 'visible',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              margin: 'auto',
              touchAction: 'pan-x pan-y',
              cursor: isMobile ? 'zoom-in' : 'default'
            }}
          >
            <div
              ref={sheetRef}
              className="A4-sheet"
              style={{
                width: '210mm',
                maxWidth: '210mm',
                minHeight: '297mm',
                padding: '15mm 12mm',
                boxSizing: 'border-box',
                background: '#fff',
                border: 'none',
                overflow: 'visible',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: `scale(${totalScale})`,
                transformOrigin: 'top left'
              }}
            >
            <div className="invoice-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              
              <div>
                {/* Header: Company Details */}
                <div className="invoice-header">
                  <div className="company-info-block" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {settings?.company_logo ? (
                      <img src={settings?.company_logo} alt="Company Logo" className="invoice-print-logo" style={{ maxHeight: '50px' }} />
                    ) : (
                      <img src={`${import.meta.env.BASE_URL}Logo%20Header.webp`} alt="Company Logo" className="invoice-print-logo" style={{ maxHeight: '50px' }} />
                    )}
                    <div className="company-text">
                      <h1 className="company-print-name" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                        {companyNameStr.toUpperCase().includes('LAB') ? (
                          <>
                            {companyNameStr.toUpperCase().split('LAB')[0]}
                            <span style={{ color: 'var(--primary-red)' }}>LAB</span>
                            <sup style={{ color: 'var(--primary-red)', fontSize: '0.5em', fontWeight: '700' }}>®</sup>
                            {companyNameStr.toUpperCase().split('LAB')[1]}
                          </>
                        ) : (
                          companyNameStr
                        )}
                      </h1>
                      <p className="company-print-details address" style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#555' }}>{companyAddress}</p>
                      <p className="company-print-details" style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}>Tel: {companyPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Document Title Block */}
                <div className="document-meta-block" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                  <h2 className="document-type-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)' }}>PROFIT & LOSS STATEMENT</h2>
                  <div className="meta-details-box" style={{ fontSize: '0.75rem', textAlign: 'left' }}>
                    <div className="meta-row" style={{ marginBottom: '0.1rem' }}>
                      <span className="meta-lbl" style={{ color: '#555' }}>Statement Month: </span>
                      <span className="meta-val font-bold" style={{ fontWeight: 'bold' }}>{monthStr}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-lbl" style={{ color: '#555' }}>Date: </span>
                      <span className="meta-val">{dateStr}</span>
                    </div>
                  </div>
                </div>

                <hr className="divider-line" style={{ border: 'none', borderTop: '2px solid #111', margin: '1rem 0' }} />

                {/* Table Details */}
                <div className="invoice-table-section" style={{ marginTop: '1rem' }}>
                  <table className="table invoice-print-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #111' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>INCOME / EXPENSES DETAILS</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 'bold', width: '180px' }}>AMOUNT (RM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. REVENUE */}
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.5rem 0', fontWeight: 'bold', fontSize: '0.8rem' }}>1. REVENUE</td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Sales / Customer Invoices</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatRM(revenueInvoices)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Other Income (Non-Invoice)</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatRM(revenueLain)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <td style={{ padding: '0.5rem 0 0.5rem 1.5rem' }}>TOTAL REVENUE (A)</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem 0', borderBottom: '1px double #111' }}>{formatRM(totalRevenue)}</td>
                      </tr>
                      {outstandingBalance > 0 && (
                        <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.7rem' }}>
                          <td style={{ padding: '0.3rem 0 0.5rem 1.5rem', color: '#D97706' }}>↳ Termasuk Baki Belum Terima (Outstanding)</td>
                          <td style={{ textAlign: 'right', padding: '0.3rem 0 0.5rem 0', color: '#D97706' }}>({formatRM(outstandingBalance)})</td>
                        </tr>
                      )}

                      {/* 2. COGS */}
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.8rem' }}>2. COST OF GOODS SOLD</td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Production Cost / Factory & Material Payments</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0', color: 'var(--primary-red)' }}>({formatRM(expensesKilang)})</td>
                      </tr>

                      {/* GROSS PROFIT */}
                      <tr style={{ borderTop: '2px solid #111', borderBottom: '2px solid #111', fontWeight: 'bold', fontSize: '0.8rem', backgroundColor: '#f8fafc' }}>
                        <td style={{ padding: '0.6rem 0.5rem' }}>GROSS PROFIT (A - B)</td>
                        <td style={{ textAlign: 'right', padding: '0.6rem 0', color: '#15803D' }}>{formatRM(grossProfit)}</td>
                      </tr>

                      {/* 3. OPERATING EXPENSES */}
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.8rem' }}>3. OPERATING EXPENSES</td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Shop Rent</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatRM(belanjaOperasi)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Employee Salaries</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatRM(gajiPekerja)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                        <td style={{ padding: '0.4rem 0 0.4rem 1.5rem', color: '#555' }}>Bills & Utilities</td>
                        <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>{formatRM(lainBelanja)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <td style={{ padding: '0.5rem 0 0.5rem 1.5rem' }}>TOTAL EXPENSES (C)</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem 0', color: 'var(--primary-red)', borderBottom: '1px double #111' }}>({formatRM(totalOperatingExpenses)})</td>
                      </tr>

                      {/* NET PROFIT */}
                      <tr style={{ borderTop: '2px solid #15803D', borderBottom: '2px solid #15803D', fontWeight: 'bold', fontSize: '0.9rem', backgroundColor: '#e2f5ea' }}>
                        <td style={{ padding: '0.8rem 0.5rem', color: '#15803D' }}>NET PROFIT (Gross Profit - C)</td>
                        <td style={{ textAlign: 'right', padding: '0.8rem 0', color: '#15803D', fontSize: '1rem', fontWeight: '800' }}>RM {formatRM(netProfit)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Block */}
              <div className="thank-you-footer print-avoid-break" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e6e2dc' }}>
                <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '1rem', textAlign: 'left' }}>
                  <strong>NOTES:</strong>
                  <p style={{ margin: '0.1rem 0 0 0', lineHeight: '1.3' }}>
                    This financial statement is automatically generated by the company's internal management system based on basic accounting standards.
                  </p>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#555', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-primary)' }}>
                  <p style={{ margin: 0 }}>THIRTYONE LAB DESIGN - INTERNAL FINANCIAL STATEMENT</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontStyle: 'italic', textTransform: 'none', fontWeight: 500, fontSize: '0.6rem', color: '#777', letterSpacing: '0.5px' }}>Wear With Pride.</p>
                </div>
              </div>

            </div>
          </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .A4-scroll-wrapper {
            padding-top: 0.25rem !important;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .A4-sheet, .A4-sheet * {
            visibility: visible;
          }
          .A4-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            border: none !important;
            padding: 15mm 12mm !important;
            margin: 0 !important;
            transform: scale(1) !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
