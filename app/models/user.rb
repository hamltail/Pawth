class User < ApplicationRecord
  RESERVED_USERNAMES = YAML.load_file(
    Rails.root.join("config/reserved_usernames.yml")
  )["reserved"].map(&:downcase).freeze

  has_one_attached :avatar
  has_many :daily_posts, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         authentication_keys: [ :login ]

  validates :email, presence: true
  validates :username, presence: true, uniqueness: true
  validates :display_name, length: { maximum: 20 }, allow_blank: true
  validates :profile_message, length: { maximum: 200 }, allow_blank: true
  validate :username_is_not_reserved

  attr_writer :login

  def login
    @login || self.username || self.email
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions).where(
        [ "lower(username) = :value OR lower(email) = :value", { value: login.downcase } ]
      ).first
    else
      where(conditions).first
    end
  end

  private
    def username_is_not_reserved
      if RESERVED_USERNAMES.include?(username.downcase)
        errors.add(:username, "は使用できません")
      end
    end
end
