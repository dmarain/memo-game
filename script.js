// script.js

// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;

let currentStreak = 0;
let longestStreak = 0;
let expectedAnswer = [];
let lastProblem = null;

let levelStats = {
  "1A": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "1B": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "1C": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "2A": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "2B": { correct: 0, incorrect: 0, longest: 0, total: 0 },
  "3A": { correct: 0, incorrect: 0, longest: 0, total: 0 }
};

// ===== Screen Control =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.getElementById(id).classList.add("active");
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
    utter.onend = resolve;
    speechSynthesis.speak(utter);
  });
}

// ===== Music Control =====
let musicOn = false;
let bgMusic = new Audio("sounds/background-loop.mp3");
bgMusic.loop = true;

document.getElementById("musicToggle").addEventListener("click", () => {
  if (musicOn) {
    bgMusic.pause();
    musicOn = false;
    document.getElementById("musicToggle").innerText =
      "Music is OFF. Click to turn it ON";
  } else {
    bgMusic.play();
    musicOn = true;
    document.getElementById("musicToggle").innerText =
      "Music is ON. Click to turn it OFF";
  }
});

// ===== Welcome Buttons =====
document.getElementById("hearMemoBtn").addEventListener("click", () => {
  speak("Welcome to Memo's Detective Agency. I need your help to find the missing numbers.");
});

document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("parentSettings");
});

document.getElementById("returningBtn").addEventListener("click", () => {
  showScreen("returningScreen");
  document.getElementById("lastLevelMsg").innerText = `Last completed: ${currentLevel}`;
});

// ===== Parent Settings =====
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  childName = document.getElementById("childNameInput").value.trim().toUpperCase();
  currentLevel = document.getElementById("startLevel").value;
  autoNext = document.getElementById("autoNext").checked;
  showScreen("gameScreen");
  startRound();
});

// ===== Returning User =====
document.getElementById("resumeBtn").addEventListener("click", () => {
  showScreen("gameScreen");
  startRound();
});

document.getElementById("nextLevelBtn").addEventListener("click", () => {
  currentLevel = getNextLevel(currentLevel);
  showScreen("gameScreen");
  startRound();
});

// ===== Gameplay =====
function startRound(repeatSame = false) {
  document.getElementById("levelDisplay").innerText = `Level ${currentLevel}`;
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("streakInfo").innerText =
    `Streak: ${currentStreak} | Longest: ${longestStreak}`;

  generateRound(currentLevel, repeatSame);
}

function generateRound(level, repeatSame = false) {
  let maxNum = 3;
  if (level.startsWith("2")) maxNum = 4;
  if (level.startsWith("3")) maxNum = 5;

  let numbers = Array.from({ length: maxNum }, (_, i) => i + 1);

  let missingCount = 1;
  if (level.endsWith("B")) missingCount = 2;
  if (level.endsWith("C")) missingCount = 2;

  let missing;
  if (repeatSame && lastProblem) {
    missing = lastProblem;
  } else {
    missing = [];
    while (missing.length < missingCount) {
      let rand = numbers[Math.floor(Math.random() * numbers.length)];
      if (!missing.includes(rand)) missing.push(rand);
    }
    // Shuffle numbers for Level C
    if (level.endsWith("C")) {
      numbers.sort(() => Math.random() - 0.5);
    }
    lastProblem = missing;
  }

  expectedAnswer = [...missing].sort((a, b) => a - b);

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

  let instruct = `Find the ${missingCount === 1 ? "missing number" : "two missing numbers"} from one to ${maxNum}. Enter numbers separated by spaces.`;
  document.getElementById("instructionText").innerText = instruct;

  // Speak then allow input
  document.getElementById("answerInput").disabled = true;
  document.getElementById("submitBtn").disabled = true;
  speak(instruct).then(() => {
    document.getElementById("answerInput").disabled = false;
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("answerInput").focus();
  });
}

document.getElementById("submitBtn").addEventListener("click", checkAnswer);
document.getElementById("answerInput").addEventListener("keypress", e => {
  if (e.key === "Enter") checkAnswer();
});

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim();
  if (!input) {
    document.getElementById("feedback").innerText = "Please input a number before submitting.";
    return;
  }

  // Disable submit after click until next round
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

    // Clear and refocus input, repeat same problem
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
  currentStreak = 0; // reset streak after celebration
}

document.getElementById("stayBtn").addEventListener("click", () => {
  showScreen("gameScreen");
  startRound();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentLevel = getNextLevel(currentLevel);
  showScreen("gameScreen");
  startRound();
});

document.getElementById("endBtn").addEventListener("click", () => {
  showSummary(true);
});

// ===== End Screen =====
function showSummary(fromEndGame = false) {
  showScreen("endScreen");
  let summary = `Summary for ${childName}:\n\n`;
  for (let lvl in levelStats) {
    if (levelStats[lvl].total > 0) {
      summary += `${lvl} - Correct: ${levelStats[lvl].correct}, Incorrect: ${levelStats[lvl].incorrect}, Total: ${levelStats[lvl].total}\n`;
    }
  }
  summary += `\nOverall Longest Streak: ${longestStreak}`;
  if (fromEndGame) {
    summary += `\n\nYou ended mid-level. You can resume your progress.`;
    let resumeBtn = document.createElement("button");
    resumeBtn.innerText = "Resume Current Level";
    resumeBtn.onclick = () => {
      showScreen("gameScreen");
      startRound(true);
    };
    document.getElementById("summaryText").innerText = summary;
    document.getElementById("summaryText").appendChild(resumeBtn);
  } else {
    document.getElementById("summaryText").innerText = summary;
  }
}

document.getElementById("restartBtn").addEventListener("click", () => {
  currentStreak = 0;
  longestStreak = 0;
  for (let key in levelStats) {
    levelStats[key] = { correct: 0, incorrect: 0, longest: 0, total: 0 };
  }
  showScreen("welcomeScreen");
});

// ===== Helpers =====
function getNextLevel(level) {
  const order = ["1A","1B","1C","2A","2B","3A"];
  let idx = order.indexOf(level);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : level;
}

// ===== Initialize =====
window.onload = () => {
  showScreen("welcomeScreen");
};
