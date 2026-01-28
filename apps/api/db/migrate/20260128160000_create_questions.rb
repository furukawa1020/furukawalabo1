class CreateQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :questions do |t|
      t.text :content, null: false
      t.string :twitter_handle
      t.string :status, default: 'pending'
      t.string :ip_address

      t.timestamps
    end
  end
end
