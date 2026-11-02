/* Quebra-Cabeça dos Bichos — sliding puzzle (8-puzzle) com emojis de animais */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];
const ANIMAL_POOL = ["🐶","🐱","🐰","🦊","🐻","🐼","🐯","🦁","🐸","🐵","🐨","🐮","🐷","🐔","🦄","🐙"];
const BLANK = -1;
const SOLVED = [0, 1, 2, 3, 4, 5, 6, 7, BLANK];
const TOTAL_ROUNDS = 5;

const state = {
  players: [],
  selectedAvatar: AVATARS[0],
  currentPlayerIndex: 0,
  board: [],
  round: 0,
  locked: false,
  animals: [], // 8 bichos sorteados (ordem/escolha muda a cada rodada)
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ================= SETUP SCREEN ================= */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
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

startBtn.addEventListener("click", () => {
  state.players.forEach(p => (p.score = 0));
  state.currentPlayerIndex = 0;
  state.round = 0;
  showScreen("game-screen");
  renderScoreboard();
  startRound();
});

document.getElementById("restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

/* ================= SCOREBOARD / WINNER ================= */

function renderScoreboard() {
  const board = document.getElementById("scoreboard");
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
    textEl.textContent = `${winners[0].name} venceu com ${winners[0].score} quebra-cabeças! 🎉`;
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

/* ================= PUZZLE ================= */

function renderReferenceStrip() {
  const strip = document.getElementById("reference-strip");
  strip.innerHTML = "";
  SOLVED.forEach(value => {
    const cell = document.createElement("div");
    cell.className = "ref-cell";
    cell.textContent = value === BLANK ? "" : state.animals[value];
    strip.appendChild(cell);
  });
}

function getAdjacentPositions(pos) {
  const row = Math.floor(pos / 3);
  const col = pos % 3;
  const list = [];
  if (row > 0) list.push(pos - 3);
  if (row < 2) list.push(pos + 3);
  if (col > 0) list.push(pos - 1);
  if (col < 2) list.push(pos + 1);
  return list;
}

function isAdjacent(a, b) {
  return getAdjacentPositions(a).includes(b);
}

function isSolved(board) {
  return board.every((v, i) => v === SOLVED[i]);
}

function shuffleBoard() {
  let board = SOLVED.slice();
  let blankPos = board.indexOf(BLANK);
  let lastMove = -1;

  for (let i = 0; i < 60; i++) {
    const neighbors = getAdjacentPositions(blankPos).filter(p => p !== lastMove);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[pick], board[blankPos]] = [board[blankPos], board[pick]];
    lastMove = blankPos;
    blankPos = pick;
  }

  if (isSolved(board)) {
    // garantia extra, praticamente nunca acontece após 60 jogadas
    const neighbors = getAdjacentPositions(blankPos);
    const pick = neighbors[0];
    [board[pick], board[blankPos]] = [board[blankPos], board[pick]];
  }

  return board;
}

function startRound() {
  state.animals = shuffle(ANIMAL_POOL).slice(0, 8);
  state.board = shuffleBoard();
  state.locked = false;
  document.getElementById("round-counter").textContent = `Rodada ${state.round + 1} de ${TOTAL_ROUNDS}`;
  document.getElementById("round-feedback").textContent = "";
  renderReferenceStrip();
  renderPuzzleBoard();
}

function renderPuzzleBoard() {
  const boardEl = document.getElementById("puzzle-board");
  boardEl.innerHTML = "";
  const blankPos = state.board.indexOf(BLANK);

  state.board.forEach((value, pos) => {
    const tile = document.createElement("div");
    const blank = value === BLANK;
    tile.className = "puzzle-tile" + (blank ? " blank" : "") + (!blank && !isAdjacent(pos, blankPos) ? " not-adjacent" : "");
    tile.textContent = blank ? "" : state.animals[value];
    if (!blank) tile.addEventListener("click", () => onTileClick(pos));
    boardEl.appendChild(tile);
  });
}

function onTileClick(pos) {
  if (state.locked) return;
  const blankPos = state.board.indexOf(BLANK);
  if (pos === blankPos) return;
  if (!isAdjacent(pos, blankPos)) return;

  [state.board[pos], state.board[blankPos]] = [state.board[blankPos], state.board[pos]];
  renderPuzzleBoard();

  if (isSolved(state.board)) {
    state.locked = true;
    const winner = state.players[state.currentPlayerIndex];
    winner.score++;
    renderScoreboard();
    document.getElementById("round-feedback").textContent = `🎉 ${winner.name} completou o quebra-cabeça!`;

    setTimeout(() => {
      nextPlayer();
      state.round++;
      if (state.round >= TOTAL_ROUNDS) {
        renderScoreboard();
        showWinnerOverlay();
      } else {
        renderScoreboard();
        startRound();
      }
    }, 1300);
  } else {
    nextPlayer();
    renderScoreboard();
  }
}

/* ---------- Init ---------- */

renderAvatarPicker();
renderPlayersList();
updateStartBtn();
