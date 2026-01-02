class DailyPost < ApplicationRecord
  EDIT_COUNT_LIMIT = 3
  CONTENT_MAX_LENGTH = 365

  attr_accessor :skip_destroy_guard

  belongs_to :user

  before_update :increment_edit_count_if_changed, if: :will_save_change_to_content?
  before_validation :set_posted_on_today, on: :create
  before_destroy :prevent_destroy_if_today

  validates :posted_on, presence: true
  validates :content, presence: true

  validate :content_length_within_limit
  validate :only_one_post_per_day, on: :create
  validate :edit_count_within_limit, on: :update
  validate :only_today_can_be_edited, on: :update

  scope :recent_first, -> { order(posted_on: :desc) }
  scope :search_text, ->(query) {
    where('content LIKE ?', "%#{sanitize_sql_like(query)}%") if query.present?
  }
  scope :by_year, ->(year) {
    where('EXTRACT(YEAR FROM posted_on) = ?', year.to_i) if year.present?
  }
  scope :by_month, ->(month, year = nil) {
    if month.present? && year.present?
      where('EXTRACT(MONTH FROM posted_on) = ? AND EXTRACT(YEAR FROM posted_on) = ?', month.to_i, year.to_i)
    end
  }

  def edit_remaining_count
    [EDIT_COUNT_LIMIT - edit_count, 0].max
  end

  private

  def set_default_edit_count
    self.edit_count ||= 0
  end

  def set_posted_on_today
    self.posted_on ||= Date.current
  end

  def content_length_within_limit
    max = CONTENT_MAX_LENGTH
    length = content.to_s.scan(/\X/).length
    if length > max
      errors.add(:base, :content_too_long, max: max)
    end
  end

  def only_one_post_per_day
    if user && user.daily_posts.where(posted_on: posted_on).exists?
      errors.add(:base, :already_posted_today)
    end
  end

  def edit_count_within_limit
    next_count = edit_count.to_i + (will_save_change_to_content? ? 1 : 0)
    if next_count > EDIT_COUNT_LIMIT
      errors.add(:base, :edit_limit_exceeded, limit: EDIT_COUNT_LIMIT)
    end
  end

  def only_today_can_be_edited
    if posted_on != Date.current
      errors.add(:base, :edit_only_today, date: I18n.l(posted_on, format: :default))
    end
  end

  def increment_edit_count_if_changed
    self.edit_count = edit_count.to_i + 1
  end

  def prevent_destroy_if_today
    return if destroyed_by_association&.name == :daily_posts

    return unless posted_on == Date.current
    errors.add(:base, :cannot_destroy_today)
    throw :abort
  end
end
