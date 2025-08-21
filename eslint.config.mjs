import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // ESLint公式recommendedルールセット
  js.configs.recommended,

  // プロジェクト共通の設定
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser, // ブラウザ用のグローバル変数 (document, window など)
      },
    },
  },

  // Prettier連携（競合無効化＋Prettier違反をエラー扱い）
  prettierRecommended,
];
