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
