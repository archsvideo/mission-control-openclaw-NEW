import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean
import requests

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
CFG_PATH = ROOT / "trading" / "paper" / "config_kraken_paper.json"
LOG_PATH = ROOT / "trading" / "paper" / "trade_log.csv"
STATE_PATH = ROOT / "trading" / "paper" / "state.json"


def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def save_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2), encoding="utf-8")


def normalize_pair(pair: str) -> str:
    p = pair.replace("/", "")
    aliases = {
        "XBTUSD": "XXBTZUSD",
        "BTCUSD": "XXBTZUSD",
        "ETHUSD": "XETHZUSD",
        "SOLUSD": "SOLUSD",
    }
    return aliases.get(p.upper(), p)


def kraken_ohlc(pair: str, interval=60, count=200):
    url = "https://api.kraken.com/0/public/OHLC"
    kpair = normalize_pair(pair)
    r = requests.get(url, params={"pair": kpair, "interval": interval}, timeout=20)
    data = r.json()
    if data.get("error"):
        raise RuntimeError(str(data["error"]))
    key = next(iter(data["result"].keys() - {"last"}))
    rows = data["result"][key][-count:]
    closes = [float(x[4]) for x in rows]
    highs = [float(x[2]) for x in rows]
    lows = [float(x[3]) for x in rows]
    return closes, highs, lows


def ema(values, span):
    k = 2 / (span + 1)
    e = values[0]
    out = []
    for v in values:
        e = v * k + e * (1 - k)
        out.append(e)
    return out


def rsi(values, period=14):
    gains, losses = [], []
    for i in range(1, len(values)):
        ch = values[i] - values[i - 1]
        gains.append(max(ch, 0))
        losses.append(abs(min(ch, 0)))
    if len(gains) < period:
        return 50.0
    avg_gain = mean(gains[-period:])
    avg_loss = mean(losses[-period:])
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def atr(highs, lows, closes, period=14):
    trs = []
    for i in range(1, len(closes)):
        tr = max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]), abs(lows[i] - closes[i - 1]))
        trs.append(tr)
    if len(trs) < period:
        return closes[-1] * 0.01
    return mean(trs[-period:])


def append_log(row):
    with LOG_PATH.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(row)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def main():
    cfg = load_json(CFG_PATH, {})
    state = load_json(STATE_PATH, {
        "equity": 10000.0,
        "open_positions": [],
        "consecutive_losses": 0,
        "daily_loss_pct": 0.0,
        "last_day": datetime.now(timezone.utc).date().isoformat(),
    })

    today = datetime.now(timezone.utc).date().isoformat()
    if state.get("last_day") != today:
        state["daily_loss_pct"] = 0.0
        state["consecutive_losses"] = 0
        state["last_day"] = today

    risk = cfg["risk"]
    if state["daily_loss_pct"] >= risk["max_daily_drawdown_pct"] or state["consecutive_losses"] >= risk["kill_switch_after_consecutive_losses"]:
        save_json(STATE_PATH, state)
        print("KILL_SWITCH_ACTIVE")
        return

    # 1) Update exits on open positions
    updated = []
    for pos in state["open_positions"]:
        closes, highs, lows = kraken_ohlc(pos["pair"], interval=60, count=5)
        px = closes[-1]
        exit_reason = None
        # break-even upgrade once trade reaches +1R (protect capital)
        current_pnl = (px - pos["entry"]) * pos["qty"] if pos["direction"] == "LONG" else (pos["entry"] - px) * pos["qty"]
        current_r = current_pnl / pos["risk_amount"] if pos.get("risk_amount") else 0
        if current_r >= 1.0:
            if pos["direction"] == "LONG":
                pos["stop_loss"] = max(pos["stop_loss"], pos["entry"])
            else:
                pos["stop_loss"] = min(pos["stop_loss"], pos["entry"])

        # time-stop: if stale after 10h and not progressing, exit to free slot
        try:
            opened_at = datetime.fromisoformat(pos["timestamp"])
            age_h = (datetime.now(timezone.utc) - opened_at).total_seconds() / 3600
            if age_h >= 10 and abs(current_r) < 0.25:
                exit_reason = "time_stop"
        except Exception:
            pass

        if pos["direction"] == "LONG":
            if px <= pos["stop_loss"]:
                exit_reason = "stop_hit"
            elif px >= pos["take_profit"]:
                exit_reason = "tp_hit"
        else:
            if px >= pos["stop_loss"]:
                exit_reason = "stop_hit"
            elif px <= pos["take_profit"]:
                exit_reason = "tp_hit"

        if exit_reason:
            pnl = (px - pos["entry"]) * pos["qty"] if pos["direction"] == "LONG" else (pos["entry"] - px) * pos["qty"]
            r_mult = pnl / pos["risk_amount"] if pos["risk_amount"] else 0
            state["equity"] += pnl
            if pnl < 0:
                state["consecutive_losses"] += 1
                state["daily_loss_pct"] += abs(pnl) / max(state["equity"], 1) * 100
            else:
                state["consecutive_losses"] = 0

            append_log([
                pos["timestamp"], pos["source_trader_model"], pos["pair"], pos["direction"],
                f"{pos['entry']:.6f}", f"{pos['stop_loss']:.6f}", f"{pos['take_profit']:.6f}", f"{px:.6f}",
                f"{pnl:.2f}", f"{r_mult:.2f}", pos["reason_entry"], exit_reason
            ])
        else:
            updated.append(pos)
    state["open_positions"] = updated

    # 2) Open new simulated positions (default 2 max; 3rd only on strong signal)
    exec_cfg = cfg.get("execution", {})
    max_default = int(exec_cfg.get("max_open_positions_default", 2))
    max_hard = int(exec_cfg.get("max_open_positions_hard", 3))
    allow_third_strong = bool(exec_cfg.get("allow_third_only_if_strong_signal", True))

    open_count = len(state["open_positions"])
    open_pairs = {p.get("pair") for p in state["open_positions"]}
    open_risk_pct = sum((p.get("risk_amount", 0.0) / max(state["equity"], 1)) * 100 for p in state["open_positions"])

    # can attempt a new entry only if risk and slot capacity allow
    can_open = open_count < max_default and open_risk_pct < risk.get("max_total_open_risk_pct", 1.5)
    if open_count >= max_default and open_count < max_hard and allow_third_strong:
        can_open = open_risk_pct < risk.get("max_total_open_risk_pct", 1.5)

    if can_open:
        hour_utc = datetime.now(timezone.utc).hour
        models = [m for m in cfg["source_models"] if m["status"].startswith("active") and m["weight"] > 0]

        # prioritize models that are active now
        active_now = [m for m in models if hour_utc in m.get("session_utc", [])]
        selected = max(active_now, key=lambda x: x["weight"]) if active_now else (max(models, key=lambda x: x["weight"]) if models else {"name": "blend", "pair_bias": []})
        dominant = selected["name"]

        pair_bias = selected.get("pair_bias", [])
        pair_order = pair_bias + [p for p in cfg["universe"] if p not in pair_bias]

        for pair in pair_order:
            # no duplicate same pair at same time
            if pair in open_pairs:
                continue

            closes, highs, lows = kraken_ohlc(pair, interval=60, count=220)
            e_fast = ema(closes, 20)[-1]
            e_slow = ema(closes, 50)[-1]
            r = rsi(closes, 14)
            price = closes[-1]
            a = atr(highs, lows, closes, 14)

            trend_strength = abs(e_fast - e_slow) / max(price, 1e-9)

            direction = None
            if e_fast > e_slow and 50 <= r <= 72:
                direction = "LONG"
            elif e_fast < e_slow and 28 <= r <= 50:
                direction = "SHORT"

            if direction is None:
                continue

            # Pair-specific strictness (focus mode): ETH requires stronger confirmation
            if pair == "ETH/USD":
                if not (trend_strength >= 0.010 and ((direction == "LONG" and r >= 58) or (direction == "SHORT" and r <= 42))):
                    continue

            # if this would be the 3rd slot, require stronger signal
            if open_count >= max_default and allow_third_strong:
                if not (trend_strength >= 0.006 and ((direction == "LONG" and r >= 56) or (direction == "SHORT" and r <= 44))):
                    continue

            stop_dist = max(a, price * 0.0055)
            risk_amt = state["equity"] * (risk["max_risk_per_trade_pct"] / 100)

            # enforce total open risk cap
            projected_open_risk_pct = open_risk_pct + (risk_amt / max(state["equity"], 1)) * 100
            if projected_open_risk_pct > risk.get("max_total_open_risk_pct", 1.5):
                continue

            qty = risk_amt / stop_dist

            if direction == "LONG":
                stop = price - stop_dist
                tp = price + 2 * stop_dist
            else:
                stop = price + stop_dist
                tp = price - 2 * stop_dist

            pos = {
                "timestamp": now_iso(),
                "source_trader_model": dominant,
                "pair": pair,
                "direction": direction,
                "entry": price,
                "stop_loss": stop,
                "take_profit": tp,
                "qty": qty,
                "risk_amount": risk_amt,
                "reason_entry": f"{dominant} session-model | EMA20/50 + RSI (rsi={r:.1f}, utc={hour_utc}, ts={trend_strength:.4f})",
            }
            state["open_positions"].append(pos)
            print(f"OPENED_PAPER_{direction}_{pair}_{dominant}")
            break

    save_json(STATE_PATH, state)
    print("RUN_OK")


if __name__ == "__main__":
    main()
