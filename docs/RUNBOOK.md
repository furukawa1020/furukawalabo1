# Furukawa Archive OS Runbook

## Deployment
This system is optimized for **Railway** and **Netlify**.

### Backend (Railway)
1. Push to `main` branch.
2. Railway will pick up changes in `apps/api`, `apps/worker`, and `apps/edge`.
3. Ensure Environment Variables (`DATABASE_URL`, `STRIPE_SECRET_KEY`, etc.) are set in the Railway dashboard.

### Frontend (Netlify)
1. Push to `main` branch.
2. Build command: `npm run build` (in `apps/web`).
3. Ensure `VITE_API_URL` points to the Railway gateway.

## Maintenance
- **Schema Migrations**: Handled automatically on startup in `apps/api/entrypoint.sh`.
- **Worker Logs**: Monitor `apps/worker` logs for Protopedia sync status.
- **Backups**: Standard Railway PostgreSQL backups are recommended.

## Troubleshooting
- **502 Bad Gateway**: Check if the target service (API/AI) is healthy in the Railway dashboard.
- **Empty Works**: Check worker logs. Verify if the Protopedia API is reachable and if the user ID `hatake` is correct.
