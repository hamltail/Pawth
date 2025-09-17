require "faker"
Faker::Config.locale = 'en'

miku = FactoryBot.create(:user,
                          username: "miku",
                          email: "miku@example.com",
                          confirmed_at: Time.current
                        )
rin = FactoryBot.create(:user,
                          username: "rin",
                          email: "rin@example.com",
                          confirmed_at: Time.current
                        )
other_users = FactoryBot.create_list(:user, 30)

target_users = [miku, rin] + other_users
target_users.each do |user|
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

miku.profile || miku.create_profile!
miku.profile.avatar.purge if miku.profile.avatar.attached?
miku.profile.avatar.attach(
  io: File.open(Rails.root.join("db/seed_images/avatar1.png"), "rb"),
  filename: "avatar1.png",
  content_type: "image/png"
)

rin.profile || rin.create_profile!
rin.profile.avatar.purge if rin.profile.avatar.attached?
rin.profile.avatar.attach(
  io: File.open(Rails.root.join("db/seed_images/avatar2.png"), "rb"),
  filename: "avatar2.png",
  content_type: "image/png"
)

# 他のユーザーはローテーション
avatar_paths = [
  Rails.root.join("db/seed_images/avatar1.png"),
  Rails.root.join("db/seed_images/avatar2.png"),
  nil # 未登録
]
avatar_enum = avatar_paths.cycle

other_users.each do |user|
  profile = user.profile || user.create_profile!
  profile.avatar.purge if profile.avatar.attached?

  path = avatar_enum.next
  next unless path.present? # nil の場合はスキップ（未登録）

  profile.avatar.attach(
    io: File.open(path, "rb"),
    filename: File.basename(path),
    content_type: "image/png"
  )
end
