# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_account_update_params, only: [:update]
  before_action :authenticate_scope!, only: [:edit, :update, :destroy]

  def edit
    self.resource = current_user
  end

  def update
    self.resource = current_user

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
      redirect_to after_update_path_for(resource), notice: t('controllers.users.registrations.updated')
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    current_pw = params.dig(:user, :current_password).to_s

    unless current_pw.present? && resource.valid_password?(current_pw)
      flash[:delete_alert] = t('devise.registrations.wrong_password')
      redirect_to edit_user_registration_path and return
    end

    if resource.destroy
      sign_out(resource_name)
      set_flash_message! :notice, :destroyed
      redirect_to after_sign_out_path_for(resource_name), status: :see_other
    else
      flash[:alert] = resource.errors.full_messages.to_sentence.presence || 'アカウント削除に失敗しました。'
      redirect_to edit_user_registration_path, status: :see_other
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
