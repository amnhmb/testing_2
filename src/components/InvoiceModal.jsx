import React, { useState, useEffect } from 'react';
import { getClients, saveInvoice, getNextInvoiceNo, getInvoices } from '../services/storage';
import { X, Plus, Trash2, Upload, AlertTriangle, Save, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SIZES, ADULT_SIZES, KID_SIZES, getBasePrice, getSizeCost } from '../data/sizePricing';
import { generateUUID } from '../utils/uuid.js';
import { MATERIALS, CUTTINGS, NECKS, RIBS } from '../data/constants.js';
export { getBasePrice, getSizeCost, MATERIALS, CUTTINGS, NECKS, RIBS };

const ADULT_PANTS_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const getSelectedSizesSummary = (item) => {
  const summaryParts = [];
  SIZES.forEach(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    const pQty = parseInt(item.sizes[s]?.pants || 0);
    if (sQty > 0 || lQty > 0 || pQty > 0) {
      const parts = [];
      if (sQty > 0) parts.push(`${sQty} Short`);
      if (lQty > 0) parts.push(`${lQty} Long`);
      if (pQty > 0) parts.push(`${pQty} Pants`);
      summaryParts.push(`${s} (${parts.join(', ')})`);
    }
  });
  return summaryParts.length > 0 ? summaryParts.join(' | ') : 'Tiada saiz terpilih';
};

const getSelectedSizesPills = (item) => {
  const pills = [];
  SIZES.forEach(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    const pQty = parseInt(item.sizes[s]?.pants || 0);
    if (sQty > 0 || lQty > 0 || pQty > 0) {
      const details = [];
      if (sQty > 0) details.push(`${sQty}S`);
      if (lQty > 0) details.push(`${lQty}L`);
      if (pQty > 0) details.push(`${pQty}P`);
      pills.push(
        <span 
          key={s} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ color: 'var(--primary-red)', marginRight: '0.25rem' }}>{s}</span>: {details.join(', ')}
        </span>
      );
    }
  });
  return pills.length > 0 ? pills : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Tiada saiz terpilih</span>;
};

const hasSelectedAdultSizes = (item) => {
  return ADULT_SIZES.some(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    return sQty > 0 || lQty > 0;
  });
};

const hasSelectedKidSizes = (item) => {
  return KID_SIZES.some(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    return sQty > 0 || lQty > 0;
  });
};

const getSelectedAdultSizesPills = (item) => {
  const pills = [];
  ADULT_SIZES.forEach(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    if (sQty > 0 || lQty > 0) {
      const details = [];
      if (sQty > 0) details.push(`${sQty}S`);
      if (lQty > 0) details.push(`${lQty}L`);
      pills.push(
        <span 
          key={s} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ color: 'var(--primary-red)', marginRight: '0.25rem' }}>{s}</span>: {details.join(', ')}
        </span>
      );
    }
  });
  return pills.length > 0 ? (
    <div className="collapsed-subsize-summary" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
      {pills}
    </div>
  ) : null;
};

const getSelectedKidSizesPills = (item) => {
  const pills = [];
  KID_SIZES.forEach(s => {
    const sQty = parseInt(item.sizes[s]?.short || 0);
    const lQty = parseInt(item.sizes[s]?.long || 0);
    if (sQty > 0 || lQty > 0) {
      const details = [];
      if (sQty > 0) details.push(`${sQty}S`);
      if (lQty > 0) details.push(`${lQty}L`);
      pills.push(
        <span 
          key={s} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ color: '#15803D', marginRight: '0.25rem' }}>{s}</span>: {details.join(', ')}
        </span>
      );
    }
  });
  return pills.length > 0 ? (
    <div className="collapsed-subsize-summary" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
      {pills}
    </div>
  ) : null;
};

const hasSelectedAdultPants = (item) => {
  return ADULT_PANTS_SIZES.some(s => parseInt(item.sizes[s]?.pants || 0) > 0);
};

const hasSelectedKidPants = (item) => {
  return KID_SIZES.some(s => parseInt(item.sizes[s]?.pants || 0) > 0);
};

const getSelectedAdultPantsPills = (item) => {
  const pills = [];
  ADULT_PANTS_SIZES.forEach(s => {
    const pQty = parseInt(item.sizes[s]?.pants || 0);
    if (pQty > 0) {
      pills.push(
        <span 
          key={s} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ color: '#CA8A04', marginRight: '0.25rem' }}>{s}</span>: {pQty}P
        </span>
      );
    }
  });
  return pills.length > 0 ? (
    <div className="collapsed-subsize-summary" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
      {pills}
    </div>
  ) : null;
};

const getSelectedKidPantsPills = (item) => {
  const pills = [];
  KID_SIZES.forEach(s => {
    const pQty = parseInt(item.sizes[s]?.pants || 0);
    if (pQty > 0) {
      pills.push(
        <span 
          key={s} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ color: '#0369A1', marginRight: '0.25rem' }}>{s}</span>: {pQty}P
        </span>
      );
    }
  });
  return pills.length > 0 ? (
    <div className="collapsed-subsize-summary" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
      {pills}
    </div>
  ) : null;
};

const getDynamicOptionLabel = (id, originalLabel, isAddonChecked, isRepeatActive) => {
  if (isRepeatActive && !isAddonChecked) {
    const match = originalLabel.match(/^(.*?)\s\(\+RM\d+\)$/);
    if (match) {
      return `${match[1]} (+RM0)`;
    }
    return `${id} (+RM0)`;
  }
  return originalLabel;
};


const createEmptyItem = () => ({
  id: generateUUID(),
  design_name: '',
  design_image: '',
  print_method: 'Sublimation',
  baju_source: '',
  dtf_price: '',
  dtf_qty: '',
  material: 'Eyelet',
  cutting: 'Normal',
  neck: 'Roundneck',
  rib: 'Tiada',
  name_set: 'No', // 'Yes' or 'No'
  own_brand: 'No', // 'Yes' or 'No'
  material_addon: false,
  cutting_addon: false,
  neck_addon: false,
  rib_addon: false,
  long_sleeve_addon: false,
  name_set_addon: false,
  own_brand_addon: false,
  custom_adult_pants_price: '',
  custom_kid_pants_price: '',
  // Size Breakdown: sizeName -> { shortQty: 0, longQty: 0, pants: 0 }
  sizes: SIZES.reduce((acc, size) => {
    acc[size] = { short: 0, long: 0, pants: 0 };
    return acc;
  }, {})
});

const createEmptyBannerItem = () => ({
  id: generateUUID(),
  item_type: 'banner',
  design_name: '',
  design_image: '',
  price: '',
  qty: ''
});

export default function InvoiceModal({ invoice, prefilledClient, onClose, onSaveSuccess }) {
  const { tr } = useLanguage();
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Form Fields
  const [invoiceNo, setInvoiceNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [jobName, setJobName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([createEmptyItem()]);
  const [bannerItems, setBannerItems] = useState([]);
  const [activeTab, setActiveTab] = useState('baju');
  const [discountType, setDiscountType] = useState('per_pcs');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [isRepeatOrder, setIsRepeatOrder] = useState(false);
  const [customBasePrice, setCustomBasePrice] = useState('');
  const [repeatOrderPrices, setRepeatOrderPrices] = useState(null);
  const [pengeluaran, setPengeluaran] = useState('');
  const [status, setStatus] = useState('Unpaid');
  const [deposit, setDeposit] = useState(0);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [collapsedSizes, setCollapsedSizes] = useState({});
  const [collapsedAdults, setCollapsedAdults] = useState({});
  const [collapsedKids, setCollapsedKids] = useState({});
  const [collapsedAdultPants, setCollapsedAdultPants] = useState({});
  const [collapsedKidPants, setCollapsedKidPants] = useState({});
  const [isDiscountCollapsed, setIsDiscountCollapsed] = useState(true);
  const [collapsedDesigns, setCollapsedDesigns] = useState({});

  const addBannerItem = () => {
    setBannerItems(prev => [...prev, createEmptyBannerItem()]);
  };

  const removeBannerItem = (id) => {
    setBannerItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBannerItemField = (itemId, field, value) => {
    setBannerItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleBannerImageUpload = (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      alert('Had saiz fail imej design adalah 300KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateBannerItemField(itemId, 'design_image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleDesignCollapse = (itemId) => {
    setCollapsedDesigns(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
  };

  const toggleSizesCollapse = (itemId) => {
    setCollapsedSizes(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleAdultSizesCollapse = (itemId) => {
    setCollapsedAdults(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
  };

  const toggleKidSizesCollapse = (itemId) => {
    setCollapsedKids(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
  };

  const toggleAdultPantsCollapse = (itemId) => {
    setCollapsedAdultPants(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
  };

  const toggleKidPantsCollapse = (itemId) => {
    setCollapsedKidPants(prev => ({
      ...prev,
      [itemId]: prev[itemId] === false ? true : false
    }));
  };

  useEffect(() => {
    loadClients();
    initForm();
  }, [invoice, prefilledClient]);

  const loadClients = async () => {
    const list = await getClients();
    setClients(list);
  };

  const initForm = async () => {
    if (invoice) {
      setInvoiceNo(invoice.invoice_no);
      setClientName(invoice.client_name);
      setClientPhone(formatPhoneNumber(invoice.client_phone));
      setClientId(invoice.client_id || '');
      setJobName(invoice.job_name || '');
      setDate(invoice.date);
      
      const allItems = JSON.parse(JSON.stringify(invoice.items || []));
      const bajuList = allItems.filter(item => item.item_type !== 'banner');
      const bannerList = allItems.filter(item => item.item_type === 'banner');
      setItems(bajuList.length > 0 ? bajuList : [createEmptyItem()]);
      setBannerItems(bannerList);
      setActiveTab(bajuList.length === 0 && bannerList.length > 0 ? 'banner' : 'baju');

      setDiscountType(invoice.discount_type || 'per_pcs');
      setDiscountValue(invoice.discount_value !== undefined ? invoice.discount_value : (invoice.discount_per_pcs || 0));
      setNotes(invoice.notes || '');
      setClientAddress(invoice.client_address || '');
      setPengeluaran(invoice.pengeluaran !== undefined ? invoice.pengeluaran.toString() : '');
      setStatus(invoice.status || 'Unpaid');
      setDeposit(invoice.deposit !== undefined ? invoice.deposit : 0);

      const firstItem = invoice.items[0];
      if (firstItem && firstItem.is_repeat_order) {
        setIsRepeatOrder(true);
        setCustomBasePrice(firstItem.custom_base_price !== undefined ? firstItem.custom_base_price : '');
      } else {
        setIsRepeatOrder(false);
        setCustomBasePrice('');
      }
    } else {
      setIsRepeatOrder(false);
      setCustomBasePrice('');
      setPengeluaran('');
      setStatus('Unpaid');
      setDeposit(0);
      const nextNo = await getNextInvoiceNo();
      setInvoiceNo(nextNo);
      setItems([]);
      setBannerItems([]);
      setActiveTab('baju');
      
      if (prefilledClient) {
        setClientName(prefilledClient.name);
        setClientPhone(prefilledClient.phone);
        setClientId(prefilledClient.id);
        setClientAddress('');
        checkPreviousOrderBasePrice(prefilledClient.id, prefilledClient.phone);
      }
    }
  };

  const checkPreviousOrderBasePrice = async (cId, cPhone) => {
    setRepeatOrderPrices(null);
    let hasClientHistory = false;
    try {
      const allInvoices = await getInvoices();
      const clientInvoices = allInvoices.filter(inv => 
        (cId && inv.client_id === cId) || 
        (cPhone && inv.client_phone === cPhone)
      );
      if (clientInvoices.length > 0) {
        hasClientHistory = true;
        const latestInvoice = clientInvoices[0];
        if (latestInvoice.client_address) {
          setClientAddress(latestInvoice.client_address);
        }

        // --- Collect Shirt (Baju) & Banner Prices from latest invoice ---
        let bajuPrice = null;
        let bannerPrice = null;

        if (latestInvoice.items && Array.isArray(latestInvoice.items)) {
          latestInvoice.items.forEach(item => {
            if (item.item_type === 'banner') {
              if (bannerPrice === null && parseFloat(item.price) > 0) {
                bannerPrice = parseFloat(item.price);
              }
            } else {
              if (bajuPrice === null && parseFloat(item.price) > 0) {
                bajuPrice = parseFloat(item.price);
              }
            }
          });
        }

        // Fallback: if no explicit baju price stored, derive from base price
        const firstBajuItem = latestInvoice.items.find(i => i.item_type !== 'banner');
        if (firstBajuItem) {
          let prevBase = 0;
          if (firstBajuItem.is_repeat_order && firstBajuItem.custom_base_price) {
            prevBase = firstBajuItem.custom_base_price;
          } else {
            const invoiceTotalQty = latestInvoice.items.reduce((total, item) => {
              if (item.item_type === 'banner') return total;
              return total + SIZES.reduce((itemTotal, size) => {
                const sQty = parseInt(item.sizes?.[size]?.short || 0, 10);
                const lQty = parseInt(item.sizes?.[size]?.long || 0, 10);
                return itemTotal + sQty + lQty;
              }, 0);
            }, 0);
            prevBase = getBasePrice(invoiceTotalQty);
          }
          if (prevBase > 0) {
            setIsRepeatOrder(true);
            setCustomBasePrice(prevBase);
            if (bajuPrice === null) bajuPrice = prevBase;
          }
        }

        // Only show the info box when there is at least one known price
        if (bajuPrice !== null || bannerPrice !== null) {
          setRepeatOrderPrices({ bajuPrice, bannerPrice });
        }
      }
    } catch (e) {
      console.error('Error fetching client last invoice base price:', e);
    }
    if (!hasClientHistory && repeatOrderPrices === null) {
      setIsRepeatOrder(false);
      setCustomBasePrice('');
    }
  };

  // Autocomplete / Search Client
  const handleClientNameChange = (e) => {
    const val = e.target.value;
    setClientName(val);
    setClientId(''); // Clear ID if typing custom
    setShowClientSuggestions(true);
  };

  const selectClient = (c) => {
    setClientName(c.name);
    setClientPhone(c.phone);
    setClientId(c.id);
    setShowClientSuggestions(false);
    checkPreviousOrderBasePrice(c.id, c.phone);
  };

  const formatPhoneNumber = (value) => {
    if (!value) return '';

    // Strip non-digits
    let digits = ('' + value).replace(/\D/g, '');

    // Strip leading country code 60 if present
    if (digits.startsWith('60') && digits.length >= 11) {
      digits = digits.substring(2);
    }

    // Strip leading 0 if present (e.g., 01125507190 -> 1125507190)
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    // 11-digit Malaysian number (e.g. 011-2550 7190 -> 10 digits after removing '0': 1125507190)
    if (digits.length === 10) {
      const match = digits.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) {
        return `+60 ${match[1]}-${match[2]} ${match[3]}`;
      }
    }
    // 10-digit Malaysian number (e.g. 012-345 6789 -> 9 digits after removing '0': 123456789)
    else if (digits.length === 9) {
      const match = digits.match(/^(\d{2})(\d{3})(\d{4})$/);
      if (match) {
        return `+60 ${match[1]}-${match[2]} ${match[3]}`;
      }
    }

    return value;
  };

  const handlePhoneChange = (e) => {
    setClientPhone(e.target.value);
  };

  const handlePhoneBlur = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setClientPhone(formatted);
  };

  // Items Management
  const addItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItemField = (itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'print_method' && value === 'DTF') {
          updatedItem.baju_source = '';
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const updateItemQty = (itemId, size, type, val) => {
    const intVal = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSizes = { ...item.sizes };
        updatedSizes[size] = {
          ...updatedSizes[size],
          [type]: intVal
        };
        return { ...item, sizes: updatedSizes };
      }
      return item;
    }));
  };

  // Helper: display 0 as empty string so placeholder "0" shows instead of actual 0
  const displayQty = (val) => {
    const n = parseInt(val, 10);
    return (isNaN(n) || n === 0) ? '' : String(n);
  };

  const handleItemImageUpload = (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      alert('Had saiz fail imej design adalah 300KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateItemField(itemId, 'design_image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- CALCULATION ENGINE ---
  // Total shirt qty only (short + long), used for base price tier
  const calculateTotalQty = () => {
    return items.reduce((total, item) => {
      return total + SIZES.reduce((itemTotal, size) => {
        let sQty = parseInt(item.sizes[size]?.short || 0, 10);
        if (item.cutting === 'Muslimah') sQty = 0;
        const lQty = parseInt(item.sizes[size]?.long || 0, 10);
        return itemTotal + sQty + lQty;
      }, 0);
    }, 0);
  };

  const totalQty = calculateTotalQty();
  const basePrice = isRepeatOrder && customBasePrice !== '' 
    ? parseFloat(customBasePrice) || 0 
    : getBasePrice(totalQty);

  // 2. Calculations per Design Item
  const calculateItemSummary = (item) => {
    if (item.item_type === 'banner' || (item.print_method === 'DTF' && item.baju_source === 'customer')) {
      const qty = parseInt(item.item_type === 'banner' ? (item.qty || 0) : (item.dtf_qty || 0), 10);
      const price = parseFloat(item.item_type === 'banner' ? (item.price || 0) : (item.dtf_price || 0));
      const subtotal = qty * price;
      return {
        qty,
        adultShirtQty: 0,
        kidShirtQty: 0,
        adultPantsQty: 0,
        kidPantsQty: 0,
        base: subtotal,
        addons: 0,
        subtotal: subtotal
      };
    }

    let itemBaseTotal = 0;
    let itemAddonTotal = 0;
    let itemQty = 0;

    let adultShirtQty = 0;
    let kidShirtQty = 0;
    let adultPantsQty = 0;
    let kidPantsQty = 0;

    const materialPrice = (isRepeatOrder && !item.material_addon) ? 0 : (MATERIALS.find(m => m.id === item.material)?.price || 0);
    const cuttingPrice = (isRepeatOrder && !item.cutting_addon) ? 0 : (CUTTINGS.find(c => c.id === item.cutting)?.price || 0);
    const neckPrice = (isRepeatOrder && !item.neck_addon) ? 0 : (NECKS.find(n => n.id === item.neck)?.price || 0);
    const ribPrice = (isRepeatOrder && !item.rib_addon) ? 0 : (RIBS.find(r => r.id === item.rib)?.price || 0);
    const nameSetPrice = item.name_set === 'Yes' ? ((isRepeatOrder && !item.name_set_addon) ? 0 : 3) : 0;
    const ownBrandPrice = item.own_brand === 'Yes' ? ((isRepeatOrder && !item.own_brand_addon) ? 0 : 1.5) : 0;
    const designWideAddons = materialPrice + cuttingPrice + neckPrice + ribPrice + nameSetPrice + ownBrandPrice; // Apply to every piece

    SIZES.forEach(size => {
      let shortQty = parseInt(item.sizes[size]?.short || 0, 10);
      if (item.cutting === 'Muslimah') shortQty = 0;
      const longQty = parseInt(item.sizes[size]?.long || 0, 10);
      const pantsQty = parseInt(item.sizes[size]?.pants || 0, 10);
      const subQty = shortQty + longQty;

      if (subQty > 0) {
        itemQty += subQty;
        if (ADULT_SIZES.includes(size)) adultShirtQty += subQty;
        else if (KID_SIZES.includes(size)) kidShirtQty += subQty;

        // Base Price part
        itemBaseTotal += subQty * basePrice;
        
        // Design-wide addons (Cutting, Neck, Nameset)
        itemAddonTotal += subQty * designWideAddons;

        // Size specific addon (XS-2XL = 0, 3XL-5XL = +3, etc)
        const sizeAddon = getSizeCost(size);
        itemAddonTotal += subQty * sizeAddon;

        // Sleeve specific addon (+RM5 for Long Sleeve)
        let lsPrice = (isRepeatOrder && !item.long_sleeve_addon) ? 0 : 5;
        if (item.cutting === 'Muslimah') {
          lsPrice = 0;
        }
        itemAddonTotal += longQty * lsPrice;
      }

      // Pants pricing (Flat rate)
      if (pantsQty > 0) {
        itemQty += pantsQty;
        
        let adultPrice = 25;
        let kidPrice = 23;
        
        if (isRepeatOrder && item.custom_adult_pants_price && !isNaN(parseFloat(item.custom_adult_pants_price))) {
          adultPrice = parseFloat(item.custom_adult_pants_price);
        }
        if (isRepeatOrder && item.custom_kid_pants_price && !isNaN(parseFloat(item.custom_kid_pants_price))) {
          kidPrice = parseFloat(item.custom_kid_pants_price);
        }

        if (ADULT_SIZES.includes(size)) {
          adultPantsQty += pantsQty;
          itemAddonTotal += pantsQty * adultPrice;
        } else if (KID_SIZES.includes(size)) {
          kidPantsQty += pantsQty;
          itemAddonTotal += pantsQty * kidPrice;
        }
      }
    });

    const subtotal = itemBaseTotal + itemAddonTotal;

    return {
      qty: itemQty,
      adultShirtQty,
      kidShirtQty,
      adultPantsQty,
      kidPantsQty,
      base: itemBaseTotal,
      addons: itemAddonTotal,
      subtotal: subtotal
    };
  };

  // 3. Overall Invoice Summaries
  const grossSubtotal = [
    ...items,
    ...bannerItems
  ].reduce((sum, item) => sum + calculateItemSummary(item).subtotal, 0);

  const totalDiscount = discountType === 'bulk' ? (parseFloat(discountValue) || 0) : ((parseFloat(discountValue) || 0) * totalQty);
  const grandTotal = Math.max(0, grossSubtotal - totalDiscount);

  // Clamp deposit to grandTotal and auto-derive status, mirroring PaymentModal's logic,
  // so an invoice can't be saved with a negative balance or a status that contradicts its deposit.
  const handleDepositChange = (value) => {
    const val = Math.max(0, parseFloat(value) || 0);
    const clamped = Math.min(val, grandTotal);
    setDeposit(clamped);

    if (status !== 'Void') {
      if (clamped === 0) setStatus('Unpaid');
      else if (clamped >= grandTotal) setStatus('Paid');
      else setStatus('Deposit');
    }
  };

  const handleSave = async (e) => {
    if (!clientName.trim()) {
      alert('Sila masukkan nama pelanggan.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Sila masukkan nombor telefon pelanggan.');
      return;
    }
    // Check if there's at least 1 item (shirt, pants or banner)
    const totalAllQty = [
      ...items,
      ...bannerItems
    ].reduce((sum, item) => sum + calculateItemSummary(item).qty, 0);
    if (totalAllQty === 0) {
      alert('Sila masukkan kuantiti baju / seluar / banner (sekurang-kurangnya 1 helai/pcs).');
      return;
    }
    // Every banner item must have a valid qty and price to avoid grand_total becoming NaN
    const invalidBanner = bannerItems.find(item => {
      const qty = parseInt(item.qty, 10);
      const price = parseFloat(item.price);
      return isNaN(qty) || qty <= 0 || isNaN(price) || price < 0;
    });
    if (invalidBanner) {
      alert('Sila lengkapkan kuantiti & harga untuk setiap item banner sebelum simpan.');
      return;
    }

    setLoading(true);
    
    const processedBajuItems = items.map(item => {
      const summary = calculateItemSummary(item);
      return {
        ...item,
        subtotal: summary.subtotal,
        qty: summary.qty,
        is_repeat_order: isRepeatOrder,
        custom_base_price: isRepeatOrder ? parseFloat(customBasePrice) || 0 : undefined
      };
    });

    const processedBannerItems = bannerItems.map(item => {
      const summary = calculateItemSummary(item);
      return {
        ...item,
        subtotal: summary.subtotal,
        qty: summary.qty
      };
    });

    // Construct database invoice object
    const finalInvoice = {
      id: invoice?.id || undefined,
      invoice_no: invoiceNo,
      client_id: clientId || null,
      client_name: clientName.trim(),
      client_phone: formatPhoneNumber(clientPhone).trim(),
      client_address: clientAddress.trim(),
      job_name: jobName.trim(),
      date: date,
      items: [...processedBajuItems, ...processedBannerItems],
      subtotal: grossSubtotal,
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      discount_per_pcs: discountType === 'per_pcs' ? (parseFloat(discountValue) || 0) : 0,
      grand_total: grandTotal,
      deposit: parseFloat(deposit) || 0,
      balance: grandTotal - (parseFloat(deposit) || 0),
      status: status,
      notes: notes.trim(),
      pengeluaran: parseFloat(pengeluaran) || 0
    };

    try {
      await saveInvoice(finalInvoice);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      alert('Ralat semasa menyimpan invoice: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h3>{invoice ? 'KEMASKINI INVOICE' : 'CIPTA INVOICE BAHARU'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form>
          <div className="modal-body form-modal-body">
            
            {/* Row 1: Basic Details & Payment Info */}
            <div className="invoice-meta-section">
              <h4 className="meta-section-title">A. MAKLUMAT ASAS TEMPAHAN</h4>
              
              <div className="meta-layout-container" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: '1.5rem' }}>
                
                {/* Left side: Client Inputs (2/3 width on desktop) */}
                <div className="meta-left-inputs" style={{ flex: '2', minWidth: '320px' }}>
                  <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem 1rem' }}>
                    
                    {/* Client Name Input with Autocomplete */}
                    <div className="form-group autocomplete-container" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Nama Pelanggan *</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={handleClientNameChange}
                        onFocus={() => setShowClientSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                        placeholder="Taip nama..."
                        className="form-control"
                        required
                      />
                      {showClientSuggestions && clients.length > 0 && (
                        <div className="suggestions-box">
                          {clients
                            .filter(c => c.name.toLowerCase().includes(clientName.toLowerCase()))
                            .map(c => (
                              <div
                                key={c.id}
                                className="suggestion-item"
                                onMouseDown={() => selectClient(c)}
                              >
                                <span className="suggestion-name">{c.name}</span>
                                <span className="suggestion-phone">{c.phone}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">No. Telefon Pelanggan *</label>
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        placeholder="Cth: 01125507190"
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label className="form-label">Alamat Penuh (Optional)</label>
                      <textarea
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        placeholder="Taip alamat penuh pelanggan..."
                        className="form-control"
                        rows="2"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                  </div>
                </div>

                {/* Right side: Job Name & Invoice Info (1/3 width on desktop) */}
                <div className="meta-right-widget" style={{ 
                  flex: '1', 
                  minWidth: '280px', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem'
                }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Nama Kerja (Job Name)</label>
                      <input
                        type="text"
                        value={jobName}
                        onChange={(e) => setJobName(e.target.value)}
                        placeholder="Cth: Event Sukan"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Tarikh Invois</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">No. Invois</label>
                      <input
                        type="text"
                        value={invoiceNo}
                        className="form-control disabled-input"
                        disabled
                      />
                    </div>
                </div>
              </div>

              <h4 className="meta-section-title">B. MAKLUMAT BAYARAN & PELANGGAN</h4>
              
              <div className="meta-layout-container" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* Left side: Payment Inputs (2/3 width on desktop) */}
                <div className="meta-left-inputs" style={{ flex: '2', minWidth: '320px' }}>
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem 1rem' }}>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Status Bayaran</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-control"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Deposit">Deposit</option>
                        <option value="Paid">Paid</option>
                        <option value="Void">Void</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">RM Deposit</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deposit}
                        onChange={(e) => handleDepositChange(e.target.value)}
                        placeholder="Cth: 400.00"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Right side: Follow Invoice Lama (1/3 width on desktop) */}
                <div className="meta-right-widget" style={{ 
                  flex: '1', 
                  minWidth: '280px', 
                  backgroundColor: 'var(--off-white-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  justifyContent: 'flex-start'
                }}>
                  
                  {/* Repeat order checkbox and input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-dark)', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={isRepeatOrder}
                          onChange={(e) => setIsRepeatOrder(e.target.checked)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-red)' }}
                        />
                        Follow Invoice Lama?
                      </label>
                    </div>

                    {/* Price Suggestions Box */}
                    {isRepeatOrder && repeatOrderPrices && (
                      <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Harga Terakhir:</div>
                        {repeatOrderPrices.bajuPrice !== null && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Baju (1pcs):</span> <span>RM {parseFloat(repeatOrderPrices.bajuPrice).toFixed(2)}</span>
                          </div>
                        )}
                        {repeatOrderPrices.bannerPrice !== null && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Banner (1 unit):</span> <span>RM {parseFloat(repeatOrderPrices.bannerPrice).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isRepeatOrder && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700' }}>Harga 1pcs Invoice Lama (RM) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={customBasePrice}
                          onChange={(e) => setCustomBasePrice(e.target.value)}
                          placeholder="Cth: 40.00"
                          className="form-control"
                          style={{ height: '36px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                          required={isRepeatOrder}
                        />
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* Row 2: Design Items List */}
            {/* Row 2: Design Items List */}
            <div className="design-items-section">
              
              {/* Tab Selector */}
              <div className="section-tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('baju')}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: activeTab === 'baju' ? 'var(--primary-red)' : 'transparent',
                    color: activeTab === 'baju' ? '#fff' : 'var(--text-dark)',
                    border: '1px solid ' + (activeTab === 'baju' ? 'var(--primary-red)' : 'var(--border-color)'),
                    borderRadius: '0',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  Baju
                  {items.some(item => SIZES.some(size => parseInt(item.sizes[size]?.short || 0) > 0 || parseInt(item.sizes[size]?.long || 0) > 0 || parseInt(item.sizes[size]?.pants || 0) > 0)) && (
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', backgroundColor: activeTab === 'baju' ? '#fff' : '#10B981', borderRadius: '50%' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('banner')}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: activeTab === 'banner' ? 'var(--primary-red)' : 'transparent',
                    color: activeTab === 'banner' ? '#fff' : 'var(--text-dark)',
                    border: '1px solid ' + (activeTab === 'banner' ? 'var(--primary-red)' : 'var(--border-color)'),
                    borderRadius: '0',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  Banner
                  {bannerItems.some(item => parseInt(item.qty || 0) > 0) && (
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', backgroundColor: activeTab === 'banner' ? '#fff' : '#10B981', borderRadius: '50%' }} />
                  )}
                </button>
              </div>

              {activeTab === 'baju' ? (
                <>
                  <div className="section-header-row">
                    <h4 className="meta-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>B.1. Butiran Rekaan Baju (Items)</h4>
                    <button type="button" onClick={addItem} className="btn btn-secondary btn-sm btn-add-design">
                      <Plus size={14} /> Tambah Design Baru
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      Tiada baju untuk ditempah. Klik "Tambah Design Baru" untuk mula.
                    </div>
                  ) : (
                    items.map((item, index) => {
                    const summary = calculateItemSummary(item);
                    return (
                      <div key={item.id} className="design-item-card card">
                        
                        {/* Header: Design Info & Remove Button */}
                        <div 
                          className="design-item-header"
                          onClick={() => toggleDesignCollapse(item.id)}
                          style={{ cursor: 'pointer', userSelect: 'none', borderBottom: collapsedDesigns[item.id] !== false ? 'none' : '1px dashed var(--border-color)', marginBottom: collapsedDesigns[item.id] !== false ? '0' : '1.25rem', paddingBottom: collapsedDesigns[item.id] !== false ? '0' : '0.5rem' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                            <h5 style={{ margin: 0, whiteSpace: 'nowrap' }}>DESIGN #{index + 1} {item.design_name ? `- ${item.design_name}` : ''}</h5>
                            {collapsedDesigns[item.id] !== false ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronUp size={16} style={{ flexShrink: 0 }} />}
                            {collapsedDesigns[item.id] !== false && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{summary.qty} pcs</span> | RM {summary.subtotal.toFixed(2)}
                              </div>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                            className="btn-text text-red"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', marginLeft: 'auto', flexShrink: 0 }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>

                        {collapsedDesigns[item.id] === false && (
                          <>
                            {/* Specification Dropdowns */}
                            <div className="grid-4 specs-grid">
                          <div className="form-group">
                            <label className="form-label">Nama/Code Design (Optional)</label>
                            <input
                              type="text"
                              value={item.design_name}
                              onChange={(e) => updateItemField(item.id, 'design_name', e.target.value)}
                              placeholder="Cth: Shield Pro/ 26#0110"
                              className="form-control"
                            />
                          </div>

                           <div className="form-group">
                            <label className="form-label">Printing Method</label>
                            <select
                              value={item.print_method || 'Sublimation'}
                              onChange={(e) => updateItemField(item.id, 'print_method', e.target.value)}
                              className="form-control"
                            >
                              <option value="Sublimation">Sublimation</option>
                              <option value="DTF">DTF</option>
                              <option value="Silk Screen">Silk Screen</option>
                            </select>
                          </div>

                          {item.print_method === 'DTF' && (
                            <div className="form-group">
                              <label className="form-label">Pilihan Baju</label>
                              <select
                                value={item.baju_source || ''}
                                onChange={(e) => updateItemField(item.id, 'baju_source', e.target.value)}
                                className="form-control"
                              >
                                <option value="" disabled>-- Sila Pilih --</option>
                                <option value="thirtyone_lab">Baju dari thirtyone lab</option>
                                <option value="customer">Baju customer sendiri</option>
                              </select>
                            </div>
                          )}

                          {(item.print_method !== 'DTF' || item.baju_source === 'thirtyone_lab') && (
                            <>
                           <div className="form-group">
                            <label className="form-label">Jenis Material</label>
                            <select
                              value={item.material}
                              onChange={(e) => updateItemField(item.id, 'material', e.target.value)}
                              className="form-control"
                            >
                              {MATERIALS.map(m => (
                                <option key={m.id} value={m.id}>
                                  {getDynamicOptionLabel(m.id, m.label, item.material_addon, isRepeatOrder)}
                                </option>
                              ))}
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.material_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'material_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Jenis Potongan (Cutting)</label>
                            <select
                              value={item.cutting}
                              onChange={(e) => updateItemField(item.id, 'cutting', e.target.value)}
                              className="form-control"
                            >
                              {CUTTINGS.map(c => (
                                <option key={c.id} value={c.id}>
                                  {getDynamicOptionLabel(c.id, c.label, item.cutting_addon, isRepeatOrder)}
                                </option>
                              ))}
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.cutting_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'cutting_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Jenis Kolar (Neck)</label>
                            <select
                              value={item.neck}
                              onChange={(e) => updateItemField(item.id, 'neck', e.target.value)}
                              className="form-control"
                            >
                              {NECKS.map(n => (
                                <option key={n.id} value={n.id}>
                                  {getDynamicOptionLabel(n.id, n.label, item.neck_addon, isRepeatOrder)}
                                </option>
                              ))}
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.neck_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'neck_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Rib</label>
                            <select
                              value={item.rib || 'Tiada'}
                              onChange={(e) => updateItemField(item.id, 'rib', e.target.value)}
                              className="form-control"
                            >
                              {RIBS.map(r => (
                                <option key={r.id} value={r.id}>
                                  {getDynamicOptionLabel(r.id, r.label, item.rib_addon, isRepeatOrder)}
                                </option>
                              ))}
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.rib_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'rib_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Name Set (+RM3/pcs)</label>
                            <select
                              value={item.name_set}
                              onChange={(e) => updateItemField(item.id, 'name_set', e.target.value)}
                              className="form-control"
                            >
                              <option value="No">No (+RM0)</option>
                              <option value="Yes">
                                {isRepeatOrder && !item.name_set_addon ? 'Yes (+RM0)' : 'Yes (+RM3)'}
                              </option>
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.name_set_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'name_set_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Tagging Own Brand (+RM1.50/pcs)</label>
                            <select
                              value={item.own_brand || 'No'}
                              onChange={(e) => updateItemField(item.id, 'own_brand', e.target.value)}
                              className="form-control"
                            >
                              <option value="No">No (+RM0)</option>
                              <option value="Yes">
                                {isRepeatOrder && !item.own_brand_addon ? 'Yes (+RM0)' : 'Yes (+RM1.50)'}
                              </option>
                            </select>
                            {isRepeatOrder && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.4rem', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={item.own_brand_addon || false}
                                  onChange={(e) => updateItemField(item.id, 'own_brand_addon', e.target.checked)}
                                  style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '14px', height: '14px' }}
                                />
                                Add-on (Cas Tambahan)
                              </label>
                            )}
                          </div>
                          </>
                          )}

                          <div className="form-group col-span-2">
                            <label className="form-label">Imej Design (Maks 300KB)</label>
                            <div className="design-upload-row">
                              <input
                                type="file"
                                id={`img_${item.id}`}
                                accept="image/*"
                                onChange={(e) => handleItemImageUpload(e, item.id)}
                                className="file-input-hidden"
                              />
                              {!item.design_image ? (
                                <label htmlFor={`img_${item.id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                                  <Upload size={12} /> Pilih Imej
                                </label>
                              ) : (
                                <div className="design-image-preview-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <img src={item.design_image} className="design-img-preview" alt="Design Preview" style={{ height: '50px', width: '50px', borderRadius: '4px' }} />
                                  <button
                                    type="button"
                                    onClick={() => updateItemField(item.id, 'design_image', '')}
                                    className="btn btn-secondary btn-sm"
                                    style={{ borderColor: '#FEE2E2', color: '#B91C1C', padding: '0.4rem 1rem' }}
                                  >
                                    Buang Imej
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown Matrix */}
                        {item.print_method === 'DTF' && item.baju_source === 'customer' && (
                          <div className="dtf-customer-section" style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                            <h5 style={{ marginBottom: '1rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Maklumat Tempahan DTF (Baju Sendiri)</h5>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div className="form-group">
                                <label className="form-label">Harga 1 Pcs (RM)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.dtf_price || ''}
                                  onChange={(e) => updateItemField(item.id, 'dtf_price', e.target.value)}
                                  placeholder="Contoh: 15.00"
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Bilangan Pcs (Kuantiti)</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.dtf_qty || ''}
                                  onChange={(e) => updateItemField(item.id, 'dtf_qty', e.target.value)}
                                  placeholder="Contoh: 10"
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {(item.print_method !== 'DTF' || item.baju_source === 'thirtyone_lab') && (
                        <div className="size-breakdown-section">
                          <div 
                            onClick={() => toggleSizesCollapse(item.id)}
                            className="size-breakdown-toggle-header"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              padding: '0.5rem 0',
                              borderBottom: '1px solid var(--border-color)',
                              marginBottom: '0.75rem',
                              userSelect: 'none'
                            }}
                          >
                            <label className="form-label size-breakdown-title" style={{ marginBottom: 0, cursor: 'pointer', color: 'var(--text-dark)' }}>
                              Pecahan Saiz & Kuantiti Lengan
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                              {collapsedSizes[item.id] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </div>
                          </div>

                          {collapsedSizes[item.id] ? (
                            <div 
                              className="collapsed-size-summary"
                              style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--off-white-bg)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                              }}
                            >
                              {getSelectedSizesPills(item)}
                            </div>
                          ) : (
                            <div className="breakdown-grid-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: 'none', backgroundColor: 'transparent', padding: 0 }}>
                              {/* Desktop breakdown table view */}
                              <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                {/* Desktop Adult Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleAdultSizesCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedAdults[item.id] !== false && !hasSelectedAdultSizes(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Adult Sizes</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedAdults[item.id] !== false && summary.adultShirtQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.adultShirtQty} pcs</span>}
                                      {collapsedAdults[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedAdults[item.id] !== false && getSelectedAdultSizesPills(item)}
                                  {collapsedAdults[item.id] === false && (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table className="breakdown-table" style={{ border: 'none', minWidth: '700px' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ borderRight: '1px solid var(--border-color)' }}>Lengan</th>
                                            {ADULT_SIZES.map(s => (
                                              <th key={s} className={getSizeCost(s) > 0 ? 'extra-cost-header' : ''} style={{ borderRight: '1px solid var(--border-color)' }}>
                                                {s}
                                                {getSizeCost(s) !== 0 && (
                                                  <span className={getSizeCost(s) > 0 ? 'extra-cost-badge' : 'discount-cost-badge'}>
                                                    {getSizeCost(s) > 0 ? `+${getSizeCost(s)}` : getSizeCost(s)}
                                                  </span>
                                                )}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)' }}>Short</td>
                                            {ADULT_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  disabled={item.cutting === 'Muslimah'}
                                                  value={displayQty(item.sizes[s]?.short)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'short', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                              Long (+RM{item.cutting === 'Muslimah' ? 0 : (isRepeatOrder && !item.long_sleeve_addon ? 0 : 5)})
                                              {isRepeatOrder && (
                                                <div style={{ marginTop: '0.2rem' }}>
                                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 'normal' }}>
                                                    <input
                                                      type="checkbox"
                                                      checked={item.long_sleeve_addon || false}
                                                      onChange={(e) => updateItemField(item.id, 'long_sleeve_addon', e.target.checked)}
                                                      style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '12px', height: '12px', margin: 0 }}
                                                    />
                                                    Add-on
                                                  </label>
                                                </div>
                                              )}
                                            </td>
                                            {ADULT_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={displayQty(item.sizes[s]?.long)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'long', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Desktop Kid Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleKidSizesCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedKids[item.id] !== false && !hasSelectedKidSizes(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Kid Sizes</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedKids[item.id] !== false && summary.kidShirtQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.kidShirtQty} pcs</span>}
                                      {collapsedKids[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedKids[item.id] !== false && getSelectedKidSizesPills(item)}
                                  {collapsedKids[item.id] === false && (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table className="breakdown-table" style={{ border: 'none', minWidth: '700px' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ borderRight: '1px solid var(--border-color)' }}>Lengan</th>
                                            {KID_SIZES.map(s => (
                                              <th key={s} className="discount-cost-header" style={{ borderRight: '1px solid var(--border-color)' }}>
                                                {s}
                                                {getSizeCost(s) !== 0 && (
                                                  <span className="discount-cost-badge">
                                                    {getSizeCost(s) > 0 ? `+${getSizeCost(s)}` : getSizeCost(s)}
                                                  </span>
                                                )}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)' }}>Short</td>
                                            {KID_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  disabled={item.cutting === 'Muslimah'}
                                                  value={displayQty(item.sizes[s]?.short)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'short', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                              Long (+RM{item.cutting === 'Muslimah' ? 0 : (isRepeatOrder && !item.long_sleeve_addon ? 0 : 5)})
                                              {isRepeatOrder && (
                                                <div style={{ marginTop: '0.2rem' }}>
                                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 'normal' }}>
                                                    <input
                                                      type="checkbox"
                                                      checked={item.long_sleeve_addon || false}
                                                      onChange={(e) => updateItemField(item.id, 'long_sleeve_addon', e.target.checked)}
                                                      style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '12px', height: '12px', margin: 0 }}
                                                    />
                                                    Add-on
                                                  </label>
                                                </div>
                                              )}
                                            </td>
                                            {KID_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={displayQty(item.sizes[s]?.long)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'long', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Desktop Adult Pants Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleAdultPantsCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedAdultPants[item.id] !== false && !hasSelectedAdultPants(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Adult Pants Sizes (RM25/pcs)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedAdultPants[item.id] !== false && summary.adultPantsQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.adultPantsQty} pcs</span>}
                                      {collapsedAdultPants[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedAdultPants[item.id] !== false && getSelectedAdultPantsPills(item)}
                                  {collapsedAdultPants[item.id] === false && (
                                    <div style={{ overflowX: 'auto' }}>
                                      {isRepeatOrder && (
                                        <div style={{ padding: '0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Harga Custom / Invois Lama (RM/pcs)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.custom_adult_pants_price || ''}
                                            onChange={(e) => updateItemField(item.id, 'custom_adult_pants_price', e.target.value)}
                                            placeholder="Cth: 20"
                                            className="form-control"
                                            style={{ maxWidth: '150px' }}
                                          />
                                        </div>
                                      )}
                                      <table className="breakdown-table" style={{ border: 'none', minWidth: '700px' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ borderRight: '1px solid var(--border-color)' }}>Jenis</th>
                                            {ADULT_PANTS_SIZES.map(s => (
                                              <th key={s} style={{ borderRight: '1px solid var(--border-color)' }}>{s}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>Short Pants</td>
                                            {ADULT_PANTS_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={displayQty(item.sizes[s]?.pants)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'pants', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Desktop Kid Pants Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleKidPantsCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedKidPants[item.id] !== false && !hasSelectedKidPants(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Kid Pants Sizes (RM23/pcs)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedKidPants[item.id] !== false && summary.kidPantsQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.kidPantsQty} pcs</span>}
                                      {collapsedKidPants[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedKidPants[item.id] !== false && getSelectedKidPantsPills(item)}
                                  {collapsedKidPants[item.id] === false && (
                                    <div style={{ overflowX: 'auto' }}>
                                      {isRepeatOrder && (
                                        <div style={{ padding: '0.8rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--white)' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Harga Custom / Invois Lama (RM/pcs)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.custom_kid_pants_price || ''}
                                            onChange={(e) => updateItemField(item.id, 'custom_kid_pants_price', e.target.value)}
                                            placeholder="Cth: 18"
                                            className="form-control"
                                            style={{ maxWidth: '150px' }}
                                          />
                                        </div>
                                      )}
                                      <table className="breakdown-table" style={{ border: 'none', minWidth: '700px' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ borderRight: '1px solid var(--border-color)' }}>Jenis</th>
                                            {KID_SIZES.map(s => (
                                              <th key={s} style={{ borderRight: '1px solid var(--border-color)' }}>{s}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td className="row-label" style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>Short Pants</td>
                                            {KID_SIZES.map(s => (
                                              <td key={s} style={{ borderRight: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={displayQty(item.sizes[s]?.pants)}
                                                  onChange={(e) => updateItemQty(item.id, s, 'pants', e.target.value)}
                                                  placeholder="0"
                                                  className="qty-input"
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Mobile Size Breakdown Grid */}
                              <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                
                                {/* Mobile Adult Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleAdultSizesCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedAdults[item.id] !== false && !hasSelectedAdultSizes(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Adult Sizes</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedAdults[item.id] !== false && summary.adultShirtQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.adultShirtQty} pcs</span>}
                                      {collapsedAdults[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedAdults[item.id] !== false && getSelectedAdultSizesPills(item)}
                                  {collapsedAdults[item.id] === false && (
                                    <div className="size-grid-mobile" style={{ padding: '0.5rem' }}>
                                      {ADULT_SIZES.map(s => (
                                        <div key={s} className="size-input-card">
                                          <div className="size-card-title">
                                            <span>Size {s}</span>
                                            {getSizeCost(s) !== 0 && (
                                              <span className={getSizeCost(s) > 0 ? "size-card-extra-badge" : "size-card-discount-badge"}>
                                                {getSizeCost(s) > 0 ? `+${getSizeCost(s)}` : getSizeCost(s)}
                                              </span>
                                            )}
                                          </div>
                                          <div className="size-inputs-row">
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">Short</span>
                                              <input
                                                type="number"
                                                min="0"
                                                disabled={item.cutting === 'Muslimah'}
                                                value={displayQty(item.sizes[s]?.short)}
                                                onChange={(e) => updateItemQty(item.id, s, 'short', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.short || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">
                                                Long (+RM{item.cutting === 'Muslimah' ? 0 : (isRepeatOrder && !item.long_sleeve_addon ? 0 : 5)})
                                                {isRepeatOrder && (
                                                  <div style={{ marginTop: '0.1rem' }}>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 'normal' }}>
                                                      <input
                                                        type="checkbox"
                                                        checked={item.long_sleeve_addon || false}
                                                        onChange={(e) => updateItemField(item.id, 'long_sleeve_addon', e.target.checked)}
                                                        style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '10px', height: '10px', margin: 0 }}
                                                      />
                                                      Add-on
                                                    </label>
                                                  </div>
                                                )}
                                              </span>
                                              <input
                                                type="number"
                                                min="0"
                                                value={displayQty(item.sizes[s]?.long)}
                                                onChange={(e) => updateItemQty(item.id, s, 'long', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.long || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Mobile Kid Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleKidSizesCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedKids[item.id] !== false && !hasSelectedKidSizes(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Kid Sizes</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedKids[item.id] !== false && summary.kidShirtQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.kidShirtQty} pcs</span>}
                                      {collapsedKids[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedKids[item.id] !== false && getSelectedKidSizesPills(item)}
                                  {collapsedKids[item.id] === false && (
                                    <div className="size-grid-mobile" style={{ padding: '0.5rem' }}>
                                      {KID_SIZES.map(s => (
                                        <div key={s} className="size-input-card">
                                          <div className="size-card-title">
                                            <span>Size {s}</span>
                                            {getSizeCost(s) !== 0 && (
                                              <span className="size-card-discount-badge">
                                                {getSizeCost(s) > 0 ? `+${getSizeCost(s)}` : getSizeCost(s)}
                                              </span>
                                            )}
                                          </div>
                                          <div className="size-inputs-row">
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">Short</span>
                                              <input
                                                type="number"
                                                min="0"
                                                disabled={item.cutting === 'Muslimah'}
                                                value={displayQty(item.sizes[s]?.short)}
                                                onChange={(e) => updateItemQty(item.id, s, 'short', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.short || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">
                                                Long (+RM{item.cutting === 'Muslimah' ? 0 : (isRepeatOrder && !item.long_sleeve_addon ? 0 : 5)})
                                                {isRepeatOrder && (
                                                  <div style={{ marginTop: '0.1rem' }}>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none', fontWeight: 'normal' }}>
                                                      <input
                                                        type="checkbox"
                                                        checked={item.long_sleeve_addon || false}
                                                        onChange={(e) => updateItemField(item.id, 'long_sleeve_addon', e.target.checked)}
                                                        style={{ accentColor: 'var(--primary-red)', cursor: 'pointer', width: '10px', height: '10px', margin: 0 }}
                                                      />
                                                      Add-on
                                                    </label>
                                                  </div>
                                                )}
                                              </span>
                                              <input
                                                type="number"
                                                min="0"
                                                value={displayQty(item.sizes[s]?.long)}
                                                onChange={(e) => updateItemQty(item.id, s, 'long', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.long || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Mobile Adult Pants Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleAdultPantsCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedAdultPants[item.id] !== false && !hasSelectedAdultPants(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Adult Pants Sizes (RM25/pcs)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedAdultPants[item.id] !== false && summary.adultPantsQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.adultPantsQty} pcs</span>}
                                      {collapsedAdultPants[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedAdultPants[item.id] !== false && getSelectedAdultPantsPills(item)}
                                  {collapsedAdultPants[item.id] === false && (
                                    <div className="size-grid-mobile" style={{ padding: '0.5rem' }}>
                                      {isRepeatOrder && (
                                        <div style={{ padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'var(--white)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Harga Custom / Invois Lama (RM/pcs)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.custom_adult_pants_price || ''}
                                            onChange={(e) => updateItemField(item.id, 'custom_adult_pants_price', e.target.value)}
                                            placeholder="Cth: 20"
                                            className="form-control"
                                          />
                                        </div>
                                      )}
                                      {ADULT_PANTS_SIZES.map(s => (
                                        <div key={s} className="size-input-card">
                                          <div className="size-card-title">
                                            <span>Size {s}</span>
                                          </div>
                                          <div className="size-inputs-row">
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">Short Pants</span>
                                              <input
                                                type="number"
                                                min="0"
                                                value={displayQty(item.sizes[s]?.pants)}
                                                onChange={(e) => updateItemQty(item.id, s, 'pants', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.pants || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Mobile Kid Pants Section */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div 
                                    onClick={() => toggleKidPantsCollapse(item.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: 'var(--off-white-bg)', borderBottom: (collapsedKidPants[item.id] !== false && !hasSelectedKidPants(item)) ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', userSelect: 'none' }}
                                  >
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-dark)' }}>Kid Pants Sizes (RM23/pcs)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {collapsedKidPants[item.id] !== false && summary.kidPantsQty > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{summary.kidPantsQty} pcs</span>}
                                      {collapsedKidPants[item.id] !== false ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </div>
                                  </div>
                                  {collapsedKidPants[item.id] !== false && getSelectedKidPantsPills(item)}
                                  {collapsedKidPants[item.id] === false && (
                                    <div className="size-grid-mobile" style={{ padding: '0.5rem' }}>
                                      {isRepeatOrder && (
                                        <div style={{ padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'var(--white)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '0.3rem' }}>Harga Custom / Invois Lama (RM/pcs)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.custom_kid_pants_price || ''}
                                            onChange={(e) => updateItemField(item.id, 'custom_kid_pants_price', e.target.value)}
                                            placeholder="Cth: 18"
                                            className="form-control"
                                          />
                                        </div>
                                      )}
                                      {KID_SIZES.map(s => (
                                        <div key={s} className="size-input-card">
                                          <div className="size-card-title">
                                            <span>Size {s}</span>
                                          </div>
                                          <div className="size-inputs-row">
                                            <div className="size-qty-group">
                                              <span className="size-qty-lbl">Short Pants</span>
                                              <input
                                                type="number"
                                                min="0"
                                                value={displayQty(item.sizes[s]?.pants)}
                                                onChange={(e) => updateItemQty(item.id, s, 'pants', e.target.value)}
                                                placeholder="0"
                                                className={`size-qty-input ${parseInt(item.sizes[s]?.pants || 0) > 0 ? 'has-value' : ''}`}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        )}

                        {/* Item Calculations Footnote */}
                        <div className="item-calculations-footer">
                          <div className="calc-pill">
                            <span className="calc-pill-label">Qty</span>
                            <strong className="calc-pill-value">{summary.qty} pcs</strong>
                          </div>
                          <div className="calc-pill">
                            <span className="calc-pill-label">Base ({basePrice}x)</span>
                            <strong className="calc-pill-value">RM {summary.base.toFixed(2)}</strong>
                          </div>
                          <div className="calc-pill">
                            <span className="calc-pill-label">Add-ons</span>
                            <strong className="calc-pill-value">RM {summary.addons.toFixed(2)}</strong>
                          </div>
                          <div className="calc-pill subtotal-pill">
                            <span className="calc-pill-label">Subtotal Item</span>
                            <strong className="calc-pill-value">RM {summary.subtotal.toFixed(2)}</strong>
                          </div>
                        </div>
                          </>
                        )}

                      </div>
                    );
                  })
                  )}
                </>
              ) : (
                <>
                  <div className="section-header-row">
                    <h4 className="meta-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>B.2. Butiran Banner (Items)</h4>
                    <button type="button" onClick={addBannerItem} className="btn btn-secondary btn-sm btn-add-design">
                      <Plus size={14} /> Tambah Design Baru
                    </button>
                  </div>

                  {bannerItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Tiada design banner. Klik "Tambah Design Baru" untuk menambah banner.
                    </div>
                  ) : (
                    bannerItems.map((item, index) => {
                      const summary = calculateItemSummary(item);
                      return (
                        <div key={item.id} className="design-item-card card">
                          
                          {/* Header: Design Info & Remove Button */}
                          <div 
                            className="design-item-header"
                            onClick={() => toggleDesignCollapse(item.id)}
                            style={{ cursor: 'pointer', userSelect: 'none', borderBottom: collapsedDesigns[item.id] !== false ? 'none' : '1px dashed var(--border-color)', marginBottom: collapsedDesigns[item.id] !== false ? '0' : '1.25rem', paddingBottom: collapsedDesigns[item.id] !== false ? '0' : '0.5rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                              <h5 style={{ margin: 0, whiteSpace: 'nowrap' }}>BANNER #{index + 1} {item.design_name ? `- ${item.design_name}` : ''}</h5>
                              {collapsedDesigns[item.id] !== false ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronUp size={16} style={{ flexShrink: 0 }} />}
                              {collapsedDesigns[item.id] !== false && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>
                                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{summary.qty} pcs</span> | RM {summary.subtotal.toFixed(2)}
                                </div>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeBannerItem(item.id); }}
                              className="btn-text text-red"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', marginLeft: 'auto', flexShrink: 0 }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>

                          {collapsedDesigns[item.id] === false && (
                            <>
                              <div className="grid-2 specs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem 1rem' }}>
                                <div className="form-group">
                                  <label className="form-label">Nama/Code Design (Optional)</label>
                                  <input
                                    type="text"
                                    value={item.design_name}
                                    onChange={(e) => updateBannerItemField(item.id, 'design_name', e.target.value)}
                                    placeholder="Cth: Banner Shield Pro"
                                    className="form-control"
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Imej Design (Maks 300KB)</label>
                                  <div className="design-upload-row">
                                    <input
                                      type="file"
                                      id={`img_banner_${item.id}`}
                                      accept="image/*"
                                      onChange={(e) => handleBannerImageUpload(e, item.id)}
                                      className="file-input-hidden"
                                    />
                                    {!item.design_image ? (
                                      <label htmlFor={`img_banner_${item.id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                                        <Upload size={12} /> Pilih Imej
                                      </label>
                                    ) : (
                                      <div className="design-image-preview-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={item.design_image} className="design-img-preview" alt="Design Preview" style={{ height: '50px', width: '50px', borderRadius: '4px' }} />
                                        <button
                                          type="button"
                                          onClick={() => updateBannerItemField(item.id, 'design_image', '')}
                                          className="btn btn-secondary btn-sm"
                                          style={{ borderColor: '#FEE2E2', color: '#B91C1C', padding: '0.4rem 1rem' }}
                                        >
                                          Buang Imej
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Harga Seunit (RM)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => updateBannerItemField(item.id, 'price', e.target.value)}
                                    placeholder="0.00"
                                    className="form-control"
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Bilangan (Pcs)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.qty}
                                    onChange={(e) => updateBannerItemField(item.id, 'qty', e.target.value)}
                                    placeholder="0"
                                    className="form-control"
                                  />
                                </div>
                              </div>

                              <div className="item-calculations-footer" style={{ marginTop: '1rem' }}>
                                <div className="calc-pill subtotal-pill">
                                  <span className="calc-pill-label">Subtotal Item</span>
                                  <strong className="calc-pill-value">RM {summary.subtotal.toFixed(2)}</strong>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {/* Row 3: Notes & Discount */}
            <div className="invoice-summary-section">
              <h4 className="meta-section-title">C. Ringkasan & Diskaun</h4>
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Catatan Invoice (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      placeholder="Catatan tambahan untuk dicetak di atas invoice..."
                      className="form-control"
                      style={{ resize: 'none' }}
                    ></textarea>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Kos Pengeluaran Kilang (RM) (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pengeluaran}
                      onChange={(e) => setPengeluaran(e.target.value)}
                      placeholder="0.00"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="summary-card-calc">
                  <div className="calc-row">
                    <span>Jumlah Kasar (Subtotal)</span>
                    <span className="font-bold">RM {grossSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="calc-row discount-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div 
                      onClick={() => setIsDiscountCollapsed(!isDiscountCollapsed)} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 0', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Diskaun</span>
                        {isDiscountCollapsed && totalDiscount > 0 && (
                           <span className="text-red font-bold" style={{ fontSize: '0.85rem' }}>
                             - RM {totalDiscount.toFixed(2)}
                           </span>
                        )}
                      </div>
                      {isDiscountCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </div>

                    {!isDiscountCollapsed && (
                      <div className="discount-input-row" style={{ padding: '0.5rem 0 0.5rem 0', borderTop: '1px dashed var(--border-color)', marginTop: '0.25rem', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <input 
                                type="radio" 
                                name="discountType" 
                                value="per_pcs" 
                                checked={discountType === 'per_pcs'} 
                                onChange={() => setDiscountType('per_pcs')} 
                                style={{ margin: 0 }}
                              /> Per Helai
                            </label>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <input 
                                type="radio" 
                                name="discountType" 
                                value="bulk" 
                                checked={discountType === 'bulk'} 
                                onChange={() => setDiscountType('bulk')} 
                                style={{ margin: 0 }}
                              /> Pukal (Bulk)
                            </label>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', width: '100%' }}>
                          <div className="discount-input-wrapper" style={{ flex: '1', maxWidth: '150px' }}>
                            <span className="currency-prefix">RM</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={discountValue || ''}
                              onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="form-control discount-input"
                              placeholder="0.00"
                            />
                          </div>
                          <span className="text-red font-bold" style={{ whiteSpace: 'nowrap' }}>- RM {totalDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="calc-row grand-total-row">
                    <span>Jumlah Bersih (Grand Total)</span>
                    <span className="grand-total-val">RM {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              {tr('cancel')}
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Menyimpan...' : tr('saveInvoice')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-modal-body {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .meta-section-title {
          font-family: var(--font-primary);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 1.25rem;
          color: var(--primary-red);
        }

        .disabled-input {
          background-color: var(--off-white-bg);
          cursor: not-allowed;
        }

        /* Autocomplete Suggestions */
        .autocomplete-container {
          position: relative;
        }

        .suggestions-box {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--border-color);
          z-index: 100;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: var(--shadow-md);
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--off-white-bg);
          transition: var(--transition);
        }

        .suggestion-item:hover {
          background-color: var(--primary-red-light);
        }

        .suggestion-name {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .suggestion-phone {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Quota Info Box */
        .quota-banner {
          display: flex;
          background-color: var(--primary-red-light);
          border: 1px solid var(--primary-red);
          padding: 0.75rem 1.25rem !important;
          flex-direction: row !important;
          justify-content: space-around;
          align-items: center;
          gap: 1rem;
        }

        .quota-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .quota-label {
          font-size: 0.65rem;
          font-family: var(--font-primary);
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--primary-red-hover);
        }

        .quota-value {
          font-family: var(--font-primary);
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--primary-red);
        }

        /* Design Item Card */
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .btn-add-design {
          margin-top: -1.25rem;
        }

        .design-item-card {
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
          background-color: #fff;
          padding: 1.5rem;
        }

        .design-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .design-item-header h5 {
          font-family: var(--font-primary);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text-muted);
        }

        .specs-grid {
          margin-bottom: 1.5rem;
        }

        .col-span-2 {
          grid-column: span 2;
        }

        .design-upload-row {
          display: flex;
          align-items: center;
          justify-content: flex-start !important;
          gap: 1rem;
          margin-top: 0.25rem;
        }

        .design-image-preview-wrapper {
          display: flex;
          align-items: center;
          justify-content: flex-start !important;
          gap: 1rem;
          width: auto !important;
        }

        .design-img-preview {
          height: 40px;
          width: 40px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          background: var(--off-white-bg);
        }

        .no-image-text {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        /* Size Breakdown Grid */
        .size-breakdown-section {
          margin-bottom: 1.5rem;
        }

        .size-breakdown-title {
          margin-bottom: 0.75rem;
          display: block;
        }

        .breakdown-grid-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-color);
          background-color: var(--off-white-bg);
        }

        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 700px;
        }

        .breakdown-table th {
          font-family: var(--font-primary);
          font-size: 0.7rem;
          font-weight: 700;
          text-align: center;
          padding: 0.6rem 0.4rem;
          border-bottom: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          background: #fff;
          position: relative;
        }

        .extra-cost-header {
          background-color: #E8F5E9 !important;
          color: #15803D !important;
        }

        .extra-cost-badge {
          display: block;
          font-size: 0.55rem;
          font-weight: 800;
          color: #15803D;
          margin-top: 0.15rem;
        }

        .breakdown-table td {
          padding: 0.5rem 0.4rem;
          text-align: center;
          border-bottom: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
        }

        .row-label {
          font-weight: 700;
          text-align: left !important;
          padding-left: 0.75rem !important;
          font-size: 0.75rem;
          background: #fff;
          width: 130px;
          min-width: 130px;
        }

        .qty-input {
          width: 100%;
          max-width: 45px;
          padding: 0.35rem 0.25rem;
          border: 1px solid var(--border-color);
          text-align: center;
          font-family: var(--font-secondary);
          font-size: 0.85rem;
          border-radius: 0;
          background: #fff;
        }

        .qty-input:focus {
          border-color: var(--border-color-hover);
          outline: none;
        }

        /* Removing arrows from input type number */
        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .qty-input[type=number] {
          -moz-appearance: textfield;
        }

        /* Item calculations footer */
        .item-calculations-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
        }

        .calc-pill {
          padding: 0.6rem 0.75rem;
          background-color: var(--off-white-bg);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          text-align: center;
        }

        .calc-pill-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .calc-pill-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .subtotal-pill {
          background-color: var(--primary-red-light);
          border-color: var(--primary-red);
        }

        .subtotal-pill .calc-pill-label {
          color: var(--primary-red);
        }

        .subtotal-pill .calc-pill-value {
          color: var(--primary-red-hover);
        }

        /* Overall calculations card */
        .summary-card-calc {
          background-color: var(--off-white-bg);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .calc-row span:last-child {
          white-space: nowrap !important;
        }

        .discount-row {
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          align-items: flex-end;
        }

        .discount-input-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .discount-label {
          font-size: 0.65rem;
          margin-bottom: 0;
        }

        .discount-input-wrapper {
          display: flex;
          position: relative;
          align-items: center;
          max-width: 120px;
        }

        .currency-prefix {
          position: absolute;
          left: 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .discount-input {
          padding-left: 2.25rem;
          padding-top: 0.4rem;
          padding-bottom: 0.4rem;
          font-size: 0.85rem;
        }

        .grand-total-row {
          font-family: var(--font-primary);
          font-weight: 800;
          color: var(--text-dark);
          font-size: 1rem;
          letter-spacing: 0.5px;
          padding-top: 0.25rem;
        }

        .grand-total-val {
          color: var(--primary-red);
          font-size: 1.3rem;
        }

        @media (max-width: 768px) {
          .section-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          .btn-add-design {
            margin-top: 0 !important;
            width: 100%;
            justify-content: center;
          }
          .specs-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1;
          }
          .item-calculations-footer {
            justify-content: flex-start;
          }
          .grand-total-row {
            font-size: 0.82rem !important;
          }
          .grand-total-val {
            font-size: 1.15rem !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </div>
  );
}
