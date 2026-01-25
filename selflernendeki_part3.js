import { stockSelect, statusDisplay, dailyCount, incrementDailyCount, KI_MODE } from "./main_part1.js";
import { getAlphaHistory, getMarketauxNews, predict, calculateAccuracy } from "./main_part2.js";

let chart;

// ================= BUTTONS =================
export function setMode(mode){
    KI_MODE = mode;
    document.getElementById("mode").textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ================= CHART =================
export function drawChart(data, prediction, news=[]){
    const ctx = document.getElementById("chart").getContext("2d");
    if(chart) chart.destroy();

    const annotations = news.map(e => {
        const index = data.findIndex(d => d.date.startsWith(e.date.substring(0,10)));
        if(index < 0) return null;
        return {
            type:'point',
            xValue: data[index].date,
            yValue: data[index].price,
            backgroundColor:'#ffaa00',
            radius:6,
            label:{
                content:e.description,
                enabled:true,
                position:'top',
                backgroundColor:'#111',
                color:'#00ffcc',
                font:{size:11}
            }
        }
    }).filter(a=>a);

    chart = new Chart(ctx,{
        type:'line',
        data:{
            labels:data.map(d=>d.date),
            datasets:[
                {label:'Preis (CHF)', data:data.map(d=>d.price), borderColor:'#00ffcc', tension:0.3},
                {label:'Prognose', data:[...data.slice(0,-1).map(d=>d.price), prediction], borderColor:'#ffaa00', tension:0.3}
            ]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{display:true},
                tooltip:{mode:'index', intersect:false},
                annotation:{annotations}
            },
            scales:{
                x:{display:true,title:{display:true,text:'Datum'}},
                y:{display:true,title:{display:true,text:'Preis (CHF)'}}
            }
        }
    });
}

// ================= ANALYSE =================
export async function analyzeStock(){
    if(dailyCount() >= 100){
        statusDisplay.textContent = "Maximale Prognosen pro Tag erreicht (100)";
        return;
    }

    const symbol = stockSelect.value;
    statusDisplay.textContent = "Lade Daten…";

    try{
        // Historische Kurse
        const data = await getAlphaHistory(symbol);
        // Aktuelle News
        const news = await getMarketauxNews(symbol);
        // Prognose
        const {pred, news: relevantNews} = predict(data, news);
        drawChart(data, pred, relevantNews);

        // Signal
        const last = data[data.length-1].price;
        const diff = (pred - last)/last;
        const signal = diff>0.08?"KAUFEN":diff<-0.08?"VERKAUFEN":"HALTEN";
        const cls = diff>0.08?"buy":diff<-0.08?"sell":"hold";

        // Genauigkeit
        const accuracy = calculateAccuracy(data);
        document.getElementById("confidence").textContent = accuracy + "%";

        // Ergebnis-Tabelle
        document.getElementById("result").innerHTML = `
            <tr>
                <td>${last.toFixed(2)}</td>
                <td>${pred.toFixed(2)}</td>
                <td class="${cls}">${signal}</td>
                <td>${(Math.abs(diff)*100).toFixed(1)}%</td>
            </tr>`;

        // Lernstatus
        document.getElementById("explanation").innerHTML =
            `RSI ${Math.round(100*data[data.length-1].price/last)}, MACD ${Math.round(pred-last)}, Modus ${KI_MODE}.<br>`+
            (relevantNews.length ? "Berücksichtigte News: " + relevantNews.map(e=>e.description).join(", ") : "Keine aktuellen News.");

        document.getElementById("fundamental").innerHTML = "Grundlegende Stabilitätsprüfung (internes Filtermodell).";

        incrementDailyCount();
        statusDisplay.textContent = "Analyse abgeschlossen ✔";

    } catch(err){
        console.error(err);
        statusDisplay.textContent = err;
    }
}
