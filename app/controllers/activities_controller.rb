class ActivitiesController < ApplicationController
  before_action :set_user

  def show
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
    @month_label = today.strftime('%B %Y')
  end

  private
    def set_user
      @user = User.find_by!(username: params[:username])
    end
end
