class ProfilesController < ApplicationController
  def show
    @user = User.find_by_username(params[:username])
    unless @user
      render file: "#{Rails.root}/public/404.html", status: 404
    end
  end
end
