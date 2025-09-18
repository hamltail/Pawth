class ActivitiesController < ApplicationController
  before_action :set_user

  def show
    @current_post = @user.daily_posts.order(posted_on: :desc).first

    current_month = if params[:year].present? && params[:month].present?
      Date.new(params[:year].to_i, params[:month].to_i)
    else
      Date.current
    end

    @calendar_days = (current_month.beginning_of_month..current_month.end_of_month).to_a
    @daily_posts_by_date = @user.daily_posts
                                .where(posted_on: current_month.beginning_of_month..current_month.end_of_month)
                                .group_by(&:posted_on)
    @prev_month = current_month.prev_month
    @next_month = current_month.next_month
  end

  private

  def set_user
    @user = User.find_by!(username: params[:username])
  end
end
