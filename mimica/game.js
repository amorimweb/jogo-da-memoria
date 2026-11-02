/* Mímica e Desenho Rápido — jogo local para a família */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];
const ROUND_SECONDS = 60;
const TOTAL_ROUNDS = 8;
const MAX_SKIPS_PER_PLAYER = 3;

const state = {
  submode: "mimica", // "mimica" | "desenho" (apenas cosmético)
  players: [],        // {name, avatar, score, skipsUsed}
  selectedAvatar: AVATARS[0],
  selectedCategories: ["mix"],
  currentPlayerIndex: 0,
  round: 0,
  wordPool: [],
  currentWord: null,
  timer: { secondsLeft: ROUND_SECONDS, intervalId: null },
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
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

/* ================= SUBMODE SCREEN ================= */

function selectSubmode(mode) {
  state.submode = mode;
  document.getElementById("submode-mimica").classList.toggle("selected", mode === "mimica");
  document.getElementById("submode-desenho").classList.toggle("selected", mode === "desenho");
  showScreen("setup-screen");
}
document.getElementById("submode-mimica").addEventListener("click", () => selectSubmode("mimica"));
document.getElementById("submode-desenho").addEventListener("click", () => selectSubmode("desenho"));

/* ================= SETUP SCREEN ================= */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const categoryOptionsEl = document.getElementById("category-options");
const startBtn = document.getElementById("start-game-btn");

function renderAvatarPicker() {
  avatarPicker.innerHTML = "";
  AVATARS.forEach(av => {
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
document.getElementById("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") addPlayer();
});

function addPlayer(presetName, presetAvatar) {
  const input = document.getElementById("player-name");
  const name = (presetName || input.value).trim();
  const avatar = presetAvatar || state.selectedAvatar;
  if (!name) { input.focus(); return; }
  if (state.players.length >= 8) { alert("Máximo de 8 jogadores!"); return; }
  state.players.push({ name, avatar, score: 0, skipsUsed: 0 });
  input.value = "";
  PlayersCache.add(name, avatar);
  renderPlayersList();
  updateStartBtn();
  renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
}

function renderCategoryOptions() {
  categoryOptionsEl.innerHTML = "";
  Object.keys(MIMICA_CATEGORY_LABELS).forEach(key => {
    const chip = document.createElement("div");
    chip.className = "category-chip" + (state.selectedCategories.includes(key) ? " selected" : "");
    chip.textContent = MIMICA_CATEGORY_LABELS[key];
    chip.addEventListener("click", () => {
      if (key === "mix") {
        state.selectedCategories = ["mix"];
      } else {
        let next = state.selectedCategories.filter(c => c !== "mix");
        next = next.includes(key) ? next.filter(c => c !== key) : next.concat(key);
        if (next.length === 0) next = ["mix"];
        state.selectedCategories = next;
      }
      renderCategoryOptions();
    });
    categoryOptionsEl.appendChild(chip);
  });
}

startBtn.addEventListener("click", startGame);
document.getElementById("round-restart-btn").addEventListener("click", () => {
  stopTimer();
  showScreen("setup-screen");
});
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

function startGame() {
  state.players.forEach(p => { p.score = 0; p.skipsUsed = 0; });
  state.currentPlayerIndex = 0;
  state.round = 0;

  const available = getMimicaWords(state.selectedCategories);
  const roundCount = Math.min(TOTAL_ROUNDS, available.length);
  state.wordPool = shuffle(available).slice(0, roundCount);

  loadPassScreen();
}

/* ================= PASS SCREEN ================= */

function loadPassScreen() {
  const player = state.players[state.currentPlayerIndex];
  document.getElementById("pass-round-counter").textContent =
    `Rodada ${state.round + 1} de ${state.wordPool.length}`;
  document.getElementById("pass-avatar").textContent = player.avatar;
  document.getElementById("pass-text").textContent = `Passe o celular para ${player.name}!`;
  showScreen("pass-screen");
  renderScoreboard();
}

document.getElementById("reveal-btn").addEventListener("click", () => {
  state.currentWord = state.wordPool[state.round];
  showScreen("round-screen");
  renderScoreboard();
  updateSkipCount();
  startRound();
});

/* ================= ROUND SCREEN ================= */

function renderScoreboard() {
  const board = document.getElementById("round-scoreboard");
  board.innerHTML = "";
  state.players.forEach((p, idx) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (idx === state.currentPlayerIndex ? " current-turn" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span><span class="pts">${p.score} 🏅</span>`;
    board.appendChild(chip);
  });
}

function updateSkipCount() {
  const player = state.players[state.currentPlayerIndex];
  const remaining = MAX_SKIPS_PER_PLAYER - player.skipsUsed;
  document.getElementById("skip-count").textContent = `Pulos restantes: ${remaining}`;
  document.getElementById("skip-btn").disabled = remaining <= 0;
}

function startRound() {
  document.getElementById("secret-emoji").textContent = state.currentWord.emoji;
  document.getElementById("secret-word").textContent = state.currentWord.word;

  stopTimer();
  state.timer.secondsLeft = ROUND_SECONDS;
  updateTimerUI();
  state.timer.intervalId = setInterval(() => {
    state.timer.secondsLeft--;
    updateTimerUI();
    if (state.timer.secondsLeft <= 0) {
      stopTimer();
      advanceRound(false);
    }
  }, 1000);

  document.getElementById("correct-btn").disabled = false;
}

function updateTimerUI() {
  const pct = Math.max(0, (state.timer.secondsLeft / ROUND_SECONDS) * 100);
  document.getElementById("timer-bar").style.width = pct + "%";
  document.getElementById("timer-text").textContent = `⏱️ ${Math.max(0, state.timer.secondsLeft)}s`;
}

function stopTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
}

document.getElementById("correct-btn").addEventListener("click", () => {
  stopTimer();
  state.players[state.currentPlayerIndex].score++;
  launchConfetti();
  renderScoreboard();
  setTimeout(() => advanceRound(true), 700);
});

document.getElementById("skip-btn").addEventListener("click", () => {
  const player = state.players[state.currentPlayerIndex];
  if (player.skipsUsed >= MAX_SKIPS_PER_PLAYER) return;
  player.skipsUsed++;
  stopTimer();
  advanceRound(true);
});

function advanceRound(alreadyHandled) {
  stopTimer();
  document.getElementById("correct-btn").disabled = true;
  state.round++;
  if (state.players.length > 1) {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  }
  if (state.round >= state.wordPool.length) {
    showWinnerOverlay();
  } else {
    loadPassScreen();
  }
}

/* ================= WINNER ================= */

function showWinnerOverlay() {
  const maxScore = Math.max(...state.players.map(p => p.score));
  const winners = state.players.filter(p => p.score === maxScore);

  const overlay = document.getElementById("winner-overlay");
  const avatarEl = document.getElementById("winner-avatar");
  const textEl = document.getElementById("winner-text");
  const titleEl = document.getElementById("winner-title");

  if (winners.length === 1) {
    titleEl.textContent = "🏆 Vencedor! 🏆";
    avatarEl.innerHTML = `<span class="avatar-mini">${winners[0].avatar}</span>`;
    textEl.textContent = `${winners[0].name} venceu com ${winners[0].score} pontos! 🎉`;
  } else {
    titleEl.textContent = "🤝 Empate! 🤝";
    avatarEl.innerHTML = winners.map(w => `<span class="avatar-mini">${w.avatar}</span>`).join(" ");
    textEl.textContent = winners.map(w => w.name).join(" e ") + ` empataram com ${maxScore} pontos cada! 🎉`;
  }

  overlay.classList.add("active");
  launchConfetti();
}

function launchConfetti() {
  const confettiEmojis = ["🎉","🎊","⭐","🏅","✨","🎈"];
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
