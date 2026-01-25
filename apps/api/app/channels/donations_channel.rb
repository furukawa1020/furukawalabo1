class DonationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "donations_channel"
    
    # Increment online count
    count = ActionCable.server.pubsub.redis_connection_for_subscriptions.incr("online_users")
    broadcast_visitor_count(count)
  end

  def unsubscribed
    # Decrement online count
    count = ActionCable.server.pubsub.redis_connection_for_subscriptions.decr("online_users")
    broadcast_visitor_count(count)
  end

  private

  def broadcast_visitor_count(count)
    ActionCable.server.broadcast("donations_channel", { type: "visitor_count", count: count })
  end
end
