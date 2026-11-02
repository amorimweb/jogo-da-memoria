/* Jogo da memória multiplayer para crianças — modo local e modo online (salas) */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];

const state = {
  mode: "local",     // "local" | "online"
  players: [],        // {name, avatar, score, id?}
  selectedAvatar: AVATARS[0],
  createAvatar: AVATARS[0],
  joinAvatar: AVATARS[0],
  selectedThemes: ["mix"],
  boardSize: 12,
  currentPlayerIndex: 0,
  cards: [],
  lockBoard: false,
  flippedIndexes: [],
  online: { myId: null, isHost: false, roomId: null, resolving: false, winnerShown: false },
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

function buildDeck(themes, boardSize) {
  const pairsNeeded = boardSize / 2;
  const pool = shuffle(getIconsByThemes(themes));
  const chosenIcons = pool.slice(0, pairsNeeded);
  return shuffle(chosenIcons.concat(chosenIcons)).map((icon, i) => ({
    id: i, icon, matched: false, flipped: false,
  }));
}

/* ---------- Avatar pickers (genérico) ---------- */

function renderAvatarPicker(containerEl, selected, onSelect) {
  containerEl.innerHTML = "";
  AVATARS.forEach(av => {
    const div = document.createElement("div");
    div.className = "avatar-choice" + (av === selected ? " selected" : "");
    div.textContent = av;
    div.addEventListener("click", () => onSelect(av));
    containerEl.appendChild(div);
  });
}

/* ---------- Theme / size pickers (genérico) ---------- */

function renderThemeOptions(containerEl, selectedThemes, onChange) {
  containerEl.innerHTML = "";
  Object.keys(THEME_LABELS).forEach(key => {
    const chip = document.createElement("div");
    chip.className = "theme-chip" + (selectedThemes.includes(key) ? " selected" : "");
    chip.textContent = THEME_LABELS[key];
    chip.addEventListener("click", () => {
      let next;
      if (key === "mix") {
        next = ["mix"];
      } else {
        next = selectedThemes.filter(t => t !== "mix");
        next = next.includes(key) ? next.filter(t => t !== key) : next.concat(key);
        if (next.length === 0) next = ["mix"];
      }
      onChange(next);
    });
    containerEl.appendChild(chip);
  });
}

const SIZE_CHOICES = [
  { label: "Fácil (3x4 = 12)", value: 12 },
  { label: "Médio (4x4 = 16)", value: 16 },
  { label: "Avançado (4x5 = 20)", value: 20 },
  { label: "Desafio (4x6 = 24)", value: 24 },
];

function renderSizeOptions(containerEl, selectedSize, onChange) {
  containerEl.innerHTML = "";
  SIZE_CHOICES.forEach(choice => {
    const chip = document.createElement("div");
    chip.className = "size-chip" + (selectedSize === choice.value ? " selected" : "");
    chip.textContent = choice.label;
    chip.addEventListener("click", () => onChange(choice.value));
    containerEl.appendChild(chip);
  });
}

/* ================= MODE SCREEN ================= */

document.getElementById("mode-local").addEventListener("click", () => {
  state.mode = "local";
  showScreen("setup-screen");
});
document.getElementById("mode-online").addEventListener("click", () => {
  state.mode = "online";
  showScreen("online-screen");
});

/* ================= LOCAL SETUP SCREEN ================= */

const avatarPicker = document.getElementById("avatar-picker");
const playersList = document.getElementById("players-list");
const themeOptionsEl = document.getElementById("theme-options");
const sizeOptionsEl = document.getElementById("size-options");
const startBtn = document.getElementById("start-game-btn");

function renderLocalAvatarPicker() {
  renderAvatarPicker(avatarPicker, state.selectedAvatar, av => {
    state.selectedAvatar = av;
    renderLocalAvatarPicker();
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

function renderLocalThemeOptions() {
  renderThemeOptions(themeOptionsEl, state.selectedThemes, next => {
    state.selectedThemes = next;
    renderLocalThemeOptions();
  });
}
function renderLocalSizeOptions() {
  renderSizeOptions(sizeOptionsEl, state.boardSize, next => {
    state.boardSize = next;
    renderLocalSizeOptions();
  });
}

document.getElementById("start-game-btn").addEventListener("click", startLocalGame);
document.getElementById("restart-btn").addEventListener("click", () => {
  if (state.mode === "online") {
    OnlineRoom.update({ status: "lobby", cards: [], flippedIndexes: [], turnIndex: 0, lockBoard: false });
  } else {
    showScreen("setup-screen");
  }
});
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("winner-overlay").classList.remove("active");
  if (state.mode === "online") {
    state.online.winnerShown = false;
    OnlineRoom.update({ status: "lobby", cards: [], flippedIndexes: [], turnIndex: 0, lockBoard: false });
  } else {
    showScreen("setup-screen");
  }
});

function startLocalGame() {
  state.players.forEach(p => (p.score = 0));
  state.currentPlayerIndex = 0;
  state.cards = buildDeck(state.selectedThemes, state.boardSize);
  state.flippedIndexes = [];
  state.lockBoard = false;

  showScreen("game-screen");
  renderScoreboard();
  renderBoard();
}

/* ================= ONLINE SCREEN (criar / entrar) ================= */

document.getElementById("tab-create").addEventListener("click", () => switchOnlineTab("create"));
document.getElementById("tab-join").addEventListener("click", () => switchOnlineTab("join"));

function switchOnlineTab(which) {
  document.getElementById("tab-create").classList.toggle("selected", which === "create");
  document.getElementById("tab-join").classList.toggle("selected", which === "join");
  document.getElementById("panel-create").classList.toggle("active", which === "create");
  document.getElementById("panel-join").classList.toggle("active", which === "join");
}

function renderCreateAvatarPicker() {
  renderAvatarPicker(document.getElementById("create-avatar-picker"), state.createAvatar, av => {
    state.createAvatar = av;
    renderCreateAvatarPicker();
  });
}
function renderJoinAvatarPicker() {
  renderAvatarPicker(document.getElementById("join-avatar-picker"), state.joinAvatar, av => {
    state.joinAvatar = av;
    renderJoinAvatarPicker();
  });
}

let googleUser = null;
GoogleAuth.init((user) => {
  googleUser = user;
  const statusEl = document.getElementById("google-signin-status");
  const btnEl = document.getElementById("google-signin-btn");
  const nameInput = document.getElementById("create-name");
  if (user) {
    statusEl.style.display = "block";
    statusEl.textContent = `✅ Conectado como ${user.email}`;
    btnEl.style.display = "none";
    if (!nameInput.value) nameInput.value = (user.displayName || "").split(" ")[0] || "";
  } else {
    statusEl.style.display = "none";
    btnEl.style.display = "inline-block";
  }
});

document.getElementById("google-signin-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("create-error");
  errorEl.textContent = "";
  try {
    await GoogleAuth.signIn();
  } catch (err) {
    errorEl.textContent = "Não foi possível entrar com Google.";
  }
});

document.getElementById("create-room-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("create-error");
  errorEl.textContent = "";
  const name = document.getElementById("create-name").value.trim();
  if (!name) { errorEl.textContent = "Digite seu nome."; return; }

  const myId = getPlayerId();
  const initialData = {
    status: "lobby",
    hostId: myId,
    hostVerified: !!googleUser,
    hostEmail: googleUser ? googleUser.email : null,
    theme: ["mix"],
    boardSize: 12,
    turnIndex: 0,
    cards: [],
    flippedIndexes: [],
    lockBoard: false,
    playerOrder: [myId],
    players: { [myId]: { name, avatar: state.createAvatar, score: 0 } },
  };

  try {
    const code = await OnlineRoom.create("memoria", initialData);
    state.mode = "online";
    state.online.myId = myId;
    state.online.isHost = true;
    state.online.roomId = code;
    state.online.winnerShown = false;
    OnlineRoom.trackPresence(myId);
    subscribeRoom();
    showScreen("lobby-screen");
  } catch (err) {
    errorEl.textContent = err.message || "Erro ao criar a sala.";
  }
});

document.getElementById("join-room-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("join-error");
  errorEl.textContent = "";
  const code = document.getElementById("join-code").value.trim();
  const name = document.getElementById("join-name").value.trim();
  if (!code) { errorEl.textContent = "Digite o código da sala."; return; }
  if (!name) { errorEl.textContent = "Digite seu nome."; return; }

  try {
    const room = await OnlineRoom.join(code);
    const myId = getPlayerId();
    const playerOrder = room.playerOrder || [];
    const nextOrder = playerOrder.includes(myId) ? playerOrder : playerOrder.concat(myId);
    const nextPlayers = Object.assign({}, room.players, {
      [myId]: { name, avatar: state.joinAvatar, score: (room.players[myId] && room.players[myId].score) || 0 },
    });
    await OnlineRoom.update({ playerOrder: nextOrder, players: nextPlayers });

    state.mode = "online";
    state.online.myId = myId;
    state.online.isHost = room.hostId === myId;
    state.online.roomId = OnlineRoom.roomId;
    state.online.winnerShown = false;
    OnlineRoom.trackPresence(myId);
    subscribeRoom();
    showScreen("lobby-screen");
  } catch (err) {
    errorEl.textContent = err.message || "Erro ao entrar na sala.";
  }
});

/* ================= LOBBY SCREEN ================= */

function subscribeRoom() {
  OnlineRoom.onChange(room => {
    if (!room) return;
    applyRoomState(room);
  });
}

function applyRoomState(room) {
  state.online.isHost = room.hostId === state.online.myId;
  const order = room.playerOrder || [];
  state.players = order
    .filter(id => room.players && room.players[id])
    .map(id => Object.assign({ id }, room.players[id]));
  state.selectedThemes = room.theme || ["mix"];
  state.boardSize = room.boardSize || 12;
  state.currentPlayerIndex = room.turnIndex || 0;
  state.cards = room.cards || [];
  state.flippedIndexes = room.flippedIndexes || [];
  state.lockBoard = !!room.lockBoard;

  if (room.status === "lobby") {
    renderLobby(room);
    showScreen("lobby-screen");
  } else if (room.status === "playing") {
    showScreen("game-screen");
    renderScoreboard();
    renderBoard();
    maybeResolveOnlineRound();
  } else if (room.status === "finished") {
    showScreen("game-screen");
    renderScoreboard();
    renderBoard();
    showWinnerFromRoom();
  }
}

function renderLobby(room) {
  document.getElementById("lobby-code").textContent = state.online.roomId || "-----";
  document.getElementById("lobby-verified-badge").style.display = room.hostVerified ? "block" : "none";

  const listEl = document.getElementById("lobby-players");
  listEl.innerHTML = "";
  state.players.forEach(p => {
    const chip = document.createElement("div");
    chip.className = "lobby-chip" + (p.id === room.hostId ? " host" : "");
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span>`;
    listEl.appendChild(chip);
  });

  const hostOptions = document.getElementById("lobby-host-options");
  const waitingText = document.getElementById("lobby-waiting-text");

  if (state.online.isHost) {
    hostOptions.style.display = "block";
    waitingText.style.display = "none";
    renderThemeOptions(document.getElementById("lobby-theme-options"), room.theme || ["mix"], next => {
      OnlineRoom.update({ theme: next });
    });
    renderSizeOptions(document.getElementById("lobby-size-options"), room.boardSize || 12, next => {
      OnlineRoom.update({ boardSize: next });
    });
  } else {
    hostOptions.style.display = "none";
    waitingText.style.display = "block";
  }
}

document.getElementById("lobby-start-btn").addEventListener("click", () => {
  const deck = buildDeck(state.selectedThemes, state.boardSize);
  const resetPlayers = {};
  state.players.forEach(p => { resetPlayers[p.id] = { name: p.name, avatar: p.avatar, score: 0 }; });
  OnlineRoom.update({
    status: "playing",
    cards: deck,
    flippedIndexes: [],
    lockBoard: false,
    turnIndex: 0,
    players: resetPlayers,
  });
});

/* ================= GAME SCREEN (compartilhado local/online) ================= */

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

  const cols = state.boardSize <= 12 ? 4 : state.boardSize <= 16 ? 4 : state.boardSize <= 20 ? 5 : 4;
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
  if (state.mode === "online") {
    onCardClickOnline(idx);
  } else {
    onCardClickLocal(idx);
  }
}

function onCardClickLocal(idx) {
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
        checkWinLocal();
      }, 500);
    } else {
      setTimeout(() => {
        c1.flipped = false;
        c2.flipped = false;
        state.flippedIndexes = [];
        state.lockBoard = false;
        nextPlayerLocal();
        renderScoreboard();
        renderBoard();
      }, 900);
    }
  }
}

function nextPlayerLocal() {
  if (state.players.length <= 1) return;
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}

function checkWinLocal() {
  const allMatched = state.cards.every(c => c.matched);
  if (!allMatched) return;
  showWinnerOverlay();
}

function onCardClickOnline(idx) {
  if (state.lockBoard) return;
  const card = state.cards[idx];
  if (!card || card.flipped || card.matched) return;
  if (state.flippedIndexes.length >= 2) return;

  const turnPlayer = state.players[state.currentPlayerIndex];
  if (!turnPlayer || turnPlayer.id !== state.online.myId) return; // não é sua vez

  const newCards = state.cards.map((c, i) => (i === idx ? Object.assign({}, c, { flipped: true }) : c));
  const newFlipped = state.flippedIndexes.concat(idx);
  OnlineRoom.update({ cards: newCards, flippedIndexes: newFlipped });
}

function maybeResolveOnlineRound() {
  if (state.flippedIndexes.length !== 2) return;
  if (state.online.resolving) return;

  const turnPlayer = state.players[state.currentPlayerIndex];
  if (!turnPlayer || turnPlayer.id !== state.online.myId) return; // só quem jogou resolve

  state.online.resolving = true;
  const [i1, i2] = state.flippedIndexes;
  const c1 = state.cards[i1];
  const c2 = state.cards[i2];
  const isMatch = c1.icon === c2.icon;

  setTimeout(() => {
    const newCards = state.cards.slice();
    const updates = {};

    if (isMatch) {
      newCards[i1] = Object.assign({}, c1, { matched: true });
      newCards[i2] = Object.assign({}, c2, { matched: true });
      updates.cards = newCards;
      updates.flippedIndexes = [];
      updates[`players/${turnPlayer.id}/score`] = (turnPlayer.score || 0) + 1;
      const allMatched = newCards.every(c => c.matched);
      if (allMatched) updates.status = "finished";
    } else {
      newCards[i1] = Object.assign({}, c1, { flipped: false });
      newCards[i2] = Object.assign({}, c2, { flipped: false });
      updates.cards = newCards;
      updates.flippedIndexes = [];
      updates.turnIndex = (state.currentPlayerIndex + 1) % state.players.length;
    }

    OnlineRoom.update(updates).then(() => { state.online.resolving = false; });
  }, isMatch ? 500 : 900);
}

function showWinnerFromRoom() {
  if (state.online.winnerShown) return;
  state.online.winnerShown = true;
  showWinnerOverlay();
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

renderLocalAvatarPicker();
renderPlayersList();
renderLocalThemeOptions();
renderLocalSizeOptions();
updateStartBtn();
renderCreateAvatarPicker();
renderJoinAvatarPicker();
renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
