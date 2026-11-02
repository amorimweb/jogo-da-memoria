/* Service worker do "Cantinho dos Jogos" — deixa o app (e os jogos no
   modo local) funcionando offline depois da primeira visita.
   Estratégia: cache-first para o "app shell" (html/js/css/imagens e os
   scripts de fonte/Firebase), com atualização em segundo plano
   (stale-while-revalidate). Chamadas ao Firebase Realtime Database/Auth
   (dados ao vivo das salas online) nunca são cacheadas — sempre vão
   direto pra rede. */

const CACHE_VERSION = "v3";
const CACHE_NAME = "cantinho-dos-jogos-" + CACHE_VERSION;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/assets/favicon.ico",
  "/assets/icon.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/apple-touch-icon.png",
  "/assets/playground-bg.png",

  "/shared/firebase-config.js",
  "/shared/online.js",

  "/memoria/index.html",
  "/memoria/icons.js",
  "/memoria/game.js",

  "/trilha/index.html",
  "/trilha/game.js",

  "/silabas/index.html",
  "/silabas/words.js",
  "/silabas/game.js",

  "/cores-formas/index.html",
  "/cores-formas/game.js",

  "/quebra-cabeca/index.html",
  "/quebra-cabeca/game.js",

  "/numeros/index.html",
  "/numeros/game.js",

  "/caca-palavras/index.html",
  "/caca-palavras/words.js",
  "/caca-palavras/game.js",

  "/jogo-da-velha/index.html",
  "/jogo-da-velha/game.js",

  "/labirinto/index.html",
  "/labirinto/game.js",

  "/mimica/index.html",
  "/mimica/words.js",
  "/mimica/game.js",

  "/quiz-familia/index.html",
  "/quiz-familia/questions.js",
  "/quiz-familia/game.js",

  "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap",
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js",
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js",
];

// Nunca cachear dados ao vivo do Firebase (salas online, auth).
function isLiveFirebaseRequest(url) {
  return (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("firebasedatabase.app") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com") ||
    url.hostname.includes("accounts.google.com")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {
            // Um recurso opcional (ex: quiz-familia ainda não publicado) não
            // pode travar a instalação de todo o resto.
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isLiveFirebaseRequest(url)) return; // deixa passar direto pra rede

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: false });

      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        // Stale-while-revalidate: devolve o que já temos na hora e
        // atualiza o cache em segundo plano pra próxima visita.
        networkFetch.catch(() => {});
        return cached;
      }

      const fresh = await networkFetch;
      if (fresh) return fresh;

      if (request.mode === "navigate") {
        const offline = await cache.match("/offline.html");
        if (offline) return offline;
      }
      return new Response("Offline", { status: 503, statusText: "Offline" });
    })
  );
});
