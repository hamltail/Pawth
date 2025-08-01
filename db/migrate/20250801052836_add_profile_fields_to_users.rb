class AddProfileFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :display_name, :string, null: false, default: ""
    add_column :users, :profile_message, :text, null: false, default: ""
    add_column :users, :public_profile, :boolean, null: false, default: false
  end
end
