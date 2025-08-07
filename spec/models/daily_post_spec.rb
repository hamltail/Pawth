require 'rails_helper'

RSpec.describe DailyPost, type: :model do
  let(:user) { FactoryBot.create(:user) }
  let(:date_today) { Date.today }
  let(:date_yesterday) { Date.yesterday }

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

  describe 'only_one_post_per_day' do
    it '同じ日に2回投稿するとエラーになる' do
      DailyPost.create!(content: 'first post', user: user, posted_on: date_today)
      second_post = DailyPost.new(content: 'second post', user: user, posted_on: date_today)
      expect(second_post).not_to be_valid
      expect(second_post.errors[:base]).to include("今日はすでに投稿済みだよ。")
    end

    it '別の日なら投稿できる' do
      DailyPost.create!(content: 'first post', user: user, posted_on: date_yesterday)
      second_post = DailyPost.new(content: 'second post', user: user, posted_on: date_today)
      expect(second_post).to be_valid
    end
  end

  describe 'edit_count_within_limit' do
    it '編集回数が2回を超えるとエラーになる' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_today, edit_count: 2)
      post.edit_count = 3
      expect(post).not_to be_valid
      expect(post.errors[:base]).to include("編集は2回までだよ。")
    end

    it '編集回数が2回以下ならOK' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_today, edit_count: 1)
      post.edit_count = 2
      expect(post).to be_valid
    end
  end

  describe 'only_today_can_be_edited' do
    it '昨日の投稿は編集できない' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_yesterday)
      post.edit_count = 1
      post.content = 'edited content'
      expect(post).not_to be_valid
      expect(post.errors[:base]).to include("編集できるのは当日（#{date_yesterday.strftime('%Y-%m-%d')}）だけだよ。")
    end

    it '今日の投稿は編集できる' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_today)
      post.edit_count = 1
      post.content = 'edited content'
      expect(post).to be_valid
    end
  end
end
