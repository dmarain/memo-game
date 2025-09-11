// ===== Clean Build • 2025-09-11 =====

let childName = "";
let currentLevel = "1A";
let currentStreak = 0;
let roundCount = 0;
let expectedAnswer = [];
let levelStats = {};

// --- Speech ---
function memoSpeak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  utter.voice = voices.find(v => v.name.includes("Samantha")) || voices[0];
  utter.onstart = () => $("answerInput").disabled = true;
  utter.onend = () => $("answerInput").disabled = false;
  speechSynthesis.speak(utter);
  console.log("Memo speaks:", text);
}

// --- Helpers ---
const $ = (id) => document.getElementById(id);
function setText(id, text) { if ($(id)) $(id).textContent = text; }

// --- Level specs ---
function levelSpec(level) {
  switch (level) {
    case "1A": return [3, 1];
    case "1B": return [3, 2];
    case "2A": return [4, 1];
    case "2B": return [4, 2];
    case "3A": return [5, 1];
    case "3B": return [5, 2];
    default: return [3, 1];
  }
}

function pickMissing(rangeMax, countMissing) {
  const pool = Array.from({ length: rangeMax }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, countMissing).sort((a, b) => a - b);
}

// --- Generate round ---
function generateRound(level) {
  roundCount++;
  const [rangeMax, countMissing] = levelSpec(level);
  const missing = pickMissing(rangeMax, countMissing);
  expectedAnswer = missing.slice();

  // init stats if not exist
  if (!levelStats[level]) {
    levelStats[level] = { correct: 0, incorrect: 0, rounds: 0, longest: 0 };
  }
  levelStats[level].rounds++;

  // Display numbers
  const box = $("displayBox");
  box.innerHTML = "";
  for (let n = 1; n <= rangeMax; n++) {
    const div = document.createElement("div");
    div.className = "numBox";
    if (missing.includes(n)) {
      div.classList.add("missing");
      div.textContent = "?";
    } else {
      div.textContent = String(n);
    }
    box.appendChild(div);
  }

  // Instruction
  const plural = missing.length === 1 ? "number" : "numbers";
  const instr = `${childName}, type the ${plural} missing from 1–${rangeMax}. (Use spaces between answers)`;
  setText("instruction", instr);
  memoSpeak("Diagnostic: generateRound triggered. " + instr);

  setText("feedback", "");
  $("answerInput").value = "";
  $("submitBtn").disabled = false;
  $("controlButtons").innerHTML = "";

  setText("roundLabel", `Round: ${roundCount}`);
  setText("streakLabel", `Streak: ${currentStreak}`);
  setText("expectLabel", `Expected: ${expectedAnswer.length ? expectedAnswer.join(" ") : "—"}`);
}

// --- Parse + check answers ---
function parseAnswer(input) {
  const cleaned = input.trim().replace(/,/g, " ").split(/\s+/).filter(Boolean);
  return cleaned.map(s => Number(s)).filter(n => Number.isInteger(n)).sort((a, b) => a - b);
}
function answersEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) if (arr1[i] !== arr2[i]) return false;
  return true;
}

// --- Submit ---
function submitAnswer() {
  memoSpeak("Diagnostic: Submit fired.");
  const userAns = parseAnswer($("answerInput").value);

  if (!userAns.length) {
    setText("feedback", "Please enter your answer.");
    $("feedback").className = "bad";
    memoSpeak(`Please enter your answer, ${childName}.`);
    return;
  }

  if (answersEqual(userAns, expectedAnswer)) {
    currentStreak++;
    levelStats[currentLevel].correct++;
    if (currentStreak > levelStats[currentLevel].longest) {
      levelStats[currentLevel].longest = currentStreak;
    }

    const phrases = [
      `Great job, ${childName}! That's ${currentStreak} in a row.`,
      `Well done, Detective ${childName} — ${currentStreak} correct.`,
      `That's ${currentStreak} in a row, ${childName}.`,
      `Nice work, ${childName}. Keep it up!`
    ];
    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    setText("feedback", msg);
    memoSpeak(msg);

    if (currentStreak === 5) {
      const streakMsg = `Congratulations, Detective ${childName} — five in a row on Level ${currentLevel}!`;
      setText("feedback", streakMsg);
      memoSpeak(streakMsg);
      $("submitBtn").disabled = true;
      $("controlButtons").innerHTML = `
        <button type="button" id="stayBtn">Stay on this level</button>
        <button type="button" id="nextBtn">Next level</button>
        <button type="button" id="endBtn">End game</button>
      `;
      $("stayBtn").onclick = () => { currentStreak = 0; generateRound(currentLevel); };
      $("nextBtn").onclick = () => {
        currentStreak = 0;
        let next = nextLevel(currentLevel);
        if (next) currentLevel = next;
        generateRound(currentLevel);
      };
      $("endBtn").onclick = showSummary;
      return;
    }
  } else {
    levelStats[currentLevel].incorrect++;
    currentStreak = 0;

    const wrongPhrases = [
      `Not quite, ${childName}. Try again.`,
      `Almost there, Detective ${childName}.`,
      `Don’t give up, ${childName}.`,
      `Hmm, not right, ${childName}.`
    ];
    const msg = wrongPhrases[Math.floor(Math.random() * wrongPhrases.length)];
    setText("feedback", msg);
    memoSpeak(msg);
  }

  $("submitBtn").disabled = true;
  $("controlButtons").innerHTML = `<button type="button" id="nextRoundBtn">Next Round</button>`;
  $("nextRoundBtn").onclick = () => generateRound(currentLevel);
}

// --- Next level helper ---
function nextLevel(level) {
  const order = ["1A","1B","2A","2B","3A","3B"];
  const idx = order.indexOf(level);
  if (idx >= 0 && idx < order.length-1) return order[idx+1];
  return null;
}

// --- Start game ---
function startGame() {
  childName = $("childName").value.trim().toUpperCase() || "DETECTIVE";
  currentLevel = $("levelSelect").value;
  currentStreak = 0;
  roundCount = 0;
  memoSpeak(`Diagnostic: Start pressed. Welcome, Detective ${childName}.`);
  generateRound(currentLevel);
}

// --- Summary ---
function showSummary() {
  let longestOverall = 0;
  let rows = "";
  for (const [lvl, stats] of Object.entries(levelStats)) {
    if (stats.longest > longestOverall) longestOverall = stats.longest;
    rows += `<tr>
      <td>${lvl}</td>
      <td>${stats.rounds}</td>
      <td>${stats.correct}</td>
      <td>${stats.incorrect}</td>
      <td>${stats.longest}</td>
    </tr>`;
  }
  const totals = Object.values(levelStats).reduce((acc, s) => {
    acc.rounds += s.rounds;
    acc.correct += s.correct;
    acc.incorrect += s.incorrect;
    return acc;
  }, {rounds:0, correct:0, incorrect:0});

  $("summary").innerHTML = `
    <h2>Case Report for Detective ${childName}</h2>
    <table>
      <tr><th>Level</th><th>Rounds</th><th>Correct</th><th>Incorrect</th><th>Longest Streak</th></tr>
      ${rows}
      <tr><td><strong>Total</strong></td>
          <td>${totals.rounds}</td>
          <td>${totals.correct}</td>
          <td>${totals.incorrect}</td>
          <td>${longestOverall}</td></tr>
    </table>
    <p>Detective ${childName}’s longest streak overall: ${longestOverall}</p>
    <button id="resumeBtn">Resume play</button>
    ${nextLevel(currentLevel) ? `<button id="nextLvlBtn">Next level</button>` : ""}
    <button id="endBtn">End game</button>
  `;

  $("resumeBtn").onclick = () => generateRound(currentLevel);
  if ($("nextLvlBtn")) $("nextLvlBtn").onclick = () => {
    currentLevel = nextLevel(currentLevel);
    generateRound(currentLevel);
  };
  $("endBtn").onclick = () => memoSpeak(`Excellent work, Detective ${childName}. The agency is proud of you!`);

  memoSpeak(`Well done, Detective ${childName}. Excellent progress today!`);
}

// --- Bind events ---
function bindEvents() {
  $("startBtn").addEventListener("click", startGame);
  $("submitBtn").addEventListener("click", submitAnswer);
  $("hearMemo").addEventListener("click", () => memoSpeak("Welcome to MEMO’s Detective Agency!"));
}

document.addEventListener("DOMContentLoaded", () => {
  setText
