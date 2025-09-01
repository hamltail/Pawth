import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['img', 'input'];

  connect() {
    this.objectUrl = null;
  }

  update() {
    const file = this.inputTarget?.files?.[0];
    if (file) {
      // 以前のObjectURLを解放してメモリリークを防ぐ
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(file);
      this.imgTarget.src = this.objectUrl;
    } else {
      this.reset();
    }
  }

  // フォームreset時やファイル未選択時に既定画像へ戻す
  reset() {
    const def =
      this.imgTarget.dataset.defaultSrc ||
      this.imgTarget.getAttribute('data-default-src');
    if (def) this.imgTarget.src = def;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  disconnect() {
    // 画面遷移/キャッシュ前の掃除
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }
}
