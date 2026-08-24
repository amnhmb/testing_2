import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AddTransactionModal({ isOpen, onClose, onSave }) {
  const { tr } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('OUT');
  const [category, setCategory] = useState('Belanja Operasi');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!description || !amount) {
      alert('Sila lengkapkan butiran dan jumlah transaksi.');
      return;
    }

    setLoading(true);
    onSave({
      date,
      description,
      type,
      category,
      payee: type === 'OUT' ? (payee || 'Tunai') : '',
      amount: parseFloat(amount)
    });

    setDescription('');
    setPayee('');
    setAmount('');
    setLoading(false);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'IN') {
      setCategory('Jualan Luar');
    } else {
      setCategory('Belanja Operasi');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>TAMBAH REKOD TRANSAKSI</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tarikh</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-control" required />
            </div>

            <div className="form-group">
              <label className="form-label">Jenis</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value)} className="form-control">
                <option value="IN">Wang Masuk (IN)</option>
                <option value="OUT">Wang Keluar (OUT)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="form-control">
                {type === 'IN' ? (
                  <>
                    <option value="Jualan Luar">Jualan Luar (Bukan Invois)</option>
                    <option value="Modal Tambahan">Modal Tambahan</option>
                    <option value="Lain-lain Pendapatan">Lain-lain Pendapatan</option>
                  </>
                ) : (
                  <>
                    <option value="Belanja Operasi">Belanja Operasi (Api, Air, Sewa)</option>
                    <option value="Gaji Pekerja">Gaji Pekerja</option>
                    <option value="Kos Bahan Mentah">Kos Bahan Mentah</option>
                    <option value="Lain-lain Belanja">Lain-lain Belanja</option>
                  </>
                )}
              </select>
            </div>

            {type === 'OUT' && (
              <div className="form-group">
                <label className="form-label">Dibayar Kepada (Pay To)</label>
                <input 
                  type="text" 
                  value={payee} 
                  onChange={e => setPayee(e.target.value)} 
                  className="form-control" 
                  placeholder="Contoh: TNB / Nama Pekerja" 
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Butiran (Description)</label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="form-control" 
                placeholder="Contoh: Bil Elektrik Kedai Ogos" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah (RM)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="form-control" 
                placeholder="0.00" 
                required 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {tr('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Menyimpan...' : tr('saveRecord')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
