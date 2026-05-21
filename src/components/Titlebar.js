export function mountTitlebar() {
    const titlebar = document.getElementById('titlebar')

    titlebar.className = 'pywebview-drag-region fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-4 z-[9999]'
    titlebar.style.cssText = 'background: var(--surface); border-bottom: 1px solid var(--border);'

    titlebar.innerHTML = `
        <div class="flex items-center gap-2 pointer-events-none">
            <div class="w-2 h-2 rounded-sm" style="background:var(--accent);box-shadow:0 0 8px var(--accent);"></div>
            <span class="text-xs font-semibold tracking-widest" style="color:var(--text2);font-family:'JetBrains Mono',monospace;">
                EXPENSES TRACKER
            </span>
        </div>
        <div class="flex gap-0.5 pywebview-no-drag">
            <button id="btn-minimize" class="w-9 h-7 rounded-md text-xs transition-all duration-150 border-none cursor-pointer" style="background:transparent;color:var(--text2);">
                <i class="fas fa-minus"></i>
            </button>
            <button id="btn-close" class="w-9 h-7 rounded-md text-xs transition-all duration-150 border-none cursor-pointer" style="background:transparent;color:var(--text2);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

    const btnMin = document.getElementById('btn-minimize')
    const btnClose = document.getElementById('btn-close')

    btnMin.addEventListener('mouseenter', () => { btnMin.style.background = '#1f1f1f'; btnMin.style.color = '#e8e8f0' })
    btnMin.addEventListener('mouseleave', () => { btnMin.style.background = 'transparent'; btnMin.style.color = 'var(--text2)' })
    btnClose.addEventListener('mouseenter', () => { btnClose.style.background = '#dc2626'; btnClose.style.color = '#fff' })
    btnClose.addEventListener('mouseleave', () => { btnClose.style.background = 'transparent'; btnClose.style.color = 'var(--text2)' })

    btnMin.addEventListener('click', () => window.pywebview.api.minimize_window())
    btnClose.addEventListener('click', () => window.pywebview.api.close_window())
}