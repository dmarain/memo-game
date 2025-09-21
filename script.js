// ===== Global Setup =====
let childName = "";
let currentLevel = "1A";
let autoNext = false;
let currentStreak = 0;
let expectedAnswer = [];

// ===== Utility: Screen Switching =====
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
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

// ===== On Load =====
window.onload = () => {
  showScreen("welcomeScreen");

  const hearBtn = document.getElementById("hearMemoBtn");
  if (hearBtn) {
    hearBtn.addEventListener("click", () => {
      speak("Welcome to MEMO’s Detective Agency!");
    });
  }

  const firstBtn = document.getElementById("firstTimeBtn");
  if (firstBtn) {
    firstBtn.addEventListener("click", () => {
      showScreen("parentScreen");
    });
  }

  const returnBtn = document.getElementById("returningBtn");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      showScreen("returningScreen");
    });
  }

  const saveBtn = document.getElementById("saveSettingsBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      childName = document.getElementById("childNameInput").value.trim();
      currentLevel = document.getElementById("levelSelect").value;
      autoNext = document.getElementById("autoNext").checked;
      startLevel(currentLevel);
      showScreen("gameScreen");
    });
  }

  const returnSubmit = document.getElementById("returningSubmitBtn");
  if (returnSubmit) {
    returnSubmit.addEventListener("click", () => {
      let enteredName = document.getElementById("returningNameInput").value.trim();
      if (!enteredName) {
        document.getElementById("returningFeedback").innerText = "Please enter a name.";
        return;
      }
      childName = enteredName;
      showScreen("gameScreen");
      startLevel("1A"); // default for returning users
    });
  }

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      checkAnswer();
    });
  }
}

// ===== Level Logic =====
function startLevel(level) {
  currentLevel = level;
  currentStreak = 0;
  document.getElementById("streakDisplay").innerText = "Current streak: " + currentStreak;
  generateRound(level);
}

function generateRound(level) {
  const maxNum = 3;
  let missingCount = (level === "1A" || level === "1B") ? 1 : 2;

  let numbers = [];
  for (let i = 1; i <= maxNum; i++) numbers.push(i);

  let shuffled = [...numbers].sort(() => Math.random() - 0.5);
  let missingNums = shuffled.slice(0, missingCount).sort((a, b) => a - b);
  expectedAnswer = missingNums;

  let display = numbers.map(n =>
    missingNums.includes(n) ? "?" : n
  ).join(" ");

  document.getElementById("levelTitle").innerText = "Level " + level;
  document.getElementById("instructions").innerText =
    `Find the ${missingCount} missing number${missingCount > 1 ? "s" : ""} from 1 to ${maxNum}. Enter numbers separated by spaces.`;
  document.getElementById("numberDisplay").innerText = display;

  let answerBox = document.getElementById("answerInput");
  answerBox.value = "";
  setTimeout(() => answerBox.focus(), 300);
}

function checkAnswer() {
  let input = document.getElementById("answerInput").value.trim().split(/\s+/).map(Number);
  let feedback = document.getElementById("feedback");

  if (arraysEqual(input, expectedAnswer)) {
    currentStreak++;
    feedback.innerText = `Great job, ${childName}!`;
  } else {
    currentStreak = 0;
    feedback.innerText = `Try again, ${childName}. Correct answer was ${expectedAnswer.join(" ")}.`;
  }
  document.getElementById("streakDisplay").innerText = "Current streak: " + currentStreak;
  generateRound(currentLevel);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
