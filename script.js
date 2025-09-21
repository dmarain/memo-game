// ===== Utility =====
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// ===== Voice =====
function speak(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  let utter = new SpeechSynthesisUtterance(text);
  utter.voice = synth.getVoices().find(v => v.name.includes("Samantha")) || null;
  synth.cancel();
  synth.speak(utter);
}

// ===== On Load =====
window.onload = () => {
  alert("✅ window.onload fired — script.js is running");
  showScreen("welcomeScreen");

  // Hear Memo’s Voice
  document.getElementById("hearMemoBtn").addEventListener("click", () => {
    speak("Welcome to MEMO’s Detective Agency. I need your help to find the missing numbers!");
  });

  // First Time User
  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    showScreen("parentScreen");
  });

  // Returning User
  document.getElementById("returningBtn").addEventListener("click", () => {
    showScreen("returningScreen");
  });

  // Save and Start (Parent Settings)
  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    alert("🟢 Save and Start button clicked!");
    showScreen("gameScreen");
  });
};
