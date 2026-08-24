import React, { useState, useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function KilangVoucherModal({ isOpen, onClose, invoice, settings }) {
  const { tr } = useLanguage();
  const [payTo, setPayTo] = useState('Kilang Cetak Baju / Tukang Jahit');
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const lastTapRef = useRef(0);

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

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      setZoom(prev => (prev > 1 ? 1 : 1.8));
    }
    lastTapRef.current = now;
  };

  if (!isOpen || !invoice) return null;

  const formatRM = (val) => {
    return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getItemSummary = (inv) => {
    if (!inv.items || !Array.isArray(inv.items)) return '';
    return inv.items.map((item, idx) => {
      let qty = 0;
      if (item.item_type === 'banner') {
        qty = parseInt(item.qty || 0, 10);
      } else if (item.sizes) {
        qty = Object.values(item.sizes).reduce((sum, s) => {
          return sum + parseInt(s?.short || 0, 10) + parseInt(s?.long || 0, 10) + parseInt(s?.pants || 0, 10);
        }, 0);
      }
      return (
        <div key={item.id || idx} style={{ padding: '1px 0' }}>
          • {item.design_name || item.item_type} ({qty})
        </div>
      );
    });
  };

  const companyName = settings?.company_name || 'THIRTYONE LAB';
  const companyAddress = settings?.company_address || 'No 12, Jalan Niaga 1, 43000 Kajang, Selangor';
  const companyPhone = settings?.company_phone || '012-3456789';

  const entryDate = new Date().toLocaleDateString('en-GB');
  const voucherNo = `PV-${new Date().toISOString().split('T')[0]}-K-${invoice.invoice_no}`;

  const finalScale = scale * zoom;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-modal-overlay" onClick={onClose}>
      <div className="modal-content A4-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        
        <div className="modal-header print-controls no-print" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>BAUCAR KILANG</h3>
            <button onClick={() => window.print()} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem' }}>
              <Printer size={13} /> {tr('print')}
            </button>
          </div>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', padding: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="A4-scroll-wrapper" style={{ overflow: 'auto', flex: 1, padding: '0.25rem 0 1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff' }}>
          
          {/* Input field above voucher sheet for easy setting */}
          <div className="card no-print" style={{ width: '100%', maxWidth: '210mm', marginBottom: '1rem', padding: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Pay To</label>
              <input 
                type="text" 
                value={payTo} 
                onChange={e => setPayTo(e.target.value)} 
                className="form-control" 
                placeholder="Contoh: Nama Kilang / Tukang Jahit"
              />
            </div>
          </div>

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
            <div className="A4-sheet" style={{
              width: '210mm',
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
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left'
            }}>
            <div>
              {/* Header: Company Details */}
              <div className="invoice-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div className="company-info-block" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {settings?.company_logo ? (
                    <img src={settings.company_logo} alt="Company Logo" className="invoice-print-logo" style={{ maxHeight: '50px' }} />
                  ) : (
                    <img src={`${import.meta.env.BASE_URL}Logo%20Header.webp`} alt="Company Logo" className="invoice-print-logo" style={{ maxHeight: '50px' }} />
                  )}
                  <div className="company-text">
                    <h1 className="company-print-name" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {companyName.toUpperCase().includes('LAB') ? (
                        <>
                          {companyName.toUpperCase().split('LAB')[0]}
                          <span style={{ color: 'var(--primary-red)' }}>LAB</span>
                          <sup style={{ color: 'var(--primary-red)', fontSize: '0.5em', fontWeight: '700' }}>&reg;</sup>
                          {companyName.toUpperCase().split('LAB')[1]}
                        </>
                      ) : (
                        companyName
                      )}
                    </h1>
                    <p className="company-print-details address" style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#555' }}>{companyAddress}</p>
                    <p className="company-print-details" style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}>Tel: {companyPhone}</p>
                  </div>
                </div>
              </div>

              {/* Title and Metadata */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>PAYMENT VOUCHER (KILANG)</h2>
                <div style={{ fontSize: '0.75rem', textAlign: 'left' }}>
                  <div style={{ marginBottom: '0.1rem' }}>
                    <span style={{ color: '#555' }}>Voucher No: </span>
                    <span style={{ fontWeight: 'bold' }}>{voucherNo}</span>
                  </div>
                  <div>
                    <span style={{ color: '#555' }}>Date: </span>
                    <span>{entryDate}</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '2px solid #111', margin: '1rem 0' }} />

              {/* Pay To Row */}
              <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px solid #111', paddingBottom: '0.5rem' }}>
                <strong>PAY TO:</strong> <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>{payTo}</span>
              </div>

              {/* Details Title */}
              <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>PAYMENT DETAILS (FACTORY COST):</h3>

              {/* Voucher Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                <thead>
                  <tr style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    <th style={{ width: '40px', padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>NO</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderRight: '1px solid #ddd' }}>ORDER REFERENCE</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderRight: '1px solid #ddd' }}>DESCRIPTION</th>
                    <th style={{ width: '120px', padding: '0.5rem', textAlign: 'right' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #111', fontSize: '0.8rem' }}>
                    <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #ddd', verticalAlign: 'top' }}>1</td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #ddd', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 'bold' }}>Invoice: #{invoice.invoice_no}</div>
                      <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.2rem' }}>Client: {invoice.client_name}</div>
                    </td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #ddd', verticalAlign: 'top' }}>
                      <div>Factory Cost / Production</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Items: {getItemSummary(invoice)}
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', verticalAlign: 'top' }}>RM {formatRM(invoice.pengeluaran)}</td>
                  </tr>
                  <tr style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <td colSpan="3" style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>TOTAL AMOUNT:</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.95rem' }}>RM {formatRM(invoice.pengeluaran)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e6e2dc' }}>
              <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '1rem' }}>
                <strong>NOTES:</strong>
                <p style={{ margin: '0.1rem 0 0 0', lineHeight: '1.3' }}>
                  Official voucher for factory production operating expenses and company financial records.
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
    </div>

      <style>{`
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
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-modal-overlay {
            background: none !important;
          }
          .A4-scroll-wrapper {
            background: none !important;
            padding: 0 !important;
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
            gap: 0.75rem !important;
          }
          .modal-header h3 {
            font-size: 0.65rem !important;
          }
          .btn-sm {
            font-size: 0.7rem !important;
            padding: 0.35rem 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}
