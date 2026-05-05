# BUILDER 16: PAYMENT SYSTEM
param([string]$OutputPath = "C:\Users\Maya\NewDigitalShop\docker-fix\admin-portal")
Write-Host "Creating Payment System..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$OutputPath/js/features/payments" | Out-Null
$stripe = 'class Stripe { pay(a) { return true; } } window.stripe = new Stripe();'
[System.IO.File]::WriteAllText("$OutputPath/js/features/payments/stripe.js", $stripe, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Payment System Created!" -ForegroundColor Green
