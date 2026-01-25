/* ================== API KEYS ================== */
const ALPHAVANTAGE_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL","V1270QJC4U234VM5","773MREFM9OMEXXCX"];
let avIndex = 0;
const MARKETAUX_KEY = "eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj";

/* ================== USD->CHF ================== */
let USD_TO_CHF = 0.91;
async function updateUsdToChf() {
  try {
    const r = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=CHF&apikey=${ALPHAVANTAGE_KEYS[avIndex]}`);
    const d = await r.json();
    const rate = parseFloat(d["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
    if(!isNaN(rate)) USD_TO_CHF = rate;
  } catch(e){ console.warn("Fehler beim USD->CHF Update",e); }
}
updateUsdToChf();

/* ================== SELBSTLERNENDE KI ================== */
// localStorage Schlüssel
const STORAGE_KEY = "selfLearningAI";

// Initialisierung der Lernwerte
let learningData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {weights:{trend:0.5,rsi:0.3,macd:0.2},history:[],accuracy:0};

/* ================== AKTIEN ================== */
const STOCKS = [
  {s:"AAPL",n:"Apple"}, {s:"MSFT",n:"Microsoft"}, {s:"NVDA",n:"NVIDIA"}, {s:"AMD",n:"AMD"},
  {s:"INTC",n:"Intel"}, {s:"TSLA",n:"Tesla"}, {s:"META",n:"Meta"}, {s:"GOOGL",n:"Alphabet"},
  {s:"AMZN",n:"Amazon"}, {s:"NFLX",n:"Netflix"}, {s:"ORCL",n:"Oracle"}, {s:"IBM",n:"IBM"},
  {s:"CSCO",n:"Cisco"}, {s:"ADBE",n:"Adobe"}, {s:"CRM",n:"Salesforce"}, {s:"SQ",n:"Block, Inc. (Square)"},
  {s:"PYPL",n:"PayPal"}, {s:"INTU",n:"Intuit"}, {s:"SNOW",n:"Snowflake"}, {s:"ADSK",n:"Autodesk"},
  {s:"NOW",n:"ServiceNow"}, {s:"JPM",n:"JPMorgan"}, {s:"BAC",n:"Bank of America"}, {s:"WFC",n:"Wells Fargo"},
  {s:"GS",n:"Goldman Sachs"}, {s:"MS",n:"Morgan Stanley"}, {s:"V",n:"Visa"}, {s:"MA",n:"Mastercard"},
  {s:"AXP",n:"American Express"}, {s:"SCHW",n:"Charles Schwab"}, {s:"BK",n:"Bank of New York Mellon"},
  {s:"PG",n:"Procter & Gamble"}, {s:"KO",n:"Coca-Cola"}, {s:"PEP",n:"PepsiCo"}, {s:"WMT",n:"Walmart"},
  {s:"COST",n:"Costco"}, {s:"MCD",n:"McDonald's"}, {s:"NKE",n:"Nike"}, {s:"SBUX",n:"Starbucks"},
  {s:"HD",n:"Home Depot"}, {s:"LOW",n:"Lowe's"}, {s:"TJX",n:"TJX Companies"}, {s:"DG",n:"Dollar General"},
  {s:"DIS",n:"Disney"}, {s:"LYV",n:"Live Nation"}, {s:"MELI",n:"MercadoLibre"},
  // ... bis 160 Aktien hinzufügen ...
];

/* ================== EXTERNE EREIGNISSE ================== */
let EVENTS = []; // Später Marketaux-News reinladen

/* ================== HELPERS ================== */
function EMA(data,period){
  const k=2/(period+1);
  let e=data[0].price;
  for(let i=1;i<data.length;i++) e=data[i].price*k+e*(1-k);
  return e;
}
function RSI(data){
  let gains=0,losses=0;
  for(let i=data.length-15;i<data.length-1;i++){
    const diff=data[i+1].price-data[i].price;
    if(diff>0) gains+=diff; else losses-=diff;
  }
  return 100-(100/(1+(gains/(losses||1))));
}
function MACD(data){return EMA(data,12)-EMA(data,26);}

/* ================== HISTORY FETCH ================== */
async function getHistory(symbol){
  let retries = 0;
  while(retries<ALPHAVANTAGE_KEYS.length){
    try{
      const key = ALPHAVANTAGE_KEYS[avIndex];
      const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d = await r.json();
      if(d.Note||d["Error Message"]){ avIndex=(avIndex+1)%ALPHAVANTAGE_KEYS.length; retries++; continue; }
      const arr = Object.entries(d["Time Series (Daily)"]).reverse().map(([date,v])=>({date,price:parseFloat(v["4. close"])*USD_TO_CHF}));
      if(arr.length===0) throw "Keine Daten";
      return arr;
    }catch(e){ retries++; avIndex=(avIndex+1)%ALPHAVANTAGE_KEYS.length; }
  }
  throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
}

/* ================== SELBSTLERN-PROGNOSEN ================== */
function selfLearningPredict(data, horizon=7){
  const last = data[data.length-1].price;
  const trend = (EMA(data,10)-last)/last;
  const rsi = RSI(data);
  const macd = MACD(data);

  // Gewichte aus localStorage
  const w = learningData.weights;

  // Prognose berechnen
  let pred = last*(1 + trend*w.trend + ((rsi-50)/100)*w.rsi + (macd/100)*w.macd);

  // Ereignisse berücksichtigen
  const recentEvents = EVENTS.filter(e=>data.some(d=>d.date===e.date));
  recentEvents.forEach(e=>pred*=(1+e.impact));

  // Für Zukunft nach Tagen (vereinfachtes Multiplikationsmodell)
  pred *= 1 + 0.01*(horizon/7);

  return {pred,recentEvents};
}

/* ================== LERNEN ================== */
function updateLearning(real, pred){
  const error = (pred-real)/real;
  // Anpassung der Gewichtungen (leicht, nur 0.01 pro Schritt)
  learningData.weights.trend -= 0.01*error;
  learningData.weights.rsi -= 0.01*error;
  learningData.weights.macd -= 0.01*error;

  // Begrenzung zwischen 0 und 1
  for(const k of ["trend","rsi","macd"]) learningData.weights[k]=Math.min(Math.max(learningData.weights[k],0),1);

  // Speichern
  learningData.history.push({real,pred,error});
  learningData.accuracy = 100-(learningData.history.reduce((a,b)=>a+Math.abs(b.error),0)/learningData.history.length*100);

  localStorage.setItem(STORAGE_KEY,JSON.stringify(learningData));
}
/* ================== FORECAST ZEITRÄUME ================== */
const FORECASTS = [
  {label:"1 Woche", days:7},
  {label:"3 Wochen", days:21},
  {label:"1 Monat", days:30},
  {label:"3 Monate", days:90},
  {label:"6 Monate", days:180},
  {label:"1 Jahr", days:365}
];

/* ================== CHART ================== */
let chart;
function drawChart(data,predictions){
  if(chart) chart.destroy();

  // Labels & Dataset für Chart.js
  const labels = data.map(d=>d.date);
  const datasets = [
    {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
  ];

  // Prognosen als Linien hinzufügen
  FORECASTS.forEach(f=>{
    const pred = predictions[f.label];
    const predData = Array(data.length-1).fill(null).concat([pred]);
    datasets.push({label:`Projektion ${f.label}`, data:predData, borderColor:"#ffaa00", tension:0.3});
  });

  chart = new Chart(document.getElementById("chart"),{
    type:"line",
    data:{labels,datasets},
    options:{
      responsive:true,
      plugins:{
        legend:{display:true},
        tooltip:{mode:'index', intersect:false},
      },
      scales:{
        x:{display:true,title:{display:true,text:'Datum'}},
        y:{display:true,title:{display:true,text:'Preis (CHF)'}}
      }
    }
  });
}

/* ================== MARKETNEWS ================== */
async function fetchMarketNews(){
  try{
    const r = await fetch(`https://api.marketaux.com/v1/news/all?api_token=${MARKETAUX_KEY}&language=en`);
    const d = await r.json();
    EVENTS = d.data.map(item=>({
      date:item.published_at.split("T")[0],
      impact:0, // optional: du könntest hier Sentiment-Score einsetzen
      description:item.title
    }));
  }catch(e){ console.warn("Fehler Marketaux News:",e); }
}
fetchMarketNews();

/* ================== ANALYSE ================== */
async function analyze(){
  document.getElementById("status").textContent="Lade Marktdaten…";
  try{
    const symbol = document.getElementById("stockSelect").value;
    const data = await getHistory(symbol);

    // Prognosen für alle Forecast-Zeiträume
    let predictions = {};
    FORECASTS.forEach(f=>{
      const {pred} = selfLearningPredict(data,f.days);
      predictions[f.label] = pred;
    });

    // Chart zeichnen
    drawChart(data,predictions);

    // Letzter Preis
    const last = data[data.length-1].price;

    // Lernupdate: für die kürzeste Vorhersage 1 Woche
    updateLearning(last,predictions["1 Woche"]);

    // Ergebnis-Tabelle aktualisieren
    const resultHTML = FORECASTS.map(f=>{
      const pred = predictions[f.label];
      const d = (pred-last)/last;
      const signal = d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
      const cls = d>0.08?"buy":d<-0.08?"sell":"hold";
      return `<tr>
        <td>${last.toFixed(2)}</td>
        <td>${pred.toFixed(2)}</td>
        <td class="${cls}">${signal}</td>
        <td>${(Math.abs(d)*100).toFixed(1)}%</td>
      </tr>`;
    }).join("");
    document.getElementById("result").innerHTML = resultHTML;

    // Lernfortschritt anzeigen
    document.getElementById("explanation").innerHTML =
      `Lernstatus: KI hat ${learningData.history.length} Prognosen gelernt.<br>`+
      `Aktuelle Gewichtungen: Trend ${learningData.weights.trend.toFixed(2)}, RSI ${learningData.weights.rsi.toFixed(2)}, MACD ${learningData.weights.macd.toFixed(2)}.<br>`+
      `Durchschnittliche Genauigkeit: ${learningData.accuracy.toFixed(2)}%`;

    document.getElementById("fundamental").innerHTML =
      `Berücksichtigte aktuelle News und fundamentale Ereignisse: ${EVENTS.length} Items`;

    document.getElementById("confidence").textContent = learningData.accuracy.toFixed(1) + "%";
    document.getElementById("status").textContent="Analyse abgeschlossen";

  }catch(e){
    console.error(e);
    document.getElementById("status").textContent=e;
  }
}

/* ================== STOCK SELECT FÜLLEN ================== */
const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ================== MODUS ================== */
let KI_MODE="normal";
function setMode(m){
  KI_MODE=m;
  document.getElementById("mode").textContent=m.charAt(0).toUpperCase()+m.slice(1);
}
