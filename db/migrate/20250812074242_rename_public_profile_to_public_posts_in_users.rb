class RenamePublicProfileToPublicPostsInUsers < ActiveRecord::Migration[8.0]
  def change
    rename_column :users, :public_profile, :public_posts
    change_column_default :users, :public_posts, from: false, to: true
    User.update_all(public_posts: true)
  end
end
