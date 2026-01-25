module Api
  module V1
    class WorksController < ApplicationController
      def index
        # Fetch works sorted by published date or logic
        works = Work.order(published_at: :desc)

        # Filtering logic
        if params[:category].present?
            # If tags or category column exists. 
            # Our schema has JSONB tags.
            # works = works.where("tags @> ?", [params[:category]].to_json) 
            # Simplified for v1: simple text search or tag overlap
        end

        render json: { works: works }
      end

      def show
        work = Work.find_by(external_id: params[:id]) || Work.find(params[:id])
        render json: work
      end
    end
  end
end
