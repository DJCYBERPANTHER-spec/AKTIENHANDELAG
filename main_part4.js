import { analyzeStock, setMode } from "./main_part3.js";

// ================= TÄGLICHE PROGNOSEN =================
const DAILY_KEY = "dailyPrognoses";
const TODAY = new Date().toISOString().slice(0,10);

// Prüfen wie viele Prognosen heute gemacht wurden
export function dailyCount(){
    const data = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    return data[TODAY] || 0;
}

// Prognose-Zähler erhöhen
export function incrementDailyCount(){
    const data = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    data[TODAY] = (data[TODAY] || 0) + 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify(data));
}

// ================= BUTTONS =================
document.getElementById("safeBtn").addEventListener("click", ()=>setMode("safe"));
document.getElementById("normalBtn").addEventListener("click", ()=>setMode("normal"));
document.getElementById("aggressiveBtn").addEventListener("click", ()=>setMode("aggressive"));
document.getElementById("analyzeBtn").addEventListener("click", analyzeStock);

// ================= MOBILE SUPPORT =================
function handleResize(){
    const width = window.innerWidth;
    const chartCanvas = document.getElementById("chart");
    if(width < 600){
        chartCanvas.style.maxWidth = "100%";
    } else {
        chartCanvas.style.maxWidth = "1200px";
    }
}

window.addEventListener("resize", handleResize);
window.addEventListener("load", handleResize);
