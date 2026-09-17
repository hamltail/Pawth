class AddCalendarIconToProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles, :calendar_icon, :string, null: false, default: 'paw'
  end
end
