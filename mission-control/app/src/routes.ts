export const routes = [
  { key: 'control-tower', path: '/control-tower', label: 'Control Tower', status: 'live', blurb: 'Executive command deck wired to the merged snapshot.' },
  { key: 'agents', path: '/agents', label: 'Agents', status: 'live', blurb: 'Runtime-backed fleet view for Nova operators.' },
  { key: 'trading', path: '/trading', label: 'Trading Ops Console', status: 'live', blurb: 'Paper/demo posture, risk state, and execution health.' },
  { key: 'leads', path: '/leads', label: 'Lead-to-Meeting OS', status: 'scaffold', blurb: 'UI lane reserved; still needs live intake and CRM contracts.' },
  { key: 'skylight-cro', path: '/skylight-cro', label: 'Skylight CRO Lab', status: 'scaffold', blurb: 'Future conversion experiments and landing page tests.' },
  { key: 'radar', path: '/radar', label: 'Competitor Radar', status: 'scaffold', blurb: 'Research lane exists, but not yet wired to fresh feeds.' },
  { key: 'revit', path: '/revit-queue', label: 'Revit Automation Queue', status: 'scaffold', blurb: 'Queue shell only; autonomous Revit jobs still need a live bridge.' },
  { key: 'integrations', path: '/integrations', label: 'Integrations', status: 'partial', blurb: 'Connected in parts, but not fully hardened end-to-end.' },
  { key: 'timeline', path: '/timeline', label: 'Timeline', status: 'partial', blurb: 'Event view exists; still needs richer filtering and context.' },
  { key: 'memory', path: '/memory', label: 'Memory', status: 'scaffold', blurb: 'Reserved for durable recall and source-of-truth inspection.' },
  { key: 'settings', path: '/settings', label: 'Settings', status: 'scaffold', blurb: 'Control surface planned; config edits still external.' }
] as const;
