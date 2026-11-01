/* Banco de ícones do jogo da memória.
   Usamos emojis (Unicode) dentro de SVG — coloridos, reconhecíveis por
   crianças e sem depender de nenhum arquivo externo. */

const ICON_BANK = {
  animais: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦉",
    "🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐢",
    "🐍","🦕","🐙","🦀","🐠","🐬","🐳","🦈","🐘","🦒"
  ],
  veiculos: [
    "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐",
    "🛻","🚚","🚛","🚜","🛵","🏍️","🚲","🛴","✈️","🛩️",
    "🚁","🚀","🛸","⛵","🚤","🛳️","🚂","🚆","🚊","🚡",
    "🛶","🚂","🚃","🚋","🚞","🚔","🚍","🛺","🛞","🚄"
  ],
  frutas: [
    "🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒",
    "🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍐","🍏","🫒",
    "🌽","🥕","🥔","🫑","🥦","🧄","🧅","🍄","🥒","🌶️",
    "🍆","🥜","🌰","🍞","🧀","🥐","🍰","🍩","🍪","🍭"
  ],
  espaco: [
    "⭐","🌟","🌙","☀️","🌈","🪐","🌞","🌝","🌛","🌠",
    "☁️","⛅","⚡","❄️","🔥","🌊","🌪️","☄️","🛰️","👽"
  ],
  brinquedos: [
    "🎈","🎁","🪀","🧸","🪁","⚽","🏀","🎾","🏈","🎱",
    "🎲","🧩","🪄","🎯","🎨","🎵","🎺","🥁","🎸","🎹"
  ]
};

function getAllIcons() {
  return Object.values(ICON_BANK).flat();
}

function getIconsByThemes(themeKeys) {
  let pool = [];
  themeKeys.forEach(k => {
    if (ICON_BANK[k]) pool = pool.concat(ICON_BANK[k]);
  });
  if (pool.length === 0) pool = getAllIcons();
  return pool;
}

const THEME_LABELS = {
  animais: "🐾 Animais",
  veiculos: "🚗 Veículos",
  frutas: "🍎 Frutas e legumes",
  espaco: "🌈 Espaço e tempo",
  brinquedos: "🧸 Brinquedos",
  mix: "✨ Misturado (todos)"
};
