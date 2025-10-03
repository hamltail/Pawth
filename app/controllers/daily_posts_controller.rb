class DailyPostsController < ApplicationController
  include Pagy::Backend

  before_action :authenticate_user!
  before_action :set_daily_post, only: %i[edit update destroy]

  def index
    posts = current_user.daily_posts
                        .search_text(params[:q])
                        .by_year(params[:year])
                        .by_month(params[:month], params[:year])
                        .recent_first

    @pagy, @daily_posts = pagy(posts, limit: 10)
  end

  def new
    @daily_post = DailyPost.new
  end

  def create
    @daily_post = current_user.daily_posts.build(daily_post_params)

    if @daily_post.save
      respond_to do |format|
        format.turbo_stream { render turbo_stream: create_success_stream(@daily_post) }
        format.html { redirect_to activity_path(current_user.username), notice: t('controllers.daily_posts.created') }
      end
    else
      render_form_errors(@daily_post, :new)
    end
  end

  def edit; end

  def update
    if @daily_post.update(daily_post_params)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: update_success_stream(@daily_post) }
        format.html { redirect_to daily_posts_path, notice: t('controllers.daily_posts.updated') }
      end
    else
      render_form_errors(@daily_post, :edit)
    end
  end

  def destroy
    if @daily_post.destroy
      redirect_to daily_posts_path, status: :see_other, notice: t('controllers.daily_posts.destroyed')
    else
      redirect_to daily_posts_path, status: :see_other, alert: @daily_post.errors.full_messages.to_sentence
    end
  end

  private

  def set_daily_post
    @daily_post = current_user.daily_posts.find_by!(id: params[:id])
  end

  def daily_post_params
    params.require(:daily_post).permit(:content)
  end

  def create_success_stream(post)
    ctx = month_context_for(Date.current)

    [
      turbo_stream.prepend('posts', partial: 'daily_posts/post', locals: { post: post }),
      turbo_stream.replace('calendar', partial: 'activities/calendar', locals: ctx),
      turbo_stream.replace('current_post', partial: 'activities/current_post', locals: { post: post }),
      turbo_stream.replace('new-post-button', partial: 'activities/new_post_button', locals: { posted_today: true }),
      turbo_stream.update('modal', '')
    ]
  end

  def update_success_stream(post)
    [
      turbo_stream.replace("post_#{post.id}", partial: 'daily_posts/post', locals: { post: post }),
      turbo_stream.update('modal', '')
    ]
  end

  def month_context_for(date)
    range  = date.all_month
    posts  = current_user.daily_posts.where(posted_on: range).to_a

    {
      user: current_user,
      calendar_days:       range.to_a,
      daily_posts_by_date: posts.index_by(&:posted_on),
      prev_month:          date.prev_month,
      next_month:          date.next_month
    }
  end

  def render_form_errors(resource, fallback_view)
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          'form_errors',
          partial: 'daily_posts/form_errors',
          locals: { daily_post: resource }
        )
      end
      format.html { render fallback_view, status: :unprocessable_entity }
    end
  end
end
