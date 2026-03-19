import csv
import json
from pathlib import Path
from datetime import datetime
import requests

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
CFG = ROOT / "trading" / "paper" / "config_kraken_paper.json"
STATE = ROOT / "trading" / "paper" / "state.json"
LOG = ROOT / "trading" / "paper" / "trade_log.csv"
OUT = ROOT / "reports" / "paper-dashboard.html"


def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def read_trades(path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    return rows


def parse_float(v, d=0.0):
    try:
        return float(v)
    except:
        return d


def normalize_pair(pair: str) -> str:
    p = pair.replace("/", "").upper()
    return {"XBTUSD":"XXBTZUSD","BTCUSD":"XXBTZUSD","ETHUSD":"XETHZUSD","SOLUSD":"SOLUSD"}.get(p,p)


def fetch_price(pair):
    kp = normalize_pair(pair)
    url = "https://api.kraken.com/0/public/Ticker"
    r = requests.get(url, params={"pair": kp}, timeout=15)
    j = r.json()
    if j.get("error"):
        return None
    k = next(iter(j["result"].keys()))
    return float(j["result"][k]["c"][0])

cfg = load_json(CFG, {})
state = load_json(STATE, {"equity":10000.0,"open_positions":[]})
trades = read_trades(LOG)

closed = [t for t in trades if t.get("exit")]
wins = [t for t in closed if parse_float(t.get("net_pnl")) > 0]
loss = [t for t in closed if parse_float(t.get("net_pnl")) < 0]
win_rate = (len(wins)/len(closed)*100) if closed else 0
profit_factor = (sum(parse_float(t.get("net_pnl")) for t in wins) / abs(sum(parse_float(t.get("net_pnl")) for t in loss))) if loss else (999 if wins else 0)
avg_r = (sum(parse_float(t.get("pnl_r")) for t in closed)/len(closed)) if closed else 0

pairs = cfg.get("universe", [])
prices = []
for p in pairs:
    pr = fetch_price(p)
    prices.append((p, pr))

rows = "\n".join([
    f"<tr><td>{t.get('timestamp','')}</td><td>{t.get('source_trader_model','')}</td><td>{t.get('pair','')}</td><td>{t.get('direction','')}</td><td>{t.get('entry','')}</td><td>{t.get('stop_loss','')}</td><td>{t.get('take_profit','')}</td><td>{t.get('exit','')}</td><td>{t.get('net_pnl','')}</td><td>{t.get('pnl_r','')}</td><td>{t.get('reason_entry','')}</td><td>{t.get('reason_exit','')}</td></tr>"
    for t in closed[-80:][::-1]
])

def live_metrics_for_pos(p, last_price):
    if last_price is None:
        return ("n/a", "n/a", "n/a")
    entry = float(p.get('entry', 0))
    qty = float(p.get('qty', 0))
    risk_amt = float(p.get('risk_amount', 0))
    direction = p.get('direction', 'LONG')
    pnl = (last_price - entry) * qty if direction == 'LONG' else (entry - last_price) * qty
    r = (pnl / risk_amt) if risk_amt else 0.0

    # progress to TP/SL
    sl = float(p.get('stop_loss', entry))
    tp = float(p.get('take_profit', entry))
    if direction == 'LONG':
        total = abs(tp - sl)
        done = max(0.0, min(total, last_price - sl))
    else:
        total = abs(sl - tp)
        done = max(0.0, min(total, sl - last_price))
    pct = (done / total * 100) if total > 0 else 0
    return (f"{pnl:.2f}", f"{r:.2f}", f"{pct:.1f}%")

open_rows_list = []
for p in state.get("open_positions", []):
    lp = dict(prices).get(p.get('pair'))
    pnl_txt, r_txt, prog_txt = live_metrics_for_pos(p, lp)
    pnl_color = '#22c55e' if pnl_txt != 'n/a' and float(pnl_txt) >= 0 else '#ef4444'
    open_rows_list.append(
        f"<tr><td>{p.get('timestamp','')}</td><td>{p.get('source_trader_model','')}</td><td>{p.get('pair','')}</td><td>{p.get('direction','')}</td>"
        f"<td>{p.get('entry',''):.6f}</td><td>{p.get('stop_loss',''):.6f}</td><td>{p.get('take_profit',''):.6f}</td>"
        f"<td>{(f'{lp:.4f}' if lp else 'n/a')}</td><td style='color:{pnl_color};font-weight:700'>{pnl_txt}</td><td style='color:{pnl_color};font-weight:700'>{r_txt}</td><td>{prog_txt}</td><td>{p.get('reason_entry','')}</td></tr>"
    )
open_rows = "\n".join(open_rows_list)

price_rows = "\n".join([f"<tr><td>{p}</td><td>{(f'{v:.4f}' if v else 'n/a')}</td></tr>" for p,v in prices])

html = f"""<!doctype html>
<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Kraken Paper Dashboard</title>
<style>body{{font-family:Arial;margin:20px;background:#0f172a;color:#e2e8f0}} .card{{background:#111827;padding:14px;border-radius:12px;margin-bottom:12px}} table{{width:100%;border-collapse:collapse;font-size:12px}} td,th{{border:1px solid #334155;padding:6px}} th{{background:#1f2937}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}}</style>
<meta http-equiv='refresh' content='30'>
</head><body>
<h2>Kraken Paper Trading Dashboard</h2>
<div class='card'>Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Mode: PAPER (no real orders)</div>
<div class='grid'>
<div class='card'><b>Equity</b><br>{state.get('equity',0):.2f}</div>
<div class='card'><b>Closed trades</b><br>{len(closed)}</div>
<div class='card'><b>Win rate</b><br>{win_rate:.1f}%</div>
<div class='card'><b>Profit factor</b><br>{profit_factor:.2f}</div>
<div class='card'><b>Avg R</b><br>{avg_r:.2f}</div>
<div class='card'><b>Consecutive losses</b><br>{state.get('consecutive_losses',0)}</div>
<div class='card'><b>Daily DD%</b><br>{state.get('daily_loss_pct',0):.2f}%</div>
<div class='card'><b>Open positions</b><br>{len(state.get('open_positions',[]))}</div>
</div>
<div class='card'><h3>Tracked pairs (Kraken)</h3><table><tr><th>Pair</th><th>Last Price</th></tr>{price_rows}</table></div>
<div class='card'><h3>Open simulated positions (Live)</h3><table><tr><th>Timestamp</th><th>Model</th><th>Pair</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th><th>Live Price</th><th>Unrealized $</th><th>Unrealized R</th><th>Progress</th><th>Reason</th></tr>{open_rows}</table></div>
<div class='card'><h3>Closed simulated trades</h3><table><tr><th>Timestamp</th><th>Model</th><th>Pair</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th><th>Exit</th><th>PnL</th><th>R</th><th>Entry reason</th><th>Exit reason</th></tr>{rows}</table></div>
</body></html>"""

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(str(OUT))
