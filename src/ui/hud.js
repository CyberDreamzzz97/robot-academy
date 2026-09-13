// Heads-up display: progress tracker, interaction prompt, toasts and the help card.
import { ROBOTS } from '../data/robots.js';

const SAVE_KEY = 'robot-academy-progress-v1';

export class HUD {
  constructor(root) {
    this.root = root;
    this.taught = new Set(loadProgress());

    root.innerHTML = `
      <div class="hud-top">
        <div class="hud-logo">ROBOT <span>ACADEMY</span></div>
        <div class="hud-progress">
          <div class="hud-track"><i></i></div>
          <span class="hud-count"></span>
        </div>
      </div>

      <button class="hud-journal-btn" type="button" aria-label="Open journal">Journal</button>

      <aside class="hud-journal" hidden>
        <h3>Lessons learned</h3>
        <ul class="hud-list"></ul>
        <p class="hud-journal-foot">Walk up to a robot and click it to learn. Enter its house for the full lesson.</p>
      </aside>

      <div class="hud-prompt" hidden><span class="hud-key">Click</span><span class="hud-label"></span></div>
      <div class="hud-toast" hidden></div>

      <div class="hud-help">
        <b>Left click</b> ground to walk &nbsp;·&nbsp; <b>Click</b> a robot or door &nbsp;·&nbsp;
        <b>Right-drag</b> to turn &nbsp;·&nbsp; <b>Scroll</b> to zoom
      </div>`;

    this.bar = root.querySelector('.hud-track i');
    this.count = root.querySelector('.hud-count');
    this.list = root.querySelector('.hud-list');
    this.prompt = root.querySelector('.hud-prompt');
    this.promptLabel = root.querySelector('.hud-label');
    this.toastEl = root.querySelector('.hud-toast');
    this.journal = root.querySelector('.hud-journal');

    root.querySelector('.hud-journal-btn').addEventListener('click', () => {
      this.journal.hidden = !this.journal.hidden;
    });

    this.refresh();
  }

  refresh() {
    const total = ROBOTS.length;
    const n = this.taught.size;
    this.bar.style.width = `${(n / total) * 100}%`;
    this.count.textContent = `${n} / ${total} lessons`;
    this.list.innerHTML = ROBOTS.map(r => {
      const done = this.taught.has(r.id);
      return `<li class="${done ? 'is-done' : ''}">
        <span class="hud-dot" style="background:#${r.palette.body.toString(16).padStart(6, '0')}"></span>
        <span class="hud-li-name">${r.name}</span>
        <span class="hud-li-sub">${done ? r.reward : r.subject}</span>
      </li>`;
    }).join('');
  }

  markTaught(id) {
    if (this.taught.has(id)) return false;
    this.taught.add(id);
    saveProgress([...this.taught]);
    this.refresh();
    return true;
  }

  showPrompt(label) {
    this.promptLabel.textContent = label;
    this.prompt.hidden = false;
  }

  hidePrompt() { this.prompt.hidden = true; }

  toast(text, ms = 2600) {
    this.toastEl.textContent = text;
    this.toastEl.hidden = false;
    this.toastEl.classList.add('is-on');
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      this.toastEl.classList.remove('is-on');
      setTimeout(() => { this.toastEl.hidden = true; }, 300);
    }, ms);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveProgress(list) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
}
