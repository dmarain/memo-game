
// ===== Helpers =====
const $=id=>document.getElementById(id);
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id)?.classList.add('active');}

// ===== Elements =====
const hearBtn=$('hearVoiceBtn'), musicBtn=$('musicToggleBtn'), firstBtn=$('firstTimeBtn'), retBtn=$('returningBtn');
const quickForm=$('quickNameForm'), quickInput=$('quickNameInput');
const settingsForm=$('settingsForm'), startBtn=$('startGameBtn');
const levelLabel=$('levelLabel'), streakLabel=$('streakLabel'), instructionText=$('instructionText');
const numberDisplay=$('numberDisplay'), timerBar=$('timerBar'), timerCount=$('timerCount');
const answerForm=$('answerForm'), answerInput=$('answerInput'), feedback=$('feedback');
const celebration=$('celebrationModal'), stayBtn=$('stayLevelBtn'), nextBtn=$('nextLevelBtn'), endCeleBtn=$('celebrationEndBtn');
const changeLevelBtn=$('changeLevelBtn'), endBtn=$('endGameBtn');
const summaryStats=$('summaryStats'), playAgainBtn=$('playAgainBtn'), exitWelcomeBtn=$('exitToWelcomeBtn');

// ===== State =====
let childName="", currentLevel="1A", lastLevel="1A", streak=0, timerEnabled=false, timerSeconds=10, timerInt=null, currentProblem=null;
let musicOn=false;

// ===== Voice (force female when possible) =====
function pickFemaleVoice(){
const v=speechSynthesis.getVoices();
return v.find(x=>/Samantha|Victoria|Emily|Allison|Google US English Female/i.test(x.name))
|| v.find(x=>x.gender==='female') || v[0] || null;
}
function speak(t){
if($('voiceOn') && !$('voiceOn').checked) return;
const u=new SpeechSynthesisUtterance(t);
u.voice=pickFemaleVoice(); u.pitch=1.1; u.rate=1.0;
speechSynthesis.cancel(); speechSynthesis.speak(u);
}
window.speechSynthesis.onvoiceschanged=()=>{};

// ===== Music toggle =====
function toggleMusic(btn){ musicOn=!musicOn; btn.setAttribute('aria-pressed',musicOn); btn.textContent=`Music: ${musicOn?'ON':'OFF'}`; }

// ===== Level utilities =====
function levelOrder(){return ["1A","1B","1C","2A","2B","2C","3A","3B","3C","4A","4B","4C"];}
function nextLevelCode(cur){const L=levelOrder(); const i=L.indexOf(cur); return L[Math.min(i+1,L.length-1)];}
function getRange(level){
if(level.startsWith('1'))return[1,3];
if(level.startsWith('2'))return[1,4];
if(level.startsWith('3'))return[1,5];
if(level.startsWith('4'))return[1,6];
return[1,3];
}

// ===== Problem generator =====
function generateProblem(level){
const [a,b]=getRange(level), nums=Array.from({length:b-a+1},(_,i)=>a+i);
let miss=1; if(level.endsWith('B')) miss=2; if(level.endsWith('C')) miss=2;
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
instructionText.textContent=`Find the ${p.missing.length>1?p.missing.length+' missing numbers':'missing number'} from ${p.nums[0]}–${p.nums.at(-1)}.`;
speak(instructionText.textContent);
}

// ===== Timer =====
function startTimer(s){
clearInterval(timerInt); timerBar.classList.remove('hidden'); let t=s; timerCount.textContent=t;
timerInt=setInterval(()=>{t--; timerCount.textContent=t; if(t<=0){clearInterval(timerInt); timerBar.classList.add('hidden'); answerInput.focus();}},1000);
}

// ===== Game flow =====
function startLevel(level){
currentLevel=level; streak=0; levelLabel.textContent=`Level ${level}`; streakLabel.textContent='Streak: 0';
showScreen('game-screen'); newRound();
}
function newRound(){ currentProblem=generateProblem(currentLevel); renderProblem(currentProblem); if(timerEnabled) startTimer(timerSeconds); answerInput.value=""; answerInput.focus(); feedback.textContent=""; }
function showCelebration(){ celebration.classList.remove('hidden'); speak('Congratulations — five in a row! You’re becoming a first class detective!'); }
function endGame(){ showScreen("end-screen"); summaryStats.textContent=`${childName||'PLAYER'} — Level ${currentLevel} — Max streak ${streak}.`; lastLevel=currentLevel; }

// ===== Returning user populate =====
function populateReturning(){
const wrap=$('availableLevels'); wrap.innerHTML="";
const resume=document.createElement('button'); resume.textContent=`Resume: ${lastLevel}`; resume.onclick=()=>startLevel(lastLevel); wrap.appendChild(resume);
const up=document.createElement('button'); up.textContent=`Step Up: ${nextLevelCode(lastLevel)}`; up.onclick=()=>startLevel(nextLevelCode(lastLevel)); wrap.appendChild(up);
}

// ===== Events =====
quickForm.addEventListener('submit',e=>{
e.preventDefault();
childName=quickInput.value.trim().toUpperCase(); if(!childName){quickInput.focus();return;}
$('childName').value=childName; currentLevel='1A'; startLevel(currentLevel);
});
hearBtn.onclick=()=>speak("Welcome to Memo’s Detective Agency. Type your name to begin.");
musicBtn.onclick=()=>toggleMusic(musicBtn);
firstBtn.onclick=()=>showScreen('parent-settings');
retBtn.onclick=()=>{populateReturning(); showScreen('returning-screen');};
startBtn.onclick=()=>startLevel(currentLevel);
settingsForm.onsubmit=e=>{e.preventDefault(); childName=$('childName').value.toUpperCase(); currentLevel=$('startLevel').value; timerEnabled=$('timerEnabled').checked; timerSeconds=parseInt($('timerSeconds').value)||10; showScreen('welcome-screen'); $('quickNameInput').value=childName;};
changeLevelBtn.onclick=()=>showScreen('welcome-screen');
endBtn.onclick=()=>endGame();
stayBtn.onclick=()=>{celebration.classList.add('hidden'); newRound();};
nextBtn.onclick=()=>{celebration.classList.add('hidden'); const n=nextLevelCode(currentLevel); lastLevel=n; startLevel(n);};
endCeleBtn.onclick=()=>endGame();
answerForm.addEventListener('submit',e=>{
e.preventDefault();
const s=answerInput.value.trim(); if(!s){feedback.textContent='Please enter a number.'; return;}
const parts=s.split(' ').map(Number).sort((a,b)=>a-b), correct=[...currentProblem.missing].sort((a,b)=>a-b);
if(JSON.stringify(parts)===JSON.stringify(correct)){ streak++; streakLabel.textContent=`Streak: ${streak}`; feedback.textContent='Correct!'; speak('Great job!'); if(streak%5===0) showCelebration(); else newRound();
} else { streak=0; streakLabel.textContent='Streak: 0'; feedback.textContent='Try again.'; speak('Try again.'); }
});

// ===== Final hooks =====
$('inGameMusicToggle').onclick=()=>toggleMusic($('inGameMusicToggle'));
playAgainBtn.onclick=()=>startLevel('1A');
exitWelcomeBtn.onclick=()=>showScreen('welcome-screen');
