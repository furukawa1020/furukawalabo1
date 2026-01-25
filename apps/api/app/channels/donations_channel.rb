class DonationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "donations_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
