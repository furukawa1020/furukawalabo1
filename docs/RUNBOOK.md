# Runbook

## 1. Development (Local)

### Quick Start
```bash
# Start all services
docker compose -f infra/docker-compose.yml up --build
```
Access the site at `http://localhost:3000` (Web) or `http://localhost:8000` (Gateway).

### Content Updates
*   **Achievements**: Edit `content/achievements.yml`.
*   **About/Research**: Edit `content/pages/*.md`.
*   **Blog**: Add markdown files to `content/blog/`.
*   Note: For v1.0, some content is copied to `apps/web/public` during build/setup. Ensure you sync changes.

## 2. Protopedia Sync
The **Worker** service runs automatically every 6 hours.
To force sync (verify logs):
```bash
docker compose logs -f worker
```

## 3. Database
### Backup
```bash
docker compose exec db pg_dump -U postgres furukawa_os > backup_$(date +%Y%m%d).sql
```
### Restore
```bash
cat backup.sql | docker compose exec -T db psql -U postgres furukawa_os
```

## 4. Troubleshooting
*   **Frontend specific**: `cd apps/web && npm run dev`
*   **Rails Console**: `docker compose exec api ./bin/rails c`
*   **Logs**: `docker compose logs -f [service_name]`
