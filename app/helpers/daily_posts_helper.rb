module DailyPostsHelper
  include Pagy::Frontend

  def timeline_mark_for(icon: :paw)
    render calendar_mark_partial(icon),
           klass: '!w-8 !h-8',
           dataset: {},
           grad: true
  end

  def timeline_month_number(date)
    date.month
  end

  def timeline_month_year_label(date)
    date.strftime('%b %Y')
  end

  def timeline_weekday_label(date)
    I18n.t('date.abbr_day_names', locale: :en)[date.wday]
  end
end
