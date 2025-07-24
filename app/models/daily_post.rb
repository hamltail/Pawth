class DailyPost < ApplicationRecord
  belongs_to :user
  validates :posted_on, presence: true
  validates :content, presence: true, length: { maximum: 365 }
end
