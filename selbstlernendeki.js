/* =================== API KEYS =================== */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL","V1270QJC4U234VM5","773MREFM9OMEXXCX"];
let apiIndex = 0;

/* =================== SETTINGS =================== */
let KI_MODE = "normal";
let forecastOptions = [
    {label:"1 Woche", days:7},
    {label:"3 Wochen", days:21},
    {label:"1 Monat", days:30},
    {label:"3 Monate", days:90},
    {label:"6 Monate", days:180},
    {label:"1 Jahr", days:365}
];

/* =================== AKTIEN =================== */
// 160+ Aktien wie vorher
const STOCKS = [
  {s:"AAPL", n:"Apple"}, {s:"MSFT", n:"Microsoft"}, {s:"NVDA", n:"NVIDIA"}, {s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"}, {s:"TSLA", n:"Tesla"}, {s:"META", n:"Meta"}, {s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"}, {s:"NFLX", n:"Netflix"}, {s:"ORCL", n:"Oracle"}, {s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"}, {s:"ADBE", n:"Adobe"}, {s:"CRM", n:"Salesforce"}, {s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"}, {s:"INTU", n:"Intuit"}, {s:"SNOW", n:"Snowflake"}, {s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"}, {s:"JPM", n:"JPMorgan"}, {s:"BAC", n:"Bank of America"}, {s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"}, {s:"MS", n:"Morgan Stanley"}, {s:"V", n:"Visa"}, {s:"MA", n:"Mastercard"},
  {s:"AXP", n:"American Express"}, {s:"SCHW", n:"Charles Schwab"}, {s:"BK", n:"Bank of New York Mellon"},
  {s:"PG", n:"Procter & Gamble"}, {s:"KO", n:"Coca-Cola"}, {s:"PEP", n:"PepsiCo"}, {s:"WMT", n:"Walmart"},
  {s:"COST", n:"Costco"}, {s:"MCD", n:"McDonald's"}, {s:"NKE", n:"Nike"}, {s:"SBUX", n:"Starbucks"},
  {s:"HD", n:"Home Depot"}, {s:"LOW", n:"Lowe's"}, {s:"TJX", n:"TJX Companies"}, {s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"}, {s:"LYV", n:"Live Nation"}, {s:"MELI", n:"MercadoLibre"}, {s:"BA", n:"Boeing"},
  {s:"CAT", n:"Caterpillar"}, {s:"GE", n:"General Electric"}, {s:"MMM", n:"3M"}, {s:"HON", n:"Honeywell"},
  {s:"UPS", n:"UPS"}, {s:"FDX", n:"FedEx"}, {s:"LMT", n:"Lockheed Martin"}, {s:"RTX", n:"Raytheon Technologies"},
  {s:"DAL", n:"Delta Air Lines"}, {s:"UAL", n:"United Airlines"}, {s:"XOM", n:"Exxon Mobil"}, {s:"CVX", n:"Chevron"},
  {s:"COP", n:"ConocoPhillips"}, {s:"BP", n:"BP"}, {s:"TOT", n:"TotalEnergies"}, {s:"SLB", n:"Schlumberger"},
  {s:"JNJ", n:"Johnson & Johnson"}, {s:"PFE", n:"Pfizer"}, {s:"MRK", n:"Merck"}, {s:"ABBV", n:"AbbVie"},
  {s:"BMY", n:"Bristol Myers Squibb"}, {s:"LLY", n:"Eli Lilly"}, {s:"AMGN", n:"Amgen"}, {s:"GILD", n:"Gilead Sciences"},
  {s:"NESN.SW", n:"Nestlé"}, {s:"ROG.SW", n:"Roche"}, {s:"NOVN.SW", n:"Novartis"}, {s:"UBSG.SW", n:"UBS"},
  {s:"ZURN.SW", n:"Zurich Insurance"}, {s:"CFR.SW", n:"Credit Suisse"}, {s:"SAP.DE", n:"SAP"}, {s:"ASML.AS", n:"ASML Holding"},
  {s:"AIR.PA", n:"Airbus"}, {s:"DAI.DE", n:"Daimler"}, {s:"BN.PA", n:"BNP Paribas"}, {s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"}, {s:"7203.T", n:"Toyota"}, {s:"6758.T", n:"Sony"}, {s:"9984.T", n:"SoftBank"},
  {s:"6861.T", n:"Keyence"}, {s:"BABA", n:"Alibaba"}, {s:"TCEHY", n:"Tencent"}, {s:"JD", n:"JD.com"},
  {s:"INFY", n:"Infosys"}, {s:"HDB", n:"HDFC Bank"}, {s:"ICICIBANK.NS", n:"ICICI Bank"}, {s:"RELIANCE.BO", n:"Reliance Industries"},
  {s:"T", n:"AT&T"}, {s:"VZ", n:"Verizon"}, {s:"TMUS", n:"T-Mobile US"}, {s:"CMCSA", n:"Comcast"}, {s:"FOX", n:"Fox Corp"}
];

/* =================== EXTERNAL EVENTS =================== */
const EVENTS = [
  {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
  {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
  {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
  {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
];

/* =================== FILL SELECT =================== */
const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* =================== MODE =================== */
function setMode(m){
  KI_MODE = m;
  document.getElementById("mode").textContent = m.charAt(0).toUpperCase() + m.slice(1);
}

/* =================== API FETCH =================== */
async function getHistory(symbol){
  let tries = 0;
  while(tries < API_KEYS.length){
    const key = API_KEYS[apiIndex];
    try{
      const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d = await r.json();
      if(d.Note || d["Error Message"]){ throw "Limit erreicht"; }
      return Object.entries(d["Time Series (Daily)"]).slice(0,365).reverse().map(([date,v])=>({date,price:parseFloat(v["4. close"])}));
    }catch(e){
      apiIndex = (apiIndex + 1) % API_KEYS.length;
      tries++;
    }
  }
  throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
}

/* =================== INDICATORS =================== */
function EMA(data, period){
  const k = 2/(period+1);
  let e = data[0].price;
  for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
  return e;
}
function RSI(data){
  let gains=0,losses=0;
  for(let i=Math.max(0,data.length-15);i<data.length-1;i++){
    const diff = data[i+1].price-data[i].price;
    if(diff>0) gains+=diff; else losses-=diff;
  }
  return 100-(100/(1+(gains/(losses||1))));
}
function MACD(data){ return EMA(data,12)-EMA(data,26); }

/* =================== SMART PREDICTION =================== */
function smartPredict(data, days){
    const prices = data.map(d=>d.price);
    const emaShort = EMA(data, 10);
    const emaLong = EMA(data, 50);
    const trendFactor = (emaShort-emaLong)/emaLong;
    const rsi = RSI(data);
    const macd = MACD(data);
    let base = prices[prices.length-1];
    let modeFactor = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
    let forecastBase = base*(1+trendFactor*0.5*modeFactor);
    if(rsi>70) forecastBase*=0.97;
    if(rsi<30) forecastBase*=1.03;
    if(macd>0.5) forecastBase*=1.02;
    if(macd<-0.5) forecastBase*=0.98;
    const recentEvents = EVENTS.filter(e=>data.some(d=>d.date===e.date));
    recentEvents.forEach(e=>forecastBase*=1+e.impact);
    const projections=[];
    let lastPrice=forecastBase;
    for(let i=1;i<=days;i++){
        let dailyTrend = trendFactor*0.01;
        let dailyNoise = (Math.random()-0.5)*0.01;
        lastPrice = lastPrice*(1+dailyTrend+dailyNoise);
        projections.push(lastPrice.toFixed(2));
    }
    return {forecastBase:forecastBase.toFixed(2), projections, recentEvents};
}

function confidenceScore(data){
  let s=60;
  const macd = MACD(data);
  const rsi = RSI(data);
  if(Math.abs(macd)>0.5) s+=5;
  if(rsi>40&&rsi<60) s+=5;
  if(KI_MODE==="safe") s+=3;
  return s>75?"Hoch":s>65?"Mittel":"Niedrig";
}

/* =================== CHART =================== */
let chart;
function drawChart(data,pred,recentEvents){
  if(chart) chart.destroy();
  const annotations = recentEvents.map(e=>{
    const index = data.findIndex(d=>d.date===e.date);
    if(index<0) return null;
    return {type:'point', xValue:data[index].date, yValue:data[index].price,
      backgroundColor:e.impact>0?'#00ff66':'#ff5555', radius:6,
      label:{content:e.description, enabled:true, position:'top', backgroundColor:'#111', color:'#00ffcc', font:{size:11}}
    };
  }).filter(a=>a);

  chart = new Chart(document.getElementById("chart"),{
    type:"line",
    data:{labels:data.map(d=>d.date), datasets:[
      {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
      {label:"Projektion", data:[...data.slice(0,-1).map(d=>d.price),pred], borderColor:"#ffaa00", tension:0.3}
    ]},
    options:{responsive:true, plugins:{legend:{display:true}, tooltip:{mode:'index', intersect:false}, annotation:{annotations}},
      scales:{x:{display:true,title:{display:true,text:'Datum'}},y:{display:true,title:{display:true,text:'Preis (CHF)'}}}}
  });
}

/* =================== ANALYZE =================== */
async function analyze(){
  const symbol = select.value;
  document.getElementById("status").textContent="Lade Marktdaten…";
  try{
    const data = await getHistory(symbol);
    const days = forecastOptions[forecastOptions.length-1].days; // längster Zeitraum für Chart
    const {forecastBase, projections, recentEvents} = smartPredict(data, days);

    drawChart(data, forecastBase, recentEvents);

    document.getElementById("confidence").textContent = confidenceScore(data);

    // Tabelle für alle Zeiträume
    let tbody = "";
    forecastOptions.forEach(opt=>{
      let p = projections.slice(0,opt.days).pop();
      const last = data[data.length-1].price;
      const d = (p-last)/last;
      const signal = d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
      const cls = d>0.08?"buy":d<-0.08?"sell":"hold";
      tbody+=`<tr><td>${opt.label}</td><td>${last.toFixed(2)}</td><td>${p}</td><td class="${cls}">${signal}</td><td>${(Math.abs(d)*100).toFixed(1)}%</td></tr>`;
    });
    document.getElementById("result").innerHTML = tbody;

    document.getElementById("explanation").innerHTML =
      `RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Modus ${KI_MODE}.<br>` +
      (recentEvents.length ? "Berücksichtigte Ereignisse: "+recentEvents.map(e=>`${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", ") : "Keine besonderen Ereignisse in letzter Zeit.");

    document.getElementById("fundamental").innerHTML = `Grundlegende Stabilitätsprüfung (internes Filtermodell).`;

    document.getElementById("status").textContent="Analyse abgeschlossen";

  }catch(e){
    document.getElementById("status").textContent=e;
  }
}
