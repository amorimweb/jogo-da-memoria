/* Mundo dos Números — contar, somar e subtrair com múltipla escolha */

const AVATARS = ["😺","🐶","🐵","🦁","🐸","🐧","🦄","🐙","🐻","🐰","🦋","🐢","🐼","🦊","🐯","🐮"];
const COUNT_EMOJIS = ["🍎","🍓","⭐","🎈","🚗","🐱","🍌","🎲","🐠","🌸"];

const state = {
  players: [],
  selectedAvatar: AVATARS[0],
  level: "contar", // "contar" | "somar" | "subtrair" | "mix"
  currentPlayerIndex: 0,
  round: 0,
  totalRounds: 8,
  currentQuestion: null,
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

const LEVEL_CHOICES = [
  { label: "🟢 Contar (fácil)", value: "contar" },
  { label: "🟡 Somar (médio)", value: "somar" },
  { label: "🔴 Subtrair (difícil)", value: "subtrair" },
  { label: "✨ Misturado", value: "mix" },
];

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
  renderScoreboard();
  showScreen("game-screen");
  loadRound();
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

/* ================= GERAÇÃO DE PERGUNTAS ================= */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gera 4 opções únicas (inclui a correta), espalhadas perto do valor certo.
function genOptions(correct, spread, min) {
  const options = new Set([correct]);
  let guard = 0;
  while (options.size < 4 && guard < 100) {
    guard++;
    const offset = randInt(-spread, spread);
    const candidate = correct + offset;
    if (candidate === correct) continue;
    if (candidate < min) continue;
    options.add(candidate);
  }
  // fallback caso não tenha gerado o suficiente (correct muito perto do min)
  let filler = min;
  while (options.size < 4) {
    if (!options.has(filler)) options.add(filler);
    filler++;
  }
  return shuffle([...options]);
}

function buildContarQuestion() {
  const n = randInt(1, 10);
  const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
  return {
    emojisHtml: emoji.repeat(n),
    text: "Quantos tem?",
    answer: n,
    options: genOptions(n, 3, 1),
  };
}

function buildSomarQuestion() {
  const a = randInt(1, 10);
  const b = randInt(1, Math.min(10, 18 - a));
  const sum = a + b;
  const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
  return {
    emojisHtml: emoji.repeat(a) + " <span style='opacity:.5'>+</span> " + emoji.repeat(b),
    text: `${a} + ${b} = ?`,
    answer: sum,
    options: genOptions(sum, 3, 0),
  };
}

function buildSubtrairQuestion() {
  const a = randInt(2, 18);
  const b = randInt(1, a);
  const result = a - b;
  const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
  const kept = emoji.repeat(a - b);
  const removed = `<span class="faded">${emoji.repeat(b)}</span>`;
  return {
    emojisHtml: kept + removed,
    text: `${a} - ${b} = ?`,
    answer: result,
    options: genOptions(result, 3, 0),
  };
}

function buildQuestion() {
  let kind = state.level;
  if (kind === "mix") {
    kind = ["contar", "somar", "subtrair"][randInt(0, 2)];
  }
  if (kind === "contar") return buildContarQuestion();
  if (kind === "somar") return buildSomarQuestion();
  return buildSubtrairQuestion();
}

/* ================= FLUXO DO JOGO ================= */

function loadRound() {
  state.currentQuestion = buildQuestion();
  document.getElementById("round-counter").textContent =
    `Pergunta ${state.round + 1} de ${state.totalRounds}`;
  document.getElementById("question-emojis").innerHTML = state.currentQuestion.emojisHtml;
  document.getElementById("question-text").textContent = state.currentQuestion.text;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback-text";
  renderOptions();
}

function renderOptions() {
  const row = document.getElementById("options-row");
  row.innerHTML = "";
  state.currentQuestion.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => onOptionClick(opt));
    row.appendChild(btn);
  });
}

function onOptionClick(chosen) {
  const feedbackEl = document.getElementById("feedback");
  if (chosen === state.currentQuestion.answer) {
    feedbackEl.textContent = "🎉 Isso aí! Muito bem!";
    feedbackEl.className = "feedback-text correct";
    state.players[state.currentPlayerIndex].score++;
    renderScoreboard();
    setTimeout(advanceRound, 900);
  } else {
    feedbackEl.textContent = "🤔 Quase! Tente de novo.";
    feedbackEl.className = "feedback-text wrong";
    const panel = document.getElementById("options-row");
    panel.classList.add("shake");
    setTimeout(() => panel.classList.remove("shake"), 400);
  }
}

function advanceRound() {
  nextPlayer();
  renderScoreboard();
  state.round++;
  if (state.round >= state.totalRounds) {
    showWinnerOverlay();
  } else {
    loadRound();
  }
}

/* ---------- Init ---------- */

renderAvatarPicker();
renderPlayersList();
renderLevelOptions();
updateStartBtn();
renderRecentPlayers("recent-players", (p) => addPlayer(p.name, p.avatar));
