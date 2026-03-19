# Trading Strategy (Current)

## Mode
- Paper trading only
- Kraken data feed
- No live order execution

## Core execution logic
1. Technical signal engine (local): EMA20/EMA50 + RSI
2. Regime filter v1: ADX >= 18, ATR% <= 3%
3. Pair priority: SOL/USD -> XBT/USD -> ETH/USD
4. ETH strict mode enabled (stronger confirmation required)

## Position management
- Risk per trade: 0.5%
- Max concurrent positions: 2
- Max open risk total: 1.0%
- Break-even adjustment at +1R
- Time-stop if stale > 10h and low progress

## Safety
- Daily drawdown limit: 2%
- Kill switch after 3 consecutive losses

## LLM policy
- Primary: Codex for periodic strategy review
- Fallback: Gemini Flash for non-execution tasks only
- Intraday decisions do NOT depend on LLM
