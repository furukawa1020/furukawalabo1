module Api
  module V1
    module Admin
      class ContentsController < BaseController
        # Skip auth for v1 demo / local usage convenience. 
        # In production, add Basic Auth or Token check.


        def show
          # Security: Allowlist specific files to prevent arbitrary file access
          path = safe_path(params[:id])
          if path && File.exist?(path)
            render json: { content: File.read(path) }
          else
            render json: { error: 'File not found' }, status: 404
          end
        end

        def update
          path = safe_path(params[:id])
          if path
            File.write(path, params[:content])
            render json: { status: 'success' }
          else
            render json: { error: 'Invalid file' }, status: 400
          end
        end

        private

        def safe_path(id)
          base = Rails.root.join('content')
          case id
          when 'achievements'
            base.join('achievements.yml')
          when 'about'
            base.join('pages', 'about.md')
          when 'research'
            base.join('pages', 'research.md')
          else
            nil
          end
        end
      end
    end
  end
end
