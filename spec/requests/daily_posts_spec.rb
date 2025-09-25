require 'rails_helper'

RSpec.describe 'DailyPosts', type: :request do
  let(:user) { create(:user) }
  let(:other) { create(:user) }
  before { sign_in user }

  it '今日の投稿は削除できない' do
    post_today = create(:daily_post, user: user, posted_on: Date.current)

    delete daily_post_path(post_today)

    expect(response).to redirect_to(daily_posts_path)
    follow_redirect!
    expect(response.body).to include('今日の日記は削除できません。')
    expect(DailyPost.exists?(post_today.id)).to be(true)
  end

  it '同じ日に2回は投稿できない（1日1件ルール）' do
    create(:daily_post, user: user, posted_on: Date.current)

    expect {
      post daily_posts_path, params: {
        daily_post: { posted_on: Date.current, content: '二重投稿テスト' }
      }
    }.not_to change(DailyPost, :count)

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.body).to include('今日はすでに日記をかいています。')
  end

  it '他人の user_id を指定しても、現在のユーザーとしてしか作成されない' do
    other = create(:user)

    expect {
      post daily_posts_path, params: {
        daily_post: {
          content: 'なりすまし投稿',
          user_id: other.id
        }
      }
    }.to change { DailyPost.where(user: user).count }.by(1)
     .and change { DailyPost.where(user: other).count }.by(0)

    created = DailyPost.order(created_at: :desc).first
    expect(created.user_id).to eq(user.id)
  end

  it '他人の投稿は削除できない' do
    others_post = create(:daily_post, user: other, posted_on: Date.yesterday)

    expect {
      delete daily_post_path(others_post)
    }.not_to change(DailyPost, :count)

    expect(response).to have_http_status(:not_found)
    expect(DailyPost.exists?(others_post.id)).to be(true)
  end
end
