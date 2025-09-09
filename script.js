// ===== Debug Build • 2025-09-09 HH:MM =====
// Adds dual binding to guarantee Submit works on iOS.

let childName = "";
let currentLevel = "1A";
let currentStreak = 0;
let roundCount = 0;
let expectedAnswer = [];

// --- Helpers ---
const $ = (id) => document.getElementById(id);
function setText(id, text) { if ($(id)) $(id).textContent = text; }

// --- Status rendering ---
function renderStatus() {
  setText("roundLabel", `Round: ${roundCount}`);
  setText("streakLabel", `Streak: ${currentStreak}`);
  setText("expectLabel", `Expected: ${expectedAnswer.length ? expectedAnswer.join(" ") : "—"}`);
}

// --- Box rendering ---
function renderBoxes(rangeMax, missingSet) {
  const box = $("displayBox");
  box.innerHTML = "";
  for (let n = 1; n <= rangeMax; n++) {
    const div = document.createElement("div");
    div.className = "numBox";
    if (missingSet.has(n)) {
      div.classList.add("missing");
      div.textContent = "?";
    } else {
      div.textContent = String(n);
    }
    box.appendChild(div);
  }
}

// Level specs
function levelSpec(level) {
  switch (level) {
    case "1A": return [3, 1];
    case "1B": return [3, 2];
    case "2A": return [4, 1];
    default: return [3, 1];
  }
}

function pickMissing(rangeMax, countMissing) {
  const pool = Array.from({ length: rangeMax }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, countMissing).sort((a, b) => a - b);
}

// Generate a round
function generateRound(level) {
  roundCount++;
  const [rangeMax, countMissing] = levelSpec(level);
  const missing = pickMissing(rangeMax, countMissing);
  expectedAnswer = missing.slice();

  renderBoxes(rangeMax, new Set(missing));

  const plural = missing.length === 1 ? "number" : "numbers";
  setText("instruction", `Find the ${plural} missing from 1–${rangeMax}.`);

  $("feedback").className = "";
  setText("feedback", "");
  $("answerInput").value = "";
  $("controlButtons").innerHTML = "";

  renderStatus();
  $("answerInput").focus();
}

// Parse + check answers
function parseAnswer(input) {
  const cleaned = input.trim().replace(/,/g, " ").split(/\s+/).filter(Boolean);
  return cleaned.map(s => Number(s)).filter(n => Number.isInteger(n)).sort((a, b) => a - b);
}

function answersEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) if (arr1[i] !== arr2[i]) return false;
  return true;
}

function submitAnswer(e) {
  if (e) e.preventDefault();
  setText("feedback", "Submit fired ✅"); // debug marker

  const userAns = parseAnswer($("answerInput").value);

  if (!userAns.length) {
    setText("feedback", "Please enter your answer.");
    $("feedback").className = "bad";
    return;
  }

  if (answersEqual(userAns, expectedAnswer)) {
    currentStreak++;
    $("feedback").className = "good";
    setText("feedback", `Great job${childName ? ", " + childName.toUpperCase() : ""}!`);
  } else {
    currentStreak = 0;
    $("feedback").className = "bad";
    setText("feedback", `Try again. Correct was: ${expectedAnswer.join(" ")}`);
  }

  renderStatus();
  $("controlButtons").innerHTML = `<button type="button" id="nextRoundBtn">Next Round</button>`;
  $("nextRoundBtn").onclick = () => generateRound(currentLevel);
}

// Start game
function startGame() {
  childName = $("childName").value.trim();
  currentLevel = $("levelSelect").value;
  currentStreak = 0;
  roundCount = 0;
  generateRound(currentLevel);
}

// Event binding
function bindEvents() {
  if ($("startBtn")) $("startBtn").onclick = startGame;
  if ($("submitBtn")) $("submitBtn").onclick = submitAnswer;
}

// Bind twice for safety
document.addEventListener("DOMContentLoaded", () => {
  setText("feedback", "JS connected ✅ (DOM ready)");
  bindEvents();
});
window.addEventListener("load", () => {
  setText("feedback", "JS connected ✅ (Window loaded)");
  bindEvents();
});
