import './style.css'
import { mountTitlebar } from './components/Titlebar.js'

function init() {
  mountTitlebar()
  mountApp()
}

function mountApp() {
  const app = document.getElementById('app')
  app.style.cssText = `
    position: absolute;
    top: 40px; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
  `

  app.innerHTML = `
    <h1 style="font-size:20px;font-weight:700;color:var(--text);">Expenses Tracker</h1>
    <input type="file" id="excelFile" accept=".xlsx,.xls" />
    <button id="btn-generate" style="
      padding: 10px 24px;
      background: var(--accent);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    ">
      Generar reporte
    </button>
    <pre id="output" style="
      font-size:12px;
      color:var(--text2);
      white-space:pre-wrap;
      max-width:700px;
    "></pre>
  `

  document.getElementById('btn-generate').addEventListener('click', async () => {
    const file = document.getElementById('excelFile').files[0]
    if (!file) return

    const result = await window.pywebview.api.process_excel(file.path)
    if (!result.success) {
      document.getElementById('output').textContent = result.error
      return
    }

    const report = await window.pywebview.api.generate_report(JSON.stringify(result.data))
    document.getElementById('output').textContent = report.success
      ? report.response
      : report.error
  })
}

window.addEventListener('pywebviewready', init)