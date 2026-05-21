import './style.css'
import { mountTitlebar } from './components/Titlebar.js'
import { mountFileDropzone } from './components/FileDropzone.js'
import { mountReportView } from './components/ReportView.js'

let selectedFilePath = null

function init() {
    mountTitlebar()
    mountApp()
}

function mountApp() {
    const app = document.getElementById('app')
    app.className = 'app-root'

    app.innerHTML = `
        <div class="app-sidebar">
            <div class="sidebar-brand">
                <span class="brand-dot"></span>
                <span class="brand-name">ExpensesTracker</span>
            </div>

            <div class="sidebar-section">
                <p class="sidebar-label">ARCHIVO</p>
                <div id="dropzone-container"></div>
            </div>

            <div class="sidebar-section">
                <p class="sidebar-label">MODELO</p>
                <div class="model-badge" id="model-badge">—</div>
            </div>

            <div class="sidebar-footer">
                <button id="btn-generate" class="btn-generate" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Generar análisis
                </button>
            </div>
        </div>

        <div class="app-main">
            <div id="state-empty" class="state-empty">
                <div class="state-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                </div>
                <p class="state-empty-text">Selecciona un archivo Excel<br>y genera tu análisis financiero</p>
            </div>

            <div id="state-loading" class="state-loading hidden">
                <div class="loader-ring"></div>
                <p class="loader-text">Procesando con IA...</p>
            </div>

            <div id="state-error" class="state-error hidden">
                <p id="error-msg"></p>
            </div>

            <div id="state-report" class="state-report hidden"></div>
        </div>
    `

    mountFileDropzone(
        document.getElementById('dropzone-container'),
        (path) => {
            selectedFilePath = path
            document.getElementById('btn-generate').disabled = !path
        }
    )

    fetchModelInfo()

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

async function runAnalysis() {
    if (!selectedFilePath) return

    setState('loading')

    const excelResult = await window.pywebview.api.process_excel(selectedFilePath)
    if (!excelResult.success) {
        document.getElementById('error-msg').textContent = excelResult.error
        setState('error')
        return
    }

    const reportResult = await window.pywebview.api.generate_report(JSON.stringify(excelResult.data))
    if (!reportResult.success) {
        document.getElementById('error-msg').textContent = reportResult.error
        setState('error')
        return
    }

    const reportContainer = document.getElementById('state-report')
    mountReportView(reportContainer, reportResult.response)
    setState('report')
}

window.addEventListener('pywebviewready', init)