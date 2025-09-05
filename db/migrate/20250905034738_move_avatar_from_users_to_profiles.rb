class MoveAvatarFromUsersToProfiles < ActiveRecord::Migration[8.0]
  def up
    say_with_time "Ensure profiles exist for all users" do
      execute <<~SQL
        INSERT INTO profiles (user_id, display_name, public_posts, created_at, updated_at)
        SELECT u.id, COALESCE(u.display_name, ''), COALESCE(u.public_posts, TRUE), NOW(), NOW()
        FROM users u
        WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id)
      SQL
    end

    say_with_time "Reattaching avatar from users to profiles" do
      execute <<~SQL
        UPDATE active_storage_attachments a
           SET record_type = 'Profile',
               record_id   = p.id
          FROM profiles p
         WHERE a.name = 'avatar'
           AND a.record_type = 'User'
           AND p.user_id = a.record_id
      SQL
    end
  end

  def down
    say_with_time "Reattaching avatar back to users" do
      execute <<~SQL
        UPDATE active_storage_attachments a
           SET record_type = 'User',
               record_id   = p.user_id
          FROM profiles p
         WHERE a.name = 'avatar'
           AND a.record_type = 'Profile'
           AND p.id = a.record_id
      SQL
    end
  end
end
