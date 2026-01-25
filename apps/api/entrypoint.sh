#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Run migrations (safe to run on every start)
echo "Running db:prepare..."
bundle exec rake db:prepare
echo "Database prepared."

# Then exec the container's main process (what's set as CMD in the Dockerfile).
echo "Starting main process..."
exec "$@"
