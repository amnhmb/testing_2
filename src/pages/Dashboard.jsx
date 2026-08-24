import React, { useState, useEffect } from 'react';
import { getInvoices, getLedger } from '../services/storage';
import { Search, Plus, ArrowRight, Eye, RefreshCw, CreditCard, Activity, Clock, AlertCircle, CheckCircle2, Factory, Inbox } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ setActiveTab, onOpenInvoiceModal, onOpenPaymentModal, onOpenInvoiceDetail }) {
  const { tr } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  const monthsList = [
    { value: '0', label: 'Jan' },
    { value: '1', label: 'Feb' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Apr' },
    { value: '4', label: 'May' },
    { value: '5', label: 'Jun' },
    { value: '6', label: 'Jul' },
    { value: '7', label: 'Aug' },
    { value: '8', label: 'Sep' },
    { value: '9', label: 'Oct' },
    { value: '10', label: 'Nov' },
    { value: '11', label: 'Dec' }
  ];

  const yearsList = [
    (now.getFullYear()).toString(),
    (now.getFullYear() - 1).toString(),
    (now.getFullYear() - 2).toString()
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const invs = await getInvoices();
      setInvoices(invs);
      const ledg = await getLedger();
      setLedger(ledg);
    } catch (e) {
      console.error('Error loading data in dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // --- METRIC CALCULATIONS ---
  const calculateMetrics = () => {
    const currentMonth = parseInt(selectedMonth, 10);
    const currentYear = parseInt(selectedYear, 10);

    // 1. Status Bayaran Counts
    let countUnpaid = 0;
    let countDeposit = 0;
    let countPaidThisMonth = 0;

    // 2. Status Operasi Counts
    let countPending = 0;
    let countProcessing = 0;
    let countCompleted = 0;
    let countMaintenance = 0;
    let countNotSubmitted = 0;

    // 3. Financial Totals (current month)
    let collectedInvoicesMonth = 0;
    let kosKilangMonth = 0;

    invoices.forEach(inv => {
      const invDate = new Date(inv.date);
      const isCurrentMonth = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;

      // Status Bayaran
      if (inv.status === 'Unpaid') {
        countUnpaid++;
      } else if (inv.status === 'Deposit') {
        countDeposit++;
      } else if (inv.status === 'Paid' && isCurrentMonth) {
        countPaidThisMonth++;
      }

      // Status Operasi
      const opStatus = inv.order_status || 'BELUM_DRAFT';
      if (opStatus === 'PENDING') countPending++;
      else if (opStatus === 'PROCESSING') countProcessing++;
      else if (opStatus === 'COMPLETED') countCompleted++;
      else if (opStatus === 'MAINTENANCE') countMaintenance++;
      else if (opStatus === 'BELUM_DRAFT' || opStatus === 'DRAFT') countNotSubmitted++;

      // Current month financials
      if (isCurrentMonth) {
        const paidAmount = inv.status === 'Paid' ? parseFloat(inv.grand_total || 0) : parseFloat(inv.deposit || 0);
        collectedInvoicesMonth += paidAmount;
        kosKilangMonth += parseFloat(inv.pengeluaran || 0);
      }
    });

    // Ledger totals for current month
    let ledgerINMonth = 0;
    let ledgerOUTMonth = 0;

    ledger.forEach(entry => {
      const entryDate = new Date(entry.date);
      const isCurrentMonth = entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;

      if (isCurrentMonth) {
        if (entry.type === 'IN') {
          ledgerINMonth += parseFloat(entry.amount || 0);
        } else {
          ledgerOUTMonth += parseFloat(entry.amount || 0);
        }
      }
    });

    const totalKutipanJualan = collectedInvoicesMonth + ledgerINMonth;
    const totalKosKeluar = kosKilangMonth + ledgerOUTMonth;
    const untungBersih = totalKutipanJualan - totalKosKeluar;

    return {
      countUnpaid,
      countDeposit,
      countPaidThisMonth,
      countPending,
      countProcessing,
      countCompleted,
      countMaintenance,
      countNotSubmitted,
      totalKutipanJualan,
      totalKosKeluar,
      untungBersih
    };
  };

  const metrics = calculateMetrics();

  // Search & Filter lists
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || inv.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Display only recent 5 invoices in the table, sorted latest first
  const recentInvoices = [...filteredInvoices].sort((a, b) => b.invoice_no.localeCompare(a.invoice_no)).slice(0, 5);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-paid';
      case 'Deposit': return 'badge-deposit';
      case 'Unpaid': return 'badge-unpaid';
      default: return '';
    }
  };

  return (
    <div className="main-content">
      {/* Page Header - Desktop View */}
      <div className="dashboard-header desktop-only" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="section-tag">{tr('dashboardTag')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.5rem' }}>{tr('dashboardTitle')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="form-control" style={{ width: '100px', height: '40px', padding: '0 0.5rem' }}>
            {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-control" style={{ width: '80px', height: '40px', padding: '0 0.5rem' }}>
            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={loadData} className="btn btn-secondary" style={{ height: '40px', padding: '0 1rem' }} title={tr('refresh')}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => onOpenInvoiceModal(null)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '40px', padding: '0 1rem' }}>
            <Plus size={16} /> {tr('newOrder')}
          </button>
        </div>
      </div>

      {/* Page Header - Mobile View */}
      <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span className="section-tag" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>{tr('dashboardTag')}</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.25rem' }}>{tr('dashboardTitle')}</h1>
          </div>
          <button onClick={() => onOpenInvoiceModal(null)} className="btn btn-primary btn-sm" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={14} /> New
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="form-control" style={{ flex: 1, fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
            {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-control" style={{ flex: 1, fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Net Profit Hero Card (Top Priority Display) */}
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', border: '2px solid #15803D' }}>
        <span className="summary-label" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>{tr('netProfit')}</span>
        <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: '0.75rem 0', color: '#15803D', lineHeight: '1' }}>
          RM {metrics.untungBersih.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{tr('netProfitDesc')}</span>
      </div>

      {/* Status Cards Grid (2 Columns Desktop) */}
      <div className="dashboard-status-grid desktop-only" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* STATUS BAYARAN */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 className="section-title" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={16} strokeWidth={2} /> {tr('statusBayaran')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} className="text-red" /> {tr('unpaid')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countUnpaid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: '#D97706' }} /> {tr('deposit')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countDeposit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} style={{ color: '#15803D' }} /> {tr('paidMonth')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countPaidThisMonth}</span>
            </div>
          </div>
        </div>

        {/* STATUS OPERASI */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 className="section-title" style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} strokeWidth={2} /> {tr('statusOperasi')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={14} className="text-muted" /> {tr('notSubmitted')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countNotSubmitted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} className="text-muted" /> {tr('pending')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countPending}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} style={{ color: '#2563EB' }} /> {tr('processing')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countProcessing}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} style={{ color: '#15803D' }} /> {tr('completed')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countCompleted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Factory size={14} style={{ color: '#D97706' }} /> {tr('maintenance')}
              </span>
              <span style={{ fontWeight: '700' }}>{metrics.countMaintenance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards Mobile View (Stacked) */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* STATUS BAYARAN Mobile */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={14} strokeWidth={2} /> {tr('statusBayaran')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={13} className="text-red" /> {tr('unpaid')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countUnpaid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={13} style={{ color: '#D97706' }} /> {tr('deposit')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countDeposit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} style={{ color: '#15803D' }} /> {tr('paidMonth')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countPaidThisMonth}</span>
            </div>
          </div>
        </div>

        {/* STATUS OPERASI Mobile */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 className="section-title" style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={14} strokeWidth={2} /> {tr('statusOperasi')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Inbox size={13} className="text-muted" /> {tr('notSubmitted')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countNotSubmitted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={13} className="text-muted" /> {tr('pending')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countPending}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={13} style={{ color: '#2563EB' }} /> {tr('processing')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countProcessing}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} style={{ color: '#15803D' }} /> {tr('completed')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countCompleted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Factory size={13} style={{ color: '#D97706' }} /> {tr('maintenance')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{metrics.countMaintenance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Totals Grid (2 Columns Desktop) */}
      <div className="dashboard-totals-grid desktop-only" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* TOTAL KUTIPAN JUALAN */}
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid #15803D' }}>
          <span className="summary-label" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>{tr('totalKutipan')}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0.5rem 0', color: '#15803D', lineHeight: '1' }}>
            RM {metrics.totalKutipanJualan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr('thisMonth')}</span>
        </div>

        {/* TOTAL KOS (KELUAR) */}
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary-red)' }}>
          <span className="summary-label" style={{ fontSize: '0.65rem', letterSpacing: '1.5px' }}>{tr('totalKos')}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0.5rem 0', color: 'var(--primary-red)', lineHeight: '1' }}>
            RM {metrics.totalKosKeluar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr('kilangLejar')}</span>
        </div>
      </div>

      {/* Financial Totals Mobile View (Stacked) */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* TOTAL KUTIPAN JUALAN Mobile */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #15803D' }}>
          <span className="summary-label" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>{tr('totalKutipan')}</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0.25rem 0', color: '#15803D', lineHeight: '1' }}>
            RM {metrics.totalKutipanJualan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tr('thisMonth')}</span>
        </div>

        {/* TOTAL KOS (KELUAR) Mobile */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-red)' }}>
          <span className="summary-label" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>{tr('totalKos')}</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0.25rem 0', color: 'var(--primary-red)', lineHeight: '1' }}>
            RM {metrics.totalKosKeluar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tr('kilangLejar')}</span>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="table-title" style={{ fontSize: '0.85rem' }}>{tr('recentInvoices')}</h3>
          <button onClick={() => setActiveTab('invoices')} className="btn-text view-all-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-red)' }}>
            {tr('viewAll')} <ArrowRight size={14} />
          </button>
        </div>

        {loading && invoices.length === 0 ? (
          <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>{tr('loadingInvoice')}</div>
        ) : recentInvoices.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>{tr('noInvoice')}</div>
        ) : (
          <>
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>{tr('invNo')}</th>
                    <th style={{ textAlign: 'left' }}>{tr('clientName')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('date')}</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>{tr('amount')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('statusBayaran')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('statusOperasi')}</th>
                    <th style={{ textAlign: 'center' }}>{tr('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ textAlign: 'center' }} className="font-bold">{inv.invoice_no}</td>
                      <td className="font-bold">{inv.client_name}</td>
                      <td style={{ textAlign: 'center' }}>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        {parseFloat(inv.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${inv.order_status === 'COMPLETED' ? 'badge-paid' : inv.order_status === 'PROCESSING' ? 'badge-deposit' : 'badge-unpaid'}`}>
                          {(inv.order_status || 'BELUM_DRAFT').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => onOpenInvoiceDetail(inv)} 
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={12} /> {tr('view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards-list mobile-only">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="mobile-card" onClick={() => onOpenInvoiceDetail(inv)} style={{ cursor: 'pointer' }}>
                  <div className="mobile-card-row">
                    <span className="mobile-card-title">{inv.invoice_no}</span>
                    <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="mobile-card-row" style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{inv.client_name}</span>
                    <span className="font-bold">
                      RM {parseFloat(inv.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="mobile-card-row" style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', gap: '0.5rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr('statusOperasi')}: {(inv.order_status || 'BELUM_DRAFT').replace('_', ' ')}</span>
                    <span style={{ flexShrink: 0 }}>{new Date(inv.date).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .summary-label {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .dashboard-counts-row,
          .dashboard-totals-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
