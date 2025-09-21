// ===== Minimal Test Script =====

// Utility: just show which screen is active
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

window.onload = () => {
  alert("✅ window.onload fired — script.js is running");
  showScreen("welcomeScreen");

  // Hear Memo’s Voice
  document.getElementById("hearMemoBtn").addEventListener("click", () => {
    alert("🎤 Hear Memo’s Voice button clicked!");
  });

  // First Time User
  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    alert("🟢 First Time User button clicked!");
  });

  // Returning User
  document.getElementById("returningBtn").addEventListener("click", () => {
    alert("🔵 Returning User button clicked!");
  });
};
