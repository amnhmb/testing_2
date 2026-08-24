import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Users, Settings as SettingsIcon, Factory, Cloud, Database, ChevronRight } from 'lucide-react';
import { isCloudMode } from './services/storage';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Manufacturing from './pages/Manufacturing';
import Settings from './pages/Settings';
import Ledger from './pages/Ledger';
import Reports from './pages/Reports';

// Modals
import InvoiceModal from './components/InvoiceModal';
import PaymentModal from './components/PaymentModal';
import InvoiceDetailModal from './components/InvoiceDetailModal';

// Print Styles
import './styles/print.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cloudActive, setCloudActive] = useState(isCloudMode());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCloudActive(isCloudMode());
  }, [activeTab]);

  useEffect(() => {
    const handleConnectionChange = () => {
      setCloudActive(isCloudMode());
    };
    window.addEventListener('supabase-connection-changed', handleConnectionChange);
    return () => {
      window.removeEventListener('supabase-connection-changed', handleConnectionChange);
    };
  }, []);

  // Modals state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [prefilledClient, setPrefilledClient] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);

  // Trigger page refreshes on successful saves
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // --- MODAL TRIGGERS ---
  const handleOpenInvoiceModal = (inv = null) => {
    setEditingInvoice(inv);
    setPrefilledClient(null);
    setInvoiceModalOpen(true);
  };

  const handleOpenInvoiceForClient = (client) => {
    setEditingInvoice(null);
    setPrefilledClient(client);
    setInvoiceModalOpen(true);
  };

  const handleOpenPaymentModal = (inv) => {
    setPaymentInvoice(inv);
    setPaymentModalOpen(true);
  };

  const handleOpenInvoiceDetail = (inv) => {
    setDetailInvoice(inv);
    setDetailModalOpen(true);
  };

  // --- RENDER CURRENT PAGE ---
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Dashboard
            key={`dash_${refreshKey}`}
            setActiveTab={setActiveTab}
            onOpenInvoiceModal={handleOpenInvoiceModal}
            onOpenPaymentModal={handleOpenPaymentModal}
            onOpenInvoiceDetail={handleOpenInvoiceDetail}
          />
        );
      case 'invoices':
        return (
          <Invoices
            key={`inv_${refreshKey}`}
            onOpenInvoiceModal={handleOpenInvoiceModal}
            onOpenPaymentModal={handleOpenPaymentModal}
            onOpenInvoiceDetail={handleOpenInvoiceDetail}
          />
        );
      case 'clients':
        return (
          <Clients
            key={`clients_${refreshKey}`}
            onCreateInvoiceForClient={handleOpenInvoiceForClient}
          />
        );
      case 'manufacturing':
        return <Manufacturing key={`manu_${refreshKey}`} />;
      case 'ledger':
        return <Ledger key={`ledger_${refreshKey}`} />;
      case 'reports':
        return <Reports key={`reports_${refreshKey}`} />;
      case 'settings':
        return <Settings key={`settings_${refreshKey}`} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <LanguageProvider>
    <div className="app-layout">
      {/* Mobile Top Header (Visible only on mobile) */}
      <header className="mobile-top-bar mobile-only">
        <span className="mobile-brand-name">THIRTYONE <span style={{ color: 'var(--primary-red)' }}>LAB</span><sup style={{ color: 'var(--primary-red)', fontSize: '0.5em' }}>&reg;</sup></span>
        <div className="mobile-status-indicator">
          {cloudActive ? (
            <Cloud size={14} color="var(--primary-red)" strokeWidth={2.5} style={{ marginRight: '4px' }} />
          ) : (
            <Database size={14} color="var(--primary-red)" strokeWidth={2.5} style={{ marginRight: '4px' }} />
          )}
          <span className="mobile-status-text">{cloudActive ? 'CLOUD' : 'LOCAL'}</span>
        </div>
      </header>

      {/* Floating Menu Button for Mobile */}
      <button className="mobile-menu-btn mobile-only" onClick={() => setIsMobileMenuOpen(true)}>
        <ChevronRight size={18} />
      </button>

      {/* Sidebar (Navigation) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Pages Content */}
      {renderPage()}

      {/* Modal 1: Create / Edit Invoice */}
      {invoiceModalOpen && (
        <InvoiceModal
          invoice={editingInvoice}
          prefilledClient={prefilledClient}
          onClose={() => setInvoiceModalOpen(false)}
          onSaveSuccess={() => {
            setInvoiceModalOpen(false);
            triggerRefresh();
          }}
        />
      )}

      {/* Modal 2: Record / Update Payments */}
      {paymentModalOpen && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentModalOpen(false)}
          onSaveSuccess={() => {
            setPaymentModalOpen(false);
            triggerRefresh();
          }}
        />
      )}

      {/* Modal 3: View Invoice A4 Details & Printing */}
      {detailModalOpen && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
    </LanguageProvider>
  );
}
