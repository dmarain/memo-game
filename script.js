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
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
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

// ===== Level Setup =====
function startLevel(level) {
  document.getElementById("levelTitle").innerText = "Level " + level;
  generateRound(level);
}

function generateRound(level) {
  // Reset UI
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";

  let numbers = [];
  let maxNum = 3;
  let missingCount = 1;

  if (level === "1A") { maxNum = 3; missingCount = 1; }
  if (level === "1B") { maxNum = 3; missingCount = 1; }
  if (level === "1C") { maxNum = 3; missingCount = 2; }
  if (level === "1D") { maxNum = 3; missingCount = 2; }

  for (let i = 1; i <= maxNum; i++) numbers.push(i);

  // Shuffle + select missing
  let shuffled = [...numbers].sort(() => Math.random() - 0.5);
  let missingNums = shuffled.slice(0, missingCount).sort((a, b) => a - b);
  expectedAnswer = missingNums;

  let display = numbers.map(n => missingNums.includes(n) ? "?" : n);
  document.getElementById("numberDisplay").innerText = display.join(" ");

  let instr = `Find the ${missingCount} missing number${missingCount > 1 ? "s" : ""} from 1 to ${maxNum}. Enter numbers separated by spaces.`;
  // Set instructions text + have Memo speak them
document.getElementById("instructions").innerText = instr;
speak(instr);

// Stronger autofocus fix for iPhone Safari
let answerBox = document.getElementById("answerInput");
if (answerBox) {
  answerBox.focus({ preventScroll: true });    // immediate focus
  setTimeout(() => answerBox.focus({ preventScroll: true }), 400); // delayed retry
}

// ===== Answer Check =====
function checkAnswer() {
  let inputBox = document.getElementById("answerInput");
  let submitBtn = document.getElementById("submitBtn");

  let answer = inputBox.value.trim().split(" ").map(x => parseInt(x)).filter(n => !isNaN(n));
  let feedback = document.getElementById("feedback");

  inputBox.disabled = true;
  submitBtn.disabled = true;

  if (JSON.stringify(answer.sort((a, b) => a - b)) === JSON.stringify(expectedAnswer)) {
    feedback.innerText = `Great job, ${childName}!`;
    currentStreak++;
    longestStreak = Math.max(longestStreak, currentStreak);
    levelStats[currentLevel].correct++;
  } else {
    feedback.innerText = `Try again, ${childName}. The correct answer was ${expectedAnswer.join(" ")}.`;
    currentStreak = 0;
    levelStats[currentLevel].incorrect++;
  }
  levelStats[currentLevel].total++;

  document.getElementById("streakDisplay").innerText = "Current streak: " + currentStreak;

  setTimeout(() => {
    inputBox.disabled = false;
    submitBtn.disabled = false;
    generateRound(currentLevel);
  }, 1500);
}

// ===== On Load =====
window.onload = () => {
  showScreen("welcomeScreen");

  // Hear Memo’s Voice
  document.getElementById("hearMemoBtn").addEventListener("click", () => {
    speak("Welcome to MEMO’s Detective Agency. I need your help to find the missing numbers!");
  });

  // First Time User
  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    showScreen("parentScreen");
  });

  // Returning User
  document.getElementById("returningBtn").addEventListener("click", () => {
    showScreen("returningScreen");
  });

  // Returning Submit
  document.getElementById("returningSubmitBtn").addEventListener("click", () => {
    let enteredName = document.getElementById("returningNameInput").value.trim().toUpperCase();
    if (!enteredName) {
      document.getElementById("returningFeedback").innerText = "Please enter a name.";
      return;
    }
    let storedData = JSON.parse(localStorage.getItem(enteredName));
    if (!storedData) {
      document.getElementById("returningFeedback").innerText = "Name not recognized. Please use Parent Settings.";
      return;
    }
    childName = enteredName;
    currentLevel = storedData.lastLevel || "1A";
    levelStats = storedData.stats || {};
    currentStreak = 0;
    longestStreak = 0;
    showScreen("gameScreen");
    startLevel(currentLevel);
  });

  // Parent Save + Start
  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    childName = document.getElementById("childNameInput").value.trim().toUpperCase();
    currentLevel = document.getElementById("levelSelect").value;
    autoNext = document.getElementById("autoNext").checked;

    if (!childName) {
      alert("Please enter a child name.");
      return;
    }

    let storedData = {
      lastLevel: currentLevel,
      stats: levelStats[currentLevel] || { correct: 0, incorrect: 0, longest: 0, total: 0 }
    };
    localStorage.setItem(childName, JSON.stringify(storedData));

    currentStreak = 0;
    longestStreak = 0;
    showScreen("gameScreen");
    startLevel(currentLevel);
  });

  // Back to Welcome
  document.getElementById("backToWelcome").addEventListener("click", () => {
    showScreen("welcomeScreen");
  });

  // Game Submit
  document.getElementById("submitBtn").addEventListener("click", checkAnswer);
  document.getElementById("answerInput").addEventListener("keypress", e => {
    if (e.key === "Enter") checkAnswer();
  });
};
