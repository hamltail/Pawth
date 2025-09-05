class CreateProfiles < ActiveRecord::Migration[8.0]
  def up
    create_table :profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string  :display_name, null: false, default: ""
      t.boolean :public_posts, null: false, default: true
      t.timestamps
    end

    say_with_time "Backfilling profiles from users" do
      execute <<~SQL
        INSERT INTO profiles (user_id, display_name, public_posts, created_at, updated_at)
        SELECT id, COALESCE(display_name, ''), COALESCE(public_posts, TRUE), NOW(), NOW()
        FROM users
      SQL
    end
  end

  def down
    drop_table :profiles
  end
end
