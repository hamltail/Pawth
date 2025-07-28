class ProfilesController < ApplicationController
  def show
    @user = User.find_by(username: params[:username])
    unless @user
      render file: "#{Rails.root}/public/404.html", status: 404
    end

    @latest_daily_post = @user.daily_posts.order(posted_on: :desc).first

    today = Date.current
    @calendar_days = (today.beginning_of_month..today.end_of_month).to_a
    @daily_posts_by_date = @user.daily_posts
                                .where(posted_on: today.beginning_of_month..today.end_of_month)
                                .group_by(&:posted_on)
  end
end
