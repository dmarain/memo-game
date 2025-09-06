document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcome-screen");
  const parentSettings = document.getElementById("parent-settings");
  const gameScreen = document.getElementById("game-screen");
  const summaryScreen = document.getElementById("summary-screen");

  const firstTimeBtn = document.getElementById("first-time-btn");
  const returningBtn = document.getElementById("returning-btn");
  const saveSettingsBtn = document.getElementById("save-settings");
  const submitBtn = document.getElementById("submit-answer");
  const nextRoundBtn = document.getElementById("next-round");
  const restartBtn = document.getElementById("restart-btn");

  const levelLabel = document.getElementById("level-label");
  const numberDisplay = document.getElementById("number-display");
  const answerInput = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");
  const streakDisplay = document.getElementById("streak-display");
  const summaryTable = document.getElementById("summary-table");

  let childName = "";
  let level = 1;
  let round = 0;
  let score = 0;
  let streak = 0;
  let results = [];

  function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(div => {
      div.classList.remove("active");
      div.classList.add("hidden");
    });
    screen.classList.add("active");
    screen.classList.remove("hidden");
  }

  function getNumberRange(level) {
    if (level === 1) return [1, 2, 3];
    if (level === 2) return [1, 2, 3, 4];
    if (level === 3) return [1, 2, 3, 4, 5];
    return [1, 2, 3];
  }

  function newRound() {
    round++;
    const numbers = getNumberRange(level);
    const missingCount = Math.min(2, Math.floor(Math.random() * 2) + 1); // 1 or 2 missing
    const missingIndexes = [];

    while (missingIndexes.length < missingCount) {
      const idx = Math.floor(Math.random() * numbers.length);
      if (!missingIndexes.includes(idx)) {
        missingIndexes.push(idx);
      }
    }

    numberDisplay.innerHTML = numbers.map((num, idx) =>
      missingIndexes.includes(idx) ? "?" : num
    ).join(" ");

    numberDisplay.dataset.answer = missingIndexes.map(idx => numbers[idx]).join(" ");
    answerInput.value = "";
    feedback.textContent = "";
    nextRoundBtn.classList.add("hidden");
  }

  firstTimeBtn.addEventListener("click", () => {
    showScreen(parentSettings);
  });

  returningBtn.addEventListener("click", () => {
    level = 1;
    childName = "Detective";
    startGame();
  });

  saveSettingsBtn.addEventListener("click", () => {
    childName = document.getElementById("child-name").value || "Detective";
    level = parseInt(document.getElementById("starting-level").value);
    startGame();
  });

  function startGame() {
    round = 0;
    score = 0;
    streak = 0;
    results = [];
    showScreen(gameScreen);
    levelLabel.textContent = `${childName} – Level ${level}`;
    newRound();
  }

  submitBtn.addEventListener("click", () => {
    const userAnswer = answerInput.value.trim();
    const correctAnswer = numberDisplay.dataset.answer;

    if (userAnswer === correctAnswer) {
      feedback.textContent = "Correct!";
      score++;
      streak++;
    } else {
      feedback.textContent = `Oops! The answer was ${correctAnswer}`;
      streak = 0;
    }

    results.push({
      round,
      userAnswer,
      correctAnswer,
      correct: userAnswer === correctAnswer
    });

    streakDisplay.textContent = `Current streak: ${streak}`;
    nextRoundBtn.classList.remove("hidden");

    if (round >= 5) {
      showSummary();
    }
  });

  nextRoundBtn.addEventListener("click", () => {
    if (round < 5) {
      newRound();
    }
  });

  function showSummary() {
    showScreen(summaryScreen);
    summaryTable.innerHTML = `
      <p>${childName}, you got ${score} out of 5 correct.</p>
      <ul>
        ${results.map(r =>
          `<li>Round ${r.round}: You said "${r.userAnswer}", correct was "${r.correctAnswer}" – ${r.correct ? "✔️" : "❌"}</li>`
        ).join("")}
      </ul>
    `;
  }

  restartBtn.addEventListener("click", () => {
    showScreen(welcomeScreen);
  });

  // Start on welcome
  showScreen(welcomeScreen);
});
