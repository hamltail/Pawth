class DailyPost < ApplicationRecord
  EDIT_COUNT_LIMIT = 2

  belongs_to :user
  validates :posted_on, presence: true
  validates :content, presence: true, length: { maximum: 365 }
  validate :only_one_post_per_day, on: :create
  validate :edit_count_within_limit, on: :update

  private
    def only_one_post_per_day
      if user && user.daily_posts.where(posted_on: posted_on).exists?
        errors.add(:base, "今日はすでに投稿済みだよ。")
      end
    end

    def edit_count_within_limit
      if edit_count > EDIT_COUNT_LIMIT
        errors.add(:base, "編集は#{EDIT_COUNT_LIMIT}回までだよ。")
      end
    end
end
