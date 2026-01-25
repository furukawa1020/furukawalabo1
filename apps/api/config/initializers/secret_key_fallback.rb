# Fallback for SECRET_KEY_BASE to prevent boot crashes if not set in Railway
# WARNING: In a real banking app this is insecure, but for a portfolio it ensures stability.
if ENV["SECRET_KEY_BASE"].blank?
  if Rails.env.production?
    Rails.logger.warn "⚠️ SECRET_KEY_BASE not set. Using temporary fallback."
    ENV["SECRET_KEY_BASE"] = "deadbeef" * 16 # 128 chars
  end
end
