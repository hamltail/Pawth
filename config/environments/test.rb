Rails.application.configure do
  # 変更監視やリロードは不要（速度優先）
  config.enable_reloading = false

  # CIではtrueにして本番同様の読み込み確認をするのが推奨
  # ローカルの単体テストは false の方が速い
  config.eager_load = ENV["CI"].present?

  # 静的ファイルの配信に軽いキャッシュヘッダ
  config.public_file_server.headers = { "cache-control" => "public, max-age=3600" }

  # エラー詳細を表示（デバッグしやすく）
  config.consider_all_requests_local = true

  # キャッシュ無効。キャッシュに起因するブレ防止
  config.cache_store = :null_store

  # rescue_from で救える例外は例外ページをレンダリング、それ以外は例外を発生（テスト失敗として検出）
  config.action_dispatch.show_exceptions = :rescuable

  # CSRF保護を無効化。テストをシンプルに
  config.action_controller.allow_forgery_protection = false

  # 一時ディレクトリにファイル保存（テスト終了後に捨てられる前提）
  config.active_storage.service = :test

  # 実送信しない。送られたメールは ActionMailer::Base.deliveries に貯まる
  config.action_mailer.delivery_method = :test
  # メール内リンク生成用のホスト。何でもOK（実送信しないため）
  config.action_mailer.default_url_options = { host: "test.hamltail.dev" }

  # Active Jobはテストアダプタ（enqueue/performの検証がしやすい）
  config.active_job.queue_adapter = :test

  # 非推奨警告はstderrへ。CIで拾いやすい
  config.active_support.deprecation = :stderr

  # before_action の only/except ミスを厳格に検出
  config.action_controller.raise_on_missing_callback_actions = true

  # 必要になったら有効化（テンプレートにファイル名注釈）
  # config.action_view.annotate_rendered_view_with_filenames = true

  # 必要になったら有効化（未翻訳をテストで検出）
  # config.i18n.raise_on_missing_translations = true
end
