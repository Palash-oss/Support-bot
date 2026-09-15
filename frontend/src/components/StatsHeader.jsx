import React from 'react';
import { Database, FileCode2, Sparkles, Network } from 'lucide-react';

export default function StatsHeader({ stats }) {
  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.iconBox}>
          <Database size={20} color="var(--apple-cyan)" />
        </div>
        <div>
          <div style={styles.statVal}>{stats?.pairs_count ? stats.pairs_count.toLocaleString() : '8,000'}</div>
          <div style={styles.statLbl}>RAG Embedded Query-Reply Pairs</div>
        </div>
      </div>

      <div className="glass-card" style={styles.card}>
        <div style={styles.iconBox}>
          <FileCode2 size={20} color="var(--apple-purple)" />
        </div>
        <div>
          <div style={styles.statVal}>{stats?.golden_set_size || '200'}</div>
          <div style={styles.statLbl}>Golden Evaluation Cases Labeled</div>
        </div>
      </div>

      <div className="glass-card" style={styles.card}>
        <div style={styles.iconBox}>
          <Network size={20} color="var(--apple-green)" />
        </div>
        <div>
          <div style={styles.statVal}>384 Dim</div>
          <div style={styles.statLbl}>{stats?.embedding_model || 'all-MiniLM-L6-v2'}</div>
        </div>
      </div>

      <div className="glass-card" style={styles.card}>
        <div style={styles.iconBox}>
          <Sparkles size={20} color="var(--apple-amber)" />
        </div>
        <div>
          <div style={styles.statVal}>{stats?.intents_count || '8'} Intents</div>
          <div style={styles.statLbl}>Taxonomy Intent Classifier</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px'
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statVal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff'
  },
  statLbl: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  }
};
