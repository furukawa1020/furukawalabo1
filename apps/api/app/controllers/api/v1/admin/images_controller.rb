module Api
  module V1
    module Admin
      class ImagesController < ApplicationController
        skip_before_action :verify_authenticity_token, raise: false

        def create
          file = params[:file]
          if file
            # Ensure directory exists
            upload_dir = Rails.root.join('content', 'images')
            FileUtils.mkdir_p(upload_dir)

            # Save file
            filename = file.original_filename
            path = upload_dir.join(filename)
            File.open(path, 'wb') do |f|
              f.write(file.read)
            end

            render json: { 
              status: 'success', 
              url: "/images/#{filename}", 
              message: "Saved to content/images/#{filename}. Run sync to publish." 
            }
          else
            render json: { error: 'No file provided' }, status: 400
          end
        end

        def index
            # List existing images
            upload_dir = Rails.root.join('content', 'images')
            files = []
            if Dir.exist?(upload_dir)
                files = Dir.entries(upload_dir)
                           .select { |f| !File.directory? f }
                           .map { |f| { name: f, url: "/images/#{f}" } }
            end
            render json: { images: files }
        end
      end
    end
  end
end
