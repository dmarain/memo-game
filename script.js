// ===== Core helpers =====
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id)?.classList.add('active');}
const $=id=>document.getElementById(id);

// ===== Elements =====
const hearBtn=$('hearVoiceBtn'), musicBtn=$('musicToggleBtn'), firstBtn=$('firstTimeBtn'), retBtn=$('returningBtn');
const quickForm=$('quickNameForm'), quickInput=$('quickNameInput'), quickStart=$('quickStartBtn');
const settingsForm=$('settingsForm'), startBtn=$('startGameBtn'), returningStartBtn=$('returningStartBtn');
const levelLabel=$('levelLabel'), streakLabel=$('streakLabel'), instructionText=$('instructionText');
const numberDisplay=$('numberDisplay'), timerBar=$('timerBar'), timerCount=$('timerCount');
const answerForm=$('answerForm'), answerInput=$('answerInput'), feedback=$('feedback');
const celebration=$('celebrationModal'), summaryStats=$('summaryStats');
const stayBtn=$('stayLevelBtn'), nextBtn=$('nextLevelBtn'), endCeleBtn=$('celebrationEndBtn');
const changeLevelBtn=$('changeLevelBtn'), endBtn=$('endGameBtn'), playAgainBtn=$('playAgainBtn'), exitWelcomeBtn=$('exitToWelcomeBtn');

// ===== State =====
let childName="", currentLevel="1A", streak=0, timerEnabled=false, timerSeconds=10, timerInt=null, currentProblem=null;
let musicOn=false;

// ===== Voice (kept simple) =====
function speak(t){ if(!$('voiceOn')||!$('voiceOn').checked) return; const u=new SpeechSynthesisUtterance(t); speechSynthesis.speak(u); }

// ===== Music toggle (placeholder) =====
function toggleMusic(btn){ musicOn=!musicOn; btn.setAttribute('aria-pressed',musicOn); btn.textContent=`Music: ${musicOn?'ON':'OFF'}`; }

// ===== Ranges/Problems =====
function getRange(level){ if(level.startsWith('1'))return[1,3]; if(level.startsWith('2'))return[1,4]; if(level.startsWith('3'))return[1,5]; return[1,3];}
function generateProblem(level){
  const [a,b]=getRange(level), nums=Array.from({length:b-a+1},(_,i)=>a+i);
  let miss=1; if(level.endsWith('B')||level.endsWith('C')) miss=2; if(level.endsWith('D')) miss=3;
  const missing=[]; while(missing.length<miss){const c=nums[Math.floor(Math.random()*nums.length)]; if(!missing.includes(c)) missing.push(c);}
  return {nums,missing};
}
function renderProblem(p){
  numberDisplay.innerHTML="";
  p.nums.forEach(n=>{const d=document.createElement('div');d.className='num-box'+(p.missing.includes(n)?' missing':'');d.textContent=p.missing.includes(n)?'?':n;numberDisplay.appendChild(d);});
  instructionText.textContent=`Find the ${p.missing.length>1?p.missing.length+' missing numbers':'missing number'} from ${p.nums[0]}–${p.nums.at(-1)}.`;
  speak(instructionText.textContent);
}

// ===== Timer =====
function startTimer(s){
  clearInterval(timerInt); timerBar.classList.remove('hidden'); let t=s; timerCount.textContent=t;
  timerInt=setInterval(()=>{ t--; timerCount.textContent=t; if(t<=0){clearInterval(timerInt); timerBar.classList.add('hidden'); answerInput.focus();}},1000);
}

// ===== Game flow =====
function startLevel(level){
  currentLevel=level; streak=0; levelLabel.textContent=`Level ${level}`; streakLabel.textContent='Streak: 0';
  showScreen('game-screen'); newRound();
}
function newRound(){ currentProblem=generateProblem(currentLevel); renderProblem(currentProblem); if(timerEnabled) startTimer(timerSeconds); answerInput.value=""; answerInput.focus(); feedback.textContent=""; }
function showCelebration(){ celebration.classList.remove('hidden'); speak('Congratulations — five in a row! You’re becoming a first class detective!'); }
function endGame(){ showScreen('end-screen'); summaryStats.textContent=`${childName||'Player'}, Level ${currentLevel}, max streak ${streak}.`; }

// ===== Events: Welcome / Name Enter =====
quickForm.addEventListener('submit',e=>{
  e.preventDefault();
  childName=quickInput.value.trim().toUpperCase(); if(!childName){quickInput.focus();return;}
  $('childName').value=childName; // prefill parent settings
  currentLevel='1A'; timerEnabled=false; timerSeconds=10;
  startLevel(currentLevel);
});

hearBtn.onclick=()=>speak("Welcome to Memo’s Detective Agency. Type your name to begin.");
musicBtn.onclick=()=>toggleMusic(musicBtn);
firstBtn.onclick=()=>showScreen('parent-settings');
retBtn.onclick=()=>showScreen('returning-screen');
startBtn.onclick=()=>startLevel(currentLevel);
settingsForm.onsubmit=e=>{e.preventDefault();
  childName=$('childName').value.toUpperCase(); currentLevel=$('startLevel').value;
  timerEnabled=$('timerEnabled').checked; timerSeconds=parseInt($('timerSeconds').value)||10;
  showScreen('welcome-screen'); $('quickNameInput').value=childName;
};
returningStartBtn.onclick=()=>startLevel(currentLevel);
changeLevelBtn.onclick=()=>showScreen('welcome-screen');
endBtn.onclick=()=>endGame();
stayBtn.onclick=()=>{celebration.classList.add('hidden'); newRound();};
nextBtn.onclick=()=>{celebration.classList.add('hidden'); const n=parseInt(currentLevel[0]); startLevel((n+1)+'A');};
endCeleBtn.onclick=()=>endGame();

// ===== Answer check =====
answerForm.addEventListener('submit',e=>{
  e.preventDefault();
  const s=answerInput.value.trim(); if(!s){feedback.textContent='Please enter a number.'; return;}
  const parts=s.split(' ').map(Number).sort((a,b)=>a-b), correct=[...currentProblem.missing].sort((a,b)=>a-b);
  if(JSON.stringify(parts)===JSON.stringify(correct)){ streak++; streakLabel.textContent=`Streak: ${streak}`; feedback.textContent='Correct!'; speak('Great job!');
    if(streak%5===0) showCelebration(); else newRound();
  } else { streak=0; streakLabel.textContent='Streak: 0'; feedback.textContent='Try again.'; speak('Try again.'); }
});
// ===== Remaining hooks =====
document.getElementById('inGameMusicToggle').onclick=()=>toggleMusic(document.getElementById('inGameMusicToggle'));
playAgainBtn.onclick=()=>startLevel('1A');
exitWelcomeBtn.onclick=()=>showScreen('welcome-screen');
