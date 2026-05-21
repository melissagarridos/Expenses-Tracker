import './style.css'
import { mountTitlebar } from './components/Titlebar.js'
import { mountFileDropzone } from './components/FileDropzone.js'
import { mountReportView } from './components/ReportView.js'
import { mountHistoryPanel } from './components/HistoryPanel.js'
import { mountPrivacyModal } from './components/PrivacyModal.js'

let selectedFilePath = null
let selectedFilename = null
let selectedCurrency = 'original'
let selectedLanguage = 'Español'

function init() {
    mountPrivacyModal(() => {
        mountTitlebar()
        mountApp()
    })
}

function mountApp() {
    const app = document.getElementById('app')
    app.className = 'app-root'

    app.innerHTML = `
        <div class="flex flex-col w-[220px] min-w-[220px]" style="background:var(--surface);border-right:1px solid var(--border);">

            <div class="flex items-center gap-2 px-4 py-5" style="border-bottom:1px solid var(--border);">
                <div class="w-2 h-2 rounded-sm flex-shrink-0" style="background:var(--accent);"></div>
                <span class="text-[13px] font-bold tracking-wide" style="font-family:'Syne',sans-serif;color:var(--text);">ExpensesTracker</span>
            </div>

            <div class="flex flex-col gap-5 px-4 py-5 overflow-y-auto flex-1 sidebar-scroll">

                <div>
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">ARCHIVO</p>
                    <div id="dropzone-container"></div>
                </div>

                <div>
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">MONEDA</p>
                    <select id="currency-select" class="w-full rounded px-2.5 py-1.5 text-[11px] border-none outline-none cursor-pointer" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);font-family:'JetBrains Mono',monospace;">
                        <option value="original">Original (del archivo)</option>
                        <option value="COP">COP — Peso Colombiano</option>
                        <option value="USD">USD — Dolar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="MXN">MXN — Peso Mexicano</option>
                        <option value="ARS">ARS — Peso Argentino</option>
                        <option value="BRL">BRL — Real Brasileno</option>
                    </select>
                </div>

                <div>
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">IDIOMA</p>
                    <select id="language-select" class="w-full rounded px-2.5 py-1.5 text-[11px] border-none outline-none cursor-pointer" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);font-family:'JetBrains Mono',monospace;">
                        <option value="Español">Español</option>
                        <option value="English">English</option>
                        <option value="Português">Português</option>
                        <option value="Français">Français</option>
                        <option value="Deutsch">Deutsch</option>
                    </select>
                </div>

                <div>
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">MODELO</p>
                    <div id="model-badge" class="rounded px-2.5 py-1.5 text-[11px] truncate" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);">—</div>
                </div>

                <div>
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">HISTORIAL</p>
                    <div id="history-container"></div>
                </div>

            </div>

            <div class="px-4 py-4" style="border-top:1px solid var(--border);">
                <button id="btn-generate" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[12px] font-semibold tracking-wide transition-all duration-150 cursor-pointer border-none" style="background:var(--accent);color:#0a0a0a;font-family:'JetBrains Mono',monospace;" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Generar analisis
                </button>
            </div>
        </div>

        <div class="app-main flex-1 overflow-y-auto p-6">
            <div id="state-empty" class="h-full flex flex-col items-center justify-center gap-4">
                <div style="color:var(--dim);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                </div>
                <p class="text-[12px] text-center leading-loose" style="color:var(--dim);">Selecciona un archivo Excel<br>y genera tu analisis financiero</p>
            </div>

            <div id="state-loading" class="hidden h-full flex flex-col items-center justify-center gap-5">
                <div class="loader-ring"></div>
                <p class="text-[11px] tracking-widest" style="color:var(--text2);">Procesando con IA...</p>
            </div>

            <div id="state-error" class="hidden h-full flex items-center justify-center p-6">
                <p id="error-msg" class="text-[12px] rounded-lg px-5 py-4 max-w-lg text-center leading-relaxed" style="color:var(--danger);background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.2);"></p>
            </div>

            <div id="state-report" class="state-report hidden"></div>
        </div>
    `

    mountFileDropzone(
        document.getElementById('dropzone-container'),
        (path) => {
            selectedFilePath = path
            if (path) {
                const parts = path.replace(/\\/g, '/').split('/')
                selectedFilename = parts[parts.length - 1]
            } else {
                selectedFilename = null
            }
            document.getElementById('btn-generate').disabled = !path
            document.getElementById('btn-generate').style.opacity = path ? '1' : '0.3'
            document.getElementById('btn-generate').style.cursor = path ? 'pointer' : 'not-allowed'
        }
    )

    document.getElementById('currency-select').addEventListener('change', e => {
        selectedCurrency = e.target.value
    })

    document.getElementById('language-select').addEventListener('change', e => {
        selectedLanguage = e.target.value
    })

    const btn = document.getElementById('btn-generate')
    btn.style.opacity = '0.3'
    btn.style.cursor = 'not-allowed'
    btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = 'var(--accent-dim)' })
    btn.addEventListener('mouseleave', () => { if (!btn.disabled) btn.style.background = 'var(--accent)' })

    fetchModelInfo()
    mountHistoryPanel(document.getElementById('history-container'), restoreReport)

    document.getElementById('btn-generate').addEventListener('click', runAnalysis)
}

async function fetchModelInfo() {
    try {
        const info = await window.pywebview.api.get_model_info()
        document.getElementById('model-badge').textContent = info.model
    } catch {
        document.getElementById('model-badge').textContent = 'local'
    }
}

function setState(name) {
    const states = ['empty', 'loading', 'error', 'report']
    for (const s of states) {
        document.getElementById(`state-${s}`).classList.toggle('hidden', s !== name)
    }
}

function restoreReport(report) {
    const reportContainer = document.getElementById('state-report')
    mountReportView(reportContainer, report.html, report.raw_md, report.currency)
    setState('report')
}

async function runAnalysis() {
    if (!selectedFilePath) return

    setState('loading')

    const excelResult = await window.pywebview.api.process_excel(selectedFilePath)
    if (!excelResult.success) {
        document.getElementById('error-msg').textContent = excelResult.error
        setState('error')
        return
    }

    const reportResult = await window.pywebview.api.generate_report(
        JSON.stringify(excelResult.data),
        excelResult.filename,
        selectedCurrency,
        selectedLanguage
    )

    if (!reportResult.success) {
        document.getElementById('error-msg').textContent = reportResult.error
        setState('error')
        return
    }

    const reportContainer = document.getElementById('state-report')
    mountReportView(reportContainer, reportResult.html, reportResult.raw_md, selectedCurrency)
    setState('report')

    mountHistoryPanel(document.getElementById('history-container'), restoreReport)
}

window.addEventListener('pywebviewready', init)