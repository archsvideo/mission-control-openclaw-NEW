export const routes = [
  { key: 'control-tower', path: '/control-tower', label: 'Control Tower', status: 'live', blurb: 'Executive command deck wired to the merged snapshot.' },
  { key: 'agents', path: '/agents', label: 'Agents', status: 'live', blurb: 'Runtime-backed fleet view for Nova operators.' },
  { key: 'trading', path: '/trading', label: 'Trading Ops Console', status: 'live', blurb: 'Paper/demo posture, risk state, and execution health.' },
  { key: 'leads', path: '/leads', label: 'Lead-to-Meeting OS', status: 'live', blurb: 'Lead intake, scoring and next commercial actions.' },
  { key: 'skylight-cro', path: '/skylight-cro', label: 'Skylight CRO Lab', status: 'live', blurb: 'Meta campaigns and conversion experiments powered by existing API exports.' },
  { key: 'radar', path: '/radar', label: 'Competitor Radar', status: 'live', blurb: 'Competitor references and pattern tracking.' },
  { key: 'revit', path: '/revit-queue', label: 'Revit Automation Queue', status: 'live', blurb: 'Queue and status view for Revit automation jobs.' },
  { key: 'integrations', path: '/integrations', label: 'Integrations', status: 'live', blurb: 'Health, errors and status for service integrations.' },
  { key: 'timeline', path: '/timeline', label: 'Timeline', status: 'live', blurb: 'Operational event feed with severity cues.' },
  { key: 'memory', path: '/memory', label: 'Memory', status: 'live', blurb: 'Durable recall and decision layer.' },
  { key: 'settings', path: '/settings', label: 'Settings', status: 'live', blurb: 'Operational settings and system guardrails.' }
] as const;
