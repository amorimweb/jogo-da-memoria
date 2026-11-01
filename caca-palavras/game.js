/* Caça-Palavras multiplayer local */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];
const GRID_SIZE = 10;
const WORDS_PER_GAME = 8;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const state = {
  players: [],
  selectedAvatar: AVATARS[0],
  currentPlayerIndex: 0,
  grid: [],        // GRID_SIZE x GRID_SIZE letras
  placements: [],  // {word, emoji, cells:[{r,c}...], found:false}
  selectedCells: [], // até 2 {r,c}
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
  startGame();
  showScreen("game-screen");
});

document.getElementById("restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

/* ================= SCOREBOARD / WINNER (compartilhado) ================= */

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
    textEl.textContent = `${winners[0].name} venceu com ${winners[0].score} palavras! 🎉`;
  } else {
    titleEl.textContent = "🤝 Empate! 🤝";
    avatarEl.innerHTML = winners.map(w => `<span class="avatar-mini">${w.avatar}</span>`).join(" ");
    textEl.textContent = winners.map(w => w.name).join(" e ") + ` empataram com ${maxScore} palavras cada! 🎉`;
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

/* ================= GRID / PLACEMENT ================= */

function buildEmptyGrid() {
  const grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid.push(new Array(GRID_SIZE).fill(null));
  }
  return grid;
}

function tryPlaceWord(grid, word) {
  const letters = word.split("");
  const len = letters.length;
  const horizontal = Math.random() < 0.5;

  for (let attempt = 0; attempt < 200; attempt++) {
    let row, col;
    if (horizontal) {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * (GRID_SIZE - len + 1));
    } else {
      row = Math.floor(Math.random() * (GRID_SIZE - len + 1));
      col = Math.floor(Math.random() * GRID_SIZE);
    }

    let fits = true;
    const cells = [];
    for (let i = 0; i < len; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      const existing = grid[r][c];
      if (existing !== null && existing !== letters[i]) { fits = false; break; }
      cells.push({ r, c });
    }

    if (fits) {
      cells.forEach((cell, i) => { grid[cell.r][cell.c] = letters[i]; });
      return cells;
    }
  }
  return null; // não coube, tenta outra palavra
}

function startGame() {
  const grid = buildEmptyGrid();
  const placements = [];
  const pool = shuffle(WORD_LIST);
  let poolIdx = 0;

  while (placements.length < WORDS_PER_GAME && poolIdx < pool.length) {
    const candidate = pool[poolIdx++];
    const cells = tryPlaceWord(grid, candidate.word);
    if (cells) {
      placements.push({ word: candidate.word, emoji: candidate.emoji, cells, found: false });
    }
  }

  // preenche espaços vazios com letras aleatórias
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  state.grid = grid;
  state.placements = placements;
  state.selectedCells = [];

  renderScoreboard();
  renderGrid();
  renderWordList();
}

function renderGrid() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cellEl = document.createElement("div");
      const isFound = state.placements.some(p => p.found && p.cells.some(cell => cell.r === r && cell.c === c));
      const isSelected = state.selectedCells.some(cell => cell.r === r && cell.c === c);
      cellEl.className = "cell" + (isFound ? " found" : "") + (isSelected ? " selected" : "");
      cellEl.textContent = state.grid[r][c];
      cellEl.addEventListener("click", () => onCellClick(r, c));
      gridEl.appendChild(cellEl);
    }
  }
}

function renderWordList() {
  const listEl = document.getElementById("word-list");
  listEl.innerHTML = "";
  state.placements.forEach(p => {
    const item = document.createElement("div");
    item.className = "word-item" + (p.found ? " found" : "");
    item.innerHTML = `<span class="emoji">${p.emoji}</span><span>${p.word}</span>`;
    listEl.appendChild(item);
  });
}

function sameCell(a, b) {
  return a.r === b.r && a.c === b.c;
}

function findMatchingPlacement(cellA, cellB) {
  return state.placements.find(p => {
    if (p.found) return false;
    const start = p.cells[0];
    const end = p.cells[p.cells.length - 1];
    return (sameCell(cellA, start) && sameCell(cellB, end)) ||
           (sameCell(cellA, end) && sameCell(cellB, start));
  });
}

function onCellClick(r, c) {
  if (state.selectedCells.length >= 2) return; // aguarda a comparação pendente resolver
  const clicked = { r, c };

  if (state.selectedCells.length === 1 && sameCell(state.selectedCells[0], clicked)) {
    state.selectedCells = [];
    renderGrid();
    return;
  }

  state.selectedCells.push(clicked);
  renderGrid();

  if (state.selectedCells.length === 2) {
    const [cellA, cellB] = state.selectedCells;
    const match = findMatchingPlacement(cellA, cellB);

    if (match) {
      match.found = true;
      state.players[state.currentPlayerIndex].score++;
      state.selectedCells = [];
      renderScoreboard();
      renderGrid();
      renderWordList();

      if (state.placements.every(p => p.found)) {
        setTimeout(showWinnerOverlay, 300);
      } else {
        nextPlayer();
        renderScoreboard();
      }
    } else {
      const gridEl = document.getElementById("grid");
      gridEl.classList.add("grid-shake");
      setTimeout(() => {
        gridEl.classList.remove("grid-shake");
        state.selectedCells = [];
        renderGrid();
      }, 400);
    }
  }
}

/* ---------- Init ---------- */

renderAvatarPicker();
renderPlayersList();
updateStartBtn();
