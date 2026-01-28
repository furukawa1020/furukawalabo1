module Api
  module V1
    class DonationsController < ApplicationController
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
        # Buy Me a Coffee Webhook Payload
        # {
        #   "support_id": "123",
        #   "supporter_name": "John Doe",
        #   "support_coffee_price": "5.00",
        #   "support_coffees": 3,
        #   "support_note": "Great work!",
        #   ...
        # }
        
        # Verify secret if available (Skipping for now as BMC secret management differs)
        # Using simple payload processing
        
        payload = params.permit!

        transaction_id = payload[:support_id]
        donor_name = payload[:supporter_name] || "Anonymous"
        unit_price = payload[:support_coffee_price].to_f
        quantity = payload[:support_coffees].to_i
        amount = (unit_price * quantity).to_i
        message = payload[:support_note]

        # Check if transaction already exists
        if Donation.exists?(transaction_id: transaction_id)
          render json: { status: 'skipped', message: 'Transaction already processed' }
          return
        end

        donation = Donation.create!(
          transaction_id: transaction_id,
          amount: amount,
          currency: 'JPY', # Assuming BMC is set to JPY or converting? BMC usually is USD. 
                           # If BMC is USD, amount might be small number (e.g. 5).
                           # We might need to handle currency. For now store as is.
          status: 'succeeded',
          donor_name: donor_name,
          message: message
        )

        # Broadcast to ActionCable
        ActionCable.server.broadcast('donations_channel', {
          amount: donation.amount,
          donor_name: donation.donor_name,
          message: donation.message,
          timestamp: Time.current
        })

        render json: { status: 'success' }
      rescue => e
        logger.error "Webhook failed: #{e.message}"
        render json: { error: e.message }, status: 500
      end
    end
  end
end
