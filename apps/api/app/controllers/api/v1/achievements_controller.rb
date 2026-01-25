require 'yaml'

module Api
  module V1
    class AchievementsController < ApplicationController
      def index
        # In production this path needs to vary based on deployment
        # For simple docker compose, we mount content at /content
        # Let's assume we copy content to /app/content in Dockerfile for API if needed, 
        # or mount it via volume in docker-compose.
        # Check docker-compose.yml: apps/api:/app -> content is at ../../content locally.
        # In container: if we mount content at /app/content, it works.
        # Let's adjust docker-compose to mount content for API.
        
        path = Rails.root.join('content', 'achievements.yml')
        # Fallback for dev if mount is different
        unless File.exist?(path)
          path = Rails.root.join('../../content/achievements.yml') 
        end

        if File.exist?(path)
          data = YAML.load_file(path)
          render json: data
        else
          render json: { error: 'Achievements data not found' }, status: 404
        end
      end
    end
  end
end
