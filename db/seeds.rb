require "faker"
Faker::Config.locale = 'en'

users = FactoryBot.create_list(:user, 30)

users.each do |user|
  dates = (1..180).to_a.sample(175)
  dates.each do |days_ago|
    FactoryBot.create(
      :daily_post,
      user: user,
      posted_on: days_ago.days.ago.to_date,
      content: Faker::Lorem.paragraph_by_chars(number: 365),
      edit_count: rand(0..2)
    )
  end
end

avatar_paths = Dir[Rails.root.join("db/seed_images/avatar*.png")].sort
avatar_paths << nil
avatar_enum = avatar_paths.cycle

users.each do |user|
  profile = user.profile || user.create_profile!
  profile.avatar.purge if profile.avatar.attached?

  path = avatar_enum.next
  next unless path.present?

  profile.avatar.attach(
    io: File.open(path, "rb"),
    filename: File.basename(path),
    content_type: "image/png"
  )
end
