require 'rails_helper'

RSpec.describe 'Activities', type: :request do
  let(:owner) { create(:user) }
  let(:other_user) { create(:user) }

  let!(:today_post) do
    create(
      :daily_post,
      user: owner,
      posted_on: Date.current,
      content: 'PRIVATE_POST_TODAY_DO_NOT_LEAK',
      edit_count: 0
    )
  end

  let!(:previous_month_post) do
    create(
      :daily_post,
      user: owner,
      posted_on: Date.current.prev_month.beginning_of_month,
      content: 'PRIVATE_POST_PREVIOUS_DO_NOT_LEAK',
      edit_count: 0
    )
  end

  before do
    owner.profile.update!(public_posts: false)
  end

  describe 'GET /:username' do
    context '未ログインの場合' do
      it '非公開日記の本文と投稿マークを返さない' do
        get activity_path(owner.username)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include('日記は非公開です。')
        expect(response.body).not_to include(today_post.content)
        expect(response.body).not_to include('calendar-mark--posted')
      end

      it '前月を表示しても非公開日記を返さない' do
        month = previous_month_post.posted_on

        get activity_path(
          owner.username,
          year: month.year,
          month: month.month
        )

        expect(response).to have_http_status(:ok)
        expect(response.body).not_to include(previous_month_post.content)
        expect(response.body).not_to include('calendar-mark--posted')
      end
    end

    context '別ユーザーがログインしている場合' do
      before { sign_in other_user }

      it '非公開日記の本文と投稿マークを返さない' do
        get activity_path(owner.username)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include('日記は非公開です。')
        expect(response.body).not_to include(today_post.content)
        expect(response.body).not_to include('calendar-mark--posted')
      end
    end

    context '本人がログインしている場合' do
      before { sign_in owner }

      it '非公開日記の本文と投稿マークを閲覧できる' do
        get activity_path(owner.username)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include(today_post.content)
        expect(response.body).to include('calendar-mark--posted')
      end

      it '前月の非公開日記も閲覧できる' do
        month = previous_month_post.posted_on

        get activity_path(
          owner.username,
          year: month.year,
          month: month.month
        )

        expect(response).to have_http_status(:ok)
        expect(response.body).to include(previous_month_post.content)
        expect(response.body).to include('calendar-mark--posted')
      end
    end

    context '日記を公開している場合' do
      before do
        owner.profile.update!(public_posts: true)
      end

      it '未ログインでも公開日記を閲覧できる' do
        get activity_path(owner.username)

        expect(response).to have_http_status(:ok)
        expect(response.body).to include(today_post.content)
        expect(response.body).to include('calendar-mark--posted')
      end
    end
  end
end
