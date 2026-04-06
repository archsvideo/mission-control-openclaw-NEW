import React, { useEffect, useMemo, useState } from 'react';
import { getAgents } from '../services/api';
import type { Agent } from '../types/models';

const shell: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(148,163,184,0.14)',
  background: 'linear-gradient(180deg, rgba(15,23,42,0.88), rgba(2,6,23,0.72))',
  boxShadow: '0 24px 80px rgba(2,6,23,0.34)',
  padding: 20,
  color: '#e2e8f0',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
};

const card: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'rgba(15,23,42,0.48)',
  padding: 16,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  padding: '8px 0',
  color: '#cbd5e1',
  fontSize: 13,
  borderBottom: '1px solid rgba(148,163,184,0.08)',
};

function badge(status: Agent['status']): React.CSSProperties {
  const map = {
    running: { bg: 'rgba(34,197,94,0.18)', color: '#bbf7d0', border: 'rgba(34,197,94,0.3)' },
    idle: { bg: 'rgba(148,163,184,0.16)', color: '#cbd5e1', border: 'rgba(148,163,184,0.22)' },
    paused: { bg: 'rgba(245,158,11,0.16)', color: '#fde68a', border: 'rgba(245,158,11,0.28)' },
    error: { bg: 'rgba(239,68,68,0.16)', color: '#fecaca', border: 'rgba(239,68,68,0.28)' },
  }[status];
  return {
    borderRadius: 999,
    padding: '4px 9px',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: map.bg,
    color: map.color,
    border: `1px solid ${map.border}`,
  };
}

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getAgents()
      .then((rows) => {
        if (!alive) return;
        setAgents(rows);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const active = useMemo(() => agents.filter((agent) => agent.status === 'running' || agent.status === 'idle'), [agents]);
  const inactive = useMemo(() => agents.filter((agent) => agent.status === 'paused' || agent.status === 'error'), [agents]);

  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading agents…</div>;
  if (error) return <section style={shell}><h2 style={{ marginTop: 0 }}>Agents unavailable</h2><p>{error}</p></section>;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={shell}>
        <div style={eyebrow}>Agent fleet</div>
        <h2 style={{ margin: '8px 0 8px', fontSize: 28, color: '#f8fafc' }}>Agents</h2>
        <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>Runtime-backed view of Nova agents. Activos arriba, paused/error abajo.</p>
      </section>

      <section style={shell}>
        <div style={eyebrow}>Active / idle</div>
        <div style={{ ...grid, marginTop: 16 }}>
          {active.map((agent) => (
            <article key={agent.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <strong style={{ fontSize: 18, color: '#f8fafc' }}>{agent.name}</strong>
                <span style={badge(agent.status)}>{agent.status}</span>
              </div>
              <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 13 }}>{agent.role}</div>
              <div style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.55 }}>{agent.description}</div>
              <div style={{ marginTop: 12, display: 'grid' }}>
                <div style={row}><span>Current task</span><strong style={{ color: '#f8fafc' }}>{agent.currentTask}</strong></div>
                <div style={row}><span>Heartbeat</span><strong>{agent.heartbeat}</strong></div>
                <div style={row}><span>Uptime</span><strong>{agent.uptime}</strong></div>
                <div style={row}><span>Tasks done</span><strong>{agent.tasksCompleted}</strong></div>
                <div style={{ ...row, borderBottom: 'none' }}><span>Success rate</span><strong>{agent.successRate}%</strong></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={shell}>
        <div style={eyebrow}>Paused / error</div>
        <div style={{ ...grid, marginTop: 16 }}>
          {inactive.map((agent) => (
            <article key={agent.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <strong style={{ fontSize: 18, color: '#f8fafc' }}>{agent.name}</strong>
                <span style={badge(agent.status)}>{agent.status}</span>
              </div>
              <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 13 }}>{agent.role}</div>
              <div style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.55 }}>{agent.description}</div>
              <div style={{ marginTop: 12, display: 'grid' }}>
                <div style={row}><span>Current task</span><strong style={{ color: '#f8fafc' }}>{agent.currentTask}</strong></div>
                <div style={row}><span>Heartbeat</span><strong>{agent.heartbeat}</strong></div>
                <div style={{ ...row, borderBottom: 'none' }}><span>Last active</span><strong>{agent.lastActive}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
