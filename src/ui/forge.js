// The Forge: the prompt-builder room's interface.
// Six slots, live assembly, and a copy button.

const SLOTS = [
  { key: 'role', label: 'Role & frame', colour: '#f0b429',
    hint: 'Whose perspective, for whose eyes. Make it information, not costume.',
    placeholder: 'a brand strategist briefing a founder who has rejected two decks for feeling generic' },
  { key: 'task', label: 'Task', colour: '#2cb1bc',
    hint: 'One verb. One deliverable. Something you could check happened.',
    placeholder: 'write five positioning statements' },
  { key: 'context', label: 'Context', colour: '#da4a91',
    hint: 'Everything it cannot guess. This is the slot people skip.',
    placeholder: 'Studio doing brand, web and 3D under one roof. Clients are Series A SaaS. Competitors either outsource motion or have no strategy layer.' },
  { key: 'constraints', label: 'Constraints', colour: '#f3752b',
    hint: 'The rule AND the reason for it. The reason is what generalises.',
    placeholder: 'Under 25 words each, because it sits under the logo at 16px. Banned: end-to-end, seamless, holistic.' },
  { key: 'format', label: 'Format', colour: '#2f6fd0',
    hint: 'The literal shape of the output. Worth 8–12 accuracy points.',
    placeholder: 'A markdown table: Statement | Who it excludes | Strongest objection. Begin with the table, no preamble.' },
  { key: 'done', label: 'Done when', colour: '#b4553a',
    hint: 'The test that closes the loop, so it can check its own work.',
    placeholder: 'Each statement stops being true if you swap in a competitor name.' }
];

const POSTURES = {
  none: '',
  ask: 'Before you start, interview me — ask up to four questions whose answers would most change the output. Do not begin until I answer.',
  plan: 'Plan first and stop. Show me your approach and what you would produce, then wait for my go-ahead.',
  act: 'Work autonomously through to completion. Do not check in mid-way. Report what you did and anything you decided for me at the end.',
  options: 'Give me three genuinely divergent options rather than one answer, and name the tradeoff each makes.'
};

export class Forge {
  constructor(root) {
    this.root = root;
    this.values = {};
    this.posture = 'none';
    this.onClose = null;
    this.open = false;
    this.build();
  }

  build() {
    const slotHtml = SLOTS.map((s, i) => `
      <div class="forge-slot" style="--slot:${s.colour}">
        <label for="forge-${s.key}">
          <span class="forge-pip"></span>
          ${s.label}
        </label>
        <p class="forge-hint">${s.hint}</p>
        <textarea id="forge-${s.key}" data-key="${s.key}" rows="${i === 2 || i === 3 ? 3 : 2}"
          placeholder="${s.placeholder.replace(/"/g, '&quot;')}"></textarea>
      </div>`).join('');

    this.root.innerHTML = `
      <div class="forge-panel" role="dialog" aria-modal="true" aria-label="The Forge">
        <header class="forge-head">
          <div>
            <h2>The Forge</h2>
            <p>Fill the slots. The brief assembles itself. Skip anything that doesn't apply.</p>
          </div>
          <button class="forge-close" type="button" aria-label="Leave The Forge">Leave</button>
        </header>
        <div class="forge-grid">
          <div class="forge-inputs">
            ${slotHtml}
            <div class="forge-slot" style="--slot:#8d7bd6">
              <label for="forge-posture"><span class="forge-pip"></span>Posture</label>
              <p class="forge-hint">How it should behave before it starts working.</p>
              <select id="forge-posture">
                <option value="none">— none —</option>
                <option value="ask">Interview me first</option>
                <option value="plan">Plan first, wait for approval</option>
                <option value="act">Act autonomously, report at the end</option>
                <option value="options">Give me three divergent options</option>
              </select>
            </div>
          </div>
          <div class="forge-outputwrap">
            <div class="forge-outhead">
              <span>Assembled brief</span>
              <button class="forge-copy" type="button">Copy</button>
            </div>
            <pre class="forge-output"></pre>
            <div class="forge-score"></div>
          </div>
        </div>
      </div>`;

    this.out = this.root.querySelector('.forge-output');
    this.score = this.root.querySelector('.forge-score');

    this.root.querySelectorAll('textarea').forEach(t => {
      t.addEventListener('input', () => { this.values[t.dataset.key] = t.value; this.render(); });
    });
    this.root.querySelector('#forge-posture').addEventListener('change', (e) => {
      this.posture = e.target.value; this.render();
    });
    this.root.querySelector('.forge-close').addEventListener('click', () => this.close());
    this.root.querySelector('.forge-copy').addEventListener('click', (e) => this.copy(e.target));

    window.addEventListener('keydown', (e) => {
      if (this.open && e.code === 'Escape') this.close();
    });

    this.render();
  }

  assemble() {
    const v = k => (this.values[k] || '').trim();
    const out = [];
    const role = v('role'), task = v('task');
    if (role && task) out.push(`You're ${role}. ${task.charAt(0).toUpperCase() + task.slice(1)}.`);
    else if (task) out.push(task.charAt(0).toUpperCase() + task.slice(1) + '.');
    else if (role) out.push(`You're ${role}.`);
    if (v('context')) out.push(`\nCONTEXT\n${v('context')}`);
    if (v('constraints')) out.push(`\nCONSTRAINTS\n${v('constraints')}`);
    if (v('format')) out.push(`\nFORMAT\n${v('format')}`);
    if (v('done')) out.push(`\nDONE WHEN\n${v('done')}`);
    const p = POSTURES[this.posture];
    if (p) out.push(`\n${p}`);
    return out.join('\n');
  }

  render() {
    const text = this.assemble();
    if (!text) {
      this.out.textContent = 'Your brief appears here as you fill the slots.\n\nThe six slots are the same skeleton every\nvendor converged on from a different direction.';
      this.out.classList.add('is-empty');
    } else {
      this.out.textContent = text;
      this.out.classList.remove('is-empty');
    }

    const filled = SLOTS.filter(s => (this.values[s.key] || '').trim()).length;
    const missing = SLOTS.filter(s => !(this.values[s.key] || '').trim());
    let note;
    if (filled === 0) note = 'Nothing forged yet.';
    else if (missing.length === 0) note = 'All six slots filled. That is a complete brief.';
    else if (missing.some(m => m.key === 'context')) note = 'Context is empty — that is the slot it will have to guess at.';
    else if (missing.some(m => m.key === 'done')) note = 'No "done when". It will stop when the work looks finished.';
    else note = `${filled} of 6 filled. Missing: ${missing.map(m => m.label).join(', ')}.`;
    this.score.innerHTML = `<span class="forge-meter"><i style="width:${(filled / 6) * 100}%"></i></span><span>${note}</span>`;
  }

  copy(btn) {
    const text = this.assemble();
    if (!text) return;
    const done = () => {
      const old = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('is-done');
      setTimeout(() => { btn.textContent = old; btn.classList.remove('is-done'); }, 1500);
    };
    try {
      navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    } catch (e) { fallback(text, done); }
  }

  show(onClose) {
    this.open = true;
    this.onClose = onClose || null;
    this.root.hidden = false;
    this.root.classList.add('is-open');
    setTimeout(() => this.root.querySelector('textarea')?.focus(), 60);
  }

  close() {
    this.open = false;
    this.root.hidden = true;
    this.root.classList.remove('is-open');
    const cb = this.onClose;
    this.onClose = null;
    if (cb) cb();
  }
}

function fallback(text, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); done();
  } catch (e) { /* clipboard unavailable */ }
}
