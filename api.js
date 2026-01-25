import { USD_TO_CHF, API_KEYS } from "./config.js";

let apiIndex = 0; // Start mit erstem API-Key

// Funktion, um historische Daten eines Symbols zu holen
export async function getHistory(symbol) {
  const key = API_KEYS[apiIndex];
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}`
    );
    const data = await response.json();

    // Check auf API Limit oder Fehler
    if (data.Note || data["Error Message"] || !data["Time Series (Daily)"]) {
      console.warn("API-Key Limit erreicht oder Fehler, wechsle Key...");
      apiIndex = (apiIndex + 1) % API_KEYS.length; // nächsten Key nehmen
      if (apiIndex === 0) throw "Alle API-Keys aufgebraucht oder Fehler bei Daten.";
      return await getHistory(symbol); // retry mit neuem Key
    }

    // Daten aufbereiten (letzte 90 Tage)
    const history = Object.entries(data["Time Series (Daily)"])
      .slice(0, 90)
      .reverse()
      .map(([date, v]) => ({
        date,
        price: parseFloat(v["4. close"]) * USD_TO_CHF,
      }));

    return history;
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err);
    throw "Fehler beim Laden der Marktdaten. Bitte später erneut versuchen.";
  }
}
