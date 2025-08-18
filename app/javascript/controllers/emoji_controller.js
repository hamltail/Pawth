import { Controller } from "@hotwired/stimulus";
import "emoji-picker-element";
import i18nJa from "emoji-i18n-ja";

export default class extends Controller {
  static targets = ["button", "dialog", "picker", "textarea"];

  connect() {
    if (this._bound) return;

    try {
      const dict = i18nJa?.default ?? i18nJa;
      this.pickerTarget.i18n = dict;
      this.pickerTarget.locale = "ja";
      this.pickerTarget.dataSource =
        "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/ja/emojibase/data.json";
    } catch (e) {
      console.warn("emoji i18n setup failed:", e);
    }

    this.onEmojiClick = (e) => {
      const emoji = e.detail.unicode;
      this.insertAtCursor(this.textareaTarget, emoji);
      this.close();
      this.textareaTarget.focus();
    };
    this.pickerTarget.addEventListener("emoji-click", this.onEmojiClick);

    // 外側クリックで閉じる
    this.onDocClick = (e) => {
      if (!this.dialogTarget.open) return;
      const inside = this.dialogTarget.contains(e.target);
      const onButton = e.target === this.buttonTarget;
      if (!inside && !onButton) this.close();
    };
    document.addEventListener("click", this.onDocClick);

    // Escで閉じる
    this.onKeydown = (e) => { if (e.key === "Escape") this.close(); };
    document.addEventListener("keydown", this.onKeydown);

    this._bound = true;
  }

  disconnect() {
    if (!this._bound) return;
    this.pickerTarget.removeEventListener("emoji-click", this.onEmojiClick);
    document.removeEventListener("click", this.onDocClick);
    document.removeEventListener("keydown", this.onKeydown);
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    this._bound = false;
  }

  open() {
    const dlg = this.dialogTarget;
    if (!dlg.open) dlg.show(); // 非モーダル

    Object.assign(dlg.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      margin: "0",
      padding: "0",
      border: "0",
      background: "transparent",
      zIndex: 60
    });

    this.buttonTarget.ariaExpanded = "true";
    this.pickerTarget.focus?.();

    this._onResize ||= () => {
      if (!dlg.open) return;
      dlg.style.left = "50%";
      dlg.style.top = "50%";
      dlg.style.transform = "translate(-50%, -50%)";
    };
    window.addEventListener("resize", this._onResize, { passive: true });
  }

  close() {
    if (this.dialogTarget.open) this.dialogTarget.close();
    this.buttonTarget.ariaExpanded = "false";
    if (this._onResize) window.removeEventListener("resize", this._onResize);
  }

  insertAtCursor(el, text) {
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after  = el.value.slice(end);
    el.value = before + text + after;
    const pos = start + text.length;
    el.setSelectionRange(pos, pos);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
