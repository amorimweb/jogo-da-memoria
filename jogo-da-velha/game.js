/* Jogo da Velha & Lig 4 — 2 jogadores locais, mesmo aparelho */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const state = {
  submode: "ttt", // "ttt" | "c4"
  players: [
    { name: "", avatar: AVATARS[0] },
    { name: "", avatar: AVATARS[1] },
  ],
  scores: [0, 0],
  current: 0,
  gameOver: false,
  // tic-tac-toe
  tttBoard: Array(9).fill(null), // null | 0 | 1
  // connect4: 6 rows x 7 cols, row 0 = top
  c4Board: Array.from({ length: 6 }, () => Array(7).fill(null)),
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- Submode screen ---------- */

document.getElementById("submode-ttt").addEventListener("click", () => {
  state.submode = "ttt";
  showScreen("setup-screen");
});
document.getElementById("submode-c4").addEventListener("click", () => {
  state.submode = "c4";
  showScreen("setup-screen");
});

/* ---------- Setup screen ---------- */

function renderAvatarPicker(containerEl, playerIdx) {
  const otherIdx = playerIdx === 0 ? 1 : 0;
  containerEl.innerHTML = "";
  AVATARS.forEach(av => {
    const takenByOther = av === state.players[otherIdx].avatar;
    const div = document.createElement("div");
    div.className = "avatar-choice"
      + (av === state.players[playerIdx].avatar ? " selected" : "")
      + (takenByOther ? " disabled" : "");
    div.textContent = av;
    if (takenByOther) {
      div.style.opacity = "0.3";
      div.style.cursor = "not-allowed";
    } else {
      div.addEventListener("click", () => {
        state.players[playerIdx].avatar = av;
        renderAvatarPicker(containerEl, playerIdx);
        renderAvatarPicker(
          document.getElementById(`avatar-picker-${otherIdx + 1}`),
          otherIdx
        );
      });
    }
    containerEl.appendChild(div);
  });
}

renderAvatarPicker(document.getElementById("avatar-picker-1"), 0);
renderAvatarPicker(document.getElementById("avatar-picker-2"), 1);

document.getElementById("start-game-btn").addEventListener("click", () => {
  const name1 = document.getElementById("player1-name").value.trim() || "Jogador 1";
  const name2 = document.getElementById("player2-name").value.trim() || "Jogador 2";
  state.players[0].name = name1;
  state.players[1].name = name2;
  state.scores = [0, 0];
  startRound();
  showScreen("game-screen");
});

document.getElementById("new-game-btn").addEventListener("click", () => {
  showScreen("setup-screen");
});

/* ---------- Round management ---------- */

function startRound() {
  state.current = 0;
  state.gameOver = false;
  state.tttBoard = Array(9).fill(null);
  state.c4Board = Array.from({ length: 6 }, () => Array(7).fill(null));

  document.getElementById("ttt-board").style.display = state.submode === "ttt" ? "grid" : "none";
  document.getElementById("c4-board").style.display = state.submode === "c4" ? "inline-grid" : "none";

  renderScoreboard();
  updateTurnBanner();
  if (state.submode === "ttt") renderTtt();
  else renderC4();
}

function renderScoreboard() {
  const el = document.getElementById("scoreboard");
  el.innerHTML = "";
  state.players.forEach((p, idx) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (idx === state.current && !state.gameOver ? " current-turn" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span><span class="pts">${state.scores[idx]} 🏅</span>`;
    el.appendChild(chip);
  });
}

function updateTurnBanner() {
  const banner = document.getElementById("turn-banner");
  if (state.gameOver) return;
  const p = state.players[state.current];
  banner.innerHTML = `${p.avatar} Vez de <strong>${p.name}</strong>`;
}

function nextTurn() {
  state.current = state.current === 0 ? 1 : 0;
  renderScoreboard();
  updateTurnBanner();
}

/* ---------- Jogo da Velha (tic-tac-toe) ---------- */

const TTT_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function renderTtt() {
  const board = document.getElementById("ttt-board");
  board.innerHTML = "";
  state.tttBoard.forEach((cell, idx) => {
    const div = document.createElement("div");
    div.className = "ttt-cell";
    div.textContent = cell === null ? "" : state.players[cell].avatar;
    div.addEventListener("click", () => onTttCellClick(idx));
    board.appendChild(div);
  });
}

function onTttCellClick(idx) {
  if (state.gameOver) return;
  if (state.tttBoard[idx] !== null) return;

  state.tttBoard[idx] = state.current;
  renderTtt();

  const winLine = TTT_LINES.find(line =>
    line.every(i => state.tttBoard[i] === state.current)
  );

  if (winLine) {
    state.gameOver = true;
    highlightTttWin(winLine);
    state.scores[state.current]++;
    renderScoreboard();
    setTimeout(() => showRoundResult(state.current), 500);
    return;
  }

  if (state.tttBoard.every(c => c !== null)) {
    state.gameOver = true;
    setTimeout(() => showRoundResult(null), 400);
    return;
  }

  nextTurn();
}

function highlightTttWin(line) {
  const cells = document.querySelectorAll("#ttt-board .ttt-cell");
  line.forEach(i => cells[i].classList.add("win"));
}

/* ---------- Lig 4 (connect four) ---------- */

function renderC4() {
  const board = document.getElementById("c4-board");
  board.innerHTML = "";
  for (let col = 0; col < 7; col++) {
    const colEl = document.createElement("div");
    colEl.className = "c4-col";
    colEl.dataset.col = col;
    for (let row = 0; row < 6; row++) {
      const cellEl = document.createElement("div");
      cellEl.className = "c4-cell";
      cellEl.dataset.row = row;
      cellEl.dataset.col = col;
      const val = state.c4Board[row][col];
      cellEl.textContent = val === null ? "" : state.players[val].avatar;
      colEl.appendChild(cellEl);
    }
    colEl.addEventListener("click", () => onC4ColumnClick(col));
    board.appendChild(colEl);
  }
}

function onC4ColumnClick(col) {
  if (state.gameOver) return;

  let targetRow = -1;
  for (let row = 5; row >= 0; row--) {
    if (state.c4Board[row][col] === null) { targetRow = row; break; }
  }
  if (targetRow === -1) return; // coluna cheia

  state.c4Board[targetRow][col] = state.current;
  renderC4();

  const winCells = findC4Win(targetRow, col, state.current);
  if (winCells) {
    state.gameOver = true;
    highlightC4Win(winCells);
    state.scores[state.current]++;
    renderScoreboard();
    setTimeout(() => showRoundResult(state.current), 500);
    return;
  }

  if (state.c4Board.every(row => row.every(c => c !== null))) {
    state.gameOver = true;
    setTimeout(() => showRoundResult(null), 400);
    return;
  }

  nextTurn();
}

function findC4Win(row, col, player) {
  const directions = [
    [[0,1],[0,-1]],   // horizontal
    [[1,0],[-1,0]],   // vertical
    [[1,1],[-1,-1]],  // diagonal \
    [[1,-1],[-1,1]],  // diagonal /
  ];

  for (const [dirA, dirB] of directions) {
    const cells = [[row, col]];
    for (const [dr, dc] of [dirA, dirB]) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && state.c4Board[r][c] === player) {
        cells.push([r, c]);
        r += dr; c += dc;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}

function highlightC4Win(cells) {
  cells.forEach(([r, c]) => {
    const el = document.querySelector(`.c4-cell[data-row="${r}"][data-col="${c}"]`);
    if (el) el.classList.add("win");
  });
}

/* ---------- Round result / winner overlay ---------- */

function showRoundResult(winnerIdx) {
  const overlay = document.getElementById("winner-overlay");
  const avatarEl = document.getElementById("winner-avatar");
  const textEl = document.getElementById("winner-text");
  const titleEl = document.getElementById("winner-title");

  if (winnerIdx === null) {
    titleEl.textContent = "🤝 Empate! 🤝";
    avatarEl.innerHTML = state.players.map(p => `<span class="avatar-mini">${p.avatar}</span>`).join(" ");
    textEl.textContent = "Ninguém venceu essa rodada. Vamos de novo!";
  } else {
    const p = state.players[winnerIdx];
    titleEl.textContent = "🏆 Vencedor! 🏆";
    avatarEl.innerHTML = `<span class="avatar-mini">${p.avatar}</span>`;
    textEl.textContent = `${p.name} venceu esta rodada! 🎉`;
    launchConfetti();
  }

  overlay.classList.add("active");
}

document.getElementById("next-round-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  startRound();
});

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
