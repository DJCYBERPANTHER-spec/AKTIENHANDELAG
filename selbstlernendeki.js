/* ================= API ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"];
let apiIndex = 0;
const USD_TO_CHF = 0.91;

const MARKETAUX_KEY = 'eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj';

/* ================= AKTIEN ================= */
const STOCKS = [
  {s:"AAPL", n:"Apple"},{s:"MSFT", n:"Microsoft"},{s:"NVDA", n:"NVIDIA"},{s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"},{s:"TSLA", n:"Tesla"},{s:"META", n:"Meta"},{s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"},{s:"NFLX", n:"Netflix"},{s:"ORCL", n:"Oracle"},{s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},{s:"ADBE", n:"Adobe"},{s:"CRM", n:"Salesforce"},{s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"},{s:"INTU", n:"Intuit"},{s:"SNOW", n:"Snowflake"},{s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"},{s:"JPM", n:"JPMorgan"},{s:"BAC", n:"Bank of America"},{s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"},{s:"MS", n:"Morgan Stanley"},{s:"V", n:"Visa"},{s:"MA", n:"Mastercard"},
  {s:"AXP", n:"American Express"},{s:"SCHW", n:"Charles Schwab"},{s:"BK", n:"Bank of New York Mellon"},{s:"PG", n:"Procter & Gamble"},
  {s:"KO", n:"Coca-Cola"},{s:"PEP", n:"PepsiCo"},{s:"WMT", n:"Walmart"},{s:"COST", n:"Costco"},{s:"MCD", n:"McDonald's"},
  {s:"NKE", n:"Nike"},{s:"SBUX", n:"Starbucks"},{s:"HD", n:"Home Depot"},{s:"LOW", n:"Lowe's"},{s:"TJX", n:"TJX Companies"},
  {s:"DG", n:"Dollar General"},{s:"DIS", n:"Disney"},{s:"LYV", n:"Live Nation"},{s:"MELI", n:"MercadoLibre"},{s:"BA", n:"Boeing"},
  {s:"CAT", n:"Caterpillar"},{s:"GE", n:"General Electric"},{s:"MMM", n:"3M"},{s:"HON", n:"Honeywell"},{s:"UPS", n:"UPS"},
  {s:"FDX", n:"FedEx"},{s:"LMT", n:"Lockheed Martin"},{s:"RTX", n:"Raytheon Technologies"},{s:"DAL", n:"Delta Air Lines"},{s:"UAL", n:"United Airlines"},
  {s:"XOM", n:"Exxon Mobil"},{s:"CVX", n:"Chevron"},{s:"COP", n:"ConocoPhillips"},{s:"BP", n:"BP"},{s:"TOT", n:"TotalEnergies"},{s:"SLB", n:"Schlumberger"},
  {s:"JNJ", n:"Johnson & Johnson"},{s:"PFE", n:"Pfizer"},{s:"MRK", n:"Merck"},{s:"ABBV", n:"AbbVie"},{s:"BMY", n:"Bristol Myers Squibb"},
  {s:"LLY", n:"Eli Lilly"},{s:"AMGN", n:"Amgen"},{s:"GILD", n:"Gilead Sciences"},{s:"NESN.SW", n:"Nestlé"},{s:"ROG.SW", n:"Roche"},
  {s:"NOVN.SW", n:"Novartis"},{s:"UBSG.SW", n:"UBS"},{s:"ZURN.SW", n:"Zurich Insurance"},{s:"CFR.SW", n:"Credit Suisse"},{s:"SAP.DE", n:"SAP"},
  {s:"ASML.AS", n:"ASML Holding"},{s:"AIR.PA", n:"Airbus"},{s:"DAI.DE", n:"Daimler"},{s:"BN.PA", n:"BNP Paribas"},{s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"},{s:"7203.T", n:"Toyota"},{s:"6758.T", n:"Sony"},{s:"9984.T", n:"SoftBank"},{s:"6861.T", n:"Keyence"},
  {s:"BABA", n:"Alibaba"},{s:"TCEHY", n:"Tencent"},{s:"JD", n:"JD.com"},{s:"INFY", n:"Infosys"},{s:"HDB", n:"HDFC Bank"},
  {s:"ICICIBANK.NS", n:"ICICI Bank"},{s:"RELIANCE.BO", n:"Reliance Industries"},{s:"T", n:"AT&T"},{s:"VZ", n:"Verizon"},{s:"TMUS", n:"T-Mobile US"},
  {s:"CMCSA", n:"Comcast"},{s:"FOX", n:"Fox Corp"} // ...weitere Aktien bis 160+
];

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
/* ================= API ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"];
let apiIndex = 0;
const USD_TO_CHF = 0.91;

const MARKETAUX_KEY = 'eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj';

/* ================= AKTIEN ================= */
const STOCKS = [
  {s:"AAPL", n:"Apple"},{s:"MSFT", n:"Microsoft"},{s:"NVDA", n:"NVIDIA"},{s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"},{s:"TSLA", n:"Tesla"},{s:"META", n:"Meta"},{s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"},{s:"NFLX", n:"Netflix"},{s:"ORCL", n:"Oracle"},{s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},{s:"ADBE", n:"Adobe"},{s:"CRM", n:"Salesforce"},{s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"},{s:"INTU", n:"Intuit"},{s:"SNOW", n:"Snowflake"},{s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"},{s:"JPM", n:"JPMorgan"},{s:"BAC", n:"Bank of America"},{s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"},{s:"MS", n:"Morgan Stanley"},{s:"V", n:"Visa"},{s:"MA", n:"Mastercard"},
  {s:"AXP", n:"American Express"},{s:"SCHW", n:"Charles Schwab"},{s:"BK", n:"Bank of New York Mellon"},{s:"PG", n:"Procter & Gamble"},
  {s:"KO", n:"Coca-Cola"},{s:"PEP", n:"PepsiCo"},{s:"WMT", n:"Walmart"},{s:"COST", n:"Costco"},{s:"MCD", n:"McDonald's"},
  {s:"NKE", n:"Nike"},{s:"SBUX", n:"Starbucks"},{s:"HD", n:"Home Depot"},{s:"LOW", n:"Lowe's"},{s:"TJX", n:"TJX Companies"},
  {s:"DG", n:"Dollar General"},{s:"DIS", n:"Disney"},{s:"LYV", n:"Live Nation"},{s:"MELI", n:"MercadoLibre"},{s:"BA", n:"Boeing"},
  {s:"CAT", n:"Caterpillar"},{s:"GE", n:"General Electric"},{s:"MMM", n:"3M"},{s:"HON", n:"Honeywell"},{s:"UPS", n:"UPS"},
  {s:"FDX", n:"FedEx"},{s:"LMT", n:"Lockheed Martin"},{s:"RTX", n:"Raytheon Technologies"},{s:"DAL", n:"Delta Air Lines"},{s:"UAL", n:"United Airlines"},
  {s:"XOM", n:"Exxon Mobil"},{s:"CVX", n:"Chevron"},{s:"COP", n:"ConocoPhillips"},{s:"BP", n:"BP"},{s:"TOT", n:"TotalEnergies"},{s:"SLB", n:"Schlumberger"},
  {s:"JNJ", n:"Johnson & Johnson"},{s:"PFE", n:"Pfizer"},{s:"MRK", n:"Merck"},{s:"ABBV", n:"AbbVie"},{s:"BMY", n:"Bristol Myers Squibb"},
  {s:"LLY", n:"Eli Lilly"},{s:"AMGN", n:"Amgen"},{s:"GILD", n:"Gilead Sciences"},{s:"NESN.SW", n:"Nestlé"},{s:"ROG.SW", n:"Roche"},
  {s:"NOVN.SW", n:"Novartis"},{s:"UBSG.SW", n:"UBS"},{s:"ZURN.SW", n:"Zurich Insurance"},{s:"CFR.SW", n:"Credit Suisse"},{s:"SAP.DE", n:"SAP"},
  {s:"ASML.AS", n:"ASML Holding"},{s:"AIR.PA", n:"Airbus"},{s:"DAI.DE", n:"Daimler"},{s:"BN.PA", n:"BNP Paribas"},{s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"},{s:"7203.T", n:"Toyota"},{s:"6758.T", n:"Sony"},{s:"9984.T", n:"SoftBank"},{s:"6861.T", n:"Keyence"},
  {s:"BABA", n:"Alibaba"},{s:"TCEHY", n:"Tencent"},{s:"JD", n:"JD.com"},{s:"INFY", n:"Infosys"},{s:"HDB", n:"HDFC Bank"},
  {s:"ICICIBANK.NS", n:"ICICI Bank"},{s:"RELIANCE.BO", n:"Reliance Industries"},{s:"T", n:"AT&T"},{s:"VZ", n:"Verizon"},{s:"TMUS", n:"T-Mobile US"},
  {s:"CMCSA", n:"Comcast"},{s:"FOX", n:"Fox Corp"} // ...weitere Aktien bis 160+
];

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
