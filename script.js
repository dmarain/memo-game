// ===== Global Variables =====
let childName = "";
let currentLevel = "1A";
let currentStreak = 0;
let longestStreak = 0;
let expectedAnswer = [];

// ===== Utility =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ===== Welcome Screen Events =====
window.onload = () => {
  alert("✅ Script loaded");
  document.getElementById("hearMemoBtn").addEventListener("click", () => {
    alert("Memo’s voice test working");
  });

  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    showScreen("parentSettings");
  });

  document.getElementById("returningBtn").addEventListener("click", () => {
    showScreen("gameScreen");
    startLevel(currentLevel);
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    childName = document.getElementById("childNameInput").value || "Detective";
    currentLevel = document.getElementById("startingLevel").value;
    showScreen("gameScreen");
    startLevel(currentLevel);
  });

  document.getElementById("submitBtn").addEventListener("click", checkAnswer);
};

// ===== Level Logic =====
function startLevel(level) {
  document.getElementById("levelTitle").textContent = "Level " + level;
  generateRound(level);
}

function generateRound(level) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  let maxNum = 3;
  let missingCount = 1;

  if (level === "1B" || level === "1C") missingCount = 2;
  if (level === "2A") maxNum = 4;
  if (level === "3A") maxNum = 5;

  let numbers = Array.from({ length: maxNum }, (_, i) => i + 1);
  let missing = [];
  while (missing.length < missingCount) {
    let pick = numbers[Math.floor(Math.random() * numbers.length)];
    if (!missing.includes(pick)) missing.push(pick);
  }
  expectedAnswer = missing.sort((a, b) => a - b);

  numbers.forEach(n => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (missing.includes(n)) {
      cell.textContent = "?";
      cell.classList.add("missing");
    } else {
      cell.textContent = n;
    }
    grid.appendChild(cell);
  });

  document.getElementById("instructionText").textContent =
    `Find the ${missingCount} missing number${missingCount > 1 ? "s" : ""} from 1 to ${maxNum}. Enter them separated by a space.`;

  const input = document.getElementById("answerInput");
  input.value = "";
  input.focus();
}

// ===== Answer Check =====
function checkAnswer() {
  const input = document.getElementById("answerInput").value.trim();
  const parts = input.split(" ");

  if (parts.length !== expectedAnswer.length) {
    document.getElementById("feedback").textContent =
      "Please enter " + expectedAnswer.length + " numbers separated by spaces.";
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").focus();
    return;
  }

  const userNums = parts.map(n => parseInt(n)).sort((a, b) => a - b);
  if (JSON.stringify(userNums) === JSON.stringify(expectedAnswer)) {
    currentStreak++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    document.getElementById("feedback").textContent = "Great job, " + childName + "!";
  } else {
    currentStreak = 0;
    document.getElementById("feedback").textContent = "Not quite, " + childName + ". Try again.";
  }

  document.getElementById("streaks").textContent =
    `Current streak: ${currentStreak} | Longest: ${longestStreak}`;

  document.getElementById("answerInput").value = "";
  document.getElementById("answerInput").focus();
}
