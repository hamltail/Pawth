class RemoveProfileMessageFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :profile_message, :text
  end
end
