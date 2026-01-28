module Api
  module V1
    class QuestionsController < ApplicationController
      def create
        question = Question.new(question_params)
        question.ip_address = request.remote_ip
        
        if question.save
          render json: { status: 'success', question: question }, status: :created
        else
          render json: { status: 'error', errors: question.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def index
        # For now, maybe just return answered questions publicly?
        # Or if this is for admin, we might need auth later.
        # Let's return answered questions for public view if needed.
        questions = Question.answered.order(created_at: :desc).limit(50)
        render json: questions
      end

      private

      def question_params
        params.require(:question).permit(:content, :twitter_handle)
      end
    end
  end
end
