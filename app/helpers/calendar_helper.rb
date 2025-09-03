module CalendarHelper
  def calendar_meta(calendar_days)
    first = calendar_days.first
    first_wday = first.wday
    empty = (first_wday - 1) % 7
    total = 42
    filled = empty + calendar_days.size

    {
      month_label: first.strftime(t('date.formats.month_year')),
      week_days: week_days_labels,
      empty_cells: empty,
      trailing_empty_cells: total - filled
    }
  end

  def week_days_labels
    I18n.t('date.abbr_day_names', locale: :en).rotate(1) # %w[Mon Tue Wed Thu Fri Sat Sun]
  end

  def day_cell_classes(date)
    base = 'relative flex flex-col items-center'
    case date.wday
    when 6 then "#{base} text-blue-600"
    when 0 then "#{base} text-red-600"
    else base
    end
  end

  def post_for(date, daily_posts_by_date)
    daily_posts_by_date[date]&.first
  end

  def calendar_today?(date, today = Date.current)
    date == today
  end
end
