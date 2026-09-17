module CalendarHelper
  TOTAL_CELLS = 7 * 6 # 42

  def calendar_meta(calendar_days)
    first_day = calendar_days.first
    leading_empty = ((first_day.wday - 1) % 7)
    filled = leading_empty + calendar_days.size

    {
      month_label: first_day.strftime(t('date.formats.month_year')),
      weekdays: weekdays_labels,
      leading_empty:,
      trailing_empty: TOTAL_CELLS - filled
    }
  end

  def weekdays_labels
    I18n.t('date.abbr_day_names', locale: :en).rotate(1) # 英語固定（月曜始まり）
  end

  def day_cell_classes(date)
    base = 'relative flex h-16 flex-col items-center'

    case date.wday
    when 6 then "#{base} calendar-saturday"
    when 0 then "#{base} calendar-sunday"
    else base
    end
  end

  def post_for(date, posts_by_day)
    posts_by_day[date]
  end

  def calendar_today?(date, today = Date.current)
    date == today
  end

  def calendar_mark_for(date, post, icon: :paw)
    partial = calendar_mark_partial(icon)

    if post
      render partial,
             klass: 'cursor-pointer calendar-mark--posted',
             dataset: { date:, content: post.content },
             grad: true
    else
      render partial,
             klass: 'text-muted opacity-50',
             grad: false
    end
  end

  def calendar_mark_partial(icon)
    case icon.to_sym
    when :star
      'shared/star'
    else
      'shared/paw'
    end
  end

  def today_badge(text = t('.today'))
    content_tag :div,
                class: 'today-badge pointer-events-none select-none absolute top-11 left-1/2 -translate-x-1/2 font-bold text-[12px] tracking-widest flex gap-[2px]' do
      safe_join(text.chars.each_with_index.map { |ch, i|
        content_tag(:span, ch, class: 'today-char', data: { idx: i })
      })
    end
  end
end
