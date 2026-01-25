$adminToken = "your-secret-admin-token-123" # Update this if you changed it in Railway
$url = "https://energetic-caring-production-c12f.up.railway.app/api/v1/admin/sync/protopedia"

Write-Host "🔄 Triggering Manual Sync via API..."
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{Authorization=("Bearer " + $adminToken)} -TimeoutSec 30
    Write-Host "✅ Sync Triggered Successfully!"
    Write-Host "Response: " ($response | ConvertTo-Json -Depth 5)
    Write-Host "⏳ Wait 20-30 seconds for the Worker to scrape all 41 works..."
} catch {
    Write-Host "❌ Error triggering sync: " $_.Exception.Message
    Write-Host "Response Body: " $_.ErrorDetails.Message
}
