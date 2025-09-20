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
  "1D": { correct: 0, incorrect: 0, longest: 0, total: 0 }
};

// ===== Utility =====
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

// ===== Welcome Screen =====
document.getElementById("hearMemoBtn").addEventListener("click", () => {
  speak("Welcome to MEMO’s Detective Agency. I need your help to find the missing numbers!");
});

document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("parentScreen");
});

document.getElementById("returningBtn").addEventListener("click", () => {
  // For now, resume from last level
  showScreen("parentScreen");
});

// ===== Parent Settings =====
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  childName = document.getElementById("childNameInput").value.trim().toUpperCase();
  currentLevel = document.getElementById("levelSelect").value;
  autoNext = document.getElementById("autoNext").checked;

  currentStreak = 0;
  longestStreak = 0;

  showScreen("gameScreen");
  startLevel(currentLevel);
});

// ===== Level Setup =====
function startLevel(level) {
  document.getElementById("levelTitle").innerText = "Level " + level;
  generateRound(level);
}

// ===== Generate Round =====
function generateRound(level) {
  // Reset UI
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";
  document.getElementById("streakDisplay").innerText = "Current streak: " + currentStreak;
  document.getElementById("instructions").innerText = "";

  let numbers = [];
  let maxNum = 3;
  let missingCount = 1;

  if (level === "1A") { maxNum = 3; missingCount = 1; }
  if (level === "1B") { maxNum = 3; missingCount = 1; }
  if (level === "1C") { maxNum = 3; missingCount = 2; }
  if (level === "1D") { maxNum = 3; missingCount = 1; }

  numbers = [];
  for (let i = 1; i <= maxNum; i++) numbers.push(i);

  let shuffled = [...numbers];
  shuffled.sort(() => Math.random() - 0.5);

  let missingNums = shuffled.slice(0, missingCount).sort((a, b) => a - b);
  expectedAnswer = missingNums;

  let display = numbers.map(n => {
    return missingNums.includes(n)
      ? `<div class="numberBox missing">?</div>`
      : `<div class="numberBox">${n}</div>`;
  }).join("");

  document.getElementById("numberDisplay").innerHTML = display;

  let instr = `Find the ${missingCount === 1 ? "one missing number" : missingCount + " missing numbers"} from 1 to ${maxNum}. Enter numbers separated by spaces.`;
  document.getElementById("instructions").innerText = instr;
  speak(instr);

  setTimeout(() => document.getElementById("answerInput").focus(), 300);
}

// ===== Submit Answer =====
document.getElementById("submitBtn").addEventListener("click", checkAnswer);
document.getElementById("answerInput").addEventListener("keypress", e => {
  if (e.key === "Enter") checkAnswer();
});

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim();
  if (input === "") {
    document.getElementById("feedback").innerText = "Please input a number before clicking Submit.";
    return;
  }

  let childAns = input.split(" ").map(x => parseInt(x)).filter(n => !isNaN(n));
  childAns.sort((a, b) => a - b);

  let correct = JSON.stringify(childAns) === JSON.stringify(expectedAnswer);

  if (correct) {
    currentStreak++;
    longestStreak = Math.max(longestStreak, currentStreak);
    levelStats[currentLevel].correct++;
    document.getElementById("feedback").innerText = `Great job, ${childName}! That's ${currentStreak} in a row.`;
    speak(`Great job, ${childName}! That's ${currentStreak} in a row.`);

    if (currentStreak % 5 === 0) {
      celebrateStreak();
      return;
    }
  } else {
    document.getElementById("feedback").innerText = `Not quite, ${childName}. Try again next round.`;
    speak(`Not quite, ${childName}. Try again next round.`);
    currentStreak = 0;
    levelStats[currentLevel].incorrect++;
  }

  levelStats[currentLevel].total++;
  document.getElementById("controlButtons").innerHTML =
    `<button id="nextRoundBtn">Next Round</button>`;
  document.getElementById("nextRoundBtn").addEventListener("click", () => generateRound(currentLevel));
}

// ===== Streak Celebration =====
function celebrateStreak() {
  document.getElementById("feedback").innerText =
    `Congratulations — five in a row! You’re becoming a first class detective!`;

  speak("Congratulations — five in a row! You’re becoming a first class detective!");

  document.getElementById("controlButtons").innerHTML = `
    <button id="sameLevelBtn">Stay on Same Level</button>
    <button id="nextLevelBtn">Go to Next Level</button>
    <button id="seeProgressBtn">See Progress</button>
    <button id="quitBtn">Quit</button>
  `;

  document.getElementById("sameLevelBtn").addEventListener("click", () => {
    generateRound(currentLevel);
  });

  document.getElementById("nextLevelBtn").addEventListener("click", () => {
    currentLevel = getNextLevel(currentLevel);
    currentStreak = 0;
    startLevel(currentLevel);
  });

  document.getElementById("seeProgressBtn").addEventListener("click", () => {
    showProgress();
  });

  document.getElementById("quitBtn").addEventListener("click", () => {
    showScreen("welcomeScreen");
  });
}

// ===== Next Level Helper =====
function getNextLevel(level) {
  const order = ["1A", "1B", "1C", "1D"];
  let idx = order.indexOf(level);
  return (idx >= 0 && idx < order.length - 1) ? order[idx + 1] : "1A";
}

// ===== Progress Screen =====
function showProgress() {
  showScreen("progressScreen");
  let details = "";
  for (let lvl in levelStats) {
    let s = levelStats[lvl];
    details += `<p><strong>${lvl}</strong> — Correct: ${s.correct}, Incorrect: ${s.incorrect}, Longest Streak: ${s.longest}, Total: ${s.total}</p>`;
  }
  document.getElementById("progressDetails").innerHTML = details;
}

// ===== Voice =====
function speak(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  let utter = new SpeechSynthesisUtterance(text);
  utter.voice = synth.getVoices().find(v => v.name.includes("Samantha")) || null;
  synth.cancel();
  synth.speak(utter);
}
