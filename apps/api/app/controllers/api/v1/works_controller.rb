module Api
  module V1
    class WorksController < ApplicationController
      def index
        # Cache the works list for 1 hour
        data = Rails.cache.fetch("works/all", expires_in: 1.hour) do
          works = Work.order(published_at: :desc)
          { works: works.to_a }
        end

        render json: data
      end

      def show
        work = Work.find_by(external_id: params[:id]) || Work.find(params[:id])
        render json: work
      end
    end
  end
end
