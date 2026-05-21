import './style.css'
import { mountTitlebar } from './components/Titlebar.js'
import { mountFileDropzone } from './components/FileDropzone.js'
import { mountReportView } from './components/ReportView.js'
import { mountHistoryPanel } from './components/HistoryPanel.js'
import { mountPrivacyModal } from './components/PrivacyModal.js'
import { mountLargeFileModal } from './components/LargeFileModal.js'

let selectedFilePath = null
let selectedFilename = null
let selectedSheet = null
let selectedCurrency = 'original'
let selectedLanguage = 'Español'
let totalRows = 0

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

                <div id="sheet-section" class="hidden">
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">HOJA</p>
                    <select id="sheet-select" class="w-full rounded px-2.5 py-1.5 text-[11px] border-none outline-none cursor-pointer" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);font-family:'JetBrains Mono',monospace;"></select>
                </div>

                <div id="preview-section" class="hidden">
                    <p class="text-[9px] font-medium tracking-[0.12em] mb-2.5" style="color:var(--dim);">VISTA PREVIA</p>
                    <div id="preview-content" class="rounded px-2.5 py-2 text-[10px] leading-relaxed" style="background:var(--surface2);border:1px solid var(--border);color:var(--text2);"></div>
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
        onFileSelected
    )

    document.getElementById('currency-select').addEventListener('change', e => {
        selectedCurrency = e.target.value
    })

    document.getElementById('language-select').addEventListener('change', e => {
        selectedLanguage = e.target.value
    })

    document.getElementById('sheet-select').addEventListener('change', e => {
        selectedSheet = e.target.value
        loadSheetPreview()
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

async function onFileSelected(path) {
    selectedFilePath = path
    selectedSheet = null

    if (path) {
        const parts = path.replace(/\\/g, '/').split('/')
        selectedFilename = parts[parts.length - 1]
        await fetchSheets(path)
    } else {
        selectedFilename = null
        document.getElementById('sheet-section').classList.add('hidden')
        document.getElementById('preview-section').classList.add('hidden')
        document.getElementById('btn-generate').disabled = true
        document.getElementById('btn-generate').style.opacity = '0.3'
        document.getElementById('btn-generate').style.cursor = 'not-allowed'
    }
}

async function fetchSheets(path) {
    try {
        const res = await window.pywebview.api.get_sheet_names(path)
        if (!res.success) return

        const select = document.getElementById('sheet-select')
        select.innerHTML = res.sheets.map((s, i) =>
            `<option value="${s.name}">${s.name} (${s.rows.toLocaleString()} filas)</option>`
        ).join('')

        const section = document.getElementById('sheet-section')
        section.classList.remove('hidden')
        selectedSheet = res.sheets[0].name
        await loadSheetPreview()
    } catch {}
}

async function loadSheetPreview() {
    if (!selectedFilePath || !selectedSheet) return
    try {
        const res = await window.pywebview.api.process_sheet(selectedFilePath, selectedSheet)
        if (!res.success) return

        const preview = document.getElementById('preview-content')
        const cols = res.summary.columns.map(c => {
            let info = `<strong style="color:var(--text);">${c.name}</strong> <span style="color:var(--dim);">(${c.type})</span>`
            if (c.type === 'numeric') {
                info += `<br><span style="color:var(--text2);">min: ${c.min} &middot; max: ${c.max} &middot; suma: ${c.sum}</span>`
            }
            return info
        }).join('<br>')

        totalRows = res.total_rows
        preview.innerHTML = `
            <div style="color:var(--text);font-weight:600;">${totalRows.toLocaleString()} filas &middot; ${res.summary.columns.length} columnas</div>
            <div style="margin-top:6px;">${cols}</div>
        `

        document.getElementById('preview-section').classList.remove('hidden')
        document.getElementById('btn-generate').disabled = false
        document.getElementById('btn-generate').style.opacity = '1'
        document.getElementById('btn-generate').style.cursor = 'pointer'
    } catch {}
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
    console.log('[UI] runAnalysis')
    console.log('[UI] selectedFilePath:', selectedFilePath)
    console.log('[UI] selectedFilename:', selectedFilename)
    console.log('[UI] totalRows:', totalRows, 'currency:', selectedCurrency, 'lang:', selectedLanguage)
    if (!selectedFilePath || !selectedFilename) return

    if (totalRows > 500) {
        mountLargeFileModal(totalRows, () => {
            doGenerate()
        }, () => {})
        return
    }

    doGenerate()
}

async function doGenerate() {
    console.log('[UI] doGenerate')
    setState('loading')

    console.log('[UI] calling generate_report...')
    let reportResult
    try {
        reportResult = await window.pywebview.api.generate_report(
            selectedFilename,
            selectedCurrency,
            selectedLanguage
        )
    } catch (e) {
        console.error('[UI] generate_report threw:', e)
        document.getElementById('error-msg').textContent = String(e)
        setState('error')
        return
    }
    console.log('[UI] generate_report result:', reportResult)

    if (!reportResult.success) {
        console.error('[UI] generate_report failed:', reportResult.error)
        document.getElementById('error-msg').textContent = reportResult.error
        setState('error')
        return
    }

    console.log('[UI] mounting report, html length:', reportResult.html?.length, 'raw_md length:', reportResult.raw_md?.length)
    const reportContainer = document.getElementById('state-report')
    mountReportView(reportContainer, reportResult.html, reportResult.raw_md, selectedCurrency)
    setState('report')

    mountHistoryPanel(document.getElementById('history-container'), restoreReport)
}

window.addEventListener('pywebviewready', init)
