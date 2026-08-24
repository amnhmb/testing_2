import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, isCloudMode } from '../services/storage';
import { createClient } from '@supabase/supabase-js';
import { Save, RefreshCw, Upload, CheckCircle2, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { tr } = useLanguage();
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_logo: '',
    invoice_prefix: '',
    bank_name: '',
    bank_account: '',
    qr_code: '',
    terms: ''
  });

  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(localStorage.getItem('supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'idle' | 'success' | 'error'
  const [testError, setTestError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  useEffect(() => {
    loadSettings();
  }, []);

  const parseBankAccount = (str) => {
    if (!str) return { number: '', name: '' };
    const match = str.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (match) {
      return {
        number: match[1].trim(),
        name: match[2].trim()
      };
    }
    return {
      number: str.trim(),
      name: ''
    };
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      const parsed = parseBankAccount(data.bank_account);
      setBankAccountNo(parsed.number);
      setBankAccountName(parsed.name);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankNoChange = (e) => {
    const val = e.target.value;
    setBankAccountNo(val);
    setSettings(prev => ({
      ...prev,
      bank_account: bankAccountName ? `${val} (${bankAccountName})` : val
    }));
  };

  const handleBankNameChange = (e) => {
    const val = e.target.value;
    setBankAccountName(val);
    setSettings(prev => ({
      ...prev,
      bank_account: val ? `${bankAccountNo} (${val})` : bankAccountNo
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 500KB to prevent oversized localStorage/db records
    if (file.size > 500 * 1024) {
      alert('Had saiz fail adalah 500KB. Sila kecilkan saiz imej anda.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((prev) => ({
        ...prev,
        [field]: reader.result // Base64 string
      }));
    };
    reader.readAsDataURL(file);
  };

  const testSupabaseConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestStatus('error');
      setTestError('Sila masukkan URL dan Anon Key Supabase.');
      return;
    }

    setTestStatus('testing');
    setTestError('');

    try {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      
      // Attempt to ping the settings table
      const { data, error } = await client
        .from('settings')
        .select('*')
        .limit(1);

      if (error) {
        // Table settings might not exist yet, check if connection is active but table is missing
        if (error.code === 'PGRST116' || error.message.includes('relation "settings" does not exist')) {
          setTestStatus('error');
          setTestError('Berjaya bersambung ke Supabase, tetapi jadual "settings" tidak ditemui. Sila jalankan SQL DDL terlebih dahulu.');
        } else {
          throw error;
        }
      } else {
        setTestStatus('success');
      }
    } catch (err) {
      console.error('Supabase test failed:', err);
      setTestStatus('error');
      setTestError(err.message || 'Gagal bersambung ke Supabase. Sila semak URL & Key.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus(null);

    try {
      // 1. Save general settings
      await saveSettings(settings);

      // 2. Save Supabase config to localStorage
      if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
        localStorage.setItem('supabase_url', supabaseUrl.trim());
        localStorage.setItem('supabase_anon_key', supabaseAnonKey.trim());
      } else {
        localStorage.removeItem('supabase_url');
        localStorage.removeItem('supabase_anon_key');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
      
      // Notify components like Sidebar that connection has been updated
      window.dispatchEvent(new Event('supabase-connection-changed'));
      
      // Reload from storage
      loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    try {
      const backupData = {
        invoices: JSON.parse(localStorage.getItem('31lab_invoices') || '[]'),
        clients: JSON.parse(localStorage.getItem('31lab_clients') || '[]'),
        settings: JSON.parse(localStorage.getItem('31lab_settings') || '{}')
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `31lab_invoice_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Gagal membuat sandaran data.');
    }
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.invoices || parsed.clients || parsed.settings) {
          if (confirm('Amaran: Ini akan menggantikan data tempatan semasa anda. Teruskan?')) {
            if (parsed.invoices) localStorage.setItem('31lab_invoices', JSON.stringify(parsed.invoices));
            if (parsed.clients) localStorage.setItem('31lab_clients', JSON.stringify(parsed.clients));
            if (parsed.settings) localStorage.setItem('31lab_settings', JSON.stringify(parsed.settings));
            alert('Pemulihan data berjaya! Sila segar semula aplikasi.');
            window.location.reload();
          }
        } else {
          alert('Format fail sandaran tidak sah.');
        }
      } catch (err) {
        alert('Gagal membaca fail JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="main-content">
      <div>
        <span className="section-tag">{tr('sysConfig')}</span>
        <h1>{tr('settingsTitle')}</h1>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* Section 1: Business Details */}
        <section className="settings-section card">
          <h3 className="section-title">{tr('compInfo')}</h3>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{tr('compName')}</label>
              <input
                type="text"
                name="company_name"
                value={settings.company_name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{tr('phoneNo')}</label>
              <input
                type="text"
                name="company_phone"
                value={settings.company_phone}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{tr('storeAddress')}</label>
            <textarea
              name="company_address"
              value={settings.company_address}
              onChange={handleChange}
              rows="3"
              className="form-control"
              style={{ resize: 'none' }}
              required
            ></textarea>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{tr('compLogo')}</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="company_logo_input"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'company_logo')}
                  className="file-input-hidden"
                />
                <label htmlFor="company_logo_input" className="btn btn-secondary btn-sm">
                  <Upload size={14} /> {tr('uploadLogo')}
                </label>
                {settings.company_logo && (
                  <div className="preview-container">
                    <img src={settings.company_logo} alt="Company Logo Preview" className="logo-preview" />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, company_logo: '' }))}
                      className="btn-text btn-delete-img"
                    >
                      {tr('delete')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{tr('invoicePrefix')}</label>
              <input
                type="text"
                name="invoice_prefix"
                value={settings.invoice_prefix}
                onChange={handleChange}
                className="form-control"
                placeholder="Contoh: NO."
                required
              />
              <span className="helper-text">{tr('invoicePrefixHelp')}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Payment Details */}
        <section className="settings-section card">
          <h3 className="section-title">{tr('paymentInfo')}</h3>
          
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">{tr('bankName')}</label>
              <input
                type="text"
                name="bank_name"
                value={settings.bank_name}
                onChange={handleChange}
                placeholder="Contoh: Maybank"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{tr('bankAccNo')}</label>
              <input
                type="text"
                name="bank_account_no"
                value={bankAccountNo}
                onChange={handleBankNoChange}
                placeholder="Contoh: 112233445566"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{tr('accName')}</label>
              <input
                type="text"
                name="bank_account_name"
                value={bankAccountName}
                onChange={handleBankNameChange}
                placeholder="Contoh: THIRTYONE LAB"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{tr('qrCode')}</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="qr_code_input"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'qr_code')}
                className="file-input-hidden"
              />
              <label htmlFor="qr_code_input" className="btn btn-secondary btn-sm">
                <Upload size={14} /> {tr('uploadQR')}
              </label>
              {settings.qr_code && (
                <div className="preview-container">
                  <img src={settings.qr_code} alt="DuitNow QR Preview" className="qr-preview" />
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, qr_code: '' }))}
                    className="btn-text btn-delete-img"
                  >
                    {tr('delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Terms & Conditions */}
        <section className="settings-section card">
          <h3 className="section-title">{tr('termsTitle')}</h3>
          <div className="form-group">
            <label className="form-label">{tr('termsLabel')}</label>
            <textarea
              name="terms"
              value={settings.terms}
              onChange={handleChange}
              rows="4"
              placeholder="Masukkan terma dan syarat perniagaan yang akan dicetak di bahagian bawah invoice..."
              className="form-control"
              style={{ resize: 'none' }}
            ></textarea>
            <span className="helper-text">{tr('termsHelp')}</span>
          </div>
        </section>

        {/* Section 4: Supabase Sync Settings */}
        <section className="settings-section card">
          <h3 className="section-title">{tr('dbTitle')}</h3>
          <p className="section-desc">
            {tr('dbDesc')}
          </p>

          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => {
                setSupabaseUrl(e.target.value);
                setTestStatus(null);
              }}
              placeholder="https://your-project-id.supabase.co"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Key</label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => {
                setSupabaseAnonKey(e.target.value);
                setTestStatus(null);
              }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="form-control"
            />
          </div>

          <div className="supabase-actions-container">
            <button
              type="button"
              onClick={testSupabaseConnection}
              className="btn btn-secondary"
            >
              {tr('testConnection')}
            </button>

            {testStatus === 'testing' && (
              <span className="status-msg testing">
                <RefreshCw className="spinner" size={16} /> {tr('testingDb')}
              </span>
            )}
            
            {testStatus === 'success' && (
              <span className="status-msg success">
                <CheckCircle2 size={16} /> Sambungan Berjaya! Database sedia untuk digunakan.
              </span>
            )}

            {testStatus === 'error' && (
              <span className="status-msg error">
                <AlertCircle size={16} /> {testError}
              </span>
            )}
          </div>
        </section>

        {/* Section 5: Backup & Restore */}
        <section className="settings-section card">
          <h3 className="section-title">{tr('backupTitle')}</h3>
          <p className="section-desc">
            {tr('backupDesc')}
          </p>
          <div className="backup-actions">
            <button type="button" onClick={handleBackup} className="btn btn-secondary">
              <Download size={14} /> {tr('downloadBackup')}
            </button>
            
            <div className="restore-wrapper">
              <input
                type="file"
                id="restore_input"
                accept=".json"
                onChange={handleRestore}
                className="file-input-hidden"
              />
              <label htmlFor="restore_input" className="btn btn-secondary">
                <FileSpreadsheet size={14} /> {tr('uploadRestore')}
              </label>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Menyimpan...' : tr('saveSettings')}
          </button>
          
          {saveStatus === 'success' && (
            <span className="save-status-msg success">
              <CheckCircle2 size={16} /> {tr('settingsSaved')}
            </span>
          )}
        </div>
      </form>

      <style>{`
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          margin-bottom: 4rem;
        }

        .section-title {
          font-family: var(--font-primary);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .section-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .helper-text {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: -0.25rem;
        }

        .file-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 0.25rem;
        }

        .file-input-hidden {
          display: none;
        }

        .preview-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-preview {
          height: 50px;
          object-fit: contain;
          border: 1px solid var(--border-color);
          padding: 4px;
          background: #fff;
        }

        .qr-preview {
          height: 100px;
          width: 100px;
          object-fit: contain;
          border: 1px solid var(--border-color);
          padding: 4px;
          background: #fff;
        }

        .btn-delete-img {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .supabase-actions-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .status-msg {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-msg.testing {
          color: var(--text-muted);
        }

        .status-msg.success {
          color: #15803D;
        }

        .status-msg.error {
          color: #B91C1C;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .backup-actions {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .restore-wrapper {
          position: relative;
        }

        .form-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
        }

        .save-status-msg.success {
          color: #15803D;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
