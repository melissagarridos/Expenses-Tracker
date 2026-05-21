export function mountPrivacyModal(onAccept, onReject) {
    const overlay = document.createElement('div')
    overlay.id = 'privacy-overlay'
    overlay.className = 'fixed inset-0 z-[99999] flex items-center justify-center'
    overlay.style.cssText = 'background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);'

    overlay.innerHTML = `
        <div class="rounded-xl p-8 max-w-md w-full mx-4 flex flex-col gap-6"
             style="background:var(--surface);border:1px solid var(--border);">
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-sm" style="background:var(--accent);"></div>
                <span class="text-sm font-bold tracking-wide" style="font-family:'Syne',sans-serif;color:var(--text);">
                    Aviso de privacidad
                </span>
            </div>

            <div class="flex flex-col gap-3 text-[12px] leading-relaxed" style="color:var(--text2);">
                <p>
                    Al usar esta aplicación y adjuntar un archivo Excel para procesarlo con IA,
                    aceptas que los datos contenidos en el archivo serán enviados al servicio de IA
                    configurado para generar el análisis financiero.
                </p>

                <div id="privacy-warning" class="rounded-lg p-4" style="background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.2);">
                    <p style="color:var(--dim);">Verificando proveedor...</p>
                </div>

                <p class="text-[11px]" style="color:var(--dim);">
                    Puedes cambiar el proveedor modificando el archivo <code style="color:var(--text);">.env</code>
                    antes de iniciar la aplicación.
                </p>
            </div>

            <div class="flex gap-3 pt-2">
                <button id="btn-privacy-accept"
                    class="flex-1 rounded-md py-2.5 text-[12px] font-semibold cursor-pointer border-none transition-all duration-150"
                    style="background:var(--accent);color:#0a0a0a;">
                    Aceptar y continuar
                </button>
                <button id="btn-privacy-reject"
                    class="flex-1 rounded-md py-2.5 text-[12px] font-semibold cursor-pointer border-none transition-all duration-150"
                    style="background:transparent;color:var(--text2);border:1px solid var(--border);">
                    Rechazar y salir
                </button>
            </div>
        </div>
    `

    document.body.appendChild(overlay)

    document.getElementById('btn-privacy-accept').addEventListener('click', () => {
        overlay.remove()
        onAccept()
    })

    document.getElementById('btn-privacy-reject').addEventListener('click', async () => {
        try {
            await window.pywebview.api.close_window()
        } catch {
            overlay.remove()
        }
    })

    fetchProviderInfo()
}

async function fetchProviderInfo() {
    const warning = document.getElementById('privacy-warning')
    if (!warning) return
    try {
        const info = await window.pywebview.api.get_provider()
        if (info.provider === 'ollama') {
            warning.innerHTML = `
                <p class="font-semibold mb-1" style="color:var(--accent);">Procesamiento local</p>
                <p style="color:var(--text2);">
                    Estás usando <strong style="color:var(--text);">Ollama</strong> como proveedor de IA.
                    Todo el procesamiento se realiza en tu máquina local. Ningún dato sale de tu equipo.
                </p>
            `
            warning.style.background = 'rgba(232,255,71,0.06)'
            warning.style.borderColor = 'rgba(232,255,71,0.15)'
        } else {
            warning.innerHTML = `
                <p class="font-semibold mb-1" style="color:var(--danger);">Proveedor externo detectado</p>
                <p style="color:var(--text2);">
                    Actualmente estás usando <strong style="color:var(--text);">NVIDIA</strong> como proveedor de IA.
                    Tus datos serán procesados por servidores externos. Revisa las políticas de privacidad
                    del proveedor antes de continuar.
                </p>
            `
        }
    } catch {
        warning.innerHTML = '<p style="color:var(--text2);">No se pudo verificar el proveedor.</p>'
    }
}
