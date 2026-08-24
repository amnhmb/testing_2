import React, { useState, useEffect } from 'react';
import { getLedger, saveLedgerEntry, deleteLedgerEntry, getSettings } from '../services/storage';
import { Plus, Trash2, Printer, Minus, Wallet } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import PaymentVoucherModal from '../components/PaymentVoucherModal';
import { useLanguage } from '../context/LanguageContext';

export default function Ledger() {
  const { tr } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVoucherEntry, setSelectedVoucherEntry] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await getLedger();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedData);
      
      const setts = await getSettings();
      setSettings(setts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async (newTransaction) => {
    await saveLedgerEntry(newTransaction);
    setIsAddModalOpen(false);
    // Reload fully after save
    await loadLedger(); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('Padam rekod ini?')) {
      await deleteLedgerEntry(id);
      loadLedger();
    }
  };

  const handleRowClick = (entry) => {
    if (entry.type === 'OUT') {
      setSelectedVoucherEntry(entry);
      setIsVoucherModalOpen(true);
    }
  };

  const totalIn = entries.filter(e => e.type === 'IN').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalOut = entries.filter(e => e.type === 'OUT').reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = totalIn - totalOut;

  return (
    <div className="main-content">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">{tr('ledgerTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('ledgerTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {tr('ledgerSubtitle')}
          </p>
        </div>
      </div>

      {/* RINGKASAN TUNAI (BULAN INI) */}
      <div className="ledger-summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid #15803D' }}>
          <h3 className="section-title" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={14} style={{ color: '#15803D' }} /> IN (Wang Masuk)
          </h3>
          <span className="summary-val" style={{ fontSize: '1.75rem', fontWeight: '900', lineHeight: '1', color: '#15803D' }}>
            RM {formatMoney(totalIn)}
          </span>
        </div>
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary-red)' }}>
          <h3 className="section-title" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Minus size={14} style={{ color: 'var(--primary-red)' }} /> OUT (Wang Keluar)
          </h3>
          <span className="summary-val" style={{ fontSize: '1.75rem', fontWeight: '900', lineHeight: '1', color: 'var(--primary-red)' }}>
            RM {formatMoney(totalOut)}
          </span>
        </div>
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--text-dark)' }}>
          <h3 className="section-title" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={14} style={{ color: 'var(--text-dark)' }} /> BAKI
          </h3>
          <span className="summary-val" style={{ fontSize: '1.75rem', fontWeight: '900', lineHeight: '1', color: 'var(--text-dark)' }}>
            RM {formatMoney(balance)}
          </span>
        </div>
      </div>

      {/* Button to add transaction */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          <Plus size={18} /> {tr('addExpense')}
        </button>
      </div>

      {/* BUKU REKOD TRANSAKSI */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="card-title" style={{ fontSize: '0.85rem' }}>BUKU REKOD TRANSAKSI</h3>
        </div>
        
        <div className="table-container desktop-only">
          <table className="table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{tr('date')}</th>
                <th style={{ textAlign: 'left' }}>{tr('category')}</th>
                <th style={{ textAlign: 'left' }}>{tr('description')}</th>
                <th style={{ textAlign: 'center' }}>{tr('type')}</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>{tr('amount')}</th>
                <th style={{ textAlign: 'center' }}>{tr('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{tr('loadingData')}</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{tr('noData')}</td>
                </tr>
              ) : (
                entries.map(e => (
                  <tr 
                    key={e.id} 
                    onClick={() => handleRowClick(e)}
                    style={{ cursor: e.type === 'OUT' ? 'pointer' : 'default' }}
                    className="ledger-row-hover"
                  >
                    <td>{e.date}</td>
                    <td className="font-bold">{e.category}</td>
                    <td>
                      <div>{e.description}</div>
                      {e.payee && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Bayar Kepada: {e.payee}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${e.type === 'IN' ? 'badge-paid' : 'badge-unpaid'}`}>
                        {e.type === 'IN' ? '+ IN' : '- OUT'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem', color: e.type === 'IN' ? '#15803D' : 'var(--primary-red)' }} className="font-bold">
                      {formatMoney(e.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }} onClick={event => event.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                        {e.type === 'OUT' && (
                          <button 
                            onClick={() => { setSelectedVoucherEntry(e); setIsVoucherModalOpen(true); }}
                            className="btn btn-secondary btn-sm"
                            title="Print Payment Voucher"
                          >
                            <Printer size={12} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(e.id)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ color: 'var(--primary-red)', borderColor: '#FEE2E2' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List (visible only under 768px) */}
        <div className="mobile-cards-list mobile-only">
          {loading ? (
            <div className="loading-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{tr('loadingData')}</div>
          ) : entries.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{tr('noData')}</div>
          ) : (
            entries.map(e => (
              <div key={e.id} className="mobile-card" onClick={() => handleRowClick(e)} style={{ cursor: e.type === 'OUT' ? 'pointer' : 'default' }}>
                <div className="mobile-card-row">
                  <span className="mobile-card-title">{e.date}</span>
                  <span className={`badge ${e.type === 'IN' ? 'badge-paid' : 'badge-unpaid'}`}>
                    {e.type === 'IN' ? '+ IN' : '- OUT'}
                  </span>
                </div>
                <div className="mobile-card-row" style={{ marginTop: '0.5rem' }}>
                  <div className="mobile-card-detail">
                    <div className="mobile-card-bold">{e.category}</div>
                    <div>{e.description}</div>
                    {e.payee && <div>Bayar Kepada: {e.payee}</div>}
                  </div>
                  <span className="mobile-card-bold" style={{ color: e.type === 'IN' ? '#15803D' : 'var(--primary-red)' }}>
                    RM {formatMoney(e.amount)}
                  </span>
                </div>
                <div className="mobile-card-actions" onClick={event => event.stopPropagation()}>
                  {e.type === 'OUT' && (
                    <button 
                      onClick={() => { setSelectedVoucherEntry(e); setIsVoucherModalOpen(true); }}
                      className="btn btn-secondary btn-sm"
                      title="Print Payment Voucher"
                    >
                      <Printer size={12} /> Voucher
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(e.id)} 
                    className="btn btn-secondary btn-sm" 
                    style={{ color: 'var(--primary-red)', borderColor: '#FEE2E2' }}
                  >
                    <Trash2 size={12} /> {tr('delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        *Nota: Untuk rekod [- OUT], klik mana-mana baris tersebut untuk cetak [PRINT VOUCHER] lejar.
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      {/* Payment Voucher Modal */}
      {isVoucherModalOpen && selectedVoucherEntry && (
        <PaymentVoucherModal 
          isOpen={isVoucherModalOpen}
          onClose={() => {
            setIsVoucherModalOpen(false);
            setSelectedVoucherEntry(null);
          }}
          entry={selectedVoucherEntry}
          settings={settings}
        />
      )}

      <style>{`
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

        .ledger-row-hover:hover {
          background-color: #fafafa;
        }

        @media (max-width: 768px) {
          .ledger-summary-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
