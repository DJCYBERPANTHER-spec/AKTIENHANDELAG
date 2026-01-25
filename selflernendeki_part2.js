import { analyze } from './selflernendeki_part5.js';

/* ================= KI SETTINGS ================= */
export let KI_MODE = "normal";
export let dailyPrognosen = parseInt(localStorage.getItem('dailyPrognosen')) || 0;
export const MAX_PROGNOSEN = 100;
export let kiGenauigkeit = 70;
export let kiLernFortschritt = 0;

export function initButtons(){
  document.getElementById('safeBtn').addEventListener('click', ()=>setMode('safe'));
  document.getElementById('normalBtn').addEventListener('click', ()=>setMode('normal'));
  document.getElementById('aggressiveBtn').addEventListener('click', ()=>setMode('aggressive'));
  document.getElementById('analyzeBtn').addEventListener('click', ()=>{
      if(dailyPrognosen >= MAX_PROGNOSEN){
          alert("Maximale Tagesprognosen erreicht!");
          return;
      }
      addPrognose();
      analyze();
  });
}

/* ================= KI MODUS ================= */
export function setMode(mode){
  KI_MODE = mode;
  document.getElementById('mode').textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
}

/* ================= PROGNOSEN ================= */
export function addPrognose(){
  if(dailyPrognosen < MAX_PROGNOSEN){
      dailyPrognosen++;
      localStorage.setItem('dailyPrognosen', dailyPrognosen);
      document.getElementById('dailyCount').textContent = dailyPrognosen;
  } else {
      alert("Maximale Tagesprognosen erreicht!");
  }
}

/* ================= KI GENAUIGKEIT ================= */
export function updateKIAccuracyFromData(data){
  // Berechnung wie vorher
  let score = 70;
  const rsi = RSI(data);
  const macd = MACD(data);
  if(rsi>40 && rsi<60) score+=10;
  if(Math.abs(macd)>0.5) score+=5;
  if(KI_MODE==="safe") score+=5;
  if(KI_MODE==="aggressive") score-=5;
  score = Math.min(100, Math.max(0, score));
  kiGenauigkeit = score;
  document.getElementById('accuracy').textContent = kiGenauigkeit+"%";
  kiLernFortschritt = Math.min(100, Math.round((kiGenauigkeit + (dailyPrognosen/MAX_PROGNOSEN*100))/2));
  document.getElementById('learning').textContent = kiLernFortschritt+"%";
}
