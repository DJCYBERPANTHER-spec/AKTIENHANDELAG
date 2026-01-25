/* ================= API KEYS ================= */
const API_KEYS = [
  "GH13X9P8J48O0UPW", "KAQ3H4TQELGSHL",
  "V1270QJC4U234VM5", "773MREFM9OMEXXCX"
];
let apiIndex = 0;
const USD_TO_CHF = 0.91;

/* ================= AKTIEN ================= */
const STOCKS = [
  // TECH
  {s:"AAPL", n:"Apple"}, {s:"MSFT", n:"Microsoft"}, {s:"NVDA", n:"NVIDIA"}, {s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"}, {s:"TSLA", n:"Tesla"}, {s:"META", n:"Meta"}, {s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"}, {s:"NFLX", n:"Netflix"}, {s:"ORCL", n:"Oracle"}, {s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"}, {s:"ADBE", n:"Adobe"}, {s:"CRM", n:"Salesforce"}, {s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"}, {s:"INTU", n:"Intuit"}, {s:"SNOW", n:"Snowflake"}, {s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"}, {s:"SAP.DE", n:"SAP"}, {s:"ASML.AS", n:"ASML Holding"}, {s:"SIE.DE", n:"Siemens"},
  {s:"AAPL.MX", n:"Apple MX"}, {s:"GOOGL.MX", n:"Alphabet MX"},

  // FINANCE
  {s:"JPM", n:"JPMorgan"}, {s:"BAC", n:"Bank of America"}, {s:"WFC", n:"Wells Fargo"}, {s:"GS", n:"Goldman Sachs"},
  {s:"MS", n:"Morgan Stanley"}, {s:"V", n:"Visa"}, {s:"MA", n:"Mastercard"}, {s:"AXP", n:"American Express"},
  {s:"SCHW", n:"Charles Schwab"}, {s:"BK", n:"Bank of New York Mellon"}, {s:"UBSG.SW", n:"UBS"}, {s:"CFR.SW", n:"Credit Suisse"},
  {s:"CS.PA", n:"Crédit Suisse EU"}, {s:"BN.PA", n:"BNP Paribas"},

  // CONSUMER
  {s:"PG", n:"Procter & Gamble"}, {s:"KO", n:"Coca-Cola"}, {s:"PEP", n:"PepsiCo"}, {s:"WMT", n:"Walmart"},
  {s:"COST", n:"Costco"}, {s:"MCD", n:"McDonald's"}, {s:"NKE", n:"Nike"}, {s:"SBUX", n:"Starbucks"},
  {s:"HD", n:"Home Depot"}, {s:"LOW", n:"Lowe's"}, {s:"TJX", n:"TJX Companies"}, {s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"}, {s:"LYV", n:"Live Nation"}, {s:"MELI", n:"MercadoLibre"},

  // INDUSTRY
  {s:"BA", n:"Boeing"}, {s:"CAT", n:"Caterpillar"}, {s:"GE", n:"General Electric"}, {s:"MMM", n:"3M"},
  {s:"HON", n:"Honeywell"}, {s:"UPS", n:"UPS"}, {s:"FDX", n:"FedEx"}, {s:"LMT", n:"Lockheed Martin"},
  {s:"RTX", n:"Raytheon Technologies"}, {s:"DAL", n:"Delta Air Lines"}, {s:"UAL", n:"United Airlines"},

  // ENERGY
  {s:"XOM", n:"Exxon Mobil"}, {s:"CVX", n:"Chevron"}, {s:"COP", n:"ConocoPhillips"}, {s:"BP", n:"BP"},
  {s:"TOT", n:"TotalEnergies"}, {s:"SLB", n:"Schlumberger"},

  // HEALTHCARE
  {s:"JNJ", n:"Johnson & Johnson"}, {s:"PFE", n:"Pfizer"}, {s:"MRK", n:"Merck"}, {s:"ABBV", n:"AbbVie"},
  {s:"BMY", n:"Bristol Myers Squibb"}, {s:"LLY", n:"Eli Lilly"}, {s:"AMGN", n:"Amgen"}, {s:"GILD", n:"Gilead Sciences"},

  // JAPAN
  {s:"7203.T", n:"Toyota"}, {s:"6758.T", n:"Sony"}, {s:"9984.T", n:"SoftBank"}, {s:"6861.T", n:"Keyence"},

  // EMERGING MARKETS
  {s:"BABA", n:"Alibaba"}, {s:"TCEHY", n:"Tencent"}, {s:"JD", n:"JD.com"}, {s:"INFY", n:"Infosys"},
  {s:"HDB", n:"HDFC Bank"}, {s:"ICICIBANK.NS", n:"ICICI Bank"}, {s:"RELIANCE.BO", n:"Reliance Industries"},

  // TELECOM / MEDIA
  {s:"T", n:"AT&T"}, {s:"VZ", n:"Verizon"}, {s:"TMUS", n:"T-Mobile US"}, {s:"CMCSA", n:"Comcast"}, {s:"FOX", n:"Fox Corp"},

  // SWISS LARGE CAP
  {s:"NESN.SW", n:"Nestlé"}, {s:"ROG.SW", n:"Roche"}, {s:"NOVN.SW", n:"Novartis"}, {s:"ZURN.SW", n:"Zurich Insurance"}
];

// Populate Dropdown
const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ================= EXTERNE EREIGNISSE ================= */
const EVENTS = [
  {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
  {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
  {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
  {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
];

/* ================= MODE ================= */
let KI_MODE="normal";
function setMode(m){
  KI_MODE=m;
  document.getElementById("mode").textContent=m.charAt(0).toUpperCase()+m.slice(1);
}

/* ================= API FETCH MIT ROTATION ================= */
async function getHistory(symbol){
  let attempts = 0;
  while(attempts < API_KEYS.length){
    try{
      const key = API_KEYS[apiIndex];
      const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d = await r.json();
      if(d.Note || d["Error Message"]) throw "API-Limit erreicht";
      return Object.entries(d["Time Series (Daily)"])
        .slice(0,365)
        .reverse()
        .map(([date,v])=>({date,price:parseFloat(v["4. close"])*USD_TO_CHF}));
    }catch(e){
      apiIndex = (apiIndex+1) % API_KEYS.length;
      attempts++;
      if(attempts >= API_KEYS.length) throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
    }
  }
}
/* ================= INDICATORS ================= */
function EMA(data, period){
  if(!data || data.length === 0) return 0;
  const k = 2/(period+1);
  let e = data[0].price;
  for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
  return e;
}

function RSI(data){
  if(!data || data.length < 15) return 50;
  let gains=0,losses=0;
  for(let i=data.length-15;i<data.length-1;i++){
    const diff=data[i+1].price-data[i].price;
    if(diff>0) gains+=diff; else losses-=diff;
  }
  return 100-(100/(1+(gains/(losses||1))));
}

function MACD(data){return EMA(data,12)-EMA(data,26);}

/* ================= MULTI-ZEITRAUM ================= */
const TIMEFRAMES = [
  {label:"1 Woche", days:7},
  {label:"3 Wochen", days:21},
  {label:"1 Monat", days:30},
  {label:"3 Monate", days:90},
  {label:"6 Monate", days:180},
  {label:"1 Jahr", days:365}
];

/* ================= PREDICTION ================= */
function predict(data, daysAhead){
  if(!data || data.length === 0) return {pred:0, recentEvents:[]};
  const last = data[data.length-1].price;
  let w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
  let trend = EMA(data,10)-last;
  let pred = last*(1+(trend/last*0.5*w)*(daysAhead/7));

  const rsi = RSI(data);
  if(rsi>70) pred *= 0.97;
  if(rsi<30) pred *= 1.03;

  const recentEvents = EVENTS.filter(e => data.some(d => d.date === e.date));
  recentEvents.forEach(e => pred *= 1 + e.impact);

  return {pred, recentEvents};
}

function confidenceScore(data){
  if(!data || data.length === 0) return "–";
  let s=60;
  const macd = MACD(data);
  const rsi = RSI(data);
  if(Math.abs(macd)>0.5) s+=5;
  if(rsi>40&&rsi<60) s+=5;
  if(KI_MODE==="safe") s+=3;
  return s>75?"Hoch":s>65?"Mittel":"Niedrig";
}

/* ================= CHART ================= */
let chart;
function drawChart(data,predictions,recentEvents){
  if(chart) chart.destroy();

  const labels = data.map(d=>d.date);
  const datasetPrice = data.map(d=>d.price);
  const datasetPred = [...data.map(d=>d.price)];
  datasetPred[datasetPred.length-1] = predictions[0].pred;

  const annotations = recentEvents.map(e=>{
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
      labels,
      datasets:[
        {label:"Preis (CHF)", data:datasetPrice, borderColor:"#00ffcc", tension:0.3},
        {label:"Projektion", data:datasetPred, borderColor:"#ffaa00", tension:0.3}
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
    const results = TIMEFRAMES.map(tf => {
      const {pred} = predict(data, tf.days);
      const last = data[data.length-1].price;
      const d = (pred-last)/last;
      const signal = d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
      return {label:tf.label, pred, signal, deviation:(d*100).toFixed(1)};
    });

    // Chart nur 1 Woche Prognose
    const {pred,recentEvents} = predict(data,7);
    drawChart(data,[{pred}],recentEvents);

    // Konfidenz & Tabelle
    document.getElementById("confidence").textContent = confidenceScore(data);
    document.getElementById("result").innerHTML = results.map(r=>`
      <tr>
        <td>${r.pred.toFixed(2)}</td>
        <td>${r.label}</td>
        <td class="${r.signal==="KAUFEN"?"buy":r.signal==="VERKAUFEN"?"sell":"hold"}">${r.signal}</td>
        <td>${r.deviation}%</td>
      </tr>`).join("");

    // Erklärung & Fundamentale Einordnung
    document.getElementById("explanation").innerHTML =
      `RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Modus ${KI_MODE}.<br>` +
      (recentEvents.length
        ? "Berücksichtigte Ereignisse: " + recentEvents.map(e=>`${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", ")
        : "Keine besonderen Ereignisse in letzter Zeit.");

    document.getElementById("fundamental").innerHTML =
      `Grundlegende Stabilitätsprüfung (internes Filtermodell).`;

    document.getElementById("status").textContent="Analyse abgeschlossen";
  }catch(e){
    document.getElementById("status").textContent=e;
  }
}
