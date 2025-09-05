class Profile < ApplicationRecord
  belongs_to :user
  has_one_attached :avatar

  validates :display_name, length: { maximum: 20 }, allow_blank: true
  validate :avatar_size_within_limit
  validate :avatar_type_allowed

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
end
