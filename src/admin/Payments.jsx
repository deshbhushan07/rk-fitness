// src/admin/Payments.jsx
import React, { useEffect, useState } from 'react';
import { getPayments, addPayment } from '../services/paymentService';
import { getMembers } from '../services/memberService';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiX, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const BLANK = { memberId: '', amount: '', method: 'cash', status: 'paid', note: '' };
const METHODS = ['cash', 'UPI', 'card', 'bank transfer'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [p, m] = await Promise.all([getPayments(), getMembers()]);
    setPayments(p); setMembers(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.memberId || !form.amount) { toast.error('Select member and enter amount'); return; }
    setSaving(true);
    try {
      const member = members.find(m => m.id === form.memberId);
      await addPayment({ ...form, amount: Number(form.amount), memberName: member?.name || '' });
      toast.success('Payment recorded'); setModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const getMemberName = (id) => members.find(m => m.id === id)?.name || '—';

  const filtered = payments.filter(p => {
    const name = getMemberName(p.memberId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || p.memberName?.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'paid') return matchSearch && p.status === 'paid';
    if (filterStatus === 'pending') return matchSearch && p.status === 'pending';
    return matchSearch;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const thisMonth = payments.filter(p => {
    const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'paid';
  }).reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{payments.length} transactions recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(BLANK); setModal(true); }}><FiPlus /> Record Payment</button>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232,255,59,0.12)', color: 'var(--accent)' }}><FiTrendingUp /></div>
          <div className="stat-value">₹{thisMonth.toLocaleString()}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}><FiCheckCircle /></div>
          <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
          <div className="stat-label">Total Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--orange)' }}><FiClock /></div>
          <div className="stat-value">₹{totalPending.toLocaleString()}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <FiSearch className="search-icon" />
          <input placeholder="Search by member name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'paid', 'pending'].map(f => (
          <button key={f} className={`btn ${filterStatus === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            style={{ textTransform: 'capitalize' }} onClick={() => setFilterStatus(f)}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💳</div><p>No payments found</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || Date.now());
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.memberName || getMemberName(p.memberId)}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: p.status === 'paid' ? 'var(--green)' : 'var(--orange)' }}>
                        ₹{Number(p.amount).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{ textTransform: 'uppercase' }}>{p.method}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {format(date, 'dd MMM yyyy')}
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'paid' ? 'badge-green' : 'badge-orange'}`}>{p.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Record Payment</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Member *</label>
                <select className="form-input" value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.phone}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="3000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Method</label>
                  <select className="form-input" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                    {METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Monthly fee, renewal, etc." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                  {saving ? <span className="spinner" style={{width:16,height:16,borderWidth:2}} /> : null}
                  {saving ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
