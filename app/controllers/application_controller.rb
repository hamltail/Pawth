class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  before_action :configure_permitted_parameters, if: :devise_controller?
  after_action  :log_flash_notice_in_dev

  rescue_from ActiveRecord::RecordNotFound, with: :render_404

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || activity_path(resource.username)
  end

  def after_sign_out_path_for(_resource)
    new_user_session_path
  end

  private

  def log_flash_notice_in_dev
    return unless Rails.env.development?
    payload = flash.to_hash.slice('notice', 'alert').compact_blank
    return if payload.empty?
    Rails.logger.tagged('FLASH') { Rails.logger.info(payload.inspect) }
  end

  def render_404
    respond_to do |f|
      f.html { render file: Rails.public_path.join('404.html'), status: :not_found, layout: false }
      f.turbo_stream { head :not_found }
      f.any { head :not_found }
    end
  end

  protected

  ALLOWED_KEYS = %i[username email].freeze

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: ALLOWED_KEYS)
    devise_parameter_sanitizer.permit(:account_update, keys: ALLOWED_KEYS)
  end
end
