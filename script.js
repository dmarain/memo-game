window.onload = function () {
  // ===== Global State =====
  let childName = "";
  let currentLevel = "1A";
  let autoNext = false;
  let useTimer = false;
  let timerSeconds = 10;

  let currentStreak = 0;
  let longestStreak = 0;
  let expectedAnswer = [];
  let lastCompletedLevel = "1A";
  let lastMissingKey = ""; // to avoid immediate repeats
  let inputLocked = false; // prevent typing while Memo speaks

  // ===== Assets (ensure these exist exactly with case) =====
  const bgMusic = new Audio("sounds/background-loop.mp3");
  bgMusic.loop = true;
  let musicEnabled = false;

  // ===== Speech Setup =====
  let memoVoice = null;
  function chooseVoice() {
    const voices = speechSynthesis.getVoices();
    memoVoice =
      voices.find(v => /Samantha|Victoria|Google US English/i.test(v.name)) ||
      voices[0] || null;
  }
  speechSynthesis.onvoiceschanged = chooseVoice;
  chooseVoice();

  // Simple phonetic overrides (extend as needed)
  function speakNameForAudio(name){
    if (!name) return "";
    const lower = name.trim().toLowerCase();
    const map = {
      "leo":"Lee-oh",
      "le-o":"Lee-oh",
      "danny":"Danny",
      "denny":"Denny"
    };
    return map[lower] || name;
  }

  function speak(text, onend) {
    // lock input while speaking
    inputLocked = true;
    setControlsEnabled(false);

    if (!memoVoice) chooseVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (memoVoice) u.voice = memoVoice;
    u.rate = 1;
    u.onend = () => {
      inputLocked = false;
      setControlsEnabled(true);
      if (typeof onend === "function") onend();
    };
    try {
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      // If speech errors, still unlock
      inputLocked = false;
      setControlsEnabled(true);
      if (typeof onend === "function") onend();
    }
  }

  // ===== Helpers =====
  function $(id){ return document.getElementById(id); }

  function showScreen(id){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.add("hidden");
      s.classList.remove("active");
    });
    const el = $(id);
    el.classList.remove("hidden");
    el.classList.add("active");

    // Autofocus child name on Parent Settings
    if (id === "parentSettings") {
      setTimeout(()=>{ $("childNameInput")?.focus(); }, 50);
    }
    // Autofocus answer when game shows and not locked
    if (id === "gameScreen" && !inputLocked) {
      setTimeout(()=>{ $("answerInput")?.focus(); }, 80);
    }
  }

  function setControlsEnabled(enabled){
    $("answerInput").disabled = !enabled;
    $("submitBtn").disabled = !enabled;
  }

  function setMusicToggleLabel(){
    $("musicToggle").innerText = musicEnabled
      ? "Music is ON. Tap to turn it OFF"
      : "Music is OFF. Tap to turn it ON";
  }

  function levelRangeEnd(level){
    if (level.startsWith("3")) return 5;
    if (level.startsWith("2")) return 4;
    return 3;
  }

  function missingCountForLevel(level){
    if (level.endsWith("B") || level.endsWith("C")) return 2;
    return 1;
  }

  function nextLevel(level){
    const order = ["1A","1B","1C","2A","2B","2C","3A","3B","3C"];
    const i = order.indexOf(level);
    return (i>-1 && i<order.length-1) ? order[i+1] : null;
  }

  // ===== Welcome Screen Events =====
  $("hearMemoBtn").addEventListener("click", ()=>{
    speak("Welcome to Memo’s Detective Agency. I need your help to find the missing numbers!");
  });

  $("firstTimeBtn").addEventListener("click", ()=> showScreen("parentSettings"));

  $("returningBtn").addEventListener("click", ()=>{
    $("lastLevelInfo").innerText =
      `You last completed Level ${lastCompletedLevel}. You may continue from here or go one level higher.`;
    showScreen("returningScreen");
  });

  $("musicToggle").addEventListener("click", ()=>{
    musicEnabled = !musicEnabled;
    setMusicToggleLabel();
    if (musicEnabled) bgMusic.play(); else bgMusic.pause();
  });
  setMusicToggleLabel();

  // ===== Parent Settings =====
  $("saveSettingsBtn").addEventListener("click", ()=>{
    const nameInput = $("childNameInput").value.trim();
    if (nameInput) childName = nameInput; // keep natural case for pronunciation
    currentLevel = $("startingLevel").value;
    autoNext = $("autoLevelUp").checked;
    useTimer = $("useTimer").checked;
    timerSeconds = parseInt($("timerSeconds").value || "10", 10);
    startGame();
  });

  // ===== Returning User =====
  $("resumeBtn").addEventListener("click", ()=>{
    currentLevel = lastCompletedLevel;
    startGame();
  });

  // ===== Game Flow =====
  function startGame(){
    currentStreak = 0;
    $("levelTitle").innerText = `Level ${currentLevel}`;
    showScreen("gameScreen");
    generateRound(currentLevel);
  }

  function generateRound(level){
    // Reset UI
    $("answerInput").value = "";
    $("feedback").innerText = "";
    $("streakDisplay").innerText = `Current streak: ${currentStreak}  |  Longest: ${longestStreak}`;
    $("timerDisplay").classList.add("hidden");
    $("numberDisplay").innerHTML = "";

    const end = levelRangeEnd(level);
    const need = missingCountForLevel(level);

    // Build number array
    let arr = Array.from({length:end}, (_,i)=> i+1);
    if (level.endsWith("C")) {
      // Shuffle for C levels
      arr = arr.sort(()=> Math.random() - 0.5);
    }

    // Choose distinct indices for missing slots
    const indices = new Set();
    while (indices.size < need) {
      indices.add(Math.floor(Math.random()*arr.length));
    }
    const idxs = Array.from(indices);
    expectedAnswer = idxs.map(i => arr[i]);

    // Avoid immediate repeat of the same missing set (order-insensitive)
    const key = expectedAnswer.slice().sort((a,b)=>a-b).join("-");
    if (key === lastMissingKey) {
      // regenerate once to break repetition
      return generateRound(level);
    }
    lastMissingKey = key;

    // Render numbers
    arr.forEach((num, position)=>{
      const cell = document.createElement("div");
      cell.className = "cell" + (idxs.includes(position) ? " missing" : "");
      cell.textContent = idxs.includes(position) ? "?" : String(num);
      $("numberDisplay").appendChild(cell);
    });

    // Instructions (conditional for 1 vs 2+)
    const nameForAudio = speakNameForAudio(childName);
    const missText = need === 1
      ? `Find the missing number from 1 to ${end}. Enter the answer.`
      : `Find the ${need} missing numbers from 1 to ${end}. Enter them separated by a space.`;
    $("instructions").innerText = missText;

    // Lock input during speech, unlock on end (or after timer)
    if (useTimer){
      // Show numbers for timerSeconds, then hide and unlock
      let t = timerSeconds;
      $("timerDisplay").classList.remove("hidden");
      $("timerDisplay").innerText = `Memorize… ${t}`;
      setControlsEnabled(false);
      inputLocked = true;

      const tick = setInterval(()=>{
        t--;
        if (t>0){
          $("timerDisplay").innerText = `Memorize… ${t}`;
        } else {
          clearInterval(tick);
          $("numberDisplay").querySelectorAll(".cell").forEach(c=>{
            if (!c.classList.contains("missing")) c.textContent = ""; // hide shown numbers
          });
          $("timerDisplay").innerText = "Go!";
          setTimeout(()=>{
            $("timerDisplay").classList.add("hidden");
            inputLocked = false;
            setControlsEnabled(false); // will enable after speech
            speak(`${nameForAudio ? nameForAudio + ", " : ""}${missText}`, ()=>{
              setControlsEnabled(true);
              $("answerInput").focus();
            });
          }, 700);
        }
      }, 1000);
    } else {
      setControlsEnabled(false);
      speak(`${nameForAudio ? nameForAudio + ", " : ""}${missText}`, ()=>{
        setControlsEnabled(true);
        $("answerInput").focus();
      });
    }
  }

  // ===== Answer Submission =====
  $("submitBtn").addEventListener("click", trySubmit);
  $("answerInput").addEventListener("keydown", (e)=>{
    if (e.key === "Enter") trySubmit();
  });

  function trySubmit(){
    if (inputLocked) return; // ignore while speaking/timer
    submitAnswer();
  }

  function submitAnswer(){
    const raw = $("answerInput").value.trim();
    if (!raw){
      $("feedback").innerText = "Please enter your answer before tapping Submit.";
      return;
    }

    const parts = raw.split(/\s+/).map(x=> Number(x)).filter(x=> Number.isInteger(x));
    // Correct if every expected number is included (order doesn't matter)
    const ok = expectedAnswer.every(n => parts.includes(n)) && parts.length >= expectedAnswer.length;

    if (ok){
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      $("feedback").innerText = `Great job, ${childName || "Detective"}! That’s ${currentStreak} in a row.`;
      $("streakDisplay").innerText = `Current streak: ${currentStreak}  |  Longest: ${longestStreak}`;
      // Combine into one utterance to avoid name repeating
      speak(`${childName ? childName + ", " : ""}Great job! That’s ${currentStreak} in a row.`, ()=>{
        if (currentStreak >= 5){
          lastCompletedLevel = currentLevel;
          showCelebration();
        } else {
          generateRound(currentLevel);
        }
      });
    } else {
      currentStreak = 0;
      $("feedback").innerText = `Not quite, ${childName || "Detective"}. Try again!`;
      $("streakDisplay").innerText = `Current streak: ${currentStreak}  |  Longest: ${longestStreak}`;
      speak(`${childName ? childName + ", " : ""}Not quite. Try again!`, ()=>{
        generateRound(currentLevel);
      });
    }
  }

  // ===== Celebration =====
  function showCelebration(){
    showScreen("celebrationScreen");
    $("celebrationMessage").innerText =
      "Congratulations — five in a row! You’re becoming a first-class detective!";
    $("celebrationPrompt").innerText =
      `${childName ? childName + ", " : ""}Here are your choices: stay on this level, go to the next level, or end the game.`;
    speak(`${childName ? childName + ", " : ""}Congratulations — five in a row! You’re becoming a first-class detective!`);
  }

  $("stayLevelBtn").addEventListener("click", ()=>{
    currentStreak = 0;
    $("levelTitle").innerText = `Level ${currentLevel}`;
    showScreen("gameScreen");
    generateRound(currentLevel);
  });

  $("nextLevelBtn").addEventListener("click", ()=>{
    const nx = nextLevel(currentLevel);
    if (nx){
      currentLevel = nx;
      currentStreak = 0;
      $("levelTitle").innerText = `Level ${currentLevel}`;
      showScreen("gameScreen");
      generateRound(currentLevel);
    } else {
      showEnd();
    }
  });

  $("endGameBtn").addEventListener("click", showEnd);

  // ===== End Screen =====
  function showEnd(){
    showScreen("endScreen");
    $("summaryStats").innerText = `You finished at Level ${currentLevel}. Longest streak this session: ${longestStreak}.`;
  }
  $("playAgainBtn").addEventListener("click", ()=>{
    showScreen("welcomeScreen");
  });

  // ===== Final: defensive image fallback (won’t blank page) =====
  $("memoImage").addEventListener("error", ()=>{
    $("memoImage").alt = "Memo image not found (check images/memo-fox.png)";
  });
};
