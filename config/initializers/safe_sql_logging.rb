# frozen_string_literal: true

# Prevent raw SQL statements and bind values from being written to logs.
# In development, report query duration without exposing SQL content.

Rails.application.config.after_initialize do
  ActiveRecord::Base.logger = nil

  if Rails.env.development?
    ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)

      unless event.payload[:name] == 'SCHEMA'
        Rails.logger.debug(
          "Database query completed (#{event.duration.round(1)}ms)"
        )
      end
    end
  end
end
