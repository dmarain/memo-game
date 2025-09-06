document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcome-screen");
  const gameScreen = document.getElementById("game-screen");
  const summaryScreen = document.getElementById("summary-screen");
  const startBtn = document.getElementById("start-btn");
  const submitBtn = document.getElementById("submit-answer");

  const numberDisplay = document.getElementById("number-display");
  const answerInput = document.getElementById("answer-input");
  const feedback = document.getElementById("feedback");
  const summaryText = document.getElementById("summary-text");

  let currentRound = 1;
  let score = 0;

  function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(div => div.classList.remove("active"));
    screen.classList.add("active");
  }

  function newRound() {
    const missing = Math.floor(Math.random() * 3) + 1; // pick missing number 1–3
    numberDisplay.textContent = `Find the missing number: 1 2 3 (missing ${missing})`;
    numberDisplay.dataset.answer = missing;
    answerInput.value = "";
    feedback.textContent = "";
  }

  startBtn.addEventListener("click", () => {
    showScreen(gameScreen);
    newRound();
  });

  submitBtn.addEventListener("click", () => {
    const userAnswer = answerInput.value.trim();
    if (userAnswer === numberDisplay.dataset.answer) {
      feedback.textContent = "Correct!";
      score++;
    } else {
      feedback.textContent = `Oops! The answer was ${numberDisplay.dataset.answer}`;
    }

    currentRound++;
    if (currentRound > 5) {
      summaryText.textContent = `You got ${score} out of 5 correct.`;
      showScreen(summaryScreen);
    } else {
      newRound();
    }
  });

  // Start with welcome
  showScreen(welcomeScreen);
});
