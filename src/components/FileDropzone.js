export function mountFileDropzone(container, onFileSelected) {
    container.innerHTML = `
        <div id="dropzone" class="dropzone">
            <div class="dropzone-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
            </div>
            <span class="dropzone-label">Seleccionar archivo Excel</span>
            <span class="dropzone-hint">.xlsx · .xls</span>
        </div>
        <div id="file-selected" class="file-selected hidden">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span id="file-name"></span>
            <button id="file-clear">✕</button>
        </div>
    `

    const dropzone = container.querySelector('#dropzone')
    const fileSelected = container.querySelector('#file-selected')
    const fileName = container.querySelector('#file-name')
    const fileClear = container.querySelector('#file-clear')

    let currentPath = null

    async function openDialog() {
        dropzone.classList.add('loading')
        try {
            const result = await window.pywebview.api.open_file_dialog()
            if (result.success) {
                currentPath = result.path
                const parts = result.path.replace(/\\/g, '/').split('/')
                fileName.textContent = parts[parts.length - 1]
                dropzone.classList.add('hidden')
                fileSelected.classList.remove('hidden')
                onFileSelected(result.path)
            }
        } finally {
            dropzone.classList.remove('loading')
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