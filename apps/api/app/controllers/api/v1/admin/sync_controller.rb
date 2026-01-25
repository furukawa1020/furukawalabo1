module Api
  module V1
    module Admin
      class SyncController < ApplicationController
        # Simple token authentication
        before_action :authenticate_admin!, except: [:force_sync]

        def protopedia
          trigger_sync
        end

        def force_sync
          # Public endpoint for initial setup - works via browser GET
          trigger_sync
        end

        private

        def trigger_sync
          # Fallback: Direct sync in Rails to avoid Worker connection issues
          require 'open-uri'
          require 'nokogiri'

          work_ids = [
            "6345", "6347", "6348", "6349", "6549", "6554", "6555", "6613", "6692", "6694",
            "7255", "7408", "7495", "7496", "7527", "7528", "7529", "7538", "7539", "7553",
            "7571", "7600", "7617", "7648", "7672", "7694", "7833", "7834", "7842", "7844",
            "7852", "7866", "7889", "7895", "7908", "7916", "7952", "7984", "7995", "8059",
            "8097"
          ]

          success_count = 0
          errors = []

          # Run in a separate thread to avoid timeout
          Thread.new do
            work_ids.each do |id|
              begin
                url = "https://protopedia.net/prototype/#{id}"
                html = URI.open(url).read
                doc = Nokogiri::HTML(html)

                title = doc.title.split(' | ').first
                description = doc.at('meta[name="description"]')&.[]('content') || ''
                # Try og:image first, fallback to None
                thumbnail_url = doc.at('meta[property="og:image"]')&.[]('content')
                
                # Create or Update
                work = Work.find_or_initialize_by(external_id: id)
                work.update(
                  title: title,
                  summary: description,
                  url: url,
                  thumbnail_url: thumbnail_url,
                  published_at: Time.current,
                  tags: ["Protopedia"]
                )
                success_count += 1
              rescue => e
                Rails.logger.error "Failed to sync work #{id}: #{e.message}"
                errors << { id: id, error: e.message }
              end
              sleep(0.5) # Be gentle to the target server
            end
            Rails.logger.info "Direct Sync Completed: #{success_count}/#{work_ids.length} works synced."
          end

          render json: { 
            status: 'success', 
            message: 'Direct sync started in background. Please wait ~30 seconds and refresh /works.',
            target_count: work_ids.length
          }
        end

        def authenticate_admin!
          admin_token = ENV['ADMIN_API_TOKEN']
          
          # Development fallback
          if Rails.env.development? && admin_token.blank?
            return true
          end

          auth_header = request.headers['Authorization']
          unless auth_header == "Bearer #{admin_token}"
            render json: { error: 'Unauthorized' }, status: :unauthorized
          end
        end
      end
    end
  end
end
