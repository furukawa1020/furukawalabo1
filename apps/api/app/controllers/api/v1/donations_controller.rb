module Api
  module V1
    class DonationsController < ApplicationController
      def create
        # Create Stripe Checkout Session
        Stripe.api_key = ENV['STRIPE_SECRET_KEY']
        
        session = Stripe::Checkout::Session.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'jpy',
              product_data: {
                name: '古川耕太郎への寄付 / Donation',
              },
              unit_amount: params[:amount] || 1000,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: "#{ENV['FRONTEND_URL']}/donate?status=success",
          cancel_url: "#{ENV['FRONTEND_URL']}/donate?status=cancel",
          metadata: {
            message: params[:message],
            donor_name: params[:donor_name]
          }
        })

        render json: { url: session.url }
      rescue Stripe::StripeError => e
        render json: { error: e.message }, status: 400
      end

      def webhook
        payload = request.body.read
        sig_header = request.env['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

        begin
          event = Stripe::Webhook.construct_event(
            payload, sig_header, endpoint_secret
          )
        rescue JSON::ParserError => e
          render json: { error: 'Invalid payload' }, status: 400
          return
        rescue Stripe::SignatureVerificationError => e
          render json: { error: 'Invalid signature' }, status: 400
          return
        end

        if event['type'] == 'checkout.session.completed'
          session = event['data']['object']
          
          # Fulfill the purchase...
          Donation.create!(
            amount: session['amount_total'],
            currency: session['currency'],
            status: 'succeeded',
            stripe_payment_intent_id: session['payment_intent'],
            message: session['metadata']['message'],
            donor_name: session['metadata']['donor_name']
          )
        end

        render json: { status: 'success' }
      end
    end
  end
end
