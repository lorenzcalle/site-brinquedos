#!/usr/bin/env node
/**
 * Prerender: preenche o CORPO do HTML de cada rota, depois do `vite build`.
 *
 * O problema que isto resolve: o site e um SPA React, entao o HTML servido era
 * so `<div id="root"></div>`. Todo o texto aparecia apenas depois do JS rodar.
 * O Google ate executa JS, mas trata pagina de HTML vazio como fina/duplicada --
 * foi o que reprovou /portfolio no teste ao vivo do Search Console em 30/07/2026.
 *
 * Como funciona: sobe um servidor estatico em cima do proprio dist/public
 * (imitando o try_files do nginx), visita cada rota com o Chromium headless e
 * grava de volta o DOM ja renderizado. O <head> por rota ja veio do
 * vite-plugin-spa-route-dirs; aqui entra o conteudo.
 *
 * Nao e SSR: o React continua montando no cliente e substituindo o conteudo.
 * O HTML gravado e um retrato do build -- serve para robo e para preview de
 * link, nao como fonte de verdade dos dados.
 *
 * Se o Chromium nao estiver disponivel, o script AVISA E SAI COM 0 de proposito:
 * o build nao pode quebrar por causa disso. Sem prerender o site continua no ar,
 * com as rotas respondendo 200 e o head correto -- so o corpo volta a ser vazio.
 *
 * Uso: node scripts/prerender.mjs   (roda automaticamente no `pnpm build`)
 */

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { ROUTE_META, SITE_URL, toyMeta, injectHead } from "../seo-routes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "dist/public");

// ---------------------------------------------------------------- Chromium

/** Procura o Chromium do Playwright (ja instalado na maquina) ou um do sistema. */
function findChromium() {
  const candidates = [
    process.env.CHROMIUM_BIN,
    ...expandGlob(`${process.env.HOME}/.cache/ms-playwright`, [
      "chromium-*/chrome-linux64/chrome",
      "chromium-*/chrome-linux/chrome",
      "chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell",
    ]),
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ].filter(Boolean);

  for (const bin of candidates) {
    if (bin && fs.existsSync(bin)) return bin;
  }
  return null;
}

function expandGlob(base, patterns) {
  if (!fs.existsSync(base)) return [];
  const dirs = fs.readdirSync(base);
  const out = [];
  for (const p of patterns) {
    const [prefix, ...rest] = p.split("/");
    const re = new RegExp(`^${prefix.replace("*", ".*")}$`);
    for (const d of dirs) {
      if (re.test(d)) out.push(path.join(base, d, ...rest));
    }
  }
  return out;
}

/** Testa se o binario realmente executa (faltar libatk & cia. e comum). */
async function chromiumRuns(bin) {
  const r = await spawnSync(bin, ["--version"]);
  return r.ok;
}

function spawnSync(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ ok: code === 0, out, err }));
    p.on("error", (e) => resolve({ ok: false, out: "", err: String(e) }));
  });
}

// ------------------------------------------------------- servidor estatico

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

/** Imita o `try_files $uri $uri/index.html $uri/ =404` do nginx. */
function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const candidates = [
      path.join(OUT_DIR, urlPath),
      path.join(OUT_DIR, urlPath, "index.html"),
    ];
    for (const file of candidates) {
      if (!file.startsWith(OUT_DIR)) break; // path traversal
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
        return fs.createReadStream(file).pipe(res);
      }
    }
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(path.join(OUT_DIR, "index.html")));
  });
  // porta 0 = o SO escolhe uma livre; porta fixa colidia com um `vite preview`
  // esquecido rodando na maquina.
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })),
  );
}

// ------------------------------------------------------------- prerender

async function renderRoute(bin, port, route) {
  const url = `http://127.0.0.1:${port}${route}`;
  const r = await spawnSync(bin, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--virtual-time-budget=10000",
    "--run-all-compositor-stages-before-draw",
    "--dump-dom",
    url,
  ]);
  if (!r.ok || !r.out.includes("<html")) return null;
  return r.out;
}

/** O dump vem sem doctype e as vezes sem o \n final. */
function finish(html) {
  const body = html.trimEnd();
  return body.startsWith("<!DOCTYPE") ? `${body}\n` : `<!DOCTYPE html>\n${body}\n`;
}

/**
 * So aceita o dump se o React realmente montou algo dentro do #root -- senao
 * gravariamos por cima do shell um HTML igualmente vazio, so que maior.
 *
 * Nao tenta casar o </div> de fechamento: o conteudo do React tem dezenas de
 * divs aninhadas e qualquer regex "ate o fechamento" erra o alvo.
 */
function looksRendered(html) {
  if (/<div id="root">\s*<\/div>/.test(html)) return false;
  const i = html.indexOf('<div id="root">');
  return i !== -1 && html.length - i > 500;
}

// ------------------------------------------------------------- brinquedos

/** Le VITE_* do .env sem depender de dotenv. */
function readEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function fetchToys() {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("  ! .env sem credenciais do Supabase; /portfolio/:id fica de fora");
    return [];
  }
  try {
    const res = await fetch(
      `${url}/rest/v1/toys?select=id,title,description&status=eq.approved`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`  ! nao consegui listar os brinquedos (${e.message}); /portfolio/:id fica de fora`);
    return [];
  }
}

/**
 * Escreve /portfolio/_brinquedo.html: o que o nginx serve quando o brinquedo foi
 * cadastrado no Supabase depois do ultimo build (portanto ainda sem pasta).
 * Sem canonical de proposito -- assim o Google se auto-canonicaliza na URL certa
 * em vez de herdar o canonical da home.
 */
function writeToyFallback(shell) {
  const html = injectHead(shell, "/portfolio", {
    title: "Brinquedo do Portfólio — Brinquedos Científicos",
    description:
      "Brinquedo científico do portfólio do projeto: os conceitos que ensina, a lista de materiais e o guia de montagem.",
    priority: 0.5,
  }).replace(/^[ \t]*<link rel="canonical"[^>]*>\n?/gm, "");

  fs.writeFileSync(path.join(OUT_DIR, "portfolio", "_brinquedo.html"), html);
}

// --------------------------------------------------------------- sitemap

function writeSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      ({ route, priority }) =>
        `  <url><loc>${SITE_URL}${route === "/" ? "/" : route}</loc>` +
        `<lastmod>${today}</lastmod><priority>${priority.toFixed(1)}</priority></url>`,
    )
    .join("\n");

  fs.writeFileSync(
    path.join(OUT_DIR, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  console.log(`✓ sitemap.xml com ${routes.length} URLs (lastmod ${today})`);
}

// ------------------------------------------------------------------ main

async function main() {
  if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) {
    console.error("dist/public/index.html nao existe — rode o vite build antes.");
    process.exit(1);
  }

  // rotas estaticas indexaveis, na ordem de seo-routes.ts
  const staticRoutes = Object.entries(ROUTE_META)
    .filter(([, m]) => !m.noindex)
    .map(([route, m]) => ({ route, priority: m.priority }));

  const toys = await fetchToys();
  const toyRoutes = toys.map((t) => ({ route: `/portfolio/${t.id}`, priority: 0.5 }));

  // 1) paginas de brinquedo: só o head proprio, SEM prerender.
  //
  // Escrever esses arquivos custa milissegundos, entao escala para quantos
  // brinquedos existirem. Ja o prerender abre um Chromium por pagina (~4s cada),
  // e o portfolio cresce -- por isso ele fica so nas rotas fixas, e o build tem
  // tempo constante independente do tamanho do portfolio.
  //
  // O que substitui o prerender aqui: /portfolio E prerenderizado, entao os
  // links de todos os brinquedos ficam no HTML estatico. O Google entra no
  // portfolio, acha os links sem rodar JS, e visita cada brinquedo -- que ja tem
  // title/description/canonical proprios. Indexacao individual sem pagar Chromium
  // por brinquedo. (PRERENDER_TOYS=1 força o prerender deles tambem, se um dia
  // fizer falta.)
  //
  // injectHead limpa o metadado anterior antes de escrever o novo, entao dá
  // para partir do index.html da raiz mesmo ele ja tendo o head da home.
  const shell = fs.readFileSync(path.join(OUT_DIR, "index.html"), "utf8");
  for (const toy of toys) {
    const dir = path.join(OUT_DIR, "portfolio", toy.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "index.html"),
      injectHead(shell, `/portfolio/${toy.id}`, toyMeta(toy)),
    );
  }
  if (toys.length) console.log(`✓ ${toys.length} paginas /portfolio/:id com head proprio`);

  // Rede de seguranca para brinquedo cadastrado DEPOIS do ultimo build: sem este
  // arquivo o nginx cairia no index.html da raiz, cujo canonical aponta para a
  // home -- e o Google descartaria o brinquedo como copia da home. Aqui ele fica
  // com metadado generico e sem canonical, para o Google se auto-canonicalizar.
  writeToyFallback(shell);

  // 2) sitemap (independe do Chromium)
  writeSitemap([...staticRoutes, ...toyRoutes]);

  // 3) prerender do corpo
  const bin = findChromium();
  if (!bin) {
    console.warn("\n! Chromium nao encontrado — prerender pulado (site continua funcionando).");
    console.warn("  Instale com: npx playwright install chromium\n");
    return;
  }
  if (!(await chromiumRuns(bin))) {
    console.warn(`\n! Chromium achado mas nao executa: ${bin}`);
    console.warn("  Faltam bibliotecas do sistema. Rode:");
    console.warn("  sudo apt-get install -y libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \\");
    console.warn("      libatspi2.0-0t64 libcairo2 libcups2t64 libpango-1.0-0 libxdamage1");
    console.warn("  Prerender pulado — site continua funcionando, so o corpo do HTML fica vazio.\n");
    return;
  }

  const { server, port } = await startServer();
  const alvos = process.env.PRERENDER_TOYS
    ? [...staticRoutes, ...toyRoutes]
    : staticRoutes;
  let ok = 0;
  const falhas = [];

  try {
    for (const { route } of alvos) {
      const html = await renderRoute(bin, port, route);
      if (!html || !looksRendered(html)) {
        falhas.push(route);
        continue;
      }
      const file =
        route === "/"
          ? path.join(OUT_DIR, "index.html")
          : path.join(OUT_DIR, route, "index.html");
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, finish(html));
      ok++;
      process.stdout.write(`\r  prerender: ${ok}/${alvos.length}   `);
    }
  } finally {
    server.close();
  }

  console.log(`\r✓ ${ok}/${alvos.length} rotas com conteudo no HTML          `);
  if (falhas.length) {
    console.warn(`  ! sem conteudo (ficaram com o shell): ${falhas.join(", ")}`);
  }
}

await main();
