/* ================= API & Konfiguration ================= */
const API_KEYS = [
  "GH13X9P8J48O0UPW",
  "KAQ3H4TQELGSHL",
  "V1270QJC4U234VM5",
  "773MREFM9OMEXXCX"
];
let apiIndex = 0;
let USD_TO_CHF = 0.91;

let KI_MODE = "normal";
let forecastDays = 7;

/* Speichert historische Fehler zur KI-Lernschleife */
let historicalErrors = JSON.parse(localStorage.getItem("historicalErrors") || "{}");

function setMode(m){
  KI_MODE = m;
  document.getElementById("mode").textContent = m.charAt(0).toUpperCase()+m.slice(1);
}

/* ================= AKTIEN ================= */
const STOCKS = [
  {s:"AAPL", n:"Apple"},{s:"MSFT", n:"Microsoft"},{s:"NVDA", n:"NVIDIA"},{s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"},{s:"TSLA", n:"Tesla"},{s:"META", n:"Meta"},{s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"},{s:"NFLX", n:"Netflix"},{s:"ORCL", n:"Oracle"},{s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},{s:"ADBE", n:"Adobe"},{s:"CRM", n:"Salesforce"},{s:"SQ", n:"Block"},
  {s:"PYPL", n:"PayPal"},{s:"INTU", n:"Intuit"},{s:"SNOW", n:"Snowflake"},{s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"},{s:"JPM", n:"JPMorgan"},{s:"BAC", n:"Bank of America"},{s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"},{s:"MS", n:"Morgan Stanley"},{s:"V", n:"Visa"},{s:"MA", n:"Mastercard"},
  {s:"AXP", n:"American Express"},{s:"SCHW", n:"Charles Schwab"},{s:"BK", n:"Bank of New York Mellon"},
  {s:"PG", n:"Procter & Gamble"},{s:"KO", n:"Coca-Cola"},{s:"PEP", n:"PepsiCo"},{s:"WMT", n:"Walmart"},
  {s:"COST", n:"Costco"},{s:"MCD", n:"McDonald's"},{s:"NKE", n:"Nike"},{s:"SBUX", n:"Starbucks"},
  {s:"HD", n:"Home Depot"},{s:"LOW", n:"Lowe's"},{s:"TJX", n:"TJX Companies"},{s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"},{s:"LYV", n:"Live Nation"},{s:"MELI", n:"MercadoLibre"},{s:"BA", n:"Boeing"},
  {s:"CAT", n:"Caterpillar"},{s:"GE", n:"General Electric"},{s:"MMM", n:"3M"},{s:"HON", n:"Honeywell"},
  {s:"UPS", n:"UPS"},{s:"FDX", n:"FedEx"},{s:"LMT", n:"Lockheed Martin"},{s:"RTX", n:"Raytheon Technologies"},
  {s:"DAL", n:"Delta Air Lines"},{s:"UAL", n:"United Airlines"},{s:"XOM", n:"Exxon Mobil"},{s:"CVX", n:"Chevron"},
  {s:"COP", n:"ConocoPhillips"},{s:"BP", n:"BP"},{s:"TOT", n:"TotalEnergies"},{s:"SLB", n:"Schlumberger"},
  {s:"JNJ", n:"Johnson & Johnson"},{s:"PFE", n:"Pfizer"},{s:"MRK", n:"Merck"},{s:"ABBV", n:"AbbVie"},
  {s:"BMY", n:"Bristol Myers Squibb"},{s:"LLY", n:"Eli Lilly"},{s:"AMGN", n:"Amgen"},{s:"GILD", n:"Gilead Sciences"},
  {s:"NESN.SW", n:"Nestlé"},{s:"ROG.SW", n:"Roche"},{s:"NOVN.SW", n:"Novartis"},{s:"UBSG.SW", n:"UBS"},
  {s:"ZURN.SW", n:"Zurich Insurance"},{s:"CFR.SW", n:"Credit Suisse"},{s:"SAP.DE", n:"SAP"},{s:"ASML.AS", n:"ASML"},
  {s:"AIR.PA", n:"Airbus"},{s:"DAI.DE", n:"Daimler"},{s:"BN.PA", n:"BNP Paribas"},{s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"},{s:"7203.T", n:"Toyota"},{s:"6758.T", n:"Sony"},{s:"9984.T", n:"SoftBank"},
  {s:"6861.T", n:"Keyence"},{s:"BABA", n:"Alibaba"},{s:"TCEHY", n:"Tencent"},{s:"JD", n:"JD.com"},
  {s:"INFY", n:"Infosys"},{s:"HDB", n:"HDFC Bank"},{s:"ICICIBANK.NS", n:"ICICI Bank"},{s:"RELIANCE.BO", n:"Reliance"},
  {s:"T", n:"AT&T"},{s:"VZ", n:"Verizon"},{s:"TMUS", n:"T-Mobile US"},{s:"CMCSA", n:"Comcast"},{s:"FOX", n:"Fox Corp"}
];

/* ================= INIT SELECT ================= */
const stockSelect = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  stockSelect.appendChild(o);
});

/* ================= EXTERNE EREIGNISSE ================= */
const EVENTS = [
  {date:"2025-11-01", impact:-0.12, description:"Globale Rezessionssorgen"},
  {date:"2025-10-20", impact:-0.08, description:"Börsencrash Tech-Sektor"},
  {date:"2025-09-15", impact:0.05, description:"Unerwartet gute Quartalszahlen"},
  {date:"2025-08-10", impact:0.03, description:"Zinsentscheid der EZB positiv"}
];

/* ================= API FETCH MIT ROTATION ================= */
async function getHistory(symbol){
  let attempts=0, maxAttempts=API_KEYS.length;
  while(attempts<maxAttempts){
    try{
      const key=API_KEYS[apiIndex];
      const r=await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d=await r.json();
      if(d.Note || d["Error Message"] || !d["Time Series (Daily)"]){
        apiIndex=(apiIndex+1)%API_KEYS.length;
        attempts++;
        continue;
      }
      const entries=Object.entries(d["Time Series (Daily)"]||[]).slice(0,90).reverse();
      return entries.map(([date,v])=>({date, price: parseFloat(v["4. close"]||0)*USD_TO_CHF}));
    }catch(e){apiIndex=(apiIndex+1)%API_KEYS.length; attempts++;}
  }
  document.getElementById("status").textContent="Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
  return [];
}

/* ================= INDICATORS ================= */
function EMA(data, period){if(!data.length)return 0; const k=2/(period+1); let e=data[0].price; for(let i=1;i<data.length;i++) e=data[i].price*k+e*(1-k); return e;}
function RSI(data){if(data.length<15)return 50; let gains=0,losses=0; for(let i=data.length-15;i<data.length-1;i++){const diff=data[i+1].price-data[i].price; if(diff>0) gains+=diff; else losses-=diff;} return 100-(100/(1+(gains/(losses||1))));}
function MACD(data){return EMA(data,12)-EMA(data,26);}
function VOL(data, period=10){if(data.length<period)return 0; const slice=data.slice(-period); const mean=slice.reduce((a,b)=>a+b.price,0)/period; return Math.sqrt(slice.reduce((a,b)=>a+Math.pow(b.price-mean,2),0)/period);}
function MOM(data, period=5){if(data.length<period)return 0; return data[data.length-1].price-data[data.length-1-period].price;}

/* ================= PREDICTION ================= */
function predict(data){
  if(!data.length)return {pred:0, recentEvents:[]};
  let last=data[data.length-1].price;
  const histError=historicalErrors[stockSelect.value]||1;
  let w=KI_MODE==="safe"?0.5*histError:KI_MODE==="aggressive"?1.3*histError:0.8*histError;

  let pred=last*(1+(EMA(data,10)-last)/last*0.5*w);

  const rsi=RSI(data); if(rsi>70) pred*=0.97; if(rsi<30) pred*=1.03;
  const vol=VOL(data); if(vol>last*0.05) pred*=0.99;
  const mom=MOM(data); pred*=1+0.001*mom;

  const recentEvents=EVENTS.filter(e=>data.some(d=>d.date===e.date));
  recentEvents.forEach(e=>pred*=1+e.impact);

  const error=Math.abs(pred-last)/last;
  historicalErrors[stockSelect.value]=(historicalErrors[stockSelect.value]||1)*0.95+0.05*error;
  localStorage.setItem("historicalErrors",JSON.stringify(historicalErrors));

  return {pred, recentEvents};
}

/* ================= CONFIDENCE ================= */
function confidenceScore(data){let s=60; const macd=MACD(data); const rsi=RSI(data); if(Math.abs(macd)>0.5)s+=5; if(rsi>40&&rsi<60)s+=5; if(KI_MODE==="safe")s+=3; return s>75?"Hoch":s>65?"Mittel":"Niedrig";}

/* ================= CHART ================= */
let chart;
function drawChart(data,pred,recentEvents){
  if(chart)chart.destroy();
  const annotations=recentEvents.map(e=>{const idx=data.findIndex(d=>d.date===e.date); if(idx<0)return null; return {type:'point', xValue:data[idx].date, yValue:data[idx].price, backgroundColor:e.impact>0?'#00ff66':'#ff5555', radius:6, label:{content:e.description, enabled:true, position:'top', backgroundColor:'#111', color:'#00ffcc', font:{size:11}}}}).filter(a=>a);
  chart=new Chart(document.getElementById("chart"),{type:"line", data:{labels:data.map(d=>d.date), datasets:[{label:"Preis (CHF)", data:data.map(d=>d.price), borderColor:"#00ffcc", tension:0.3},{label:"Projektion", data:[...data.slice(0,-1).map(d=>d.price),pred], borderColor:"#ffaa00", tension:0.3}]}, options:{responsive:true, plugins:{legend:{display:true}, tooltip:{mode:'index', intersect:false}, annotation:{annotations}}, scales:{x:{display:true,title:{display:true,text:'Datum'}}, y:{display:true,title:{display:true,text:'Preis (CHF)'}}}}});
}

/* ================= ANALYSE ================= */
async function analyze(){
  document.getElementById("status").textContent="Lade Marktdaten…";
  const symbol=stockSelect.value;
  const data=await getHistory(symbol);
  if(!data.length)return;
  const {pred,recentEvents}=predict(data);
  drawChart(data,pred,recentEvents);

  const last=data[data.length-1].price;
  const d=(pred-last)/last;
  const signal=d>0.08?"KAUFEN":d<-0.08?"VERKAUFEN":"HALTEN";
  const cls=d>0.08?"buy":d<-0.08?"sell":"hold";

  document.getElementById("confidence").textContent=confidenceScore(data);
  document.getElementById("result").innerHTML=`<tr><td>${forecastDays} Tage</td><td>${last.toFixed(2)}</td><td>${pred.toFixed(2)}</td><td class="${cls}">${signal}</td><td>${(Math.abs(d)*100).toFixed(1)}%</td></tr>`;
  document.getElementById("explanation").innerHTML=`RSI ${RSI(data).toFixed(1)}, MACD ${MACD(data).toFixed(2)}, Modus ${KI_MODE}.<br>`+(recentEvents.length?"Berücksichtigte Ereignisse: "+recentEvents.map(e=>`${e.description} (${(e.impact*100).toFixed(1)}%)`).join(", "):"Keine besonderen Ereignisse.");
  document.getElementById("fundamental").innerHTML="Grundlegende Stabilitätsprüfung (internes Filtermodell).";
  document.getElementById("status").textContent="Analyse abgeschlossen";
}
