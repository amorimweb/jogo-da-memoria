/* Camada de "sala online" compartilhada pelos jogos.
   Usa o Firebase Realtime Database: cada partida online vira um nó
   em /rooms/{codigo}. Precisa dos scripts firebase-app-compat e
   firebase-database-compat carregados antes deste arquivo. */

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem O/0/I/1 para evitar confusão

function generateRoomCode() {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function getPlayerId() {
  let id = sessionStorage.getItem("playerId");
  if (!id) {
    id = "p_" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("playerId", id);
  }
  return id;
}

const OnlineRoom = {
  roomId: null,
  ref: null,

  async create(game, initialData) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();
      const ref = db.ref("rooms/" + code);
      const snap = await ref.get();
      if (snap.exists()) continue;
      await ref.set(Object.assign({ game, createdAt: Date.now() }, initialData));
      this.roomId = code;
      this.ref = ref;
      return code;
    }
    throw new Error("Não foi possível criar a sala, tente novamente.");
  },

  async join(code) {
    const normalized = (code || "").trim().toUpperCase();
    const ref = db.ref("rooms/" + normalized);
    const snap = await ref.get();
    if (!snap.exists()) throw new Error("Sala não encontrada. Confira o código.");
    this.roomId = normalized;
    this.ref = ref;
    return snap.val();
  },

  onChange(callback) {
    this.ref.on("value", (snap) => callback(snap.val()));
  },

  update(data) {
    return this.ref.update(data);
  },

  set(path, data) {
    return this.ref.child(path).set(data);
  },

  leave() {
    if (this.ref) this.ref.off();
    this.ref = null;
    this.roomId = null;
  },
};
