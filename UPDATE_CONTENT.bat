@echo off
chcp 65001
echo ==========================================
echo  Furukawa Archive OS - Content Sync
echo ==========================================

echo [1/4] Syncing Achievements...
copy /Y content\achievements.yml apps\web\public\achievements.yml

echo [2/4] Syncing Pages (About, Research)...
copy /Y content\pages\about.md apps\web\public\pages\about.md
copy /Y content\pages\research.md apps\web\public\pages\research.md

echo [3/4] Syncing Blog & Images...
xcopy /E /I /Y content\blog apps\web\public\blog
if not exist apps\web\public\images mkdir apps\web\public\images
xcopy /E /I /Y content\images apps\web\public\images

echo.
echo [4/4] Works are synced automatically from Protopedia (every 6h).
echo.
echo SUCCESS! Content updated. Reload your browser.
echo ==========================================
pause
