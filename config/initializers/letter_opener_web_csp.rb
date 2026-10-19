# frozen_string_literal: true

# LetterOpenerWebはiframeでメール本文を表示するため、
# 開発環境のメールプレビューに限り同一オリジンの埋め込みを許可する。
if Rails.env.development?
  Rails.application.config.to_prepare do
    LetterOpenerWeb::LettersController.content_security_policy(only: :index) do |policy|
      policy.frame_src :self
    end

    LetterOpenerWeb::LettersController.content_security_policy(only: :show) do |policy|
      policy.frame_ancestors :self
    end
  end
end
