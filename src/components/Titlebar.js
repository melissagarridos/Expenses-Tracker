export function mountTitlebar() {
  const titlebar = document.getElementById('titlebar')

  titlebar.className = 'pywebview-drag-region'
  titlebar.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 40px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    z-index: 9999;
  `

  titlebar.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;pointer-events:none;">
      <div style="
        width: 8px; height: 8px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 8px var(--accent);
      "></div>
      <span style="font-size:12px;font-weight:600;color:var(--text2);letter-spacing:0.05em;">
        EXPENSES TRACKER
      </span>
    </div>
    <div style="display:flex;gap:2px;" class="pywebview-no-drag">
      <button id="btn-minimize" style="
        width:36px; height:28px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text2);
        border-radius: 6px;
        font-size: 12px;
        transition: background 0.15s, color 0.15s;
      ">
        <i class="fas fa-minus"></i>
      </button>
      <button id="btn-close" style="
        width:36px; height:28px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text2);
        border-radius: 6px;
        font-size: 12px;
        transition: background 0.15s, color 0.15s;
      ">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `

  const btnMin = document.getElementById('btn-minimize')
  const btnClose = document.getElementById('btn-close')

  btnMin.addEventListener('mouseenter', () => {
    btnMin.style.background = '#1f1f1f'
    btnMin.style.color = '#e8e8f0'
  })
  btnMin.addEventListener('mouseleave', () => {
    btnMin.style.background = 'transparent'
    btnMin.style.color = 'var(--text2)'
  })

  btnClose.addEventListener('mouseenter', () => {
    btnClose.style.background = '#dc2626'
    btnClose.style.color = '#fff'
  })
  btnClose.addEventListener('mouseleave', () => {
    btnClose.style.background = 'transparent'
    btnClose.style.color = 'var(--text2)'
  })

  btnMin.addEventListener('click', () => window.pywebview.api.minimize_window())
  btnClose.addEventListener('click', () => window.pywebview.api.close_window())
}