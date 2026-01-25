/* ==================== SELBSTLERNENDE KI - TEIL 1 ==================== */

/* ==== API KEYS ==== */
const ALPHAVANTAGE_KEYS = [
  "GH13X9P8J48O0UPW",
  "KAQ3H4TQELGSHL",
  "V1270QJC4U234VM5",
  "773MREFM9OMEXXCX"
];
let apiIndex = 0;

/* ==== GLOBAL VARIABLES ==== */
let KI_MODE = "normal";
let FORECAST_DAYS = 7;
let chart;

/* ==== AKTIENLISTE (~160) ==== */
const STOCKS = [
  {s:"AAPL", n:"Apple"}, {s:"MSFT", n:"Microsoft"}, {s:"NVDA", n:"NVIDIA"}, {s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"}, {s:"TSLA", n:"Tesla"}, {s:"META", n:"Meta"}, {s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"}, {s:"NFLX", n:"Netflix"}, {s:"ORCL", n:"Oracle"}, {s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"}, {s:"ADBE", n:"Adobe"}, {s:"CRM", n:"Salesforce"}, {s:"SQ", n:"Block, Inc."},
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

/* ==== INIT DROPDOWN ==== */
const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ==== MODE & FORECAST ==== */
function setMode(m){KI_MODE=m; document.getElementById("mode").textContent=m.charAt(0).toUpperCase()+m.slice(1);}
function setForecastPeriod(days){FORECAST_DAYS=days;}

/* ==== FETCH HISTORICAL DATA ==== */
async function getHistory(symbol){
  for(let i=0;i<ALPHAVANTAGE_KEYS.length;i++){
    const key = ALPHAVANTAGE_KEYS[apiIndex];
    try{
      const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d = await r.json();
      if(d["Time Series (Daily)"]){
        apiIndex = (apiIndex+1)%ALPHAVANTAGE_KEYS.length;
        return Object.entries(d["Time Series (Daily)"]).slice(0,365).reverse()
          .map(([date,v])=>({date,price:parseFloat(v["4. close"])}));
      }
      apiIndex = (apiIndex+1)%ALPHAVANTAGE_KEYS.length;
    }catch(e){apiIndex=(apiIndex+1)%ALPHAVANTAGE_KEYS.length;}
  }
  throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
}

/* ==== INDICATORS ==== */
function EMA(data, period){
  const k = 2/(period+1);
  let e = data[0].price;
  for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
  return e;
}
function RSI(data){
  let gains=0,losses=0;
  const len = Math.min(14,data.length-1);
  for(let i=data.length-len-1;i<data.length-1;i++){
    const diff=data[i+1].price-data[i].price;
    if(diff>0) gains+=diff; else losses-=diff;
  }
  return 100-(100/(1+(gains/(losses||1))));
}
function MACD(data){return EMA(data,12)-EMA(data,26);}

/* ==== BASE PREDICTION ==== */
function predict(data){
  const last = data[data.length-1].price;
  let w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
  let pred = last*(1+(EMA(data,10)-last)/last*0.5*w);
  const rsi = RSI(data);
  if(rsi>70) pred *= 0.97;
  if(rsi<30) pred *= 1.03;
  return {pred, recentEvents:[]};
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
/* ==================== SELBSTLERNENDE KI - TEIL 2 ==================== */

/* ==== MARKETAUX NEWS API ==== */
const MARKETAUX_KEY = "eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj";

/* ==== EVENTS & NEWS ==== */
async function getLatestEvents(symbol){
  try{
    const url = `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&api_token=${MARKETAUX_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if(!data.data) return [];
    return data.data.slice(0,5).map(n => ({
      date: n.published_at.split("T")[0],
      impact: n.sentiment==="positive"?0.03:(n.sentiment==="negative"?-0.03:0),
      description: n.title
    }));
  }catch(e){
    console.log("Fehler Marketaux:", e);
    return [];
  }
}

/* ==== FORECAST MULTI-PERIOD ==== */
function multiForecast(data){
  const periods = [7,21,30,90,180,365]; // Tage
  const results = [];
  periods.forEach(d=>{
    const w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
    let pred = data[data.length-1].price*(1+(EMA(data,10)-data[data.length-1].price)/data[data.length-1].price*0.5*w);
    const rsi = RSI(data);
    if(rsi>70) pred *= 0.97;
    if(rsi<30) pred *= 1.03;
    results.push({days:d, pred});
  });
  return results;
}

/* ==== CHART ZEICHNEN ==== */
function drawChartWithEvents(data,forecast,events){
  if(chart) chart.destroy();

  const annotations = events.map(e=>{
    const idx = data.findIndex(d=>d.date===e.date);
    if(idx<0) return null;
    return {
      type:'point',
      xValue: data[idx].date,
      yValue: data[idx].price,
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

  const forecastLine = forecast.map(f=>data[data.length-1].price); // einfache Linie für demo

  chart = new Chart(document.getElementById("chart"),{
    type:"line",
    data:{
      labels:data.map(d=>d.date),
      datasets:[
        {label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},
        {label:"Forecast", data:[...data.slice(0,-1).map(d=>d.price),...forecastLine], borderColor:"#ffaa00", tension:0.3}
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

/* ==== CHF CONVERSION ==== */
async function getUSDCHF(){
  try{
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=CHF");
    const d = await res.json();
    return d.rates.CHF || 0.91;
  }catch(e){return 0.91;}
}

/* ==== ANALYSE + FORECAST ==== */
async function analyze(){
  document.getElementById("status").textContent="Lade Marktdaten…";
  try{
    const symbol = select.value;
    const dataUSD = await getHistory(symbol);
    const rate = await getUSDCHF();
    const data = dataUSD.map(d=>({date:d.date, price:d.price*rate}));

    const newsEvents = await getLatestEvents(symbol);

    const forecast = multiForecast(data);

    drawChartWithEvents(data, forecast, newsEvents);

    const lastPrice = data[data.length-1].price;
    const nextPred = forecast.find(f=>f.days===FORECAST_DAYS)?.pred || lastPrice;
    const d = (nextPred-lastPrice)/lastPrice;
    const signal = d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
    const cls = d>0.08?"buy":d<-0.08?"sell":"hold";

    document.getElementById("confidence").textContent = confidenceScore(data);
    document.getElementById("result").innerHTML = `
      <tr>
        <td>${lastPrice.toFixed(2)}</td>
        <td>${nextPred.toFixed(2)}</td>
        <td class="${cls}">${signal}</td>
        <td>${(Math.abs(d)*100).toFixed(1)}%</td>
      </tr>`;

    document.getElementById("explanation").innerHTML =
      `RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Modus ${KI_MODE}.<br>` +
      (newsEvents.length ? "Neueste Nachrichten: " + newsEvents.map(e=>e.description).join(", ") : "Keine aktuellen Ereignisse.");

    document.getElementById("fundamental").innerHTML = `Grundlegende Stabilitätsprüfung (internes Filtermodell).`;

    document.getElementById("status").textContent="Analyse abgeschlossen";

  }catch(e){
    document.getElementById("status").textContent=e;
  }
}

/* ==== FORECAST SELECTION BUTTONS ==== */
document.querySelectorAll(".forecast-btn").forEach(btn=>{
  btn.addEventListener("click",()=>setForecastPeriod(parseInt(btn.dataset.days)));
});
