# Mission Control App (GitHub-first)

This folder is the source-of-truth codebase for the Mission Control web app.

## Stack (recommended)
- React + TypeScript
- Vite
- Tailwind (optional)
- Zod/Ajv for contract validation

## Current status
- Core architecture and modules are scaffolded
- Domain contracts imported from `../contracts`
- Mock service layer prepared for later API wiring

## Modules
- Control Tower
- Trading Ops Console
- Lead-to-Meeting OS
- Skylight CRO Lab
- Competitor Radar
- Revit Automation Queue
- Integrations
- Timeline
- Memory
- Settings

## Next steps
1. `npm create vite@latest mission-control-web -- --template react-ts`
2. Move `src/*` from this scaffold into Vite app
3. Install deps (`zod`, `ajv`, `react-router-dom`)
4. Wire real data adapters (`trading/paper`, `reports/meta-*`, GA4/GTM/Gmail APIs)
5. Push to GitHub and connect Lovable for visual editing only
