require 'rails_helper'

RSpec.describe DailyPost, type: :model do
  let(:user) { FactoryBot.create(:user) }
  let(:date_today) { Date.today }

  it 'contentが必須であること' do
    post = DailyPost.new(content: nil, user: user, posted_on: date_today)
    expect(post).not_to be_valid
  end

  it 'posted_onが必須であること' do
    post = DailyPost.new(content: 'sample', user: user, posted_on: nil)
    expect(post).not_to be_valid
  end

  it 'userが必須であること' do
    post = DailyPost.new(content: 'sample', user: nil, posted_on: date_today)
    expect(post).not_to be_valid
  end

  describe 'contentの文字数制限' do
    it '365文字はOK' do
      post = DailyPost.new(content: 'a' * 365, user: user, posted_on: date_today)
      expect(post).to be_valid
    end

    it '366文字はNG' do
      post = DailyPost.new(content: 'a' * 366, user: user, posted_on: date_today)
      expect(post).not_to be_valid
    end
  end
end
