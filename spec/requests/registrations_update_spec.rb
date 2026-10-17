require 'rails_helper'

RSpec.describe 'Devise::Registrations#update', type: :request do
  let(:password) { 'password' }
  let(:user) { create(:user, password:) }
  let(:original_email) { user.email }
  let(:new_email) { 'updated@example.com' }

  before do
    sign_in user
  end

  context 'メールアドレスを変更する場合' do
    it '現在のパスワードが未入力なら変更できない' do
      put user_registration_path, params: {
        user: {
          email: new_email,
          current_password: ''
        }
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(user.reload.email).to eq(original_email)
      expect(user.unconfirmed_email).to be_nil
    end

    it '現在のパスワードが間違っている場合は変更できない' do
      put user_registration_path, params: {
        user: {
          email: new_email,
          current_password: 'wrong-password'
        }
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(user.reload.email).to eq(original_email)
      expect(user.unconfirmed_email).to be_nil
    end

    it '正しいパスワードなら変更確認を開始できる' do
      put user_registration_path, params: {
        user: {
          email: new_email,
          current_password: password
        }
      }

      expect(response).to be_redirect

      user.reload
      expect(user.email).to eq(original_email)
      expect(user.unconfirmed_email).to eq(new_email)
    end

    it 'パスワードがない場合は同時にユーザー名も変更されない' do
      original_username = user.username

      put user_registration_path, params: {
        user: {
          email: new_email,
          username: 'updated-user',
          current_password: ''
        }
      }

      expect(response).to have_http_status(:unprocessable_content)

      user.reload
      expect(user.email).to eq(original_email)
      expect(user.username).to eq(original_username)
      expect(user.unconfirmed_email).to be_nil
    end
  end

  context 'メールアドレスを変更しない場合' do
    it '現在のパスワードなしでユーザー名を変更できる' do
      put user_registration_path, params: {
        user: {
          email: original_email,
          username: 'updated-user',
          current_password: ''
        }
      }

      expect(response).to be_redirect
      expect(user.reload.username).to eq('updated-user')
      expect(user.email).to eq(original_email)
    end

    it 'メールアドレスが同じならパスワード確認を要求しない' do
      put user_registration_path, params: {
        user: {
          email: original_email,
          current_password: ''
        }
      }

      expect(response).to be_redirect
      expect(user.reload.email).to eq(original_email)
    end
  end

  context 'パスワードを変更する場合' do
    it '現在のパスワードが未入力なら変更できない' do
      put user_registration_path, params: {
        user: {
          email: original_email,
          password: 'new-password123',
          password_confirmation: 'new-password123',
          current_password: ''
        }
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(user.reload.valid_password?(password)).to be(true)
    end

    it '正しい現在のパスワードなら変更できる' do
      put user_registration_path, params: {
        user: {
          email: original_email,
          password: 'new-password123',
          password_confirmation: 'new-password123',
          current_password: password
        }
      }

      expect(response).to be_redirect
      expect(user.reload.valid_password?('new-password123')).to be(true)
    end
  end
end
