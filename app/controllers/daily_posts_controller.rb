class DailyPostsController < ApplicationController
  def index
  end

  def new
    @daily_post = DailyPost.new
  end

  def show
  end
end
