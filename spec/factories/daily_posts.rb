FactoryBot.define do
  factory :daily_post do
    association :user
    posted_on { Faker::Date.between(from: 3.months.ago, to: Date.today) }
    content { Faker::Lorem.paragraph_by_chars(number: 365) }
    edit_count { rand(0..2) }
  end
end
