class User < ApplicationRecord
  has_one_attached :avatar
  has_many :daily_posts, dependent: :destroy

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         authentication_keys: [ :login ]

  validates :email, presence: true
  validates :username, presence: true, uniqueness: true
  validates :display_name, length: { maximum: 20 }, allow_blank: true
  validates :profile_message, length: { maximum: 200 }, allow_blank: true

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
end
