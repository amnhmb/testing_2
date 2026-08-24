import React, { useState, useEffect } from 'react';
import { updateInvoicePayment } from '../services/storage';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentModal({ invoice, onClose, onSaveSuccess }) {
  const { tr } = useLanguage();
  const [deposit, setDeposit] = useState(invoice.deposit || 0);
  const [status, setStatus] = useState(invoice.status || 'Unpaid');
  const [loading, setLoading] = useState(false);

  const grandTotal = parseFloat(invoice.grand_total);
  const balance = grandTotal - parseFloat(deposit || 0);

  // Auto-adjust status based on deposit amount
  const handleDepositChange = (value) => {
    const val = Math.max(0, parseFloat(value) || 0);
    setDeposit(val);
    
    if (val === 0) {
      setStatus('Unpaid');
    } else if (val >= grandTotal) {
      setStatus('Paid');
      // Limit deposit to grand total
      if (val > grandTotal) {
        setDeposit(grandTotal);
      }
    } else {
      setStatus('Deposit');
    }
  };

  // Quick Action Buttons
  const markAsPaid = () => {
    setDeposit(grandTotal);
    setStatus('Paid');
  };

  const markAsUnpaid = () => {
    setDeposit(0);
    setStatus('Unpaid');
  };

  const markAsDeposit = () => {
    // Default deposit to 50% if currently 0 or full
    if (deposit === 0 || deposit === grandTotal) {
      setDeposit(grandTotal / 2);
    }
    setStatus('Deposit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await updateInvoicePayment(invoice.id, deposit, status, invoice.pengeluaran);
      if (success) {
        onSaveSuccess();
      } else {
        alert('Gagal mengemas kini bayaran.');
      }
    } catch (err) {
      console.error(err);
      alert('Ralat semasa mengemas kini status bayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>UPDATE INVOICE</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body payment-modal-body">
            
            <div className="invoice-summary-strip">
              <span className="strip-label">No. Invoice: <strong>{invoice.invoice_no}</strong></span>
              <span className="strip-label">Pelanggan: <strong>{invoice.client_name}</strong></span>
            </div>

            <div className="payment-total-box">
              <span className="label">Jumlah Perlu Dibayar</span>
              <span className="value">RM {grandTotal.toFixed(2)}</span>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-row">
              <button
                type="button"
                onClick={markAsPaid}
                className={`btn btn-secondary btn-sm quick-btn ${status === 'Paid' ? 'active-paid' : ''}`}
              >
                Bayar Penuh (Paid)
              </button>
              <button
                type="button"
                onClick={markAsDeposit}
                className={`btn btn-secondary btn-sm quick-btn ${status === 'Deposit' ? 'active-deposit' : ''}`}
              >
                Deposit (Setengah)
              </button>
              <button
                type="button"
                onClick={markAsUnpaid}
                className={`btn btn-secondary btn-sm quick-btn ${status === 'Unpaid' ? 'active-unpaid' : ''}`}
              >
                Belum Bayar (Unpaid)
              </button>
            </div>

            {/* Custom Input */}
            <div className="form-group">
              <label className="form-label">Jumlah Deposit (RM)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={grandTotal}
                value={deposit || ''}
                onChange={(e) => handleDepositChange(e.target.value)}
                placeholder="0.00"
                className="form-control"
                required={status === 'Deposit'}
              />
            </div>

            {/* Balance & Status Display */}
            <div className="payment-outcome-details">
              <div className="outcome-row">
                <span>Baki Terhutang:</span>
                <span className={`balance-value ${balance === 0 ? 'paid-text' : 'unpaid-text'}`}>
                  RM {balance.toFixed(2)}
                </span>
              </div>
              <div className="outcome-row">
                <span>Status Invoice:</span>
                <span className={`badge badge-${status.toLowerCase()}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {tr('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Menyimpan...' : tr('save')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .payment-modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .invoice-summary-strip {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .payment-total-box {
          background-color: var(--off-white-bg);
          border: 1px solid var(--border-color);
          padding: 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-total-box .label {
          font-size: 0.7rem;
          font-family: var(--font-primary);
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .payment-total-box .value {
          font-family: var(--font-primary);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--primary-red);
        }

        .quick-actions-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .quick-btn {
          font-size: 0.6rem !important;
          padding: 0.6rem 0.25rem !important;
          letter-spacing: 0.5px !important;
          text-align: center;
        }

        .active-paid {
          background-color: #E2F5EA !important;
          border-color: #15803D !important;
          color: #15803D !important;
        }

        .active-deposit {
          background-color: #FEF3C7 !important;
          border-color: #B45309 !important;
          color: #B45309 !important;
        }

        .active-unpaid {
          background-color: #FEE2E2 !important;
          border-color: #B91C1C !important;
          color: #B91C1C !important;
        }

        .payment-outcome-details {
          border-top: 1px dashed var(--border-color);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .outcome-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .balance-value {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .paid-text {
          color: #15803D;
        }

        .unpaid-text {
          color: #B91C1C;
        }

        @media (max-width: 500px) {
          .invoice-summary-strip {
            flex-direction: column;
            gap: 0.35rem;
            align-items: flex-start;
          }
          .quick-actions-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .quick-btn {
            font-size: 0.75rem !important;
            padding: 0.8rem 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
