// Dialogue overlay: typewriter text, paged lessons, and a simple choice prompt.

export class Dialogue {
  constructor(root) {
    this.root = root;
    this.open = false;
    this.queue = [];
    this.onClose = null;
    this._typing = false;
    this._timer = null;

    root.innerHTML = `
      <div class="dlg-card" role="dialog" aria-modal="true">
        <div class="dlg-head">
          <span class="dlg-name"></span>
          <span class="dlg-title"></span>
        </div>
        <div class="dlg-heading"></div>
        <div class="dlg-body"></div>
        <div class="dlg-foot">
          <span class="dlg-page"></span>
          <div class="dlg-actions"></div>
        </div>
      </div>`;
    this.card = root.querySelector('.dlg-card');
    this.elName = root.querySelector('.dlg-name');
    this.elTitle = root.querySelector('.dlg-title');
    this.elHeading = root.querySelector('.dlg-heading');
    this.elBody = root.querySelector('.dlg-body');
    this.elPage = root.querySelector('.dlg-page');
    this.elActions = root.querySelector('.dlg-actions');

    // click or space/enter advances
    root.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.advance();
    });
    window.addEventListener('keydown', (e) => {
      if (!this.open) return;
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.advance(); }
      if (e.code === 'Escape') this.close();
    });
  }

  // pages: [{ heading?, body }]
  start({ name, title, accent, pages, onClose }) {
    this.open = true;
    this.pages = pages;
    this.index = 0;
    this.onClose = onClose || null;
    this.elName.textContent = name;
    this.elTitle.textContent = title || '';
    this.card.style.setProperty('--accent', accent || '#7ef0d0');
    this.root.hidden = false;
    this.root.classList.add('is-open');
    this.render();
  }

  render() {
    const p = this.pages[this.index];
    this.elHeading.textContent = p.heading || '';
    this.elHeading.hidden = !p.heading;
    this.elPage.textContent = this.pages.length > 1 ? `${this.index + 1} / ${this.pages.length}` : '';
    this.elActions.innerHTML = '';
    this.type(p.body);
  }

  type(text) {
    clearInterval(this._timer);
    this._typing = true;
    this._full = text;
    this.elBody.textContent = '';
    let i = 0;
    this._timer = setInterval(() => {
      // reveal a few characters per tick so long lessons don't drag
      i += 3;
      this.elBody.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(this._timer);
        this._typing = false;
        this.showAction();
      }
    }, 12);
  }

  showAction() {
    const last = this.index >= this.pages.length - 1;
    const b = document.createElement('button');
    b.className = 'dlg-btn';
    b.textContent = last ? 'Done' : 'Next';
    b.addEventListener('click', (e) => { e.stopPropagation(); this.advance(); });
    this.elActions.appendChild(b);
    b.focus();
  }

  advance() {
    if (this._typing) {
      // first click completes the line instead of skipping it
      clearInterval(this._timer);
      this.elBody.textContent = this._full;
      this._typing = false;
      this.showAction();
      return;
    }
    if (this.index < this.pages.length - 1) {
      this.index++;
      this.render();
    } else {
      this.close();
    }
  }

  close() {
    clearInterval(this._timer);
    this.open = false;
    this._typing = false;
    this.root.hidden = true;
    this.root.classList.remove('is-open');
    const cb = this.onClose;
    this.onClose = null;
    if (cb) cb();
  }
}
