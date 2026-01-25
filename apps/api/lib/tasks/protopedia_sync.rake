namespace :protopedia do
  desc "Trigger Protopedia sync via Worker HTTP endpoint"
  task sync: :environment do
    require 'net/http'
    require 'uri'
    
    worker_url = ENV['WORKER_URL'] || 'http://localhost:8080'
    auth_token = ENV['WORKER_AUTH_TOKEN'] || 'default-secret-token'
    
    begin
      uri = URI("#{worker_url}/sync")
      http = Net::HTTP.new(uri.host, uri.port)
      http.open_timeout = 5
      http.read_timeout = 60 # Allow time for sync to complete
      
      request = Net::HTTP::Post.new(uri.path)
      request['Authorization'] = "Bearer #{auth_token}"
      
      puts "🔄 Triggering Protopedia sync at #{worker_url}/sync..."
      response = http.request(request)
      
      if response.is_a?(Net::HTTPSuccess)
        puts "✅ Sync triggered successfully: #{response.body}"
      else
        puts "⚠️ Sync trigger returned #{response.code}: #{response.body}"
      end
    rescue => e
      puts "❌ Failed to trigger sync: #{e.message}"
      puts "   (This is normal if Worker hasn't started yet. Sync will run automatically when Worker starts.)"
    end
  end
end
