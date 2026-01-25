import { API_KEYS, USD_TO_CHF, apiIndex } from './config.js';

/* ================= API FETCH ================= */

// Historische Aktienkurse von AlphaVantage
export async function getStockHistory(symbol) {
    let tries = 0;
    const maxTries = API_KEYS.length;

    while (tries < maxTries) {
        const key = API_KEYS[apiIndex];
        try {
            const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`);
            const data = await res.json();

            if(data.Note || data["Error Message"]) {
                // API-Limit erreicht, nächsten Key probieren
                apiIndex = (apiIndex + 1) % API_KEYS.length;
                tries++;
                continue;
            }

            if(!data["Time Series (Daily)"]) throw "Keine Kursdaten gefunden";

            // Nur die letzten 90 Tage
            return Object.entries(data["Time Series (Daily)"])
                .slice(0,90)
                .reverse()
                .map(([date, v]) => ({
                    date,
                    price: parseFloat(v["4. close"]) * USD_TO_CHF
                }));

        } catch (err) {
            apiIndex = (apiIndex + 1) % API_KEYS.length;
            tries++;
            if(tries >= maxTries) throw "Alle API-Keys aufgebraucht oder Fehler beim Laden der Daten.";
        }
    }
}

// Aktuelle News / Finanzprobleme von Marketaux
export async function getRealtimeNews(symbol) {
    try {
        const apiKey = "eVepLcKTy9zFDbcsUlT9C7sJQGPyU0MGFmkWFUcj"; // Dein Marketaux-Key
        const res = await fetch(`https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=de&api_token=${apiKey}`);
        const data = await res.json();

        if(!data.data) return [];

        // Nur relevante News der letzten 7 Tage
        const today = new Date();
        return data.data.filter(n => {
            const newsDate = new Date(n.published_at);
            const diffDays = (today - newsDate) / (1000*60*60*24);
            return diffDays <= 7;
        }).map(n => ({
            date: n.published_at.split("T")[0],
            title: n.title,
            impact: n.sentiment === "positive" ? 0.02 : n.sentiment === "negative" ? -0.02 : 0
        }));

    } catch(err) {
        console.error("Fehler beim Laden der News:", err);
        return [];
    }
}
