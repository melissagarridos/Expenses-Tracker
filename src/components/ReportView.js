import { mountChartPanel } from './ChartPanel.js'

export function mountReportView(container, html, rawMd, currency = 'original') {
    console.log('[ReportView] mountReportView')
    console.log('[ReportView] html length:', html?.length)
    console.log('[ReportView] rawMd length:', rawMd?.length)
    console.log('[ReportView] html (first 300):', html?.substring(0, 300))
    console.log('[ReportView] rawMd (first 300):', rawMd?.substring(0, 300))
    container.innerHTML = `
        <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between pb-4" style="border-bottom:1px solid var(--border);">
                <div class="text-[9px] font-semibold tracking-[0.16em] rounded px-2.5 py-1" style="color:var(--accent);background:rgba(232,255,71,0.08);border:1px solid rgba(232,255,71,0.2);">ANALISIS IA</div>
                <div class="text-[10px]" style="color:var(--dim);">${new Date().toLocaleString('es-CO')}</div>
            </div>
            <div id="chart-panel"></div>
            <div class="h-px" style="background:var(--border);"></div>
            <div class="report-content flex flex-col gap-2">
                ${html}
            </div>
        </div>
    `

    mountChartPanel(container.querySelector('#chart-panel'), rawMd, currency)
}