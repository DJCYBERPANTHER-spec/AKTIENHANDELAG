/* ================= API KEYS ================= */
const API_KEYS = ["GH13X9P8J48O0UPW","KAQ3H4TQELGSHL"];
let apiIndex = 0;
const USD_TO_CHF = 0.91;

/* ================= TAGESLIMIT ================= */
const MAX_PROGNOSEN_PRO_TAG = 100;
const today = new Date().toISOString().split('T')[0];
let prognosenHeute = parseInt(localStorage.getItem('prognosen_' + today)) || 0;

/* ================= AKTIENLISTE (Teil 1) ================= */
const STOCKS = [
  // ===== TECH =====
  {s:"AAPL", n:"Apple"},
  {s:"MSFT", n:"Microsoft"},
  {s:"NVDA", n:"NVIDIA"},
  {s:"AMD", n:"AMD"},
  {s:"INTC", n:"Intel"},
  {s:"TSLA", n:"Tesla"},
  {s:"META", n:"Meta"},
  {s:"GOOGL", n:"Alphabet"},
  {s:"AMZN", n:"Amazon"},
  {s:"NFLX", n:"Netflix"},
  {s:"ORCL", n:"Oracle"},
  {s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},
  {s:"ADBE", n:"Adobe"},
  {s:"CRM", n:"Salesforce"},
  {s:"SQ", n:"Block, Inc. (Square)"},
  {s:"PYPL", n:"PayPal"},
  {s:"INTU", n:"Intuit"},
  {s:"SNOW", n:"Snowflake"},
  {s:"ADSK", n:"Autodesk"},
  {s:"NOW", n:"ServiceNow"},

  // ===== FINANCE =====
  {s:"JPM", n:"JPMorgan"},
  {s:"BAC", n:"Bank of America"},
  {s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"},
  {s:"MS", n:"Morgan Stanley"},
  {s:"V", n:"Visa"},
  {s:"MA", n:"Mastercard"},
  {s:"AXP", n:"American Express"},
  {s:"SCHW", n:"Charles Schwab"},
  {s:"BK", n:"Bank of New York Mellon"},

  // ===== CONSUMER =====
  {s:"PG", n:"Procter & Gamble"},
  {s:"KO", n:"Coca-Cola"},
  {s:"PEP", n:"PepsiCo"},
  {s:"WMT", n:"Walmart"},
  {s:"COST", n:"Costco"},
  {s:"MCD", n:"McDonald's"},
  {s:"NKE", n:"Nike"},
  {s:"SBUX", n:"Starbucks"},
  {s:"HD", n:"Home Depot"},
  {s:"LOW", n:"Lowe's"},
  {s:"TJX", n:"TJX Companies"},
  {s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"},
  {s:"LYV", n:"Live Nation"},
  {s:"MELI", n:"MercadoLibre"},

  // ===== INDUSTRY =====
  {s:"BA", n:"Boeing"},
  {s:"CAT", n:"Caterpillar"},
  {s:"GE", n:"General Electric"},
  {s:"MMM", n:"3M"},
  {s:"HON", n:"Honeywell"},
  {s:"UPS", n:"UPS"},
  {s:"FDX", n:"FedEx"},
  {s:"LMT", n:"Lockheed Martin"},
  {s:"RTX", n:"Raytheon Technologies"},
  {s:"DAL", n:"Delta Air Lines"},
  {s:"UAL", n:"United Airlines"},
];
/* ================= AKTIENLISTE (Teil 2) ================= */
STOCKS.push(
  // ===== ENERGY =====
  {s:"XOM", n:"Exxon Mobil"},
  {s:"CVX", n:"Chevron"},
  {s:"COP", n:"ConocoPhillips"},
  {s:"BP", n:"BP"},
  {s:"TOT", n:"TotalEnergies"},
  {s:"SLB", n:"Schlumberger"},

  // ===== HEALTHCARE =====
  {s:"JNJ", n:"Johnson & Johnson"},
  {s:"PFE", n:"Pfizer"},
  {s:"MRK", n:"Merck"},
  {s:"ABBV", n:"AbbVie"},
  {s:"BMY", n:"Bristol Myers Squibb"},
  {s:"LLY", n:"Eli Lilly"},
  {s:"AMGN", n:"Amgen"},
  {s:"GILD", n:"Gilead Sciences"},

  // ===== SWITZERLAND =====
  {s:"NESN.SW", n:"Nestlé"},
  {s:"ROG.SW", n:"Roche"},
  {s:"NOVN.SW", n:"Novartis"},
  {s:"UBSG.SW", n:"UBS"},
  {s:"ZURN.SW", n:"Zurich Insurance"},
  {s:"CFR.SW", n:"Credit Suisse"},

  // ===== EUROPA =====
  {s:"SAP.DE", n:"SAP"},
  {s:"ASML.AS", n:"ASML Holding"},
  {s:"AIR.PA", n:"Airbus"},
  {s:"DAI.DE", n:"Daimler"},
  {s:"BN.PA", n:"BNP Paribas"},
  {s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"},

  // ===== JAPAN =====
  {s:"7203.T", n:"Toyota"},
  {s:"6758.T", n:"Sony"},
  {s:"9984.T", n:"SoftBank"},
  {s:"6861.T", n:"Keyence"},

  // ===== EMERGING MARKETS =====
  {s:"BABA", n:"Alibaba"},
  {s:"TCEHY", n:"Tencent"},
  {s:"JD", n:"JD.com"},
  {s:"INFY", n:"Infosys"},
  {s:"HDB", n:"HDFC Bank"},
  {s:"ICICIBANK.NS", n:"ICICI Bank"},
  {s:"RELIANCE.BO", n:"Reliance Industries"},

  // ===== TELECOM / MEDIA =====
  {s:"T", n:"AT&T"},
  {s:"VZ", n:"Verizon"},
  {s:"TMUS", n:"T-Mobile US"},
  {s:"CMCSA", n:"Comcast"},
  {s:"FOX", n:"Fox Corp"}
);

/* ================= SELECT BOX ================= */
const select = document.getElementById("stockSelect");
STOCKS.forEach(a => {
  const o = document.createElement("option");
  o.value = a.s;
  o.textContent = `${a.s} – ${a.n}`;
  select.appendChild(o);
});

/* ================= ZEITRAUM ================= */
const TIMEFRAMES = {
  "1W": 7,
  "3W": 21,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1J": 365
};
let selectedTimeframe = "1M";

/* ================= MODE ================= */
let KI_MODE = "normal";
function setMode(m) {
  KI_MODE = m;
  document.getElementById("mode").textContent = m.charAt(0).toUpperCase() + m.slice(1);
}

/* ================= API FETCH ================= */
async function getHistory(symbol) {
  const key = API_KEYS[apiIndex];
  try {
    const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
    const d = await r.json();
    if (d.Note || d["Error Message"]) throw "API-Limit erreicht";
    const entries = Object.entries(d["Time Series (Daily)"] || {});
    return entries.slice(0, 365).reverse().map(([date, v]) => ({
      date,
      price: parseFloat(v["4. close"]) * USD_TO_CHF
    }));
  } catch {
    apiIndex = (apiIndex + 1) % API_KEYS.length;
    throw "API Key gewechselt, bitte erneut versuchen";
  }
}

/* ================= INDICATORS ================= */
function EMA(data, period) {
  const k = 2 / (period + 1);
  let e = data[0].price;
  for (let i = 1; i < data.length; i++) e = data[i].price * k + e * (1 - k);
  return e;
}
function RSI(data) {
  let gains = 0, losses = 0;
  for (let i = data.length - 15; i < data.length - 1; i++) {
    const diff = data[i + 1].price - data[i].price;
    if (diff > 0) gains += diff; else losses -= diff;
  }
  return 100 - (100 / (1 + (gains / (losses || 1))));
}
function MACD(data) {
  return EMA(data, 12) - EMA(data, 26);
}

/* ================= PREDICTION ================= */
function predict(data, daysAhead) {
  const last = data[data.length - 1].price;
  let w = KI_MODE === "safe" ? 0.5 : KI_MODE === "aggressive" ? 1.3 : 0.8;
  let pred = last * (1 + (EMA(data, 10) - last) / last * 0.5 * w);

  const rsi = RSI(data);
  if (rsi > 70) pred *= 0.97;
  if (rsi < 30) pred *= 1.03;

  // Simple linear projection für die Tage
  pred = pred * (1 + (pred - last) / last * (daysAhead / 30));
  return pred;
}

/* ================= CHART ================= */
let chart;
function drawChart(data, pred) {
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: data.map(d => d.date).concat(["Prognose"]),
      datasets: [
        { label: "Preis (CHF)", data: data.map(d => d.price), borderColor: "#00ffcc", tension: 0.3 },
        { label: "Prognose", data: [...data.slice(0, -1).map(d => d.price), pred], borderColor: "#ffaa00", tension: 0.3 }
      ]
    },
    options: { responsive: true }
  });
}

/* ================= ANALYSE ================= */
async function analyze() {
  if (prognosenHeute >= MAX_PROGNOSEN_PRO_TAG) {
    document.getElementById("status").textContent = "Tageslimit erreicht (max 100 Prognosen)";
    return;
  }

  document.getElementById("status").textContent = "Lade Marktdaten…";
  try {
    const data = await getHistory(select.value);
    const daysAhead = TIMEFRAMES[selectedTimeframe] || 30;
    const pred = predict(data, daysAhead);

    drawChart(data, pred);

    const last = data[data.length - 1].price;
    const d = (pred - last) / last;
    const signal = d > 0.08 ? "KAUFEN" : d < -0.08 ? "VERKAUFEN" : "HALTEN";
    const cls = d > 0.08 ? "buy" : d < -0.08 ? "sell" : "hold";

    document.getElementById("confidence").textContent = "Hoch"; // Placeholder
    document.getElementById("result").innerHTML = `
      <tr>
        <td>${last.toFixed(2)}</td>
        <td>${pred.toFixed(2)}</td>
        <td class="${cls}">${signal}</td>
        <td>${(Math.abs(d) * 100).toFixed(1)}%</td>
      </tr>`;

    document.getElementById("status").textContent = "Analyse abgeschlossen";

    // Tageslimit erhöhen
    prognosenHeute++;
    localStorage.setItem('prognosen_' + today, prognosenHeute);
  } catch (e) {
    document.getElementById("status").textContent = e;
  }
}

/* ================= ZEITRAUMAUSWAHL ================= */
function setTimeframe(tf) {
  selectedTimeframe = tf;
  document.getElementById("status").textContent = `Zeitraum: ${tf}`;
}
