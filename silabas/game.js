/* Mundo das Sílabas — dois modos: Monte a Palavra e Caça-Sílabas */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const state = {
  submode: "build", // "build" | "hunt"
  players: [],
  selectedAvatar: AVATARS[0],
  level: 2,          // 2 | 3 | 4 | "mix" (modo Monte a Palavra)
  huntPairCount: 8,   // modo Caça-Sílabas
  currentPlayerIndex: 0,

  // Monte a Palavra
  buildRound: 0,
  buildTotalRounds: 8,
  buildWordPool: [],
  buildCurrentWord: null,
  buildAnswer: [],
  buildTileOrder: [], // syllables embaralhadas desta rodada

  // Caça-Sílabas
  huntCards: [],
  huntFlippedIndexes: [],
  huntLock: false,
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

document.getElementById("submode-build").addEventListener("click", () => {
  state.submode = "build";
  showScreen("setup-screen");
  renderLevelOptions();
});
document.getElementById("submode-hunt").addEventListener("click", () => {
  state.submode = "hunt";
  showScreen("setup-screen");
  renderLevelOptions();
});

/* ================= SETUP SCREEN ================= */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const levelOptionsEl = document.getElementById("level-options");
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

document.getElementById("add-player-btn").addEventListener("click", addPlayer);
document.getElementById("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") addPlayer();
});

function addPlayer() {
  const input = document.getElementById("player-name");
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  if (state.players.length >= 8) { alert("Máximo de 8 jogadores!"); return; }
  state.players.push({ name, avatar: state.selectedAvatar, score: 0 });
  input.value = "";
  renderPlayersList();
  updateStartBtn();
}

const BUILD_LEVEL_CHOICES = [
  { label: "🟢 Fácil (2 sílabas)", value: 2 },
  { label: "🟡 Médio (3 sílabas)", value: 3 },
  { label: "🔴 Difícil (4 sílabas)", value: 4 },
  { label: "✨ Misturado", value: "mix" },
];
const HUNT_SIZE_CHOICES = [
  { label: "6 palavras (12 cartas)", value: 6 },
  { label: "8 palavras (16 cartas)", value: 8 },
  { label: "10 palavras (20 cartas)", value: 10 },
];

function renderLevelOptions() {
  levelOptionsEl.innerHTML = "";
  const choices = state.submode === "build" ? BUILD_LEVEL_CHOICES : HUNT_SIZE_CHOICES;
  const current = state.submode === "build" ? state.level : state.huntPairCount;
  choices.forEach(choice => {
    const chip = document.createElement("div");
    chip.className = "level-chip" + (current === choice.value ? " selected" : "");
    chip.textContent = choice.label;
    chip.addEventListener("click", () => {
      if (state.submode === "build") state.level = choice.value;
      else state.huntPairCount = choice.value;
      renderLevelOptions();
    });
    levelOptionsEl.appendChild(chip);
  });
}

startBtn.addEventListener("click", () => {
  state.players.forEach(p => (p.score = 0));
  state.currentPlayerIndex = 0;
  if (state.submode === "build") {
    startBuildGame();
    showScreen("build-screen");
  } else {
    startHuntGame();
    showScreen("hunt-screen");
  }
});

document.getElementById("build-restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("hunt-restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

/* ================= SCOREBOARD / WINNER (compartilhado) ================= */

function renderScoreboardInto(containerId) {
  const board = document.getElementById(containerId);
  board.innerHTML = "";
  state.players.forEach((p, idx) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (idx === state.currentPlayerIndex ? " current-turn" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span><span class="pts">${p.score} 🏅</span>`;
    board.appendChild(chip);
  });
}

function nextPlayer() {
  if (state.players.length <= 1) return;
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}

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

/* ================= MONTE A PALAVRA ================= */

function startBuildGame() {
  const pool = shuffle(getWordsByLevel(state.level));
  state.buildTotalRounds = Math.min(8, pool.length);
  state.buildWordPool = pool.slice(0, state.buildTotalRounds);
  state.buildRound = 0;
  renderScoreboardInto("build-scoreboard");
  loadBuildRound();
}

function loadBuildRound() {
  state.buildCurrentWord = state.buildWordPool[state.buildRound];
  state.buildAnswer = [];
  state.buildTileOrder = shuffle(state.buildCurrentWord.syllables.map((s, i) => ({ syllable: s, origIndex: i, used: false })));

  document.getElementById("word-emoji").textContent = state.buildCurrentWord.emoji;
  document.getElementById("build-round-counter").textContent =
    `Palavra ${state.buildRound + 1} de ${state.buildTotalRounds}`;
  document.getElementById("build-feedback").textContent = "";
  document.getElementById("build-feedback").className = "feedback-text";

  renderBlanks();
  renderTiles();
}

function renderBlanks() {
  const row = document.getElementById("blanks-row");
  row.innerHTML = "";
  state.buildCurrentWord.syllables.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "blank-slot" + (state.buildAnswer[i] ? " filled" : "");
    slot.textContent = state.buildAnswer[i] || "";
    row.appendChild(slot);
  });
}

function renderTiles() {
  const row = document.getElementById("tiles-row");
  row.innerHTML = "";
  state.buildTileOrder.forEach((tile, idx) => {
    const el = document.createElement("div");
    el.className = "syllable-tile" + (tile.used ? " used" : "");
    el.textContent = tile.syllable;
    el.addEventListener("click", () => onTileClick(idx));
    row.appendChild(el);
  });
}

function onTileClick(tileIdx) {
  const tile = state.buildTileOrder[tileIdx];
  if (tile.used) return;
  tile.used = true;
  state.buildAnswer.push(tile.syllable);
  renderBlanks();
  renderTiles();

  if (state.buildAnswer.length === state.buildCurrentWord.syllables.length) {
    const correct = state.buildAnswer.join("") === state.buildCurrentWord.syllables.join("");
    const feedbackEl = document.getElementById("build-feedback");
    if (correct) {
      feedbackEl.textContent = "🎉 Isso aí! Muito bem!";
      feedbackEl.className = "feedback-text correct";
      state.players[state.currentPlayerIndex].score++;
      renderScoreboardInto("build-scoreboard");
      setTimeout(advanceBuildRound, 900);
    } else {
      feedbackEl.textContent = "🤔 Quase! Tente de novo.";
      feedbackEl.className = "feedback-text wrong";
      document.getElementById("blanks-row").classList.add("shake");
      setTimeout(() => {
        document.getElementById("blanks-row").classList.remove("shake");
        state.buildAnswer = [];
        state.buildTileOrder.forEach(t => (t.used = false));
        renderBlanks();
        renderTiles();
      }, 700);
    }
  }
}

document.getElementById("clear-answer-btn").addEventListener("click", () => {
  state.buildAnswer = [];
  state.buildTileOrder.forEach(t => (t.used = false));
  renderBlanks();
  renderTiles();
  document.getElementById("build-feedback").textContent = "";
});

document.getElementById("skip-word-btn").addEventListener("click", () => {
  advanceBuildRound();
});

function advanceBuildRound() {
  nextPlayer();
  renderScoreboardInto("build-scoreboard");
  state.buildRound++;
  if (state.buildRound >= state.buildTotalRounds) {
    showWinnerOverlay();
  } else {
    loadBuildRound();
  }
}

/* ================= CAÇA-SÍLABAS ================= */

function startHuntGame() {
  const words = shuffle(getWordsByLevel(2)).slice(0, state.huntPairCount);
  const cards = [];
  words.forEach((w, wi) => {
    cards.push({ wordId: wi, syllable: w.syllables[0], emoji: w.emoji, matched: false, flipped: false });
    cards.push({ wordId: wi, syllable: w.syllables[1], emoji: w.emoji, matched: false, flipped: false });
  });
  state.huntCards = shuffle(cards).map((c, i) => Object.assign({}, c, { id: i }));
  state.huntFlippedIndexes = [];
  state.huntLock = false;

  renderScoreboardInto("hunt-scoreboard");
  renderHuntBoard();
}

function renderHuntBoard() {
  const boardEl = document.getElementById("hunt-board");
  boardEl.innerHTML = "";
  const total = state.huntCards.length;
  const cols = total <= 12 ? 4 : total <= 16 ? 4 : 5;
  boardEl.style.gridTemplateColumns = `repeat(${cols}, minmax(60px, 110px))`;

  state.huntCards.forEach((card, idx) => {
    const cardEl = document.createElement("div");
    cardEl.className = "hunt-card" + (card.flipped ? " flipped" : "") + (card.matched ? " matched" : "");
    cardEl.innerHTML = `
      <div class="hunt-card-inner">
        <div class="hunt-card-face hunt-card-back"></div>
        <div class="hunt-card-face hunt-card-front">
          <div class="syll">${card.syllable}</div>
          <div style="font-size:16px;">${card.emoji}</div>
        </div>
      </div>`;
    cardEl.addEventListener("click", () => onHuntCardClick(idx));
    boardEl.appendChild(cardEl);
  });
}

function onHuntCardClick(idx) {
  if (state.huntLock) return;
  const card = state.huntCards[idx];
  if (card.flipped || card.matched) return;
  if (state.huntFlippedIndexes.length >= 2) return;

  card.flipped = true;
  state.huntFlippedIndexes.push(idx);
  renderHuntBoard();

  if (state.huntFlippedIndexes.length === 2) {
    state.huntLock = true;
    const [i1, i2] = state.huntFlippedIndexes;
    const c1 = state.huntCards[i1];
    const c2 = state.huntCards[i2];

    if (c1.wordId === c2.wordId) {
      setTimeout(() => {
        c1.matched = true;
        c2.matched = true;
        state.players[state.currentPlayerIndex].score++;
        state.huntFlippedIndexes = [];
        state.huntLock = false;
        renderScoreboardInto("hunt-scoreboard");
        renderHuntBoard();
        if (state.huntCards.every(c => c.matched)) showWinnerOverlay();
      }, 600);
    } else {
      setTimeout(() => {
        c1.flipped = false;
        c2.flipped = false;
        state.huntFlippedIndexes = [];
        state.huntLock = false;
        nextPlayer();
        renderScoreboardInto("hunt-scoreboard");
        renderHuntBoard();
      }, 900);
    }
  }
}

/* ---------- Init ---------- */

renderAvatarPicker();
renderPlayersList();
updateStartBtn();
