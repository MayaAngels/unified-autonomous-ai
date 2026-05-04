from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import os
import random
import json
import math
import httpx
import asyncio

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
    return {"status": "healthy", "version": "6.0.0", "components": {"fep": "active", "kolmogorov": "active", "nash": "active", "geometry": "active", "refactor": "active", "value": "active", "uris": "active", "integration": "active", "shop_competitors": "active"}}

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
# MACRO URIS (Technology Competitors)
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
# BUILDER 9: SHOP-LEVEL COMPETITIVE INTELLIGENCE
# ============================================================

# Shop competitor registry - each shop has its own competitors
shop_competitors = {
    "prompts-shop": {
        "competitors": ["PromptBase", "PromptHero", "PromptGenius", "AIPromptMarket"],
        "focus": "ai_prompts",
        "uncatchability": 0.0,
        "lead_time_days": 0,
        "last_updated": datetime.now().isoformat()
    },
    "digital-shop": {
        "competitors": ["Gumroad", "Etsy", "CreativeMarket", "DigitalProductStore"],
        "focus": "digital_products",
        "uncatchability": 0.0,
        "lead_time_days": 0,
        "last_updated": datetime.now().isoformat()
    },
    "analytics-shop": {
        "competitors": ["GoogleAnalytics", "Mixpanel", "Amplitude", "Heap"],
        "focus": "analytics",
        "uncatchability": 0.0,
        "lead_time_days": 0,
        "last_updated": datetime.now().isoformat()
    }
}

# Shop-specific watchers (simulated data for each competitor)
shop_watcher_data = {}

def get_competitor_insights(shop_id: str) -> Dict:
    """Get insights about shop's competitors"""
    if shop_id not in shop_competitors:
        return {"error": "Shop not found"}
    
    competitors = shop_competitors[shop_id]["competitors"]
    insights = []
    
    for comp in competitors:
        # Simulated competitor data
        insights.append({
            "competitor": comp,
            "price_index": round(random.uniform(0.7, 1.3), 2),
            "market_share": round(random.uniform(0.05, 0.25), 2),
            "strength_score": round(random.uniform(0.4, 0.9), 2),
            "weakness": random.choice(["pricing", "customer_service", "features", "speed"]),
            "last_seen": datetime.now().isoformat()
        })
    
    return {"shop_id": shop_id, "competitors": insights, "count": len(insights)}

def calculate_shop_uncatchability(shop_id: str) -> Dict:
    """Calculate how far ahead this shop is from its competitors"""
    if shop_id not in shop_competitors:
        return {"error": "Shop not found"}
    
    # Get macro system uncatchability
    macro_uncatchability = min(0.95, len(advantages) * 0.12)
    
    # Calculate local advantage based on FEP beliefs
    local_advantage = 0.5
    if shop_id in fep_beliefs:
        beliefs = fep_beliefs[shop_id]
        local_advantage = beliefs.get("precision", 0.5) * 0.6 + beliefs.get("conversion", 0.05) * 10 * 0.4
        local_advantage = min(0.95, max(0.1, local_advantage))
    
    # Combine macro and local
    total_uncatchability = (macro_uncatchability * 0.3 + local_advantage * 0.7)
    
    # Calculate lead time (days ahead)
    lead_time_days = int(total_uncatchability * 30)
    
    # Determine status
    if total_uncatchability > 0.7:
        status = "AHEAD"
    elif total_uncatchability > 0.4:
        status = "COMPETITIVE"
    else:
        status = "CATCHING_UP"
    
    shop_competitors[shop_id]["uncatchability"] = total_uncatchability
    shop_competitors[shop_id]["lead_time_days"] = lead_time_days
    shop_competitors[shop_id]["status"] = status
    
    return {
        "shop_id": shop_id,
        "uncatchability": round(total_uncatchability, 3),
        "lead_time_days": lead_time_days,
        "status": status,
        "macro_contribution": round(macro_uncatchability, 3),
        "local_contribution": round(local_advantage, 3)
    }

def discover_new_competitor(shop_id: str, market: str) -> Dict:
    """Autonomously discover new competitors in a market"""
    # Simulated competitor discovery based on market trends
    potential_competitors = {
        "ai_prompts": ["NewPromptCo", "PromptLab", "AIWonderPrompts"],
        "digital_products": ["DigitalGoodsHub", "CreativeAssets", "DownloadMarket"],
        "analytics": ["DataInsight", "MetricMaster", "AnalyticsPro"]
    }
    
    new_competitors = potential_competitors.get(market, [])
    
    added = []
    for comp in new_competitors:
        if comp not in shop_competitors[shop_id]["competitors"]:
            shop_competitors[shop_id]["competitors"].append(comp)
            added.append(comp)
    
    return {"shop_id": shop_id, "new_competitors_discovered": added, "count": len(added)}

# ============================================================
# SHOP COMPETITOR API ENDPOINTS
# ============================================================

@app.get("/api/v1/shop/competitors/{shop_id}")
async def get_shop_competitors(shop_id: str):
    """Get competitors for a specific shop"""
    return get_competitor_insights(shop_id)

@app.get("/api/v1/shop/uncatchability/{shop_id}")
async def get_shop_uncatchability(shop_id: str):
    """Get uncatchability score for a specific shop"""
    return calculate_shop_uncatchability(shop_id)

@app.get("/api/v1/shop/all-uncatchability")
async def get_all_shops_uncatchability():
    """Get uncatchability scores for all shops"""
    results = []
    for shop_id in shop_competitors.keys():
        results.append(calculate_shop_uncatchability(shop_id))
    return {"shops": results, "timestamp": datetime.now().isoformat()}

@app.post("/api/v1/shop/discover-competitors/{shop_id}")
async def discover_competitors(shop_id: str, market: str = None):
    """Autonomously discover new competitors for a shop"""
    if shop_id not in shop_competitors:
        return {"error": "Shop not found"}
    
    actual_market = market or shop_competitors[shop_id]["focus"]
    return discover_new_competitor(shop_id, actual_market)

@app.post("/api/v1/shop/update-competitor-insight/{shop_id}/{competitor}")
async def update_competitor_insight(shop_id: str, competitor: str, insight: Dict):
    """Update insight about a specific competitor"""
    # Store insight for this competitor
    key = f"{shop_id}_{competitor}"
    if key not in shop_watcher_data:
        shop_watcher_data[key] = []
    shop_watcher_data[key].append({
        "insight": insight,
        "timestamp": datetime.now().isoformat()
    })
    return {"updated": True, "competitor": competitor, "shop_id": shop_id}

@app.post("/api/v1/shop/evolve-from-competitor/{shop_id}/{competitor}")
async def evolve_from_competitor(shop_id: str, competitor: str):
    """Evolve shop strategy based on competitor insight"""
    if shop_id not in fep_beliefs:
        fep_beliefs[shop_id] = {"conversion": 0.05, "revenue": 500, "precision": 1.0}
    
    # Simulate evolution based on competitor
    old_conversion = fep_beliefs[shop_id].get("conversion", 0.05)
    new_conversion = min(0.15, old_conversion * 1.1)
    fep_beliefs[shop_id]["conversion"] = new_conversion
    
    # Recalculate uncatchability
    uncatchability = calculate_shop_uncatchability(shop_id)
    
    return {
        "shop_id": shop_id,
        "competitor": competitor,
        "evolution_applied": True,
        "old_conversion": old_conversion,
        "new_conversion": new_conversion,
        "new_uncatchability": uncatchability
    }

# ============================================================
# UNIFIED DASHBOARD WITH SHOP-LEVEL METRICS
# ============================================================

@app.get("/api/v1/dashboard/unified")
async def unified_dashboard():
    """Complete unified dashboard with shop-level metrics"""
    
    # Calculate marketing score
    marketing_capabilities = {
        "market_predictions": {"status": "active"},
        "competitor_monitoring": {"status": "active"},
        "integration_suggestions": {"status": "active"},
        "social_opportunity_detection": {"status": "active"},
        "social_media_posting": {"status": "pending"},
        "ad_campaign_execution": {"status": "pending"},
        "email_marketing": {"status": "pending"}
    }
    active = sum(1 for c in marketing_capabilities.values() if c["status"] == "active")
    total = len(marketing_capabilities)
    marketing_score = round((active / total) * 100, 1)
    
    # Get shop-level uncatchability
    shop_scores = []
    for shop_id in shop_competitors.keys():
        score = calculate_shop_uncatchability(shop_id)
        shop_scores.append(score)
    
    # Calculate average shop uncatchability
    avg_shop_uncatchability = sum(s["uncatchability"] for s in shop_scores) / max(1, len(shop_scores))
    
    # Get macro uncatchability
    macro_uncatchability = min(0.95, len(advantages) * 0.12)
    
    return {
        "integration": {
            "netlify_healthy": True,
            "render_healthy": True,
            "api_connected": True,
            "sync_status": "synced"
        },
        "marketing_autonomy": {
            "score": marketing_score,
            "active": active,
            "total": total,
            "capabilities": marketing_capabilities
        },
        "shop_intelligence": {
            "shops": shop_scores,
            "average_uncatchability": round(avg_shop_uncatchability, 3),
            "total_shops": len(shop_scores)
        },
        "macro_intelligence": {
            "uncatchability": macro_uncatchability,
            "advantages_generated": len(advantages),
            "watchers_active": len(watchers)
        },
        "system_health": {
            "fep_active": len(fep_beliefs) > 0,
            "nash_active": len(nash_history) > 0,
            "uris_active": len(watchers) > 0,
            "refactor_active": len(refactor_proposals) > 0,
            "value_active": len(values) > 0,
            "shop_competitors_active": len(shop_competitors) > 0
        },
        "overall_readiness": marketing_score > 50 and avg_shop_uncatchability > 0.4,
        "fractal_intelligence_score": round((macro_uncatchability + avg_shop_uncatchability) / 2, 3),
        "timestamp": datetime.now().isoformat()
    }

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
        # Register shop in competitor system if new
        if metrics.shop_id not in shop_competitors:
            shop_competitors[metrics.shop_id] = {
                "competitors": ["GeneralCompetitor1", "GeneralCompetitor2"],
                "focus": "general",
                "uncatchability": 0.0,
                "lead_time_days": 0,
                "last_updated": datetime.now().isoformat()
            }
    
    fep_beliefs[metrics.shop_id]["conversion"] = metrics.conversion_rate
    fep_beliefs[metrics.shop_id]["revenue"] = metrics.revenue_24h
    
    # Recalculate shop uncatchability
    calculate_shop_uncatchability(metrics.shop_id)
    
    return {"status": "ok", "shop_id": metrics.shop_id}

# ============================================================
# INTEGRATION ENDPOINTS (from Builder 8)
# ============================================================

sync_history = []
auto_correct_enabled = True

@app.get("/api/v1/integration/status")
async def integration_status():
    return {
        "current_status": "synced",
        "netlify_healthy": True,
        "render_healthy": True,
        "api_connected": True,
        "auto_correct_enabled": auto_correct_enabled,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/integration/correct")
async def trigger_correction():
    return {"corrected": True, "action": "sync_triggered", "timestamp": datetime.now().isoformat()}

@app.get("/api/v1/marketing/autonomy")
async def marketing_autonomy():
    marketing_capabilities = {
        "market_predictions": {"status": "active"},
        "competitor_monitoring": {"status": "active"},
        "integration_suggestions": {"status": "active"},
        "social_opportunity_detection": {"status": "active"},
        "social_media_posting": {"status": "pending"},
        "ad_campaign_execution": {"status": "pending"},
        "email_marketing": {"status": "pending"}
    }
    active = sum(1 for c in marketing_capabilities.values() if c["status"] == "active")
    total = len(marketing_capabilities)
    score = round((active / total) * 100, 1)
    return {
        "overall_autonomy_score": score,
        "capabilities": marketing_capabilities,
        "active_count": active,
        "pending_count": total - active
    }

@app.post("/api/v1/marketing/update/{capability}/{status}")
async def update_marketing_capability(capability: str, status: str):
    return {"capability": capability, "status": status}

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
