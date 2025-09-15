// script.js (09-14-25d)

// ===== Debug Helper =====
function logDebug(message) {
  console.log(message);
  const panel = document.getElementById("debugPanel");
  if (panel) {
    const p = document.createElement("div");
    const now = new Date().toLocaleTimeString();
    p.textContent = `[${now}] ${message}`;
    panel.appendChild(p);
    panel.scrollTop = panel.scrollHeight; // auto-scroll
  }
}

// ===== Clear Logs =====
function setupClearLogs() {
  const clearBtn = document.getElementById("clearLogsBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const panel = document.getElementById("debugPanel");
      panel.innerHTML = '<button id="clearLogsBtn">Clear Logs</button>';
      logDebug("Logs cleared");
      setupClearLogs(); // rebind after wipe
    });
  }
}

// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;

let currentStreak = 0;
let longestStreak = 0;
let expectedAnswer = [];
let lastProblem = null;
let firstRound = true;

let levelStats = {
  "1A": { correct: 0, incorrect: 0, total: 0 },
  "1B": { correct: 0, incorrect: 0, total: 0 },
  "1C": { correct: 0, incorrect: 0, total: 0 }
};

// ===== Screen Control =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    logDebug(`Switched to ${id} for child ${childName || "N/A"}`);
  }
}

// ===== Speech Setup =====
function speak(text) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const femaleVoice =
      voices.find(v => v.name.includes("Samantha") || v.name.includes("Female")) ||
      voices[0];
    utter.voice = femaleVoice;
    utter.onstart = () => logDebug(`Memo speaking: "${text}"`);
    utter.onend = () => {
      logDebug("Memo finished speaking");
      resolve();
    };
    speechSynthesis.speak(utter);
  });
}

// ===== Main Init =====
window.onload = () => {
  showScreen("welcomeScreen");
  logDebug("App started, welcome screen active");

  setupClearLogs();

  // Welcome buttons
  document.getElementById("hearMemoBtn").addEventListener("click", () => {
    logDebug("Hear Memo clicked");
    speak("Welcome to Memo's Detective Agency. I need your help to find the missing numbers.");
  });

  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    logDebug("First-Time clicked");
    showScreen("parentSettings");
  });

  document.getElementById("returningBtn").addEventListener("click", () => {
    logDebug("Returning clicked");
    showScreen("progressScreen");
    updateProgress();
  });

  document.getElementById("saveSettings").addEventListener("click", () => {
    childName = document.getElementById("childNameInput").value.trim().toUpperCase();
    currentLevel = document.getElementById("startingLevel").value;
    autoNext = document.getElementById("autoLevelUp").checked;
    firstRound = true;
    logDebug(`Settings saved for child ${childName}, level ${currentLevel}`);
    showScreen("gameScreen");
    startRound();
  });

  // Resume / End buttons
  document.getElementById("resumeBtn").addEventListener("click", () => {
    logDebug("Resume clicked");
    showScreen("gameScreen");
    startRound();
  });

  document.getElementById("endBtn").addEventListener("click", () => {
    logDebug("End Game clicked");
    resetGame();
  });

  // Submit
  document.getElementById("submitBtn").addEventListener("click", () => {
    logDebug("Submit clicked");
    checkAnswer();
  });

  document.getElementById("answerInput").addEventListener("keypress", e => {
    if (e.key === "Enter") {
      logDebug("Enter pressed");
      checkAnswer();
    }
  });
};

// ===== Gameplay =====
function startRound(repeatSame = false) {
  document.getElementById("levelLabel").innerText =
    `Detective ${childName} – Level ${currentLevel}`;
  document.getElementById("feedback").innerText = "";
  document.getElementById("celebration").innerText = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("streakInfo").innerText =
    `Streak: ${currentStreak} | Longest: ${longestStreak}`;

  logDebug(`Starting round: Level ${currentLevel} for ${childName}`);

  generateRound(currentLevel, repeatSame);
}

function generateRound(level, repeatSame = false) {
  let maxNum = 3;
  if (level.startsWith("2")) maxNum = 4;
  if (level.startsWith("3")) maxNum = 5;

  let numbers = Array.from({ length: maxNum }, (_, i) => i + 1);
  let missingCount = (level.endsWith("B") || level.endsWith("C")) ? 2 : 1;

  let missing;
  if (repeatSame && lastProblem) {
    missing = lastProblem;
  } else {
    missing = [];
    while (missing.length < missingCount) {
      let rand = numbers[Math.floor(Math.random() * numbers.length)];
      if (!missing.includes(rand)) missing.push(rand);
    }
    if (level.endsWith("C")) numbers.sort(() => Math.random() - 0.5);
    lastProblem = missing;
  }

  expectedAnswer = [...missing].sort((a, b) => a - b);
  logDebug(`Expected answer: ${expectedAnswer.join(" ")}`);

  let display = document.getElementById("numberDisplay");
  display.innerHTML = "";
  numbers.forEach(num => {
    let box = document.createElement("div");
    box.className = "number-box";
    box.innerText = missing.includes(num) ? "?" : num;
    if (missing.includes(num)) box.classList.add("missing");
    display.appendChild(box);
  });

  let instruct =
    missingCount === 1
      ? `Find the missing number from 1 to ${maxNum}.`
      : `Find the ${missingCount} missing numbers from 1 to ${maxNum}.`;
  document.getElementById("instruction").innerText = instruct;

  let speechLine;
  if (firstRound) {
    speechLine = `Detective ${childName}, here is your next challenge. ${instruct} Type your answer here and press Submit, or press the Return key.`;
    firstRound = false;
  } else {
    speechLine = `Detective ${childName}, ${instruct}`;
  }

  document.getElementById("answerInput").disabled = true;
  document.getElementById("submitBtn").disabled = true;

  speak(speechLine).then(() => {
    document.getElementById("answerInput").disabled = false;
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("answerInput").focus();
    logDebug("Input unlocked and auto-focused");
  });
}

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim();
  if (!input) {
    document.getElementById("feedback").innerText =
      "Please input a number before submitting.";
    logDebug("Empty input submitted");
    return;
  }

  let userAns = input
    .split(" ")
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))
    .sort((a, b) => a - b);

  levelStats[currentLevel].total++;

  if (JSON.stringify(userAns) === JSON.stringify(expectedAnswer)) {
    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    document.getElementById("feedback").innerText = "Correct!";
    speak(`Great job, ${childName}! That’s ${currentStreak} in a row.`);

    logDebug(`Correct answer. Streak=${currentStreak}, Longest=${longestStreak}`);

    if (currentStreak % 5 === 0) {
      showCelebration();
      return;
    }

    setTimeout(() => startRound(false), 1500);
  } else {
    currentStreak = 0;
    levelStats[currentLevel].incorrect++;

    document.getElementById("feedback").innerText = "Try again!";
    speak(`Not quite, Detective ${childName}. Try again with the same problem.`);

    logDebug("Incorrect answer. Streak reset to 0");

    setTimeout(() => {
      document.getElementById("answerInput").value = "";
      document.getElementById("answerInput").focus();
      startRound(true);
    }, 1500);
  }
}

// ===== Celebration =====
function showCelebration() {
  document.getElementById("celebration").innerText =
    `🎉 Congratulations ${childName}! Five in a row — you're becoming a first-class detective! 🎉`;
  speak(`Congratulations ${childName}! Five in a row — you're becoming a first-class detective!`);
  logDebug("Celebration triggered (5 in a row)");

  updateProgress();
  showScreen("progressScreen");

  currentStreak = 0;
}

// ===== Progress =====
function updateProgress() {
  document.getElementById("progressTitle").innerText =
    `Detective ${childName}'s Progress`;

  let tableHTML = "<table><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Total</th></tr>";
  for (let lvl in levelStats) {
    if (levelStats[lvl].total > 0) {
      tableHTML += `<tr><td>${lvl}</td><td>${levelStats[lvl].correct}</td><td>${levelStats[lvl].incorrect}</td><td>${levelStats[lvl].total}</td></tr>`;
    }
  }
  tableHTML += "</table>";
  document.getElementById("progressTable").innerHTML = tableHTML;

  document.getElementById("overallStreak").innerText =
    `Overall Longest Streak: ${longestStreak}`;
  logDebug("Progress chart updated");
}

// ===== Helpers =====
function resetGame() {
  currentStreak = 0;
  longestStreak = 0;
  for (let key in levelStats) {
    levelStats[key] = { correct: 0, incorrect: 0, total: 0 };
  }
  logDebug("Game reset");
  showScreen("welcomeScreen");
}
