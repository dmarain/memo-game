// script.js (09-14-25c)

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
      setupClearLogs(); // rebind after wiping
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

let levelStats = {
  "1A": { correct: 0, incorrect: 0, total: 0 },
  "1B": { correct: 0, incorrect: 0, total: 0 },
  "1C": { correct: 0, incorrect: 0, total: 0 },
  "2A": { correct: 0, incorrect: 0, total: 0 },
  "2B": { correct: 0, incorrect: 0, total: 0 },
  "3A": { correct: 0, incorrect: 0, total: 0 }
};

// ===== Screen Control =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("active");
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

// ===== Music Control =====
let musicOn = false;
let bgMusic = new Audio("sounds/background-loop.mp3");
bgMusic.loop = true;

// ===== Main Init =====
window.onload = () => {
  showScreen("welcomeScreen");
  logDebug("App started, welcome screen active");

  // Bind Clear Logs
  setupClearLogs();

  // Welcome Screen
  document.getElementById("musicToggle").addEventListener("click", () => {
    logDebug("Music toggle clicked");
    if (musicOn) {
      bgMusic.pause();
      musicOn = false;
      document.getElementById("musicToggle").innerText =
        "Music is OFF. Click to turn it ON";
      logDebug("Music turned OFF");
    } else {
      bgMusic.play();
      musicOn = true;
      document.getElementById("musicToggle").innerText =
        "Music is ON. Click to turn it OFF";
      logDebug("Music turned ON");
    }
  });

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
    showScreen("returningScreen");
    document.getElementById("lastLevelMsg").innerText =
      `Last completed: ${currentLevel}`;
  });

  // Parent Settings
  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    childName = document.getElementById("childNameInput").value.trim().toUpperCase();
    logDebug(`Save Settings clicked – Child: ${childName}`);
    currentLevel = document.getElementById("startLevel").value;
    autoNext = document.getElementById("autoNext").checked;
    showScreen("gameScreen");
    startRound();
  });

  // Returning Screen
  document.getElementById("resumeBtn").addEventListener("click", () => {
    logDebug("Resume clicked");
    showScreen("gameScreen");
    startRound();
  });

  document.getElementById("nextLevelBtn").addEventListener("click", () => {
    logDebug("Next Level clicked");
    currentLevel = getNextLevel(currentLevel);
    showScreen("gameScreen");
    startRound();
  });

  // Game Screen
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

  // Celebration Screen
  document.getElementById("stayBtn").addEventListener("click", () => {
    logDebug("Stay clicked");
    showScreen("gameScreen");
    startRound();
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    logDebug("Next clicked");
    currentLevel = getNextLevel(currentLevel);
    showScreen("gameScreen");
    startRound();
  });

  document.getElementById("endBtn").addEventListener("click", () => {
    logDebug("End Game clicked");
    showSummary(true);
  });

  // End Screen
  document.getElementById("restartBtn").addEventListener("click", () => {
    logDebug("Restart clicked");
    currentStreak = 0;
    longestStreak = 0;
    for (let key in levelStats) {
      levelStats[key] = { correct: 0, incorrect: 0, total: 0 };
    }
    showScreen("welcomeScreen");
  });
};

// ===== Gameplay =====
function startRound(repeatSame = false) {
  document.getElementById("levelDisplay").innerText = `Detective ${childName} – Level ${currentLevel}`;
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";
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

  let missingCount = 1;
  if (level.endsWith("B") || level.endsWith("C")) missingCount = 2;

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

  // Display numbers
  let display = document.getElementById("numberDisplay");
  display.innerHTML = "";
  numbers.forEach(num => {
    let box = document.createElement("div");
    box.className = "number-box";
    box.innerText = missing.includes(num) ? "?" : num;
    if (missing.includes(num)) box.classList.add("missing");
    display.appendChild(box);
  });

  // Instruction
  let instruct =
    missingCount === 1
      ? `Find the missing number from 1 to ${maxNum}.`
      : `Find the ${missingCount} missing numbers from 1 to ${maxNum}.`;
  document.getElementById("instructionText").innerText = instruct;

  // Placeholder
  document.getElementById("answerInput").placeholder =
    missingCount === 1 ? "Type the missing number" : "Type missing numbers separated by spaces";

  // Lock input
  document.getElementById("answerInput").disabled = true;
  document.getElementById("submitBtn").disabled = true;

  // Speak
  const introLine = `Detective ${childName}, here is your next challenge. `;
  speak(introLine + instruct + " Type your answer here and press Submit, or press the Return key.")
    .then(() => {
      document.getElementById("answerInput").disabled = false;
      document.getElementById("submitBtn").disabled = false;
      document.getElementById("answerInput").focus();
      logDebug("Input unlocked and auto-focused");
    });
}

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim();
  if (!input) {
    document.getElementById("feedback").innerText = "Please input a number before submitting.";
    logDebug("Empty input submitted");
    return;
  }

  document.getElementById("submitBtn").disabled = true;

  let userAns = input.split(" ").map(x => parseInt(x)).filter(x => !isNaN(x)).sort((a, b) => a - b);
  levelStats[currentLevel].total++;

  if (JSON.stringify(userAns) === JSON.stringify(expectedAnswer)) {
    let praise = [
      `Great job, ${childName}!`,
      `Nice work, ${childName}!`,
      `That’s correct, ${childName}!`,
      `Awesome, ${childName}!`
    ];
    let streakMsg = currentStreak > 0 ? ` That’s ${currentStreak + 1} in a row!` : "";
    document.getElementById("feedback").innerText = "Correct!";
    speak(praise[Math.floor(Math.random() * praise.length)] + streakMsg);

    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    logDebug(`Correct answer. Streak=${currentStreak}, Longest=${longestStreak}`);

    if (currentStreak % 5 === 0) {
      showCelebration();
      return;
    }
    setTimeout(() => startRound(false), 1500);
  } else {
    let encouragement = [
      `Not quite, ${childName}. Try again!`,
      `Almost, ${childName}. Let’s give it another shot.`,
      `Keep going, ${childName}, you can do it!`
    ];
    document.getElementById("feedback").innerText = "Try again!";
    speak(encouragement[Math.floor(Math.random() * encouragement.length)]);

    currentStreak = 0;
    levelStats[currentLevel].incorrect++;
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
  showScreen("celebrationScreen");
  document.getElementById("celebrationMsg").innerText =
    `Congratulations ${childName}! Five in a row — you're becoming a first-class detective!`;
  speak(`Congratulations ${childName}! Five in a row — you're becoming a first-class detective!`);
  logDebug("Celebration triggered (5 in a row)");
  currentStreak = 0;
}

// ===== End Screen =====
function showSummary(fromEndGame = false) {
  showScreen("endScreen");
  let summary = `Progress for ${childName}:\n\n`;
  for (let lvl in levelStats) {
    if (levelStats[lvl].total > 0) {
      summary += `${lvl} - Correct: ${levelStats[lvl].correct}, Incorrect: ${levelStats[lvl].incorrect}, Total: ${levelStats[lvl].total}\n`;
    }
  }
  summary += `\nOverall Longest Streak: ${longestStreak}`;
  document.getElementById("summaryText").innerText = summary;

  speak(`Here is your progress, ${childName}.`);

  if (fromEndGame) {
    logDebug(`End game screen shown for ${childName}`);
  }
}

// ===== Helpers =====
function getNextLevel(level) {
  const order = ["1A", "1B", "1C", "2A", "2B", "3A"];
  let idx = order.indexOf(level);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : level;
}
