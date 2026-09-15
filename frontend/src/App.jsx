import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsHeader from './components/StatsHeader';
import ChatView from './components/ChatView';
import TaxonomyView from './components/TaxonomyView';
import GoldenSetView from './components/GoldenSetView';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Stats API error:', err));
  }, []);

  return (
    <div style={styles.appWrapper}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      <StatsHeader stats={stats} />

      <main style={styles.mainContent}>
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'taxonomy' && <TaxonomyView />}
        {activeTab === 'golden' && <GoldenSetView />}
      </main>

      <footer style={styles.footer}>
        Apple Support Bot • Grounded Vector RAG & Intent Classification System
      </footer>
    </div>
  );
}

const styles = {
  appWrapper: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1
  },
  footer: {
    textAlign: 'center',
    padding: '20px 0 10px',
    fontSize: '0.78rem',
    color: 'var(--text-dim)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '20px'
  }
};
