/* Labirinto Maluco — corrida de labirinto multiplayer local */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const SIZE_CHOICES = [
  { label: "🟢 Fácil (9x9)", value: 9 },
  { label: "🟡 Médio (13x13)", value: 13 },
  { label: "🔴 Difícil (17x17)", value: 17 },
];

const state = {
  players: [],
  selectedAvatar: AVATARS[0],
  mazeSize: 9,
  currentPlayerIndex: 0,
  cells: [],      // flat array of {r,c,top,right,bottom,left}
  positions: [],  // per-player {r,c}
  finished: false,
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- Setup screen ---------- */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const sizeOptionsEl = document.getElementById("size-options");
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
  if (state.players.length >= 6) { alert("Máximo de 6 jogadores!"); return; }
  state.players.push({ name, avatar });
  input.value = "";
  PlayersCache.add(name, avatar);
  renderPlayersList();
  updateStartBtn();
  renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
}

function renderSizeOptions() {
  sizeOptionsEl.innerHTML = "";
  SIZE_CHOICES.forEach(choice => {
    const chip = document.createElement("div");
    chip.className = "size-chip" + (state.mazeSize === choice.value ? " selected" : "");
    chip.textContent = choice.label;
    chip.addEventListener("click", () => {
      state.mazeSize = choice.value;
      renderSizeOptions();
    });
    sizeOptionsEl.appendChild(chip);
  });
}

document.getElementById("start-game-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

/* ---------- Maze generation (recursive backtracker) ---------- */

function idx(r, c, size) { return r * size + c; }

function generateMaze(size) {
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells.push({ r, c, top: true, right: true, bottom: true, left: true, visited: false });
    }
  }

  function removeWall(a, b, dir) {
    if (dir === "top") { a.top = false; b.bottom = false; }
    if (dir === "right") { a.right = false; b.left = false; }
    if (dir === "bottom") { a.bottom = false; b.top = false; }
    if (dir === "left") { a.left = false; b.right = false; }
  }

  const stack = [];
  let current = cells[0];
  current.visited = true;
  stack.push(current);

  while (stack.length) {
    current = stack[stack.length - 1];
    const { r, c } = current;
    const neighbors = [];
    if (r > 0 && !cells[idx(r - 1, c, size)].visited) neighbors.push({ dir: "top", cell: cells[idx(r - 1, c, size)] });
    if (c < size - 1 && !cells[idx(r, c + 1, size)].visited) neighbors.push({ dir: "right", cell: cells[idx(r, c + 1, size)] });
    if (r < size - 1 && !cells[idx(r + 1, c, size)].visited) neighbors.push({ dir: "bottom", cell: cells[idx(r + 1, c, size)] });
    if (c > 0 && !cells[idx(r, c - 1, size)].visited) neighbors.push({ dir: "left", cell: cells[idx(r, c - 1, size)] });

    if (neighbors.length === 0) { stack.pop(); continue; }

    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    removeWall(current, pick.cell, pick.dir);
    pick.cell.visited = true;
    stack.push(pick.cell);
  }

  return cells;
}

/* ---------- Game ---------- */

function startGame() {
  state.currentPlayerIndex = 0;
  state.finished = false;
  state.cells = generateMaze(state.mazeSize);
  state.positions = state.players.map(() => ({ r: 0, c: 0 }));

  showScreen("game-screen");
  renderScoreboard();
  renderMaze();
  renderTokens();
}

function renderScoreboard() {
  const board = document.getElementById("scoreboard");
  board.innerHTML = "";
  state.players.forEach((p, i) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (i === state.currentPlayerIndex ? " current-turn" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span>`;
    board.appendChild(chip);
  });
}

function renderMaze() {
  const mazeEl = document.getElementById("maze");
  const size = state.mazeSize;
  mazeEl.innerHTML = "";
  mazeEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  mazeEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  state.cells.forEach(cell => {
    const div = document.createElement("div");
    div.className = "maze-cell";
    div.style.borderTop = (cell.top ? "3px solid var(--wall)" : "3px solid transparent");
    div.style.borderRight = (cell.right ? "3px solid var(--wall)" : "3px solid transparent");
    div.style.borderBottom = (cell.bottom ? "3px solid var(--wall)" : "3px solid transparent");
    div.style.borderLeft = (cell.left ? "3px solid var(--wall)" : "3px solid transparent");
    if (cell.r === 0 && cell.c === 0) {
      div.innerHTML = '<span class="mark">🚪</span>';
    } else if (cell.r === size - 1 && cell.c === size - 1) {
      div.innerHTML = '<span class="mark">🏆</span>';
    }
    mazeEl.appendChild(div);
  });
}

function renderTokens() {
  const layer = document.getElementById("token-layer");
  layer.innerHTML = "";
  const size = state.mazeSize;
  const offsets = [[0, 0], [-8, -8], [8, -8], [-8, 8], [8, 8], [0, 10]];

  state.players.forEach((p, i) => {
    const pos = state.positions[i];
    const tok = document.createElement("div");
    tok.className = "token";
    tok.textContent = p.avatar;
    const leftPct = (pos.c + 0.5) / size * 100;
    const topPct = (pos.r + 0.5) / size * 100;
    const off = offsets[i] || [0, 0];
    tok.style.left = `calc(${leftPct}% + ${off[0]}px)`;
    tok.style.top = `calc(${topPct}% + ${off[1]}px)`;
    layer.appendChild(tok);
  });
}

function tryMove(dir) {
  if (state.finished) return;
  const i = state.currentPlayerIndex;
  const pos = state.positions[i];
  const size = state.mazeSize;
  const cell = state.cells[idx(pos.r, pos.c, size)];

  let blocked = false;
  let next = { r: pos.r, c: pos.c };

  if (dir === "up") {
    if (cell.top || pos.r === 0) blocked = true; else next.r -= 1;
  } else if (dir === "down") {
    if (cell.bottom || pos.r === size - 1) blocked = true; else next.r += 1;
  } else if (dir === "left") {
    if (cell.left || pos.c === 0) blocked = true; else next.c -= 1;
  } else if (dir === "right") {
    if (cell.right || pos.c === size - 1) blocked = true; else next.c += 1;
  }

  if (blocked) {
    const mazeEl = document.getElementById("maze");
    mazeEl.classList.remove("shake");
    void mazeEl.offsetWidth;
    mazeEl.classList.add("shake");
    return;
  }

  state.positions[i] = next;
  renderTokens();

  if (next.r === size - 1 && next.c === size - 1) {
    state.finished = true;
    showWinnerOverlay(state.players[i]);
    return;
  }

  nextPlayer();
  renderScoreboard();
}

function nextPlayer() {
  if (state.players.length <= 1) return;
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}

document.getElementById("ctrl-up").addEventListener("click", () => tryMove("up"));
document.getElementById("ctrl-down").addEventListener("click", () => tryMove("down"));
document.getElementById("ctrl-left").addEventListener("click", () => tryMove("left"));
document.getElementById("ctrl-right").addEventListener("click", () => tryMove("right"));

document.addEventListener("keydown", e => {
  if (!document.getElementById("game-screen").classList.contains("active")) return;
  if (e.key === "ArrowUp") tryMove("up");
  else if (e.key === "ArrowDown") tryMove("down");
  else if (e.key === "ArrowLeft") tryMove("left");
  else if (e.key === "ArrowRight") tryMove("right");
});

function showWinnerOverlay(winner) {
  const overlay = document.getElementById("winner-overlay");
  const avatarEl = document.getElementById("winner-avatar");
  const textEl = document.getElementById("winner-text");
  const titleEl = document.getElementById("winner-title");

  titleEl.textContent = "🏆 Vencedor! 🏆";
  avatarEl.innerHTML = `<span class="avatar-mini">${winner.avatar}</span>`;
  textEl.textContent = `${winner.name} chegou primeiro ao troféu! 🎉`;

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
renderSizeOptions();
updateStartBtn();
renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
