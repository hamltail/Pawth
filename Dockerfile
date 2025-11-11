# syntax=docker/dockerfile:1
# check=error=true

ARG RUBY_VERSION=3.4.7
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS base
WORKDIR /app

# ランタイムで必要な OS パッケージのみインストール
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libjemalloc2 \
      libvips \
      postgresql-client \
      libpq5 \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# 本番共通の環境設定
ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development test"

# ===========================
# build ステージ（アセット・gem をビルド）
# ===========================
FROM base AS build
# gem / assets のビルドに必要なパッケージ（ビルド専用なので多少重くてもOK）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libpq-dev \
      libyaml-dev \
      pkg-config \
      nodejs \
      npm \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# Gemfile 周りだけ先にコピーして bundle install
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    # キャッシュ削除でイメージを軽量化
    rm -rf ~/.bundle \
           "${BUNDLE_PATH}"/ruby/*/cache \
           "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    # bootsnap の gem キャッシュをプリコンパイル
    bundle exec bootsnap precompile --gemfile

# アプリ本体をコピー
COPY . .

# アプリコード向け bootsnap キャッシュ
RUN bundle exec bootsnap precompile app/ lib/

# アセットプリコンパイル（本番用）
# master.key は使わず、ダミーの DATABASE_URL / SECRET_KEY_BASE で precompile のみ実行
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy_db \
    SECRET_KEY_BASE_DUMMY=1 \
    bundle exec rails assets:precompile

# ===========================
# final ステージ（実行用イメージ）
# ===========================
FROM base
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app
# 非 root ユーザーを作成し、アプリ全体に権限を付与
RUN groupadd --system --gid 1000 app && \
    useradd app --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p log tmp/pids tmp/cache tmp/sockets storage && \
    chown -R app:app .
USER 1000:1000
ENV RAILS_LOG_TO_STDOUT=1
EXPOSE 3000
CMD ["bash", "-c", "rm -f tmp/pids/server.pid && bundle exec rails server -b 0.0.0.0 -p 3000"]
