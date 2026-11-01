/* Jogo da memória multiplayer para crianças */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const state = {
  players: [],      // {name, avatar, score}
  selectedAvatar: AVATARS[0],
  selectedThemes: ["mix"],
  boardSize: 12,     // total cards
  currentPlayerIndex: 0,
  cards: [],         // {id, icon, matched, flipped}
  lockBoard: false,
  flippedIndexes: [],
};

/* ---------- Setup screen ---------- */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const themeOptions = document.getElementById("theme-options");
const sizeOptions = document.getElementById("size-options");
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
  if (!name) {
    input.focus();
    return;
  }
  if (state.players.length >= 8) {
    alert("Máximo de 8 jogadores!");
    return;
  }
  state.players.push({ name, avatar: state.selectedAvatar, score: 0 });
  input.value = "";
  renderPlayersList();
  updateStartBtn();
}

function renderThemeOptions() {
  themeOptions.innerHTML = "";
  Object.keys(THEME_LABELS).forEach(key => {
    const chip = document.createElement("div");
    chip.className = "theme-chip" + (state.selectedThemes.includes(key) ? " selected" : "");
    chip.textContent = THEME_LABELS[key];
    chip.addEventListener("click", () => {
      if (key === "mix") {
        state.selectedThemes = ["mix"];
      } else {
        state.selectedThemes = state.selectedThemes.filter(t => t !== "mix");
        if (state.selectedThemes.includes(key)) {
          state.selectedThemes = state.selectedThemes.filter(t => t !== key);
        } else {
          state.selectedThemes.push(key);
        }
        if (state.selectedThemes.length === 0) state.selectedThemes = ["mix"];
      }
      renderThemeOptions();
    });
    themeOptions.appendChild(chip);
  });
}

const SIZE_CHOICES = [
  { label: "Fácil (3x4 = 12)", value: 12 },
  { label: "Médio (4x4 = 16)", value: 16 },
  { label: "Avançado (4x5 = 20)", value: 20 },
  { label: "Desafio (4x6 = 24)", value: 24 },
];

function renderSizeOptions() {
  sizeOptions.innerHTML = "";
  SIZE_CHOICES.forEach(choice => {
    const chip = document.createElement("div");
    chip.className = "size-chip" + (state.boardSize === choice.value ? " selected" : "");
    chip.textContent = choice.label;
    chip.addEventListener("click", () => {
      state.boardSize = choice.value;
      renderSizeOptions();
    });
    sizeOptions.appendChild(chip);
  });
}

document.getElementById("start-game-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", () => {
  showScreen("setup-screen");
});
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  showScreen("setup-screen");
});

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- Game logic ---------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  state.players.forEach(p => (p.score = 0));
  state.currentPlayerIndex = 0;

  const pairsNeeded = state.boardSize / 2;
  const pool = shuffle(getIconsByThemes(state.selectedThemes));
  const chosenIcons = pool.slice(0, pairsNeeded);
  const deck = shuffle(chosenIcons.concat(chosenIcons)).map((icon, i) => ({
    id: i,
    icon,
    matched: false,
    flipped: false,
  }));

  state.cards = deck;
  state.flippedIndexes = [];
  state.lockBoard = false;

  showScreen("game-screen");
  renderScoreboard();
  renderBoard();
}

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

function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  const cols = state.boardSize <= 12 ? 4 : state.boardSize <= 16 ? 4 : state.boardSize <= 20 ? 5 : 6;
  boardEl.style.gridTemplateColumns = `repeat(${cols}, minmax(60px, 110px))`;

  state.cards.forEach((card, idx) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card" + (card.flipped ? " flipped" : "") + (card.matched ? " matched" : "");
    cardEl.dataset.index = idx;
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${card.icon}</div>
      </div>`;
    cardEl.addEventListener("click", () => onCardClick(idx));
    boardEl.appendChild(cardEl);
  });
}

function onCardClick(idx) {
  if (state.lockBoard) return;
  const card = state.cards[idx];
  if (card.flipped || card.matched) return;
  if (state.flippedIndexes.length >= 2) return;

  card.flipped = true;
  state.flippedIndexes.push(idx);
  renderBoard();

  if (state.flippedIndexes.length === 2) {
    state.lockBoard = true;
    const [i1, i2] = state.flippedIndexes;
    const c1 = state.cards[i1];
    const c2 = state.cards[i2];

    if (c1.icon === c2.icon) {
      setTimeout(() => {
        c1.matched = true;
        c2.matched = true;
        state.players[state.currentPlayerIndex].score++;
        state.flippedIndexes = [];
        state.lockBoard = false;
        renderScoreboard();
        renderBoard();
        checkWin();
      }, 500);
    } else {
      setTimeout(() => {
        c1.flipped = false;
        c2.flipped = false;
        state.flippedIndexes = [];
        state.lockBoard = false;
        nextPlayer();
        renderScoreboard();
        renderBoard();
      }, 900);
    }
  }
}

function nextPlayer() {
  if (state.players.length <= 1) return;
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}

function checkWin() {
  const allMatched = state.cards.every(c => c.matched);
  if (!allMatched) return;

  const maxScore = Math.max(...state.players.map(p => p.score));
  const winners = state.players.filter(p => p.score === maxScore);

  const overlay = document.getElementById("winner-overlay");
  const avatarEl = document.getElementById("winner-avatar");
  const textEl = document.getElementById("winner-text");
  const titleEl = document.getElementById("winner-title");

  if (winners.length === 1) {
    titleEl.textContent = "🏆 Vencedor! 🏆";
    avatarEl.innerHTML = `<span class="avatar-mini">${winners[0].avatar}</span>`;
    textEl.textContent = `${winners[0].name} venceu com ${winners[0].score} pares! 🎉`;
  } else {
    titleEl.textContent = "🤝 Empate! 🤝";
    avatarEl.innerHTML = winners.map(w => `<span class="avatar-mini">${w.avatar}</span>`).join(" ");
    textEl.textContent = winners.map(w => w.name).join(" e ") + ` empataram com ${maxScore} pares cada! 🎉`;
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
renderThemeOptions();
renderSizeOptions();
updateStartBtn();
