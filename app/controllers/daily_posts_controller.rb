class DailyPostsController < ApplicationController
  include Pagy::Backend

  def index
    posts = current_user.daily_posts
    posts = posts.search_text(params[:q])
    posts = posts.by_year(params[:year])
    posts = posts.by_month(params[:month], params[:year])
    posts = posts.recent_first

    @pagy, @daily_posts = pagy(posts, limit: 10)
  end

  def new
    @daily_post = DailyPost.new
  end

  def create
    @daily_post = current_user.daily_posts.build(daily_post_params)
    @daily_post.posted_on = Date.today

    if @daily_post.save
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.prepend("posts", partial: "daily_posts/post", locals: { post: @daily_post }),
            turbo_stream.update("modal", "")
          ]
        end
        format.html { redirect_to activity_path(current_user.username), notice: "投稿したよ。" }
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @daily_post = current_user.daily_posts.find(params[:id])
  end

  def update
    @daily_post = current_user.daily_posts.find(params[:id])
    @daily_post.edit_count ||= 0
    @daily_post.edit_count += 1

    if @daily_post.update(daily_post_params)
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("post_#{@daily_post.id}", partial: "daily_posts/post", locals: { post: @daily_post }),
            turbo_stream.update("modal", "")
          ]
        end
        format.html { redirect_to daily_posts_path, notice: "編集したよ。" }
      end
    else
      render :edit, status: :unprocessable_entity
    end
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
