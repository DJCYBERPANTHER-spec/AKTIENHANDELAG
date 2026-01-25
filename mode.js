// ================= MODE =================
let KI_MODE = "normal"; // Standardmodus

// Funktion, um den Modus zu setzen
export function setMode(mode) {
  KI_MODE = mode;
  const modeLabel = document.getElementById("mode");
  if (modeLabel) {
    modeLabel.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

// Funktion, um den aktuellen Modus zu holen
export function getMode() {
  return KI_MODE;
}
