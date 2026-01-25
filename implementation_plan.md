# Backend Recovery Plan

## Diagnosis
The backend failure ("SQL, Ruby, Go not working") is likely caused by **missing database migrations**.
The Docker configuration does not appear to automatically run `rail db:migrate` upon startup.
Without the `works` table, the Go worker crashes immediately when trying to insert data, and the API returns 500 errors.

## Action Plan

### 1. Fix Docker Configuration
- Update `apps/api/Dockerfile` or `docker-compose.yml` to include a startup script that runs migrations.
- Ensure `DATABASE_URL` is correctly propagated.

### 2. Verify Database Settings
- Rails `database.yml` is expecting `furukawa_api_development` but Docker is creating `furukawa_archive_production`.
- We will standardize the database name to `furukawa_archive_production` in all configs to avoid confusion.

### 3. Restart & Verify
- Rebuild containers.
- Check if `works` table exists.
- Verify API health endpoint (if not exists, create one).

## Technical Details

**Current Issue:**
- Worker puts: `INSERT INTO works...` -> Error: `relation "works" does not exist`.
- API gets: `SELECT * FROM works...` -> Error: `relation "works" does not exist`.

**Resolution:**
Add `bin/rails db:prepare` to the Docker command.
