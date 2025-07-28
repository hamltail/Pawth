class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :configure_permitted_parameters, if: :devise_controller?

  def after_sign_in_path_for(resource)
    activity_path(resource.username)
  end

  def after_sign_out_path_for(resource)
    new_user_session_path
  end

  protected

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [ :username, :email ])
      devise_parameter_sanitizer.permit(:account_update, keys: [ :username, :email ])
    end
end
