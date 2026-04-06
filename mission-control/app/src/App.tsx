import React, { useEffect, useMemo, useState } from 'react';
import { ControlTowerPage } from './pages/ControlTowerPage';
import { TradingOpsPage } from './pages/TradingOpsPage';
import { routes } from './routes';

const shell: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top, rgba(30,41,59,0.95) 0%, #0f172a 36%, #020617 100%)',
  color: '#f8fafc',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
};

const frame: React.CSSProperties = {
  width: 'min(1480px, calc(100vw - 32px))',
  margin: '0 auto',
  padding: '28px 0 44px',
};

const navButton = (selected: boolean): React.CSSProperties => ({
  borderRadius: 999,
  border: `1px solid ${selected ? 'rgba(96,165,250,0.55)' : 'rgba(148,163,184,0.18)'}`,
  background: selected ? 'linear-gradient(180deg, rgba(37,99,235,0.24), rgba(37,99,235,0.14))' : 'rgba(15,23,42,0.55)',
  color: selected ? '#dbeafe' : '#cbd5e1',
  padding: '10px 16px',
  cursor: 'pointer',
  boxShadow: selected ? '0 0 0 1px rgba(96,165,250,0.15) inset' : 'none',
});

const shellCard: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'linear-gradient(180deg, rgba(2,6,23,0.62), rgba(2,6,23,0.28))',
  padding: 18,
  boxShadow: '0 24px 80px rgba(2,6,23,0.32)',
  backdropFilter: 'blur(14px)',
  position: 'relative',
  overflow: 'hidden',
};

const brandMarkWrap: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 18,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(180deg, rgba(37,99,235,0.28), rgba(14,165,233,0.18))',
  border: '1px solid rgba(96,165,250,0.4)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px rgba(2,6,23,0.28)',
};

const brandMarkCore: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: '#e0f2fe',
  letterSpacing: '-0.06em',
};

const statusPill: React.CSSProperties = {
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#dbeafe',
  background: 'rgba(37,99,235,0.18)',
  border: '1px solid rgba(96,165,250,0.35)',
};

const headerGlow: React.CSSProperties = {
  position: 'absolute',
  inset: '-120px auto auto -80px',
  width: 320,
  height: 320,
  borderRadius: 999,
  background: 'radial-gradient(circle, rgba(59,130,246,0.18), rgba(59,130,246,0))',
  pointerEvents: 'none',
};

const comingSoonCard: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'rgba(15,23,42,0.46)',
};

const comingSoonLabel: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: 8,
};

type ViewKey = typeof routes[number]['key'];
type RouteStatus = typeof routes[number]['status'];

const routeMap = Object.fromEntries(routes.map((route) => [route.key, route]));

function getInitialView(): ViewKey {
  if (typeof window === 'undefined') return 'control-tower';
  const fromHash = window.location.hash.replace('#', '');
  const fromPath = window.location.pathname.replace(/^\//, '');
  const pathMatch = routes.find((route) => route.path.replace(/^\//, '') === fromPath);
  if (fromHash && fromHash in routeMap) return fromHash as ViewKey;
  if (pathMatch) return pathMatch.key;
  return 'control-tower';
}

function routeStatusStyle(status: RouteStatus): React.CSSProperties {
  if (status === 'live') return { background: 'rgba(34,197,94,0.16)', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.28)' };
  if (status === 'partial') return { background: 'rgba(245,158,11,0.16)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.28)' };
  return { background: 'rgba(148,163,184,0.14)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.2)' };
}

function ShellMetric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <div style={{ padding: 14, borderRadius: 18, border: '1px solid rgba(148,163,184,0.12)', background: 'linear-gradient(180deg, rgba(15,23,42,0.62), rgba(15,23,42,0.38))' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 24, fontWeight: 700, color: tone }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<ViewKey>(getInitialView);

  useEffect(() => {
    const onHashChange = () => setView(getInitialView());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);

  const activeRoute = useMemo(() => routes.find((route) => route.key === view) ?? routes[0], [view]);
  const liveCount = routes.filter((route) => route.status === 'live').length;
  const partialCount = routes.filter((route) => route.status === 'partial').length;
  const scaffoldCount = routes.filter((route) => route.status === 'scaffold').length;

  function navigate(next: ViewKey) {
    setView(next);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `${routeMap[next].path}#${next}`);
    }
  }

  return (
    <main style={shell}>
      <div style={frame}>
        <header style={{ ...shellCard, display: 'grid', gap: 18, marginBottom: 24 }}>
          <div style={headerGlow} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={brandMarkWrap}>
                <div style={brandMarkCore}>N</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>ARCH-S Mission Control</div>
                <h1 style={{ margin: '8px 0 6px', fontSize: 30 }}>Ops center / GitHub-first control surface</h1>
                <div style={{ color: '#94a3b8', fontSize: 14, maxWidth: 760 }}>Executive shell first, live snapshot underneath. The goal is simple: make every lane readable and operational, not dead tabs.</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
              <span style={statusPill}>4-agent core</span>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Nova Main · Meta · Trade · Studio</div>
            </div>
          </div>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, position: 'relative' }}>
            <ShellMetric label="Live lanes" value={String(liveCount)} tone="#22c55e" detail="Already wired to runtime data" />
            <ShellMetric label="Partial lanes" value={String(partialCount)} tone="#f59e0b" detail="Connected in parts, still needs hardening" />
            <ShellMetric label="Scaffold lanes" value={String(scaffoldCount)} tone="#94a3b8" detail="Reserved surface, but still intentionally distinct" />
            <ShellMetric label="Focused lane" value={activeRoute.label} tone="#60a5fa" detail={activeRoute.blurb} />
          </section>
          <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
            {routes.map((route) => (
              <button key={route.key} style={{ ...navButton(view === route.key), display: 'grid', gap: 6, minWidth: 190, textAlign: 'left' }} onClick={() => navigate(route.key)}>
                <span>{route.label}</span>
                <span style={{ width: 'fit-content', borderRadius: 999, padding: '3px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', ...routeStatusStyle(route.status) }}>
                  {route.status}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{route.blurb}</span>
              </button>
            ))}
          </nav>
        </header>
        {view === 'control-tower' ? <ControlTowerPage /> : view === 'trading' ? <TradingOpsPage /> : <LaneModule route={activeRoute} />}
      </div>
    </main>
  );
}

function LaneModule({ route }: { route: typeof routes[number] }) {
  const laneNotes: Record<string, { objective: string; data: string[]; actions: string[] }> = {
    leads: {
      objective: 'Centralizar captación, clasificación y siguiente acción comercial.',
      data: ['Inbox/page leads', 'lead scoring', 'meeting status', 'follow-up ownership'],
      actions: ['Review new leads', 'Escalate hot prospects', 'Check meeting pipeline'],
    },
    'skylight-cro': {
      objective: 'Convertir Skylight en laboratorio de landing, hook y CTA.',
      data: ['Page variants', 'conversion notes', 'creative hypotheses', 'top blockers'],
      actions: ['Review current hypothesis', 'Compare page variants', 'Queue next CRO pass'],
    },
    radar: {
      objective: 'Ver competidores, patrones virales y referencias accionables.',
      data: ['Tracked competitors', 'reference posts', 'winning hooks', 'content gaps'],
      actions: ['Open latest references', 'Compare top patterns', 'Queue next research sweep'],
    },
    revit: {
      objective: 'Supervisar cola de automatización Revit y estado de jobs.',
      data: ['Queued jobs', 'bridge health', 'latest outputs', 'failure reasons'],
      actions: ['Inspect queue', 'Retry failed job', 'Open latest output'],
    },
    integrations: {
      objective: 'Vigilar las conexiones del sistema y su estado operativo.',
      data: ['Telegram', 'GitHub', 'Mission Control snapshots', 'browser bridge'],
      actions: ['Check connector health', 'Review broken links', 'Refresh integration map'],
    },
    timeline: {
      objective: 'Leer el histórico operativo en orden y por contexto.',
      data: ['Cross-domain events', 'priority changes', 'alerts', 'recaps'],
      actions: ['Filter by lane', 'Jump to latest material event', 'Open executive recap'],
    },
    memory: {
      objective: 'Consultar memoria útil y fuentes de verdad del sistema.',
      data: ['Durable memory', 'operating rules', 'preferences', 'recent learnings'],
      actions: ['Inspect durable memory', 'Review latest learnings', 'Open source artifacts'],
    },
    settings: {
      objective: 'Configurar topología, routing y comportamiento operativo.',
      data: ['Routing rules', 'agent lanes', 'guardrails', 'publish/runtime options'],
      actions: ['Review lane config', 'Open routing policy', 'Inspect system guardrails'],
    },
  };

  const lane = laneNotes[route.key] ?? {
    objective: route.blurb,
    data: ['Pending contracts', 'Pending UI', 'Pending runtime binding'],
    actions: ['Review lane', 'Define contract', 'Implement next step'],
  };

  return (
    <section style={{ ...shellCard, color: '#e2e8f0' }}>
      <div style={headerGlow} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Lane module</div>
          <span style={{ width: 'fit-content', borderRadius: 999, padding: '4px 9px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', ...routeStatusStyle(route.status) }}>
            {route.status}
          </span>
        </div>
        <h2 style={{ margin: '10px 0 10px', fontSize: 28 }}>{route.label}</h2>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7, maxWidth: 900 }}>{lane.objective}</p>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginTop: 20 }}>
          <div style={comingSoonCard}>
            <div style={comingSoonLabel}>Lane path</div>
            <div style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700 }}>{route.path}</div>
            <div style={{ marginTop: 8, color: '#94a3b8', lineHeight: 1.5 }}>Ahora cada tab tiene identidad visual y ruta propia para que no parezca que se queda clavada en Control Tower.</div>
          </div>
          <div style={comingSoonCard}>
            <div style={comingSoonLabel}>Data expected</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {lane.data.map((item) => (
                <div key={item} style={rowChip}>{item}</div>
              ))}
            </div>
          </div>
          <div style={comingSoonCard}>
            <div style={comingSoonLabel}>Operator actions</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {lane.actions.map((item) => (
                <div key={item} style={rowChip}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const rowChip: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'rgba(2,6,23,0.34)',
  padding: '10px 12px',
  color: '#cbd5e1',
  lineHeight: 1.45,
};
