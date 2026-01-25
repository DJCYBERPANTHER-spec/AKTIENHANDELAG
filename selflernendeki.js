/* ======================== SELBSTLERNENDE KI ======================== */

/* ================= API ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL","V1270QJC4U234VM5","773MREFM9OMEXXCX"];
let apiIndex = 0;
const USD_TO_CHF = 0.91; // Umrechnung USD → CHF

/* ================= TAGESLIMIT ================= */
const MAX_PROGNOSEN_PRO_TAG = 100;
const today = new Date().toISOString().slice(0,10);
let prognosen = JSON.parse(localStorage.getItem("prognosen")) || {};
if(prognosen.date !== today) prognosen = {date: today, count:0};

/* ================= AKTIEN ================= */
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
  {s:"T", n:"AT&T"}, {s:"VZ", n:"Verizon"}, {s:"TMUS", n:"T-Mobile US"}, {s:"CMCSA", n:"Comcast"}, {s:"FOX", n:"Fox Corp"},
  // … füge weitere Aktien hier hinzu, bis 160+
];

/* ================= MODUS ================= */
let KI_MODE = "normal";
function setMode(m){
  KI_MODE = m;
  document.getElementById("mode").textContent = m.charAt(0).toUpperCase()+m.slice(1);
}

/* ================= API FETCH ================= */
async function getHistory(symbol){
  let attempt = 0;
  while(attempt < API_KEYS.length){
    const key = API_KEYS[apiIndex];
    try{
      const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
      const d = await r.json();
      if(d["Time Series (Daily)"]){
        return Object.entries(d["Time Series (Daily)"])
          .slice(0,365)
          .reverse()
          .map(([date,v])=>({date, price:parseFloat(v["4. close"])*USD_TO_CHF}));
      } else {
        apiIndex = (apiIndex+1) % API_KEYS.length;
        attempt++;
      }
    } catch(e){
      apiIndex = (apiIndex+1) % API_KEYS.length;
      attempt++;
    }
  }
  throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
}

/* ================= INDICATORS ================= */
function EMA(data, period){
  const k = 2/(period+1);
  let e = data[0].price;
  for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
  return e;
}
function RSI(data){
  let gains=0, losses=0;
  for(let i=data.length-15;i<data.length-1;i++){
    const diff = data[i+1].price - data[i].price;
    if(diff>0) gains+=diff; else losses-=diff;
  }
  return 100-(100/(1+(gains/(losses||1))));
}
function MACD(data){ return EMA(data,12)-EMA(data,26); }

/* ================= PREDICTION ================= */
function predict(data, futureDays=7){
  let last = data[data.length-1].price;
  let w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
  let pred = last*(1+(EMA(data,10)-last)/last*0.5*w);

  const rsi = RSI(data);
  if(rsi>70) pred *= 0.97;
  if(rsi<30) pred *= 1.03;

  // Simulierte Ereignisse für Zukunft
  const futurePredictions = Array(futureDays).fill(0).map((_,i)=>{
    const change = (Math.random()-0.5)*0.02*w;
    last = last*(1+change);
    return {day:i+1, price:last};
  });

  return {pred, futurePredictions};
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

/* ================= PROGNOSEN-LIMIT ================= */
function checkPrognosenLimit(){
  if(prognosen.count >= MAX_PROGNOSEN_PRO_TAG){
    throw `Tageslimit erreicht (${MAX_PROGNOSEN_PRO_TAG} Prognosen)`;
  } else {
    prognosen.count++;
    localStorage.setItem("prognosen", JSON.stringify(prognosen));
  }
}
