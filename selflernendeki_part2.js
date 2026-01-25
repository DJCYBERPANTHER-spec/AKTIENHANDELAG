/* ================= KI-EINSTELLUNGEN & LERNSTATUS ================= */
let KI_MODE = "normal";           // default modus: 'safe', 'normal', 'aggressive'
let dailyPrognosen = 0;           // gespeicherte Prognosen heute
const MAX_PROGNOSEN = 100;        // Maximal 100 Prognosen pro Tag
let kiGenauigkeit = 70;           // Anfangsgenauigkeit in Prozent
let kiLernFortschritt = 0;        // Lernfortschritt in % (0–100)

/* === Lokale Speicherung laden === */
if(localStorage.getItem('dailyPrognosen')){
    dailyPrognosen = parseInt(localStorage.getItem('dailyPrognosen'));
}
document.getElementById('dailyCount').textContent = dailyPrognosen;
document.getElementById('accuracy').textContent = kiGenauigkeit + "%";
document.getElementById('learning').textContent = kiLernFortschritt + "%";

/* ================= KI-MODUS ÄNDERN ================= */
function setMode(mode){
    KI_MODE = mode;
    document.getElementById('mode').textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
}

/* ================= PROGNOSEN ZÄHLEN ================= */
function addPrognose(){
    if(dailyPrognosen < MAX_PROGNOSEN){
        dailyPrognosen++;
        localStorage.setItem('dailyPrognosen', dailyPrognosen);
        document.getElementById('dailyCount').textContent = dailyPrognosen;
    } else {
        alert("Maximale Tagesprognosen erreicht!");
    }
}

/* ================= KI-GENAUIGKEIT DYNAMISCH ================= */
function updateKIAccuracyFromData(data){
    const rsi = RSI(data);
    const macd = MACD(data);

    // Basisgenauigkeit
    let score = 70;

    // RSI & MACD beeinflussen Genauigkeit
    if(rsi > 40 && rsi < 60) score += 10;   
    if(Math.abs(macd) > 0.5) score += 5;    
    if(KI_MODE === "safe") score += 5;
    if(KI_MODE === "aggressive") score -= 5;

    score = Math.min(100, Math.max(0, score));
    kiGenauigkeit = score;
    document.getElementById('accuracy').textContent = kiGenauigkeit + "%";

    // Lernfortschritt = Durchschnitt aus bisherigen Prognosen und Genauigkeit
    kiLernFortschritt = Math.min(100, Math.round((kiGenauigkeit + (dailyPrognosen / MAX_PROGNOSEN * 100)) / 2));
    document.getElementById('learning').textContent = kiLernFortschritt + "%";
}

/* ================= BUTTON EVENTS ================= */
document.getElementById('safeBtn').addEventListener('click', ()=>setMode('safe'));
document.getElementById('normalBtn').addEventListener('click', ()=>setMode('normal'));
document.getElementById('aggressiveBtn').addEventListener('click', ()=>setMode('aggressive'));
document.getElementById('analyzeBtn').addEventListener('click', ()=>{
    if(dailyPrognosen >= MAX_PROGNOSEN){
        alert("Maximale Tagesprognosen erreicht!");
        return;
    }
    addPrognose();

    // Starte die KI-Analyse (muss in Part1 JS implementiert sein)
    analyze();
});
