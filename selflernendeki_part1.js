/* ================= API KEYS ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"]; // Alphavantage
let apiIndex = 0;
const USD_TO_CHF = 0.91; // Umrechnung

/* ================= AKTIEN ================= */
const STOCKS = [
  // TECH
  {s:"AAPL", n:"Apple"},{s:"MSFT", n:"Microsoft"},{s:"NVDA", n:"NVIDIA"},{s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"},{s:"TSLA", n:"Tesla"},{s:"META", n:"Meta"},{s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"},{s:"NFLX", n:"Netflix"},{s:"ORCL", n:"Oracle"},{s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},{s:"ADBE", n:"Adobe"},{s:"CRM", n:"Salesforce"},{s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"},{s:"INTU", n:"Intuit"},{s:"SNOW", n:"Snowflake"},{s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"},
  // FINANCE
  {s:"JPM", n:"JPMorgan"},{s:"BAC", n:"Bank of America"},{s:"WFC", n:"Wells Fargo"},{s:"GS", n:"Goldman Sachs"},
  {s:"MS", n:"Morgan Stanley"},{s:"V", n:"Visa"},{s:"MA", n:"Mastercard"},{s:"AXP", n:"American Express"},
  {s:"SCHW", n:"Charles Schwab"},{s:"BK", n:"Bank of New York Mellon"},
  // CONSUMER
  {s:"PG", n:"Procter & Gamble"},{s:"KO", n:"Coca-Cola"},{s:"PEP", n:"PepsiCo"},{s:"WMT", n:"Walmart"},
  {s:"COST", n:"Costco"},{s:"MCD", n:"McDonald's"},{s:"NKE", n:"Nike"},{s:"SBUX", n:"Starbucks"},
  {s:"HD", n:"Home Depot"},{s:"LOW", n:"Lowe's"},{s:"TJX", n:"TJX Companies"},{s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"},{s:"LYV", n:"Live Nation"},{s:"MELI", n:"MercadoLibre"},
  // INDUSTRY
  {s:"BA", n:"Boeing"},{s:"CAT", n:"Caterpillar"},{s:"GE", n:"General Electric"},{s:"MMM", n:"3M"},
  {s:"HON", n:"Honeywell"},{s:"UPS", n:"UPS"},{s:"FDX", n:"FedEx"},{s:"LMT", n:"Lockheed Martin"},
  {s:"RTX", n:"Raytheon Technologies"},{s:"DAL", n:"Delta Air Lines"},{s:"UAL", n:"United Airlines"},
  // ENERGY
  {s:"XOM", n:"Exxon Mobil"},{s:"CVX", n:"Chevron"},{s:"COP", n:"ConocoPhillips"},{s:"BP", n:"BP"},
  {s:"TOT", n:"TotalEnergies"},{s:"SLB", n:"Schlumberger"},
  // HEALTHCARE
  {s:"JNJ", n:"Johnson & Johnson"},{s:"PFE", n:"Pfizer"},{s:"MRK", n:"Merck"},{s:"ABBV", n:"AbbVie"},
  {s:"BMY", n:"Bristol Myers Squibb"},{s:"LLY", n:"Eli Lilly"},{s:"AMGN", n:"Amgen"},{s:"GILD", n:"Gilead Sciences"},
  // SWITZERLAND
  {s:"NESN.SW", n:"Nestlé"},{s:"ROG.SW", n:"Roche"},{s:"NOVN.SW", n:"Novartis"},{s:"UBSG.SW", n:"UBS"},
  {s:"ZURN.SW", n:"Zurich Insurance"},{s:"CFR.SW", n:"Credit Suisse"},  
  // EUROPA
  {s:"SAP.DE", n:"SAP"},{s:"ASML.AS", n:"ASML Holding"},{s:"AIR.PA", n:"Airbus"},{s:"DAI.DE", n:"Daimler"},
  {s:"BN.PA", n:"BNP Paribas"},{s:"SIE.DE", n:"Siemens"},{s:"ENGI.PA", n:"Engie"},
  // JAPAN
  {s:"7203.T", n:"Toyota"},{s:"6758.T", n:"Sony"},{s:"9984.T", n:"SoftBank"},{s:"6861.T", n:"Keyence"},
  // EMERGING MARKETS
  {s:"BABA", n:"Alibaba"},{s:"TCEHY", n:"Tencent"},{s:"JD", n:"JD.com"},{s:"INFY", n:"Infosys"},
  {s:"HDB", n:"HDFC Bank"},{s:"ICICIBANK.NS", n:"ICICI Bank"},{s:"RELIANCE.BO", n:"Reliance Industries"},
  // MISC / TELECOM / MEDIA
  {s:"T", n:"AT&T"},{s:"VZ", n:"Verizon"},{s:"TMUS", n:"T-Mobile US"},{s:"CMCSA", n:"Comcast"},{s:"FOX", n:"Fox Corp"}
];

/* ================= SELECT-FÜLLEN ================= */
const select = document.getElementById("stockSelect");
STOCKS.forEach(a=>{
  const o=document.createElement("option");
  o.value=a.s;
  o.textContent=`${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ================= API ABFRAGE ================= */
async function getHistory(symbol){
    let key = API_KEYS[apiIndex];
    try {
        const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
        const d = await r.json();
        if(d.Note || d["Error Message"]){
            apiIndex = (apiIndex+1) % API_KEYS.length;
            throw "API-Limit erreicht – bitte 60 Sekunden warten";
        }
        return Object.entries(d["Time Series (Daily)"])
            .slice(0,90)
            .reverse()
            .map(([date,v])=>({date,price:parseFloat(v["4. close"])*USD_TO_CHF}));
    } catch(e){
        throw e;
    }
}
