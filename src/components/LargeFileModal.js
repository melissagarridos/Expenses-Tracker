export function mountLargeFileModal(totalRows, onAccept, onCancel) {
    const overlay = document.createElement('div')
    overlay.id = 'large-file-overlay'
    overlay.className = 'fixed inset-0 z-[99999] flex items-center justify-center'
    overlay.style.cssText = 'background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);'

    overlay.innerHTML = `
        <div class="rounded-xl p-8 max-w-md w-full mx-4 flex flex-col gap-6"
             style="background:var(--surface);border:1px solid var(--border);">
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-sm" style="background:var(--accent);"></div>
                <span class="text-sm font-bold tracking-wide" style="font-family:'Syne',sans-serif;color:var(--text);">
                    Archivo grande detectado
                </span>
            </div>

            <div class="flex flex-col gap-3 text-[12px] leading-relaxed" style="color:var(--text2);">
                <p>
                    El archivo contiene <strong style="color:var(--text);">${totalRows.toLocaleString()} filas</strong>.
                </p>
                <p>
                    Para optimizar el procesamiento, la IA recibira un resumen estadistico de los datos
                    en lugar de las filas completas. La IA puede ejecutar codigo Python en un
                    <strong style="color:var(--accent);">sandbox aislado</strong>
                    para realizar calculos adicionales sobre los datos originales.
                </p>
                <div class="rounded-lg p-4" style="background:rgba(232,255,71,0.06);border:1px solid rgba(232,255,71,0.15);">
                    <p style="color:var(--text2);">
                        El sandbox solo permite operaciones matematicas basicas y acceso a listas/diccionarios.
                        No tiene acceso a archivos, red, importaciones ni atributos privados de Python.
                    </p>
                </div>
                <p>
                    Los datos originales <strong style="color:var(--text);">no se enviaran al prompt</strong>
                    de la IA, solo el resumen estadistico.
                </p>
            </div>

            <div class="flex gap-3 pt-2">
                <button id="btn-large-accept"
                    class="flex-1 rounded-md py-2.5 text-[12px] font-semibold cursor-pointer border-none transition-all duration-150"
                    style="background:var(--accent);color:#0a0a0a;">
                    Continuar
                </button>
                <button id="btn-large-cancel"
                    class="flex-1 rounded-md py-2.5 text-[12px] font-semibold cursor-pointer border-none transition-all duration-150"
                    style="background:transparent;color:var(--text2);border:1px solid var(--border);">
                    Cancelar
                </button>
            </div>
        </div>
    `

    document.body.appendChild(overlay)

    document.getElementById('btn-large-accept').addEventListener('click', () => {
        overlay.remove()
        onAccept()
    })

    document.getElementById('btn-large-cancel').addEventListener('click', () => {
        overlay.remove()
        onCancel()
    })
}
