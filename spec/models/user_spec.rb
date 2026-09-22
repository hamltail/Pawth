require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'username' do
    it '4文字は無効であること' do
      user = build(:user, username: 'abcd')

      expect(user).to be_invalid
      expect(user.errors[:username]).to be_present
    end

    it '5文字は有効であること' do
      user = build(:user, username: 'abcde')

      expect(user).to be_valid
    end

    it '39文字は有効であること' do
      user = build(:user, username: 'a' * 39)

      expect(user).to be_valid
    end

    it '40文字は無効であること' do
      user = build(:user, username: 'a' * 40)

      expect(user).to be_invalid
      expect(user.errors[:username]).to be_present
    end
  end
end
