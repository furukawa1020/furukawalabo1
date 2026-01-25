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
          # Trigger Go Worker sync
          worker_url = ENV['WORKER_URL'] || 'http://localhost:8080'
          auth_token = ENV['WORKER_AUTH_TOKEN'] || 'default-secret-token'

          begin
            response = HTTP.auth("Bearer #{auth_token}")
                          .timeout(5)
                          .post("#{worker_url}/sync")

            if response.status.success?
              render json: { 
                status: 'success', 
                message: 'Protopedia sync triggered successfully via Worker',
                worker_response: JSON.parse(response.body.to_s)
              }
            else
              render json: { 
                status: 'error', 
                message: 'Worker returned error',
                code: response.status
              }, status: :bad_gateway
            end
          rescue => e
            render json: { 
              status: 'error', 
              message: "Failed to trigger sync: #{e.message}" 
            }, status: :internal_server_error
          end
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
