// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;

let currentStreak = 0;
let longestStreak = 0;

let expectedAnswer = [];

let levelStats = {
  "1A": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "1B": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "1C": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "1D": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "2B": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "2C": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "2D": { correct: 0, incorrect: 0, longest: 0, total: 0 }
};

// ===== Helpers =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function speakText(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  let voice = speechSynthesis.getVoices().find(v => v.name.includes("Samantha")) || null;
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function updateStreakDisplay() {
  document.getElementById("currentStreak").innerHTML =
    `<span class="streakBox currentStreak">Current: ${currentStreak}</span>`;
  document.getElementById("longestStreak").innerHTML =
    `<span class="streakBox longestStreak">Longest: ${longestStreak}</span>`;
}

function getNextLevel(level) {
  const order = ["1A", "1B", "1C", "1D", "2B", "2C", "2D"];
  let idx = order.indexOf(level);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

// ===== Welcome Flow =====
document.getElementById("hearMemoSpeak").addEventListener("click", () => {
  speakText("Welcome to Memo’s Detective Agency! To start the game, press First-Time User or Returning User.");
});

document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("nameEntryScreen");
  speakText("Let's get started! Please enter your name.");
  document.getElementById("childNameInput").focus();
});

document.getElementById("returningBtn").addEventListener("click", () => {
  if (!childName) {
    speakText("Please enter your name to continue.");
    showScreen("nameEntryScreen");
  } else {
    document.getElementById("returningHeading").innerText = "Welcome back, " + childName + "!";
    showScreen("returningScreen");
    speakText("Welcome back, " + childName + "! Do you want to pick up where you left off, or move on to the next level?");
  }
});

document.getElementById("saveNameBtn").addEventListener("click", () => {
  let nameVal = document.getElementById("childNameInput").value.trim();
  if (nameVal) {
    childName = formatName(nameVal);
    speakText("Your name has been saved, " + childName + "! Let's set up your game.");
    showScreen("parentOptionsScreen");
  }
});

document.getElementById("saveParentOptionsBtn").addEventListener("click", () => {
  currentLevel = document.getElementById("startingLevel").value;
  autoNext = document.getElementById("autoNextToggle").checked;
  speakText("Okay " + childName + ", let's get started with Level " + currentLevel);
  startLevel(currentLevel);
});

document.getElementById("sameLevelBtn").addEventListener("click", () => {
  speakText("Okay " + childName + ", let's continue with Level " + currentLevel);
  startLevel(currentLevel);
});

document.getElementById("nextLevelBtn").addEventListener("click", () => {
  let next = getNextLevel(currentLevel);
  if (next) {
    currentLevel = next;
    speakText("Okay " + childName + ", let's move on to Level " + currentLevel);
    startLevel(currentLevel);
  } else {
    speakText("There is no next level yet, " + childName + ".");
  }
});

// ===== Gameplay =====
function startLevel(level) {
  showScreen("gameScreen");
  currentStreak = 0;
  updateStreakDisplay();
  generateRound(level);
}

function generateRound(level) {
  // Reset UI
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";

  let nums = level.startsWith("1") ? [1, 2, 3, 4] : [1, 2, 3, 4, 5];
  let missingCount = (level.endsWith("B")) ? 1 : (level.endsWith("C") ? 2 : 2);

  // Scramble for B or D
  if (level.endsWith("B") || level.endsWith("D")) {
    nums.sort(() => Math.random() - 0.5);
  }

  // Pick missing numbers
  let missing = [];
  while (missing.length < missingCount) {
    let candidate = nums[Math.floor(Math.random() * nums.length)];
    if (!missing.includes(candidate)) missing.push(candidate);
  }
  expectedAnswer = [...missing].sort((a, b) => a - b);

  // Render boxes
  let display = nums.map(n =>
    missing.includes(n)
      ? `<div class="numberBox missingBox">?</div>`
      : `<div class="numberBox">${n}</div>`
  ).join("");
  document.getElementById("numberDisplay").innerHTML = display;

  // Instructions
  let instr = "";
  if (missingCount === 1) {
    instr = `Find the missing number from 1 through ${nums.length}.`;
  } else {
    instr = `Find the two missing numbers from 1 through ${nums.length}. Enter the two numbers with a space between.`;
  }
  if (level.endsWith("B") || level.endsWith("D")) instr += " The numbers are scrambled.";

  document.getElementById("instructions").innerText = instr;
  speakText(instr);
}

// ===== Answer Checking =====
document.getElementById("submitBtn").addEventListener("click", checkAnswer);
document.getElementById("answerInput").addEventListener("keypress", e => {
  if (e.key === "Enter") checkAnswer();
});

function checkAnswer() {
  let val = document.getElementById("answerInput").value.trim();
  if (!val) return;

  let parts = val.split(" ").map(x => parseInt(x)).filter(x => !isNaN(x));
  parts.sort((a, b) => a - b);

  levelStats[currentLevel].total++;

  if (JSON.stringify(parts) === JSON.stringify(expectedAnswer)) {
    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    if (currentStreak > levelStats[currentLevel].longest) levelStats[currentLevel].longest = currentStreak;
    document.getElementById("feedback").innerText = "Great job, " + childName + "!";
    speakText("Great job, " + childName + "! That's " + currentStreak + " in a row.");
  } else {
    currentStreak = 0;
    levelStats[currentLevel].incorrect++;
    document.getElementById("feedback").innerText = "Not quite, " + childName + ". Try again.";
    speakText("Not quite, " + childName + ". Try again.");
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").focus();
    updateStreakDisplay();
    return;
  }

  updateStreakDisplay();

  // Milestones
  if (currentStreak > 0 && currentStreak % 5 === 0) {
    document.getElementById("controlButtons").innerHTML = `
      <button id="nextRoundBtn">NEXT</button>
      <button id="seeSummaryBtn">See Progress</button>
      <button id="endGameBtn2">End Game</button>`;
    speakText("Congratulations, " + childName + "! " + currentStreak + " in a row! You can keep going, see your progress, or end the game.");
    document.getElementById("nextRoundBtn").addEventListener("click", () => generateRound(currentLevel));
    document.getElementById("seeSummaryBtn").addEventListener("click", showSummary);
    document.getElementById("endGameBtn2").addEventListener("click", endGame);
  } else {
    document.getElementById("controlButtons").innerHTML = `<button id="nextRoundBtn">NEXT</button>`;
    document.getElementById("nextRoundBtn").addEventListener("click", () => generateRound(currentLevel));
  }

  // Auto-next
  if (autoNext && currentStreak > 0 && currentStreak % 5 === 0) {
    let next = getNextLevel(currentLevel);
    if (next) {
      currentLevel = next;
      speakText("Great job " + childName + "! Moving on to Level " + currentLevel);
      startLevel(currentLevel);
    }
  }
}

// ===== Summary & End Game =====
function showSummary() {
  showScreen("summaryScreen");
  let tbody = document.getElementById("summaryBody");
  tbody.innerHTML = "";

  Object.keys(levelStats).forEach(level => {
    let s = levelStats[level];
    let row = `<tr>
      <td>${level}</td>
      <td>${s.correct}</td>
      <td>${s.incorrect}</td>
      <td>${currentStreak}</td>
      <td>${s.longest}</td>
      <td>${s.total}</td>
    </tr>`;
    tbody.innerHTML += row;
  });

  speakText("Here’s your progress so far, " + childName + ". You can resume this level, choose another level, or end the game.");

  document.getElementById("resumeBtn").onclick = () => startLevel(currentLevel);
  document.getElementById("changeLevelBtn").onclick = () => showScreen("parentOptionsScreen");
  document.getElementById("endGameBtn").onclick = () => endGame();
}

function endGame() {
  showSummary();
  setTimeout(() => {
    showScreen("endGameScreen");
    let msg = "Great job, " + childName + ". Thanks for helping me find all the missing numbers! I’ll always be here waiting for you!";
    document.getElementById("goodbyeMessage").innerText = msg;
    speakText(msg);
  }, 4000);
}
