class RemoveDisplayNameAndPublicPostsFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :display_name, :string
    remove_column :users, :public_posts, :boolean
  end
end
