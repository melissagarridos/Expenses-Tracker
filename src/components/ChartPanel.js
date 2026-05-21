import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController } from 'chart.js'

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController)

const PALETTE = [
    '#e8ff47', '#ff6b35', '#00d4aa', '#7c6aff',
    '#ff4d6d', '#00b4d8', '#f77f00', '#06d6a0',
]

function parseCategories(text) {
    const lines = text.split('\n')
    const entries = []

    const patterns = [
        /[-*•]\s*\*{0,2}([^:*\n]+?)\*{0,2}\s*[:–-]\s*\$?([\d.,]+)/i,
        /\*{1,2}([^:*\n]+?)\*{0,2}\s*:\s*\$?([\d.,]+)/i,
        /^([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)\s*[:–]\s*\$?([\d.,]+)/m,
    ]

    for (const line of lines) {
        for (const pattern of patterns) {
            const match = line.match(pattern)
            if (match) {
                const label = match[1].trim()
                const value = parseFloat(match[2].replace(/,/g, ''))
                if (label && !isNaN(value) && value > 0) {
                    entries.push({ label, value })
                }
                break
            }
        }
    }

    return entries
}

let barInstance = null
let doughnutInstance = null

export function mountChartPanel(container, rawText) {
    const categories = parseCategories(rawText)

    if (categories.length === 0) {
        container.innerHTML = ''
        return
    }

    const labels = categories.map(e => e.label)
    const values = categories.map(e => e.value)
    const colors = categories.map((_, i) => PALETTE[i % PALETTE.length])

    container.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3 class="chart-title">Gasto por categoría</h3>
                <div class="chart-wrap">
                    <canvas id="bar-chart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3 class="chart-title">Distribución</h3>
                <div class="chart-wrap chart-wrap--doughnut">
                    <canvas id="doughnut-chart"></canvas>
                </div>
            </div>
        </div>
    `

    if (barInstance) barInstance.destroy()
    if (doughnutInstance) doughnutInstance.destroy()

    const barCtx = container.querySelector('#bar-chart').getContext('2d')
    barInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#e8ff47',
                    bodyColor: '#a0a0a0',
                    borderColor: '#2a2a2a',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => ` $${ctx.parsed.y.toLocaleString('es-CO')}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#6b6b6b', font: { family: 'JetBrains Mono', size: 10 } },
                    grid: { color: '#1e1e1e' }
                },
                y: {
                    ticks: {
                        color: '#6b6b6b',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: v => `$${v.toLocaleString('es-CO')}`
                    },
                    grid: { color: '#1e1e1e' }
                }
            }
        }
    })

    const doughnutCtx = container.querySelector('#doughnut-chart').getContext('2d')
    doughnutInstance = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#6b6b6b',
                        font: { family: 'JetBrains Mono', size: 10 },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#e8ff47',
                    bodyColor: '#a0a0a0',
                    borderColor: '#2a2a2a',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => ` $${ctx.parsed.toLocaleString('es-CO')}`
                    }
                }
            }
        }
    })
}