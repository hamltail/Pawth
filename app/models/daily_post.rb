class DailyPost < ApplicationRecord
  EDIT_COUNT_LIMIT = 2

  belongs_to :user
  validates :posted_on, presence: true
  validates :content, presence: true, length: { maximum: 365 }
  validate :only_one_post_per_day, on: :create
  validate :edit_count_within_limit, on: :update
  validate :only_today_can_be_edited, on: :update

  scope :recent_first, -> { order(posted_on: :desc) }
  scope :search_text, ->(query) {
    where("content LIKE ?", "%#{sanitize_sql_like(query)}%") if query.present?
  }
  scope :by_year, ->(year) {
    where("strftime('%Y', posted_on) = ?", year.to_s) if year.present?
  }
  scope :by_month, ->(month, year = nil) {
    if month.present? && year.present?
      where("strftime('%m', posted_on) = ?", format("%02d", month))
    end
  }

  def edit_remaining_count
    [ EDIT_COUNT_LIMIT - edit_count, 0 ].max
  end

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

    def only_today_can_be_edited
      if posted_on != Date.today
        errors.add(:base, "編集できるのは当日（#{posted_on.strftime('%Y-%m-%d')}）だけだよ。")
      end
    end
end
