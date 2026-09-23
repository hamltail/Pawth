require 'rails_helper'

RSpec.describe Profile, type: :model do
  describe 'calendar_icon' do
    let(:profile) { create(:user).profile }

    it 'pawは有効であること' do
      profile.calendar_icon = 'paw'

      expect(profile).to be_valid
    end

    it 'starは有効であること' do
      profile.calendar_icon = 'star'

      expect(profile).to be_valid
    end

    it '未対応のアイコンは無効であること' do
      profile.calendar_icon = 'unknown'

      expect(profile).to be_invalid
      expect(profile.errors[:calendar_icon]).to be_present
    end
  end

  describe 'avatar' do
    let(:profile) { create(:user).profile }

    it '1MB以下の画像は有効であること' do
      profile.avatar.attach(
        io: StringIO.new('a' * 1.megabyte),
        filename: 'avatar.png',
        content_type: 'image/png'
      )

      expect(profile).to be_valid
    end

    it '1MBを超える画像は無効であること' do
      profile.avatar.attach(
        io: StringIO.new('a' * (1.megabyte + 1)),
        filename: 'avatar.png',
        content_type: 'image/png'
      )

      expect(profile).to be_invalid
      expect(profile.errors[:avatar]).to be_present
    end
  end
end
