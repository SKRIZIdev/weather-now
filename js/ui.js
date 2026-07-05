/* UI kit — themed modal + toast, self-styling via each site's CSS variables.
   Replaces native alert()/confirm(). Usage:
     UI.toast('Saved', 'success');
     UI.confirm('Delete this?', {danger:true, ok:'Delete'}).then(yes => { ... });
     UI.alert('Session complete!'); */
(function () {
  if (window.UI) return;
  const style = document.createElement('style');
  style.textContent = `
  .ui-backdrop{position:fixed;inset:0;background:rgba(3,6,15,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999;opacity:0;transition:opacity .2s}
  .ui-backdrop.show{opacity:1}
  .ui-dialog{background:var(--panel,#1a1f2b);color:var(--txt,var(--ink,#eef2f8));border:1px solid var(--line,#2a3342);border-radius:18px;max-width:400px;width:100%;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.5);transform:translateY(14px) scale(.96);transition:transform .24s cubic-bezier(.2,.9,.3,1)}
  .ui-backdrop.show .ui-dialog{transform:none}
  .ui-dialog h3{margin:0 0 8px;font-size:1.2rem}
  .ui-dialog p{margin:0 0 20px;color:var(--muted,#8b94a6);line-height:1.55}
  .ui-actions{display:flex;gap:10px;justify-content:flex-end}
  .ui-btn{font:inherit;font-weight:700;border:none;border-radius:11px;padding:11px 20px;cursor:pointer;transition:filter .15s,transform .1s}
  .ui-btn:active{transform:scale(.96)}
  .ui-btn.cancel{background:transparent;color:var(--txt,var(--ink,#eee));border:1px solid var(--line,#2a3342)}
  .ui-btn.ok{background:var(--accent,#6c8cff);color:#08121f}
  .ui-btn.danger{background:#ef4444;color:#fff}
  .ui-btn:hover{filter:brightness(1.08)}
  .ui-toasts{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);display:flex;flex-direction:column;gap:10px;z-index:10000;align-items:center;pointer-events:none}
  .ui-toast{background:var(--panel,#1a1f2b);color:var(--txt,var(--ink,#eef2f8));border:1px solid var(--line,#2a3342);border-left:3px solid var(--accent,#6c8cff);border-radius:12px;padding:13px 18px;box-shadow:0 14px 34px rgba(0,0,0,.35);font-size:.92rem;font-family:inherit;opacity:0;transform:translateY(16px);transition:opacity .25s,transform .25s;max-width:90vw}
  .ui-toast.show{opacity:1;transform:none}
  .ui-toast.success{border-left-color:#22c55e}
  .ui-toast.error{border-left-color:#ef4444}`;
  document.head.appendChild(style);

  let wrap;
  function toast(msg, type = 'info', ms = 2600) {
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'ui-toasts'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'ui-toast ' + type; t.textContent = msg; wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
  }
  function dialog({ title, message, ok, cancel, danger }) {
    return new Promise(resolve => {
      const bd = document.createElement('div'); bd.className = 'ui-backdrop';
      bd.innerHTML = `<div class="ui-dialog" role="dialog" aria-modal="true">
        ${title ? `<h3>${title}</h3>` : ''}<p>${message}</p>
        <div class="ui-actions">
          ${cancel ? `<button class="ui-btn cancel">${cancel}</button>` : ''}
          <button class="ui-btn ${danger ? 'danger' : 'ok'}">${ok}</button>
        </div></div>`;
      document.body.appendChild(bd);
      requestAnimationFrame(() => bd.classList.add('show'));
      const done = v => { bd.classList.remove('show'); setTimeout(() => bd.remove(), 220); document.removeEventListener('keydown', esc); resolve(v); };
      function esc(e) { if (e.key === 'Escape') done(false); }
      bd.querySelector('.ui-btn.ok,.ui-btn.danger').onclick = () => done(true);
      const c = bd.querySelector('.ui-btn.cancel'); if (c) c.onclick = () => done(false);
      bd.onclick = e => { if (e.target === bd) done(false); };
      document.addEventListener('keydown', esc);
      bd.querySelector('.ui-btn.ok,.ui-btn.danger').focus();
    });
  }
  window.UI = {
    toast,
    alert: (message, o = {}) => dialog({ title: o.title || '', message, ok: o.ok || 'OK' }),
    confirm: (message, o = {}) => dialog({ title: o.title || '', message, ok: o.ok || 'Confirm', cancel: o.cancel || 'Cancel', danger: o.danger }),
  };
})();
