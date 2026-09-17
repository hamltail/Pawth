module DailyPostsHelper
  include Pagy::Frontend

  def timeline_mark_for(icon: :paw)
    render calendar_mark_partial(icon),
           klass: '!w-8 !h-8',
           dataset: {},
           grad: true
  end

  def timeline_month_label(date)
    date.strftime(t('date.formats.month_year'))
  end

  def timeline_weekday_label(date)
    I18n.t('date.abbr_day_names', locale: :en)[date.wday]
  end
end
