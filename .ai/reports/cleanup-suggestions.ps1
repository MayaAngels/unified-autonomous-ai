# Auto-generated cleanup script
# Run with: pwsh .ai/scripts/cleanup-suggestions.ps1

Write-Host "🧹 Cleaning up unused files..." -ForegroundColor Cyan

Remove-Item "admin-portal/js\app\route-config.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\app\route-config.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\mocks\index.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\mocks\index.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\audit-log.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\audit-log.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\profile.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\profile.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\rate-limited.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\rate-limited.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\reset-password-confirm.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\reset-password-confirm.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\session-expired.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\session-expired.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\two-factor-recovery.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\two-factor-recovery.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\two-factor-setup.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\two-factor-setup.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\verify-email-pending.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\verify-email-pending.js" -ForegroundColor Gray
Remove-Item "admin-portal/js\pages\verify-email.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: js\pages\verify-email.js" -ForegroundColor Gray
Remove-Item "admin-portal/vault-api.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: vault-api.js" -ForegroundColor Gray
Remove-Item "admin-portal/vault-status.js" -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed: vault-status.js" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
