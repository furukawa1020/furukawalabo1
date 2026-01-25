class InitSchema < ActiveRecord::Migration[7.1]
  def change
    create_table :works do |t|
      t.string :external_id, null: false
      t.string :title, null: false
      t.text :summary
      t.string :url
      t.string :thumbnail_url
      t.integer :like_count, default: 0
      t.datetime :published_at
      t.string :source, default: 'protopedia'
      t.jsonb :tags, default: []

      t.timestamps
    end
    add_index :works, :external_id, unique: true

    create_table :donations do |t|
      t.string :stripe_payment_id
      t.integer :amount
      t.text :message
      t.string :status
      t.boolean :is_public, default: false

      t.timestamps
    end

    create_table :cookie_consents do |t|
      t.string :user_identifier
      t.jsonb :categories
      t.string :ip_address

      t.timestamps
    end
  end
end
