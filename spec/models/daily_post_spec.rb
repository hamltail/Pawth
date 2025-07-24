require 'rails_helper'

RSpec.describe DailyPost, type: :model do
  it 'contentが必須であること' do
    post = DailyPost.new(content: nil)
    expect(post).not_to be_valid
  end
end
