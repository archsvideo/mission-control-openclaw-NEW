import time
import subprocess
from datetime import datetime
from pathlib import Path

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
RUNNER = ROOT / "scripts" / "kraken_paper_runner.py"
DASH = ROOT / "scripts" / "build_paper_dashboard.py"
LOG = ROOT / "trading" / "paper" / "daemon.log"

INTERVAL_SEC = 300  # 5 min

LOG.parent.mkdir(parents=True, exist_ok=True)

def log(msg):
    line = f"[{datetime.now().isoformat(timespec='seconds')}] {msg}\n"
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line)

log("daemon started")
while True:
    try:
        r = subprocess.run(["python", str(RUNNER)], cwd=str(ROOT), capture_output=True, text=True, timeout=180)
        out = (r.stdout or "").strip().replace("\n", " | ")
        err = (r.stderr or "").strip().replace("\n", " | ")
        log(f"runner exit={r.returncode} out={out} err={err}")
    except Exception as e:
        log(f"runner exception: {e}")

    try:
        d = subprocess.run(["python", str(DASH)], cwd=str(ROOT), capture_output=True, text=True, timeout=120)
        log(f"dashboard exit={d.returncode} out={(d.stdout or '').strip()}")
    except Exception as e:
        log(f"dashboard exception: {e}")

    time.sleep(INTERVAL_SEC)
