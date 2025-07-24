class ProfilesController < ApplicationController
  def show
    @user = User.find_by(username: params[:username])
    unless @user
      render file: "#{Rails.root}/public/404.html", status: 404
    end

    @latest_daily_post = @user.daily_posts.order(posted_on: :desc).first
  end
end
