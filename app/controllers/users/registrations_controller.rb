# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_account_update_params, only: [:update]

  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)

    if password_change_requested?(account_update_params)
      resource_updated = update_resource(resource, account_update_params)
    else
      profile_update_params = account_update_params.dup
      profile_update_params.delete(:current_password)
      profile_update_params.delete(:password)
      profile_update_params.delete(:password_confirmation)
      resource_updated = resource.update(profile_update_params)
    end

    if resource_updated
      bypass_sign_in resource, scope: resource_name
      redirect_to after_update_path_for(resource), notice: 'ユーザー情報を更新しました。'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  protected
    def configure_account_update_params
      devise_parameter_sanitizer.permit(
        :account_update,
        keys: []
      )
    end

  private
    def password_change_requested?(params)
      params[:password].present? || params[:password_confirmation].present?
    end
end
