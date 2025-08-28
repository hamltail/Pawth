require 'rails_helper'

RSpec.describe DailyPost, type: :model do
  let(:user) { FactoryBot.create(:user) }
  let(:date_today) { Date.current }
  let(:date_yesterday) { Date.yesterday }

  it 'contentが必須であること' do
    post = DailyPost.new(content: nil, user: user, posted_on: date_today)
    expect(post).not_to be_valid
  end

  it "posted_onは未指定なら今日に補完される" do
    post = DailyPost.new(user: user, content: "sample", posted_on: nil)
    expect(post).to be_valid
    post.validate
    expect(post.posted_on).to eq(Date.current)
  end

  it 'userが必須であること' do
    post = DailyPost.new(content: 'sample', user: nil, posted_on: date_today)
    expect(post).not_to be_valid
  end

  describe 'contentの文字数制限（グラフェム基準）' do
    let(:max) { DailyPost::CONTENT_MAX_LENGTH }

    it 'ASCII: max はOK / max+1 はNG' do
      expect(DailyPost.new(content: 'a' * max, user: user, posted_on: date_today)).to be_valid
      expect(DailyPost.new(content: 'a' * (max+1), user: user, posted_on: date_today)).not_to be_valid
    end

    it '肌色付き絵文字(👍🏽): max はOK / max+1 はNG' do
      g = '👍🏽'
      expect(DailyPost.new(content: g * max, user: user, posted_on: date_today)).to be_valid
      expect(DailyPost.new(content: g * (max+1), user: user, posted_on: date_today)).not_to be_valid
    end

    it 'ZWJ連結(👨‍👩‍👧‍👦): max はOK / max+1 はNG' do
      g = '👨‍👩‍👧‍👦'
      expect(DailyPost.new(content: g * max, user: user, posted_on: date_today)).to be_valid
      expect(DailyPost.new(content: g * (max+1), user: user, posted_on: date_today)).not_to be_valid
    end

    it '合成かな(が): max はOK / max+1 はNG' do
      g = "か\u3099"
      expect(DailyPost.new(content: g * max, user: user, posted_on: date_today)).to be_valid
      expect(DailyPost.new(content: g * (max+1), user: user, posted_on: date_today)).not_to be_valid
    end
  end

  describe 'only_one_post_per_day' do
    it '同じ日に2回投稿するとエラーになる' do
      DailyPost.create!(content: 'first post', user: user, posted_on: date_today)
      second_post = DailyPost.new(content: 'second post', user: user, posted_on: date_today)
      expect(second_post).not_to be_valid
      expect(second_post.errors[:base]).to include("今日はすでに日記をかいています。")
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
      expect(post.errors[:base]).to include("編集は2回までです。")
    end

    it '編集回数が2回以下ならOK' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_today, edit_count: 1)
      post.edit_count = 2
      expect(post).to be_valid
    end
  end

  describe 'only_today_can_be_edited' do
    it '昨日の日記は編集できない' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_yesterday)
      post.edit_count = 1
      post.content = 'edited content'
      expect(post).not_to be_valid
      expect(post.errors[:base]).to include("編集は当日（#{date_yesterday.strftime('%Y-%m-%d')}）のみ可能です。")
    end

    it '今日の日記は編集できる' do
      post = DailyPost.create!(content: 'sample post', user: user, posted_on: date_today)
      post.edit_count = 1
      post.content = 'edited content'
      expect(post).to be_valid
    end
  end

  describe 'scope' do
    it 'recent_firstは最新の日記から順に並べる' do
      post1 = DailyPost.create!(content: 'post 1', user: user, posted_on: 3.day.ago)
      post2 = DailyPost.create!(content: 'post 2', user: user, posted_on: 2.days.ago)
      post3 = DailyPost.create!(content: 'post 3', user: user, posted_on: 1.days.ago)
      expect(DailyPost.recent_first).to eq([post3, post2, post1])
    end

    it 'search_textは内容に一致する日記を取得する' do
      post1 = DailyPost.create!(content: 'search me', user: user, posted_on: date_yesterday)
      post2 = DailyPost.create!(content: 'search not', user: user, posted_on: date_today)
      expect(DailyPost.search_text('search')).to include(post1)
      expect(DailyPost.search_text('me')).not_to include(post2)
    end

    it 'by_yearは特定の年の日記を取得する' do
      post1 = DailyPost.create!(content: 'post 2025', user: user, posted_on: '2025-08-07')
      post2 = DailyPost.create!(content: 'post 2024', user: user, posted_on: '2024-03-15')
      expect(DailyPost.by_year(2025)).to include(post1)
      expect(DailyPost.by_year(2025)).not_to include(post2)
    end

    it 'by_monthは特定の月と年の日記を取得する' do
      post1 = DailyPost.create!(content: 'post May 2025', user: user, posted_on: '2025-05-15')
      post2 = DailyPost.create!(content: 'post March 2025', user: user, posted_on: '2025-03-15')
      expect(DailyPost.by_month(5, 2025)).to include(post1)
      expect(DailyPost.by_month(5, 2025)).not_to include(post2)
    end
  end
end
