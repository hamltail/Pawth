class ChangeDefaultPublicPostsOnProfiles < ActiveRecord::Migration[8.1]
  def change
    change_column_default :profiles, :public_posts,
                          from: true, to: false
  end
end
