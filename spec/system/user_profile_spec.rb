require 'rails_helper'

RSpec.describe 'ユーザー設定', type: :system do
  let(:user) { FactoryBot.create(:user, password: "password123") }

  it 'ログインしてカレンダーが表示されること' do
    visit root_path
    fill_in 'user_login', with: user.email
    fill_in 'user_password', with: 'password123'
    click_button 'ログイン'
    expect(page).to have_content("#{user.username}さんの日記")
    expect(page).to have_content("ようこそ、#{user.username}さん！")
    expect(page).not_to have_content("非公開です。")
  end
end
