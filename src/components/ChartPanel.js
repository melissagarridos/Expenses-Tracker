import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController } from 'chart.js'

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController)

const PALETTE = [
    '#e8ff47', '#ff6b35', '#00d4aa', '#7c6aff',
    '#ff4d6d', '#00b4d8', '#f77f00', '#06d6a0',
]

const CURRENCY_LOCALES = {
    'COP': { locale: 'es-CO', symbol: '$' },
    'USD': { locale: 'en-US', symbol: '$' },
    'EUR': { locale: 'de-DE', symbol: '€' },
    'MXN': { locale: 'es-MX', symbol: '$' },
    'ARS': { locale: 'es-AR', symbol: '$' },
    'BRL': { locale: 'pt-BR', symbol: 'R$' },
    'original': { locale: 'es-CO', symbol: '$' },
}

function getCurrencyFormat(currency) {
    return CURRENCY_LOCALES[currency] || CURRENCY_LOCALES['original']
}

function parseNumber(raw) {
    const s = raw.trim()
    const hasCommaDecimal = /\d+\.\d{3},\d+/.test(s)
    const hasDotDecimal = /\d+,\d{3}\.\d+/.test(s)
    if (hasCommaDecimal) {
        return parseFloat(s.replace(/\./g, '').replace(',', '.'))
    }
    if (hasDotDecimal) {
        return parseFloat(s.replace(/,/g, ''))
    }
    const dotParts = s.split('.')
    const commaParts = s.split(',')
    if (dotParts.length > 1 && dotParts[dotParts.length - 1].length === 3 && commaParts.length === 1) {
        return parseFloat(s.replace(/\./g, ''))
    }
    return parseFloat(s.replace(/,/g, ''))
}

function parseCategories(text) {
    const lines = text.split('\n')
    const entries = []

    const patterns = [
        /[-*•]\s*\*{0,2}([^:*\n]+?)\*{0,2}\s*[:–-]\s*[\$€R]?\s*([\d.,]+)/i,
        /\*{1,2}([^:*\n]+?)\*{0,2}\s*:\s*[\$€R]?\s*([\d.,]+)/i,
        /^([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)\s*[:–]\s*[\$€R]?\s*([\d.,]+)/m,
    ]

    for (const line of lines) {
        for (const pattern of patterns) {
            const match = line.match(pattern)
            if (match) {
                const label = match[1].trim()
                const value = parseNumber(match[2])
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

export function mountChartPanel(container, rawText, currency = 'original') {
    const categories = parseCategories(rawText)

    if (categories.length === 0) {
        container.innerHTML = ''
        return
    }

    const fmt = getCurrencyFormat(currency)
    const labels = categories.map(e => e.label)
    const values = categories.map(e => e.value)
    const colors = categories.map((_, i) => PALETTE[i % PALETTE.length])

    const formatValue = v => `${fmt.symbol}${v.toLocaleString(fmt.locale)}`

    container.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg p-4" style="background:var(--surface);border:1px solid var(--border);">
                <h3 class="text-[11px] font-semibold tracking-widest uppercase mb-4" style="color:var(--text2);font-family:'Syne',sans-serif;">Gasto por categoria</h3>
                <div class="relative" style="height:200px;">
                    <canvas id="bar-chart"></canvas>
                </div>
            </div>
            <div class="rounded-lg p-4" style="background:var(--surface);border:1px solid var(--border);">
                <h3 class="text-[11px] font-semibold tracking-widest uppercase mb-4" style="color:var(--text2);font-family:'Syne',sans-serif;">Distribucion</h3>
                <div class="relative" style="height:230px;">
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
            datasets: [{ data: values, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
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
                    callbacks: { label: ctx => ` ${formatValue(ctx.parsed.y)}` }
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
                        callback: v => formatValue(v)
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
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }]
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
                    callbacks: { label: ctx => ` ${formatValue(ctx.parsed)}` }
                }
            }
        }
    })
}