require "active_support/core_ext/integer/time"

Rails.application.configure do
  # 変更を即反映s
  config.enable_reloading = true
  # 起動を軽くするため遅延ロード
  config.eager_load = false

  # エラーは詳細表示（スタックトレース出す）
  config.consider_all_requests_local = true

  # 開発用のサーバタイミング（パフォ計測ヘッダ）
  config.server_timing = true

  # キャッシュは dev:cache トグルに追従（普段はOFFでOK）
  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true
    config.public_file_server.headers = { "cache-control" => "public, max-age=#{2.days.to_i}" }
  else
    config.action_controller.perform_caching = false
  end
  # キャッシュストアは軽量で十分
  config.cache_store = :memory_store

  # ファイル保存はローカル
  config.active_storage.service = :local

  # メール：即時に不具合を見つけたいので error を上げる
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_caching = false
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 }
  # ブラウザでメールを確認（実送信しない）
  config.action_mailer.delivery_method = :letter_opener
  config.action_mailer.perform_deliveries = true

  # 非推奨はログへ
  config.active_support.deprecation = :log

  # マイグレーション未実行ならページロード時にエラー
  config.active_record.migration_error = :page_load

  # SQLを呼んだ行を強調
  config.active_record.verbose_query_logs = true
  # SQLへタグ付け（実行時間などの追跡向け）
  config.active_record.query_log_tags_enabled = true
  # Active Jobのログを丁寧に
  config.active_job.verbose_enqueue_logs = true

  # ビューにファイル名注釈
  config.action_view.annotate_rendered_view_with_filenames = true

  # before_action のonly/exceptミスを厳格に検出
  config.action_controller.raise_on_missing_callback_actions = true
end
