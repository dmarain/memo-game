// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;
let useTimer = false;
let timerSeconds = 10;

let currentStreak = 0;
let expectedAnswer = [];
let lastCompletedLevel = "1A";

// Background music
let musicEnabled = false;
const bgMusic = new Audio("sounds/background-loop.mp3");
bgMusic.loop = true;

// Speech synthesis setup
let memoVoice = null;
function setMemoVoice() {
  const voices = speechSynthesis.getVoices();
  memoVoice = voices.find(v => v.name.includes("Samantha")) || voices[0];
}
speechSynthesis.onvoiceschanged = setMemoVoice;

function speak(text) {
  if (!memoVoice) setMemoVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = memoVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// ===== Screen Control =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.getElementById(id).classList.add("active");
}

// ===== Welcome Screen =====
document.getElementById("hearMemoBtn").addEventListener("click", () => {
  speak("Welcome to Memo’s Detective Agency. I need your help to find the missing numbers!");
});

document.getElementById("firstTimeBtn").addEventListener("click", () => {
  showScreen("parentSettings");
});

document.getElementById("returningBtn").addEventListener("click", () => {
  showScreen("returningScreen");
  document.getElementById("lastLevelInfo").innerText =
    `You last completed Level ${lastCompletedLevel}. You may continue from here or go one level higher.`;
});

document.getElementById("musicToggle").addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    bgMusic.play();
    document.getElementById("musicToggle").innerText = "Music is ON. Click to turn it OFF";
  } else {
    bgMusic.pause();
    document.getElementById("musicToggle").innerText = "Music is OFF. Click to turn it ON";
  }
});

// ===== Parent Settings =====
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("childNameInput").value.trim();
  if (nameInput) {
    childName = nameInput.toUpperCase();
  }
  currentLevel = document.getElementById("startingLevel").value;
  autoNext = document.getElementById("autoLevelUp").checked;
  useTimer = document.getElementById("useTimer").checked;
  timerSeconds = parseInt(document.getElementById("timerSeconds").value);
  startGame();
});

// ===== Returning User =====
document.getElementById("resumeBtn").addEventListener("click", () => {
  currentLevel = lastCompletedLevel;
  startGame();
});

// ===== Game Logic =====
function startGame() {
  currentStreak = 0;
  showScreen("gameScreen");
  generateRound(currentLevel);
}

function generateRound(level) {
  // Reset UI
  document.getElementById("answerInput").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("controlButtons").innerHTML = "";
  document.getElementById("timerDisplay").classList.add("hidden");

  let rangeEnd = 3;
  if (level.startsWith("2")) rangeEnd = 4;
  if (level.startsWith("3")) rangeEnd = 5;

  let numbers = Array.from({ length: rangeEnd }, (_, i) => i + 1);
  let missingCount = 1;
  if (level.endsWith("B")) missingCount = 2;
  if (level.endsWith("C")) missingCount = 2;

  // Shuffle for Level C
  if (level.endsWith("C")) {
    numbers = numbers.sort(() => Math.random() - 0.5);
  }

  expectedAnswer = [];
  for (let i = 0; i < missingCount; i++) {
    const idx = Math.floor(Math.random() * numbers.length);
    expectedAnswer.push(numbers[idx]);
    numbers[idx] = "?";
  }

  // Display numbers
  const numberDisplay = document.getElementById("numberDisplay");
  numberDisplay.innerHTML = "";
  numbers.forEach(num => {
    const span = document.createElement("span");
    if (num === "?") {
      span.innerText = "?";
      span.classList.add("missing");
    } else {
      span.innerText = num;
    }
    numberDisplay.appendChild(span);
  });

  // Instructions
  let instructionText = `Find the ${missingCount} missing number${missingCount > 1 ? "s" : ""} from 1 to ${rangeEnd}. Enter them separated by a space.`;
  document.getElementById("instructions").innerText = instructionText;
  speak(`${childName}, ${instructionText}`);

  // Timer logic
  if (useTimer) {
    let timeLeft = timerSeconds;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.innerText = `Memorize... ${timeLeft}`;
    timerDisplay.classList.remove("hidden");
    const countdown = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        timerDisplay.innerText = `Memorize... ${timeLeft}`;
      } else {
        clearInterval(countdown);
        numberDisplay.innerHTML = ""; // hide numbers
        timerDisplay.innerText = "Go!";
        setTimeout(() => {
          timerDisplay.classList.add("hidden");
          document.getElementById("answerInput").focus();
        }, 1000);
      }
    }, 1000);
  } else {
    document.getElementById("answerInput").focus();
  }
}

// ===== Answer Submission =====
document.getElementById("answerInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    submitAnswer();
  }
});

function submitAnswer() {
  const input = document.getElementById("answerInput").value.trim();
  if (!input) {
    document.getElementById("feedback").innerText =
      "Please input a number before clicking Submit or Enter.";
    return;
  }
  const parts = input.split(" ").map(x => parseInt(x));
  const correct = expectedAnswer.every(num => parts.includes(num));

  if (correct) {
    currentStreak++;
    document.getElementById("feedback").innerText =
      `Great job, ${childName}! That’s ${currentStreak} in a row.`;
    speak(`Great job, ${childName}! That’s ${currentStreak} in a row.`);
    if (currentStreak >= 5) {
      lastCompletedLevel = currentLevel;
      showCelebration();
      return;
    }
    setTimeout(() => generateRound(currentLevel), 1500);
  } else {
    currentStreak = 0;
    document.getElementById("feedback").innerText =
      `Not quite, ${childName}. Try again!`;
    speak(`Not quite, ${childName}. Try again!`);
    setTimeout(() => generateRound(currentLevel), 1500);
  }
}

// ===== Celebration =====
function showCelebration() {
  showScreen("celebrationScreen");
  document.getElementById("celebrationMessage").innerText =
    "Congratulations — five in a row! You’re becoming a first-class detective!";
  speak("Congratulations — five in a row! You’re becoming a first-class detective!");
}

// Celebration buttons
document.getElementById("stayLevelBtn").addEventListener("click", () => {
  showScreen("gameScreen");
  currentStreak = 0;
  generateRound(currentLevel);
});

document.getElementById("nextLevelBtn").addEventListener("click", () => {
  const next = getNextLevel(currentLevel);
  if (next) {
    currentLevel = next;
    currentStreak = 0;
    showScreen("gameScreen");
    generateRound(currentLevel);
  } else {
    showEndScreen();
  }
});

document.getElementById("endGameBtn").addEventListener("click", () => {
  showEndScreen();
});

// ===== End Screen =====
function showEndScreen() {
  showScreen("endScreen");
  document.getElementById("summaryStats").innerText =
    `You finished at Level ${currentLevel}. Longest streak: ${currentStreak}.`;
}

document.getElementById("playAgainBtn").addEventListener("click", () => {
  showScreen("welcomeScreen");
});

// ===== Level Progression =====
function getNextLevel(level) {
  const levels = ["1A","1B","1C","2A","2B","2C","3A","3B","3C"];
  const idx = levels.indexOf(level);
  if (idx >= 0 && idx < levels.length - 1) {
    return levels[idx + 1];
  }
  return null;
}
