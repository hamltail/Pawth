require 'rails_helper'

RSpec.describe 'Devise::Sessions rate limit', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:user) { create(:user, password: 'password') }
  let(:other_user) { create(:user, password: 'password') }
  let(:counter_store) { ActiveSupport::Cache::MemoryStore.new }
  let(:client_ip) { '192.0.2.10' }

  before do
    allow(Rails.cache).to receive(:increment) do |key, amount, **options|
      counter_store.increment(key, amount, **options)
    end
  end

  def submit_login(login:, password:, ip: client_ip)
    post user_session_path,
         params: {
           user: {
             login: login,
             password: password
           }
         },
         headers: { 'REMOTE_ADDR' => ip }
  end

  it '正しい認証情報で通常ログインできる' do
    submit_login(login: user.username, password: 'password')

    expect(response).to redirect_to(activity_path(user.username))

    get edit_user_registration_path
    expect(response).to have_http_status(:ok)
  end

  it '同じIPと同じアカウントへの6回目のログインを制限し、理由を表示する' do
    5.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    submit_login(login: user.username, password: 'password')

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to(new_user_session_path)

    follow_redirect!

    expect(response.body).to include('ログイン試行回数が多すぎます。')
  end

  it '同じIPでも別ユーザーは正常にログインできる' do
    5.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    submit_login(login: other_user.username, password: 'password')

    expect(response).to redirect_to(activity_path(other_user.username))

    get edit_user_registration_path
    expect(response).to have_http_status(:ok)
  end

  it 'IPが異なれば同じユーザーでもログインできる' do
    5.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    submit_login(
      login: user.username,
      password: 'password',
      ip: '192.0.2.11'
    )

    expect(response).to redirect_to(activity_path(user.username))
  end

  it '同じアカウントのユーザー名とメールアドレスを別枠にしない' do
    5.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    submit_login(login: user.email, password: 'password')

    expect(response).to redirect_to(new_user_session_path)

    follow_redirect!

    expect(response.body).to include('ログイン試行回数が多すぎます。')
  end

  it '制限中でもログイン画面を表示できる' do
    6.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    get new_user_session_path

    expect(response).to have_http_status(:ok)
  end

  it '3分の制限期間が過ぎればログインできる' do
    6.times do
      submit_login(login: user.username, password: 'wrong-password')
    end

    travel 4.minutes do
      submit_login(login: user.username, password: 'password')

      expect(response).to redirect_to(activity_path(user.username))
    end
  end
end
