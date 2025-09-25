require 'rails_helper'

RSpec.describe 'DailyPosts', type: :request do
  let(:user) { create(:user) }
  before { sign_in user }

  it '今日の投稿は削除できない' do
    post_today = create(:daily_post, user: user, posted_on: Date.current)

    delete daily_post_path(post_today)

    expect(response).to redirect_to(daily_posts_path)
    follow_redirect!
    expect(response.body).to include('今日の日記は削除できません。')
    expect(DailyPost.exists?(post_today.id)).to be(true)
  end
end
