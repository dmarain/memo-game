
// ===============================
// MEMO'S MEMORY MYSTERY - SCRIPT
// Cleaned Game Logic - Sept 6, 2025
// ===============================

// Global variables
let playerName = "";
let currentLevel = 1;
let currentSubLevel = "A";
let numberRange = 3;
let streak = 0;
let longestStreak = 0;
let badges = 0;
let round = 0;
let allowInput = true;

// DOM elements
const nameInput = document.getElementById("nameInput");
const gameScreen = document.getElementById("gameScreen");
const numbersDisplay = document.getElementById("numbersDisplay");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const streakDisplay = document.getElementById("streakDisplay");
const badgesDisplay = document.getElementById("badgesDisplay");
const nextButton = document.getElementById("nextButton");
const endButton = document.getElementById("endButton");
const summaryScreen = document.getElementById("summaryScreen");

// Utility: Speak text with Memo’s voice
function memoSpeak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name === "Samantha") || null;
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

// Utility: Generate shuffled array
function shuffledArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Utility: Get range based on level
function getRange(level) {
  switch (level) {
    case 1: return 3;
    case 2: return 4;
    case 3: return 5;
    case 4: return 6;
    default: return 3;
  }
}

// Start game after name entry
function startGame(name, level = 1, subLevel = "A") {
  playerName = name;
  currentLevel = level;
  currentSubLevel = subLevel;
  numberRange = getRange(level);
  streak = 0;
  badges = 0;
  round = 0;
  longestStreak = 0;
  summaryScreen.innerHTML = "";

  gameScreen.style.display = "block";
  memoSpeak(`Welcome back, Detective ${playerName}. Let’s begin with numbers from one to ${numberRange}.`);
  generateRound();
}

// Generate round numbers
function generateRound() {
  round++;
  allowInput = true;
  feedback.textContent = "";
  answerInput.value = "";
  answerInput.focus();

  let numbers = Array.from({ length: numberRange }, (_, i) => i + 1);

  // Handle sublevels
  if (currentLevel === 3 && currentSubLevel === "A") {
    numbers = shuffledArray(numbers); // Level 3A starts shuffled
  }

  let missingCount = 1;
  if (currentSubLevel === "C") missingCount = 2;

  let shuffled = shuffledArray(numbers);
  let missing = shuffled.slice(0, missingCount).sort((a, b) => a - b);
  let displayNumbers = numbers.map(n => (missing.includes(n) ? "?" : n));

  numbersDisplay.innerHTML = displayNumbers
    .map(n => `<div class="numBox">${n}</div>`)
    .join("");

  memoSpeak(`Find the ${missingCount === 1 ? "missing number" : "two missing numbers"} from numbers one to ${numberRange}.`);

  nextButton.style.display = "none";
  endButton.style.display = "none";

  // Store correct answers
  numbersDisplay.dataset.correct = missing.join(" ");
}
// ===============================
// Part 2 - Answer Checking, Streaks, Badges
// ===============================

// Check the child's answer
function checkAnswer() {
  if (!allowInput) return;

  const childAnswer = answerInput.value.trim();
  const correctAnswer = numbersDisplay.dataset.correct;

  if (childAnswer === correctAnswer) {
    streak++;
    longestStreak = Math.max(streak, longestStreak);
    feedback.textContent = `Great job, ${playerName}! That’s correct.`;
    memoSpeak(`Great job, ${playerName}! That’s ${streak} in a row.`);

    // Badge earned every 5 streak
    if (streak > 0 && streak % 5 === 0) {
      badges++;
      memoSpeak(`Congratulations, Detective ${playerName}! You earned a new badge.`);
      feedback.textContent = `Congratulations, ${playerName}! You earned a badge.`;
      showBadgeCelebration();
    } else if (streak === 4) {
      memoSpeak(`${playerName}, you have four in a row. One more to earn your badge!`);
    }

    updateDisplays();
    allowInput = false;
    nextButton.style.display = "inline-block";
  } else {
    if (badges > 0) {
      badges--; // use badge to protect streak
      feedback.textContent = `Not quite, ${playerName}, but your badge saves your streak. Try again!`;
      memoSpeak(`Not quite, ${playerName}, but your badge saves your streak. Try again!`);
    } else {
      streak = 0;
      feedback.textContent = `Not quite, ${playerName}. Let’s try again.`;
      memoSpeak(`Not quite, ${playerName}. Don’t worry, you can do it!`);
    }
    answerInput.value = "";
    answerInput.focus();
  }
}

// Update streak and badge displays
function updateDisplays() {
  streakDisplay.textContent = `Current Streak: ${streak}`;
  badgesDisplay.textContent = `Badges: ${badges}`;
}

// Badge celebration animation
function showBadgeCelebration() {
  const badge = document.createElement("div");
  badge.className = "badgeCelebration";
  badge.innerHTML = `⭐ Badge Earned! ⭐`;
  document.body.appendChild(badge);

  setTimeout(() => badge.remove(), 3000);
}

// End round and show summary
function endGame() {
  gameScreen.style.display = "none";
  summaryScreen.style.display = "block";

  let summaryHTML = `
    <h2>Game Summary for Detective ${playerName}</h2>
    <table class="summaryTable">
      <tr>
        <th>Level</th>
        <th>Sublevel</th>
        <th>Correct Streak</th>
        <th>Badges</th>
      </tr>
      <tr>
        <td>${currentLevel}</td>
        <td>${currentSubLevel}</td>
        <td>${longestStreak}</td>
        <td>${badges}</td>
      </tr>
    </table>
    <p>Great job today, ${playerName}! I hope to see you again very soon.</p>
  `;

  summaryScreen.innerHTML = summaryHTML;
  memoSpeak(`Great job today, Detective ${playerName}. I hope to see you again very soon.`);
}

// Event listeners
answerInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

nextButton.addEventListener("click", generateRound);
endButton.addEventListener("click", endGame);