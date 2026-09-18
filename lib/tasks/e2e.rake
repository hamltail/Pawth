namespace :e2e do
  desc 'Reset Playwright user for E2E'
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

    puts "E2E user ready: email=#{user.email}, username=#{user.username}"
  end
end
