import React from 'react';
import { MessageSquare, Layers, Database, ShieldAlert, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  return (
    <header style={styles.navbar} className="glass-panel">
      <div style={styles.brandGroup}>
        <div style={styles.logoBadge} className="pulse-active">
          <Cpu size={22} color="#0071e3" />
        </div>
        <div>
          <div style={styles.brandTitle}>
            Apple Support <span style={styles.brandGradient}>AI Agent</span>
          </div>
          <div style={styles.brandSubtitle}>RAG Vector Engine & Intent Classifier</div>
        </div>
      </div>

      <nav style={styles.navLinks}>
        <button
          style={{
            ...styles.navBtn,
            ...(activeTab === 'chat' ? styles.activeNavBtn : {})
          }}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} /> Support Assistant
        </button>

        <button
          style={{
            ...styles.navBtn,
            ...(activeTab === 'taxonomy' ? styles.activeNavBtn : {})
          }}
          onClick={() => setActiveTab('taxonomy')}
        >
          <Layers size={16} /> Intent Taxonomy ({stats?.intents_count || 8})
        </button>

        <button
          style={{
            ...styles.navBtn,
            ...(activeTab === 'golden' ? styles.activeNavBtn : {})
          }}
          onClick={() => setActiveTab('golden')}
        >
          <Database size={16} /> Golden Dataset ({stats?.golden_set_size || 200})
        </button>
      </nav>

      <div style={styles.statusGroup}>
        <span className="badge-pill badge-green">
          <span style={styles.statusDot}></span> Backend API Online
        </span>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    marginBottom: '20px',
    borderRadius: '16px'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(0, 113, 227, 0.12)',
    border: '1px solid rgba(0, 113, 227, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff'
  },
  brandGradient: {
    background: 'linear-gradient(135deg, #29d8ff, #0071e3)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  brandSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)'
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeNavBtn: {
    background: 'var(--apple-blue)',
    color: '#fff',
    boxShadow: '0 4px 12px var(--apple-blue-glow)'
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--apple-green)'
  }
};
