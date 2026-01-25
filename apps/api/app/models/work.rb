class Work < ApplicationRecord
    # Schema: 
    # title, summary, url, thumbnail_url, like_count, external_id, published_at, tags (jsonb)
    
    validates :external_id, presence: true, uniqueness: true
end
