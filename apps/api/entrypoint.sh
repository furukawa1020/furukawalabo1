#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Run migrations (safe to run on every start)
echo "Running db:prepare..."
bundle exec rake db:prepare
echo "Database prepared."

# Trigger Protopedia sync (will fail gracefully if Worker not ready)
echo "Triggering Protopedia works sync..."
bundle exec rake protopedia:sync || echo "Sync will run when Worker is ready."

# Then exec the container's main process (what's set as CMD in the Dockerfile).
echo "Starting main process..."
exec "$@"
