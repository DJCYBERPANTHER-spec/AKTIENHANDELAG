import { STOCKS, API_KEYS, USD_TO_CHF, getHistory } from './api.js';
import { predict, resetDailyAnalyses } from './predict.js';

const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

let chart;
let KI_MODE = "normal";
function setMode(m){
  KI_MODE=m;
  document.getElementById("mode").textContent = m.charAt(0).toUpperCase() + m.slice(1);
}

// ================= ANALYSE =================
async function analyze(){
  if(localStorage.getItem("dailyAnalyses") >= 100){
    alert("Maximale Analysen heute erreicht!");
    return;
  }
  document.getElementById("status").textContent="Lade Marktdaten…";
  try{
    const data = await getHistory(select.value);
    const {pred, signal, recentEvents, confidence, futureProjections} = predict(data, KI_MODE, 7);
    
    drawChart(data, pred);

    const last = data[data.length-1].price;

    // Tabelle füllen
    document.getElementById("result").innerHTML = `
      <tr>
        <td>${last.toFixed(2)}</td>
        <td class="${signal==='KAUFEN'?'buy':signal==='VERKAUFEN'?'sell':'hold'}">${signal}</td>
        <td>${futureProjections[7].toFixed(2)}</td>
        <td>${futureProjections[21].toFixed(2)}</td>
        <td>${futureProjections[30].toFixed(2)}</td>
        <td>${futureProjections[90].toFixed(2)}</td>
        <td>${futureProjections[180].toFixed(2)}</td>
        <td>${futureProjections[365].toFixed(2)}</td>
      </tr>
    `;

    document.getElementById("confidence").textContent = confidence;
    document.getElementById("explanation").textContent = `RSI/MACD-basierte KI-Prognose. Modus: ${KI_MODE}`;
    document.getElementById("fundamental").textContent = "Interne Stabilitätsprüfung (KI-Modell)";

    // Lernstatus
    let daily = parseInt(localStorage.getItem("dailyAnalyses")||0)+1;
    localStorage.setItem("dailyAnalyses", daily);
    document.getElementById("dailyCount").textContent = daily;
    document.getElementById("learnFactor").textContent = (1 + daily*0.01).toFixed(2);

    document.getElementById("status").textContent="Analyse abgeschlossen";
  }catch(e){
    document.getElementById("status").textContent="Fehler beim Laden der Daten";
    console.error(e);
  }
}

function drawChart(data, pred){
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"),{
    type:"line",
    data:{
      labels:data.map(d=>d.date),
      datasets:[
        {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
        {label:"Projektion", data:[...data.slice(0,-1).map(d=>d.price),pred], borderColor:"#ffaa00", tension:0.3}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true}, tooltip:{mode:'index', intersect:false}},
      scales:{
        x:{display:true,title:{display:true,text:'Datum'}},
        y:{display:true,title:{display:true,text:'Preis (CHF)'}}
      }
    }
  });
}

document.getElementById("analyzeBtn").addEventListener("click", analyze);
window.setMode = setMode;
