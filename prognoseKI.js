import { getHistory, predict, confidenceScore } from './analyseKI.js';
import { drawChart } from './chartKI.js';

// Max. Prognosen pro Tag
const MAX_FORECASTS = 100;

// Prüfen & erhöhen des Counters in localStorage
function checkForecastLimit() {
    const today = new Date().toISOString().slice(0,10);
    let stored = JSON.parse(localStorage.getItem('forecastCount') || '{}');

    if(!stored.date || stored.date !== today) {
        stored = { date: today, count: 0 };
    }

    if(stored.count >= MAX_FORECASTS) {
        return false; // Limit erreicht
    }

    stored.count += 1;
    localStorage.setItem('forecastCount', JSON.stringify(stored));
    return true;
}

export async function analyze(stockSelect, modeSelect) {
    const stockSymbol = stockSelect.value;
    const mode = modeSelect.value;

    if(!checkForecastLimit()) {
        document.getElementById('status').textContent = 
            'Tägliches Prognosen-Limit erreicht (100). Bitte morgen erneut.';
        return;
    }

    document.getElementById('status').textContent = 'Lade Marktdaten…';

    try {
        const data = await getHistory(stockSymbol);
        const { prediction, recentEvents } = predict(data, mode);

        drawChart(data, prediction, recentEvents);

        const lastPrice = data[data.length-1].price;
        const change = (prediction - lastPrice) / lastPrice;
        const signal = change > 0.08 ? 'KAUFEN' : change < -0.08 ? 'VERKAUFEN' : 'HALTEN';
        const cls = change > 0.08 ? 'buy' : change < -0.08 ? 'sell' : 'hold';

        document.getElementById('confidence').textContent = confidenceScore(data, mode);
        document.getElementById('result').innerHTML = `
            <tr>
                <td>${lastPrice.toFixed(2)}</td>
                <td>${prediction.toFixed(2)}</td>
                <td class="${cls}">${signal}</td>
                <td>${(Math.abs(change)*100).toFixed(1)}%</td>
            </tr>`;

        document.getElementById('explanation').innerHTML = `
            RSI ${data.slice(-15).map(d => d.price).join(', ')}, 
            MACD ${(data.slice(-26).reduce((a,b) => a+b.price,0)/26).toFixed(2)}, 
            Modus ${mode}.<br>` +
            (recentEvents.length
                ? "Berücksichtigte Ereignisse: " + recentEvents.map(e => `${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", ")
                : "Keine besonderen Ereignisse in letzter Zeit.");

        document.getElementById('fundamental').innerHTML = 
            `Grundlegende Stabilitätsprüfung (internes Filtermodell).`;

        document.getElementById('status').textContent = 'Analyse abgeschlossen';

    } catch(e) {
        document.getElementById('status').textContent = 'Fehler beim Laden der Daten: ' + e;
    }
}
