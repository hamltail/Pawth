namespace :e2e do
  desc 'Ensure Playwright user exists for E2E'
  task ensure_user: :environment do
    email    = 'playwright@example.com'
    password = 'password1234'
    base     = 'playwright'

    username = base
    i = 1
    while User.exists?(username: username) || User::RESERVED_USERNAMES.include?(username)
      i += 1
      username = "#{base}#{i}"
    end

    user = User.find_or_initialize_by(email: email)
    if user.new_record?
      user.username = username
    end

    user.password = password
    user.password_confirmation = password
    user.confirmed_at ||= Time.current if user.respond_to?(:confirmed_at)

    user.save!
    puts "E2E user ready: email=#{user.email}, username=#{user.username}"
  end
end
