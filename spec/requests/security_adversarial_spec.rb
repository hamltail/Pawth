# frozen_string_literal: true

# Pawth のセキュリティ回帰テスト。
# 必ず隔離したテスト用DBで実行すること。本番DBには接続しない。
require 'rails_helper'

RSpec.describe 'セキュリティ意地悪テスト', type: :request do
  let!(:owner) { create(:user, username: 'security-owner', password: 'owner-pass-123') }
  let!(:intruder) { create(:user, username: 'security-intruder', password: 'intruder-pass-123') }

  let!(:private_today) do
    create(:daily_post, user: owner, posted_on: Date.current,
                        content: 'SECRET_TODAY_723984', edit_count: 0)
  end

  let!(:private_old) do
    create(:daily_post, user: owner, posted_on: Date.yesterday,
                        content: 'SECRET_OLD_723984', edit_count: 0)
  end

  before { owner.profile.update!(public_posts: false) }

  describe '未ログインでの不正アクセス防止' do
    it '非公開タイムラインを閲覧できない' do
      get daily_posts_path
      expect(response).to redirect_to(new_user_session_path)
      expect(response.body).not_to include(private_today.content)
    end

    it '新規投稿フォームを開けない' do
      get new_daily_post_path
      expect(response).to redirect_to(new_user_session_path)
    end

    it '有効な投稿IDでも編集フォームを開けない' do
      get edit_daily_post_path(private_old)
      expect(response).to redirect_to(new_user_session_path)
    end

    it '投稿者IDを偽装しても投稿を作成できない' do
      expect do
        post daily_posts_path,
             params: { daily_post: { content: 'FORGED_CREATE', user_id: owner.id } }
      end.not_to change(DailyPost, :count)

      expect(response).to redirect_to(new_user_session_path)
    end

    it '投稿を変更できない' do
      patch daily_post_path(private_old),
            params: { daily_post: { content: 'FORGED_UPDATE' } }

      expect(response).to redirect_to(new_user_session_path)
      expect(private_old.reload.content).to eq('SECRET_OLD_723984')
    end

    it '投稿を削除できない' do
      delete daily_post_path(private_old)
      expect(response).to redirect_to(new_user_session_path)
      expect(DailyPost.exists?(private_old.id)).to be(true)
    end

    it 'プロフィール設定画面を開けない' do
      get edit_profile_path
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'プロフィールを変更できない' do
      put profile_path, params: { profile: { public_posts: '1' } }

      expect(response).to redirect_to(new_user_session_path)
      expect(owner.profile.reload.public_posts?).to be(false)
    end

    it 'アカウント情報を変更できない' do
      put user_registration_path,
          params: {
            user: {
              email: 'hijacked@example.org',
              current_password: 'owner-pass-123'
            }
          }

      expect(response).to redirect_to(new_user_session_path)
      expect(owner.reload.email).not_to eq('hijacked@example.org')
    end

    it 'アカウントを削除できない' do
      delete user_registration_path,
             params: { user: { current_password: 'owner-pass-123' } }

      expect(response).to redirect_to(new_user_session_path)
      expect(User.exists?(owner.id)).to be(true)
    end
  end

  describe '他人のアカウントへの不正アクセス防止（IDOR）' do
    before { sign_in intruder }

    it '他人の投稿の編集画面は404になる' do
      get edit_daily_post_path(private_old)

      expect(response).to have_http_status(:not_found)
      expect(response.body).not_to include(private_old.content)
    end

    it '他人の投稿を更新しようとすると404になる' do
      patch daily_post_path(private_old),
            params: { daily_post: { content: 'TAKEOVER_UPDATE' } }

      expect(response).to have_http_status(:not_found)
      expect(private_old.reload.content).to eq('SECRET_OLD_723984')
    end

    it '他人の投稿を削除しようとすると404になる' do
      delete daily_post_path(private_old)

      expect(response).to have_http_status(:not_found)
      expect(DailyPost.exists?(private_old.id)).to be(true)
    end

    it 'タイムライン検索から他人の非公開投稿本文が漏れない' do
      # 検索語句は投稿本文の一部だけにする。
      # 検索フォームへの入力値の再表示を情報漏洩と誤判定しないため。
      get daily_posts_path, params: { q: 'SECRET_OLD' }

      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include(private_old.content)
    end

    it '他人の非公開投稿がカレンダーに漏れない' do
      get activity_path(owner.username)

      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include(private_today.content)
      expect(response.body).not_to include('calendar-mark--posted')
    end

    it '前月の非公開投稿や投稿マークが漏れない' do
      date = private_old.posted_on.prev_month

      create(:daily_post, user: owner, posted_on: date,
                          content: 'SECRET_PREV_MONTH_723984', edit_count: 0)

      get activity_path(owner.username, year: date.year, month: date.month)

      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include('SECRET_PREV_MONTH_723984')
      expect(response.body).not_to include('calendar-mark--posted')
    end

    it 'IDを偽装しても他人のプロフィールを変更できない' do
      original_name = owner.profile.display_name

      put profile_path, params: {
        profile: {
          id: owner.profile.id,
          user_id: owner.id,
          display_name: 'HIJACKED_DISPLAY_NAME',
          public_posts: '1'
        }
      }

      expect(owner.profile.reload.display_name).to eq(original_name)
      expect(owner.profile.public_posts?).to be(false)
    end

    it 'IDを偽装しても他人のアカウントを変更できない' do
      original_owner_email = owner.email

      put user_registration_path, params: {
        user: {
          id: owner.id,
          username: 'changed-intruder',
          email: intruder.email
        }
      }

      expect(owner.reload.email).to eq(original_owner_email)
      expect(owner.username).to eq('security-owner')
    end
  end

  describe '投稿の公開・非公開切り替え' do
    it '未ログインでは非公開投稿を閲覧できない' do
      get activity_path(owner.username)

      expect(response.body).not_to include(private_today.content)
      expect(response.body).not_to include(private_old.content)
    end

    it '投稿者本人は非公開投稿を閲覧できる' do
      sign_in owner
      get activity_path(owner.username)

      expect(response.body).to include(private_today.content)
    end

    it '本人が公開設定にすると投稿を閲覧できる' do
      owner.profile.update!(public_posts: true)
      get activity_path(owner.username)

      expect(response.body).to include(private_today.content)
    end

    it '非公開設定に戻すと投稿が表示されなくなる' do
      owner.profile.update!(public_posts: true)
      get activity_path(owner.username)

      expect(response.body).to include(private_today.content)

      owner.profile.update!(public_posts: false)
      get activity_path(owner.username)

      expect(response.body).not_to include(private_today.content)
    end
  end

  describe '投稿ルールとパラメータ改ざんの防止' do
    before { sign_in intruder }

    it '投稿作成時に投稿者ID・投稿日・編集回数を偽装できない' do
      post daily_posts_path, params: {
        daily_post: {
          content: 'OWNED_CREATED_POST',
          user_id: owner.id,
          posted_on: '2020-01-01',
          edit_count: 500
        }
      }

      created = intruder.daily_posts.find_by!(content: 'OWNED_CREATED_POST')

      expect(created.user_id).to eq(intruder.id)
      expect(created.posted_on).to eq(Date.current)
      expect(created.edit_count).to eq(0)
      expect(owner.daily_posts.where(content: 'OWNED_CREATED_POST')).to be_empty
    end

    it '投稿編集時に投稿者ID・投稿日を偽装できない' do
      post_to_edit = create(
        :daily_post,
        user: intruder,
        posted_on: Date.current,
        content: 'ORIGINAL_TEXT',
        edit_count: 0
      )

      patch daily_post_path(post_to_edit), params: {
        daily_post: {
          content: 'CHANGED_BY_OWNER',
          user_id: owner.id,
          posted_on: Date.yesterday.to_s
        }
      }

      expect(post_to_edit.reload.user_id).to eq(intruder.id)
      expect(post_to_edit.posted_on).to eq(Date.current)
      expect(post_to_edit.content).to eq('CHANGED_BY_OWNER')
    end

    it '昨日の投稿をPATCHで編集できない' do
      old_post = create(
        :daily_post,
        user: intruder,
        posted_on: Date.yesterday,
        content: 'OLD_ORIGINAL',
        edit_count: 0
      )

      patch daily_post_path(old_post),
            params: { daily_post: { content: 'ILLEGAL_EDIT' } }

      expect(old_post.reload.content).to eq('OLD_ORIGINAL')
    end

    it '今日の投稿をDELETEで削除できない' do
      today = create(
        :daily_post,
        user: intruder,
        posted_on: Date.current,
        content: 'TODAY_PROTECTED',
        edit_count: 0
      )

      delete daily_post_path(today)

      expect(DailyPost.exists?(today.id)).to be(true)
    end

    it '3回編集済みの投稿を4回目に編集できない' do
      post_to_edit = create(
        :daily_post,
        user: intruder,
        posted_on: Date.current,
        content: 'THREE_EDIT_ORIGINAL',
        edit_count: 3
      )

      patch daily_post_path(post_to_edit),
            params: { daily_post: { content: 'FOURTH_EDIT' } }

      expect(post_to_edit.reload.content).to eq('THREE_EDIT_ORIGINAL')
      expect(post_to_edit.edit_count).to eq(3)
    end

    it '366文字の投稿を保存できない' do
      post daily_posts_path,
           params: { daily_post: { content: 'X' * 366 } }

      expect(intruder.daily_posts.where(content: 'X' * 366)).to be_empty
    end

    it '同じ日に2回投稿を作成できない' do
      2.times do
        post daily_posts_path,
             params: { daily_post: { content: 'DOUBLE_POST' } }
      end

      expect(intruder.daily_posts.where(posted_on: Date.current).count).to eq(1)
    end
  end

  describe '重要なアカウント変更の保護' do
    before { sign_in intruder }

    it '現在のパスワードなしではメールアドレスを変更できない' do
      put user_registration_path, params: {
        user: {
          email: 'unverified-new@example.org',
          current_password: ''
        }
      }

      expect(intruder.reload.unconfirmed_email).to be_nil
      expect(intruder.email).not_to eq('unverified-new@example.org')
    end

    it '誤ったパスワードではメールアドレスを変更できない' do
      put user_registration_path, params: {
        user: {
          email: 'unverified-new@example.org',
          current_password: 'WRONG_PASS'
        }
      }

      expect(intruder.reload.unconfirmed_email).to be_nil
    end

    it 'メールアドレス変更後は再確認が必要になる' do
      original = intruder.email

      put user_registration_path, params: {
        user: {
          email: 'unverified-new@example.org',
          current_password: 'intruder-pass-123'
        }
      }

      intruder.reload

      expect(intruder.email).to eq(original)
      expect(intruder.unconfirmed_email).to eq('unverified-new@example.org')
    end

    it '現在のパスワードなしではパスワードを変更できない' do
      put user_registration_path, params: {
        user: {
          password: 'changed-pass-456',
          password_confirmation: 'changed-pass-456',
          current_password: ''
        }
      }

      expect(intruder.reload.valid_password?('intruder-pass-123')).to be(true)
      expect(intruder.valid_password?('changed-pass-456')).to be(false)
    end

    it '現在のパスワードなしでは退会できない' do
      delete user_registration_path,
             params: { user: { current_password: '' } }

      expect(User.exists?(intruder.id)).to be(true)
    end

    it '他人のパスワードでは退会できない' do
      delete user_registration_path,
             params: { user: { current_password: 'owner-pass-123' } }

      expect(User.exists?(intruder.id)).to be(true)
      expect(User.exists?(owner.id)).to be(true)
    end
  end

  describe 'ログイン試行回数の制限' do
    include ActiveSupport::Testing::TimeHelpers

    let(:counter_store) { ActiveSupport::Cache::MemoryStore.new }
    let(:client_ip) { '198.51.100.12' }

    before do
      allow(Rails.cache).to receive(:increment) do |key, amount, **options|
        counter_store.increment(key, amount, **options)
      end
    end

    def attempt_login(login:, password: 'bad-password', ip: client_ip)
      post user_session_path,
           params: { user: { login: login, password: password } },
           headers: { 'REMOTE_ADDR' => ip }
    end

    def expect_throttled_response
      expect(response).to have_http_status(:see_other)
      expect(response).to redirect_to(new_user_session_path)

      follow_redirect!

      expect(response.body).to include('ログイン試行回数が多すぎます。')
    end

    it '6回目の不正ログインを拒否する' do
      6.times { attempt_login(login: intruder.username) }
      expect_throttled_response
    end

    it '5回失敗した後は正しいパスワードでも制限される' do
      5.times { attempt_login(login: intruder.username) }

      attempt_login(
        login: intruder.username,
        password: 'intruder-pass-123'
      )

      expect_throttled_response
    end

    it 'ユーザー名からメールアドレスに変えても制限を回避できない' do
      5.times { attempt_login(login: intruder.username) }

      attempt_login(
        login: intruder.email,
        password: 'intruder-pass-123'
      )

      expect_throttled_response
    end

    it '大文字と小文字を変えても制限を回避できない' do
      5.times { attempt_login(login: intruder.username.upcase) }

      attempt_login(
        login: intruder.email,
        password: 'intruder-pass-123'
      )

      expect_throttled_response
    end

    it '前後に空白を加えても制限を回避できない' do
      5.times { attempt_login(login: "  #{intruder.username}  ") }

      attempt_login(
        login: intruder.username,
        password: 'intruder-pass-123'
      )

      expect_throttled_response
    end

    it '存在しないユーザー名への試行も制限される' do
      6.times { attempt_login(login: 'nonexistent-security-user') }
      expect_throttled_response
    end

    it '同じIPの別アカウントは巻き添えにしない' do
      5.times { attempt_login(login: intruder.username) }

      attempt_login(
        login: owner.username,
        password: 'owner-pass-123'
      )

      expect(response).to redirect_to(activity_path(owner.username))
    end

    it '別のIPからのログインは妨げない' do
      5.times { attempt_login(login: intruder.username) }

      attempt_login(
        login: intruder.username,
        password: 'intruder-pass-123',
        ip: '198.51.100.13'
      )

      expect(response).to redirect_to(activity_path(intruder.username))
    end

    it '時間経過後は制限が解除される' do
      6.times { attempt_login(login: intruder.username) }
      expect_throttled_response

      travel 4.minutes do
        attempt_login(
          login: intruder.username,
          password: 'intruder-pass-123'
        )

        expect(response).to redirect_to(activity_path(intruder.username))
      end
    end
  end

  describe 'HTML・スクリプト注入対策（XSS）' do
    it '公開投稿内のscriptタグはHTMLとして出力されない' do
      payload = '<script>window.PAWTH_ATTACK_SENTINEL=1</script>'

      owner.profile.update!(public_posts: true)
      private_today.update_columns(content: payload)

      get activity_path(owner.username)

      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include(payload)
      expect(response.body).not_to include('<script>window.PAWTH_ATTACK_SENTINEL')
    end

    it '投稿内の不正なHTMLイベント属性はHTMLとして出力されない' do
      payload = '<img src=x onerror=alert(999)>'

      owner.profile.update!(public_posts: true)
      private_today.update_columns(content: payload)

      get activity_path(owner.username)

      expect(response.body).not_to include(payload)
    end
  end
end
