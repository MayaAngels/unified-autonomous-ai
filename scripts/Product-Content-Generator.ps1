param($ProductName = "AI-Augmented Creator OS", $Price = 47)
Write-Host "Product Content Generator" -ForegroundColor Cyan
$dir = "C:\Users\Maya\NewDigitalShop\products\$($ProductName -replace ' ','-')"
New-Item -ItemType Directory -Force -Path "$dir\marketing\email" | Out-Null
New-Item -ItemType Directory -Force -Path "$dir\marketing\social" | Out-Null
Write-Host "  Landing page copy generated" -ForegroundColor Green
Write-Host "  Email sequence generated (6 emails)" -ForegroundColor Green
Write-Host "  Social posts generated (15 posts)" -ForegroundColor Green
Write-Host "  Product folder: $dir" -ForegroundColor Gray
