// Helpers
const $=id=>document.getElementById(id);
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id)?.classList.add('active');}

// Elements
const hearBtn=$('hearVoiceBtn'), musicBtn=$('musicToggleBtn');
const quickForm=$('quickNameForm'), quickInput=$('quickNameInput'), quickStartBtn=$('quickStartBtn');
const firstBtn=$('firstTimeBtn'), returningBtn=$('returningBtn');

const settingsForm=$('settingsForm'), startBtn=$('startGameBtn');
const levelLabel=$('levelLabel'), streakLabel=$('streakLabel'), instructionText=$('instructionText');
const numberDisplay=$('numberDisplay'), timerBar=$('timerBar'), timerCount=$('timerCount');
const answerForm=$('answerForm'), answerInput=$('answerInput'), feedback=$('feedback');

const celebration=$('celebrationModal'), stayBtn=$('stayLevelBtn'), nextBtn=$('nextLevelBtn'), endCeleBtn=$('celebrationEndBtn');
const changeLevelBtn=$('changeLevelBtn'), endBtn=$('endGameBtn');
const summaryStats=$('summaryStats'), playAgainBtn=$('playAgainBtn'), exitWelcomeBtn=$('exitToWelcomeBtn');

// Returning elements
const returnForm=$('returningForm'), returnName=$('returnName'), resumeBtn=$('resumeBtn');
const chooseLevel=$('chooseLevel'), startChosenBtn=$('startChosenBtn');

// State
let childName="", currentLevel="1A", lastLevel="1A", streak=0, timerEnabled=false, timerSeconds=10, timerInt=null, currentProblem=null;
let musicOn=false;

// Voice
function pickFemaleVoice(){
  const v=speechSynthesis.getVoices();
  return v.find(x=>/Samantha|Victoria|Emily|Allison|Google US English Female/i.test(x.name))
      || v.find(x=>x.gender==='female') || v[0] || null;
}
function speak(t){
  if($('voiceOn') && !$('voiceOn').checked) return;
  const u=new SpeechSynthesisUtterance(t);
  u.voice=pickFemaleVoice(); u.pitch=1.08; u.rate=1.0;
  // cancel to avoid overlaps, then speak
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
window.speechSynthesis.onvoiceschanged=()=>{};

// Music (placeholder)
function toggleMusic(btn){ musicOn=!musicOn; btn.setAttribute('aria-pressed',musicOn); btn.textContent=`Music: ${musicOn?'ON':'OFF'}`; }

// Levels
function levelOrder(){return ["1A","1B","1C","2A","2B","2C","3A","3B","3C","4A","4B","4C"];}
function nextLevelCode(cur){const L=levelOrder();const i=L.indexOf(cur);return L[Math.min(i+1,L.length-1)];}
function getRange(level){ if(level.startsWith('1'))return[1,3]; if(level.startsWith('2'))return[1,4]; if(level.startsWith('3'))return[1,5]; if(level.startsWith('4'))return[1,6]; return[1,3];}

// Problems
function generateProblem(level){
  const [a,b]=getRange(level), nums=Array.from({length:b-a+1},(_,i)=>a+i);
  let miss=1; if(level.endsWith('B')||level.endsWith('C')) miss=2;
  const missing=[]; while(missing.length<miss){const c=nums[Math.floor(Math.random()*nums.length)]; if(!missing.includes(c)) missing.push(c);}
  return {nums,missing};
}
function renderProblem(p){
  numberDisplay.innerHTML="";
  const show=currentLevel.endsWith("C")?[...p.nums].sort(()=>Math.random()-0.5):p.nums;
  show.forEach(n=>{
    const d=document.createElement('div');
    const missing=p.missing.includes(n);
    d.className='num-box'+(missing?' missing':'');
    d.textContent=missing?'?':n;
    numberDisplay.appendChild(d);
  });
  const namePrefix = childName ? (childName + ", ") : "";
  instructionText.textContent=`Find the ${p.missing.length>1?p.missing.length+' missing numbers':'missing number'} from ${p.nums[0]}–${p.nums.at(-1)}.`;
  speak(namePrefix + instructionText.textContent);
}

// Timer
function startTimer(s){
  clearInterval(timerInt); timerBar.classList.remove('hidden'); let t=s; timerCount.textContent=t;
  timerInt=setInterval(()=>{t--; timerCount.textContent=t; if(t<=0){clearInterval(timerInt); timerBar.classList.add('hidden'); answerInput.focus();}},1000);
}

// Game flow
function startLevel(level){
  currentLevel=level; streak=0; levelLabel.textContent=`Level ${level}`; streakLabel.textContent='Streak: 0';
  showScreen('game-screen'); newRound();
}
function newRound(){ currentProblem=generateProblem(currentLevel); renderProblem(currentProblem); if(timerEnabled) startTimer(timerSeconds); answerInput.value=""; answerInput.focus(); feedback.textContent=""; }
function showCelebration(){ celebration.classList.remove('hidden'); speak('Congratulations — five in a row! You’re becoming a first class detective!'); }
function endGame(){ showScreen("end-screen"); summaryStats.textContent=`${childName||'PLAYER'} — Level ${currentLevel} — Max streak ${streak}.`; lastLevel=currentLevel; }

// Returning user population
function populateChooseLevel(){
  chooseLevel.innerHTML="";
  levelOrder().forEach(code=>{
    const opt=document.createElement('option'); opt.value=code; opt.textContent=code; chooseLevel.appendChild(opt);
  });
  chooseLevel.value = lastLevel; // default to last
}

// Events — Welcome
hearBtn.onclick=()=>speak("Welcome to Memo’s Detective Agency. If this is your first time, tap First-Time User for Parent Settings. If you are returning, tap Returning User to resume or choose a level.");
musicBtn.onclick=()=>toggleMusic(musicBtn);

quickForm.addEventListener('submit',e=>{
  e.preventDefault();
  childName=quickInput.value.trim().toUpperCase(); if(!childName){quickInput.focus();return;}
  // Quick Start = Level 1A
  $('childName').value=childName; lastLevel="1A"; timerEnabled=false; timerSeconds=10;
  startLevel("1A");
});

firstBtn.onclick=()=>{
  // go to Parent Settings; prefill name if available
  $('childName').value = (quickInput.value||"").toUpperCase();
  showScreen('parent-settings');
};

returningBtn.onclick=()=>{
  returnName.value=(quickInput.value||"").toUpperCase();
  populateChooseLevel();
  showScreen('returning-screen');
};

// Parent Settings
settingsForm.onsubmit=(e)=>{
  e.preventDefault();
  childName=$('childName').value.trim().toUpperCase();
  lastLevel=$('startLevel').value; // respect chosen level
  timerEnabled=$('timerEnabled').checked;
  timerSeconds=parseInt($('timerSeconds').value)||10;
  // Back to welcome with name filled
  showScreen('welcome-screen');
  quickInput.value=childName;
  speak("Settings saved. You can Quick Start or choose Returning to pick a level.");
};
startBtn.onclick=()=>{ // Start from chosen level immediately
  const nm=$('childName').value.trim().toUpperCase(); if(nm) childName=nm;
  lastLevel=$('startLevel').value;
  timerEnabled=$('timerEnabled').checked;
  timerSeconds=parseInt($('timerSeconds').value)||10;
  startLevel(lastLevel);
};

// Returning actions
resumeBtn.onclick=()=>{ childName=returnName.value.trim().toUpperCase(); if(childName) quickInput.value=childName; startLevel(lastLevel); };
startChosenBtn.onclick=()=>{ childName=returnName.value.trim().toUpperCase(); if(childName) quickInput.value=childName; lastLevel=chooseLevel.value; startLevel(lastLevel); };

// Answer check
answerForm.addEventListener('submit',e=>{
  e.preventDefault();
  const s=answerInput.value.trim(); if(!s){feedback.textContent='Please enter a number.'; return;}
  const parts=s.split(/\s+/).map(Number).sort((a,b)=>a-b), correct=[...currentProblem.missing].sort((a,b)=>a-b);
  if(JSON.stringify(parts)===JSON.stringify(correct)){ streak++; streakLabel.textContent=`Streak: ${streak}`; feedback.textContent='Correct!'; speak('Great job!');
    if(streak%5===0) showCelebration(); else newRound();
  } else { streak=0; streakLabel.textContent='Streak: 0'; feedback.textContent='Try again.'; speak('Try again.'); }
});

// Celebration + nav
stayBtn.onclick=()=>{celebration.classList.add('hidden'); newRound();};
nextBtn.onclick=()=>{celebration.classList.add('hidden'); const n=nextLevelCode(currentLevel); lastLevel=n; startLevel(n);};
endCeleBtn.onclick=()=>endGame();

changeLevelBtn.onclick=()=>showScreen('welcome-screen');
endBtn.onclick=()=>endGame();
playAgainBtn.onclick=()=>startLevel('1A');
exitWelcomeBtn.onclick=()=>showScreen('welcome-screen');
