class FlipCard {
  constructor(cardEl) {
    this.card = cardEl;
    this.top = cardEl.querySelector('.top .text');
    this.bottom = cardEl.querySelector('.bottom .text');
    this.flipTop = cardEl.querySelector('.flip-top .text');
    this.flipBottom = cardEl.querySelector('.flip-bottom .text');
    this.flipTopEl = cardEl.querySelector('.flip-top');
    this.flipBottomEl = cardEl.querySelector('.flip-bottom');
    this.currentValue = cardEl.dataset.value || '0';
  }

  setValue(val, animate = true) {
    const strVal = String(val);
    if (strVal === this.currentValue) return;
    if (!animate) {
      this.top.textContent = strVal;
      this.bottom.textContent = strVal;
      this.currentValue = strVal;
      this.card.dataset.value = strVal;
      return;
    }

    this.flipTop.textContent = strVal;
    this.flipBottom.textContent = strVal;

    const ft = this.flipTopEl;
    const fb = this.flipBottomEl;

    // Clear any previous animation state
    ft.classList.remove('flipping');
    fb.classList.remove('flipping');
    ft.style.display = 'none';
    fb.style.display = 'none';

    // ── Step 1: show & animate top half (90°→0°, flips DOWN) ──
    ft.style.display = 'block';
    // force layout so display:block takes effect
    void ft.offsetHeight;
    ft.classList.add('flipping');

    // ── Step 2: after 300ms, switch to bottom half ──
    setTimeout(() => {
      this.top.textContent = strVal;
      ft.classList.remove('flipping');
      ft.style.display = 'none';

      fb.style.display = 'block';
      void fb.offsetHeight;
      fb.classList.add('flipping');

      setTimeout(() => {
        this.bottom.textContent = strVal;
        fb.classList.remove('flipping');
        fb.style.display = 'none';
        this.currentValue = strVal;
        this.card.dataset.value = strVal;
      }, 300);
    }, 300);
  }
}

class FlipClock {
  constructor() {
    this.cards = [];
    this.initialized = false;
  }

  init(groups) {
    for (const [key, id] of Object.entries(groups)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const cardEl = el.querySelector('.flip-card');
      this[key] = new FlipCard(cardEl);
      this.cards.push(this[key]);
    }
    this.initialized = true;
  }

  setTime(hours, minutes, seconds) {
    if (!this.initialized) return;

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    const init =
      this.hoursTens.currentValue === '0' &&
      this.hoursOnes.currentValue === '0' &&
      this.minutesTens.currentValue === '0';

    this.hoursTens.setValue(h[0], !init);
    this.hoursOnes.setValue(h[1], !init);
    this.minutesTens.setValue(m[0], !init);
    this.minutesOnes.setValue(m[1], !init);
    this.secondsTens.setValue(s[0], !init);
    this.secondsOnes.setValue(s[1], !init);
  }
}
