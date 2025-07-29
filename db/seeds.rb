require "faker"

FactoryBot.create(:user, username: "miku", email: "miku@example.com")
FactoryBot.create(:user, username: "rin", email: "rin@example.com")
FactoryBot.create(:user, username: "len", email: "len@example.com")
FactoryBot.create_list(:user, 5)

miku = User.find_by(username: "miku")
FactoryBot.create(:daily_post, user: miku, posted_on: 3.days.ago.to_date)
