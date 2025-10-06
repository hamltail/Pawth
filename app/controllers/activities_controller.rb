class ActivitiesController < ApplicationController
  before_action :set_user, :set_month

  def show
    @current_post = @user.daily_posts.order(posted_on: :desc).first

    month_range = @month.all_month
    posts       = @user.daily_posts.where(posted_on: month_range).to_a

    @calendar_days       = month_range.to_a
    @posts_by_day = posts.index_by(&:posted_on)

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
