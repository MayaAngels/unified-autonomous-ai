Write-Host "Email Campaign Deployer" -ForegroundColor Cyan
$emails = @(
"Day -5: Teaser - Something big is coming",
"Day -3: Problem - The #1 thing killing productivity",
"Day -1: Urgency - Tomorrow it goes live",
"Day 0: LAUNCH - It is live! Founding price inside",
"Day 1: Warning - 24 hours left at founding price",
"Day 3: Final Call - Bonus expires tonight"
)
foreach ($e in $emails) { Write-Host "  $e" -ForegroundColor Gray }
Write-Host "6 emails ready for ConvertKit" -ForegroundColor Green
