# Pin npm packages by running ./bin/importmap

pin 'application'
pin '@hotwired/turbo-rails', to: 'turbo.min.js'
pin '@hotwired/stimulus', to: 'stimulus.min.js'
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js'
pin_all_from 'app/javascript/controllers', under: 'controllers'
pin 'components/calendar', to: 'components/calendar.js'
pin 'components/fade_in_posts', to: 'components/fade_in_posts.js'
pin 'components/menu', to: 'components/menu.js'
pin 'components/preview_avatar', to: 'components/preview_avatar.js'
pin 'components/toggle_label', to: 'components/toggle_label.js'
pin 'emoji-picker-element', to: 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js', preload: true
pin 'emoji-i18n-ja', to: 'https://cdn.jsdelivr.net/npm/emoji-picker-element@1/i18n/ja.js'
pin 'gsap', to: 'https://ga.jspm.io/npm:gsap@3.12.2/index.js'
