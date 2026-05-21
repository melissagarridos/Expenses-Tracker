import { mountReportView } from './ReportView.js'

export function mountHistoryPanel(container, onRestore) {
    container.innerHTML = `
        <div id="history-panel" class="history-panel flex flex-col gap-2 overflow-y-auto" style="max-height:260px;">
            <p class="text-[10px]" style="color:var(--dim);">Cargando...</p>
        </div>
    `
    loadHistory(container.querySelector('#history-panel'), onRestore)
}

async function loadHistory(panel, onRestore) {
    try {
        const result = await window.pywebview.api.get_history()
        if (!result.success || result.items.length === 0) {
            panel.innerHTML = `<p class="text-[10px]" style="color:var(--dim);">Sin reportes guardados</p>`
            return
        }
        panel.innerHTML = result.items.map(item => {
            const date = new Date(item.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
            return `
                <div class="history-item flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer transition-all duration-150 group" data-id="${item.id}" style="border:1px solid var(--border);">
                    <div class="flex-1 overflow-hidden">
                        <p class="text-[11px] truncate" style="color:var(--text);">${item.filename}</p>
                        <p class="text-[9px] mt-0.5" style="color:var(--dim);">${date} · ${item.currency} · ${item.language}</p>
                    </div>
                    <button class="btn-delete text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 border-none cursor-pointer px-1 py-0.5 rounded" data-id="${item.id}" style="background:rgba(255,77,109,0.12);color:var(--danger);">✕</button>
                </div>
            `
        }).join('')

        panel.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('mouseenter', () => { el.style.borderColor = 'var(--accent)'; el.style.background = 'rgba(232,255,71,0.03)' })
            el.addEventListener('mouseleave', () => { el.style.borderColor = 'var(--border)'; el.style.background = '' })
            el.addEventListener('click', async (e) => {
                if (e.target.closest('.btn-delete')) return
                const id = parseInt(el.dataset.id)
                const res = await window.pywebview.api.get_report(id)
                if (res.success) onRestore(res)
            })
        })

        panel.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation()
                const id = parseInt(btn.dataset.id)
                await window.pywebview.api.delete_report(id)
                loadHistory(panel, onRestore)
            })
        })
    } catch {
        panel.innerHTML = `<p class="text-[10px]" style="color:var(--dim);">Error cargando historial</p>`
    }
}