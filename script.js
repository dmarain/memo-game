/* ============================================================
MEMO'S MEMORY MYSTERY - v6.4.x
Script.js - PART 1 (Setup, Utilities, State Machine, Voice)
============================================================ */

// ---------- Global State ----------
const appState = {
childName: "",
currentLevel: 1,
currentSub: "A",
mode: "normal", // normal | timer | audio
streak: 0,
bestStreak: 0,
totalRounds: 0,
correct: 0,
incorrect: 0,
sessionResults: {}, // {level: {sub: {rounds, correct, incorrect, bestStreak, fiveStreaks}}}
timerEnabled: false,
timerSeconds: 8,
audioOnlyEnabled: false,
reducedMotion: false,
hiRangeB: "random",
unlockedModes: {}, // {level: {timer:true, audio:true}}
voiceSpeaking: false,
inputLocked: false
};

// Praise pools
const praisePool = [
"Great job, Detective!",
"Excellent clue-finding!",
"Brilliant! You’re on the trail.",
"Super sleuthing! Keep it up.",
"Nice work—your brain is buzzing!"
];

const wrongPool = [
"Not quite, but keep trying!",
"Every good detective makes mistakes—let’s try again!",
"Stay sharp, you’ll crack it next time!"
];

// Streak milestone celebrations
const streakCelebrations = {
5: { badge: "First-Class Detective", msg: "Five in a row! Fantastic work!" },
10: { badge: "Ten-Streak Sleuth", msg: "Ten in a row—astonishing focus!" },
15: { badge: "Master Detective", msg: "Fifteen straight—legendary work!" }
// 20+ escalated dynamically
};

// ---------- DOM References ----------
const screens = {
welcome: document.getElementById("screen-welcome"),
settings: document.getElementById("screen-settings"),
levelSelect: document.getElementById("screen-level-select"),
game: document.getElementById("screen-game"),
summary: document.getElementById("screen-summary")
};

const els = {
memoImg: document.getElementById("memoImg"),
btnHearMemo: document.getElementById("btnHearMemo"),
btnMusic: document.getElementById("btnMusic"),
btnFirstTime: document.getElementById("btnFirstTime"),
btnReturning: document.getElementById("btnReturning"),
nameRow: document.getElementById("nameRow"),
childName: document.getElementById("childName"),
btnSaveSettings: document.getElementById("btnSaveSettings"),
btnBackWelcome1: document.getElementById("btnBackWelcome1"),
btnBackWelcome2: document.getElementById("btnBackWelcome2"),
levelList: document.getElementById("levelList"),
btnStartSelected: document.getElementById("btnStartSelected"),
hudName: document.getElementById("hudName"),
hudLevel: document.getElementById("hudLevel"),
hudSub: document.getElementById("hudSub"),
hudStreak: document.getElementById("hudStreak"),
instructions: document.getElementById("instructions"),
timerWrap: document.getElementById("timerWrap"),
timerText: document.getElementById("timerText"),
numbersRow: document.getElementById("numbersRow"),
answerInput: document.getElementById("answerInput"),
btnSubmit: document.getElementById("btnSubmit"),
btnNext: document.getElementById("btnNext"),
feedback: document.getElementById("feedback"),
modalCelebrate: document.getElementById("modal-celebrate"),
celebrateHeading: document.getElementById("celebrateHeading"),
celebrateBadge: document.getElementById("celebrateBadge"),
celebrateText: document.getElementById("celebrateText"),
celebrateFX: document.getElementById("celebrateFX"),
btnStayLevel: document.getElementById("btnStayLevel"),
btnNextLevel: document.getElementById("btnNextLevel"),
btnEndFromCelebrate: document.getElementById("btnEndFromCelebrate"),
modalUnlock: document.getElementById("modal-unlock"),
btnUnlockTimer: document.getElementById("btnUnlockTimer"),
btnUnlockAudio: document.getElementById("btnUnlockAudio"),
btnUnlockKeep: document.getElementById("btnUnlockKeep"),
summaryTableWrap: document.getElementById("summaryTableWrap"),
summaryPraise: document.getElementById("summaryPraise"),
btnPlayAgain: document.getElementById("btnPlayAgain"),
btnChooseLevel: document.getElementById("btnChooseLevel"),
btnExit: document.getElementById("btnExit"),
bgMusic: document.getElementById("bgMusic")
};

// ---------- Screen Utility ----------
function showScreen(name) {
Object.values(screens).forEach(s => s.classList.remove("active"));
if (screens[name]) screens[name].classList.add("active");
}

// ---------- Voice Utility ----------
let synth = window.speechSynthesis;
let memoVoice = null;

function loadVoice() {
let voices = synth.getVoices();
// Pick a female English voice (prefer Samantha, fallback to any female)
memoVoice = voices.find(v => /Samantha/i.test(v.name)) ||
voices.find(v => v.lang.startsWith("en") && /female/i.test(v.name.toLowerCase())) ||
voices.find(v => v.lang.startsWith("en"));
}

synth.onvoiceschanged = loadVoice;

function memoSpeak(text, cb) {
if (!text) { if(cb)cb(); return; }
appState.voiceSpeaking = true;
let utter = new SpeechSynthesisUtterance(text);
utter.voice = memoVoice;
utter.pitch = 1.1;
utter.rate = 1;
utter.onend = () => {
appState.voiceSpeaking = false;
if(cb) cb();
};
synth.cancel();
synth.speak(utter);
}

// ---------- Helpers ----------
function randChoice(arr) {
return arr[Math.floor(Math.random()*arr.length)];
}
function shuffle(arr) {
return arr.map(x => ({x, r:Math.random()}))
.sort((a,b)=>a.r-b.r)
.map(o=>o.x);
}
function updateHUD() {
els.hudName.textContent = appState.childName ? appState.childName.toUpperCase() : "";
els.hudLevel.textContent = "Level " + appState.currentLevel;
els.hudSub.textContent = "Sub " + appState.currentSub;
els.hudStreak.textContent = "Streak: " + appState.streak;
}
function resetRoundUI() {
els.feedback.textContent = "";
els.feedback.className = "feedback";
els.answerInput.value = "";
els.answerInput.disabled = false;
els.btnSubmit.disabled = false;
els.btnNext.disabled = true;
}

// Summary data structure init
function ensureResultSlot(level, sub) {
if(!appState.sessionResults[level]) appState.sessionResults[level] = {};
if(!appState.sessionResults[level][sub]) {
appState.sessionResults[level][sub] = {
rounds:0, correct:0, incorrect:0,
bestStreak:0, fiveStreaks:0
};
}
return appState.sessionResults[level][sub];
}

// ---------- State Flow Skeleton ----------
// We’ll wire actual game logic in Part 2.
function startGame(level, sub) {
appState.currentLevel = level;
appState.currentSub = sub;
appState.streak = 0;
showScreen("game");
updateHUD();
nextRound();
}

function nextRound() {
// Placeholder: real round logic comes in Part 2
resetRoundUI();
els.instructions.textContent = "Round will start here...";
memoSpeak("Round setup ready. Implementation continues.", ()=>{});
}

/* ============================================================
MEMO'S MEMORY MYSTERY - v6.4.x
Script.js - PART 2 (Events, Round Logic, Celebrations, Summary)
============================================================ */

// ------------------------
// App Boot & Basics
// ------------------------
document.addEventListener("DOMContentLoaded", () => {
// Preload voices
setTimeout(() => {
if (!memoVoice) loadVoice();
}, 50);

wireUI();
showWelcomeTight();
});

// Keep whitespace tight like Replit (small helper tweaks)
function showWelcomeTight() {
showScreen("welcome");
els.nameRow.classList.add("hidden");
els.childName.value = "";
}

// ------------------------
// UI Wiring
// ------------------------
function wireUI() {
// Top bar
els.btnHearMemo.addEventListener("click", () => {
memoSpeak(`Welcome to Memo's Detective Agency. I need your help to find missing numbers.`, ()=>{});
});

let musicOn = false;
els.btnMusic.addEventListener("click", () => {
musicOn = !musicOn;
els.btnMusic.setAttribute("aria-pressed", String(musicOn));
els.btnMusic.textContent = musicOn ? "Music: ON" : "Music: OFF";
const audio = els.bgMusic;
if (!audio) return;
try {
if (musicOn) { audio.currentTime = 0; audio.volume = 0.7; audio.play().catch(()=>{}); }
else { audio.pause(); }
} catch {}
});

// Welcome choices
els.btnFirstTime.addEventListener("click", () => {
els.nameRow.classList.remove("hidden");
els.childName.focus();
els.childName.onkeydown = e => {
if (e.key === "Enter") {
const name = (els.childName.value || "").trim();
if (!name) return;
appState.childName = name;
// Go to Parent Settings
showScreen("settings");
speakOnce(`Hello ${name}. Please have a parent choose your settings, then we will select a level.`);
}
};
});

els.btnReturning.addEventListener("click", () => {
els.nameRow.classList.remove("hidden");
els.childName.focus();
els.childName.onkeydown = e => {
if (e.key === "Enter") {
const name = (els.childName.value || "").trim();
if (!name) return;
appState.childName = name;
// Level select (returning)
buildLevelSelect();
showScreen("levelSelect");
speakOnce(`Welcome back ${name}. Choose your level to continue your detective work.`);
}
};
});

// Settings
els.btnSaveSettings.addEventListener("click", () => {
appState.timerEnabled = document.getElementById("chkTimer").checked;
appState.timerSeconds = clamp(parseInt(document.getElementById("timerSeconds").value || "8", 10),5,15);
appState.audioOnlyEnabled = document.getElementById("chkAudioOnly").checked;
appState.reducedMotion = document.getElementById("chkReducedMotion").checked;
appState.hiRangeB = document.getElementById("selHiRangeB").value;

document.body.classList.toggle("reduced-motion", appState.reducedMotion);

// After saving, choose level (First-Time flow)
buildLevelSelect();
showScreen("levelSelect");
speakOnce(`Settings saved. Now choose your level to begin.`);
});

els.btnBackWelcome1.addEventListener("click", () => {
showWelcomeTight();
});
els.btnBackWelcome2.addEventListener("click", () => {
showWelcomeTight();
});

// Start from level select
els.btnStartSelected.addEventListener("click", () => {
const btn = document.querySelector(".level-item.selected");
if (!btn) return;
const level = parseInt(btn.dataset.level,10);
const sub = btn.dataset.sub;
enforceModeVisibilityForLevel(level); // set appState.mode based on level + unlocks
startGame(level, sub);
introInstructionForLevel(level, sub);
});

// Game controls
els.btnSubmit.addEventListener("click", handleSubmit);
els.answerInput.addEventListener("keydown", (e)=>{
if (e.key === "Enter") handleSubmit();
});
els.btnNext.addEventListener("click", ()=>{
if (appState.voiceSpeaking) return;
nextRound();
});
els.btnEndGame.addEventListener("click", endGameSummary);

// Celebration modal
els.btnStayLevel.addEventListener("click", () => {
closeCelebrate();
nextRound();
});
els.btnNextLevel.addEventListener("click", () => {
closeCelebrate();
goToNextLevel();
});
els.btnEndFromCelebrate.addEventListener("click", () => {
closeCelebrate();
endGameSummary();
});

// Unlock modal
els.btnUnlockTimer.addEventListener("click", () => {
setModeUnlocked("timer");
closeUnlock();
nextRound();
});
els.btnUnlockAudio.addEventListener("click", () => {
setModeUnlocked("audio");
closeUnlock();
nextRound();
});
els.btnUnlockKeep.addEventListener("click", () => {
closeUnlock();
nextRound();
});

// Summary screen buttons
els.btnPlayAgain.addEventListener("click", () => {
buildLevelSelect();
showScreen("levelSelect");
});
els.btnChooseLevel.addEventListener("click", () => {
buildLevelSelect();
showScreen("levelSelect");
});
els.btnExit.addEventListener("click", () => {
showWelcomeTight();
});
}

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function speakOnce(t){ memoSpeak(t, ()=>{}); }

// ------------------------
// Level Select (Returning + FTU)
// ------------------------
function buildLevelSelect() {
const lastCompleted = getLastCompletedLevel(); // simple memory (localStorage) if desired later
const allowed = [];
if (lastCompleted) {
allowed.push(lastCompleted);
allowed.push(Math.min(lastCompleted+1, 4));
} else {
allowed.push(1);
}

els.levelList.innerHTML = "";
// For each allowed, show its sublevels per spec
allowed.forEach(level=>{
const subOptions = getSublevelsForLevel(level);
subOptions.forEach(sub=>{
const btn = document.createElement("button");
btn.className = "btn level-item";
btn.textContent = `L${level} ${sub}`;
btn.dataset.level = String(level);
btn.dataset.sub = sub;
btn.addEventListener("click", ()=>{
document.querySelectorAll(".level-item").forEach(x=>x.classList.remove("selected"));
btn.classList.add("selected");
});
els.levelList.appendChild(btn);
});
});

const note = document.getElementById("levelSelectNote");
if (allowed.length === 2 && allowed[0] !== allowed[1]) {
note.textContent = `You can continue at Level ${allowed[0]} or try Level ${allowed[1]}.`;
} else {
note.textContent = `Choose your starting level.`;
}
}

function getSublevelsForLevel(level) {
if (level <= 2) return ["A","B","C"];
return ["A","B"]; // higher ranges only A & B
}

// Placeholder: returns last completed level (could be wired to localStorage)
function getLastCompletedLevel() {
// For now, return 1 by default; customize to persist across sessions
return 1;
}

// Ensure we obey gating rules for Timer/Audio-Only by level
function enforceModeVisibilityForLevel(level) {
if (level <= 2) {
// Parent-only options; just set mode to normal at start
appState.mode = "normal";
} else {
// Higher ranges: mode only if unlocked for this level
const unlocked = appState.unlockedModes[level] || {};
if (!unlocked.timer && !unlocked.audio) appState.mode = "normal";
}
}

// ------------------------
// Round Generation (Core Rules)
// ------------------------
function levelRange(level) {
if (level === 1) return 3;
if (level === 2) return 4;
if (level === 3) return 5;
return 6; // level 4
}

function subSpec(level, sub) {
// Returns {missingCount, shuffled}
if (level <= 2) {
if (sub === "A") return { missingCount: 1, shuffled: false };
if (sub === "B") return { missingCount: 1, shuffled: true };
if (sub === "C") return { missingCount: 2, shuffled: true };
} else { // level 3+
if (sub === "A") return { missingCount: 1, shuffled: true };
if (sub === "B") {
let mc = 2;
if (appState.hiRangeB === "3") mc = 3;
else if (appState.hiRangeB === "random") mc = Math.random()<0.5 ? 2 : 3;
return { missingCount: mc, shuffled: true };
}
}
return { missingCount: 1, shuffled: true };
}

function generateRound(level, sub) {
const N = levelRange(level);
const spec = subSpec(level, sub);
const numbers = Array.from({length:N}, (_,i)=>i+1);
const missing = [];
while (missing.length < spec.missingCount) {
const pick = 1 + Math.floor(Math.random()*N);
if (!missing.includes(pick)) missing.push(pick);
}
let displayOrder = spec.shuffled ? shuffle(numbers.slice()) : numbers.slice();
return { N, numbers, missing, displayOrder };
}

// ------------------------
// Round Rendering
// ------------------------
let currentRound = null;

function renderRound(rnd) {
const row = els.numbersRow;
row.innerHTML = "";
rnd.displayOrder.forEach(val=>{
const div = document.createElement("div");
div.className = "numbox";
if (rnd.missing.includes(val)) {
div.classList.add("missing");
div.textContent = "?";
} else {
div.textContent = String(val);
}
row.appendChild(div);
});
}

function instructionLine(level, sub) {
const N = levelRange(level);
const spec = subSpec(level, sub);
const mc = spec.missingCount;
const many = mc === 1 ? "one" : mc === 2 ? "two" : "three";
const shuffledText = spec.shuffled ? " (shuffled)" : "";
return `Find the ${many} missing ${mc===1?"number":"numbers"} from ${1} through ${N}${shuffledText}. Enter them separated by spaces.`;
}

function introInstructionForLevel(level, sub) {
const line = instructionLine(level, sub);
els.instructions.textContent = line;
memoSpeak(line, ()=>{});
}

// ------------------------
// Round Flow
// ------------------------
function nextRound() {
resetRoundUI();
const { currentLevel, currentSub } = appState;
currentRound = generateRound(currentLevel, currentSub);
const line = instructionLine(currentLevel, currentSub);
els.instructions.textContent = line;
renderRound(currentRound);
focusAnswer();
}

function focusAnswer() {
els.answerInput.focus();
els.answerInput.select();
}

// ------------------------
// Submit / Check Answer
// ------------------------
function handleSubmit() {
if (appState.inputLocked) return;
let val = (els.answerInput.value || "").trim();
if (!val) {
els.feedback.className = "feedback bad";
els.feedback.textContent = "Please input your answer.";
focusAnswer();
return;
}
const parts = val.split(/\s+/).map(s=>parseInt(s,10)).filter(n=>Number.isInteger(n));
const expected = currentRound.missing.slice().sort((a,b)=>a-b);
const got = parts.slice().sort((a,b)=>a-b);
const correct = arraysEqual(expected, got);
recordRound(correct);
if (correct) {
const praise = `${randChoice(praisePool)} That’s ${appState.streak} in a row!`;
els.feedback.className = "feedback good";
els.feedback.textContent = praise;
lockNextUntilVoice(() => memoSpeak(praise, ()=>{
checkStreakCelebrate();
enableNext();
}));
} else {
const msg = randChoice(wrongPool);
els.feedback.className = "feedback bad";
els.feedback.textContent = msg;
appState.streak = 0;
updateHUD();
lockNextUntilVoice(() => memoSpeak(msg, ()=>{ enableNext(); }));
}
}

function arraysEqual(a,b){ if (a.length!==b.length) return false; for (let i=0;i<a.length;i++) if (a[i]!==b[i]) return false; return true; }
function lockNextUntilVoice(speakFn) {
els.btnNext.disabled = true;
appState.inputLocked = true;
els.answerInput.disabled = true;
els.btnSubmit.disabled = true;
speakFn();
const poll = setInterval(()=>{
if (!appState.voiceSpeaking) {
clearInterval(poll);
appState.inputLocked = false;
els.btnNext.disabled = false;
}
}, 80);
}
function enableNext() { els.btnNext.disabled = false; }

// ------------------------
// Recordkeeping
// ------------------------
function recordRound(correct) {
appState.totalRounds += 1;
const slot = ensureResultSlot(appState.currentLevel, appState.currentSub);
slot.rounds += 1;
if (correct) {
appState.correct += 1;
slot.correct += 1;
appState.streak += 1;
if (appState.streak > appState.bestStreak) appState.bestStreak = appState.streak;
if (appState.streak > slot.bestStreak) slot.bestStreak = appState.streak;
if (appState.streak % 5 === 0) slot.fiveStreaks += 1;
} else {
appState.incorrect += 1;
}
updateHUD();
}

// ------------------------
// Celebrations
// ------------------------
function checkStreakCelebrate() {
const s = appState.streak;
if (s>0 && s%5===0) {
openCelebrateModal(s);
}
}
function openCelebrateModal(streak) {
els.modalCelebrate.setAttribute("aria-hidden","false");
els.celebrateHeading.textContent = "Congratulations!";
els.celebrateText.textContent = `You’ve reached ${streak} in a row!`;
renderCelebrateFX(streak);
memoSpeak(`Congratulations. You’ve reached ${streak} in a row!`, ()=>{});
}
function closeCelebrate() {
els.modalCelebrate.setAttribute("aria-hidden","true");
els.celebrateFX.innerHTML = "";
}
function renderCelebrateFX(streak) {
els.celebrateFX.innerHTML = "";
const count = Math.min(50 + streak*4, 200);
for (let i=0;i<count;i++) {
const piece = document.createElement("div");
piece.className = "confetti";
piece.style.left = (5 + Math.random()*90) + "%";
piece.style.setProperty("--dx", (Math.random()*200-100) + "px");
els.celebrateFX.appendChild(piece);
}
}

// ------------------------
// Level Progression
// ------------------------
function goToNextLevel() {
const lvl = appState.currentLevel;
let nextL = Math.min(lvl+1, 4);
const sub = "A";
enforceModeVisibilityForLevel(nextL);
startGame(nextL, sub);
introInstructionForLevel(nextL, sub);
}

// ------------------------
// End Game Summary
// ------------------------
function endGameSummary() {
showScreen("summary");
els.summaryTableWrap.innerHTML = buildSummaryTableHTML();
const total = appState.correct;
const name = appState.childName || "Detective";
els.summaryPraise.textContent = `Fantastic work, ${name}! Your sharp eyes solved ${total} mysteries today. See you soon!`;
memoSpeak(`Fantastic work, ${name}! You solved ${total} mysteries today. See you soon!`, ()=>{});
}
function buildSummaryTableHTML() {
let rows = "";
const levels = Object.keys(appState.sessionResults).map(x=>parseInt(x,10)).sort((a,b)=>a-b);
levels.forEach(level=>{
const subs = Object.keys(appState.sessionResults[level]).sort();
subs.forEach((sub, idx)=>{
const s = appState.sessionResults[level][sub];
rows += `<tr>
${idx===0 ? `<td rowspan="${subs.length}"><b>Level ${level}</b></td>` : ``}
<td>Sub ${sub}</td>
<td>${s.rounds}</td>
<td>${s.correct}</td>
<td>${s.incorrect}</td>
<td>${s.bestStreak}</td>
<td>${s.fiveStreaks}</td>
</tr>`;
});
});
return `<table class="summary-table"><thead><tr>
<th>Level</th><th>Sub</th><th>Rounds</th><th>Correct</th><th>Incorrect</th><th>Best Streak</th><th>5-in-a-row</th>
</tr></thead><tbody>${rows || `<tr><td colspan="7">No rounds played yet.</td></tr>`}</tbody></table>`;
}

