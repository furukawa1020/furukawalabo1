class Donation < ApplicationRecord
  validates :amount, presence: true
  validates :status, presence: true
end
