let numbers = [];
let selected = [];
let score = 0;
let timeLeft = 120;
let diff = 50
let timerInterval = null;
let gameActive = false;

function startGame() {
  score = 0;
  timeLeft = 120;
  gameActive = true;
  document.getElementById("diffInput").disabled = true;

  // 🔥 read user input
  diff = parseInt(document.getElementById("diffInput").value);

  generateNumbers();
  renderNumbers();

  document.getElementById("score").innerText = score;
  document.getElementById("time").innerText = timeLeft;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameActive = false;

  document.getElementById("result").innerText = "⏰ Game over! Final score: " + score;

  let highScore = localStorage.getItem("highScore") || 0;

  let modifiedScore = score*diff

  if (modifiedScore > highScore) {
    localStorage.setItem("highScore", modifiedScore);
    highScore = modifiedScore;
  }

  document.getElementById("highScore").innerText = highScore;

  document.getElementById("diffInput").disabled = false;
}

//stdDev 25 seems pretty reasonable, if make it much bigger also change the cap of attempts on ensureValidSet
function generateNormalRandom(mean = 0, stdDev = diff) {
  let u1 = Math.random();
  let u2 = Math.random();

  let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  return Math.round(z0 * stdDev + mean);
}

function generateNumbers() {
  numbers = [];

  while (numbers.length < 5) {
    let num = generateNormalRandom(0, diff);

    // ❌ exclude 0 and duplicates
    if (num !== 0 && !numbers.includes(num)) {
      numbers.push(num);
    }
  }

  // shuffle the array
  shuffleArray(numbers);
  ensureValidSet();

  renderNumbers();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getSubsetSumsWithSize(arr) {
  let results = [];

  let n = arr.length;

  for (let mask = 1; mask < (1 << n); mask++) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += arr[i];
        count++;
      }
    }

    results.push({ sum, count });
  }

  return results;
}

function hasZeroSumSet(nums) {
  let positives = nums.filter(n => n > 0);
  let negatives = nums.filter(n => n < 0);

  let pos = getSubsetSumsWithSize(positives);
  let neg = getSubsetSumsWithSize(negatives);

  for (let p of pos) {
    for (let n of neg) {
      if (p.sum === -n.sum && (p.count + n.count >= 3)) {
        return true;
      }
    }
  }

  return false;
}

function drawCard() {
  let newNum;

  while (true) {
    newNum = generateNormalRandom(0,diff);

    if (newNum !== 0 && !numbers.includes(newNum)) {
      break;
    }
  }

  numbers.push(newNum);
  shuffleArray(numbers);
}

function renderNumbers() {
  let container = document.getElementById("numbers");
  container.innerHTML = "";
  selected = [];

  numbers.forEach((num, index) => {
    let btn = document.createElement("button");
    btn.innerText = num;

    btn.onclick = () => {
      btn.classList.toggle("selected");

      if (selected.includes(index)) {
        selected = selected.filter(i => i !== index);
      } else {
        selected.push(index);
      }
    };

    container.appendChild(btn);
  });
}

function ensureValidSet(maxAttempts = 20) {
  let attempts = 0;

  while (!hasZeroSumSet(numbers) && attempts < maxAttempts) {
    drawCard();
    attempts++;
  }
}

function submitSet() {
  if (selected.length < 3) {
    document.getElementById("result").innerText = "Pick at least 3!";
    return;
  }

  let sum = selected.reduce((acc, i) => acc + numbers[i], 0);

  if (sum === 0) {
    document.getElementById("result").innerText = "Correct!";
    score += selected.length;

    // remove selected numbers
    numbers = numbers.filter((_, i) => !selected.includes(i));
  } else {
    document.getElementById("result").innerText = "Not zero!";
    score -= 1;
  }

  // ensure valid set exists
  ensureValidSet();

  renderNumbers();

  document.getElementById("score").innerText = score;
  updateSetStatus();
}

function stopGame() {
  if (!gameActive) return;

  endGame();
}

function handleDrawCard() {
  drawCard();          // add the number
  renderNumbers();     // update display
  score -=1;           // penalty to avoid spamming to guarantee easy sets
  document.getElementById("score").innerText = score;
  updateSetStatus();   // update valid set message
}

function updateSetStatus() {
  let status = hasZeroSumSet(numbers);

  let text = status ? "✅ Valid set exists" : "❌ No valid sets";

  document.getElementById("setStatus").innerText = text;
}

document.getElementById("submitBtn").onclick = submitSet;

generateNumbers();
updateSetStatus();
document.getElementById("diffDisplay").innerText = diff;
document.getElementById("stopBtn").onclick = stopGame;
let savedHigh = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = savedHigh;
