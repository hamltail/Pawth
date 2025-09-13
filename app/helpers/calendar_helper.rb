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

  def first_post_on(date, posts_by_date)
    Array(posts_by_date[date]).first
  end

  def calendar_today?(date, today = Date.current)
    date == today
  end

  def paw_icon_for(date, post)
    if post
      render 'shared/paw',
             klass: 'text-pink-300 cursor-pointer paw--posted',
             dataset: { date:, content: post.content },
             grad: true
    else
      render 'shared/paw',
             klass: 'text-gray-300 opacity-50',
             grad: false
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
