import json
from pathlib import Path
from datetime import datetime

ROOT = Path(r"C:\Users\Oscar\.openclaw\workspace")
POLICY = ROOT / "mission-control" / "ops-policy.json"
OUT = ROOT / "reports" / f"agent-value-review-{datetime.now().strftime('%Y-%m-%d')}.json"

# Placeholder data until Mission Control API is wired
sample_agents = [
  {"agent":"trading-orchestrator","success_rate":0.62,"task_completion_rate":0.70,"quality_score":0.64,"cost_today":3.2,"successes":4,"completed_tasks":6},
  {"agent":"lead-orchestrator","success_rate":0.55,"task_completion_rate":0.80,"quality_score":0.58,"cost_today":1.1,"successes":5,"completed_tasks":7},
  {"agent":"radar-orchestrator","success_rate":0.40,"task_completion_rate":0.50,"quality_score":0.42,"cost_today":2.6,"successes":1,"completed_tasks":4},
  {"agent":"revit-orchestrator","success_rate":0.50,"task_completion_rate":0.45,"quality_score":0.51,"cost_today":0.9,"successes":1,"completed_tasks":2},
]

policy = json.loads(POLICY.read_text(encoding="utf-8"))
rule = policy["agent_governance"]["pause_candidate_rule"]

rows = []
for a in sample_agents:
    value_score = 0.45*a["success_rate"] + 0.30*a["task_completion_rate"] + 0.25*a["quality_score"]
    cost_per_success = a["cost_today"] / max(a["successes"], 1)

    pause_candidate = False
    if rule["enabled"]:
        cond_value = value_score < rule["min_value_score"] and a["completed_tasks"] >= rule["min_completed_tasks"]
        cond_cost = cost_per_success > rule["max_cost_per_success_usd"]
        pause_candidate = cond_value or cond_cost

    rows.append({
      "agent": a["agent"],
      "value_score": round(value_score, 3),
      "cost_per_success_usd": round(cost_per_success, 2),
      "completed_tasks": a["completed_tasks"],
      "pause_candidate": pause_candidate
    })

report = {
  "generated_at": datetime.now().isoformat(),
  "window_days": policy["agent_governance"]["evaluation_window_days"],
  "rows": rows,
  "pause_candidates": [r["agent"] for r in rows if r["pause_candidate"]]
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(str(OUT))
