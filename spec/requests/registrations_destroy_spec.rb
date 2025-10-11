require 'rails_helper'

RSpec.describe 'Devise::Registrations#destroy', type: :request do
  let(:password) { 'password' }
  let!(:user)    { create(:user, password:, confirmed_at: Time.current) }

  before do
    sign_in user
  end

  context '正しいパスワードの場合' do
    it 'ユーザーと関連（profile, daily_posts）を削除し、ログイン画面へリダイレクト' do
      create(:daily_post, user: user, posted_on: Date.yesterday)

      expect {
        delete user_registration_path, params: { user: { current_password: password } }
      }.to change(User, :count).by(-1)
       .and change(Profile, :count).by(-1)
       .and change(DailyPost, :count).by(-1)

      expect(response).to redirect_to(new_user_session_path)
      expect(response).to have_http_status(:see_other)
    end
  end

  context '誤ったパスワードの場合' do
    it '削除せず、編集画面へリダイレクトしてフラッシュを表示' do
      expect {
        delete user_registration_path, params: { user: { current_password: 'wrong' } }
      }.not_to change(User, :count)

      expect(response).to redirect_to(edit_user_registration_path)
      follow_redirect!
      expect(response.body).to include(I18n.t('users.edit.delete_wrong_password'))
    end
  end
end
