import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
// @ts-expect-error - .mjs sem tipos, compartilhado com scripts/prerender.mjs
import { ROUTE_META, injectHead } from "./seo-routes.mjs";

/**
 * Materializa cada rota estatica do SPA como um arquivo real em dist/public,
 * com <head> proprio.
 *
 * Por que existe: o nginx nao tem como saber quais caminhos o React considera
 * validos. Antes isso era uma lista escrita a mao no
 * `location ~ ^/(sobre|portfolio|...)` da config -- toda pagina nova exigia
 * editar o nginx, e quando alguem esquecia (foi o caso de /agente) a rota subia
 * respondendo 404 mesmo renderizando certo no navegador.
 *
 * Agora `/agente` vira `dist/public/agente/index.html`: arquivo de verdade, que
 * o nginx entrega com 200 sem lista nenhuma. URL que nao existe segue caindo no
 * `=404` -- o 404 real que resolveu o "Erro soft 404" continua valendo.
 *
 * Alem da pasta, injeta title/description/canonical/Open Graph por rota (vindos
 * de seo-routes.ts). Sem isso as 9 rotas serviam HTML byte-identico, o que o
 * Google trata como paginas duplicadas e vazias.
 *
 * O CORPO ainda sai vazio daqui -- quem preenche e o scripts/prerender.mjs, que
 * roda depois do vite build. Este plugin e a camada de baixo: se o prerender
 * falhar ou for pulado, o site continua no ar com 200 e head correto.
 *
 * Rotas com parametro (`/portfolio/:id`) NAO dao para materializar aqui: o id
 * vem do banco. Elas seguem com `location` proprio no nginx, e o plugin lista
 * essas no fim do build para nao passarem batido.
 */
export function spaRouteDirs(options: { routesFile: string }): Plugin {
  let config: ResolvedConfig;

  return {
    name: "spa-route-dirs",
    apply: "build",

    configResolved(resolved) {
      config = resolved;
    },

    closeBundle() {
      const routesPath = path.resolve(config.root, options.routesFile);
      const source = fs.readFileSync(routesPath, "utf8");

      // <Route path="/sobre" component={About} />
      const paths = [...source.matchAll(/<Route\s+[^>]*path="([^"]+)"/g)].map((m) => m[1]);

      if (paths.length === 0) {
        this.warn(`nenhuma <Route path="..."> encontrada em ${options.routesFile}`);
        return;
      }

      const outDir = config.build.outDir;
      const indexHtml = path.join(outDir, "index.html");
      if (!fs.existsSync(indexHtml)) {
        this.warn(`index.html nao encontrado em ${outDir}; rotas nao materializadas`);
        return;
      }
      const shell = fs.readFileSync(indexHtml, "utf8");

      const dynamic: string[] = [];
      const written: string[] = [];
      const semMeta: string[] = [];

      for (const route of paths) {
        // ":id" / "*" dependem de dados: ficam por conta do prerender + nginx.
        if (route.includes(":") || route.includes("*")) {
          dynamic.push(route);
          continue;
        }

        const meta = ROUTE_META[route];
        if (!meta) semMeta.push(route);

        const html = injectHead(shell, route, meta ?? ROUTE_META["/"]);

        if (route === "/") {
          // a home ja e o index.html da raiz; so reescreve com o head certo
          fs.writeFileSync(indexHtml, html);
        } else {
          const dir = path.join(outDir, route);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "index.html"), html);
        }
        written.push(route);
      }

      config.logger.info(
        `\x1b[32m✓\x1b[0m ${written.length} rotas materializadas com head proprio: ${written.join(", ")}`,
      );
      if (semMeta.length > 0) {
        config.logger.warn(
          `  \x1b[33m!\x1b[0m sem entrada em seo-routes.ts (usando o metadado da home): ${semMeta.join(", ")}`,
        );
      }
      if (dynamic.length > 0) {
        config.logger.info(
          `  \x1b[33m!\x1b[0m rotas dinamicas (location no nginx + prerender): ${dynamic.join(", ")}`,
        );
      }
    },
  };
}

