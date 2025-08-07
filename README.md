# Pawth 🐾

## 〜日々の足あとを、そっと描く。〜

Pawth は、日々の足あとを記録するためのアプリです。
1日1投稿、自分だけの歩みをそっと可視化することができます。

## 主な機能 (WIP)

- ユーザー登録・ログイン
- プロフィール編集（画像・表示名・メッセージ・公開/非公開設定）
- 1日1つの足あと投稿（編集・削除・文字数制限あり）
- カレンダー
- 投稿の一覧
- 投稿の検索・絞り込み
- モバイル/PC両対応のUI
- 各種バリデーション・ガード実装

## 開発環境 (WIP)

- Ruby: 3.4.4
- Rails: 8.0.2
- DB: PostgreSQL 14.18
- 認証: Devise
- フロント: Haml, Tailwind CSS, Turbo, GSAP
- テスト: RSpec, Capybara, FactoryBot, Selenium

## セットアップ

```
git clone https://github.com/hamltail/pawth.git
cd pawth
bundle install
rails db:setup
rails server
```

## テストの実行

```
bundle exec rspec
```
