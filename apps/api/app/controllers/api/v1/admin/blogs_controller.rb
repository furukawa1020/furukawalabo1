module Api
  module V1
    module Admin
      class BlogsController < BaseController


        # GET /api/v1/admin/blogs
        def index
          index_path = Rails.root.join('content', 'blog', 'index.json')
          if File.exist?(index_path)
            posts = JSON.parse(File.read(index_path))
            # Sort by date desc
            posts.sort_by! { |p| p['date'] }.reverse!
            render json: { posts: posts }
          else
            render json: { posts: [] }
          end
        end

        # GET /api/v1/admin/blogs/:slug
        def show
          slug = params[:slug]
          file_path = Rails.root.join('content', 'blog', "#{slug}.md")
          
          if File.exist?(file_path)
            content = File.read(file_path)
            # Remove frontmatter for editing if present (simplified)
            # For now, just return the whole content. 
            # Ideally the editor handles frontmatter or we parse it here.
            # Let's assume we return raw content.
            render json: { content: content }
          else
            render json: { error: 'Post not found' }, status: 404
          end
        end

        # POST /api/v1/admin/blogs
        def create
          title = params[:title]
          slug = params[:slug].presence || title.parameterize
          date = params[:date] || Date.today.to_s
          summary = params[:summary] || ''
          body = params[:body] || ''

          # Make sure slug is unique? 
          # For now, overwrite if exists or user should choose unique slug.
          
          file_content = <<~MD
            ---
            slug: #{slug}
            title: #{title}
            date: #{date}
            summary: #{summary}
            ---

            #{body}
          MD

          file_path = Rails.root.join('content', 'blog', "#{slug}.md")
          File.write(file_path, file_content)

          update_index_json

          render json: { status: 'created', slug: slug }
        end

        # PUT /api/v1/admin/blogs/:slug
        def update
          old_slug = params[:slug] # from route
          new_slug = params[:new_slug] || old_slug
          title = params[:title]
          date = params[:date]
          summary = params[:summary]
          body = params[:body]

          # If slug changed, rename file
          old_path = Rails.root.join('content', 'blog', "#{old_slug}.md")
          new_path = Rails.root.join('content', 'blog', "#{new_slug}.md")

          if old_slug != new_slug && File.exist?(old_path)
            File.rename(old_path, new_path)
          end

          file_content = <<~MD
            ---
            slug: #{new_slug}
            title: #{title}
            date: #{date}
            summary: #{summary}
            ---

            #{body}
          MD

          File.write(new_path, file_content)

          update_index_json

          render json: { status: 'updated', slug: new_slug }
        end

        # DELETE /api/v1/admin/blogs/:slug
        def destroy
          slug = params[:slug]
          file_path = Rails.root.join('content', 'blog', "#{slug}.md")

          if File.exist?(file_path)
            File.delete(file_path)
            update_index_json
            render json: { status: 'deleted' }
          else
            render json: { error: 'Post not found' }, status: 404
          end
        end

        private

        def update_index_json
          dir = Rails.root.join('content', 'blog')
          index_path = dir.join('index.json')
          
          posts = []
          Dir.glob(dir.join('*.md')).each do |file|
            raw = File.read(file)
            # Naive frontmatter parser
            if raw =~ /^---\s+(.*?)\s+---/m
              frontmatter = YAML.safe_load($1)
              posts << frontmatter if frontmatter
            end
          end

          # Sort by date desc
          posts.sort_by! { |p| p['date'].to_s }.reverse!

          File.write(index_path, JSON.pretty_generate(posts))
        end
      end
    end
  end
end
