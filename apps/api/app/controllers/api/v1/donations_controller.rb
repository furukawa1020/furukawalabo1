module Api
  module V1
    class DonationsController < ApplicationController
      # Ensure CSRF check is skipped for webhooks (even if API mode, good practice)
      skip_before_action :verify_authenticity_token, only: [:webhook], raise: false

      def index
        recent_donations = Donation.where(status: 'succeeded')
                                   .order(created_at: :desc)
                                   .limit(10)
                                   .select(:id, :amount, :donor_name, :message, :created_at)

        top_donations = Donation.where(status: 'succeeded')
                                .order(amount: :desc)
                                .limit(5)
                                .select(:id, :amount, :donor_name, :message, :created_at)

        total_amount = Donation.where(status: 'succeeded').sum(:amount)
        total_count = Donation.where(status: 'succeeded').count

        render json: {
          recent: recent_donations,
          top: top_donations,
          stats: {
            total_amount: total_amount,
            total_count: total_count
          }
        }
      end

      def webhook
        # Log the raw parameters for debugging
        Rails.logger.info "BMC Webhook Params: #{params.inspect}"

        # Buy Me a Coffee Webhook Payload
        # {
        #   "support_id": "123",
        #   "supporter_name": "John Doe",
        #   "support_coffee_price": "5.00",
        #   "support_coffees": 3,
        #   "support_note": "Great work!",
        #   ...
        # }
        
        transaction_id = params[:support_id]
        
        # Guard clause for test webhook or missing id
        if transaction_id.blank?
          Rails.logger.warn "BMC Webhook: Missing support_id"
          render json: { status: 'error', message: 'Missing support_id' }, status: 400
          return
        end

        donor_name = params[:supporter_name] || "Anonymous"
        unit_price = params[:support_coffee_price].to_f
        quantity = params[:support_coffees].to_i
        
        # Calculate amount. 
        # CAUTION: BMC sends unit_price in the currency set in dashboard.
        # If USD "5.00", this becomes 5. If JPY "500", this becomes 500.
        # Minimal handling: If amount is excessively small (< 100) and we suspect JPY, 
        # it might be USD. But for now, trust the value.
        amount = (unit_price * quantity).to_i
        message = params[:support_note]

        # Check if transaction already exists
        if Donation.exists?(transaction_id: transaction_id)
          Rails.logger.info "BMC Webhook: Transaction #{transaction_id} already exists. Skipping."
          render json: { status: 'skipped', message: 'Transaction already processed' }
          return
        end

        donation = Donation.create!(
          transaction_id: transaction_id,
          amount: amount,
          currency: 'JPY', # TODO: Detect currency from payload if available
          status: 'succeeded',
          donor_name: donor_name,
          message: message
        )
        
        Rails.logger.info "BMC Webhook: Created Donation #{donation.id} for #{amount}"

        # Broadcast to ActionCable
        ActionCable.server.broadcast('donations_channel', {
          amount: donation.amount,
          donor_name: donation.donor_name,
          message: donation.message,
          timestamp: Time.current
        })

        render json: { status: 'success' }
      rescue => e
        Rails.logger.error "BMC Webhook Failed: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: e.message }, status: 500
      end
    end
  end
end
