# BUILDER 15: NOTIFICATION SYSTEM
param([string]$OutputPath = "C:\Users\Maya\NewDigitalShop\docker-fix\admin-portal")
Write-Host "Creating Notification System..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$OutputPath/js/features/notifications/toast" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutputPath/js/features/notifications/email" | Out-Null
$toast = 'class Toast { show(m) { alert(m); } } window.toast = new Toast();'
[System.IO.File]::WriteAllText("$OutputPath/js/features/notifications/toast.js", $toast, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Notification System Created!" -ForegroundColor Green
