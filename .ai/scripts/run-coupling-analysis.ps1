Write-Host ""
Write-Host "🔗 Running Coupling Analyzer..." -ForegroundColor Cyan
Write-Host ""

node .ai/agents/coupling-analyzer.js

Write-Host ""
Write-Host "✅ Coupling analysis complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Check reports: .ai/reports/coupling-report.md" -ForegroundColor Gray
Write-Host "📊 Graph file: .ai/reports/coupling-graph.dot" -ForegroundColor Gray