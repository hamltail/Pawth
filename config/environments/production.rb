require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # 本番はコードのホットリロードしない＝速くて安定
  config.enable_reloading = false
  # 起動時にまとめて読み込む＝スループット＆メモリ効率↑
  config.eager_load = true

  # エラー画面は本番用（スタックトレース非表示）
  config.consider_all_requests_local = false

  # コントローラ/ビューのキャッシュ有効
  config.action_controller.perform_caching = true
  # 指紋付きアセットを1年キャッシュ。Rails標準の安全設定
  config.public_file_server.headers = { 'cache-control' => "public, max-age=#{1.year.to_i}" }
  # CDNを使うなら有効化：config.asset_host = "https://cdn.example.com"

  # Active Storageをローカル保存。S3に出すときはここを:amazonに
  config.active_storage.service = :local

  # NginxなどでSSL終端してる前提でX-Forwarded-Protoを信頼。リダイレクトの無限ループ防止に効く
  config.assume_ssl = true
  # 常時HTTPS強制＋HSTS＋secure cookie
  config.force_ssl = true

  # リクエストIDをログに付けてSTDOUTへ。systemd/journaldで扱いやすい
  config.log_tags = [:request_id]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)
  # 既定はinfo。トラブル時だけdebugに
  config.log_level = ENV.fetch('RAILS_LOG_LEVEL', 'info')
  # 非推奨警告をログに出さない
  config.active_support.report_deprecations = false

  # Solid Cacheを使う指定。gemを入れてる前提。未導入ならmemory_storeやredis_cache_storeに変える
  config.cache_store = :solid_cache_store
  # Solid Queue（DBキュー）を使う。キュー用DB/接続を切ってるならこのまま。単一DBならconnects_toは省略可
  config.active_job.queue_adapter = :solid_queue
  # config.solid_queue.connects_to = { database: { writing: :queue } }

  # メール
  config.action_mailer.default_url_options = { host: 'pawth.hamltail.dev', protocol: 'https' }
  # メール送信（SES / SMTP）
  config.action_mailer.perform_deliveries = true
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address:              'email-smtp.ap-northeast-1.amazonaws.com',
    port:                 587,
    user_name:            ENV['SES_SMTP_USERNAME'],
    password:             ENV['SES_SMTP_PASSWORD'],
    authentication:       :login,
    enable_starttls_auto: true
  }

  # 訳が無いときは既定ロケールへフォールバック
  config.i18n.fallbacks = true

  # マイグレーション後にschemaを自動ダンプしない。CIで管理してるならこれでOK
  config.active_record.dump_schema_after_migration = false

  # ログのinspectを:idだけに。個人情報等のダダ漏れ防止
  config.active_record.attributes_for_inspect = [:id]

  # Hostヘッダ制限を厳しくしたい場合のみ：
  # config.hosts = ["pawth.hamltail.dev", /.*\.hamltail\.dev/]
  # config.host_authorization = { exclude: ->(r){ r.path == "/up" } }
end
