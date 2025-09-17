// Debug: confirm JS loads
alert("✅ Script loaded");

window.onload = function () {
  // ===== GLOBAL STATE =====
  let childName = "";
  let currentLevel = "1A";
  let autoNext = false;
  let useTimer = false;
  let timerSeconds = 10;
  let currentStreak = 0;
  let longestStreak = 0;
  let expectedAnswer = [];
  let lastCompletedLevel = "1A";
  let inputLocked = false;

  // ===== HELPER SHORTCUT =====
  function $(id){ return document.getElementById(id); }

  // ===== SCREEN SWITCHING =====
  function showScreen(id){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.add("hidden"); s.classList.remove("active");
    });
    $(id).classList.remove("hidden"); $(id).classList.add("active");

    if (id==="parentSettings"){ setTimeout(()=>{$("childNameInput").focus();},50); }
    if (id==="gameScreen" && !inputLocked){ setTimeout(()=>{$("answerInput").focus();},80); }
  }

  // ===== WELCOME SCREEN EVENTS =====
  $("hearMemoBtn").addEventListener("click", ()=>{ alert("Memo’s voice test working"); });

  $("firstTimeBtn").addEventListener("click", ()=>{ showScreen("parentSettings"); });

  $("returningBtn").addEventListener("click", ()=>{
    $("lastLevelInfo").innerText = `You last completed Level ${lastCompletedLevel}.`;
    showScreen("returningScreen");
  });

  $("musicToggle").addEventListener("click", ()=>{ alert("Music toggle clicked"); });

  // ===== PARENT SETTINGS =====
  $("saveSettingsBtn").addEventListener("click", ()=>{
    childName = $("childNameInput").value.trim();
    currentLevel = $("startingLevel").value;
    autoNext = $("autoLevelUp").checked;
    useTimer = $("useTimer").checked;
    timerSeconds = parseInt($("timerSeconds").value,10);
    startGame();
  });

  // ===== RETURNING USER =====
  $("resumeBtn").addEventListener("click", ()=>{ startGame(); });

  // ===== GAME FLOW =====
  function startGame(){
    currentStreak=0;
    $("levelTitle").innerText = `Level ${currentLevel}`;
    showScreen("gameScreen");
    generateRound(currentLevel);
  }

  function generateRound(level){
    $("answerInput").value="";
    $("feedback").innerText="";
    $("streakDisplay").innerText=`Current: ${currentStreak} | Longest: ${longestStreak}`;
    $("numberDisplay").innerHTML="";
    const end=level==="2A"?4:3; // simplified
    let arr=[...Array(end).keys()].map(i=>i+1);
    expectedAnswer=[arr[Math.floor(Math.random()*arr.length)]];
    arr=arr.map(n=> expectedAnswer.includes(n)?"?":n);
    arr.forEach(num=>{
      const cell=document.createElement("div");
      cell.className="cell"+(num==="?"?" missing":"");
      cell.textContent=num;
      $("numberDisplay").appendChild(cell);
    });
    $("instructions").innerText=`Find the missing number from 1 to ${end}. Enter it.`;
  }

  // ===== ANSWER SUBMISSION =====
  $("submitBtn").addEventListener("click", submitAnswer);
  $("answerInput").addEventListener("keydown", (e)=>{ if(e.key==="Enter") submitAnswer(); });

  function submitAnswer(){
    const raw=$("answerInput").value.trim();
    if(!raw){$("feedback").innerText="Please enter your answer.";return;}
    if(expectedAnswer.length>1 && !raw.includes(" ")){
      $("feedback").innerText="Please put a space between the missing numbers.";
      $("answerInput").value=""; $("answerInput").focus(); return;
    }
    const num=parseInt(raw,10);
    if(expectedAnswer.includes(num)){
      currentStreak++; longestStreak=Math.max(longestStreak,currentStreak);
      $("feedback").innerText=`Great job, ${childName||"Detective"}!`;
      setTimeout(()=>generateRound(currentLevel),1200);
    } else {
      currentStreak=0; $("feedback").innerText="Not quite. Try again!";
    }
  }
};
