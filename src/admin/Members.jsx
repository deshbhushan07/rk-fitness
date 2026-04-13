// src/admin/Members.jsx
import React, { useEffect, useState } from 'react';
import { getMembers, addMember, updateMember, deleteMember } from '../services/memberService';
import { getTrainers } from '../services/trainerService';
import { getDietPlans } from '../services/dietService';
import { uploadToCloudinary, getInitials } from '../utils/cloudinaryUpload';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiUpload, FiPhone, FiCalendar } from 'react-icons/fi';
import { format, addMonths, differenceInDays } from 'date-fns';

const PLANS = ['1 Month', '3 Months', '6 Months', '1 Year'];
const PLAN_MONTHS = { '1 Month': 1, '3 Months': 3, '6 Months': 6, '1 Year': 12 };
const BLANK = { name: '', phone: '', age: '', gender: 'Male', joinDate: '', plan: '1 Month', fees: '', trainerId: '', dietPlanId: '', status: 'active' };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [diets, setDiets] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');

  const load = async () => {
    const [m, t, d] = await Promise.all([getMembers(), getTrainers(), getDietPlans()]);
    setMembers(m); setTrainers(t); setDiets(d); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(BLANK); setEditing(null); setImgFile(null); setImgPreview(''); setModal(true); };
  const openEdit = (m) => { setForm(m); setEditing(m.id); setImgPreview(m.photoUrl || ''); setImgFile(null); setModal(true); };

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.joinDate) { toast.error('Name, phone, join date required'); return; }
    setSaving(true);
    try {
      let photoUrl = form.photoUrl || '';
      if (imgFile) photoUrl = await uploadToCloudinary(imgFile, 'rk-fitness/members');
      const data = { ...form, photoUrl, fees: Number(form.fees) || 0, age: Number(form.age) || 0 };
      if (editing) { await updateMember(editing, data); toast.success('Member updated'); }
      else { await addMember(data); toast.success('Member added'); }
      setModal(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await deleteMember(id); toast.success('Deleted'); load();
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const match = m.name?.toLowerCase().includes(q) || m.phone?.includes(q);
    if (filter === 'active') return match && m.status === 'active';
    if (filter === 'expired') {
      if (!m.joinDate || !m.plan) return false;
      const exp = addMonths(new Date(m.joinDate), PLAN_MONTHS[m.plan] || 1);
      return match && differenceInDays(exp, new Date()) < 0;
    }
    return match;
  });

  const getExpiry = (m) => {
    if (!m.joinDate || !m.plan) return null;
    return addMonths(new Date(m.joinDate), PLAN_MONTHS[m.plan] || 1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members.length} total · {members.filter(m => m.status === 'active').length} active</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Member</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: '1', minWidth: 200 }}>
          <FiSearch className="search-icon" />
          <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'active', 'expired'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            style={{ textTransform: 'capitalize' }} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><p>No members found</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th><th>Phone</th><th>Plan</th><th>Join Date</th>
                  <th>Expiry</th><th>Trainer</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const exp = getExpiry(m);
                  const daysLeft = exp ? differenceInDays(exp, new Date()) : null;
                  const trainer = trainers.find(t => t.id === m.trainerId);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} className="avatar" />
                          ) : (
                            <div className="avatar">{getInitials(m.name)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 500 }}>{m.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.gender}, {m.age}y</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.phone}</td>
                      <td>
                        <span className="badge badge-accent">{m.plan}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {m.joinDate ? format(new Date(m.joinDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td>
                        {exp ? (
                          <span className={`badge ${daysLeft < 0 ? 'badge-red' : daysLeft <= 7 ? 'badge-orange' : 'badge-green'}`}>
                            {daysLeft < 0 ? `Exp ${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {trainer?.name || '—'}
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-red'}`}>{m.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}><FiEdit2 /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id, m.name)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{editing ? 'Edit Member' : 'Add Member'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><FiX /></button>
            </div>

            {/* Photo upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-hover)', border: '2px solid var(--border)', flexShrink: 0 }}>
                {imgPreview ? (
                  <img src={imgPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)' }}>
                    {getInitials(form.name) || '?'}
                  </div>
                )}
              </div>
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                <FiUpload /> Upload Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Rahul Patil" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="25" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Join Date *</label>
                  <input className="form-input" type="date" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan</label>
                  <select className="form-input" value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}>
                    {PLANS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fees (₹)</label>
                  <input className="form-input" type="number" value={form.fees} onChange={e => setForm({...form, fees: e.target.value})} placeholder="3000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assign Trainer</label>
                  <select className="form-input" value={form.trainerId} onChange={e => setForm({...form, trainerId: e.target.value})}>
                    <option value="">None</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Diet Plan</label>
                  <select className="form-input" value={form.dietPlanId} onChange={e => setForm({...form, dietPlanId: e.target.value})}>
                    <option value="">None</option>
                    {diets.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                  {saving ? <span className="spinner" style={{width:16,height:16,borderWidth:2}} /> : null}
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Add Member')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
