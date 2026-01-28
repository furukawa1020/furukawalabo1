class UpdateDonationsSchema < ActiveRecord::Migration[7.1]
  def change
    # Rename stripe_payment_id to transaction_id to be more generic (or specifically for BMC)
    rename_column :donations, :stripe_payment_id, :transaction_id
    
    # Add donor_name column
    add_column :donations, :donor_name, :string
  end
end
