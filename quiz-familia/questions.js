/* Banco de perguntas do Quiz da Família.
   Cada pergunta tem exatamente 1 resposta certa (índice em "correct")
   entre 4 opções, e um emoji de apoio. */

const QUESTION_BANK = {
  animais: {
    label: "🐾 Animais",
    questions: [
      { q: "Qual é o maior animal do mundo?", options: ["Baleia-azul", "Elefante", "Girafa", "Tubarão-baleia"], correct: 0, emoji: "🐋" },
      { q: "Quantas patas tem uma aranha?", options: ["6", "8", "10", "4"], correct: 1, emoji: "🕷️" },
      { q: "Qual animal é conhecido como \"rei da selva\"?", options: ["Leão", "Tigre", "Elefante", "Urso"], correct: 0, emoji: "🦁" },
      { q: "Qual desses animais consegue voar?", options: ["Morcego", "Cavalo", "Peixe", "Tartaruga"], correct: 0, emoji: "🦇" },
      { q: "Qual é o animal terrestre mais rápido do mundo?", options: ["Guepardo", "Cavalo", "Águia", "Golfinho"], correct: 0, emoji: "🐆" },
      { q: "Que animal troca de cor para se camuflar?", options: ["Camaleão", "Coelho", "Pato", "Cavalo"], correct: 0, emoji: "🦎" },
      { q: "Qual desses é um animal marinho?", options: ["Golfinho", "Coelho", "Cavalo", "Galinha"], correct: 0, emoji: "🐬" },
      { q: "Quantos corações tem um polvo?", options: ["3", "1", "2", "4"], correct: 0, emoji: "🐙" },
      { q: "Qual animal é conhecido por construir represas?", options: ["Castor", "Esquilo", "Coelho", "Raposa"], correct: 0, emoji: "🦫" },
      { q: "Que animal é símbolo da sabedoria em várias culturas?", options: ["Coruja", "Pombo", "Pato", "Galinha"], correct: 0, emoji: "🦉" },
      { q: "Qual desses animais é um réptil?", options: ["Jacaré", "Sapo", "Golfinho", "Pinguim"], correct: 0, emoji: "🐊" },
      { q: "Qual animal dorme a maior parte do dia?", options: ["Preguiça", "Cavalo", "Formiga", "Abelha"], correct: 0, emoji: "🦥" },
      { q: "De onde a abelha tira o que vira mel?", options: ["Néctar das flores", "Água do mar", "Folhas secas", "Terra"], correct: 0, emoji: "🐝" },
    ],
  },
  geografia: {
    label: "🌍 Geografia",
    questions: [
      { q: "Qual é o maior oceano do mundo?", options: ["Pacífico", "Atlântico", "Índico", "Ártico"], correct: 0, emoji: "🌊" },
      { q: "Em qual continente fica o Brasil?", options: ["América do Sul", "Europa", "África", "Ásia"], correct: 0, emoji: "🌎" },
      { q: "Qual é a capital do Brasil?", options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], correct: 0, emoji: "🏛️" },
      { q: "Qual é o maior deserto quente do mundo?", options: ["Saara", "Deserto de Gobi", "Atacama", "Kalahari"], correct: 0, emoji: "🏜️" },
      { q: "Qual rio enorme passa pelo Brasil?", options: ["Rio Amazonas", "Rio Nilo", "Rio Mississippi", "Rio Tejo"], correct: 0, emoji: "🏞️" },
      { q: "Qual destes países fica na América do Sul?", options: ["Brasil", "Alemanha", "Japão", "Egito"], correct: 0, emoji: "🗺️" },
      { q: "Qual é a montanha mais alta do mundo?", options: ["Monte Everest", "Monte Fuji", "Pico da Neblina", "Monte Kilimanjaro"], correct: 0, emoji: "⛰️" },
      { q: "Em que continente fica o Egito?", options: ["África", "Ásia", "Europa", "Oceania"], correct: 0, emoji: "🐪" },
      { q: "Qual é o menor continente do mundo?", options: ["Oceania", "América do Sul", "Europa", "África"], correct: 0, emoji: "🏝️" },
      { q: "Qual destas é uma das sete maravilhas do mundo moderno?", options: ["Cristo Redentor", "Torre Eiffel", "Big Ben", "Estátua da Liberdade"], correct: 0, emoji: "🗿" },
      { q: "Em qual país fica a Torre Eiffel?", options: ["França", "Itália", "Espanha", "Alemanha"], correct: 0, emoji: "🗼" },
      { q: "Qual linha imaginária divide a Terra em Norte e Sul?", options: ["Linha do Equador", "Meridiano de Greenwich", "Trópico de Câncer", "Círculo Polar"], correct: 0, emoji: "🌐" },
      { q: "Qual bioma brasileiro é chamado de \"pulmão do mundo\"?", options: ["Floresta Amazônica", "Cerrado", "Caatinga", "Pantanal"], correct: 0, emoji: "🌳" },
    ],
  },
  ciencias: {
    label: "🔬 Ciências",
    questions: [
      { q: "Quantos planetas tem o Sistema Solar?", options: ["8", "9", "7", "10"], correct: 0, emoji: "🪐" },
      { q: "Qual é o planeta mais próximo do Sol?", options: ["Mercúrio", "Vênus", "Terra", "Marte"], correct: 0, emoji: "☀️" },
      { q: "De que cor é o céu num dia limpo?", options: ["Azul", "Verde", "Vermelho", "Roxo"], correct: 0, emoji: "🌤️" },
      { q: "Qual é o estado da água quando ela congela?", options: ["Sólido", "Líquido", "Gasoso", "Plasma"], correct: 0, emoji: "🧊" },
      { q: "Quantos ossos tem o corpo de um adulto, aproximadamente?", options: ["206", "100", "300", "500"], correct: 0, emoji: "🦴" },
      { q: "Qual órgão bombeia o sangue pelo corpo?", options: ["Coração", "Pulmão", "Fígado", "Estômago"], correct: 0, emoji: "❤️" },
      { q: "Qual gás os seres humanos precisam respirar para viver?", options: ["Oxigênio", "Gás carbônico", "Nitrogênio", "Hélio"], correct: 0, emoji: "💨" },
      { q: "O que as plantas usam a luz do sol para fazer?", options: ["Fotossíntese", "Respiração", "Digestão", "Fermentação"], correct: 0, emoji: "🌱" },
      { q: "Qual é o planeta conhecido como \"planeta vermelho\"?", options: ["Marte", "Vênus", "Júpiter", "Saturno"], correct: 0, emoji: "🔴" },
      { q: "Quantos sentidos básicos o ser humano tem?", options: ["5", "4", "6", "3"], correct: 0, emoji: "👀" },
      { q: "O que um termômetro mede?", options: ["Temperatura", "Peso", "Altura", "Velocidade"], correct: 0, emoji: "🌡️" },
      { q: "Qual é o maior planeta do Sistema Solar?", options: ["Júpiter", "Saturno", "Netuno", "Terra"], correct: 0, emoji: "🪐" },
      { q: "De onde vem a luz que ilumina a Terra de dia?", options: ["Sol", "Lua", "Estrelas", "Nuvens"], correct: 0, emoji: "☀️" },
    ],
  },
  cultura: {
    label: "🎨 Cultura e Arte",
    questions: [
      { q: "Quantas cores tem o arco-íris?", options: ["7", "5", "6", "8"], correct: 0, emoji: "🌈" },
      { q: "Qual instrumento tem teclas pretas e brancas?", options: ["Piano", "Violão", "Flauta", "Tambor"], correct: 0, emoji: "🎹" },
      { q: "Quais são as cores primárias?", options: ["Azul, vermelho e amarelo", "Verde, laranja e roxo", "Preto, branco e cinza", "Rosa, azul e verde"], correct: 0, emoji: "🎨" },
      { q: "Quantas cordas tem um violão tradicional?", options: ["6", "4", "8", "5"], correct: 0, emoji: "🎸" },
      { q: "Onde costumamos ver pinturas e esculturas famosas?", options: ["Museu", "Hospital", "Supermercado", "Aeroporto"], correct: 0, emoji: "🖼️" },
      { q: "Qual destes é um instrumento de percussão?", options: ["Tambor", "Violino", "Flauta", "Piano"], correct: 0, emoji: "🥁" },
      { q: "O que um pintor usa para misturar as tintas?", options: ["Paleta", "Só o pincel", "Régua", "Tesoura"], correct: 0, emoji: "🎨" },
      { q: "Qual dança é famosa no Carnaval brasileiro?", options: ["Samba", "Balé", "Tango", "Valsa"], correct: 0, emoji: "💃" },
      { q: "Quantas notas musicais existem na escala básica?", options: ["7", "5", "8", "6"], correct: 0, emoji: "🎵" },
      { q: "Qual é a profissão de quem escreve livros?", options: ["Escritor", "Pintor", "Músico", "Ator"], correct: 0, emoji: "✍️" },
      { q: "Quando é comemorado o Dia das Crianças no Brasil?", options: ["12 de outubro", "25 de dezembro", "7 de setembro", "1º de junho"], correct: 0, emoji: "🎈" },
      { q: "Qual boneco de madeira vira menino de verdade numa história famosa?", options: ["Pinóquio", "Peter Pan", "Pinguim", "Patinho Feio"], correct: 0, emoji: "🪵" },
      { q: "Qual desses é um instrumento de corda?", options: ["Violão", "Tambor", "Flauta", "Pandeiro"], correct: 0, emoji: "🎻" },
    ],
  },
  curiosidades: {
    label: "🍎 Curiosidades",
    questions: [
      { q: "Quantos dias tem uma semana?", options: ["7", "5", "6", "8"], correct: 0, emoji: "📅" },
      { q: "Quantos meses tem um ano?", options: ["12", "10", "11", "13"], correct: 0, emoji: "🗓️" },
      { q: "Como se chama a primeira refeição do dia?", options: ["Café da manhã", "Almoço", "Jantar", "Lanche"], correct: 0, emoji: "🥐" },
      { q: "De que fruta se faz o suco de laranja?", options: ["Laranja", "Maçã", "Uva", "Limão"], correct: 0, emoji: "🍊" },
      { q: "Qual utensílio usamos para cortar papel?", options: ["Tesoura", "Régua", "Lápis", "Borracha"], correct: 0, emoji: "✂️" },
      { q: "Quantos lados tem um triângulo?", options: ["3", "4", "5", "2"], correct: 0, emoji: "🔺" },
      { q: "Quantos lados tem um quadrado?", options: ["4", "3", "5", "6"], correct: 0, emoji: "⬜" },
      { q: "Em qual estação as folhas das árvores costumam cair?", options: ["Outono", "Primavera", "Verão", "Inverno"], correct: 0, emoji: "🍂" },
      { q: "Qual é o oposto de \"quente\"?", options: ["Frio", "Molhado", "Rápido", "Alto"], correct: 0, emoji: "🥶" },
      { q: "Quantas horas tem um dia?", options: ["24", "12", "48", "20"], correct: 0, emoji: "⏰" },
      { q: "O que usamos para escovar os dentes?", options: ["Escova de dente", "Pente", "Toalha", "Sabonete"], correct: 0, emoji: "🪥" },
      { q: "Qual animal de estimação é conhecido por latir?", options: ["Cachorro", "Gato", "Peixe", "Pássaro"], correct: 0, emoji: "🐶" },
      { q: "Quantos dedos temos em uma mão?", options: ["5", "4", "6", "10"], correct: 0, emoji: "🖐️" },
    ],
  },
};

const CATEGORY_LABELS = Object.assign(
  { mix: "✨ Misturado" },
  Object.fromEntries(Object.entries(QUESTION_BANK).map(([key, val]) => [key, val.label]))
);

function getQuestionsByCategories(categoryKeys) {
  let keys = categoryKeys;
  if (!keys || keys.length === 0 || keys.includes("mix")) {
    keys = Object.keys(QUESTION_BANK);
  }
  let pool = [];
  keys.forEach((k) => {
    if (QUESTION_BANK[k]) pool = pool.concat(QUESTION_BANK[k].questions);
  });
  return pool;
}
