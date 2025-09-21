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
  const nameInput = document.getElementById("childNameInput").value.trim();
  const levelInput = document.getElementById("levelSelect").value;

  if (!nameInput) {
    alert("Please enter a name before starting.");
    return;
  }

  childName = nameInput.toUpperCase();
  currentLevel = levelInput;

  alert(`🟢 Starting game for ${childName} at ${currentLevel}`);

  // Show game screen
  showScreen("gameScreen");

  // For now just placeholder content until we add generateRound
  document.getElementById("levelTitle").innerText = "Level " + currentLevel;
  document.getElementById("instructions").innerText = "This is where the round will appear.";
  document.getElementById("numberDisplay").innerText = "[Numbers go here]";
});
