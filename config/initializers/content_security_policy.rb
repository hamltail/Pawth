# frozen_string_literal: true

require 'securerandom'

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self

    policy.script_src :self,
                      'https://cdn.jsdelivr.net',
                      'https://ga.jspm.io'

    policy.style_src :self, :unsafe_inline

    policy.img_src :self, :data, :blob
    policy.font_src :self, :data

    policy.connect_src :self,
                       'https://cdn.jsdelivr.net'

    policy.worker_src :self, :blob

    policy.object_src :none
    policy.frame_src :none
    policy.frame_ancestors :none

    policy.base_uri :self
    policy.form_action :self
  end

  # リクエストごとに新しいnonceを生成する
  config.content_security_policy_nonce_generator =
    ->(_request) { SecureRandom.base64(16) }

  # インラインJavaScriptにnonceを使用する
  config.content_security_policy_nonce_directives = %w[script-src]

  # 第2段階：CSP違反を実際にブロックする
  config.content_security_policy_report_only = false
end
