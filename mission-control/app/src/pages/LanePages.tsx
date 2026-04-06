import React, { useEffect, useMemo, useState } from 'react';
import {
  getABHypotheses,
  getCampaigns,
  getCompetitors,
  getContentCalendar,
  getIntegrations,
  getLeads,
  getMemoryEntries,
  getRevitJobs,
  getTimeline,
} from '../services/api';
import type {
  ABHypothesis,
  CampaignCreative,
  CompetitorEntry,
  ContentCalendarItem,
  IntegrationStatus,
  Lead,
  MemoryEntry,
  RevitJob,
  TimelineEvent,
} from '../types/models';

const shell: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(148,163,184,0.14)',
  background: 'linear-gradient(180deg, rgba(15,23,42,0.88), rgba(2,6,23,0.72))',
  boxShadow: '0 24px 80px rgba(2,6,23,0.34)',
  padding: 20,
  color: '#e2e8f0',
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
};

const card: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'rgba(15,23,42,0.48)',
  padding: 16,
};

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: 14,
  background: 'rgba(2,6,23,0.34)',
  border: '1px solid rgba(148,163,184,0.08)',
  color: '#cbd5e1',
};

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={eyebrow}>Mission Control lane</div>
      <h2 style={{ margin: '8px 0 6px', fontSize: 28, color: '#f8fafc' }}>{title}</h2>
      <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>{subtitle}</div>
    </div>
  );
}

function statusPill(label: string, tone: 'green' | 'yellow' | 'red' | 'gray'): React.CSSProperties {
  const map = {
    green: { bg: 'rgba(34,197,94,0.18)', color: '#bbf7d0', border: 'rgba(34,197,94,0.30)' },
    yellow: { bg: 'rgba(245,158,11,0.16)', color: '#fde68a', border: 'rgba(245,158,11,0.28)' },
    red: { bg: 'rgba(239,68,68,0.16)', color: '#fecaca', border: 'rgba(239,68,68,0.28)' },
    gray: { bg: 'rgba(148,163,184,0.14)', color: '#cbd5e1', border: 'rgba(148,163,184,0.24)' },
  }[tone];
  return {
    borderRadius: 999,
    padding: '4px 9px',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: map.bg,
    color: map.color,
    border: `1px solid ${map.border}`,
  };
}

function healthTone(health: IntegrationStatus['health']) {
  if (health === 'healthy') return 'green';
  if (health === 'degraded') return 'yellow';
  if (health === 'down') return 'red';
  return 'gray';
}

function severityTone(severity: TimelineEvent['severity']) {
  if (severity === 'success') return 'green';
  if (severity === 'warning') return 'yellow';
  if (severity === 'error') return 'red';
  return 'gray';
}

function useAsyncData<T>(loader: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loader()
      .then((res) => {
        if (!alive) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load lane');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, deps);

  return { data, loading, error };
}

export function LeadsPage() {
  const { data, loading, error } = useAsyncData<Lead[]>(() => getLeads(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading leads…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Leads unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Leads" subtitle="CRM operativo con owner, stage y siguiente acción visible." />
      <div style={grid}>
        {data.map((lead) => (
          <article key={lead.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <strong style={{ fontSize: 18, color: '#f8fafc' }}>{lead.name}</strong>
              <span style={statusPill(lead.stage, lead.stage === 'won' ? 'green' : lead.stage === 'lost' ? 'red' : 'yellow')}>{lead.stage}</span>
            </div>
            <div style={{ marginTop: 6, color: '#94a3b8' }}>{lead.company} · {lead.source}</div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <div style={row}><span>Owner</span><strong>{lead.owner}</strong></div>
              <div style={row}><span>Score</span><strong>{lead.score}</strong></div>
              <div style={row}><span>Booking</span><strong>{lead.bookingStatus}</strong></div>
              <div style={row}><span>Next action</span><strong>{lead.nextAction}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SkylightCROPage() {
  const campaignsState = useAsyncData<CampaignCreative[]>(() => getCampaigns(), []);
  const hypothesesState = useAsyncData<ABHypothesis[]>(() => getABHypotheses(), []);
  if (campaignsState.loading || hypothesesState.loading) return <div style={{ color: '#cbd5e1' }}>Loading Skylight CRO…</div>;
  if (campaignsState.error || !campaignsState.data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Skylight CRO unavailable</h2><p>{campaignsState.error}</p></section>;
  const campaigns = campaignsState.data;
  const hypotheses = hypothesesState.data ?? [];
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={shell}>
        <SectionHeader title="Skylight CRO" subtitle="Campañas Meta y experimentos, consumiendo `getCampaigns()` y mostrando recommendation visible." />
        <div style={grid}>
          {campaigns.map((campaign) => (
            <article key={campaign.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <strong style={{ color: '#f8fafc' }}>{campaign.name}</strong>
                <span style={statusPill(campaign.status, campaign.status === 'active' ? 'green' : campaign.status === 'paused' ? 'yellow' : 'gray')}>{campaign.platform}</span>
              </div>
              <div style={{ marginTop: 8, color: '#94a3b8' }}>ROAS {campaign.roas.toFixed(2)} · CPA {campaign.cpa.toFixed(2)} · CTR {campaign.ctr.toFixed(2)}%</div>
              <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: 'rgba(2,6,23,0.34)', border: '1px solid rgba(148,163,184,0.08)', color: '#e2e8f0', lineHeight: 1.55 }}>
                {campaign.recommendation}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section style={shell}>
        <div style={eyebrow}>Experiments</div>
        <div style={{ ...grid, marginTop: 16 }}>
          {hypotheses.map((hypothesis) => (
            <article key={hypothesis.id} style={card}>
              <strong style={{ color: '#f8fafc' }}>{hypothesis.name}</strong>
              <div style={{ marginTop: 8, color: '#cbd5e1', lineHeight: 1.55 }}>{hypothesis.hypothesis}</div>
              <div style={{ marginTop: 10, color: '#94a3b8' }}>{hypothesis.metric} · {hypothesis.variant}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function RadarPage() {
  const { data, loading, error } = useAsyncData<CompetitorEntry[]>(() => getCompetitors(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading radar…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Radar unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Radar" subtitle="Competidores y patrones que vale la pena replicar o vigilar." />
      <div style={grid}>
        {data.map((entry) => (
          <article key={entry.id} style={card}>
            <strong style={{ color: '#f8fafc' }}>{entry.platform}</strong>
            <div style={{ marginTop: 8, color: '#cbd5e1' }}>{entry.pattern}</div>
            <div style={{ marginTop: 10, color: '#94a3b8' }}>{entry.hookType} · {entry.format} · engagement {entry.engagement}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RevitPage() {
  const { data, loading, error } = useAsyncData<RevitJob[]>(() => getRevitJobs(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading Revit queue…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Revit unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Revit" subtitle="Cola de automatización y estado de jobs." />
      <div style={grid}>
        {data.map((job) => (
          <article key={job.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <strong style={{ color: '#f8fafc' }}>{job.name}</strong>
              <span style={statusPill(job.status, job.status === 'completed' ? 'green' : job.status === 'failed' ? 'red' : 'yellow')}>{job.status}</span>
            </div>
            <div style={{ marginTop: 8, color: '#94a3b8' }}>{job.template} · runtime {job.runtime}s</div>
            <div style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.55 }}>{job.logs[job.logs.length - 1] ?? 'No logs yet'}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function IntegrationsPage() {
  const { data, loading, error } = useAsyncData<IntegrationStatus[]>(() => getIntegrations(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading integrations…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Integrations unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Integrations" subtitle="Estado real de servicios con health badge, lastError y message visibles." />
      <div style={grid}>
        {data.map((integration) => (
          <article key={integration.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <strong style={{ color: '#f8fafc' }}>{integration.name}</strong>
              <span style={statusPill(integration.health, healthTone(integration.health))}>{integration.health}</span>
            </div>
            <div style={{ marginTop: 8, color: '#94a3b8' }}>Last sync: {integration.lastSync || '—'} · latency {integration.latency}ms</div>
            <div style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.55 }}>{integration.message}</div>
            <div style={{ marginTop: 10, color: '#fca5a5', lineHeight: 1.55 }}>{integration.lastError || 'No last error'}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TimelinePage() {
  const { data, loading, error } = useAsyncData<TimelineEvent[]>(() => getTimeline(), []);
  const ordered = useMemo(() => [...(data ?? [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [data]);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading timeline…</div>;
  if (error || !ordered) return <section style={shell}><h2 style={{ marginTop: 0 }}>Timeline unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Timeline" subtitle="Eventos ordenados por timestamp con severidad visual y subtítulo de descripción." />
      <div style={{ display: 'grid', gap: 10 }}>
        {ordered.map((event) => (
          <article key={event.id} style={{ ...card, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <strong style={{ color: '#f8fafc' }}>{event.title}</strong>
              <span style={statusPill(event.severity, severityTone(event.severity))}>{event.severity}</span>
            </div>
            <div style={{ marginTop: 8, color: '#94a3b8' }}>{event.description}</div>
            <div style={{ marginTop: 10, color: '#cbd5e1' }}>{event.type}</div>
            <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 12 }}>{event.timestamp}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MemoryPage() {
  const { data, loading, error } = useAsyncData<MemoryEntry[]>(() => getMemoryEntries(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading memory…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Memory unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Memory" subtitle="Entradas de memoria duradera y decisiones relevantes." />
      <div style={grid}>
        {data.map((entry) => (
          <article key={entry.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <strong style={{ color: '#f8fafc' }}>{entry.title}</strong>
              <span style={statusPill(entry.type, 'gray')}>{entry.type}</span>
            </div>
            <div style={{ marginTop: 10, color: '#cbd5e1', lineHeight: 1.55 }}>{entry.content}</div>
            <div style={{ marginTop: 10, color: '#94a3b8' }}>{entry.date}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SettingsPage() {
  return (
    <section style={shell}>
      <SectionHeader title="Settings" subtitle="Vista operativa de configuración y guardrails del sistema." />
      <div style={grid}>
        <article style={card}>
          <strong style={{ color: '#f8fafc' }}>Routing</strong>
          <div style={{ marginTop: 10, color: '#cbd5e1', lineHeight: 1.55 }}>Lane routing por account-lane de Telegram, con Core / Meta / Studio / Trade separados.</div>
        </article>
        <article style={card}>
          <strong style={{ color: '#f8fafc' }}>Deploy</strong>
          <div style={{ marginTop: 10, color: '#cbd5e1', lineHeight: 1.55 }}>Mission Control corre desde branch limpia conectada a Lovable con GitHub como source of truth.</div>
        </article>
        <article style={card}>
          <strong style={{ color: '#f8fafc' }}>Guardrails</strong>
          <div style={{ marginTop: 10, color: '#cbd5e1', lineHeight: 1.55 }}>No tocar `api.ts`, `models.ts` ni `nova-to-ui.ts`; consumir exports existentes y validar build tras cada cambio.</div>
        </article>
      </div>
    </section>
  );
}

export function StudioPage() {
  const { data, loading, error } = useAsyncData<ContentCalendarItem[]>(() => getContentCalendar(), []);
  if (loading) return <div style={{ color: '#cbd5e1' }}>Loading Studio…</div>;
  if (error || !data) return <section style={shell}><h2 style={{ marginTop: 0 }}>Studio unavailable</h2><p>{error}</p></section>;
  return (
    <section style={shell}>
      <SectionHeader title="Studio" subtitle="Calendario y estado de contenido para la capa visual/productiva." />
      <div style={grid}>
        {data.map((item) => (
          <article key={item.id} style={card}>
            <strong style={{ color: '#f8fafc' }}>{item.title}</strong>
            <div style={{ marginTop: 8, color: '#94a3b8' }}>{item.date} · {item.channel} · {item.owner}</div>
            <div style={{ marginTop: 10, color: '#cbd5e1' }}>{item.notes || 'No notes'}</div>
            <div style={{ marginTop: 10 }}><span style={statusPill(item.status, item.status === 'done' ? 'green' : item.status === 'blocked' ? 'red' : 'yellow')}>{item.status}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
