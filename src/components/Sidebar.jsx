// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiGrid, FiUsers, FiUserCheck, FiCreditCard,
  FiClipboard, FiCalendar, FiLogOut, FiZap
} from 'react-icons/fi';

const nav = [
  { to: '/dashboard',   icon: <FiGrid />,      label: 'Dashboard'   },
  { to: '/members',     icon: <FiUsers />,     label: 'Members'     },
  { to: '/trainers',    icon: <FiUserCheck />, label: 'Trainers'    },
  { to: '/payments',    icon: <FiCreditCard />,label: 'Payments'    },
  { to: '/diet-plans',  icon: <FiClipboard />, label: 'Diet Plans'  },
  { to: '/attendance',  icon: <FiCalendar />,  label: 'Attendance'  },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>
        <div style={styles.logo}><FiZap /></div>
        <div>
          <div style={styles.logoName}>RK FITNESS</div>
          <div style={styles.logoSub}>Vasagade, Kolhapur</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.userRow}>
          <div style={styles.userAvatar}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Admin</div>
            <div style={styles.userEmail} title={user?.email}>{user?.email}</div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}

const styles = {
  aside: {
    width: 'var(--sidebar-width)', background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 100, padding: '20px 0',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 18px 20px',
    borderBottom: '1px solid var(--border)',
    marginBottom: 12,
  },
  logo: {
    width: 34, height: 34, borderRadius: 8,
    background: 'var(--accent)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#0a0a0a', fontSize: '1rem', flexShrink: 0,
  },
  logoName: { fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.08em' },
  logoSub: { fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8,
    fontSize: '0.88rem', fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'var(--transition)',
  },
  navItemActive: {
    background: 'var(--accent-dim)', color: 'var(--accent)',
    borderLeft: '2px solid var(--accent)',
  },
  navIcon: { display: 'flex', fontSize: '1rem', flexShrink: 0 },
  bottom: {
    padding: '16px 12px 0',
    borderTop: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  userRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent-dim)', color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', fontSize: '0.9rem', flexShrink: 0,
  },
  userInfo: { minWidth: 0 },
  userName: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' },
  userEmail: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderRadius: 8,
    fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
    transition: 'var(--transition)', width: '100%',
  },
};
