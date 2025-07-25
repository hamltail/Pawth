class DailyPostsController < ApplicationController
  def index
    @daily_posts = current_user.daily_posts.order(posted_on: :desc)
  end

  def create
    @daily_post = current_user.daily_posts.build(daily_post_params)
    @daily_post.posted_on = Date.today

    if @daily_post.save
      redirect_to profile_path(current_user.username), notice: "投稿したよ。"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def new
    @daily_post = DailyPost.new
  end

  def show
  end

  def destroy
    @daily_post = current_user.daily_posts.find(params[:id])
    @daily_post.destroy
    redirect_to daily_posts_path, status: :see_other
  end

  private
    def daily_post_params
      params.require(:daily_post).permit(:content)
    end
end
