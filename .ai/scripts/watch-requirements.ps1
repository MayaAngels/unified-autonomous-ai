# Watch for new requirements and auto-scaffold
Write-Host "👁️ Watching for new requirements..." -ForegroundColor Cyan
Write-Host "   Edit: .ai/data/predictions/pending-requirements.json" -ForegroundColor Gray
Write-Host "   Then run: node .ai/agents/predictive-scaffolder.js" -ForegroundColor Gray
Write-Host ""

node .ai/agents/predictive-scaffolder.js

Write-Host ""
Write-Host "✅ Scaffolding check complete!" -ForegroundColor Green