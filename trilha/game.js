/* Trilha da Família — modo local e modo online (salas) */
(function () {
  "use strict";

  var COLORS = ["#ff8c42", "#3a8dde", "#3fae6a", "#d84f6b"];
  var COLOR_NAMES = ["Laranja", "Azul", "Verde", "Rosa"];
  var EXPLORERS = ["🦊", "🦉", "🐸", "🐰"];
  var COLS = 8;
  var ROWS = 6;
  var TOTAL_TILES = COLS * ROWS;

  var TILE_POS = (function () {
    var pos = {};
    var idx = 1;
    for (var r = 0; r < ROWS; r++) {
      var cols = [];
      for (var c = 0; c < COLS; c++) cols.push(c);
      if (r % 2 === 1) cols = cols.slice().reverse();
      for (var i = 0; i < cols.length; i++) {
        pos[idx] = { row: r, col: cols[i] };
        idx++;
      }
    }
    return pos;
  })();

  function getType(n) {
    if (n === 1) return "start";
    if (n === TOTAL_TILES) return "fim";
    var r = n % 4;
    if (r === 3) return "desafio";
    if (r === 1) return "prenda";
    return "normal";
  }

  var ICONS = { start: "🏕️", normal: "🌿", desafio: "🐉", prenda: "💎", fim: "🏆" };
  var LABELS = { desafio: "Perigo", prenda: "Tesouro" };

  var DESAFIOS = [
    "Imite o som de 3 animais da floresta.",
    "Dance por 10 segundos sem parar.",
    "Conte uma piada para a família.",
    "Faça 5 pulos de polichinelo para escapar do perigo.",
    "Cante o refrão da sua música favorita.",
    "Fique em equilíbrio em um pé só contando até 10.",
    "Faça uma careta engraçada e espere todos rirem.",
    "Desenhe um animal no ar com o dedo para os outros adivinharem.",
    "Imite seu personagem de desenho favorito.",
    "Faça 5 agachamentos como um verdadeiro explorador.",
    "Invente uma história de 1 minuto sobre um dragão da montanha.",
    "Faça uma dança da chuva para atravessar o rio.",
    "Imite como anda um robô por 10 segundos.",
    "Cante 'Parabéns a Você' bem baixinho, quase sussurrando.",
    "Mostre sua melhor cara de super-herói.",
    "Marche como um soldado até a parede mais próxima e volte.",
  ];

  var PRENDAS = [
    { text: "Ganhe um adesivo especial de explorador! ⭐" },
    { text: "Escolha a próxima música da família." },
    { text: "Avance 2 casas na trilha!", effect: "forward2" },
    { text: "Jogue o dado de novo!", effect: "again" },
    { text: "Ganhe um abraço apertado de todos." },
    { text: "Escolha quem joga por último na próxima rodada." },
    { text: "Receba um aplauso da torcida! 👏" },
    { text: "Use a coroa de campeão até sua próxima jogada." },
    { text: "Escolha a sobremesa de hoje." },
    { text: "Todos têm que te elogiar uma vez." },
    { text: "Ganhe 1 minuto de música para dançar à vontade." },
    { text: "Avance 1 casa!", effect: "forward1" },
    { text: "Receba um high-five de cada jogador." },
    { text: "Escolha o próximo desafio que alguém vai fazer." },
    { text: "Ganhe a medalha de 'Explorador Sortudo'." },
    { text: "Todos gritam seu nome com entusiasmo, no 3!" },
  ];

  var state = {
    mode: "local",
    players: [], // {name, color, avatar, pos, id?}
    current: 0,
    rolling: false,
    cubeRot: { x: 0, y: 0 },
    finished: false,
    createAvatarIdx: 0,
    joinAvatarIdx: 0,
    online: { myId: null, isHost: false, roomId: null, resolving: false },
  };

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
    document.getElementById(id).classList.add("active");
  }

  /* ---------- mode screen ---------- */
  document.getElementById("mode-local").addEventListener("click", function () {
    state.mode = "local";
    showScreen("setup");
  });
  document.getElementById("mode-online").addEventListener("click", function () {
    state.mode = "online";
    showScreen("online-screen");
  });

  /* ---------- local setup screen ---------- */
  var countDisplay = document.getElementById("countDisplay");
  var playerRows = document.getElementById("playerRows");
  var count = 2;

  function renderPlayerRows() {
    playerRows.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var row = document.createElement("div");
      row.className = "player-row";

      var input = document.createElement("input");
      input.type = "text";
      input.id = "nameInput" + i;
      input.maxLength = 16;
      input.value = "";
      input.placeholder = "Nome do jogador " + (i + 1);

      var colorRow = document.createElement("div");
      colorRow.className = "color-row";
      COLORS.forEach(function (c, ci) {
        var dot = document.createElement("div");
        dot.className = "color-dot";
        dot.style.background = c;
        dot.title = COLOR_NAMES[ci] + " " + EXPLORERS[ci];
        dot.textContent = EXPLORERS[ci];
        dot.dataset.color = c;
        dot.dataset.avatar = EXPLORERS[ci];
        dot.dataset.player = i;
        if (ci === i) dot.classList.add("active");
        dot.addEventListener("click", function () {
          var p = this.dataset.player;
          var siblings = playerRows.children[p].querySelectorAll(".color-dot");
          siblings.forEach(function (s) { s.classList.remove("active"); });
          this.classList.add("active");
        });
        colorRow.appendChild(dot);
      });

      row.appendChild(input);
      row.appendChild(colorRow);
      playerRows.appendChild(row);
    }
  }
  renderPlayerRows();

  document.getElementById("countMinus").addEventListener("click", function () {
    if (count > 2) { count--; countDisplay.textContent = count; renderPlayerRows(); }
  });
  document.getElementById("countPlus").addEventListener("click", function () {
    if (count < 4) { count++; countDisplay.textContent = count; renderPlayerRows(); }
  });

  document.getElementById("startBtn").addEventListener("click", function () {
    var players = [];
    for (var i = 0; i < count; i++) {
      var nameEl = document.getElementById("nameInput" + i);
      var name = (nameEl.value || "").trim() || ("Jogador " + (i + 1));
      var activeDot = playerRows.children[i].querySelector(".color-dot.active");
      var color = activeDot ? activeDot.dataset.color : COLORS[i];
      var avatar = activeDot ? activeDot.dataset.avatar : EXPLORERS[i];
      players.push({ name: name, color: color, avatar: avatar, pos: 1 });
    }
    state.players = players;
    state.current = 0;
    state.finished = false;
    document.getElementById("diceDock").hidden = false;
    showScreen("game");
    buildBoard();
    renderPlayersStrip();
    renderTokens();
    updateTurnBanner();
  });

  document.getElementById("newGameBtn").addEventListener("click", function () {
    if (state.mode === "online") {
      OnlineRoom.update({ status: "lobby", finished: false });
    } else {
      document.getElementById("diceDock").hidden = true;
      showScreen("setup");
    }
  });

  /* ---------- online screen (criar / entrar) ---------- */
  function renderAvatarRow(containerEl, activeIdx, onPick) {
    containerEl.innerHTML = "";
    COLORS.forEach(function (c, ci) {
      var dot = document.createElement("div");
      dot.className = "color-dot" + (ci === activeIdx ? " active" : "");
      dot.style.background = c;
      dot.title = COLOR_NAMES[ci] + " " + EXPLORERS[ci];
      dot.textContent = EXPLORERS[ci];
      dot.addEventListener("click", function () { onPick(ci); });
      containerEl.appendChild(dot);
    });
  }
  function renderCreateAvatarRow() {
    renderAvatarRow(document.getElementById("create-avatar-picker"), state.createAvatarIdx, function (ci) {
      state.createAvatarIdx = ci;
      renderCreateAvatarRow();
    });
  }
  function renderJoinAvatarRow() {
    renderAvatarRow(document.getElementById("join-avatar-picker"), state.joinAvatarIdx, function (ci) {
      state.joinAvatarIdx = ci;
      renderJoinAvatarRow();
    });
  }
  renderCreateAvatarRow();
  renderJoinAvatarRow();

  document.getElementById("tab-create").addEventListener("click", function () { switchTab("create"); });
  document.getElementById("tab-join").addEventListener("click", function () { switchTab("join"); });
  function switchTab(which) {
    document.getElementById("tab-create").classList.toggle("selected", which === "create");
    document.getElementById("tab-join").classList.toggle("selected", which === "join");
    document.getElementById("panel-create").classList.toggle("active", which === "create");
    document.getElementById("panel-join").classList.toggle("active", which === "join");
  }

  var googleUser = null;
  GoogleAuth.init(function (user) {
    googleUser = user;
    var statusEl = document.getElementById("google-signin-status");
    var btnEl = document.getElementById("google-signin-btn");
    var nameInput = document.getElementById("create-name");
    if (user) {
      statusEl.style.display = "block";
      statusEl.textContent = "✅ Conectado como " + user.email;
      btnEl.style.display = "none";
      if (!nameInput.value) nameInput.value = (user.displayName || "").split(" ")[0] || "";
    } else {
      statusEl.style.display = "none";
      btnEl.style.display = "inline-block";
    }
  });

  document.getElementById("google-signin-btn").addEventListener("click", function () {
    var errorEl = document.getElementById("create-error");
    errorEl.textContent = "";
    GoogleAuth.signIn().catch(function () {
      errorEl.textContent = "Não foi possível entrar com Google.";
    });
  });

  document.getElementById("create-room-btn").addEventListener("click", function () {
    var errorEl = document.getElementById("create-error");
    errorEl.textContent = "";
    var name = document.getElementById("create-name").value.trim();
    if (!name) { errorEl.textContent = "Digite seu nome."; return; }

    var myId = getPlayerId();
    var initialData = {
      status: "lobby",
      hostId: myId,
      hostVerified: !!googleUser,
      hostEmail: googleUser ? googleUser.email : null,
      turnIndex: 0,
      finished: false,
      playerOrder: [myId],
      players: {},
    };
    initialData.players[myId] = { name: name, color: COLORS[state.createAvatarIdx], avatar: EXPLORERS[state.createAvatarIdx], pos: 1 };

    OnlineRoom.create("trilha", initialData).then(function (code) {
      state.mode = "online";
      state.online.myId = myId;
      state.online.isHost = true;
      state.online.roomId = code;
      subscribeRoom();
      showScreen("lobby-screen");
    }).catch(function (err) {
      errorEl.textContent = err.message || "Erro ao criar a sala.";
    });
  });

  document.getElementById("join-room-btn").addEventListener("click", function () {
    var errorEl = document.getElementById("join-error");
    errorEl.textContent = "";
    var code = document.getElementById("join-code").value.trim();
    var name = document.getElementById("join-name").value.trim();
    if (!code) { errorEl.textContent = "Digite o código da sala."; return; }
    if (!name) { errorEl.textContent = "Digite seu nome."; return; }

    OnlineRoom.join(code).then(function (room) {
      var myId = getPlayerId();
      var order = room.playerOrder || [];
      var nextOrder = order.indexOf(myId) === -1 ? order.concat(myId) : order;
      var nextPlayers = Object.assign({}, room.players);
      nextPlayers[myId] = { name: name, color: COLORS[state.joinAvatarIdx], avatar: EXPLORERS[state.joinAvatarIdx], pos: (room.players[myId] && room.players[myId].pos) || 1 };

      return OnlineRoom.update({ playerOrder: nextOrder, players: nextPlayers }).then(function () {
        state.mode = "online";
        state.online.myId = myId;
        state.online.isHost = room.hostId === myId;
        state.online.roomId = OnlineRoom.roomId;
        subscribeRoom();
        showScreen("lobby-screen");
      });
    }).catch(function (err) {
      errorEl.textContent = err.message || "Erro ao entrar na sala.";
    });
  });

  /* ---------- lobby screen ---------- */
  function subscribeRoom() {
    OnlineRoom.onChange(function (room) {
      if (!room) return;
      applyRoomState(room);
    });
  }

  function applyRoomState(room) {
    state.online.isHost = room.hostId === state.online.myId;
    var order = room.playerOrder || [];
    state.players = order
      .filter(function (id) { return room.players && room.players[id]; })
      .map(function (id) { return Object.assign({ id: id }, room.players[id]); });
    state.current = room.turnIndex || 0;
    state.finished = !!room.finished;

    if (room.status === "lobby") {
      renderLobby(room);
      document.getElementById("diceDock").hidden = true;
      showScreen("lobby-screen");
    } else if (room.status === "playing") {
      document.getElementById("diceDock").hidden = false;
      showScreen("game");
      buildBoard();
      renderPlayersStrip();
      renderTokens();
      updateTurnBanner();
      updateDiceEnabled();
    }
  }

  function renderLobby(room) {
    document.getElementById("lobby-code").textContent = state.online.roomId || "-----";
    document.getElementById("lobby-verified-badge").style.display = room.hostVerified ? "block" : "none";
    var listEl = document.getElementById("lobby-players");
    listEl.innerHTML = "";
    state.players.forEach(function (p) {
      var chip = document.createElement("div");
      chip.className = "lobby-chip" + (p.id === room.hostId ? " host" : "");
      chip.innerHTML = '<span class="dot" style="background:' + p.color + '">' + p.avatar + "</span><span>" + p.name + "</span>";
      listEl.appendChild(chip);
    });

    var hostOptions = document.getElementById("lobby-host-options");
    var waitingText = document.getElementById("lobby-waiting-text");
    if (state.online.isHost) {
      hostOptions.style.display = "block";
      waitingText.style.display = "none";
    } else {
      hostOptions.style.display = "none";
      waitingText.style.display = "block";
    }
  }

  document.getElementById("lobby-start-btn").addEventListener("click", function () {
    var resetPlayers = {};
    state.players.forEach(function (p) {
      resetPlayers[p.id] = { name: p.name, color: p.color, avatar: p.avatar, pos: 1 };
    });
    OnlineRoom.update({ status: "playing", turnIndex: 0, finished: false, players: resetPlayers });
  });

  /* ---------- board ---------- */
  function buildBoard() {
    var board = document.getElementById("board");
    board.innerHTML = "";

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + COLS + " " + ROWS);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("path-line");
    var pts = [];
    for (var n = 1; n <= TOTAL_TILES; n++) {
      var p = TILE_POS[n];
      pts.push((p.col + 0.5) + "," + (p.row + 0.5));
    }
    var polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", pts.join(" "));
    svg.appendChild(polyline);
    board.appendChild(svg);

    for (var m = 1; m <= TOTAL_TILES; m++) {
      var pos = TILE_POS[m];
      var type = getType(m);
      var tile = document.createElement("div");
      tile.className = "tile " + type;
      tile.style.gridRow = (pos.row + 1);
      tile.style.gridColumn = (pos.col + 1);
      var icon = ICONS[type];
      tile.innerHTML = (icon ? '<div class="icon">' + icon + "</div>" : "") + '<div class="num">' + m + "</div>";
      board.appendChild(tile);
    }
  }

  function tileCenter(n) {
    var p = TILE_POS[n];
    return { leftPct: (p.col + 0.5) / COLS * 100, topPct: (p.row + 0.5) / ROWS * 100 };
  }

  function renderPlayersStrip() {
    var strip = document.getElementById("playersStrip");
    strip.innerHTML = "";
    state.players.forEach(function (pl, i) {
      var chip = document.createElement("div");
      chip.className = "player-chip";
      chip.id = "chip" + i;
      chip.innerHTML = '<span class="dot" style="background:' + pl.color + '">' + pl.avatar + "</span>" + pl.name;
      strip.appendChild(chip);
    });
  }

  function renderTokens() {
    var layer = document.getElementById("tokenLayer");
    layer.innerHTML = "";
    state.players.forEach(function (pl, i) {
      var tok = document.createElement("div");
      tok.className = "token";
      tok.id = "token" + i;
      tok.style.background = pl.color;
      tok.textContent = pl.avatar;
      layer.appendChild(tok);
      positionToken(i);
    });
  }

  function positionToken(i) {
    var pl = state.players[i];
    var c = tileCenter(pl.pos);
    var offsets = [[-6, -6], [6, -6], [-6, 6], [6, 6]];
    var off = offsets[i] || [0, 0];
    var tok = document.getElementById("token" + i);
    if (!tok) return;
    tok.style.left = "calc(" + c.leftPct + "% + " + off[0] + "px)";
    tok.style.top = "calc(" + c.topPct + "% + " + off[1] + "px)";
  }

  function updateTurnBanner() {
    var pl = state.players[state.current];
    if (!pl) return;
    var turnDot = document.getElementById("turnDot");
    turnDot.style.background = pl.color;
    turnDot.textContent = pl.avatar;
    document.getElementById("turnText").textContent = "Vez de " + pl.name;
    document.querySelectorAll(".player-chip").forEach(function (c, i) {
      c.classList.toggle("current", i === state.current);
    });
  }

  function isMyTurn() {
    if (state.mode !== "online") return true;
    var pl = state.players[state.current];
    return !!pl && pl.id === state.online.myId;
  }

  function updateDiceEnabled() {
    var scene = document.getElementById("diceScene");
    scene.classList.toggle("disabled", !isMyTurn() || state.finished);
    document.getElementById("diceHint").textContent = state.finished
      ? "Fim de jogo!"
      : isMyTurn() ? "Role o dado da aventura!" : "Aguarde sua vez...";
  }

  /* ---------- dice ---------- */
  var FACE_ROT = {
    1: { x: 0, y: 0 }, 2: { x: 0, y: -90 }, 3: { x: -90, y: 0 },
    4: { x: 90, y: 0 }, 5: { x: 0, y: 90 }, 6: { x: 0, y: 180 },
  };

  var scene = document.getElementById("diceScene");
  var cube = document.getElementById("cube");
  var diceHint = document.getElementById("diceHint");

  function rollDice() {
    if (state.rolling || state.finished) return;
    if (!isMyTurn()) return;
    state.rolling = true;
    diceHint.textContent = "Rolando...";

    var n = 1 + Math.floor(Math.random() * 6);
    var target = FACE_ROT[n];
    var curX = ((state.cubeRot.x % 360) + 360) % 360;
    var curY = ((state.cubeRot.y % 360) + 360) % 360;
    var tx = ((target.x % 360) + 360) % 360;
    var ty = ((target.y % 360) + 360) % 360;
    var deltaX = ((tx - curX) % 360 + 360) % 360;
    var deltaY = ((ty - curY) % 360 + 360) % 360;

    state.cubeRot.x += 720 + deltaX;
    state.cubeRot.y += 720 + deltaY;

    scene.classList.add("rolling");
    cube.style.transform = "rotateX(" + state.cubeRot.x + "deg) rotateY(" + state.cubeRot.y + "deg)";

    setTimeout(function () {
      scene.classList.remove("rolling");
      diceHint.textContent = "Resultado: " + n;
      movePlayer(n);
    }, 900);
  }

  scene.addEventListener("click", rollDice);
  scene.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rollDice(); }
  });

  /* ---------- movement ---------- */
  function movePlayer(steps) {
    var i = state.current;
    var pl = state.players[i];
    var remaining = steps;

    function step() {
      if (remaining <= 0) { onLanded(i); return; }
      remaining--;
      pl.pos = Math.min(pl.pos + 1, TOTAL_TILES);
      positionToken(i);
      if (pl.pos >= TOTAL_TILES) {
        setTimeout(function () { onLanded(i); }, 300);
        return;
      }
      setTimeout(step, 220);
    }
    step();
  }

  function onLanded(i) {
    var pl = state.players[i];
    var type = getType(pl.pos);
    state.rolling = false;

    if (pl.pos >= TOTAL_TILES) {
      showWinModal(pl);
      state.finished = true;
      diceHint.textContent = "Fim de jogo!";
      persistState({ finished: true });
      return;
    }

    if (type === "desafio") {
      var txt = DESAFIOS[Math.floor(Math.random() * DESAFIOS.length)];
      showEventModal("desafio", "🐉", "Perigo à frente, " + pl.name + "!", txt, function () {
        finishTurn();
      });
    } else if (type === "prenda") {
      var prize = PRENDAS[Math.floor(Math.random() * PRENDAS.length)];
      showEventModal("prenda", "💎", "Tesouro encontrado, " + pl.name + "!", prize.text, function () {
        applyPrizeEffect(i, prize.effect, function () { finishTurn(); });
      });
    } else {
      diceHint.textContent = "Role o dado da aventura!";
      finishTurn();
    }
  }

  function applyPrizeEffect(i, effect, done) {
    if (effect === "again") {
      diceHint.textContent = "Jogue de novo!";
      state._again = true;
      done();
      return;
    }
    if (effect === "forward1" || effect === "forward2") {
      var n = effect === "forward1" ? 1 : 2;
      var pl = state.players[i];
      var remaining = n;
      var mover = function () {
        if (remaining <= 0) { done(); return; }
        remaining--;
        pl.pos = Math.min(pl.pos + 1, TOTAL_TILES);
        positionToken(i);
        if (pl.pos >= TOTAL_TILES) {
          showWinModal(pl);
          state.finished = true;
          persistState({ finished: true });
          return;
        }
        setTimeout(mover, 220);
      };
      mover();
      return;
    }
    done();
  }

  function finishTurn() {
    if (state.finished) { persistState({}); return; }
    var nextIndex = state._again ? state.current : (state.current + 1) % state.players.length;
    state._again = false;
    state.current = nextIndex;
    updateTurnBanner();
    updateDiceEnabled();
    diceHint.textContent = isMyTurn() ? "Role o dado da aventura!" : "Aguarde sua vez...";
    persistState({ turnIndex: nextIndex });
  }

  function persistState(extra) {
    if (state.mode !== "online") return;
    var updates = Object.assign({}, extra);
    var playersUpdate = {};
    state.players.forEach(function (p) {
      playersUpdate[p.id] = { name: p.name, color: p.color, avatar: p.avatar, pos: p.pos };
    });
    updates.players = playersUpdate;
    OnlineRoom.update(updates);
  }

  /* ---------- modal ---------- */
  var backdrop = document.getElementById("modalBackdrop");
  var modalCard = document.getElementById("modalCard");
  var modalEmoji = document.getElementById("modalEmoji");
  var modalBadge = document.getElementById("modalBadge");
  var modalTitle = document.getElementById("modalTitle");
  var modalText = document.getElementById("modalText");
  var modalBtn = document.getElementById("modalBtn");
  var onModalClose = null;

  function showEventModal(type, emoji, title, text, onClose) {
    modalCard.className = "modal " + type;
    modalEmoji.textContent = emoji;
    modalBadge.textContent = LABELS[type];
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalBtn.textContent = "Concluído";
    onModalClose = onClose;
    backdrop.hidden = false;
  }

  function showWinModal(pl) {
    modalCard.className = "modal win";
    modalEmoji.textContent = "🏆";
    modalBadge.textContent = "Vitória";
    modalTitle.textContent = pl.name + " venceu a aventura!";
    modalText.textContent = "Chegou primeiro ao tesouro escondido no topo da montanha! 🎉";
    modalBtn.textContent = state.mode === "online" ? "Voltar à sala" : "Jogar de novo";
    onModalClose = function () {
      if (state.mode === "online") {
        OnlineRoom.update({ status: "lobby", finished: false });
      } else {
        document.getElementById("diceDock").hidden = true;
        showScreen("setup");
      }
    };
    backdrop.hidden = false;
  }

  modalBtn.addEventListener("click", function () {
    backdrop.hidden = true;
    var cb = onModalClose;
    onModalClose = null;
    if (cb) cb();
  });
})();
