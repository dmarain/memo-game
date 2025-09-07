// ===== Part 1: Setup, Voice, Welcome, Streaks =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;

let currentStreak = 0;
let longestStreak = 0;

let levelStats = {
  "1A": { correct: 0, incorrect: 0, current: 0, longest: 0, total: 0 },
  "1B": { correct: 0, incorrect: 0, current: 0, longest: 0, total: 0 },
  "1C": { correct: 0, incorrect: 0, current: 0, longest: 0, total: 0 },
  "1D": { correct: 0, incorrect: 0, current: 0, longest: 0, total: 0 }
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Voice helper
function speakText(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes("Samantha")) || null;
  speechSynthesis.speak(utterance);
}

// Streak update
function updateStreakDisplay() {
  document.getElementById("currentStreak").innerText = "Current Streak: " + currentStreak;
  document.getElementById("longestStreak").innerText = "Longest Streak: " + longestStreak;
}

// ===== Welcome Flow =====
document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("nameEntryScreen");
  speakText("What is your name?");
  document.getElementById("childNameInput").focus();
});

document.getElementById("returningBtn").addEventListener("click", () => {
  if (!childName) {
    speakText("I don’t think we’ve met yet! Let’s get started by entering your name.");
    showScreen("nameEntryScreen");
  } else {
    document.getElementById("returningHeading").innerText = "Welcome back, " + childName + "!";
    showScreen("returningScreen");
    speakText("Welcome back, " + childName + "! Do you want to pick up where you left off, or move on to the next level?");
  }
});

// Name save
document.getElementById("saveNameBtn").addEventListener("click", () => {
  childName = document.getElementById("childNameInput").value.trim();
  if (childName) {
    speakText("Great to meet you, " + childName + "! Let’s set up your game.");
    showScreen("parentOptionsScreen");
  }
});

// Parent options save
document.getElementById("saveParentOptionsBtn").addEventListener("click", () => {
  currentLevel = document.getElementById("startingLevel").value;
  autoNext = document.getElementById("autoNextToggle").checked;
  speakText("Okay " + childName + ", let’s get started with Level " + currentLevel);
  startLevel(currentLevel);
});

// Returning user buttons
document.getElementById("sameLevelBtn").addEventListener("click", () => {
  speakText("Okay " + childName + ", let’s continue with Level " + currentLevel);
  startLevel(currentLevel);
});

document.getElementById("nextLevelBtn").addEventListener("click", () => {
  let next = getNextLevel(currentLevel);
  if (next) {
    currentLevel = next;
    speakText("Okay " + childName + ", let’s move on to Level " + currentLevel);
    startLevel(currentLevel);
  } else {
    speakText("There is no next level yet, " + childName + ".");
  }
});

// Get next level helper
function getNextLevel(level) {
  const order = ["1A", "1B", "1C", "1D"];
  let idx = order.indexOf(level);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}
// ===== Part 2: Gameplay, Level Logic, Summary, End Game =====
let expectedAnswer = [];

function startLevel(level) {
  showScreen("gameScreen");
  currentStreak = 0;
  updateStreakDisplay();
  generateRound(level);
}

function generateRound(level) {
  document.getElementById("answerInput").value = "";
  document.getElementById("answerInput").focus();
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";

  let nums = [1, 2, 3, 4];
  let missingCount = (level === "1A" || level === "1B") ? 1 : 2;

  if (level === "1B" || level === "1D") {
    nums.sort(() => Math.random() - 0.5);
  }

  let missing = [];
  while (missing.length < missingCount) {
    let candidate = nums[Math.floor(Math.random() * nums.length)];
    if (!missing.includes(candidate)) missing.push(candidate);
  }

  expectedAnswer = missing.sort((a, b) => a - b);

  let display = nums.map(n => missing.includes(n) ? "<span class='missing'>?</span>" : n).join(" ");
  document.getElementById("numberDisplay").innerHTML = display;

  let instr = "";
  if (level === "1A") instr = "Find the missing number from one through four.";
  if (level === "1B") instr = "Find the missing number from one through four. The numbers are scrambled.";
  if (level === "1C") instr = "Find the two missing numbers from one through four.";
  if (level === "1D") instr = "Find the two missing numbers from one through four. The numbers are scrambled.";

  document.getElementById("instructions").innerText = instr;
  speakText(instr);
}

// Submit answer
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
    speakText("Great job, " + childName + "! That’s " + currentStreak + " in a row.");
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

  // Milestone check
  if (currentStreak > 0 && currentStreak % 5 === 0) {
    document.getElementById("controlButtons").innerHTML = `
      <button id="nextRoundBtn">Next Round</button>
      <button id="seeSummaryBtn">See Summary So Far</button>
      <button id="endGameBtn2">End Game</button>`;
    speakText("Congratulations, " + childName + "! " + currentStreak + " in a row! You can keep going, see your progress so far, or end the game.");
    document.getElementById("nextRoundBtn").addEventListener("click", () => generateRound(currentLevel));
    document.getElementById("seeSummaryBtn").addEventListener("click", showSummary);
    document.getElementById("endGameBtn2").addEventListener("click", endGame);
  } else {
    document.getElementById("controlButtons").innerHTML = `<button id="nextRoundBtn">Next Round</button>`;
    document.getElementById("nextRoundBtn").addEventListener("click", () => generateRound(currentLevel));
  }
}

// Summary screen
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
      <td>${s.current}</td>
      <td>${s.longest}</td>
      <td>${s.total}</td>
    </tr>`;
    tbody.innerHTML += row;
  });

  speakText("Here’s how you did today, " + childName + ". You can resume the game, change the level, or end the game.");

  document.getElementById("resumeBtn").onclick = () => startLevel(currentLevel);
  document.getElementById("changeLevelBtn").onclick = () => showScreen("parentOptionsScreen");
  document.getElementById("endGameBtn").onclick = () => endGame();
}

// End game
function endGame() {
  showScreen("endGameScreen");
  let msg = "Great job, " + childName + ". Thanks for helping me find all the missing numbers! I’ll always be here waiting for you!";
  document.getElementById("goodbyeMessage").innerText = msg;
  speakText(msg);
}
