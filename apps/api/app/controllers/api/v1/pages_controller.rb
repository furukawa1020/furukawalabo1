module Api
  module V1
    class PagesController < ApplicationController
      def show
        slug = params[:slug]
        # Security: Allow only alphanumeric + dash
        unless slug.match?(/\A[a-z0-9\-]+\z/)
          return render json: { error: 'Invalid slug' }, status: 400
        end

        path = Rails.root.join('content', 'pages', "#{slug}.md")
         # Fallback
        unless File.exist?(path)
            path = Rails.root.join('../../content/pages', "#{slug}.md")
        end

        if File.exist?(path)
          content = File.read(path)
          # We return raw content for frontend to parse frontmatter + markdown
          render json: { content: content }
        else
          render json: { error: 'Page not found' }, status: 404
        end
      end
    end
  end
end
