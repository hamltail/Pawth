namespace :e2e do
  desc 'Reset Playwright users and seed E2E data'
  task ensure_user: :environment do
    password = 'password1234'

    users = [
      {
        email: 'playwright@example.com',
        username: 'playwright',
        seed_daily_posts: true
      },
      {
        email: 'playwright-daily-post@example.com',
        username: 'playwright-daily-post',
        seed_daily_posts: false
      },
      {
        email: 'playwright-profile@example.com',
        username: 'playwright-profile',
        seed_daily_posts: false
      }
    ]

    User.where(email: users.pluck(:email)).destroy_all

    users.each do |attributes|
      user = User.create!(
        email: attributes[:email],
        username: attributes[:username],
        password: password,
        password_confirmation: password,
        confirmed_at: Time.current
      )

      next unless attributes[:seed_daily_posts]

      60.times do |index|
        days_ago = (index + 1) * 3

        user.daily_posts.create!(
          posted_on: days_ago.days.ago.to_date,
          content: "Playwright E2E 過去の日記 #{days_ago}",
          edit_count: 0
        )
      end
    end

    puts 'E2E users ready'
  end

  desc 'Remove Playwright E2E data'
  task cleanup: :environment do
    emails = [
      'playwright@example.com',
      'playwright-daily-post@example.com',
      'playwright-profile@example.com'
    ]

    User.where(email: emails).destroy_all

    puts 'E2E users cleaned up'
  end
end
