namespace :e2e do
  desc 'Ensure Playwright user exists for E2E'
  task ensure_user: :environment do
    email    = 'playwright@example.com'
    password = 'password1234'

    user = User.find_or_initialize_by(email: email)
    user.username ||= 'playwright'
    user.password = password
    user.password_confirmation = password
    user.confirmed_at ||= Time.current if user.respond_to?(:confirmed_at)

    user.save!
    puts "E2E user ready: email=#{user.email}, username=#{user.username}"
  end
end
