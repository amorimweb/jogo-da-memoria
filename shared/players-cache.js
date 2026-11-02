/* Lembra os jogadores usados recentemente (nome + avatar) no aparelho,
   pra não precisar redigitar o nome toda vez. Guardado no localStorage
   do navegador — não sai desse aparelho, não precisa de internet. */

const PlayersCache = {
  KEY: "cantinho_recent_players",
  MAX: 10,

  getAll() {
    try {
      const list = JSON.parse(localStorage.getItem(this.KEY));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  add(name, avatar) {
    try {
      const clean = (name || "").trim();
      if (!clean) return;
      let list = this.getAll().filter((p) => p.name.toLowerCase() !== clean.toLowerCase());
      list.unshift({ name: clean, avatar });
      localStorage.setItem(this.KEY, JSON.stringify(list.slice(0, this.MAX)));
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem cache
    }
  },
};

/* Renderiza a lista de sugestões de jogadores recentes num container,
   escondendo-o quando não há nenhum salvo ainda. onPick(player) é
   chamado quando a pessoa toca numa sugestão. */
function renderRecentPlayers(containerId, onPick) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const recent = PlayersCache.getAll();
  if (recent.length === 0) {
    el.style.display = "none";
    return;
  }
  el.style.display = "flex";
  el.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = "⭐ Toque pra adicionar de novo:";
  label.style.cssText = "width:100%;text-align:center;font-size:13px;font-weight:bold;color:#746a58;margin-bottom:2px;";
  el.appendChild(label);

  recent.forEach((p) => {
    const chip = document.createElement("div");
    chip.className = "player-chip recent-player-chip";
    chip.style.cssText = "cursor:pointer;opacity:0.85;border-style:dashed;";
    chip.innerHTML = `<span class="avatar-mini">${p.avatar}</span><span>${p.name}</span>`;
    chip.title = "Adicionar " + p.name;
    chip.addEventListener("click", () => onPick(p));
    el.appendChild(chip);
  });
}
