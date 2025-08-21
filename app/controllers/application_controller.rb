class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from ActiveRecord::RecordNotFound, with: :render_404

  def after_sign_in_path_for(resource)
    activity_path(resource.username)
  end

  def after_sign_out_path_for(resource)
    new_user_session_path
  end

  private
    def render_404
      respond_to do |f|
        f.html { render file: Rails.root.join('public/404.html'), status: :not_found, layout: false }
        f.any { head :not_found }
      end
    end

  protected
    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:username, :email])
      devise_parameter_sanitizer.permit(:account_update, keys: [:username, :email])
    end
end
