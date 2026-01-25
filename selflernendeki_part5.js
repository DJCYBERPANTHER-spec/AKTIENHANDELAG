/* ================= EXTERNE EREIGNISSE ================= */
const EVENTS = [
    {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
    {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
    {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
    {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
];

/* ================= CHART ================= */
let chart;
function drawChart(data,pred,recentEvents){
    if(chart) chart.destroy();

    const annotations = recentEvents.map((e)=>{
        const index = data.findIndex(d => d.date===e.date);
        if(index<0) return null;
        return {
            type:'point',
            xValue: data[index].date,
            yValue: data[index].price,
            backgroundColor: e.impact>0?'#00ff66':'#ff5555',
            radius:6,
            label:{
                content:e.description,
                enabled:true,
                position:'top',
                backgroundColor:'#111',
                color:'#00ffcc',
                font:{size:11}
            }
        };
    }).filter(a=>a);

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

/* ================= ANALYSE ================= */
async function analyze(){
    document.getElementById("status").textContent="Lade Marktdaten…";
    try{
        const data = await getHistory(select.value);
        const {pred,recentEvents} = predict(data);
        drawChart(data,pred,recentEvents);

        const last = data[data.length-1].price;
        const d = (pred-last)/last;
        const signal = d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
        const cls = d>0.08?"buy":d<-0.08?"sell":"hold";

        document.getElementById("confidence").textContent = confidenceScore(data);
        document.getElementById("result").innerHTML = `
          <tr>
            <td>${last.toFixed(2)}</td>
            <td>${pred.toFixed(2)}</td>
            <td class="${cls}">${signal}</td>
            <td>${(Math.abs(d)*100).toFixed(1)}%</td>
          </tr>`;

        document.getElementById("explanation").innerHTML =
          `RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Modus ${KI_MODE}.<br>` +
          (recentEvents.length
            ? "Berücksichtigte Ereignisse: " + recentEvents.map(e=>`${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", ")
            : "Keine besonderen Ereignisse in letzter Zeit.");

        document.getElementById("fundamental").innerHTML =
          `Grundlegende Stabilitätsprüfung (internes Filtermodell).`;

        // KI-Genauigkeit aktualisieren
        updateKIAccuracyFromData(data);

        document.getElementById("status").textContent="Analyse abgeschlossen";
    }catch(e){
        document.getElementById("status").textContent=e;
    }
}
