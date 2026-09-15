import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, ShieldAlert, CheckCircle } from 'lucide-react';

export default function GoldenSetView() {
  const [goldenData, setGoldenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('ALL');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/golden-set')
      .then((res) => res.json())
      .then((data) => {
        setGoldenData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const intentsList = ['ALL', ...new Set(goldenData.map((d) => d.intent).filter(Boolean))];

  const filteredData = goldenData.filter((item) => {
    const matchesSearch =
      item.text_query?.toLowerCase().includes(search.toLowerCase()) ||
      item.tweet_id?.toString().includes(search);
    const matchesIntent = selectedIntent === 'ALL' || item.intent === selectedIntent;
    return matchesSearch && matchesIntent;
  });

  return (
    <div className="glass-panel" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Database size={22} color="var(--apple-purple)" />
          <div>
            <h2 style={styles.title}>Golden Evaluation Dataset Inspector ({goldenData.length} Cases)</h2>
            <p style={styles.subtitle}>
              Human & heuristic verified evaluation cases stored in <code>backend/data/golden_set.csv</code>
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div style={styles.controlsRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="var(--text-secondary)" />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search query or Tweet ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.filterGroup}>
            <Filter size={15} color="var(--text-secondary)" />
            <select
              style={styles.selectInput}
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
            >
              {intentsList.map((intent) => (
                <option key={intent} value={intent}>
                  {intent === 'ALL' ? 'All Intents' : intent}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading Golden Set data...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tweet ID</th>
                <th style={styles.th}>Customer Question Query</th>
                <th style={styles.th}>Classified Intent</th>
                <th style={styles.th}>Escalation</th>
                <th style={styles.th}>Reason / Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map((row, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.tdId}>{row.tweet_id}</td>
                  <td style={styles.tdQuery}>{row.text_query}</td>
                  <td style={styles.tdIntent}>
                    <span className="badge-pill badge-blue">{row.intent}</span>
                  </td>
                  <td style={styles.tdEscalate}>
                    {row.escalate === true || row.escalate === 'True' || row.escalate === 'true' ? (
                      <span className="badge-pill badge-amber">
                        <ShieldAlert size={12} /> Yes
                      </span>
                    ) : (
                      <span className="badge-pill badge-green">
                        <CheckCircle size={12} /> No
                      </span>
                    )}
                  </td>
                  <td style={styles.tdReason}>{row.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={styles.empty}>No golden set cases match your search filter.</div>
          )}
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
    marginBottom: '20px',
    borderBottom: '1px solid var(--panel-border)',
    paddingBottom: '16px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  controlsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '8px 14px',
    flex: 1,
    minWidth: '240px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '0.88rem',
    width: '100%'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '8px 14px'
  },
  selectInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  tableWrapper: {
    maxHeight: '480px',
    overflowY: 'auto',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem'
  },
  th: {
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    borderBottom: '1px solid var(--panel-border)'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tdId: {
    padding: '12px 16px',
    color: 'var(--apple-cyan)',
    fontFamily: 'monospace'
  },
  tdQuery: {
    padding: '12px 16px',
    color: '#fff',
    maxWidth: '380px'
  },
  tdIntent: {
    padding: '12px 16px'
  },
  tdEscalate: {
    padding: '12px 16px'
  },
  tdReason: {
    padding: '12px 16px',
    color: 'var(--text-secondary)'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)'
  },
  empty: {
    textAlign: 'center',
    padding: '30px',
    color: 'var(--text-secondary)'
  }
};
