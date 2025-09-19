// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;
let timerEnabled = false;

let currentStreak = 0;
let longestStreak = 0;
let expectedAnswer = [];

let levelStats = {}; // track stats per level

// Encouragement messages
const praiseMessages = [
  "Great memory!",
  "Awesome job!",
  "You’re on fire!",
  "Detective skills are sharp!",
  "Keep going strong!"
];

// ===== Screen Management =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===== Welcome Screen =====
document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("parentScreen");
  setTimeout(() => document.getElementById("childName").focus(), 200);
});

document.getElementById("returningBtn").addEventListener("click", () => {
  // For now, just resume last level
  if (childName) {
    startLevel(currentLevel);
  } else {
    showScreen("parentScreen");
  }
});

document.getElementById("voiceBtn").addEventListener("click", () => {
  speak("Welcome to Memo’s Memory Mystery! Let’s play together.");
});

// ===== Parent Screen =====
document.getElementById("saveStartBtn").addEventListener("click", () => {
  childName = document.getElementById("childName").value.trim() || "Detective";
  currentLevel = document.getElementById("startLevel").value;
  autoNext = document.getElementById("autoNext").checked;
  timerEnabled = document.getElementById("timerToggle").checked;
  showScreen("gameScreen");
  startLevel(currentLevel);
});

// ===== Game Logic =====
function startLevel(level) {
  currentLevel = level;
  document.getElementById("levelTitle").innerText = "Level " + currentLevel;
  if (!levelStats[level]) {
    levelStats[level] = { correct: 0, incorrect: 0, longest: 0, total: 0 };
  }
  generateRound(level);
}

// Determine number range by level
function getRange(level) {
  if (level.startsWith("1")) return 3;
  if (level.startsWith("2")) return 4;
  if (level.startsWith("3")) return 5;
  if (level.startsWith("4")) return 6;
  if (level.startsWith("5")) return 7;
  return 3;
}

function generateRound(level) {
  let n = getRange(level);
  let allNumbers = Array.from({ length: n }, (_, i) => i + 1);

  // How many missing?
  let missingCount = 1;
  if (level.endsWith("B")) missingCount = 2;
  if (level.endsWith("C")) missingCount = Math.min(3, n - 1);

  // Pick missing numbers randomly
  let missing = [];
  while (missing.length < missingCount) {
    let pick = allNumbers[Math.floor(Math.random() * n)];
    if (!missing.includes(pick)) missing.push(pick);
  }

  expectedAnswer = [...missing].sort((a, b) => a - b);

  // Shuffle displayed numbers (fix for randomness)
  let displayed = allNumbers.filter(x => !missing.includes(x));
  for (let i = displayed.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [displayed[i], displayed[j]] = [displayed[j], displayed[i]];
  }

  // Build grid
  let gridHTML = "";
  allNumbers.forEach(num => {
    if (missing.includes(num)) {
      gridHTML += `<div class="numberBox">?</div>`;
    } else {
      gridHTML += `<div class="numberBox">${num}</div>`;
    }
  });
  document.getElementById("numberGrid").innerHTML = gridHTML;

  // Instructions
  let instr = `Find the ${missingCount} missing number${missingCount > 1 ? "s" : ""} from 1 to ${n}. Enter them separated by spaces.`;
  document.getElementById("instructions").innerText = instr;
  speak(instr);

  // Reset UI
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";

  setTimeout(() => document.getElementById("answerInput").focus(), 1500);
}

// ===== Answer Checking =====
document.getElementById("answerInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim();
  if (!input) {
    document.getElementById("feedback").innerText = "Please enter your answer.";
    return;
  }
  let guess = input.split(" ").map(x => parseInt(x)).filter(x => !isNaN(x));
  guess.sort((a, b) => a - b);

  levelStats[currentLevel].total++;

  if (JSON.stringify(guess) === JSON.stringify(expectedAnswer)) {
    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    if (currentStreak > levelStats[currentLevel].longest) {
      levelStats[currentLevel].longest = currentStreak;
    }
    let msg = `${childName}, that’s ${currentStreak} in a row! ${randomPraise()}`;
    document.getElementById("feedback").innerText = msg;
    speak(msg);

    if (currentStreak % 5 === 0) {
      bigCelebration();
    } else {
      nextRoundButton();
    }
  } else {
    levelStats[currentLevel].incorrect++;
    currentStreak = 0;
    let msg = `Not quite, ${childName}. Try again next round.`;
    document.getElementById("feedback").innerText = msg;
    speak(msg);
    nextRoundButton();
  }

  document.getElementById("currentStreak").innerText = currentStreak;
  document.getElementById("longestStreak").innerText = longestStreak;
}

function randomPraise() {
  return praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
}

function nextRoundButton() {
  document.getElementById("controlButtons").innerHTML =
    `<button onclick="generateRound('${currentLevel}')">Next Round</button>`;
}

// ===== Celebration =====
function bigCelebration() {
  let msg = `Congratulations, ${childName}! Five in a row! You’re becoming a first-class detective!`;
  document.getElementById("feedback").innerText = msg;
  speak(msg);

  document.getElementById("controlButtons").innerHTML = `
    <button onclick="generateRound('${currentLevel}')">Stay on Same Level</button>
    <button onclick="goToNextLevel()">Go to Next Level</button>
    <button onclick="showProgress()">See Progress Chart</button>
    <button onclick="showProgress(true)">Quit</button>
  `;
}

// ===== Level Navigation =====
function goToNextLevel() {
  let base = parseInt(currentLevel[0]);
  let sub = currentLevel[1];
  let nextLevel = base + sub; // default fallback
  if (sub === "A") nextLevel = base + "B";
  else if (sub === "B") nextLevel = base + "C";
  else if (sub === "C") nextLevel = (base + 1) + "A";
  startLevel(nextLevel);
}

// ===== Progress Chart =====
function showProgress(endGame = false) {
  showScreen("progressScreen");
  document.getElementById("progressTitle").innerText =
    `${childName}’s Progress Chart`;

  let tableHTML = "<tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Longest Streak</th><th>Total</th></tr>";

  let totalCorrect = 0, totalIncorrect = 0, totalRounds = 0;

  for (let lvl in levelStats) {
    let s = levelStats[lvl];
    tableHTML += `<tr>
      <td>${lvl}</td>
      <td>${s.correct}</td>
      <td>${s.incorrect}</td>
      <td>${s.longest}</td>
      <td>${s.total}</td>
    </tr>`;
    totalCorrect += s.correct;
    totalIncorrect += s.incorrect;
    totalRounds += s.total;
  }

  tableHTML += `<tr>
    <td>Totals</td>
    <td>${totalCorrect}</td>
    <td>${totalIncorrect}</td>
    <td>${longestStreak}</td>
    <td>${totalRounds}</td>
  </tr>`;

  document.getElementById("progressTable").innerHTML = tableHTML;

  // Buttons visibility
  document.getElementById("endGameBtn").style.display = endGame ? "inline-block" : "none";
}

document.getElementById("endGameBtn").addEventListener("click", () => {
  showScreen("welcomeScreen");
});

// ===== Speech =====
function speak(text) {
  if (!window.speechSynthesis) return;
  let utter = new SpeechSynthesisUtterance(text);
  utter.pitch = 1.2;
  utter.rate = 1;
  utter.voice = speechSynthesis.getVoices().find(v => v.name === "Samantha") || null;
  speechSynthesis.speak(utter);
}
