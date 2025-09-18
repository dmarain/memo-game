// ======= GLOBAL STATE =======
let currentLevel = "1A";
let childName = "";
let autoLevelUp = false;
let timerSetting = "off";
let streak = 0;
let progress = [];
let musicOn = false;

// ======= DOM ELEMENTS =======
const screens = document.querySelectorAll(".screen");
const welcomeScreen = document.getElementById("welcome-screen");
const parentSettings = document.getElementById("parent-settings");
const gameScreen = document.getElementById("game-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const progressScreen = document.getElementById("progress-screen");

const firstTimeBtn = document.getElementById("first-time-btn");
const returningBtn = document.getElementById("returning-btn");
const hearMemoBtn = document.getElementById("hear-memo-btn");
const musicToggleBtn = document.getElementById("music-toggle");

const saveStartBtn = document.getElementById("save-start");

const levelLabel = document.getElementById("level-label");
const numbersDisplay = document.getElementById("numbers-display");
const answerInput = document.getElementById("answer-input");
const submitAnswerBtn = document.getElementById("submit-answer");
const feedback = document.getElementById("feedback");
const streakCounter = document.getElementById("streak-counter");
const timerDisplay = document.getElementById("timer-display");

const celebrationMessage = document.getElementById("celebration-message");
const stayLevelBtn = document.getElementById("stay-level");
const nextLevelBtn = document.getElementById("next-level");
const endGameBtn = document.getElementById("end-game");

const progressGrid = document.getElementById("progress-grid");
const backToWelcomeBtn = document.getElementById("back-to-welcome");

// ======= UTILITIES =======
function showScreen(screen) {
  screens.forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = synth.getVoices().find(v => v.name.includes("Samantha")) || synth.getVoices()[0];
  synth.cancel();
  synth.speak(utter);
}

// ======= WELCOME SCREEN =======
firstTimeBtn.addEventListener("click", () => {
  showScreen(parentSettings);
});

returningBtn.addEventListener("click", () => {
  buildProgressChart();
  showScreen(progressScreen);
});

hearMemoBtn.addEventListener("click", () => {
  speak("Welcome to MEMO’s Detective Agency. I need your help to find the missing numbers.");
});

musicToggleBtn.addEventListener("click", () => {
  musicOn = !musicOn;
  musicToggleBtn.textContent = musicOn ? "Music: ON" : "Music: OFF";
  // For now, no background audio file linked.
});

// ======= PARENT SETTINGS =======
saveStartBtn.addEventListener("click", () => {
  childName = document.getElementById("child-name").value.trim().toUpperCase();
  currentLevel = document.getElementById("start-level").value;
  autoLevelUp = document.getElementById("auto-level-up").checked;
  musicOn = document.getElementById("music-on").checked;
  timerSetting = document.getElementById("timer-select").value;

  streak = 0;
  startLevel(currentLevel);
});

// ======= GAMEPLAY =======
function startLevel(level) {
  currentLevel = level;
  levelLabel.textContent = `Level ${level}`;
  feedback.textContent = "";
  streakCounter.textContent = "";
  answerInput.value = "";
  answerInput.focus();
  showScreen(gameScreen);

  generateProblem(level);
}

function generateProblem(level) {
  numbersDisplay.innerHTML = "";
  let rangeEnd = 3;
  if (level.startsWith("2")) rangeEnd = 4;
  if (level.startsWith("3")) rangeEnd = 5;

  let numbers = Array.from({ length: rangeEnd }, (_, i) => i + 1);
  let missingCount = 1;
  if (level.endsWith("B")) missingCount = 2;
  if (level.endsWith("C")) missingCount = 2; // random order also
  if (level.endsWith("E")) missingCount = 2; // future audio-only variation

  let missing = [];
  while (missing.length < missingCount) {
    let candidate = numbers[Math.floor(Math.random() * numbers.length)];
    if (!missing.includes(candidate)) missing.push(candidate);
  }

  let displayNumbers = numbers.map(n =>
    missing.includes(n) ? "?" : n
  );

  if (level.endsWith("C")) {
    displayNumbers = displayNumbers.sort(() => Math.random() - 0.5);
  }

  displayNumbers.forEach(n => {
    const div = document.createElement("div");
    div.classList.add("number-box");
    div.textContent = n;
    numbersDisplay.appendChild(div);
  });

  // Timer logic
  if (timerSetting !== "off") {
    let seconds = parseInt(timerSetting, 10);
    timerDisplay.textContent = `Visible for ${seconds} seconds...`;
    setTimeout(() => {
      numbersDisplay.innerHTML = "";
      timerDisplay.textContent = "Now enter the missing numbers.";
      answerInput.focus();
    }, seconds * 1000);
  } else {
    timerDisplay.textContent = "";
    answerInput.focus();
  }

  // Store missing in element for checking
  submitAnswerBtn.dataset.missing = missing.join(" ");
}

submitAnswerBtn.addEventListener("click", checkAnswer);

function checkAnswer() {
  const userAnswer = answerInput.value.trim();
  const correctAnswer = submitAnswerBtn.dataset.missing;

  if (userAnswer === correctAnswer) {
    streak++;
    feedback.textContent = `Great job, ${childName}!`;
    speak(`Great job, ${childName}!`);
  } else {
    streak = 0;
    feedback.textContent = `Try again, ${childName}. Missing: ${correctAnswer}`;
    speak(`Try again, ${childName}.`);
  }

  streakCounter.textContent = `Current Streak: ${streak}`;

  if (streak > 0 && streak % 5 === 0) {
    celebrate();
  } else {
    setTimeout(() => {
      answerInput.value = "";
      generateProblem(currentLevel);
    }, 1500);
  }
}

// ======= CELEBRATION =======
function celebrate() {
  showScreen(celebrationScreen);
  celebrationMessage.textContent = "Congratulations! Five in a row!";
  speak("Congratulations — five in a row! You’re becoming a first class detective!");
}

stayLevelBtn.addEventListener("click", () => {
  streak = 0;
  startLevel(currentLevel);
});

nextLevelBtn.addEventListener("click", () => {
  streak = 0;
  let next = nextLevel(currentLevel);
  startLevel(next);
});

endGameBtn.addEventListener("click", () => {
  addProgress(currentLevel);
  buildProgressChart();
  showScreen(progressScreen);
});

// ======= LEVEL LOGIC =======
function nextLevel(level) {
  let base = parseInt(level[0], 10);
  let suffix = level[1];
  if (suffix === "A") return `${base}B`;
  if (suffix === "B") return `${base}C`;
  if (suffix === "C") return `${base + 1}A`;
  return `${base}A`;
}

// ======= PROGRESS CHART =======
function addProgress(level) {
  if (!progress.includes(level)) {
    progress.push(level);
  }
}

function buildProgressChart() {
  progressGrid.innerHTML = "";

  let currentBase = null;
  progress.forEach(level => {
    const div = document.createElement("div");
    div.classList.add("progress-level");
    div.textContent = level;
    progressGrid.appendChild(div);

    let base = parseInt(level[0], 10);
    if (currentBase === null) currentBase = base;

    if (base !== currentBase) {
      const sep = document.createElement("div");
      sep.classList.add("separator");
      progressGrid.appendChild(sep);
      currentBase = base;
    }
  });
}

backToWelcomeBtn.addEventListener("click", () => {
  showScreen(welcomeScreen);
});
