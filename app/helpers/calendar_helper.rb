module CalendarHelper
  TOTAL_CELLS = 7 * 6 # 42

  def calendar_meta(calendar_days)
    first_day = calendar_days.first
    leading_empty = ((first_day.wday - 1) % 7)
    filled = leading_empty + calendar_days.size

    {
      month_number: first_day.month,
      month_year_label: first_day.strftime('%b %Y'),
      weekdays: weekdays_labels,
      leading_empty:,
      trailing_empty: TOTAL_CELLS - filled
    }
  end

  def weekdays_labels
    I18n.t('date.abbr_day_names', locale: :en).rotate(1) # 英語固定（月曜始まり）
  end

  def day_cell_classes(date)
    base = 'calendar-day-cell relative flex aspect-square min-h-0 min-w-0 flex-col items-center lg:aspect-auto lg:h-16'

    case date.wday
    when 6 then "#{base} calendar-saturday"
    when 0 then "#{base} calendar-sunday"
    else base
    end
  end

  def calendar_day_color_class(date, weekday_class: 'text-secondary-text')
    return 'calendar-sunday' if date.sunday? || HolidayJp.holiday?(date)
    return 'calendar-saturday' if date.saturday?

    weekday_class
  end

  def post_for(date, posts_by_day)
    posts_by_day[date]
  end

  def calendar_today?(date, today = Date.current)
    date == today
  end

  def calendar_mark_for(date, post, icon: :paw)
    partial = calendar_mark_partial(icon)
    mark_size = 'size-[min(64%,3.5rem)]! lg:size-14! shrink-0'

    if post
      render partial,
             klass: "cursor-pointer calendar-mark--posted #{mark_size}",
             dataset: {
               date:,
               content: post.content,
               weekday_class: calendar_day_color_class(date, weekday_class: 'theme-link')
             },
             grad: true
    else
      render partial,
             klass: "text-muted opacity-50 #{mark_size}",
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
    badge_classes = 'today-neon pointer-events-none select-none absolute ' \
                    'bottom-[-0.25rem] lg:bottom-auto lg:top-11 left-1/2 ' \
                    '-translate-x-1/2 flex gap-[2px] font-bold ' \
                    'text-[8px] leading-none tracking-tight ' \
                    'lg:text-[12px] lg:tracking-widest ' \
                    'text-emerald-700 in-data-[theme=dark]:text-emerald-300'

    content_tag :div,
                class: badge_classes,
                style: 'text-shadow: 0 0 4px rgba(52,211,153,0.95), ' \
                       '0 0 10px rgba(16,185,129,0.8), ' \
                       '0 0 18px rgba(16,185,129,0.4);' do
      safe_join(text.chars.each_with_index.map { |ch, i|
        content_tag(:span, ch, class: 'today-neon-char inline-block', data: { idx: i })
      })
    end
  end
end
