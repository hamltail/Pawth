# Docker内でのシステムテストに必要なChrome起動設定
RSpec.configure do |config|
  config.before(:each, type: :system) do
    driven_by :selenium, using: :headless_chrome do |options|
      next unless File.exist?('/.dockerenv')

      # Selenium Managerが取得したChrome本体を明示する
      paths = Selenium::WebDriver::SeleniumManager.binary_paths(
        '--browser', 'chrome'
      )
      options.binary = paths.fetch('browser_path')

      # Dockerのroot実行と共有メモリ制約に対応
      options.add_argument('--no-sandbox') if Process.uid.zero?
      options.add_argument('--disable-dev-shm-usage')
    end
  end
end
