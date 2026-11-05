/* Quiz da Família — multiplayer local, perguntas por categoria */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];
const TOTAL_QUESTIONS = 10;

const state = {
  players: [],          // {name, avatar, score}
  selectedAvatar: AVATARS[0],
  selectedCategories: ["mix"],
  currentPlayerIndex: 0,
  questions: [],         // {q, emoji, options, correctIndex}
  questionIndex: 0,
  answered: false,
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Setup screen ---------- */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const categoryOptionsEl = document.getElementById("category-options");
const startBtn = document.getElementById("start-game-btn");

function renderAvatarPicker() {
  avatarPicker.innerHTML = "";
  AVATARS.forEach((av) => {
    const div = document.createElement("div");
    div.className = "avatar-choice" + (av === state.selectedAvatar ? " selected" : "");
    div.textContent = av;
    div.addEventListener("click", () => {
      state.selectedAvatar = av;
      renderAvatarPicker();
    });
    avatarPicker.appendChild(div);
  });
}

function renderPlayersList() {
  playersList.innerHTML = "";
  state.players.forEach((p, idx) => {
    const chip = document.createElement("div");
    chip.className = "player-chip";
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span>`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.title = "Remover jogador";
    removeBtn.addEventListener("click", () => {
      state.players.splice(idx, 1);
      renderPlayersList();
      updateStartBtn();
    });
    chip.appendChild(removeBtn);
    playersList.appendChild(chip);
  });
}

function updateStartBtn() {
  startBtn.disabled = state.players.length < 1;
}

document.getElementById("add-player-btn").addEventListener("click", () => addPlayer());
document.getElementById("player-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPlayer();
});

function addPlayer(presetName, presetAvatar) {
  const input = document.getElementById("player-name");
  const name = (presetName || input.value).trim();
  const avatar = presetAvatar || state.selectedAvatar;
  if (!name) { input.focus(); return; }
  if (state.players.length >= 8) { alert("Máximo de 8 jogadores!"); return; }
  state.players.push({ name, avatar, score: 0 });
  input.value = "";
  PlayersCache.add(name, avatar);
  renderPlayersList();
  updateStartBtn();
  renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
}

function renderCategoryOptions() {
  categoryOptionsEl.innerHTML = "";
  Object.keys(CATEGORY_LABELS).forEach((key) => {
    const chip = document.createElement("div");
    chip.className = "category-chip" + (state.selectedCategories.includes(key) ? " selected" : "");
    chip.textContent = CATEGORY_LABELS[key];
    chip.addEventListener("click", () => {
      let next;
      if (key === "mix") {
        next = ["mix"];
      } else {
        next = state.selectedCategories.filter((c) => c !== "mix");
        next = next.includes(key) ? next.filter((c) => c !== key) : next.concat(key);
        if (next.length === 0) next = ["mix"];
      }
      state.selectedCategories = next;
      renderCategoryOptions();
    });
    categoryOptionsEl.appendChild(chip);
  });
}

/* ---------- Starting / round flow ---------- */

startBtn.addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

function startGame() {
  state.players.forEach((p) => (p.score = 0));
  state.currentPlayerIndex = 0;

  const pool = shuffle(getQuestionsByCategories(state.selectedCategories));
  const picked = pool.slice(0, Math.min(TOTAL_QUESTIONS, pool.length));
  state.questions = picked.map((q) => {
    const correctText = q.options[q.correct];
    const options = shuffle(q.options);
    return { q: q.q, emoji: q.emoji, options, correctIndex: options.indexOf(correctText) };
  });
  state.questionIndex = 0;

  showScreen("game-screen");
  renderScoreboard();
  renderQuestion();
}

function renderScoreboard() {
  const el = document.getElementById("scoreboard");
  el.innerHTML = "";
  state.players.forEach((p, idx) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (idx === state.currentPlayerIndex ? " current-turn" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span><span class="pts">${p.score} 🏅</span>`;
    el.appendChild(chip);
  });
}

function renderQuestion() {
  state.answered = false;
  const total = state.questions.length;
  document.getElementById("round-counter").textContent = `Pergunta ${state.questionIndex + 1} de ${total}`;

  const player = state.players[state.currentPlayerIndex];
  document.getElementById("turn-hint").innerHTML = `${player.avatar} Vez de <strong>${player.name}</strong>`;

  const q = state.questions[state.questionIndex];
  document.getElementById("question-emoji").textContent = q.emoji;
  document.getElementById("question-text").textContent = q.q;

  const feedback = document.getElementById("feedback-text");
  feedback.textContent = "";
  feedback.className = "feedback-text";

  const grid = document.getElementById("answers-grid");
  grid.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => onAnswer(idx));
    grid.appendChild(btn);
  });

  renderScoreboard();
}

function onAnswer(idx) {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.questionIndex];
  const buttons = document.querySelectorAll("#answers-grid .answer-btn");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correctIndex) b.classList.add("correct");
  });

  const feedback = document.getElementById("feedback-text");
  if (idx === q.correctIndex) {
    state.players[state.currentPlayerIndex].score++;
    feedback.textContent = "Isso aí! Resposta certa! 🎉";
    feedback.classList.add("correct");
  } else {
    buttons[idx].classList.add("wrong");
    feedback.textContent = "Quase! A resposta certa ficou em verde.";
    feedback.classList.add("wrong");
  }

  renderScoreboard();
  setTimeout(nextQuestion, 1400);
}

function nextQuestion() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.questionIndex++;
  if (state.questionIndex >= state.questions.length) {
    showWinnerOverlay();
    return;
  }
  renderQuestion();
}

function showWinnerOverlay() {
  const maxScore = Math.max(...state.players.map((p) => p.score));
  const winners = state.players.filter((p) => p.score === maxScore);

  const overlay = document.getElementById("winner-overlay");
  const avatarEl = document.getElementById("winner-avatar");
  const textEl = document.getElementById("winner-text");
  const titleEl = document.getElementById("winner-title");

  if (winners.length === 1) {
    titleEl.textContent = "🏆 Vencedor! 🏆";
    avatarEl.innerHTML = `<span class="avatar-mini">${winners[0].avatar}</span>`;
    textEl.textContent = `${winners[0].name} venceu com ${winners[0].score} acertos! 🎉`;
  } else {
    titleEl.textContent = "🤝 Empate! 🤝";
    avatarEl.innerHTML = winners.map((w) => `<span class="avatar-mini">${w.avatar}</span>`).join(" ");
    textEl.textContent = winners.map((w) => w.name).join(" e ") + ` empataram com ${maxScore} acertos cada! 🎉`;
  }

  overlay.classList.add("active");
  launchConfetti();
}

function launchConfetti() {
  const confettiEmojis = ["🎉", "🎊", "⭐", "🏅", "✨", "🎈"];
  const container = document.createElement("div");
  container.className = "confetti";
  document.body.appendChild(container);
  for (let i = 0; i < 60; i++) {
    const span = document.createElement("span");
    span.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.animationDuration = 2 + Math.random() * 2 + "s";
    span.style.fontSize = 16 + Math.random() * 20 + "px";
    container.appendChild(span);
  }
  setTimeout(() => container.remove(), 4200);
}

/* ---------- Init ---------- */

renderAvatarPicker();
renderPlayersList();
renderCategoryOptions();
updateStartBtn();
renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
