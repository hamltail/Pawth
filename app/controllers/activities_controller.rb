class ActivitiesController < ApplicationController
  before_action :set_user, :set_month

  def show
    @can_view_posts = @user.profile.public_posts? || current_user == @user

    month_range = @month.all_month
    @calendar_days = month_range.to_a

    if @can_view_posts
      @current_post = @user.daily_posts.order(posted_on: :desc).first
      @posts_by_day = @user.daily_posts
                           .where(posted_on: month_range)
                           .index_by(&:posted_on)
    else
      @current_post = nil
      @posts_by_day = {}
    end

    @prev_month = @month.prev_month
    @next_month = @month.next_month
  end

  private

  def set_user
    @user = User.find_by!(username: params[:username])
  end

  def set_month
    y = safe_int(params[:year])
    m = safe_int(params[:month])

    @month =
      if y && m && (1..12).include?(m)
        Date.new(y, m)
      else
        Date.current
      end
  rescue ArgumentError
    @month = Date.current
  end

  def safe_int(v)
    Integer(v) if v.present?
  rescue ArgumentError, TypeError
    nil
  end
end
