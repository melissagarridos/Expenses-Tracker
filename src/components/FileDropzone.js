export function mountFileDropzone(container, onFileSelected) {
    container.innerHTML = `
        <div id="dropzone" class="rounded-md p-4 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-150 border border-dashed" style="border-color:var(--border);">
            <div style="color:var(--dim);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
            </div>
            <span class="text-[11px] text-center leading-relaxed" style="color:var(--text2);">Seleccionar archivo</span>
            <span class="text-[10px]" style="color:var(--dim);">.xlsx · .xls · .csv</span>
        </div>
        <div id="file-selected" class="hidden flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] overflow-hidden" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent);flex-shrink:0;">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span id="file-name" class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"></span>
            <button id="file-clear" class="border-none text-[11px] leading-none cursor-pointer transition-colors duration-150 flex-shrink-0" style="background:none;color:var(--dim);">✕</button>
        </div>
    `

    const dropzone = container.querySelector('#dropzone')
    const fileSelected = container.querySelector('#file-selected')
    const fileName = container.querySelector('#file-name')
    const fileClear = container.querySelector('#file-clear')

    dropzone.addEventListener('mouseenter', () => {
        dropzone.style.borderColor = 'var(--accent)'
        dropzone.style.background = 'rgba(232,255,71,0.03)'
    })
    dropzone.addEventListener('mouseleave', () => {
        dropzone.style.borderColor = 'var(--border)'
        dropzone.style.background = ''
    })

    fileClear.addEventListener('mouseenter', () => { fileClear.style.color = 'var(--danger)' })
    fileClear.addEventListener('mouseleave', () => { fileClear.style.color = 'var(--dim)' })

    let currentPath = null

    async function openDialog() {
        dropzone.style.opacity = '0.5'
        dropzone.style.pointerEvents = 'none'
        try {
            const result = await window.pywebview.api.open_file_dialog()
            if (result.success) {
                currentPath = result.path
                const parts = result.path.replace(/\\/g, '/').split('/')
                fileName.textContent = parts[parts.length - 1]
                dropzone.classList.add('hidden')
                fileSelected.classList.remove('hidden')
                onFileSelected(result.path)
            } else {
                const errEl = container.querySelector('.dropzone-error') || document.createElement('p')
                errEl.className = 'dropzone-error text-[9px] mt-1'
                errEl.style.cssText = 'color:var(--danger);text-align:center;'
                errEl.textContent = result.error || 'Error al abrir el archivo'
                container.appendChild(errEl)
                setTimeout(() => errEl.remove(), 3000)
            }
        } finally {
            dropzone.style.opacity = ''
            dropzone.style.pointerEvents = ''
        }
    }

    function clearFile() {
        currentPath = null
        fileSelected.classList.add('hidden')
        dropzone.classList.remove('hidden')
        onFileSelected(null)
    }

    dropzone.addEventListener('click', openDialog)
    fileClear.addEventListener('click', clearFile)
}