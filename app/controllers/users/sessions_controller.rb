# frozen_string_literal: true

require 'digest'

class Users::SessionsController < Devise::SessionsController
  rate_limit to: 5,
             within: 3.minutes,
             by: :login_rate_limit_key,
             with: :redirect_throttled_login,
             store: Rails.cache,
             only: :create

  private

  def login_rate_limit_key
    login =
      if params[:user].is_a?(ActionController::Parameters)
        params[:user][:login].to_s.strip.downcase
      else
        ''
      end

    account_id =
      User.find_for_database_authentication({ login: login })&.id if login.present?

    identity =
      if account_id
        "user:#{account_id}"
      else
        "login:#{Digest::SHA256.hexdigest(login)}"
      end

    "#{request.remote_ip}:#{identity}"
  end

  def redirect_throttled_login
    redirect_to new_user_session_path,
                alert: 'ログイン試行回数が多すぎます。3分ほど待ってから再度お試しください。',
                status: :see_other
  end
end
