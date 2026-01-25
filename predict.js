import { EVENTS } from "./events.js";

// Lernparameter für die KI
let learnFactor = 1; // steigt bei jeder Analyse, max 2x
let analysesDoneToday = 0;
const MAX_ANALYSES_PER_DAY = 100;

// ================= INDICATORS =================
export function EMA(data, period) {
  if (!data || !data.length) return 0;
  const k = 2 / (period + 1);
  let e = data[0].price;
  for (let i = 1; i < data.length; i++) e = data[i].price * k + e * (1 - k);
  return e;
}

export function RSI(data) {
  if (!data || data.length < 15) return 50;
  let gains = 0, losses = 0;
  for (let i = data.length - 15; i < data.length - 1; i++) {
    const diff = data[i + 1].price - data[i].price;
    if (diff > 0) gains += diff; else losses -= diff;
  }
  return 100 - (100 / (1 + (gains / (losses || 1))));
}

export function MACD(data) {
  return EMA(data, 12) - EMA(data, 26);
}

// ================= PREDICTION =================
export function predict(data, mode = "normal", periodDays = 7) {
  if (!data || !data.length) return { pred: 0, signal: "-", recentEvents: [], confidence: "–" };

  // Letzter Preis
  const last = data[data.length - 1].price;

  // Gewichtung abhängig vom Modus
  let w = mode === "safe" ? 0.5 : mode === "aggressive" ? 1.3 : 0.8;
  w *= learnFactor; // KI lernt → wird besser

  // Grundprognose
  let pred = last * (1 + (EMA(data, 10) - last) / last * 0.5 * w);

  // RSI Anpassung
  const rsi = RSI(data);
  if (rsi > 70) pred *= 0.97;
  if (rsi < 30) pred *= 1.03;

  // MACD für Stabilität
  const macd = MACD(data);

  // Externe Events berücksichtigen
  const recentEvents = EVENTS.filter(e => data.some(d => d.date === e.date));
  recentEvents.forEach(e => pred *= 1 + e.impact);

  // Prognose für verschiedene Zeiträume: linear hochrechnen
  const futureProjections = {};
  const growthRate = (pred - last) / last;
  const periods = [7, 21, 30, 90, 180, 365]; // Tage: 1W,3W,1M,3M,6M,1J
  periods.forEach(p => futureProjections[p] = last * (1 + growthRate * (p / periodDays)));

  // Signal
  const d = (pred - last) / last;
  const signal = d > 0.08 ? "KAUFEN" : d < -0.08 ? "VERKAUFEN" : "HALTEN";

  // Confidence
  let confidenceScore = 60;
  if (Math.abs(macd) > 0.5) confidenceScore += 5;
  if (rsi > 40 && rsi < 60) confidenceScore += 5;
  if (mode === "safe") confidenceScore += 3;
  const confidence = confidenceScore > 75 ? "Hoch" : confidenceScore > 65 ? "Mittel" : "Niedrig";

  // KI Lern-Faktor erhöhen
  if (analysesDoneToday < MAX_ANALYSES_PER_DAY) learnFactor = Math.min(2, learnFactor + 0.01);

  analysesDoneToday++;

  return { pred, signal, recentEvents, confidence, futureProjections };
}

// ================= RESET für neuen Tag =================
export function resetDailyAnalyses() {
  analysesDoneToday = 0;
  learnFactor = 1;
}
