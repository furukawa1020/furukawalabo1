class Question < ApplicationRecord
  validates :content, presence: true
  validates :status, inclusion: { in: %w[pending answered rejected], message: "%{value} is not a valid status" }
  
  scope :pending, -> { where(status: 'pending') }
  scope :answered, -> { where(status: 'answered') }
end
