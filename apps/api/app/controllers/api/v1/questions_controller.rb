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
        if params[:status] == 'pending'
          questions = Question.pending.order(created_at: :desc).limit(50)
        elsif params[:status] == 'all'
          questions = Question.order(created_at: :desc).limit(50)
        else
          questions = Question.answered.order(created_at: :desc).limit(50)
        end
        render json: questions
      end

      def update
        question = Question.find(params[:id])
        if question.update(question_params)
          question.update(status: 'answered') if question.answer.present?
          render json: { status: 'success', question: question }
        else
          render json: { status: 'error', errors: question.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def question_params
        params.require(:question).permit(:content, :twitter_handle, :answer, :status)
      end
    end
  end
end
