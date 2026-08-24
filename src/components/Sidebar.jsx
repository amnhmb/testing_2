import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, Users, Settings, Database, HardDrive, Factory, BookOpen, BarChart2, Globe, Cloud } from 'lucide-react';
import { isCloudMode, getSettings } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const [cloudActive, setCloudActive] = useState(isCloudMode());
  const [logo, setLogo] = useState('');
  const { language, setLanguage, toggleLanguage, tr } = useLanguage();

  // Check storage status periodically or when activeTab changes (e.g., after settings update)
  useEffect(() => {
    setCloudActive(isCloudMode());
    loadLogo();
  }, [activeTab]);

  // Listen to custom connection status change event
  useEffect(() => {
    const handleConnectionChange = () => {
      setCloudActive(isCloudMode());
      loadLogo();
    };
    window.addEventListener('supabase-connection-changed', handleConnectionChange);
    return () => {
      window.removeEventListener('supabase-connection-changed', handleConnectionChange);
    };
  }, []);

  const loadLogo = async () => {
    const data = await getSettings();
    if (data && data.company_logo) {
      setLogo(data.company_logo);
    } else {
      setLogo('');
    }
  };

  const topNavItems = [
    { id: 'overview', label: tr('overview'), icon: LayoutDashboard },
    { id: 'invoices', label: tr('orders'), icon: FileText },
    { id: 'manufacturing', label: tr('manufacturing'), icon: Factory },
    { id: 'clients', label: tr('clients'), icon: Users },
  ];

  const financeNavItems = [
    { id: 'ledger', label: tr('ledger'), icon: BookOpen },
    { id: 'reports', label: tr('reports'), icon: BarChart2 },
  ];

  const bottomNavItems = [
    { id: 'settings', label: tr('settings'), icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''} mobile-only`}
        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
      ></div>

      <aside className={`sidebar no-print ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.35rem', paddingTop: '3.5rem' }}>
        {logo ? (
          <img src={logo} alt="Company Logo" style={{ maxHeight: '45px', objectFit: 'contain' }} />
        ) : (
          <img src={`${import.meta.env.BASE_URL}Logo%20Header.webp`} alt="Company Logo" style={{ maxHeight: '45px', objectFit: 'contain' }} />
        )}
        <h2 className="brand-name" style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '1px', lineHeight: '1', whiteSpace: 'nowrap' }}>
          THIRTYONE <span style={{ color: 'var(--primary-red)' }}>LAB</span><sup style={{ color: 'var(--primary-red)', fontSize: '0.5em', fontWeight: '700' }}>&reg;</sup>
        </h2>
      </div>

      <nav className="sidebar-nav">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <div className="nav-section-title">{tr('finance')}</div>
          {financeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="nav-section-title" style={{ marginTop: '1rem' }}>{tr('settingsSection')}</div>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="nav-section-title" style={{ marginTop: '1rem' }}>{tr('language')}</div>
          <button className="nav-item lang-toggle" onClick={toggleLanguage}>
            <Globe size={18} strokeWidth={1.8} />
            <span className="lang-options">
              <span className={language === 'EN' ? 'active-lang' : ''}>EN</span>
              <span className="lang-separator">/</span>
              <span className={language === 'BM' ? 'active-lang' : ''}>BM</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          {cloudActive ? (
            <>
              <Cloud size={18} color="var(--primary-red)" strokeWidth={2.5} />
              <div className="status-text">
                <span className="status-label">{tr('cloudSync')}</span>
                <span className="status-desc">{tr('cloudDesc')}</span>
              </div>
            </>
          ) : (
            <>
              <Database size={18} color="var(--primary-red)" strokeWidth={2.5} />
              <div className="status-text">
                <span className="status-label">{tr('localMode')}</span>
                <span className="status-desc">{tr('localDesc')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background-color: var(--white);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          height: 100vh;
          flex-shrink: 0;
          z-index: 10;
        }

        .sidebar-brand {
          padding: 2.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-tag {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 3px;
          color: var(--primary-red);
          text-transform: uppercase;
          margin-bottom: 0.3rem;
          display: block;
        }

        .brand-name {
          font-family: var(--font-primary);
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--text-dark);
        }

        .sidebar-nav {
          padding: 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: none;
          background: none;
          color: var(--text-muted);
          font-family: var(--font-primary);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          color: var(--primary-red);
          background-color: var(--primary-red-light);
        }

        .nav-item.active {
          color: var(--white);
          background-color: var(--primary-red);
        }

        .sidebar-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border-color);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: var(--off-white-bg);
          border: 1px solid var(--border-color);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.cloud {
          background-color: var(--primary-red);
          box-shadow: 0 0 8px var(--primary-red);
        }

        .status-dot.local {
          background-color: var(--text-light);
        }

        .status-text {
          display: flex;
          flex-direction: column;
        }

        .status-label {
          font-family: var(--font-primary);
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--text-dark);
        }

        .status-desc {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .nav-section-title {
          font-family: var(--font-primary);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text-muted);
          padding: 1rem 1.25rem 0.25rem;
        }

        .lang-options {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .active-lang {
          color: var(--primary-red);
          font-weight: 800;
        }

        .lang-separator {
          color: var(--border-color);
        }

        @media (max-width: 1024px) {
          .sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(17,17,17,0.4);
            backdrop-filter: blur(4px);
            z-index: 100;
            opacity: 0;
            pointer-events: none;
            transition: var(--transition);
          }
          
          .sidebar-backdrop.active {
            opacity: 1;
            pointer-events: auto;
          }

          .sidebar {
            display: flex !important;
            position: fixed;
            top: 0;
            left: -280px;
            width: 280px;
            height: 100vh;
            height: 100dvh;
            z-index: 101;
            transition: var(--transition);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
          }

          .sidebar.mobile-open {
            left: 0;
          }
        }
      `}</style>
    </aside>
    </>
  );
}
