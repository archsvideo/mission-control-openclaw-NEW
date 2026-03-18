import time,hmac,hashlib,requests
from pathlib import Path

env=Path(r"C:\Users\Oscar\.openclaw\workspace\skills\kraken-ai-trader\.env").read_text(encoding="utf-8").splitlines()
kv={}
for l in env:
    if "=" in l and not l.strip().startswith("#"):
        k,v=l.split("=",1)
        kv[k.strip()]=v.strip().strip('"').strip("'")

key=kv.get("BYBIT_API_KEY","")
sec=kv.get("BYBIT_API_SECRET","")

bases=[
    "https://api.bybit.com",
    "https://api.bytick.com",
    "https://api.bybit.eu",
    "https://api.bybit.nl",
    "https://api.bybit-tr.com",
    "https://api.bybitgeorgia.ge"
]

for base in bases:
    ts=str(int(time.time()*1000))
    rw="5000"
    query=""
    payload=f"{ts}{key}{rw}{query}"
    sig=hmac.new(sec.encode(),payload.encode(),hashlib.sha256).hexdigest()
    headers={
        "X-BAPI-API-KEY":key,
        "X-BAPI-SIGN":sig,
        "X-BAPI-TIMESTAMP":ts,
        "X-BAPI-RECV-WINDOW":rw,
    }
    try:
        r=requests.get(base+"/v5/user/query-api",headers=headers,timeout=15)
        print(base, r.status_code, r.text[:180])
    except Exception as e:
        print(base, "ERR", e)
