/* Caça ao Tesouro das Cores e Formas — jogo local multiplayer */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const SHAPES = [
  { id: "circulo", label: "círculo", article: "o" },
  { id: "quadrado", label: "quadrado", article: "o" },
  { id: "triangulo", label: "triângulo", article: "o" },
  { id: "estrela", label: "estrela", article: "a" },
  { id: "coracao", label: "coração", article: "o" },
  { id: "losango", label: "losango", article: "o" },
];

const COLORS = [
  { id: "vermelho", label: "vermelho", hex: "#ff4d4d" },
  { id: "azul", label: "azul", hex: "#4d79ff" },
  { id: "verde", label: "verde", hex: "#4dd472" },
  { id: "amarelo", label: "amarelo", hex: "#ffd93d" },
  { id: "roxo", label: "roxo", hex: "#b24dff" },
  { id: "laranja", label: "laranja", hex: "#ff9f1c" },
  { id: "rosa", label: "rosa", hex: "#ff6fb5" },
  { id: "ciano", label: "ciano", hex: "#2ec4b6" },
];

const TILE_COUNT = 10;
const TOTAL_ROUNDS = 10;

const LEVEL_CHOICES = [
  { label: "🎨 Só por cor", value: "cor" },
  { label: "🔷 Só por forma", value: "forma" },
  { label: "✨ Cor + forma", value: "ambos" },
];

const state = {
  players: [],
  selectedAvatar: AVATARS[0],
  level: "cor",
  currentPlayerIndex: 0,
  round: 0,
  targetShape: null,
  targetColor: null,
  tiles: [], // {shape, color, correct, disabled}
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

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
  state.players.push({ name, avatar, score: 0 });
  input.value = "";
  PlayersCache.add(name, avatar);
  renderPlayersList();
  updateStartBtn();
  renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
}

function renderLevelOptions() {
  levelOptionsEl.innerHTML = "";
  LEVEL_CHOICES.forEach(choice => {
    const chip = document.createElement("div");
    chip.className = "level-chip" + (state.level === choice.value ? " selected" : "");
    chip.textContent = choice.label;
    chip.addEventListener("click", () => {
      state.level = choice.value;
      renderLevelOptions();
    });
    levelOptionsEl.appendChild(chip);
  });
}

startBtn.addEventListener("click", () => {
  state.players.forEach(p => (p.score = 0));
  state.currentPlayerIndex = 0;
  state.round = 0;
  showScreen("game-screen");
  renderScoreboard();
  loadRound();
});

document.getElementById("restart-btn").addEventListener("click", () => showScreen("setup-screen"));
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

/* ================= GAME LOGIC ================= */

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

function buildPromptText() {
  if (state.level === "cor") {
    const color = COLORS.find(c => c.id === state.targetColor);
    return `Encontre algo da cor ${color.label.toUpperCase()}!`;
  }
  if (state.level === "forma") {
    const shape = SHAPES.find(s => s.id === state.targetShape);
    return `Encontre ${shape.article === "a" ? "a" : "o"} ${shape.label.toUpperCase()}!`;
  }
  const shape = SHAPES.find(s => s.id === state.targetShape);
  const color = COLORS.find(c => c.id === state.targetColor);
  return `Encontre ${shape.article === "a" ? "a" : "o"} ${shape.label.toUpperCase()} ${color.label.toUpperCase()}!`;
}

function isMatch(tile) {
  if (state.level === "cor") return tile.color === state.targetColor;
  if (state.level === "forma") return tile.shape === state.targetShape;
  return tile.shape === state.targetShape && tile.color === state.targetColor;
}

function generateTiles() {
  state.targetShape = randomItem(SHAPES).id;
  state.targetColor = randomItem(COLORS).id;

  const tiles = [];

  // tile correto garantido
  tiles.push({ shape: state.targetShape, color: state.targetColor });

  if (state.level === "ambos") {
    // alguns "quase certos": mesma forma, cor errada
    for (let i = 0; i < 2; i++) {
      let color;
      do { color = randomItem(COLORS).id; } while (color === state.targetColor);
      tiles.push({ shape: state.targetShape, color });
    }
    // alguns "quase certos": mesma cor, forma errada
    for (let i = 0; i < 2; i++) {
      let shape;
      do { shape = randomItem(SHAPES).id; } while (shape === state.targetShape);
      tiles.push({ shape, color: state.targetColor });
    }
  }

  // completa o resto evitando duplicar o combo certo (e, nos modos
  // de atributo único, evitando duplicar o próprio atributo-alvo)
  while (tiles.length < TILE_COUNT) {
    const shape = randomItem(SHAPES).id;
    const color = randomItem(COLORS).id;
    if (shape === state.targetShape && color === state.targetColor) continue;
    if (state.level === "cor" && color === state.targetColor) continue;
    if (state.level === "forma" && shape === state.targetShape) continue;
    tiles.push({ shape, color });
  }

  state.tiles = shuffle(tiles).map(t => Object.assign({ disabled: false, correct: isMatch(t) }, t));
}

function loadRound() {
  generateTiles();
  document.getElementById("round-counter").textContent = `Rodada ${state.round + 1} de ${TOTAL_ROUNDS}`;
  document.getElementById("prompt-text").textContent = buildPromptText();
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback-text";
  renderShapesGrid();
}

function renderShapesGrid() {
  const grid = document.getElementById("shapes-grid");
  grid.innerHTML = "";
  state.tiles.forEach((tile, idx) => {
    const btn = document.createElement("button");
    btn.className = "shape-tile" + (tile.disabled ? " disabled" : "");
    const colorHex = COLORS.find(c => c.id === tile.color).hex;
    btn.innerHTML = `<span class="shape-inner shape-${tile.shape}" style="background:${colorHex};"></span>`;
    btn.addEventListener("click", () => onTileClick(idx));
    grid.appendChild(btn);
  });
}

function onTileClick(idx) {
  const tile = state.tiles[idx];
  if (tile.disabled) return;

  const feedbackEl = document.getElementById("feedback");
  const tileEls = document.querySelectorAll(".shape-tile");

  if (tile.correct) {
    feedbackEl.textContent = "🎉 Isso aí! Muito bem!";
    feedbackEl.className = "feedback-text correct";
    tileEls[idx].classList.add("pop");
    state.players[state.currentPlayerIndex].score++;
    renderScoreboard();
    launchConfetti();
    setTimeout(() => {
      nextPlayer();
      state.round++;
      renderScoreboard();
      if (state.round >= TOTAL_ROUNDS) {
        showWinnerOverlay();
      } else {
        loadRound();
      }
    }, 900);
  } else {
    feedbackEl.textContent = "🤔 Essa não é! Tente outra.";
    feedbackEl.className = "feedback-text wrong";
    tileEls[idx].classList.add("shake");
    tile.disabled = true;
    setTimeout(() => {
      tileEls[idx].classList.remove("shake");
      renderShapesGrid();
    }, 400);
  }
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
  for (let i = 0; i < 40; i++) {
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
renderLevelOptions();
updateStartBtn();
renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
