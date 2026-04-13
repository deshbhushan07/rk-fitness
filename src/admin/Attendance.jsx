// src/admin/Attendance.jsx
import React, { useEffect, useState } from 'react';
import { markAttendance, getTodayAttendance, getAllAttendance } from '../services/attendanceService';
import { getMembers } from '../services/memberService';
import { toast } from 'react-toastify';
import { FiSearch, FiCheckCircle, FiCalendar, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import { getInitials } from '../utils/cloudinaryUpload';

export default function Attendance() {
  const [members, setMembers] = useState([]);
  const [todayAtt, setTodayAtt] = useState([]);
  const [allAtt, setAllAtt] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState('');
  const [tab, setTab] = useState('mark');

  const load = async () => {
    const [m, t, a] = await Promise.all([getMembers(), getTodayAttendance(), getAllAttendance()]);
    setMembers(m.filter(m => m.status === 'active'));
    setTodayAtt(t); setAllAtt(a); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const isMarkedToday = (memberId) => todayAtt.some(a => a.memberId === memberId);

  const handleMark = async (member) => {
    setMarking(member.id);
    try {
      await markAttendance(member.id, member.name);
      toast.success(`✅ ${member.name} checked in`);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setMarking(''); }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, dd MMMM yyyy')} · {todayAtt.length} checked in today</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}><FiCheckCircle /></div>
          <div className="stat-value">{todayAtt.length}</div>
          <div className="stat-label">Today's Check-ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--blue)' }}><FiUsers /></div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-label">Active Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232,255,59,0.12)', color: 'var(--accent)' }}><FiCalendar /></div>
          <div className="stat-value">{allAtt.length}</div>
          <div className="stat-label">Total Records</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['mark', 'Mark Attendance'], ['history', 'History']].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'mark' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div className="search-bar" style={{ maxWidth: 340 }}>
              <FiSearch className="search-icon" />
              <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filteredMembers.map(m => {
                const marked = isMarkedToday(m.id);
                const isLoading = marking === m.id;
                return (
                  <div key={m.id} className="card" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
                    border: marked ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                    background: marked ? 'rgba(34,197,94,0.04)' : 'var(--bg-card)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="avatar" />
                      ) : (
                        <div className="avatar">{getInitials(m.name)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.92rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.plan}</div>
                      </div>
                    </div>
                    {marked ? (
                      <span className="badge badge-green"><FiCheckCircle /> In</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMark(m)}
                        disabled={isLoading}
                        style={{ minWidth: 70 }}
                      >
                        {isLoading ? <span className="spinner" style={{width:14,height:14,borderWidth:2}} /> : 'Check In'}
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-icon">👥</div><p>No active members found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {allAtt.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><p>No attendance records</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Member</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {allAtt.slice(0, 100).map(a => {
                    const date = a.date?.toDate ? a.date.toDate() : new Date();
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.memberName}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{format(date, 'dd MMM yyyy')}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{format(date, 'hh:mm a')}</td>
                        <td><span className="badge badge-green">{a.status || 'present'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
