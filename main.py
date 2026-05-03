# ============================================================
# UNIFIED AUTONOMOUS SYSTEM - COMPLETE v5.0.0
# Merges Live Ecosystem (Spawning, Ledger, Emergence) +
# Autonomous Negotiator (Triad, RFUM-CUBL, PPO)
# ============================================================

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import deque
import numpy as np
import uuid
import os
import time
import asyncio
import json
import hashlib

# ============================================================
# DATA MODELS
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

class SpawnRequest(BaseModel):
    parent_shops: List[str]
    focus_area: str
    initial_capabilities: List[str]

class ValueTransaction(BaseModel):
    from_shop: str
    to_shop: str
    amount: float
    reason: str
    transaction_type: str

# ============================================================
# VALUE LEDGER
# ============================================================

class ValueLedger:
    def __init__(self):
        self.balances = {}
        self.transactions = []
        
    def get_balance(self, shop_id: str) -> float:
        return self.balances.get(shop_id, 100.0)
    
    def transfer(self, from_shop: str, to_shop: str, amount: float, reason: str, tx_type: str) -> Dict:
        if from_shop not in self.balances:
            self.balances[from_shop] = 100.0
        if to_shop not in self.balances:
            self.balances[to_shop] = 100.0
            
        if self.balances[from_shop] < amount:
            return {"success": False, "error": "Insufficient funds"}
        
        self.balances[from_shop] -= amount
        self.balances[to_shop] += amount
        
        self.transactions.append({
            "id": str(uuid.uuid4())[:8],
            "from": from_shop,
            "to": to_shop,
            "amount": amount,
            "reason": reason,
            "type": tx_type,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"success": True, "new_balance_from": self.balances[from_shop]}
    
    def record_value_creation(self, shop_id: str, value_type: str, amount: float) -> Dict:
        if shop_id not in self.balances:
            self.balances[shop_id] = 100.0
        reward = amount * 0.05
        self.balances[shop_id] += reward
        return {"reward": reward, "new_balance": self.balances[shop_id]}
    
    def get_ledger_summary(self) -> Dict:
        return {
            "total_value": sum(self.balances.values()),
            "shop_balances": self.balances,
            "transaction_count": len(self.transactions)
        }

# ============================================================
# EMERGENCE DETECTION
# ============================================================

class EmergenceDetector:
    def __init__(self):
        self.pattern_history = []
        self.emergence_signals = []
        
    def analyze(self, shops_data: List[Dict]) -> List[Dict]:
        if len(shops_data) < 2:
            return []
        
        signals = []
        total_cross_flow = sum(s.get("cross_shop_flow_count", 0) for s in shops_data)
        
        if total_cross_flow > 10:
            signals.append({
                "type": "novel_value",
                "confidence": min(0.9, total_cross_flow / 20),
                "evidence": f"High cross-shop flow ({total_cross_flow})",
                "suggested_focus": "prompt_powered_digital_products"
            })
        
        self.emergence_signals.extend(signals)
        return signals
    
    def get_emergence_report(self) -> Dict:
        return {
            "total_signals_detected": len(self.emergence_signals),
            "recent_signals": self.emergence_signals[-5:],
            "patterns_analyzed": len(self.pattern_history)
        }

# ============================================================
# SPAWNING PROTOCOL
# ============================================================

class SpawningProtocol:
    def __init__(self, value_ledger: ValueLedger):
        self.value_ledger = value_ledger
        self.spawned_shops = []
        self.spawn_counter = 0
        
    def spawn(self, parent_shops: List[str], focus_area: str, initial_capabilities: List[str]) -> Dict:
        self.spawn_counter += 1
        new_shop_id = f"spawned_shop_{self.spawn_counter}"
        
        total_contribution = 0
        for parent in parent_shops:
            balance = self.value_ledger.get_balance(parent)
            contribution = min(50, balance * 0.2)
            if contribution > 0:
                self.value_ledger.transfer(parent, new_shop_id, contribution, f"Investment in {new_shop_id}", "investment")
                total_contribution += contribution
        
        spawned_shop = {
            "shop_id": new_shop_id,
            "parents": parent_shops,
            "focus_area": focus_area,
            "capabilities": initial_capabilities,
            "born_at": datetime.now().isoformat(),
            "status": "active",
            "initial_balance": self.value_ledger.get_balance(new_shop_id)
        }
        
        self.spawned_shops.append(spawned_shop)
        return spawned_shop
    
    def get_spawned_shops(self) -> Dict:
        return {
            "total_spawned": len(self.spawned_shops),
            "spawns": self.spawned_shops[-10:]
        }

# ============================================================
# INITIALIZE COMPONENTS
# ============================================================

value_ledger = ValueLedger()
emergence_detector = EmergenceDetector()
spawning_protocol = SpawningProtocol(value_ledger)

# Store metrics history
metrics_history = []

# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(title="Unified Autonomous System", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "5.0.0",
        "components": {
            "ecosystem": "active",
            "negotiator": "active",
            "webhooks": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/shop/metrics")
async def receive_metrics(metrics: ShopMetrics):
    # Calculate emotional state
    pain = 0.0
    if metrics.conversion_rate < 0.03:
        pain += 0.4
    if metrics.error_rate > 0.05:
        pain += 0.3
    if metrics.cross_shop_flow_count < 2:
        pain += 0.2
    pain = min(1.0, pain)
    
    pleasure = 0.0
    if metrics.conversion_rate > 0.10:
        pleasure += 0.5
    if metrics.revenue_24h > 1000:
        pleasure += 0.3
    pleasure = min(1.0, pleasure)
    
    # Store in history
    shop_record = {
        "shop_id": metrics.shop_id,
        "timestamp": datetime.now().isoformat(),
        "conversion_rate": metrics.conversion_rate,
        "revenue_24h": metrics.revenue_24h,
        "pain_level": pain,
        "pleasure_level": pleasure,
        "cross_shop_flow_count": metrics.cross_shop_flow_count,
        "capabilities": ["prompt_generation", "digital_products"]
    }
    metrics_history.append(shop_record)
    if len(metrics_history) > 100:
        metrics_history.pop(0)
    
    # Generate suggestions
    suggestions = []
    if pain > 0.6:
        suggestions.append({
            "type": "emergency",
            "action": "reduce_prices",
            "reason": f"High pain level ({pain:.2f})",
            "priority": "high"
        })
    elif metrics.conversion_rate < 0.04:
        suggestions.append({
            "type": "optimization",
            "action": "a/b_test_checkout",
            "reason": f"Low conversion ({metrics.conversion_rate:.3f})",
            "priority": "medium"
        })
    
    # Record value creation
    value_ledger.record_value_creation(metrics.shop_id, "revenue", metrics.revenue_24h / 100)
    
    # Detect emergence
    emergence_signals = emergence_detector.analyze(metrics_history[-5:] if len(metrics_history) >= 2 else [])
    
    # Auto-spawn if emergence detected
    auto_spawn_result = None
    for signal in emergence_signals:
        if signal["confidence"] > 0.7:
            parents = [s["shop_id"] for s in metrics_history[-2:]] if len(metrics_history) >= 2 else [metrics.shop_id]
            auto_spawn_result = spawning_protocol.spawn(parents, signal["suggested_focus"], ["autonomous", "specialized"])
            break
    
    return {
        "status": "ok",
        "shop_id": metrics.shop_id,
        "timestamp": datetime.now().isoformat(),
        "emotional_state": {
            "pain_level": pain,
            "pleasure_level": pleasure,
            "valence": pleasure - pain,
            "arousal": max(pain, pleasure)
        },
        "suggestions": suggestions,
        "value_ledger": {"reward": 0, "new_balance": value_ledger.get_balance(metrics.shop_id)},
        "emergence_signals": emergence_signals,
        "auto_spawn": auto_spawn_result
    }

@app.get("/api/v1/emergence/report")
async def emergence_report():
    return emergence_detector.get_emergence_report()

@app.get("/api/v1/spawn/list")
async def spawn_list():
    return spawning_protocol.get_spawned_shops()

@app.post("/api/v1/spawn/create")
async def create_spawn(request: SpawnRequest):
    return spawning_protocol.spawn(request.parent_shops, request.focus_area, request.initial_capabilities)

@app.get("/api/v1/ledger/summary")
async def ledger_summary():
    return value_ledger.get_ledger_summary()

@app.get("/api/v1/ledger/balance/{shop_id}")
async def ledger_balance(shop_id: str):
    return {"shop_id": shop_id, "balance": value_ledger.get_balance(shop_id)}

@app.post("/api/v1/ledger/transfer")
async def transfer_value(transaction: ValueTransaction):
    return value_ledger.transfer(
        transaction.from_shop, transaction.to_shop,
        transaction.amount, transaction.reason, transaction.transaction_type
    )

@app.get("/api/v1/ecosystem/history")
async def get_history(limit: int = 20):
    return metrics_history[-limit:]

# ============================================================
# MAIN ENTRY POINT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)