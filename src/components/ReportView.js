import { mountChartPanel } from './ChartPanel.js'

function parseMarkdown(text) {
    const html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^#{1,3}\s+(.+)$/gm, '<h4 class="report-heading">$1</h4>')
        .replace(/^[-*•]\s+(.+)$/gm, '<li class="report-item">$1</li>')

    const withLists = html.replace(/(<li[\s\S]+?)(?=<li|$)/g, (match) => {
        return `<ul class="report-list">${match}</ul>`
    }).replace(/<\/ul>\s*<ul class="report-list">/g, '')

    return withLists.split(/\n{2,}/).map(block => {
        const trimmed = block.trim()
        if (!trimmed) return ''
        if (/^</.test(trimmed)) return trimmed
        return `<p class="report-p">${trimmed}</p>`
    }).join('\n')
}

export function mountReportView(container, rawText) {
    container.innerHTML = `
        <div class="report-view">
            <div class="report-header">
                <div class="report-badge">ANÁLISIS IA</div>
                <div class="report-timestamp">${new Date().toLocaleString('es-CO')}</div>
            </div>
            <div id="chart-panel"></div>
            <div class="report-divider"></div>
            <div class="report-body">
                ${parseMarkdown(rawText)}
            </div>
        </div>
    `

    mountChartPanel(container.querySelector('#chart-panel'), rawText)
}
