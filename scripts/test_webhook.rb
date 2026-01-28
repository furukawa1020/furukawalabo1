require 'net/http'
require 'uri'
require 'json'
require 'openssl'

# Configuration
# Replace this with your actual production URL if checking deployed version
# e.g. "https://web-production-xxxx.up.railway.app/api/v1/webhook/bmc"
TARGET_URL = ARGV[0] || "http://localhost:3000/api/v1/webhook/bmc"
SECRET = "a618fdc3d44de958f8af2dd7d7f7c4fdad49e91803b19e7d0354e847ebb634d2af0ef325ec023a46"

# Payload representing a fake donation
payload = {
  support_id: "SAKURA_1.5_#{Time.now.to_i}", # Unique ID
  supporter_name: "とくめー",
  support_coffee_price: "1.50", 
  support_coffees: 1,
  support_note: "応援！（1.5ドル）",
  support_email: "sakura@example.com"
} # Note: BMC sends flat JSON (not nested) or URL encoded form params usually? 
# In logic we saw payload = params.permit!, so it handles both JSON or Form matchers.
# BMC docs say JSON.

json_payload = payload.to_json

# Calculate Signature
digest = OpenSSL::Digest.new('sha256')
signature = OpenSSL::HMAC.hexdigest(digest, SECRET, json_payload)

puts "Target: #{TARGET_URL}"
puts "Payload: #{json_payload}"
puts "Signature: #{signature}"
puts "---"

uri = URI.parse(TARGET_URL)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = (uri.scheme == "https")

request = Net::HTTP::Post.new(uri.path)
request.add_field('Content-Type', 'application/json')
request.add_field('X-Signature-Sha256', signature)
request.body = json_payload

begin
  response = http.request(request)
  puts "Response Code: #{response.code}"
  puts "Response Body: #{response.body}"
rescue => e
  puts "Error sending request: #{e.message}"
end
