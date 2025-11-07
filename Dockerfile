# syntax=docker/dockerfile:1
# check=error=true

ARG RUBY_VERSION=3.4.7
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS base
WORKDIR /app

# ランタイムで必要な OS パッケージだけ入れる
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libjemalloc2 \
      libvips \
      postgresql-client \
      libpq5 \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# 本番環境共通の設定
ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development test"

# ===========================
# build ステージ
# ===========================
FROM base AS build

# gem / assets ビルドに必要なもの（ビルド専用なので多少重くてもOK）
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

# Gemfile まわりだけ先にコピーして bundle install
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    # キャッシュ削除でイメージを軽くする
    rm -rf ~/.bundle \
           "${BUNDLE_PATH}"/ruby/*/cache \
           "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    # bootsnap の gem キャッシュを先にプリコンパイル
    bundle exec bootsnap precompile --gemfile

# アプリ本体をコピー
COPY . .

# bootsnap precompile（Rails 起動を速くする）
RUN bundle exec bootsnap precompile app/ lib/

# 資産プリコンパイル（本番用）
# master.key はここでは使わず、ダミーの SECRET_KEY_BASE を渡して precompile だけする
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy_db \
    SECRET_KEY_BASE_DUMMY=1 \
    bundle exec rails assets:precompile

# ===========================
# final ステージ
# ===========================
FROM base

# build ステージで作った gem とアプリ本体をコピー
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

# 非 root ユーザーを作成して、書き込みが必要なディレクトリの権限を付与
RUN groupadd --system --gid 1000 app && \
    useradd app --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p log tmp/pids tmp/cache tmp/sockets storage && \
    chown -R app:app log tmp storage tmp

USER 1000:1000

# Rails のログを STDOUT に流す
ENV RAILS_LOG_TO_STDOUT=1

# アプリが listen するポート
EXPOSE 3000

# 起動コマンド
CMD ["bash", "-c", "rm -f tmp/pids/server.pid && bundle exec rails db:migrate && bundle exec rails server -b 0.0.0.0 -p 3000"]
