import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Tag, Info } from 'lucide-react';

export default function TaxonomyView() {
  const [taxonomy, setTaxonomy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/taxonomy')
      .then((res) => res.json())
      .then((data) => {
        setTaxonomy(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getBadgeClass = (index) => {
    const classes = ['badge-blue', 'badge-purple', 'badge-green', 'badge-amber', 'badge-red'];
    return classes[index % classes.length];
  };

  return (
    <div className="glass-panel" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Layers size={22} color="var(--apple-cyan)" />
          <div>
            <h2 style={styles.title}>Intent Taxonomy Definition Matrix</h2>
            <p style={styles.subtitle}>
              The 8 single-source-of-truth intent categories defined in <code>backend/taxonomy.yaml</code>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading taxonomy definitions...</div>
      ) : (
        <div style={styles.grid}>
          {taxonomy.map((item, idx) => (
            <div key={item.name} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <span className={`badge-pill ${getBadgeClass(idx)}`}>
                  <Tag size={12} /> #{idx + 1}
                </span>
                <span style={styles.intentName}>{item.name}</span>
              </div>

              <p style={styles.description}>{item.description}</p>

              <div style={styles.cardFooter}>
                <span style={styles.sourceLbl}>
                  <ShieldCheck size={13} color="var(--apple-green)" /> Verified Intent Category
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    minHeight: '600px'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid var(--panel-border)',
    paddingBottom: '16px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px'
  },
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  intentName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace'
  },
  description: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  cardFooter: {
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  sourceLbl: {
    fontSize: '0.78rem',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  loading: {
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '40px'
  }
};
