import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

/**
 * Materializa cada rota estatica do SPA como um arquivo real em dist/public.
 *
 * Por que: o nginx nao tem como saber quais caminhos o React considera validos.
 * Antes isso era uma lista escrita a mao no `location ~ ^/(sobre|portfolio|...)`
 * da config -- toda pagina nova exigia editar o nginx, e quando alguem esquecia
 * (foi o caso de /agente) a rota subia respondendo 404 mesmo renderizando certo.
 *
 * Depois deste plugin, `/agente` vira `dist/public/agente/index.html`: um arquivo
 * de verdade, que o nginx entrega com 200 sem lista nenhuma. E o mais importante,
 * URL que nao existe continua caindo no `=404` -- ou seja, o 404 real que resolveu
 * o "Erro soft 404" do Google Search Console segue valendo.
 *
 * Rotas com parametro (`/portfolio/:id`) NAO dao para materializar: o id vem do
 * banco e muda. Elas seguem precisando de um `location` proprio no nginx, e o
 * plugin lista essas no final do build justamente para isso nao passar batido.
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
      const shell = fs.readFileSync(indexHtml);

      const dynamic: string[] = [];
      const written: string[] = [];

      for (const route of paths) {
        // "/" ja e o proprio index.html na raiz.
        if (route === "/") continue;
        // ":id" / "*" dependem de dados: ficam por conta do nginx.
        if (route.includes(":") || route.includes("*")) {
          dynamic.push(route);
          continue;
        }

        const dir = path.join(outDir, route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), shell);
        written.push(route);
      }

      config.logger.info(
        `\x1b[32m✓\x1b[0m ${written.length} rotas materializadas: ${written.join(", ")}`,
      );
      if (dynamic.length > 0) {
        config.logger.info(
          `  \x1b[33m!\x1b[0m rotas dinamicas (precisam de location no nginx): ${dynamic.join(", ")}`,
        );
      }
    },
  };
}
