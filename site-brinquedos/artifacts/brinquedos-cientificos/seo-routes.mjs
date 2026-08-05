/**
 * Metadados por rota + montagem do <head>. Usado so em tempo de BUILD.
 *
 * Ate 05/08/2026 as 9 rotas serviam HTML byte-identico: mesmo <title>, sem
 * description, sem canonical e sem Open Graph (o opengraph.jpg estava no
 * dist/public sem ninguem referenciar). Para o Google isso e um punhado de
 * paginas duplicadas e vazias -- foi o que reprovou /portfolio no teste ao
 * vivo do Search Console.
 *
 * E .mjs de proposito: quem importa e o vite-plugin-spa-route-dirs.ts (via
 * esbuild) e o scripts/prerender.mjs (Node puro). Um arquivo so, sem passo de
 * compilacao no meio.
 *
 * Rota nova: adicionar aqui. Se esquecer, o build avisa e a rota cai no
 * metadado da home em vez de quebrar.
 */

export const SITE_URL = "https://bc.san.uri.br";
export const SITE_NAME = "Brinquedos Científicos";
export const OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

/**
 * @typedef {object} RouteMeta
 * @property {string} title
 * @property {string} description
 * @property {number} priority        prioridade no sitemap.xml
 * @property {boolean} [noindex]      fora do sitemap e com meta noindex (ex.: /admin)
 */

/** @type {Record<string, RouteMeta>} */
export const ROUTE_META = {
  "/": {
    title: "Brinquedos Científicos — URI Campus Santo Ângelo",
    description:
      "Projetos lúdicos que ensinam conceitos científicos complexos de forma simples, tátil e divertida. Portfólio, tutoriais em vídeo e materiais do projeto da URI – Santo Ângelo.",
    priority: 1.0,
  },
  "/sobre": {
    title: "Sobre o Projeto — Brinquedos Científicos",
    description:
      "O que são brinquedos científicos, como o projeto nasceu na URI – Campus Santo Ângelo e de que forma leva ciência às escolas com apoio do CNPq/MCTI.",
    priority: 0.8,
  },
  "/portfolio": {
    title: "Portfólio de Projetos — Brinquedos Científicos",
    description:
      "Galeria dos brinquedos científicos já construídos no projeto, com os conceitos que cada um ensina, a lista de materiais e o guia de montagem.",
    priority: 0.9,
  },
  "/materiais": {
    title: "Tutoriais em Vídeo — Brinquedos Científicos",
    description:
      "Tutoriais em vídeo para montar brinquedos científicos passo a passo, organizados por categoria e nível de dificuldade.",
    priority: 0.8,
  },
  "/agente": {
    title: "Agente BNCC Computação — Brinquedos Científicos",
    description:
      "Ferramenta que gera atividades já alinhadas à BNCC Computação, trazendo a habilidade oficial (código e texto) e mostrando como ela conecta com a sua disciplina.",
    priority: 0.9,
  },
  "/equipe": {
    title: "Nossa Equipe — Brinquedos Científicos",
    description:
      "Professores, pesquisadores e estudantes da URI – Campus Santo Ângelo que desenvolvem o projeto Brinquedos Científicos.",
    priority: 0.6,
  },
  "/eventos": {
    title: "Eventos e Oficinas — Brinquedos Científicos",
    description:
      "Oficinas, mostras e eventos do projeto, com regulamento, fichas e materiais para as escolas participantes da Mostra de Brinquedos Científicos.",
    priority: 0.7,
  },
  "/contato": {
    title: "Fale Conosco — Brinquedos Científicos",
    description:
      "Entre em contato com o projeto Brinquedos Científicos da URI – Campus Santo Ângelo. Endereço, e-mail e formulário de mensagem.",
    priority: 0.6,
  },
  "/submit": {
    title: "Envie seu Brinquedo — Brinquedos Científicos",
    description:
      "Compartilhe sua criação com a comunidade: envie seu brinquedo científico para ser revisado e publicado no portfólio do projeto.",
    priority: 0.7,
  },
  "/admin": {
    title: "Administração — Brinquedos Científicos",
    description: "Área restrita de administração do projeto.",
    priority: 0,
    noindex: true,
  },
};

/**
 * Metadado de uma pagina de brinquedo (/portfolio/:id), montado com dados do banco.
 * @param {{id: string, title: string, description?: string | null}} toy
 * @returns {RouteMeta}
 */
export function toyMeta(toy) {
  const clean = (toy.description ?? "").replace(/\s+/g, " ").trim();
  return {
    title: `${toy.title} — Brinquedos Científicos`,
    description: clean
      ? clean.length > 160
        ? `${clean.slice(0, 157).trimEnd()}...`
        : clean
      : `${toy.title}: brinquedo científico do portfólio do projeto, com os conceitos que ensina e a lista de materiais.`,
    priority: 0.5,
  };
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Troca o <title> do shell e insere description/canonical/OG antes de </head>.
 * @param {string} shell   conteudo do index.html gerado pelo vite
 * @param {string} route   caminho da rota, com barra inicial
 * @param {RouteMeta} meta
 * @returns {string}
 */
export function injectHead(shell, route, meta) {
  const url = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;

  // Idempotente: o prerender monta as paginas /portfolio/:id a partir do
  // index.html da raiz, que ja passou por aqui com o metadado da home. Sem
  // limpar antes, a pagina do brinquedo saia com description e canonical
  // duplicados -- e o canonical errado (apontando para a home) e justamente
  // o tipo de coisa que faz o Google descartar a pagina.
  const limpo = shell.replace(
    /^[ \t]*<(?:meta (?:name="(?:description|robots|twitter:[\w-]+)"|property="og:[\w:]+")|link rel="canonical")[^>]*>\n?/gm,
    "",
  );

  const tags = [
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    meta.noindex ? `<meta name="robots" content="noindex, nofollow" />` : "",
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ]
    .filter(Boolean)
    .map((t) => `    ${t}`)
    .join("\n");

  return limpo
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/\s*<\/head>/, `\n${tags}\n  </head>`);
}
