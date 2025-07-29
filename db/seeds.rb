require "faker"

miku = FactoryBot.create(:user, username: "miku", email: "miku@example.com")
rin = FactoryBot.create(:user, username: "rin", email: "rin@example.com")
len = FactoryBot.create(:user, username: "len", email: "len@example.com")
other_users = FactoryBot.create_list(:user, 5)

(1..90).each do |n|
  FactoryBot.create(
    :daily_post,
    user: miku,
    posted_on: n.days.ago.to_date,
    content: Faker::Lorem.paragraph_by_chars(number: 365),
    edit_count: rand(0..2)
  )
end

target_users = [rin, len] + other_users
target_users.each do |user|
  dates = (0..29).to_a.sample(10)
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
