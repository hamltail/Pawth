import { Controller } from '@hotwired/stimulus';

const DEFAULT_MAX = 365;

export default class extends Controller {
  static targets = ['input', 'counter'];
  static values = { max: Number };

  connect() {
    this.segmenter =
      window.Intl && Intl.Segmenter
        ? new Intl.Segmenter('ja', { granularity: 'grapheme' })
        : null;

    this.limit = this.hasMaxValue
      ? Number(this.maxValue)
      : Number(this.data.get('maxValue')) || DEFAULT_MAX;

    this.update();
  }

  update() {
    const text = this.inputTarget.value || '';
    const units = this.graphemes(text);

    if (units.length > this.limit) {
      this.inputTarget.value = units.slice(0, this.limit).join('');
    }

    const current = Math.min(units.length, this.limit);
    this.renderCounter(this.limit - current);
  }

  renderCounter(remain) {
    if (!this.hasCounterTarget) return;
    this.counterTarget.textContent = `残り${Math.max(0, remain)}文字`;
  }

  graphemes(str) {
    return this.segmenter
      ? Array.from(this.segmenter.segment(str), (s) => s.segment)
      : Array.from(str);
  }
}
