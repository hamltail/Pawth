RSpec.configure do |config|
  config.before(:suite) do
    Rails.application.routes_reloader.execute_unless_loaded
  end
end
