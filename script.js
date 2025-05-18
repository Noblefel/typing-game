let cursor = 0;
let lives = 40;
let words;

let level = 1;
let typed = 0;
let wrong = 0;
let spaces;

let timerTimeout;
let timerInterval;

const letters = document.querySelector("#letters");
const progress = document.querySelector("progress");

document.addEventListener("keydown", (e) => {
  const lower = e.key.charCodeAt() >= 65 && e.key.charCodeAt() <= 90;
  const upper = e.key.charCodeAt() >= 97 && e.key.charCodeAt() <= 122;
  const alpha = (lower || upper) && e.key.length == 1;

  if (!alpha && e.key != "Backspace" && e.key != " ") {
    return;
  }

  if (!progress.value) {
    startTimer();
  }

  const el = letters.children[cursor];

  if (e.key == "Backspace") {
    if (cursor == 0) return;

    if (!spaces && el.previousSibling.innerText == " ") {
      el.className = "";
      cursor--;
    }

    cursor--;
    letters.children[cursor + 1].className = "";
    letters.children[cursor].className = "cursor";
    return;
  }

  typed++;
  document.querySelector("#typed").innerText = typed;

  if (e.key == el.innerText) {
    el.className = "correct";
  } else {
    addLives(-1);
    el.className = "wrong";

    wrong++;
    document.querySelector("#wrong").innerText = wrong;
  }

  if (!el.nextSibling) {
    let correct = 0;

    for (const l of letters.children) {
      if (l.className == "correct" || l.className == "") {
        correct++;
      }
    }

    const percent = correct / letters.children.length;
    const hp = Math.floor(percent * 20);
    addLives(hp);

    resetTimer();
    letters.innerHTML = "";
    generateText();
    cursor = 0;

    level++;
    document.querySelector("#level").innerText = level;
    return;
  }

  if (!spaces && el.nextSibling.innerText == " ") {
    cursor++;
  }

  cursor++;
  letters.children[cursor].classList.add("cursor");
});

document.querySelector("#reset").addEventListener("click", () => {
  typed = 0;
  wrong = 0;
  level = 1;
  document.querySelector("#typed").innerText = 0;
  document.querySelector("#wrong").innerText = 0;
  document.querySelector("#level").innerText = 1;

  resetTimer();
  addLives(40);

  letters.innerHTML = "";
  generateText();
  cursor = 0;
});

document.querySelector("#space").addEventListener("click", (e) => {
  document.activeElement.blur();
  spaces = e.target.checked;
});

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("./words.txt");
  const text = await res.text();
  words = text.replace(/(\r\n|\n|\r)/gm, " ").split(" ");

  generateText();
});

function addLives(n) {
  const span = document.createElement("span");
  span.className = n < 0 ? "damage" : "heal";
  span.innerText = n < 0 ? n : "+" + n;

  if (lives + n <= 0) {
    resetTimer();
    alert("game over");
    lives = 40;
    document.querySelector("#lives").innerText = lives;

    letters.innerHTML = "";
    generateText();
    cursor = 0;

    level = 1;
    document.querySelector("#level").innerText = 1;
    return;
  }

  lives = Math.min(40, lives + n);
  document.querySelector("#lives").innerText = lives;
  document.querySelector("#add-lives").appendChild(span);
  setTimeout(() => span.remove(), 500);
}

function generateText() {
  const selected = [];
  const n = 4 + Math.random() * 10;

  for (let i = 0; i < n; i++) {
    const rand = Math.random() * words.length;
    const word = words[Math.floor(rand)];
    selected.push(word);
  }

  for (let s of selected.join(" ")) {
    const el = document.createElement("span");
    el.innerText = s;
    letters.appendChild(el);
  }

  letters.children[0].classList.add("cursor");
}

function startTimer() {
  const sc = 5 + Math.max(20 - level * 3, 0);
  const ms = sc * 1000;

  progress.max = ms;
  progress.value = ms;

  timerInterval = setInterval(() => {
    progress.value -= 40;
    const percent = progress.value / ms;

    if (percent < 0.3) {
      progress.className = "low";
    } else if (percent < 0.6) {
      progress.className = "med";
    }
  }, 40);

  timerTimeout = setTimeout(() => {
    resetTimer();
    addLives(-10);

    letters.innerHTML = "";
    generateText();
    cursor = 0;
  }, ms);
}

function resetTimer() {
  clearInterval(timerInterval);
  clearTimeout(timerTimeout);
  progress.value = 0;
  progress.className = "";
}
