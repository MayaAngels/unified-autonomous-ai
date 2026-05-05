$dashboard = "C:\Users\Maya\NewDigitalShop\admin-portal\launch-dashboard.html"
if (Test-Path $dashboard) { Start-Process $dashboard; Write-Host "Launch Dashboard opened!" -ForegroundColor Green }
else { Write-Host "Run Launch-Dashboard-Builder.ps1 first" -ForegroundColor Yellow }
