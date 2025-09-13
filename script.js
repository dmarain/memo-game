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
    const femaleVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Female")) || voices[0];
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
    document.getElementById("musicToggle").innerText = "Music is OFF. Click to turn it ON";
  } else {
    bgMusic.play();
    musicOn = true;
    document.getElementById("musicToggle").innerText = "Music is ON. Click to turn it OFF";
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
function startRound() {
  document.getElementById("levelDisplay").innerText = `Level ${currentLevel}`;
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("streakInfo").innerText = `Streak: ${currentStreak} | Longest: ${longestStreak}`;

  generateRound(currentLevel);
}

function generateRound(level) {
  let maxNum = 3;
  if (level.startsWith("2")) maxNum = 4;
  if (level.startsWith("3")) maxNum = 5;

  let numbers = Array.from({ length: maxNum }, (_, i) => i + 1);

  let missingCount = 1;
  if (level.endsWith("B")) missingCount = 2;
  if (level.endsWith("C")) missingCount = 2;

  let missing = [];
  while (missing.length < missingCount) {
    let rand = numbers[Math.floor(Math.random() * numbers.length)];
    if (!missing.includes(rand)) missing.push(rand);
  }
  expectedAnswer = missing.sort((a, b) => a - b);

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
  let userAns = input.split(" ").map(x => parseInt(x)).filter(x => !isNaN(x)).sort((a, b) => a - b);

  levelStats[currentLevel].total++;

  if (JSON.stringify(userAns) === JSON.stringify(expectedAnswer)) {
    document.getElementById("feedback").innerText = "Great job!";
    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    if (currentStreak % 5 === 0) {
      showCelebration();
      return;
    }
    setTimeout(startRound, 1500);
  } else {
    document.getElementById("feedback").innerText = "Try again!";
    currentStreak = 0;
    levelStats[currentLevel].incorrect++;
    setTimeout(startRound, 1500);
  }
}

// ===== Celebration =====
function showCelebration() {
  showScreen("celebrationScreen");
  document.getElementById("celebrationMsg").innerText =
    `Congratulations ${childName}! Five in a row — you're becoming a first-class detective!`;
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
  showSummary();
});

// ===== End Screen =====
function showSummary() {
  showScreen("endScreen");
  let summary = `Summary for ${childName}:\n\n`;
  for (let lvl in levelStats) {
    if (levelStats[lvl].total > 0) {
      summary += `${lvl} - Correct: ${levelStats[lvl].correct}, Incorrect: ${levelStats[lvl].incorrect}, Longest Streak: ${levelStats[lvl].longest}, Total: ${levelStats[lvl].total}\n`;
    }
  }
  summary += `\nOverall Longest Streak: ${longestStreak}`;
  document.getElementById("summaryText").innerText = summary;
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
};y 
