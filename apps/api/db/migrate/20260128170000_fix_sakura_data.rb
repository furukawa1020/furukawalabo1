class FixSakuraData < ActiveRecord::Migration[7.1]
  def up
    # Delete the incorrect $150 donation
    # Transaction ID retrieved from previous tool logs: SAKURA_1769586531
    target = Donation.find_by(transaction_id: 'SAKURA_1769586531')
    if target
      target.destroy
      puts "Deleted donation: #{target.transaction_id}"
    else
      puts "Donation SAKURA_1769586531 not found (already deleted?)"
    end
  end

  def down
    # Data fix is usually one-way
  end
end
