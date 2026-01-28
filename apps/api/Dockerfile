# Updated 2026-01-28 to fix gem installation
FROM ruby:3.2.2-slim

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev git curl

WORKDIR /app

# Copy Gemfile AND Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install dependencies
RUN bundle install

COPY . .

RUN mkdir -p tmp/pids

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
