namespace :e2e do
  desc 'Reset Playwright user and seed E2E data'
  task ensure_user: :environment do
    email = 'playwright@example.com'
    password = 'password1234'

    User.find_by(email: email)&.destroy!

    user = User.create!(
      email: email,
      username: 'playwright',
      password: password,
      password_confirmation: password,
      confirmed_at: Time.current
    )

    60.times do |index|
      days_ago = (index + 1) * 3

      user.daily_posts.create!(
        posted_on: days_ago.days.ago.to_date,
        content: "Playwright E2E 過去の日記 #{days_ago}",
        edit_count: 0
      )
    end

    puts "E2E user ready: email=#{user.email}, username=#{user.username}"
    puts "E2E daily posts ready: count=#{user.daily_posts.count}"
  end
end
