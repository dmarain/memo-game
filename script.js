document.addEventListener("DOMContentLoaded", () => {
  // ===== Global Setup =====
  let childName = "";
  let currentLevel = "1A";
  let autoNext = false;
  let timerEnabled = false;

  let currentStreak = 0;
  let longestStreak = 0;
  let expectedAnswer = [];

  let levelStats = {};

  const praiseMessages = [
    "Great memory!",
    "Awesome job!",
    "You’re on fire!",
    "Detective skills are sharp!",
    "Keep going strong!"
  ];

  // ===== Screen Management =====
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  // ===== Welcome Screen =====
  document.getElementById("firstTimeBtn").addEventListener("click", () => {
    showScreen("parentScreen");
    setTimeout(() => document.getElementById("childName").focus(), 200);
  });

  document.getElementById("returningBtn").addEventListener("click", () => {
    if (childName) {
      showScreen("gameScreen");
      startLevel(currentLevel);
    } else {
      let msg = "Please choose First Time User to set up your child’s name.";
      alert(msg);
      speak(msg);
    }
  });

  document.getElementById("voiceBtn").addEventListener("click", () => {
    speak("Welcome to Memo’s Memory Mystery! Let’s play together.");
  });

  // ===== Parent Screen =====
  document.getElementById("saveStartBtn").addEventListener("click", () => {
    let inputName = document.getElementById("childName").value.trim();
    if (!inputName) {
      let msg = "Please enter a child’s name before continuing.";
      alert(msg);
      speak(msg);
      return;
    }
    childName = inputName;
    currentLevel = document.getElementById("startLevel").value;
    autoNext = document.getElementById("autoNext").checked;
    timerEnabled = document.getElementById("timerToggle").checked;
    showScreen("gameScreen");
    startLevel(currentLevel);
  });

  // ===== Level Range =====
  function getRange(level) {
    if (level.startsWith("1")) return 3;
    if (level.startsWith("2")) return 4;
    if (level.startsWith("3")) return 5;
    if (level.startsWith("4")) return 6;
    if (level.startsWith("5")) return 7;
    return 3;
  }

  // ===== Start Level =====
  function startLevel(level) {
    currentLevel = level;
    document.getElementById("levelTitle").innerText = "Level " + currentLevel;
    if (!levelStats[level]) {
      levelStats[level] = { correct: 0, incorrect: 0, longest: 0, total: 0 };
    }
    let displayName = childName.charAt(0).toUpperCase() + childName.slice(1);
    speak(`Okay ${displayName}, let’s begin Level ${level}.`);
    generateRound(level);
  }

  // ===== Generate Round =====
  function generateRound(level) {
    let n = getRange(level);
    let allNumbers = Array.from({ length: n }, (_, i) => i + 1);

    let missingCount = 1;
    if (level.endsWith("B")) missingCount = 2;
    if (level.endsWith("C")) missingCount = Math.min(3, n - 1);

    let missing = [];
    while (missing.length < missingCount) {
      let pick = allNumbers[Math.floor(Math.random() * n)];
      if (!missing.includes(pick)) missing.push(pick);
    }
    expectedAnswer = [...missing].sort((a, b) => a - b);

    let gridHTML = "";
    allNumbers.forEach(num => {
      if (missing.includes(num)) {
        gridHTML += `<div class="numberBox">?</div>`;
      } else {
        gridHTML += `<div class="numberBox">${num}</div>`;
      }
    });
    document.getElementById("numberGrid").innerHTML = gridHTML;

    // Instructions
    let instr = "";
    if (level.endsWith("A")) {
      instr = `Enter the one missing number from 1 to ${n}.`;
      document.getElementById("instructions").classList.add("red");
    } else {
      instr = `Find the ${missingCount} missing numbers from 1 to ${n}. Enter them separated by spaces.`;
      document.getElementById("instructions").classList.remove("red");
    }

    document.getElementById("instructions").innerText = instr;
    speak(instr);

    // Reset UI
    let answerBox = document.getElementById("answerInput");
    answerBox.value = "";
    answerBox.disabled = true;
    document.getElementById("feedback").innerText = "";
    document.getElementById("feedback").className = "";
    document.getElementById("controlButtons").innerHTML = "";

    // Enable input after Memo speaks (~2s delay)
    setTimeout(() => {
      answerBox.disabled = false;
      answerBox.focus();
    }, 2000);
  }

  // ===== Answer Checking =====
  document.getElementById("answerInput").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  document.getElementById("submitBtn").addEventListener("click", () => {
    checkAnswer();
  });

  function checkAnswer() {
    let input = document.getElementById("answerInput").value.trim();
    if (!input) {
      document.getElementById("feedback").innerText = "Please enter your answer.";
      document.getElementById("feedback").className = "";
      return;
    }

    let guess = input.split(" ").map(x => parseInt(x)).filter(x => !isNaN(x));
    guess.sort((a, b) => a - b);

    levelStats[currentLevel].total++;

    let displayName = childName.charAt(0).toUpperCase() + childName.slice(1);

    if (JSON.stringify(guess) === JSON.stringify(expectedAnswer)) {
      currentStreak++;
      levelStats[currentLevel].correct++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      if (currentStreak > levelStats[currentLevel].longest) {
        levelStats[currentLevel].longest = currentStreak;
      }
      let msg = `${displayName}, that’s ${currentStreak} in a row! ${randomPraise()}`;
      document.getElementById("feedback").innerText = msg;
      document.getElementById("feedback").className = "feedback-correct";
      speak(msg);

      if (currentStreak % 5 === 0) {
        bigCelebration();
      } else {
        nextRoundButton();
      }
    } else {
      levelStats[currentLevel].incorrect++;
      currentStreak = 0;
      let msg = `Not quite, ${displayName}. Try again next round.`;
      document.getElementById("feedback").innerText = msg;
      document.getElementById("feedback").className = "feedback-incorrect";
      speak(msg);
      nextRoundButton();
    }

    document.getElementById("currentStreak").innerText = currentStreak;
    document.getElementById("longestStreak").innerText = longestStreak;
  }

  function randomPraise() {
    return praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
  }

  function nextRoundButton() {
    document.getElementById("controlButtons").innerHTML =
      `<button onclick="document.dispatchEvent(new CustomEvent('nextRound'))">Next Round</button>`;
  }

  // ===== Celebration =====
  function bigCelebration() {
    let displayName = childName.charAt(0).toUpperCase() + childName.slice(1);
    let msg = `Congratulations, ${displayName}! Five in a row! You’re becoming a first-class detective!`;
    document.getElementById("feedback").innerText = msg;
    document.getElementById("feedback").className = "feedback-correct";
    speak(msg);

    document.getElementById("controlButtons").innerHTML = `
      <button onclick="document.dispatchEvent(new CustomEvent('staySame'))">Stay on Same Level</button>
      <button onclick="document.dispatchEvent(new CustomEvent('goNext'))">Go to Next Level</button>
      <button onclick="document.dispatchEvent(new CustomEvent('progress'))">See Progress Chart</button>
      <button onclick="document.dispatchEvent(new CustomEvent('quitGame'))">Quit</button>
    `;
  }

  // ===== Level Navigation =====
  document.addEventListener("nextRound", () => generateRound(currentLevel));
  document.addEventListener("staySame", () => generateRound(currentLevel));
  document.addEventListener("goNext", () => goToNextLevel());
  document.addEventListener("progress", () => showProgress());
  document.addEventListener("quitGame", () => showProgress(true));

  function goToNextLevel() {
    let base = parseInt(currentLevel[0]);
    let sub = currentLevel[1];
    let nextLevel;
    if (sub === "A") nextLevel = base + "B";
    else if (sub === "B") nextLevel = base + "C";
    else if (sub === "C") nextLevel = (base + 1) + "A";
    else nextLevel = "1A";
    startLevel(nextLevel);
  }

  // ===== Progress Chart =====
  function showProgress(endGame = false) {
    showScreen("progressScreen");
    let displayName = childName.charAt(0).toUpperCase() + childName.slice(1);
    document.getElementById("progressTitle").innerText =
      `${displayName}’s Progress Chart`;

    let tableHTML = "<tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Longest Streak</th><th>Total</th></tr>";

    let totalCorrect = 0, totalIncorrect = 0, totalRounds = 0;

    for (let lvl in levelStats) {
      let s = levelStats[lvl];
      tableHTML += `<tr>
        <td>${lvl}</td>
        <td>${s.correct}</td>
        <td>${s.incorrect}</td>
        <td>${s.longest}</td>
        <td>${s.total}</td>
      </tr>`;
      totalCorrect += s.correct;
      totalIncorrect += s.incorrect;
      totalRounds += s.total;
    }

    tableHTML += `<tr>
      <td>Totals</td>
      <td>${totalCorrect}</td>
      <td>${totalIncorrect}</td>
      <td>${longestStreak}</td>
      <td>${totalRounds}</td>
    </tr>`;

    document.getElementById("progressTable").innerHTML = tableHTML;

    document.getElementById("endGameBtn").style.display = endGame ? "inline-block" : "none";
  }

  document.getElementById("endGameBtn").addEventListener("click", () => {
    showScreen("welcomeScreen");
  });

  document.getElementById("sameLevelBtn").addEventListener("click", () => {
    startLevel(currentLevel);
  });

  document.getElementById("nextLevelBtn").addEventListener("click", () => {
    goToNextLevel();
  });

  // ===== Speech =====
  function speak(text) {
    if (!window.speechSynthesis) return;
    let utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1.2;
    utter.rate = 1;
    utter.voice = speechSynthesis.getVoices().find(v => v.name === "Samantha") || null;
    speechSynthesis.speak(utter);
  }
});
