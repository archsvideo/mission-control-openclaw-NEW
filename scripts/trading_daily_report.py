import csv, json
from pathlib import Path
from datetime import datetime

ROOT=Path(r"C:\Users\Oscar\.openclaw\workspace")
log=ROOT/'trading'/'paper'/'trade_log.csv'
state=ROOT/'trading'/'paper'/'state.json'
out=ROOT/'reports'/f"trading-daily-{datetime.now().strftime('%Y-%m-%d')}.md"

rows=[]
if log.exists():
    with log.open('r',encoding='utf-8',newline='') as f:
        rows=list(csv.DictReader(f))
closed=[r for r in rows if r.get('exit')]
wins=[r for r in closed if float(r.get('net_pnl') or 0)>0]
loss=[r for r in closed if float(r.get('net_pnl') or 0)<0]
wr=(len(wins)/len(closed)*100) if closed else 0
gp=sum(float(r.get('net_pnl') or 0) for r in wins)
gl=abs(sum(float(r.get('net_pnl') or 0) for r in loss))
pf=(gp/gl) if gl>0 else (999 if gp>0 else 0)
avg_r=(sum(float(r.get('pnl_r') or 0) for r in closed)/len(closed)) if closed else 0
st={}
if state.exists(): st=json.loads(state.read_text(encoding='utf-8'))

text=f'''# Trading Daily Report\n\nDate: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n- Total trades cerrados: {len(closed)}\n- Win rate: {wr:.1f}%\n- Profit factor: {pf:.2f}\n- Average R: {avg_r:.2f}\n- Consecutive losses: {st.get('consecutive_losses',0)}\n- Daily DD%: {st.get('daily_loss_pct',0):.2f}%\n- Open positions: {len(st.get('open_positions',[]))}\n- Equity: {st.get('equity',0):.2f}\n'''
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(text,encoding='utf-8')
print(str(out))
