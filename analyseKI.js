import { getStockHistory, getRealtimeNews } from './fetchAPI.js';

/* ================= INDICATORS ================= */
export function EMA(data, period) {
    const k = 2 / (period + 1);
    let e = data[0].price;
    for(let i=1; i<data.length; i++) {
        e = data[i].price * k + e * (1 - k);
    }
    return e;
}

export function RSI(data) {
    let gains=0, losses=0;
    for(let i=data.length-15; i<data.length-1; i++){
        const diff = data[i+1].price - data[i].price;
        if(diff>0) gains += diff; else losses -= diff;
    }
    return 100 - (100 / (1 + (gains / (losses || 1))));
}

export function MACD(data) {
    return EMA(data,12) - EMA(data,26);
}

/* ================= PREDICTION ================= */
export async function predict(stockSymbol, mode="normal") {
    // 1️⃣ Historische Daten holen
    const data = await getStockHistory(stockSymbol);

    // 2️⃣ Aktuelle News holen
    const news = await getRealtimeNews(stockSymbol);

    // Letzter Preis
    const last = data[data.length-1].price;

    // Gewichtung nach Modus
    let w = mode === "safe" ? 0.5 : mode === "aggressive" ? 1.3 : 0.8;
    let pred = last * (1 + (EMA(data,10)-last)/last * 0.5 * w);

    // RSI Anpassung
    const rsi = RSI(data);
    if(rsi>70) pred *= 0.97;
    if(rsi<30) pred *= 1.03;

    // News-Impact berücksichtigen
    const recentNews = news.filter(n => data.some(d => d.date === n.date));
    recentNews.forEach(n => pred *= 1 + n.impact);

    // Signal & Abweichung
    const deviation = (pred - last)/last;
    const signal = deviation>0.08 ? "KAUFEN" : deviation<-0.08 ? "VERKAUFEN" : "HALTEN";
    const cls = deviation>0.08 ? "buy" : deviation<-0.08 ? "sell" : "hold";

    // Konfidenz berechnen
    let confScore = 60;
    const macd = MACD(data);
    if(Math.abs(macd)>0.5) confScore += 5;
    if(rsi>40 && rsi<60) confScore +=5;
    if(mode==="safe") confScore +=3;
    const confidence = confScore>75?"Hoch":confScore>65?"Mittel":"Niedrig";

    return {
        last,
        pred,
        deviation,
        signal,
        cls,
        confidence,
        recentNews,
        data,
        rsi,
        macd
    };
}
