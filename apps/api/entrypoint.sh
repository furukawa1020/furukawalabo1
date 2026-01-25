#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Check if Rails is initialized
if [ ! -f "config.ru" ]; then
  echo "Rails not initialized. Running 'rails new'..."
  rails new . --api --database=postgresql --force --skip-git --skip-bundle
  bundle install
  bundle install
  
  # Generate Work model for Protopedia sync
  if [ ! -f "app/models/work.rb" ]; then
    rails generate model Work \
      title:string \
      summary:text \
      url:string \
      thumbnail_url:string \
      like_count:integer \
      published_at:datetime \
      external_id:string:index \
      tags:string:array
    
    rails db:migrate
  fi

  # Generate Donation model
  if [ ! -f "app/models/donation.rb" ]; then
    rails generate model Donation \
      amount:integer \
      currency:string \
      status:string \
      stripe_payment_intent_id:string \
      message:text \
      donor_name:string
    
    rails db:migrate
  fi
fi

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
