class AddUniqueIndexOnLowerUsername < ActiveRecord::Migration[8.0]
  def change
    remove_index :users, :username, if_exists: true
    add_index :users, "lower(username)", unique: true, name: "index_users_on_lower_username"
  end
end
