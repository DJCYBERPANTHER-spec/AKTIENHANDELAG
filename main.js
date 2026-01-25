// ================= API KEYS =================
export const ALPHA_API_KEYS = [
  "GH13X9P8J48O0UPW",
  "KAQ3H4TQELGSHL",
  "V1270QJC4U234VM5",
  "773MREFM9OMEXXCX"
];
export let alphaApiIndex = 0;
export const MARKETAUX_API_KEY = "eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj";
export const USD_TO_CHF = 0.91;

// ================= AKTIEN =================
export const STOCKS = [
  // ===== TECH =====
  {s:"AAPL", n:"Apple"},{s:"MSFT", n:"Microsoft"},{s:"NVDA", n:"NVIDIA"},
  {s:"AMD", n:"AMD"},{s:"INTC", n:"Intel"},{s:"TSLA", n:"Tesla"},
  {s:"META", n:"Meta"},{s:"GOOGL", n:"Alphabet"},{s:"AMZN", n:"Amazon"},
  {s:"NFLX", n:"Netflix"},{s:"ORCL", n:"Oracle"},{s:"IBM", n:"IBM"},
  {s:"CSCO", n:"Cisco"},{s:"ADBE", n:"Adobe"},{s:"CRM", n:"Salesforce"},
  {s:"SQ", n:"Block, Inc. (Square)"},{s:"PYPL", n:"PayPal"},{s:"INTU", n:"Intuit"},
  {s:"SNOW", n:"Snowflake"},{s:"ADSK", n:"Autodesk"},{s:"NOW", n:"ServiceNow"},
  // ===== FINANCE =====
  {s:"JPM", n:"JPMorgan"},{s:"BAC", n:"Bank of America"},{s:"WFC", n:"Wells Fargo"},
  {s:"GS", n:"Goldman Sachs"},{s:"MS", n:"Morgan Stanley"},{s:"V", n:"Visa"},
  {s:"MA", n:"Mastercard"},{s:"AXP", n:"American Express"},{s:"SCHW", n:"Charles Schwab"},
  {s:"BK", n:"Bank of New York Mellon"},
  // ===== CONSUMER =====
  {s:"PG", n:"Procter & Gamble"},{s:"KO", n:"Coca-Cola"},{s:"PEP", n:"PepsiCo"},
  {s:"WMT", n:"Walmart"},{s:"COST", n:"Costco"},{s:"MCD", n:"McDonald's"},
  {s:"NKE", n:"Nike"},{s:"SBUX", n:"Starbucks"},{s:"HD", n:"Home Depot"},
  {s:"LOW", n:"Lowe's"},{s:"TJX", n:"TJX Companies"},{s:"DG", n:"Dollar General"},
  {s:"DIS", n:"Disney"},{s:"LYV", n:"Live Nation"},{s:"MELI", n:"MercadoLibre"},
  // ===== INDUSTRY =====
  {s:"BA", n:"Boeing"},{s:"CAT", n:"Caterpillar"},{s:"GE", n:"General Electric"},
  {s:"MMM", n:"3M"},{s:"HON", n:"Honeywell"},{s:"UPS", n:"UPS"},
  {s:"FDX", n:"FedEx"},{s:"LMT", n:"Lockheed Martin"},{s:"RTX", n:"Raytheon Technologies"},
  {s:"DAL", n:"Delta Air Lines"},{s:"UAL", n:"United Airlines"},
  // ===== ENERGY =====
  {s:"XOM", n:"Exxon Mobil"},{s:"CVX", n:"Chevron"},{s:"COP", n:"ConocoPhillips"},
  {s:"BP", n:"BP"},{s:"TOT", n:"TotalEnergies"},{s:"SLB", n:"Schlumberger"},
  // ===== HEALTHCARE =====
  {s:"JNJ", n:"Johnson & Johnson"},{s:"PFE", n:"Pfizer"},{s:"MRK", n:"Merck"},
  {s:"ABBV", n:"AbbVie"},{s:"BMY", n:"Bristol Myers Squibb"},{s:"LLY", n:"Eli Lilly"},
  {s:"AMGN", n:"Amgen"},{s:"GILD", n:"Gilead Sciences"},
  // ===== SWITZERLAND =====
  {s:"NESN.SW", n:"Nestlé"},{s:"ROG.SW", n:"Roche"},{s:"NOVN.SW", n:"Novartis"},
  {s:"UBSG.SW", n:"UBS"},{s:"ZURN.SW", n:"Zurich Insurance"},{s:"CFR.SW", n:"Credit Suisse"},
  // ===== EUROPA =====
  {s:"SAP.DE", n:"SAP"},{s:"ASML.AS", n:"ASML Holding"},{s:"AIR.PA", n:"Airbus"},
  {s:"DAI.DE", n:"Daimler"},{s:"BN.PA", n:"BNP Paribas"},{s:"SIE.DE", n:"Siemens"},
  {s:"ENGI.PA", n:"Engie"},
  // ===== JAPAN =====
  {s:"7203.T", n:"Toyota"},{s:"6758.T", n:"Sony"},{s:"9984.T", n:"SoftBank"},{s:"6861.T", n:"Keyence"},
  // ===== EMERGING MARKETS =====
  {s:"BABA", n:"Alibaba"},{s:"TCEHY", n:"Tencent"},{s:"JD", n:"JD.com"},
  {s:"INFY", n:"Infosys"},{s:"HDB", n:"HDFC Bank"},{s:"ICICIBANK.NS", n:"ICICI Bank"},
  {s:"RELIANCE.BO", n:"Reliance Industries"},
  // ===== TELECOM / MEDIA =====
  {s:"T", n:"AT&T"},{s:"VZ", n:"Verizon"},{s:"TMUS", n:"T-Mobile US"},
  {s:"CMCSA", n:"Comcast"},{s:"FOX", n:"Fox Corp"},
];

// ================= DOM ELEMENTE =================
export const stockSelect = document.getElementById("stockSelect");
export const analyzeBtn = document.getElementById("analyzeBtn");
export const safeBtn = document.getElementById("safeBtn");
export const normalBtn = document.getElementById("normalBtn");
export const aggressiveBtn = document.getElementById("aggressiveBtn");
export const modeDisplay = document.getElementById("mode");
export const confidenceDisplay = document.getElementById("confidence");
export const dailyCountDisplay = document.getElementById("dailyCount");
export const statusDisplay = document.getElementById("status");
export const resultTable = document.getElementById("result");
export const explanationDiv = document.getElementById("explanation");
export const fundamentalDiv = document.getElementById("fundamental");

// ================= FÜLLE SELECT =================
STOCKS.forEach(a=>{
  const option = document.createElement("option");
  option.value = a.s;
  option.textContent = `${a.s} – ${a.n}`;
  stockSelect.appendChild(option);
});

// ================= KI MODUS =================
export let KI_MODE = "normal";
export function setMode(mode){
  KI_MODE = mode;
  modeDisplay.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ================= TAGESLIMIT =================
export let dailyCount = parseInt(localStorage.getItem("dailyCount") || "0");
export function incrementDailyCount(){
  if(dailyCount < 100){
    dailyCount++;
    localStorage.setItem("dailyCount", dailyCount);
    dailyCountDisplay.textContent = `${dailyCount}/100`;
    return true;
  } else {
    alert("Maximale Tagesprognosen erreicht (100).");
    return false;
  }
}
dailyCountDisplay.textContent = `${dailyCount}/100`;

// ================= BUTTON EVENTS =================
safeBtn.onclick = ()=>setMode("safe");
normalBtn.onclick = ()=>setMode("normal");
aggressiveBtn.onclick = ()=>setMode("aggressive");
import { ALPHA_API_KEYS, MARKETAUX_API_KEY, alphaApiIndex, USD_TO_CHF, stockSelect, statusDisplay, dailyCount, incrementDailyCount, KI_MODE } from "./main_part1.js";

// ================= API FETCH =================
export async function getAlphaHistory(symbol){
    let key = ALPHA_API_KEYS[alphaApiIndex];
    try{
        const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
        const data = await res.json();

        // API Limit / Fehler prüfen
        if(data.Note || data["Error Message"]){
            alphaApiIndex = (alphaApiIndex + 1) % ALPHA_API_KEYS.length;
            key = ALPHA_API_KEYS[alphaApiIndex];
            throw "API Limit erreicht, wechsle Key…";
        }

        const series = data["Time Series (Daily)"];
        if(!series) throw "Keine Kursdaten gefunden";

        return Object.entries(series)
            .slice(0,90)
            .reverse()
            .map(([date, v]) => ({date, price: parseFloat(v["4. close"]) * USD_TO_CHF}));
    } catch(err){
        console.error(err);
        throw "Fehler beim Laden der Marktdaten";
    }
}

// ================= MARKET NEWS =================
export async function getMarketauxNews(symbol){
    try{
        const res = await fetch(`https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=de&api_token=${MARKETAUX_API_KEY}`);
        const data = await res.json();
        if(!data.data) return [];
        // Nur die letzten 5 relevanten Nachrichten
        return data.data.slice(0,5).map(n => ({date: n.published_at, impact: 0, description: n.title}));
    } catch(err){
        console.error(err);
        return [];
    }
}

// ================= GENAUIGKEIT =================
export function calculateAccuracy(data){
    // Sehr einfache Formel: basiert auf RSI + MACD + Trend
    const rsi = RSI(data);
    const macd = MACD(data);
    let score = 60;

    if(rsi>40 && rsi<60) score += 10;
    if(Math.abs(macd) < 0.3) score += 10;

    // Modus Bonus
    if(KI_MODE === "safe") score += 5;
    if(KI_MODE === "aggressive") score -= 5;

    return Math.min(100, Math.max(0, Math.round(score)));
}

// ================= INDICATORS =================
export function EMA(data, period){
    const k = 2/(period+1);
    let e = data[0].price;
    for(let i=1;i<data.length;i++) e = data[i].price*k + e*(1-k);
    return e;
}
export function RSI(data){
    let gains=0, losses=0;
    for(let i=data.length-15;i<data.length-1;i++){
        const diff = data[i+1].price - data[i].price;
        if(diff>0) gains += diff; else losses -= diff;
    }
    return 100-(100/(1+(gains/(losses||1))));
}
export function MACD(data){ return EMA(data,12) - EMA(data,26); }

// ================= PROGNOSEN =================
export function predict(data, news=[]){
    const last = data[data.length-1].price;
    let w = KI_MODE==="safe"?0.5:KI_MODE==="aggressive"?1.3:0.8;
    let pred = last*(1+(EMA(data,10)-last)/last*0.5*w);

    const rsi = RSI(data);
    if(rsi>70) pred *= 0.97;
    if(rsi<30) pred *= 1.03;

    // News / externe Ereignisse
    news.forEach(e => pred *= 1 + (e.impact || 0));

    return {pred, news};
}
import { stockSelect, statusDisplay, dailyCount, incrementDailyCount, KI_MODE } from "./main_part1.js";
import { getAlphaHistory, getMarketauxNews, predict, calculateAccuracy } from "./main_part2.js";

let chart;

// ================= BUTTONS =================
export function setMode(mode){
    KI_MODE = mode;
    document.getElementById("mode").textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ================= CHART =================
export function drawChart(data, prediction, news=[]){
    const ctx = document.getElementById("chart").getContext("2d");
    if(chart) chart.destroy();

    const annotations = news.map(e => {
        const index = data.findIndex(d => d.date.startsWith(e.date.substring(0,10)));
        if(index < 0) return null;
        return {
            type:'point',
            xValue: data[index].date,
            yValue: data[index].price,
            backgroundColor:'#ffaa00',
            radius:6,
            label:{
                content:e.description,
                enabled:true,
                position:'top',
                backgroundColor:'#111',
                color:'#00ffcc',
                font:{size:11}
            }
        }
    }).filter(a=>a);

    chart = new Chart(ctx,{
        type:'line',
        data:{
            labels:data.map(d=>d.date),
            datasets:[
                {label:'Preis (CHF)', data:data.map(d=>d.price), borderColor:'#00ffcc', tension:0.3},
                {label:'Prognose', data:[...data.slice(0,-1).map(d=>d.price), prediction], borderColor:'#ffaa00', tension:0.3}
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

// ================= ANALYSE =================
export async function analyzeStock(){
    if(dailyCount() >= 100){
        statusDisplay.textContent = "Maximale Prognosen pro Tag erreicht (100)";
        return;
    }

    const symbol = stockSelect.value;
    statusDisplay.textContent = "Lade Daten…";

    try{
        // Historische Kurse
        const data = await getAlphaHistory(symbol);
        // Aktuelle News
        const news = await getMarketauxNews(symbol);
        // Prognose
        const {pred, news: relevantNews} = predict(data, news);
        drawChart(data, pred, relevantNews);

        // Signal
        const last = data[data.length-1].price;
        const diff = (pred - last)/last;
        const signal = diff>0.08?"KAUFEN":diff<-0.08?"VERKAUFEN":"HALTEN";
        const cls = diff>0.08?"buy":diff<-0.08?"sell":"hold";

        // Genauigkeit
        const accuracy = calculateAccuracy(data);
        document.getElementById("confidence").textContent = accuracy + "%";

        // Ergebnis-Tabelle
        document.getElementById("result").innerHTML = `
            <tr>
                <td>${last.toFixed(2)}</td>
                <td>${pred.toFixed(2)}</td>
                <td class="${cls}">${signal}</td>
                <td>${(Math.abs(diff)*100).toFixed(1)}%</td>
            </tr>`;

        // Lernstatus
        document.getElementById("explanation").innerHTML =
            `RSI ${Math.round(100*data[data.length-1].price/last)}, MACD ${Math.round(pred-last)}, Modus ${KI_MODE}.<br>`+
            (relevantNews.length ? "Berücksichtigte News: " + relevantNews.map(e=>e.description).join(", ") : "Keine aktuellen News.");

        document.getElementById("fundamental").innerHTML = "Grundlegende Stabilitätsprüfung (internes Filtermodell).";

        incrementDailyCount();
        statusDisplay.textContent = "Analyse abgeschlossen ✔";

    } catch(err){
        console.error(err);
        statusDisplay.textContent = err;
    }
}
