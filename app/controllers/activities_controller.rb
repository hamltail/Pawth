class ActivitiesController < ApplicationController
  def show
    @user = User.find_by(username: params[:username])
    unless @user
      render file: "#{Rails.root}/public/404.html", status: 404
    end

    @latest_daily_post = @user.daily_posts.order(posted_on: :desc).first

    today = if params[:year].present? && params[:month].present?
      Date.new(params[:year].to_i, params[:month].to_i)
    else
      Date.current
    end

    @calendar_days = (today.beginning_of_month..today.end_of_month).to_a
    @daily_posts_by_date = @user.daily_posts
                                .where(posted_on: today.beginning_of_month..today.end_of_month)
                                .group_by(&:posted_on)
    @prev_month = today.prev_month
    @next_month = today.next_month
    @month_label = today.strftime("%B %Y")
  end
end
