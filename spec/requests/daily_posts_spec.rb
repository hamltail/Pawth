require 'rails_helper'

RSpec.describe 'DailyPosts', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:user) { create(:user) }
  let(:other) { create(:user) }

  before { sign_in user }

  it '今日の投稿は削除できない' do
    post_today = create(:daily_post, user: user, posted_on: Date.current)

    delete daily_post_path(post_today)

    expect(response).to redirect_to(daily_posts_path)
    expect(response).to have_http_status(:see_other)

    follow_redirect!
    expect(response.body).to include('今日の日記は削除できません。')
    expect(DailyPost.exists?(post_today.id)).to be(true)
  end

  it '同じ日に2回は投稿できない（1日1件ルール）' do
    create(:daily_post, user: user, posted_on: Date.current)

    expect {
      post daily_posts_path, params: {
        daily_post: { content: '二重投稿テスト' }
      }
    }.not_to change(DailyPost, :count)

    expect(response).to have_http_status(:unprocessable_entity)
    expect(response.body).to include(
      I18n.t('activerecord.errors.models.daily_post.attributes.base.already_posted_today')
    )
  end

  it '他人の user_id を指定しても、現在のユーザーとしてしか作成されない' do
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

  describe 'GET /daily_posts/export' do
    let!(:november_post) do
      create(
        :daily_post,
        user: user,
        posted_on: Date.new(2026, 11, 15),
        content: "修練🐱\n今日も記録した！"
      )
    end

    let!(:october_post) do
      create(
        :daily_post,
        user: user,
        posted_on: Date.new(2026, 10, 10),
        content: '10月の記録'
      )
    end

    let!(:other_post) do
      create(
        :daily_post,
        user: other,
        posted_on: Date.new(2026, 11, 14),
        content: '他人の修練記録'
      )
    end

    it '条件未指定なら本人の全記録を出力する' do
      get export_daily_posts_path, params: { page: 999 }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq('application/json')
      expect(response.headers['Content-Disposition']).to include('attachment')
      expect(response.headers['Cache-Control']).to include('no-store')

      json = JSON.parse(response.body)

      expect(json['count']).to eq(2)
      expect(json['records']).to eq(
        [
          {
            'posted_on' => '2026-11-15',
            'content' => "修練🐱\n今日も記録した！"
          },
          {
            'posted_on' => '2026-10-10',
            'content' => '10月の記録'
          }
        ]
      )

      expect(json['records'].map { |record| record['content'] })
        .not_to include(other_post.content)
    end

    it 'キーワード・年・月の条件を反映する' do
      get export_daily_posts_path, params: {
        q: '修練',
        year: '2026',
        month: '11'
      }

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json['count']).to eq(1)
      expect(json['records'].first['posted_on']).to eq('2026-11-15')
      expect(json['records'].first['content']).to eq(november_post.content)
      expect(json['filters']).to include(
        'q' => '修練',
        'year' => '2026',
        'month' => '11'
      )
    end

    it '年だけの条件を指定できる' do
      get export_daily_posts_path, params: { year: '2026' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['count']).to eq(2)
    end

    it '月だけの条件を指定できる' do
      get export_daily_posts_path, params: { month: '11' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['count']).to eq(1)
    end

    it '確認用の対象件数を取得できる' do
      get export_daily_posts_path, params: {
        preview: '1',
        q: '修練',
        year: '2026',
        month: '11'
      }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('count' => 1)
    end

    it '一致する記録が0件ならダウンロードしない' do
      get export_daily_posts_path, params: { q: '存在しない記録' }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it '対象件数が0件の場合も正しく返す' do
      get export_daily_posts_path, params: {
        preview: '1',
        q: '存在しない記録'
      }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('count' => 0)
    end

    it 'ファイル名に日本時間の年月日時分を使用する' do
      travel_to Time.zone.local(2026, 11, 15, 17, 45) do
        get export_daily_posts_path

        expect(response.headers['Content-Disposition'])
          .to include('pawth-202611151745.json')

        json = JSON.parse(response.body)

        expect(json['exported_at']).to eq('2026-11-15T17:45:00+09:00')
      end
    end

    it '未ログインではエクスポートできない' do
      sign_out user

      get export_daily_posts_path

      expect(response).to redirect_to(new_user_session_path)
    end

    it '未ログインでは対象件数も取得できない' do
      sign_out user

      get export_daily_posts_path, params: { preview: '1' }

      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
