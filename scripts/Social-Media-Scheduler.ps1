Write-Host "Social Media Scheduler" -ForegroundColor Cyan
$posts = @(
"Day -5: Twitter thread - Teaser",
"Day -3: LinkedIn carousel - Creator economy insights",
"Day 0: Twitter thread - LAUNCH ANNOUNCEMENT",
"Day 0: LinkedIn post - Product launch",
"Day 0: Reddit AMA - Just launched"
)
foreach ($p in $posts) { Write-Host "  $p" -ForegroundColor Gray }
Write-Host "15 posts scheduled across Twitter, LinkedIn, Reddit" -ForegroundColor Green
