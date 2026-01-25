/* ================= STORAGE ================= */
// Speichert Tagesprognosen & KI-Fortschritt lokal
export function getStorage() {
    const data = JSON.parse(localStorage.getItem("ki_storage")) || {
        dailyCount: 0,
        lastDate: new Date().toISOString().slice(0,10),
        learningProgress: 0, // 0-100 %
        accuracy: 50        // Startwert
    };

    const today = new Date().toISOString().slice(0,10);
    if(data.lastDate !== today){
        data.dailyCount = 0;
        data.lastDate = today;
    }
    return data;
}

export function saveStorage(data){
    localStorage.setItem("ki_storage", JSON.stringify(data));
}

// Zählt eine Prognose hoch, max 100
export function incrementDailyCount(){
    const data = getStorage();
    if(data.dailyCount < 100) data.dailyCount++;
    saveStorage(data);
}

// KI Fortschritt und Genauigkeit aktualisieren
export function updateKIProgress(progress, accuracy){
    const data = getStorage();
    data.learningProgress = progress;
    data.accuracy = accuracy;
    saveStorage(data);
}
