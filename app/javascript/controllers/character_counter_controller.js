import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['input', 'counter'];
  static values = { max: Number };

  connect() {
    this.segmenter =
      window.Intl && Intl.Segmenter
        ? new Intl.Segmenter('ja', { granularity: 'grapheme' })
        : null;

    this.max = this.hasMaxValue
      ? this.maxValue
      : Number(this.data.get('maxValue') || 365);

    this.update();
  }

  update() {
    const v = this.inputTarget.value || '';
    const units = this.graphemes(v);

    if (units.length > this.max) {
      this.inputTarget.value = units.slice(0, this.max).join('');
    }

    const current = this.graphemes(this.inputTarget.value).length;
    const remain = Math.max(0, this.max - current);
    if (this.hasCounterTarget)
      this.counterTarget.textContent = `残り${remain}文字`;
  }

  paste() {
    setTimeout(() => this.update(), 0);
  }

  graphemes(str) {
    if (this.segmenter) {
      return Array.from(this.segmenter.segment(str), (s) => s.segment);
    }
    return Array.from(str);
  }
}
