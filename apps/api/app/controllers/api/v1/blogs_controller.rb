require 'front_matter_parser'

module Api
  module V1
    class BlogsController < ApplicationController
      def index
        posts = []
        # Support both local dev and production paths
        base_path = Rails.root.join('content', 'blog')
        unless Dir.exist?(base_path)
            base_path = Rails.root.join('../../content/blog')
        end

        if Dir.exist?(base_path)
          Dir.glob("#{base_path}/*.md").each do |file_path|
            parsed = FrontMatterParser::Parser.parse_file(file_path)
            slug = File.basename(file_path, '.md')
            posts << {
              slug: slug,
              title: parsed['title'],
              date: parsed['date'],
              summary: parsed['summary'],
              # We don't send full content in index for performance
            }
          end
        end

        # Sort by date desc
        posts.sort_by! { |p| p[:date].to_s }.reverse!

        render json: posts
      end

      def show
        slug = params[:slug]
        
        base_path = Rails.root.join('content', 'blog')
        unless Dir.exist?(base_path)
            base_path = Rails.root.join('../../content/blog')
        end
        
        file_path = "#{base_path}/#{slug}.md"

        if File.exist?(file_path)
          content = File.read(file_path)
          render json: { content: content }
        else
          render json: { error: 'Post not found' }, status: 404
        end
      end
    end
  end
end
