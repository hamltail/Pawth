class User < ApplicationRecord
  USERNAME_REGEX = /\A(?!.*--)[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?\z/
  RESERVED_USERNAMES = YAML.load_file(
    Rails.root.join('config/reserved_usernames.yml')
  )['reserved'].map(&:downcase).freeze

  has_one_attached :avatar
  has_many :daily_posts, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         authentication_keys: [:login]

  before_validation :normalize_username

  validates :email, presence: true
  validates :username, presence: true, uniqueness: { case_sensitive: false }
  validates :display_name, length: { maximum: 20 }, allow_blank: true
  validates :profile_message, length: { maximum: 200 }, allow_blank: true

  validate :avatar_size_within_limit
  validate :avatar_type_allowed
  validate :username_is_not_reserved
  validate :username_is_valid_format_github_like

  attr_writer :login

  def login
    @login || self.username || self.email
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions).where(
        ['lower(username) = :value OR lower(email) = :value', { value: login.downcase }]
      ).first
    else
      where(conditions).first
    end
  end

  def posted_today?
    daily_posts.exists?(posted_on: Time.zone.today)
  end

  def display_name_or_username
    display_name.presence || username
  end

  private
    def avatar_size_within_limit
      return unless avatar.attached?
      if avatar.blob.byte_size > 1.megabyte
        errors.add(:avatar, 'は1MB以下のファイルをアップロードしてください。')
      end
    end

    def avatar_type_allowed
      return unless avatar.attached?
      allowed = %w[image/png image/jpeg image/gif image/webp]
      unless allowed.include?(avatar.blob.content_type)
        errors.add(:avatar, 'はPNG、JPEG、GIF、またはWebP形式でアップロードしてください。')
      end
    end

    def normalize_username
      self.username = username.to_s.downcase.strip.presence
    end

    def username_is_not_reserved
      return if username.blank?
      if RESERVED_USERNAMES.include?(username.downcase)
        errors.add(:username, 'は使用できません。')
      end
    end

    def username_is_valid_format_github_like
      return if username.blank?
      return if username.match?(USERNAME_REGEX)
      errors.add(
        :username,
        'は英数字と-のみ使用でき、先頭と末尾は英数字、--は不可、1〜39文字で入力してください。'
      )
    end
end
