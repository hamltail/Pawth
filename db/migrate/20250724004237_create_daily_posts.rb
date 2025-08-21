class CreateDailyPosts < ActiveRecord::Migration[8.0]
  def change
    create_table :daily_posts do |t|
      t.references :user, null: false, foreign_key: true
      t.date :posted_on, null: false
      t.text :content, null: false
      t.integer :edit_count, null: false, default: 0

      t.timestamps
    end

    add_index :daily_posts, [:user_id, :posted_on], unique: true
  end
end
