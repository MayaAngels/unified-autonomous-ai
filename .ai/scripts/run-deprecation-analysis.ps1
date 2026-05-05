Write-Host ""
Write-Host "⚠️ Running Deprecation Manager..." -ForegroundColor Cyan
Write-Host ""

node .ai/agents/deprecation-manager.js

Write-Host ""
Write-Host "✅ Deprecation analysis complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Check reports: .ai/reports/deprecation-report.md" -ForegroundColor Gray
Write-Host "🧹 Cleanup script: .ai/reports/cleanup-suggestions.ps1" -ForegroundColor Gray