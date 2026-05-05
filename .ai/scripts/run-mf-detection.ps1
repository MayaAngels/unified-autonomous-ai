Write-Host ""
Write-Host "🏗️ Running Micro-Frontend Detector..." -ForegroundColor Cyan
Write-Host ""

node .ai/agents/mf-detector.js

Write-Host ""
Write-Host "✅ MF detection complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Check reports: .ai/reports/microfrontend-report.md" -ForegroundColor Gray
Write-Host "📦 Module Federation config: module-federation.config.js" -ForegroundColor Gray