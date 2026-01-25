import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

let chartInstance = null;

export function drawChart(dataPoints, prediction, recentNews) {
    const ctx = document.getElementById('chart').getContext('2d');

    // Alte Charts zerstören, falls vorhanden
    if(chartInstance) chartInstance.destroy();

    // Annotations für News
    const annotations = recentNews.map(n => {
        const index = dataPoints.findIndex(d => d.date === n.date);
        if(index < 0) return null;
        return {
            type: 'point',
            xValue: dataPoints[index].date,
            yValue: dataPoints[index].price,
            backgroundColor: n.impact>0 ? '#00ff66' : '#ff5555',
            radius: 6,
            label: {
                content: n.description,
                enabled: true,
                position: 'top',
                backgroundColor: '#111',
                color: '#00ffcc',
                font: { size: 11 }
            }
        }
    }).filter(a => a);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.map(d => d.date),
            datasets: [
                { 
                    label: 'Preis (CHF)',
                    data: dataPoints.map(d => d.price),
                    borderColor: '#00ffcc',
                    tension: 0.3
                },
                { 
                    label: 'Projektion',
                    data: [...dataPoints.slice(0,-1).map(d => d.price), prediction],
                    borderColor: '#ffaa00',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: { mode: 'index', intersect: false },
                annotation: { annotations }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Datum' } },
                y: { display: true, title: { display: true, text: 'Preis (CHF)' } }
            }
        }
    });
}
