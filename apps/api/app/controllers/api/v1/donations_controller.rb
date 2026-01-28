module Api
  module V1
    class DonationsController < ApplicationController
      skip_before_action :verify_authenticity_token, only: [:webhook], raise: false
      
      # Verify BMC Signature ensures the request is actually from Buy Me a Coffee
      before_action :verify_signature, only: [:webhook]

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
        Rails.logger.info "BMC Webhook Params: #{params.inspect}"

        transaction_id = params[:support_id]
        
        if transaction_id.blank?
          Rails.logger.warn "BMC Webhook: Missing support_id"
          render json: { status: 'error', message: 'Missing support_id' }, status: 400
          return
        end

        donor_name = params[:supporter_name] || "Anonymous"
        unit_price = params[:support_coffee_price].to_f
        quantity = params[:support_coffees].to_i
        
        # Calculate amount.
        amount = (unit_price * quantity).to_i
        message = params[:support_note]

        if Donation.exists?(transaction_id: transaction_id)
          Rails.logger.info "BMC Webhook: Transaction #{transaction_id} already exists. Skipping."
          render json: { status: 'skipped', message: 'Transaction already processed' }
          return
        end

        donation = Donation.create!(
          transaction_id: transaction_id,
          amount: amount,
          currency: 'JPY',
          status: 'succeeded',
          donor_name: donor_name,
          message: message
        )
        
        Rails.logger.info "BMC Webhook: Created Donation #{donation.id} for #{amount}"

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

      private

      def verify_signature
        # Use the secret provided by the user (normally store in ENV)
        secret = ENV['BMC_WEBHOOK_SECRET'] || 'a618fdc3d44de958f8af2dd7d7f7c4fdad49e91803b19e7d0354e847ebb634d2af0ef325ec023a46'
        signature = request.headers['X-Signature-Sha256']

        if signature.blank?
          Rails.logger.warn "BMC Webhook: Missing Signature"
          render json: { error: 'Missing signature' }, status: 401
          return
        end

        # BMC documentation implies HMAC SHA256 of the raw body
        # However, Rails params might be parsed already.
        # Let's verify using the raw body.
        request.body.rewind
        payload_body = request.body.read
        
        computed_signature = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), secret, payload_body)

        if signature != computed_signature
          Rails.logger.warn "BMC Webhook: Invalid Signature. Got #{signature}, expected #{computed_signature}"
          # For debugging, we might want to log the mismatch but NOT block if we are unsure.
          # But since the user specifically asked about using the secret, let's enforce it.
          render json: { error: 'Invalid signature' }, status: 401
        end
      end
    end
  end
end
