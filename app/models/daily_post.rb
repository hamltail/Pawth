class DailyPost < ApplicationRecord
  belongs_to :user
  validates :posted_on, presence: true
  validates :content, presence: true, length: { maximum: 365 }
  validate :only_one_post_per_day, on: :create

  private
    def only_one_post_per_day
      if user && user.daily_posts.where(posted_on: posted_on).exists?
        errors.add(:base, "今日はすでに投稿済みだよ。")
      end
    end
end
