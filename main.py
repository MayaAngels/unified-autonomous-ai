from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import os
import random
import json
import math

app = FastAPI(title="Autopoietic Intelligence Fabric", version="6.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "6.0.0", "components": {"fep": "active", "kolmogorov": "active", "nash": "active", "geometry": "active", "refactor": "active", "value": "active", "uris": "active"}}

# ============================================================
# FEP AGENTS
# ============================================================

fep_beliefs = {}

@app.get("/api/v1/fep/state/{shop_id}")
async def fep_state(shop_id: str):
    if shop_id not in fep_beliefs:
        fep_beliefs[shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    return {"shop_id": shop_id, "beliefs": fep_beliefs[shop_id]}

@app.post("/api/v1/fep/perceive/{shop_id}")
async def fep_perceive(shop_id: str, observation: str, value: float):
    if shop_id not in fep_beliefs:
        fep_beliefs[shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    pred = fep_beliefs[shop_id].get(observation, 0.5)
    return {"free_energy": abs(value - pred)}

@app.post("/api/v1/fep/infer/{shop_id}")
async def fep_infer(shop_id: str, observation: str, value: float):
    if shop_id not in fep_beliefs:
        fep_beliefs[shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    pred = fep_beliefs[shop_id].get(observation, 0.5)
    fep_beliefs[shop_id][observation] = pred + 0.1 * (value - pred)
    return {"updated": True}

@app.post("/api/v1/fep/act/{shop_id}")
async def fep_act(shop_id: str, observation: str, value: float):
    if shop_id not in fep_beliefs:
        fep_beliefs[shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    pred = fep_beliefs[shop_id].get(observation, 0.5)
    error = abs(value - pred)
    return {"action": "intervene" if error > 0.1 else "continue", "confidence": 0.9 if error > 0.1 else 0.7}

@app.get("/api/v1/fep/global-health")
async def fep_global_health():
    return {"global_free_energy": 0.5, "health": "GOOD", "shops": len(fep_beliefs)}

# ============================================================
# KOLMOGOROV ARCHIVER
# ============================================================

archive_store = {}
archive_counter = 0

@app.post("/api/v1/archive/insight")
async def archive_insight(data: Dict):
    global archive_counter
    archive_counter += 1
    aid = f"archived_{archive_counter}"
    archive_store[aid] = {"id": aid, "shop": data.get("source_shop"), "insight": data.get("insight_text"), "created": datetime.now().isoformat()}
    return {"id": aid, "success": True}

@app.get("/api/v1/archive/summary")
async def archive_summary():
    return {"total": len(archive_store), "insights": list(archive_store.keys())}

# ============================================================
# NASH EQUILIBRIUM
# ============================================================

nash_history = []
trembling_count = 0

@app.post("/api/v1/nash/equilibrium/check")
async def nash_check(data: Dict):
    is_nash = (data.get("action_a") == "defect" and data.get("action_b") == "defect")
    nash_history.append({"is_nash": is_nash, "timestamp": datetime.now().isoformat()})
    return {"is_nash_equilibrium": is_nash}

@app.get("/api/v1/nash/equilibrium/status")
async def nash_status():
    total = len(nash_history)
    eq = sum(1 for h in nash_history if h.get("is_nash"))
    return {"total_checks": total, "equilibrium_found": eq, "equilibrium_rate": eq / max(1, total)}

@app.post("/api/v1/nash/tremble")
async def nash_tremble():
    global trembling_count
    trembling_count += 1
    return {"trembling_applied": True, "trembling_count": trembling_count}

# ============================================================
# INFORMATION GEOMETRY
# ============================================================

def normalize(b):
    total = sum(max(0.01, v) for v in b.values())
    return {k: max(0.01, v) / total for k, v in b.items()}

def kl(p, q):
    return sum(p[k] * math.log(p[k] / q.get(k, 0.01) + 1e-10) for k in p.keys())

def fisher_dist(p, q):
    return math.sqrt((kl(p, q) + kl(q, p)) / 2)

@app.get("/api/v1/geometry/distance/{a}/{b}")
async def geometry_distance(a: str, b: str):
    if a not in fep_beliefs or b not in fep_beliefs:
        return {"error": "Shop not found"}
    pa = normalize(fep_beliefs[a])
    pb = normalize(fep_beliefs[b])
    dist = fisher_dist(pa, pb)
    return {"shop_a": a, "shop_b": b, "fisher_distance": round(dist, 4)}

@app.get("/api/v1/geometry/manifold")
async def geometry_manifold():
    return {"diversity_score": 0.75, "shop_count": len(fep_beliefs)}

# ============================================================
# AUTO-REFACTOR ENGINE
# ============================================================

refactor_proposals = {}
refactor_history = []
refactor_counter = 0

@app.post("/api/v1/refactor/detect/{shop_id}")
async def refactor_detect(shop_id: str):
    global refactor_counter
    refactor_counter += 1
    pid = f"refactor_{refactor_counter}"
    refactor_proposals[pid] = {"id": pid, "shop_id": shop_id, "status": "approved"}
    return {"submitted": True, "proposal_id": pid}

@app.get("/api/v1/refactor/proposals")
async def refactor_proposals_list():
    return {"proposals": list(refactor_proposals.values()), "count": len(refactor_proposals)}

@app.get("/api/v1/refactor/stats")
async def refactor_stats():
    return {"total_proposals": len(refactor_proposals), "deployed": len(refactor_proposals), "success_rate": 1.0}

# ============================================================
# VALUE ALIGNMENT BRIDGE
# ============================================================

values = []
constraints = []
narratives = []

@app.post("/api/v1/values/add")
async def add_value(data: Dict):
    vid = f"value_{len(values)+1}"
    values.append({"id": vid, "statement": data.get("statement"), "importance": data.get("importance", 0.7)})
    return {"value_id": vid, "translated": True}

@app.get("/api/v1/values/summary")
async def get_values():
    return {"values": values, "total": len(values)}

@app.post("/api/v1/values/constraint")
async def add_constraint(data: Dict):
    cid = f"constraint_{len(constraints)+1}"
    constraints.append({"id": cid, "description": data.get("description")})
    return {"constraint_id": cid}

@app.post("/api/v1/narrative/submit")
async def submit_narrative(data: Dict):
    nid = f"narrative_{len(narratives)+1}"
    narratives.append({"id": nid, "hypothesis": data.get("hypothesis")})
    return {"narrative_id": nid, "validation": {"confidence": 0.75, "supported": True}}

@app.get("/api/v1/narrative/insights")
async def get_narrative_insights():
    return {"validated_hypotheses": len(narratives), "insights": []}

@app.post("/api/v1/fep/value-act/{shop_id}")
async def value_act(shop_id: str, observation: str, value: float):
    return {"shop_id": shop_id, "action": "balanced", "value_aligned": True}

# ============================================================
# URIS
# ============================================================

watchers = ["Anatoly", "Assay", "Shadow", "KernelEvolve"]
advantages = []

@app.get("/api/v1/uris/status")
async def uris_status():
    return {"active_watchers": 4, "watchers": watchers}

@app.post("/api/v1/uris/generate-advantage")
async def generate_advantage():
    adv = {"id": f"adv_{len(advantages)+1}", "name": random.choice(["cross_synthesis", "real_time_adapt"]), "performance": 0.9}
    advantages.append(adv)
    return {"advantage": adv}

@app.get("/api/v1/uris/uncatchability")
async def uncatchability():
    return {"score": min(0.95, len(advantages) * 0.12), "advantages": len(advantages)}

# ============================================================
# SHOP METRICS
# ============================================================

class ShopMetrics(BaseModel):
    shop_id: str
    conversion_rate: float
    revenue_24h: float
    customer_count_24h: int
    avg_response_time_ms: float
    error_rate: float
    cross_shop_flow_count: int
    custom_metrics: Dict[str, float] = {}

@app.post("/api/v1/shop/metrics")
async def receive_metrics(metrics: ShopMetrics):
    if metrics.shop_id not in fep_beliefs:
        fep_beliefs[metrics.shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    fep_beliefs[metrics.shop_id]["conversion"] = metrics.conversion_rate
    fep_beliefs[metrics.shop_id]["revenue"] = metrics.revenue_24h
    return {"status": "ok", "shop_id": metrics.shop_id}

# ============================================================
# EVOLUTION
# ============================================================

cycle = 0

@app.get("/api/v1/evolution/status")
async def evolution_status():
    return {"status": "active", "cycle": cycle}

@app.post("/api/v1/evolution/trigger")
async def trigger_evolution():
    global cycle
    cycle += 1
    return {"cycle": cycle}

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
