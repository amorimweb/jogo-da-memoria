/* Banco de palavras para Mímica e Desenho Rápido.
   Cada item tem a palavra, um emoji-dica e a categoria. */

const MIMICA_BANK = [
  // 🐾 Animais
  { word: "CACHORRO", emoji: "🐶", category: "animais" },
  { word: "GATO", emoji: "🐱", category: "animais" },
  { word: "ELEFANTE", emoji: "🐘", category: "animais" },
  { word: "LEÃO", emoji: "🦁", category: "animais" },
  { word: "MACACO", emoji: "🐒", category: "animais" },
  { word: "GIRAFA", emoji: "🦒", category: "animais" },
  { word: "COELHO", emoji: "🐰", category: "animais" },
  { word: "TARTARUGA", emoji: "🐢", category: "animais" },
  { word: "BORBOLETA", emoji: "🦋", category: "animais" },
  { word: "PINGUIM", emoji: "🐧", category: "animais" },

  // 👔 Profissões
  { word: "MÉDICO", emoji: "🩺", category: "profissoes" },
  { word: "PROFESSOR", emoji: "👩‍🏫", category: "profissoes" },
  { word: "BOMBEIRO", emoji: "👨‍🚒", category: "profissoes" },
  { word: "COZINHEIRO", emoji: "👨‍🍳", category: "profissoes" },
  { word: "POLICIAL", emoji: "👮", category: "profissoes" },
  { word: "CANTOR", emoji: "🎤", category: "profissoes" },
  { word: "PINTOR", emoji: "🎨", category: "profissoes" },
  { word: "JOGADOR DE FUTEBOL", emoji: "⚽", category: "profissoes" },
  { word: "ASTRONAUTA", emoji: "👨‍🚀", category: "profissoes" },
  { word: "DENTISTA", emoji: "🦷", category: "profissoes" },

  // 🎬 Ações
  { word: "PULAR", emoji: "🤸", category: "acoes" },
  { word: "NADAR", emoji: "🏊", category: "acoes" },
  { word: "DANÇAR", emoji: "💃", category: "acoes" },
  { word: "DORMIR", emoji: "😴", category: "acoes" },
  { word: "CHORAR", emoji: "😢", category: "acoes" },
  { word: "RIR", emoji: "😂", category: "acoes" },
  { word: "CORRER", emoji: "🏃", category: "acoes" },
  { word: "VOAR", emoji: "🕊️", category: "acoes" },
  { word: "COMER", emoji: "🍽️", category: "acoes" },
  { word: "ESCOVAR OS DENTES", emoji: "🪥", category: "acoes" },

  // 🦸 Personagens e fantasia
  { word: "PRINCESA", emoji: "👸", category: "personagens" },
  { word: "PIRATA", emoji: "🏴‍☠️", category: "personagens" },
  { word: "SUPER-HERÓI", emoji: "🦸", category: "personagens" },
  { word: "BRUXA", emoji: "🧙", category: "personagens" },
  { word: "DRAGÃO", emoji: "🐉", category: "personagens" },
  { word: "FADA", emoji: "🧚", category: "personagens" },
  { word: "ROBÔ", emoji: "🤖", category: "personagens" },
  { word: "FANTASMA", emoji: "👻", category: "personagens" },
  { word: "SEREIA", emoji: "🧜‍♀️", category: "personagens" },
  { word: "PALHAÇO", emoji: "🤡", category: "personagens" },

  // 🎈 Objetos do dia a dia
  { word: "GUARDA-CHUVA", emoji: "☂️", category: "objetos" },
  { word: "TELEFONE", emoji: "📱", category: "objetos" },
  { word: "RELÓGIO", emoji: "⌚", category: "objetos" },
  { word: "CHAVE", emoji: "🔑", category: "objetos" },
  { word: "ÓCULOS", emoji: "👓", category: "objetos" },
  { word: "MOCHILA", emoji: "🎒", category: "objetos" },
  { word: "BICICLETA", emoji: "🚲", category: "objetos" },
  { word: "TESOURA", emoji: "✂️", category: "objetos" },
  { word: "CÂMERA", emoji: "📷", category: "objetos" },
  { word: "SORVETE", emoji: "🍦", category: "objetos" },
];

const MIMICA_CATEGORY_LABELS = {
  animais: "🐾 Animais",
  profissoes: "👔 Profissões",
  acoes: "🎬 Ações",
  personagens: "🦸 Personagens",
  objetos: "🎈 Objetos",
  mix: "✨ Misturado",
};

function getMimicaWords(categories) {
  if (!categories || categories.includes("mix")) return MIMICA_BANK.slice();
  return MIMICA_BANK.filter(w => categories.includes(w.category));
}
