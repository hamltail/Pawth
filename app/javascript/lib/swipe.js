const DEFAULT_THRESHOLD = 50;

export function createSwipeTracker({ threshold = DEFAULT_THRESHOLD } = {}) {
  let startX = null;
  let startY = null;

  return {
    start(event) {
      if (!event.isPrimary) return;

      startX = event.clientX;
      startY = event.clientY;
    },

    finish(event) {
      if (!event.isPrimary || startX === null || startY === null) {
        return null;
      }

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      startX = null;
      startY = null;

      if (Math.abs(deltaY) >= Math.abs(deltaX)) return null;
      if (Math.abs(deltaX) < threshold) return null;

      return deltaX < 0 ? 'left' : 'right';
    },

    reset() {
      startX = null;
      startY = null;
    },
  };
}
