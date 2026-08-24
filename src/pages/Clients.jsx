import React, { useState, useEffect } from 'react';
import { getClients, deleteClient, getInvoices, saveClient } from '../services/storage';
import { getBasePrice } from '../components/InvoiceModal';
import { Search, User, Phone, ShoppingBag, DollarSign, Eye, Edit2, Trash2, X, Plus, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Clients({ onCreateInvoiceForClient }) {
  const { tr } = useLanguage();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedClient, setSelectedClient] = useState(null); // For Profile Detail View
  const [editingClient, setEditingClient] = useState(null); // For Edit details form modal
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null); // For expanded spec view
  
  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const clientsData = await getClients();
      const invoicesData = await getInvoices();
      setClients(clientsData);
      setInvoices(invoicesData);
    } catch (e) {
      console.error('Error loading CRM data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setEditForm({ name: client.name, phone: client.phone });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) return;

    try {
      await saveClient({
        ...editingClient,
        name: editForm.name,
        phone: editForm.phone
      });
      setEditingClient(null);
      loadData();
    } catch (err) {
      alert('Gagal mengemas kini maklumat pelanggan. Kemungkinan nombor telefon sudah wujud.');
    }
  };

  const handleDeleteClick = async (client) => {
    const hasInvoices = invoices.some(inv => inv.client_id === client.id);
    let confirmMsg = `Adakah anda pasti mahu memadam pelanggan "${client.name}"?`;
    if (hasInvoices) {
      confirmMsg = `Amaran: Pelanggan "${client.name}" mempunyai sejarah invoice. Invoice yang berkaitan tidak akan dipadam tetapi pautan ke pelanggan ini akan dikeluarkan. Teruskan?`;
    }

    if (window.confirm(confirmMsg)) {
      await deleteClient(client.id);
      loadData();
      if (selectedClient && selectedClient.id === client.id) {
        setSelectedClient(null);
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const getClientInvoices = (clientId) => {
    return invoices.filter(inv => inv.client_id === clientId);
  };

  return (
    <div className="main-content">
      {/* Header & Title */}
      <div className="clients-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">{tr('clientsTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('clientsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {tr('clientsSubtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-filters-bar card" style={{ padding: '1.25rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={tr('searchClientPlaceholder') || "Cari nama atau nombor telefon pelanggan..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control search-input"
          />
        </div>
      </div>

      {/* Clients List Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state">{tr('loadingClient')}</div>
        ) : filteredClients.length === 0 ? (
          <div className="empty-state">{tr('noClient')}</div>
        ) : (
          <>
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>{tr('clientName')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('phone')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('totalOrder')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('totalSpent')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="client-name-cell">
                          <User size={16} className="text-light" />
                          <span className="font-bold">{client.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{client.phone}</td>
                      <td style={{ textAlign: 'center' }}>{client.orders_count || 0} kali</td>
                      <td style={{ textAlign: 'center' }} className="font-bold">
                        RM {parseFloat(client.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="btn btn-secondary btn-sm"
                            title="Lihat Sejarah"
                          >
                            <Eye size={12} /> {tr('view')}
                          </button>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="btn btn-secondary btn-sm"
                            title="Kemaskini Butiran"
                          >
                            <Edit2 size={12} /> {tr('edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client)}
                            className="btn btn-secondary btn-sm"
                            title="Padam Pelanggan"
                            style={{ borderColor: '#FEE2E2', color: '#B91C1C' }}
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
              {filteredClients.map((client) => (
                <div key={client.id} className="mobile-card">
                  <div className="mobile-card-row">
                    <span className="mobile-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} className="text-red" />
                      {client.name}
                    </span>
                    <span className="mobile-card-detail">{client.phone}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-detail">Tempahan: <span className="mobile-card-bold">{client.orders_count || 0} kali</span></span>
                    <span className="mobile-card-detail">Jumlah Belanja: <span className="mobile-card-bold" style={{ color: 'var(--primary-red)' }}>RM {parseFloat(client.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                  </div>
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={12} /> {tr('view')}
                    </button>
                    <button
                      onClick={() => handleEditClick(client)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit2 size={12} /> {tr('edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client)}
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

      {/* MODAL 1: Client Profile & History */}
      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Profil Pelanggan</h3>
              <button className="modal-close" onClick={() => setSelectedClient(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Profile Card Summary */}
              <div className="client-profile-summary">
                <div className="summary-info">
                  <div className="info-item">
                    <User size={18} className="text-red" />
                    <div>
                      <span className="info-label">{tr('clientName')}</span>
                      <span className="info-val">{selectedClient.name}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Phone size={18} className="text-red" />
                    <div>
                      <span className="info-label">{tr('phone')}</span>
                      <span className="info-val">{selectedClient.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="summary-metrics">
                  <div className="metric-box">
                    <ShoppingBag size={20} className="text-muted" />
                    <div className="metric-details">
                      <span className="metric-num">{selectedClient.orders_count || 0}</span>
                      <span className="metric-label">Jumlah Order</span>
                    </div>
                  </div>
                  <div className="metric-box">
                    <DollarSign size={20} className="text-red" />
                    <div className="metric-details">
                      <span className="metric-num">
                        RM {parseFloat(selectedClient.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="metric-label">Total Belanja</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="history-section">
                <div className="history-header">
                  <h4>Sejarah Invoice & Tempahan</h4>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      onCreateInvoiceForClient(selectedClient);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={12} /> Cipta Invoice Baru
                  </button>
                </div>

                <div className="table-container desktop-only" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {getClientInvoices(selectedClient.id).length === 0 ? (
                    <div className="empty-history">Tiada rekod tempahan untuk pelanggan ini.</div>
                  ) : (
                    <table className="table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th></th>
                          <th>No. Invoice</th>
                          <th>Tarikh</th>
                          <th>Nama Job</th>
                          <th style={{ textAlign: 'center' }}>Jumlah</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getClientInvoices(selectedClient.id).map((inv) => (
                          <React.Fragment key={inv.id}>
                            <tr
                              onClick={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : inv.id)}
                              style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                              className={expandedInvoiceId === inv.id ? 'expanded-row-active' : ''}
                            >
                              <td style={{ width: '30px', textAlign: 'center', padding: '0.5rem' }}>
                                {expandedInvoiceId === inv.id
                                  ? <ChevronUp size={14} className="text-muted" />
                                  : <ChevronDown size={14} className="text-muted" />
                                }
                              </td>
                              <td className="font-bold">{inv.invoice_no}</td>
                              <td>{inv.date}</td>
                              <td>{inv.job_name || '-'}</td>
                              <td style={{ textAlign: 'center' }} className="font-bold">
                                RM {parseFloat(inv.grand_total).toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge badge-${inv.status.toLowerCase()}`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                            {expandedInvoiceId === inv.id && (
                              <tr className="expanded-spec-row">
                                <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                                  <div className="spec-container">
                                    <div className="spec-header">
                                      <span>HISTORY SPEC PEMBELIAN</span>
                                    </div>
                                    {inv.items && inv.items.length > 0 ? (
                                      inv.items.map((item, idx) => (
                                        <div className="spec-card" key={item.id || idx}>
                                          <div className="spec-image">
                                            {item.design_image ? (
                                              <img src={item.design_image} alt={item.design_name || 'Design'} />
                                            ) : (
                                              <div className="spec-image-placeholder">
                                                <Image size={28} />
                                                <span>Tiada Gambar</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="spec-details">
                                            {item.item_type === 'banner' ? (
                                              <>
                                                <div className="spec-row">
                                                  <span className="spec-label">Item Type</span>
                                                  <span className="spec-value">: Banner</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Nama/Code</span>
                                                  <span className="spec-value">: {item.design_name || '-'}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Harga Seunit</span>
                                                  <span className="spec-value">: RM {parseFloat(item.price || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Kuantiti</span>
                                                  <span className="spec-value">: {item.qty} pcs</span>
                                                </div>
                                                <div className="spec-row" style={{ marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                                                  <span className="spec-label" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Subtotal</span>
                                                  <span className="spec-value" style={{ fontWeight: 700, color: 'var(--primary-red)' }}>: RM {parseFloat(item.subtotal || 0).toFixed(2)}</span>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <div className="spec-row">
                                                  <span className="spec-label">Nama/Code</span>
                                                  <span className="spec-value">: {item.design_name || '-'}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Material</span>
                                                  <span className="spec-value">: {item.material || '-'}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Cutting</span>
                                                  <span className="spec-value">: {item.cutting || '-'}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Jenis Neck</span>
                                                  <span className="spec-value">: {item.neck || '-'}</span>
                                                </div>
                                                <div className="spec-row">
                                                  <span className="spec-label">Name Set</span>
                                                  <span className="spec-value">: {item.name_set || '-'}</span>
                                                </div>
                                                <div className="spec-row" style={{ marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                                                  <span className="spec-label" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Base Price</span>
                                                  <span className="spec-value" style={{ fontWeight: 700, color: 'var(--primary-red)' }}>: RM {(() => {
                                                    const totalQty = inv.items.reduce((sum, i) => sum + (i.qty || 0), 0);
                                                    const base = getBasePrice(totalQty);
                                                    const discountType = inv.discount_type || 'per_pcs';
                                                    const discountVal = inv.discount_value !== undefined ? inv.discount_value : (inv.discount_per_pcs || 0);
                                                    
                                                    if (discountType === 'bulk' && discountVal > 0) {
                                                      return `${base.toFixed(2)} /pcs (Diskaun Pukal RM${parseFloat(discountVal).toFixed(2)})`;
                                                    } else {
                                                      const finalPrice = base - discountVal;
                                                      return discountVal > 0
                                                        ? `${finalPrice.toFixed(2)} /pcs (diskaun RM${parseFloat(discountVal).toFixed(2)})`
                                                        : `${base.toFixed(2)} /pcs`;
                                                    }
                                                  })()}</span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="spec-empty">Tiada data spec pembelian untuk invoice ini.</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {getClientInvoices(selectedClient.id).length === 0 ? (
                    <div className="empty-history">Tiada rekod tempahan untuk pelanggan ini.</div>
                  ) : (
                    getClientInvoices(selectedClient.id).map((inv) => (
                      <div key={inv.id} className="mobile-card" style={{ padding: '1rem', border: '1px solid var(--border-color)', gap: '0.5rem' }}>
                        <div className="mobile-card-row" onClick={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : inv.id)} style={{ cursor: 'pointer' }}>
                          <span className="mobile-card-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-primary)', fontSize: '0.78rem' }}>
                            {expandedInvoiceId === inv.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {inv.invoice_no}
                          </span>
                          <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                        </div>
                        <div className="mobile-card-row" onClick={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : inv.id)} style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>{inv.date} | {inv.job_name || '-'}</span>
                          <span className="mobile-card-bold" style={{ color: 'var(--text-dark)' }}>RM {parseFloat(inv.grand_total).toFixed(2)}</span>
                        </div>
                        {expandedInvoiceId === inv.id && (
                          <div className="spec-container" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                            <div className="spec-header" style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                              <span>HISTORY SPEC PEMBELIAN</span>
                            </div>
                            {inv.items && inv.items.length > 0 ? (
                              inv.items.map((item, idx) => (
                                <div className="spec-card" key={item.id || idx}>
                                  <div className="spec-image">
                                    {item.design_image ? (
                                      <img src={item.design_image} alt={item.design_name || 'Design'} />
                                    ) : (
                                      <div className="spec-image-placeholder">
                                        <Image size={28} />
                                        <span>Tiada Gambar</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="spec-details">
                                    {item.item_type === 'banner' ? (
                                      <>
                                        <div className="spec-row">
                                          <span className="spec-label">Item Type</span>
                                          <span className="spec-value">: Banner</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Nama/Code</span>
                                          <span className="spec-value">: {item.design_name || '-'}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Harga Seunit</span>
                                          <span className="spec-value">: RM {parseFloat(item.price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Kuantiti</span>
                                          <span className="spec-value">: {item.qty} pcs</span>
                                        </div>
                                        <div className="spec-row" style={{ marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                                          <span className="spec-label" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Subtotal</span>
                                          <span className="spec-value" style={{ fontWeight: 700, color: 'var(--primary-red)' }}>: RM {parseFloat(item.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="spec-row">
                                          <span className="spec-label">Nama/Code</span>
                                          <span className="spec-value">: {item.design_name || '-'}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Material</span>
                                          <span className="spec-value">: {item.material || '-'}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Cutting</span>
                                          <span className="spec-value">: {item.cutting || '-'}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Jenis Neck</span>
                                          <span className="spec-value">: {item.neck || '-'}</span>
                                        </div>
                                        <div className="spec-row">
                                          <span className="spec-label">Name Set</span>
                                          <span className="spec-value">: {item.name_set || '-'}</span>
                                        </div>
                                    <div className="spec-row" style={{ marginTop: '0.3rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                                      <span className="spec-label" style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Base Price</span>
                                      <span className="spec-value" style={{ fontWeight: 700, color: 'var(--primary-red)' }}>: RM {(() => {
                                        const totalQty = inv.items.reduce((sum, i) => sum + (i.qty || 0), 0);
                                        const base = getBasePrice(totalQty);
                                        const discountType = inv.discount_type || 'per_pcs';
                                        const discountVal = inv.discount_value !== undefined ? inv.discount_value : (inv.discount_per_pcs || 0);
                                        
                                        if (discountType === 'bulk' && discountVal > 0) {
                                          return `${base.toFixed(2)} /pcs (Diskaun Pukal RM${parseFloat(discountVal).toFixed(2)})`;
                                        } else {
                                          const finalPrice = base - discountVal;
                                          return discountVal > 0
                                            ? `${finalPrice.toFixed(2)} /pcs (diskaun RM${parseFloat(discountVal).toFixed(2)})`
                                            : `${base.toFixed(2)} /pcs`;
                                        }
                                      })()}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                                </div>
                              ))
                            ) : (
                              <div className="spec-empty">Tiada data spec pembelian untuk invoice ini.</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedClient(null)} className="btn btn-secondary">
                {tr('close')}
              </button>
              <button 
                onClick={() => { 
                  const clientToEdit = selectedClient; 
                  setSelectedClient(null); 
                  handleEditClick(clientToEdit); 
                }} 
                className="btn btn-primary"
              >
                <Edit2 size={14} /> {tr('editInfo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Client Form */}
      {editingClient && (
        <div className="modal-overlay" onClick={() => setEditingClient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Edit Maklumat Pelanggan</h3>
              <button className="modal-close" onClick={() => setEditingClient(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">{tr('clientName')}</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{tr('phone')}</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingClient(null)}>
                  {tr('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {tr('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .clients-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-filters-bar {
          padding: 1.25rem 2rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-light);
        }

        .search-input {
          padding-left: 2.75rem;
          width: 100%;
        }

        .client-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .font-bold {
          font-weight: 600;
        }

        .text-light {
          color: var(--text-light);
        }

        .text-red {
          color: var(--primary-red);
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

        /* Profile Modal Styling */
        .client-profile-summary {
          display: flex;
          justify-content: space-between;
          background-color: var(--off-white-bg);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .summary-info {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          flex: 1;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .info-label {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.15rem;
        }

        .info-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-dark);
        }

        .summary-metrics {
          display: flex;
          gap: 1.5rem;
        }

        .metric-box {
          background-color: var(--white);
          border: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
          min-width: 140px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-num {
          font-family: var(--font-primary);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-dark);
        }

        .metric-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        /* History Section */
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .history-header h4 {
          font-family: var(--font-primary);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .empty-history {
          padding: 2.5rem;
          text-align: center;
          color: var(--text-light);
          border: 1px dashed var(--border-color);
          font-size: 0.9rem;
        }

        /* Expandable Spec Row Styles */
        tr.expanded-row-active {
          background-color: var(--off-white-bg) !important;
        }

        tr.expanded-row-active td {
          border-bottom: none !important;
        }

        .expanded-spec-row td {
          background-color: var(--off-white-bg);
        }

        .spec-container {
          padding: 0.75rem 1rem 1rem 1rem;
          border-top: 1px dashed var(--border-color);
        }

        .spec-header {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          padding-bottom: 0.6rem;
          margin-bottom: 0.6rem;
          border-bottom: 1px solid var(--border-color);
        }

        .spec-card {
          display: flex;
          gap: 1.25rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--border-color);
          align-items: flex-start;
        }

        .spec-card:last-child {
          border-bottom: none;
        }

        .spec-image {
          width: 100px;
          height: 100px;
          min-width: 100px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          background: var(--white);
        }

        .spec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spec-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-light);
          gap: 0.25rem;
          background: #f8f8f8;
        }

        .spec-image-placeholder span {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spec-details {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding-top: 0.1rem;
        }

        .spec-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .spec-label {
          font-weight: 600;
          color: var(--text-muted);
          min-width: 85px;
          font-size: 0.78rem;
        }

        .spec-value {
          color: var(--text-dark);
          font-weight: 500;
        }

        .spec-empty {
          padding: 1.5rem;
          text-align: center;
          color: var(--text-light);
          font-size: 0.82rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .client-profile-summary {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .summary-metrics {
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }
          
          .metric-box {
            flex: 1;
          }

          .spec-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .spec-label {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
