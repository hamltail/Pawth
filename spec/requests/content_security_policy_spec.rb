require 'rails_helper'

RSpec.describe 'Content Security Policy', type: :request do
  describe '未ログインのページ' do
    before do
      get new_user_session_path
    end

    it 'Report-Onlyヘッダーを返す' do
      expect(response).to have_http_status(:ok)

      policy = response.headers['Content-Security-Policy-Report-Only']

      expect(policy).to be_present
      expect(response.headers['Content-Security-Policy']).to be_nil
    end

    it '基本的なセキュリティディレクティブを含む' do
      policy = response.headers.fetch('Content-Security-Policy-Report-Only')

      expect(policy).to include("default-src 'self'")
      expect(policy).to include("object-src 'none'")
      expect(policy).to include("frame-ancestors 'none'")
      expect(policy).to include("base-uri 'self'")
      expect(policy).to include("form-action 'self'")
    end

    it '既存の外部JavaScript配信元を許可対象に含む' do
      policy = response.headers.fetch('Content-Security-Policy-Report-Only')

      expect(policy).to include('https://cdn.jsdelivr.net')
      expect(policy).to include('https://ga.jspm.io')
    end

    it 'テーマ初期化スクリプトのnonceがCSPと一致する' do
      document = Nokogiri::HTML(response.body)

      meta = document.at_css('meta[name="csp-nonce"]')
      expect(meta).to be_present

      nonce = meta['content']
      expect(nonce).to be_present

      policy = response.headers.fetch('Content-Security-Policy-Report-Only')
      expect(policy).to include("'nonce-#{nonce}'")

      theme_script = document.css('script[nonce]').find do |script|
        script.text.include?('pawth-theme')
      end

      expect(theme_script).to be_present
      expect(theme_script['nonce']).to eq(nonce)
    end
  end

  it 'リクエストごとに異なるnonceを生成する' do
    get new_user_session_path

    first_document = Nokogiri::HTML(response.body)
    first_nonce = first_document.at_css('meta[name="csp-nonce"]')['content']

    get new_user_session_path

    second_document = Nokogiri::HTML(response.body)
    second_nonce = second_document.at_css('meta[name="csp-nonce"]')['content']

    expect(first_nonce).to be_present
    expect(second_nonce).to be_present
    expect(second_nonce).not_to eq(first_nonce)
  end

  it 'ログイン済みページでもReport-Onlyヘッダーを返す' do
    user = create(:user)
    sign_in user

    get activity_path(user.username)

    expect(response).to have_http_status(:ok)
    expect(
      response.headers['Content-Security-Policy-Report-Only']
    ).to be_present
  end
end
