import { createClient } from '@supabase/supabase-js';
import { generateUUID } from '../utils/uuid.js';

// Keys for localStorage fallback
const STORAGE_KEYS = {
  SETTINGS: '31lab_settings',
  INVOICES: '31lab_invoices',
  CLIENTS: '31lab_clients',
  LEDGER: '31lab_ledger'
};

// Global Supabase client instance (initialized dynamically)
let supabaseInstance = null;

// Initialize Supabase if credentials exist in localStorage or environment variables
export const getSupabaseClient = () => {
  const url = localStorage.getItem('supabase_url') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined);
  const key = localStorage.getItem('supabase_anon_key') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined);
  
  if (url && key) {
    if (supabaseInstance && supabaseInstance.supabaseUrl === url) {
      return supabaseInstance;
    }
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    }
  }
  
  supabaseInstance = null;
  return null;
};

// Check if we are currently using Supabase cloud mode
export const isCloudMode = () => {
  return getSupabaseClient() !== null;
};

// Default Settings
const DEFAULT_SETTINGS = {
  company_name: 'THIRTYONE LAB',
  company_address: '26A, Jalan 1, Jalan Sungai Jelok, Taman Bukit Cantik, 43000 Kajang, Selangor',
  company_phone: 'Tel: +60 11-2561 4436',
  company_logo: '/Logo Header.webp', // Loads from public/
  invoice_prefix: 'NO.',
  bank_name: 'Bank Islam',
  bank_account: '0502 1020 4490 03 (Hidayatul Rizman bin Rafiuddarajat)',
  qr_code: '', // Base64
  terms: 'The ordered goods will be processed within **two weeks** after we receive a **50% deposit (or half payment).**\nGoods sold are **neither returnable nor refundable.** Otherwise, a **20% cancellation fee** on the total purchase price will be imposed.'
};

// --- SETTINGS SERVICE ---
export const getSettings = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Row doesn't exist, create default
          await saveSettings(DEFAULT_SETTINGS);
          return DEFAULT_SETTINGS;
        }
        throw error;
      }
      return data;
    } catch (e) {
      console.error('Error fetching settings from Supabase, falling back:', e);
    }
  }
  
  // LocalStorage Fallback
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('settings')
        .upsert({ id: 'global', ...settings });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error saving settings to Supabase:', e);
    }
  }
  
  // LocalStorage Fallback
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return true;
};

// --- CLIENTS SERVICE ---
export const getClients = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error fetching clients from Supabase:', e);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveClient = async (clientData) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('clients')
        .upsert(clientData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error saving client to Supabase:', e);
    }
  }

  // LocalStorage Fallback
  const clients = await getClients();
  let updatedClient = { ...clientData };
  
  if (clientData.id) {
    const index = clients.findIndex(c => c.id === clientData.id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...clientData, updated_at: new Date().toISOString() };
      updatedClient = clients[index];
    }
  } else {
    updatedClient.id = generateUUID();
    updatedClient.created_at = new Date().toISOString();
    updatedClient.orders_count = updatedClient.orders_count || 0;
    updatedClient.total_spent = updatedClient.total_spent || 0;
    clients.push(updatedClient);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  return updatedClient;
};

export const deleteClient = async (id) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting client from Supabase:', e);
    }
  }

  // LocalStorage Fallback
  const clients = await getClients();
  const filtered = clients.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
  return true;
};

// --- INVOICES SERVICE ---
export const getInvoices = async () => {
  const client = getSupabaseClient();
  let invoicesList = [];
  if (client) {
    try {
      const { data, error } = await client
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      invoicesList = data || [];
    } catch (e) {
      console.error('Error fetching invoices from Supabase:', e);
      const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
      invoicesList = stored ? JSON.parse(stored) : [];
    }
  } else {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
    invoicesList = stored ? JSON.parse(stored) : [];
  }

  return invoicesList.map(invoice => {
    let discount_type = invoice.discount_type;
    let discount_value = invoice.discount_value;
    let client_address = invoice.client_address;
    let pengeluaran = invoice.pengeluaran;
    let order_status = invoice.order_status;
    let cleanNotes = invoice.notes || '';
    if (invoice.notes && invoice.notes.includes('__METADATA__:')) {
      const parts = invoice.notes.split('__METADATA__:');
      cleanNotes = parts[0].trim();
      try {
        const meta = JSON.parse(parts[1]);
        discount_type = meta.discount_type;
        discount_value = meta.discount_value;
        client_address = meta.client_address;
        if (meta.pengeluaran !== undefined) pengeluaran = meta.pengeluaran;
        if (!order_status) {
            if (meta.order_status !== undefined) order_status = meta.order_status;
        }
      } catch (e) {}
    }

    if (order_status === 'NOT_SUBMITTED' || !order_status) {
      order_status = 'BELUM_DRAFT';
    }

    return {
      ...invoice,
      notes: cleanNotes,
      discount_type: discount_type !== undefined ? discount_type : (parseFloat(invoice.discount_per_pcs || 0) > 0 ? 'per_pcs' : 'bulk'),
      discount_value: discount_value !== undefined ? discount_value : (parseFloat(invoice.discount_per_pcs || 0) || 0),
      client_address: client_address || '',
      pengeluaran: pengeluaran !== undefined ? (parseFloat(pengeluaran) || 0) : 0,
      order_status: order_status
    };
  });
};

// Generates next sequential invoice number based on prefix
export const getNextInvoiceNo = async () => {
  const settings = await getSettings();
  const prefix = settings.invoice_prefix || 'NO.';
  const invoices = await getInvoices();

  // Test if prefix has numbers at the end, e.g. "NO.00164" -> prefix text "NO.", start number 164, padding 5
  const match = prefix.match(/^(.*?)([0-9]+)$/);
  
  if (match) {
    const textPrefix = match[1];
    const numStr = match[2];
    const startNum = parseInt(numStr, 10);
    const padding = numStr.length;

    if (invoices.length === 0) {
      return prefix; // If no invoices exist, return the exact prefix (which acts as the start number)
    }

    // Find highest number with matching textPrefix
    let maxNum = startNum - 1; // Start counting from just below the specified start number
    invoices.forEach(inv => {
      if (inv.invoice_no && inv.invoice_no.startsWith(textPrefix)) {
        const afterPrefix = inv.invoice_no.substring(textPrefix.length);
        const numMatch = afterPrefix.match(/^([0-9]+)/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(padding, '0');
    return `${textPrefix}${paddedNum}`;
  } else {
    // Standard prefix without trailing numbers (e.g. "NO.")
    if (invoices.length === 0) {
      return `${prefix}00001`;
    }

    let maxNum = 0;
    invoices.forEach(inv => {
      if (inv.invoice_no && inv.invoice_no.startsWith(prefix)) {
        const numStr = inv.invoice_no.substring(prefix.length);
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(5, '0');
    return `${prefix}${paddedNum}`;
  }
};

export const saveInvoice = async (invoiceData) => {
  const client = getSupabaseClient();
  
  // 1. CRM Integration: Find or create client first, and update metrics
  let customerId = invoiceData.client_id;
  let clientsList = await getClients();
  let existingClient = clientsList.find(c => c.id === customerId || (c.name && invoiceData.client_name && c.name.toLowerCase() === invoiceData.client_name.toLowerCase() && c.phone === invoiceData.client_phone));
  
  let savedClientObj = null;
  if (existingClient) {
    customerId = existingClient.id;
    // We will recalculate spent and orders when saving
    savedClientObj = existingClient;
  } else {
    // Create new client
    const newClient = {
      name: invoiceData.client_name,
      phone: invoiceData.client_phone,
      orders_count: 0,
      total_spent: 0
    };
    savedClientObj = await saveClient(newClient);
    customerId = savedClientObj.id;
  }

  const finalInvoiceData = {
    ...invoiceData,
    client_id: customerId,
    updated_at: new Date().toISOString()
  };

  if (!finalInvoiceData.id) {
    finalInvoiceData.id = client ? undefined : generateUUID(); // Supabase will auto-gen UUID if undefined
    finalInvoiceData.created_at = new Date().toISOString();
  }

  let savedInvoiceObj = null;

  if (client) {
    try {
      const metadata = {
        discount_type: finalInvoiceData.discount_type,
        discount_value: finalInvoiceData.discount_value,
        client_address: finalInvoiceData.client_address,
        pengeluaran: finalInvoiceData.pengeluaran,
        discount_per_pcs: finalInvoiceData.discount_per_pcs
      };
      const dbInvoiceData = {
        ...finalInvoiceData,
        notes: (finalInvoiceData.notes || '') + `\n\n__METADATA__:${JSON.stringify(metadata)}`
      };
      delete dbInvoiceData.discount_type;
      delete dbInvoiceData.discount_value;
      delete dbInvoiceData.client_address;
      delete dbInvoiceData.pengeluaran;
      delete dbInvoiceData.discount_per_pcs;

      const { data, error } = await client
        .from('invoices')
        .upsert(dbInvoiceData)
        .select()
        .single();
      if (error) throw error;
      savedInvoiceObj = data;
    } catch (e) {
      console.error('Error saving invoice to Supabase:', e);
    }
  }

  if (!savedInvoiceObj) {
    // LocalStorage Fallback
    const invoices = await getInvoices();
    if (invoiceData.id) {
      const index = invoices.findIndex(i => i.id === invoiceData.id);
      if (index !== -1) {
        invoices[index] = finalInvoiceData;
      } else {
        invoices.push(finalInvoiceData);
      }
    } else {
      finalInvoiceData.id = generateUUID();
      invoices.push(finalInvoiceData);
    }
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    savedInvoiceObj = finalInvoiceData;
  }

  // 2. Recalculate client statistics (orders count & spent) based on all invoices
  const allInvoices = await getInvoices();
  const clientInvoices = allInvoices.filter(inv => inv.client_id === customerId);
  
  const orders_count = clientInvoices.length;
  // total spent is sum of paid + deposit amount (since deposit is already spent, or we can use grand_total if they committed. The PRD says spent is total RM amount spent at store, which is the sum of grand_total of all their invoices)
  const total_spent = clientInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);

  await saveClient({
    ...savedClientObj,
    orders_count,
    total_spent
  });

  return savedInvoiceObj;
};

export const deleteInvoice = async (id) => {
  const client = getSupabaseClient();
  const invoices = await getInvoices();
  const invoiceToDelete = invoices.find(inv => inv.id === id);
  const customerId = invoiceToDelete ? invoiceToDelete.client_id : null;

  if (client) {
    try {
      const { error } = await client
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting invoice from Supabase:', e);
    }
  } else {
    // LocalStorage Fallback
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
  }

  // Recalculate client statistics if client exists
  if (customerId) {
    const clientsList = await getClients();
    const clientObj = clientsList.find(c => c.id === customerId);
    if (clientObj) {
      const allInvoices = await getInvoices();
      const clientInvoices = allInvoices.filter(inv => inv.client_id === customerId);
      const orders_count = clientInvoices.length;
      const total_spent = clientInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
      
      await saveClient({
        ...clientObj,
        orders_count,
        total_spent
      });
    }
  }

  return true;
};

export const updateInvoicePayment = async (id, depositAmount, status, pengeluaranVal) => {
  const invoices = await getInvoices();
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return false;

  const deposit = parseFloat(depositAmount);
  const grand_total = parseFloat(invoice.grand_total);
  const balance = grand_total - deposit;

  const updatedInvoice = {
    ...invoice,
    deposit,
    balance,
    status,
    pengeluaran: pengeluaranVal !== undefined ? (parseFloat(pengeluaranVal) || 0) : invoice.pengeluaran,
    updated_at: new Date().toISOString()
  };

  const saved = await saveInvoice(updatedInvoice);
  return saved !== null;
};

export const updateManufacturingStatus = async (id, order_status, pengeluaranVal) => {
  const invoices = await getInvoices();
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return false;

  const updatedInvoice = {
    ...invoice,
    order_status,
    pengeluaran: parseFloat(pengeluaranVal) || 0,
    updated_at: new Date().toISOString()
  };

  const saved = await saveInvoice(updatedInvoice);
  return saved !== null;
};

// --- LEDGER SERVICE ---
export const getLedger = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('ledger')
        .select('*')
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching ledger from Supabase:', e);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
  return stored ? JSON.parse(stored) : [];
};

export const saveLedgerEntry = async (entryData) => {
  const client = getSupabaseClient();
  let finalEntry = { ...entryData, updated_at: new Date().toISOString() };
  
  if (!finalEntry.id) {
    finalEntry.id = client ? undefined : generateUUID(); // Supabase will auto-gen UUID
    finalEntry.recorded_at = finalEntry.recorded_at || new Date().toISOString();
  }
  
  let savedEntry = null;
  
  if (client) {
    try {
      const { data, error } = await client
        .from('ledger')
        .upsert(finalEntry)
        .select()
        .single();
      if (error) throw error;
      savedEntry = data;
    } catch (e) {
      console.error('Error saving ledger entry to Supabase:', e);
    }
  }
  
  if (!savedEntry) {
    // LocalStorage Fallback
    const ledger = await getLedger();
    if (!finalEntry.id) {
      finalEntry.id = generateUUID();
      finalEntry.recorded_at = finalEntry.recorded_at || new Date().toISOString();
    }
    const index = ledger.findIndex(l => l.id === finalEntry.id);
    if (index !== -1) {
      ledger[index] = finalEntry;
    } else {
      ledger.push(finalEntry);
    }
    
    // Sort by date descending
    ledger.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
    savedEntry = finalEntry;
  }
  
  return savedEntry;
};

export const deleteLedgerEntry = async (id) => {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { error } = await client
        .from('ledger')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting ledger entry from Supabase:', e);
    }
  } else {
    // LocalStorage Fallback
    const ledger = await getLedger();
    const filtered = ledger.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(filtered));
  }
  return true;
};

