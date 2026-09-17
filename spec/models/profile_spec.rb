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
end
