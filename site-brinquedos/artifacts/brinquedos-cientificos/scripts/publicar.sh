#!/usr/bin/env bash
# Build de produção SEM derrubar o site (`pnpm build:site`).
#
# O `pnpm build` comum apaga dist/public logo no começo (emptyOutDir) e só termina de
# escrever ~1 minuto depois (vite + prerender) — nesse intervalo o nginx serve 403/404.
# Aqui o build vai para dist/next/public e só no fim troca de lugar com dist/public.
#
# Usado pelo botão "Publicar" do /admin (via scripts/publish-worker.mjs, no cron) e no
# deploy manual. O flock impede dois builds ao mesmo tempo.
set -euo pipefail
cd "$(dirname "$0")/.."

exec 9>/tmp/bc-site-build.lock
flock -w 900 9

rm -rf dist/next dist/old
export BUILD_OUT_DIR=dist/next/public
node_modules/.bin/vite build --config vite.config.ts
node scripts/prerender.mjs

# Mantém o status da publicação (escrito pelo worker) na pasta nova.
[ -f dist/public/publish-status.json ] && cp dist/public/publish-status.json dist/next/public/ || true

mv dist/public dist/old
mv dist/next/public dist/public
rm -rf dist/old dist/next
echo "publicar.sh: dist/public trocado em $(date '+%F %T')"
