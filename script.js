// ===== Major Build • 2025-09-09 =====
// Includes Memo image, voice, random phrases, streaks, promotions, summary, diagnostics

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
  speechSynthesis.speak(utter);
  console.log("Memo speaks:", text);
}

// --- Helpers ---
const $ = (id) => document.getElementById(id);
function setText(id, text) { if ($(id)) $(id).textContent = text; }

// --- Status rendering ---
function renderStatus() {
  setText("roundLabel", `Round: ${roundCount}`);
  setText("streakLabel", `Streak: ${currentStreak}`);
  setText("expectLabel", `Expected: ${expectedAnswer.length ? expectedAnswer.join(" ") : "—"}`);
}

// --- Box rendering ---
function renderBoxes(rangeMax, missingSet) {
  const box = $("displayBox");
  box.innerHTML = "";
  for (let n = 1; n <= rangeMax; n++) {
    const div = document.createElement("div");
    div.className = "numBox";
    if (missingSet.has(n)) {
      div.classList.add("missing");
      div.textContent = "?";
    } else {
      div.textContent = String(n);
    }
    box.appendChild(div);
  }
}

// --- Level specs ---
function levelSpec(level) {
  switch (level) {
    case "1A": return [3, 1];
    case "1B": return [3, 2];
    case "2A": return [4, 1];
    case "2B": return [4, 2];
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

  renderBoxes(rangeMax, new Set(missing));

  const plural = missing.length === 1 ? "number" : "numbers";
  const instr = `${childName}, find the ${plural} missing from 1–${rangeMax}.`;
  setText("instruction", instr);
  memoSpeak("Diagnostic: generateRound triggered. " + instr);

  $("feedback").className = "";
  setText("feedback", "");
  $("answerInput").value = "";
  $("submitBtn").disabled = false;
  $("controlButtons").innerHTML = "";

  renderStatus();
  $("answerInput").focus();
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

// --- Submit handler ---
function submitAnswer() {
  memoSpeak("Diagnostic: Submit button fired.");
  const userAns = parseAnswer($("answerInput").value);

  if (!userAns.length) {
    setText("feedback", "Please enter your answer.");
    $("feedback").className = "bad";
    memoSpeak(`Please enter your answer, ${childName}.`);
    return;
  }

  if (answersEqual(userAns, expectedAnswer)) {
    currentStreak++;
    $("feedback").className = "good";

    // Random encouragement
    const phrases = [
      `Great job, ${childName}! That's ${currentStreak} in a row.`,
      `Well done, Detective ${childName} — ${currentStreak} correct so far.`,
      `You’re on the case, ${childName}! ${currentStreak} in a row and climbing.`,
      `Nice work, ${childName}. You’re becoming a junior detective!`
    ];
    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    setText("feedback", msg);
    memoSpeak(msg);

    if (currentStreak === 5) {
      const streakMsgs = [
        `Congratulations, ${childName}! Five in a row — case closed!`,
        `Mystery solved, Detective ${childName}! Five in a row.`,
        `Another win for the agency, ${childName}! Five correct.`,
      ];
      const streakMsg = streakMsgs[Math.floor(Math.random() * streakMsgs.length)];
      setText("feedback", streakMsg);
      memoSpeak(streakMsg);
    }
  } else {
    currentStreak = 0;
    $("feedback").className = "bad";

    const wrongPhrases = [
      `Not quite, ${childName}. Try again.`,
      `Almost there, Detective ${childName}. Keep going!`,
      `Don’t give up, ${childName}. You can crack this case.`,
      `Hmm, not the right number, ${childName}. Take another shot.`
    ];
    const msg = wrongPhrases[Math.floor(Math.random() * wrongPhrases.length)];
    setText("feedback", msg);
    memoSpeak(msg);
  }

  $("submitBtn").disabled = true;
  renderStatus();

  $("controlButtons").innerHTML = `
    <button type="button" id="nextRoundBtn">Next Round</button>
    <button type="button" id="endGameBtn">End Game</button>
  `;
  $("nextRoundBtn").onclick = () => generateRound(currentLevel);
  $("endGameBtn").onclick = () => showSummary();
}

// --- Start game ---
function startGame() {
  childName = $("childName").value.trim() || "Detective";
  currentLevel = $("levelSelect").value;
  currentStreak = 0;
  roundCount = 0;
  memoSpeak(`Diagnostic: Start button pressed. Welcome, Detective ${childName}.`);
  generateRound(currentLevel);
}

// --- Summary ---
function showSummary() {
  const summary = $("summary");
  summary.innerHTML = `
    <h2>Case Report for ${childName}</h2>
    <table>
      <tr><th>Level</th><th>Rounds</th><th>Correct</th><th>Incorrect</th><th>Longest Streak</th></tr>
      <tr><td>${currentLevel}</td><td>${roundCount}</td><td>-</td><td>-</td><td>${currentStreak}</td></tr>
    </table>
  `;
  memoSpeak(`Detective ${childName}, here is your report. You played ${roundCount} rounds. Longest streak ${currentStreak}.`);
}

// --- Bind events ---
function bindEvents() {
  $("startBtn").addEventListener("click", startGame);
  $("submitBtn").addEventListener("click", submitAnswer);
  $("hearMemo").addEventListener("click", () => {
    memoSpeak("Welcome to MEMO’s Detective Agency!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setText("feedback", "JS connected ✅ (DOM ready)");
  memoSpeak("Diagnostic: DOM ready.");
  bindEvents();
});
