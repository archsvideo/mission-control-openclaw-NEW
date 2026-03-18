import json
from pathlib import Path
from datetime import datetime

cfg_path = Path(r"C:\Users\Oscar\.openclaw\workspace\trading\paper\config_kraken_paper.json")
out_path = Path(r"C:\Users\Oscar\.openclaw\workspace\trading\paper\setup_summary_2026-03-18.md")

cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
now = datetime.now().strftime("%Y-%m-%d %H:%M")

lines = []
lines.append("# Kraken Paper Trading Setup Summary")
lines.append("")
lines.append(f"Generated: {now}")
lines.append(f"Execution venue: {cfg['execution_venue']}")
lines.append(f"Live orders enabled: {cfg['send_live_orders']}")
lines.append("")
lines.append("## Frozen Bybit intelligence sources")
lines.append(f"- Authoritative: {cfg['frozen_bybit_reference']['authoritative']}")
lines.append(f"- Supplemental: {cfg['frozen_bybit_reference']['supplemental']}")
lines.append("")
lines.append("## Active model weighting")
for m in cfg["source_models"]:
    lines.append(f"- {m['name']}: {m['weight']:.2f} ({m['status']})")
lines.append("")
lines.append("## Risk controls")
lines.append(f"- Max risk per trade: {cfg['risk']['max_risk_per_trade_pct']}%")
lines.append(f"- Max daily drawdown: {cfg['risk']['max_daily_drawdown_pct']}%")
lines.append(f"- Kill switch after consecutive losses: {cfg['risk']['kill_switch_after_consecutive_losses']}")
lines.append("")
lines.append("## Universe")
for p in cfg["universe"]:
    lines.append(f"- {p}")

out_path.write_text("\n".join(lines)+"\n", encoding="utf-8")
print(str(out_path))
