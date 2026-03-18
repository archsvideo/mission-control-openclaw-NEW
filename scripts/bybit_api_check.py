import os
import time
import hmac
import hashlib
import urllib.parse
import requests
from pathlib import Path

ENV_PATH = Path(r"C:\Users\Oscar\.openclaw\workspace\skills\kraken-ai-trader\.env")


def load_env(path: Path):
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def sign(secret: str, payload: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def main():
    env = load_env(ENV_PATH)
    api_key = env.get("BYBIT_API_KEY", "")
    api_secret = env.get("BYBIT_API_SECRET", "")
    if not api_key or not api_secret:
        print("BYBIT_KEYS_NOT_SET")
        return

    base = "https://api.bybit.com"
    endpoint = "/v5/user/query-api"
    timestamp = str(int(time.time() * 1000))
    recv_window = "5000"
    query = ""

    payload = f"{timestamp}{api_key}{recv_window}{query}"
    signature = sign(api_secret, payload)

    headers = {
        "X-BAPI-API-KEY": api_key,
        "X-BAPI-SIGN": signature,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-RECV-WINDOW": recv_window,
    }

    url = f"{base}{endpoint}"
    try:
        r = requests.get(url, headers=headers, timeout=20)
        data = r.json()
    except Exception as e:
        print(f"BYBIT_HTTP_ERROR: {e}")
        return

    ret = data.get("retCode")
    if ret == 0:
        result = data.get("result", {})
        perms = result.get("permissions") or result.get("permission")
        print("BYBIT_SUCCESS")
        print(f"TYPE: {result.get('type', 'unknown')}")
        print(f"READ_PERMS: {perms}")
    else:
        print(f"BYBIT_ERROR: retCode={ret} retMsg={data.get('retMsg')}")


if __name__ == "__main__":
    main()
