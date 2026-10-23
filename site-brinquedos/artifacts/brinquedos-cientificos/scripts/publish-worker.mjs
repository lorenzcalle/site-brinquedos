#!/usr/bin/env node
/**
 * Worker do botão "Publicar" do /admin. Roda no cron a cada minuto:
 *
 *   * * * * * cd <app> && node scripts/publish-worker.mjs >> ~/.local/state/bc-site/publish.log 2>&1
 *
 * 1. Lê o pedido mais novo em `publish_requests` (chave anon — a tabela é só id/horário).
 * 2. Se for mais novo que o último atendido, roda scripts/publicar.sh (build sem
 *    derrubar o site).
 * 3. Escreve dist/public/publish-status.json, que o /admin lê para mostrar
 *    "Na fila / Publicando / Publicado às …".
 *
 * Pedidos feitos durante um build ficam para a próxima volta do cron. O estado fica em
 * ~/.local/state/bc-site/publish.json (fora do dist, que é apagado a cada build).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_DIR = path.join(os.homedir(), ".local/state/bc-site");
const STATE_FILE = path.join(STATE_DIR, "publish.json");
const STATUS_FILE = path.join(APP, "dist/public/publish-status.json");

const env = Object.fromEntries(
  fs.readFileSync(path.join(APP, ".env"), "utf8").split("\n").filter(l => l.includes("="))
    .map(l => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const log = (...a) => console.log(new Date().toISOString(), ...a);

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); }
  catch { return { state: "idle", handledId: 0, startedAt: null, finishedAt: null, ok: null, message: null }; }
}

function writeState(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
  try { fs.writeFileSync(STATUS_FILE, JSON.stringify(s)); } catch { /* dist ausente: o próximo build recria */ }
}

async function latestRequest() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/publish_requests?select=id,requested_at&order=id.desc&limit=1`;
  const r = await fetch(url, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` } });
  if (!r.ok) throw new Error(`publish_requests: HTTP ${r.status} ${await r.text()}`);
  return (await r.json())[0] ?? null;
}

let state = readState();
// Um build interrompido (servidor reiniciado, timeout) não pode ficar "publicando" para sempre.
if (state.state === "building" && Date.now() - Date.parse(state.startedAt) > 20 * 60_000) {
  state = { ...state, state: "idle", ok: false, message: "O build anterior não terminou." };
}

const req = await latestRequest().catch(e => { log("erro ao ler a fila:", e.message); return null; });

if (!req || req.id <= state.handledId || state.state === "building") {
  // Nada novo: só garante que o status exista no dist (um `pnpm build` manual o apaga).
  if (!fs.existsSync(STATUS_FILE)) writeState(state);
  process.exit(0);
}

log(`pedido #${req.id} (${req.requested_at}) — publicando`);
writeState({ ...state, state: "building", handledId: req.id, startedAt: new Date().toISOString() });

const r = spawnSync("bash", [path.join(APP, "scripts/publicar.sh")], {
  cwd: APP, encoding: "utf8", timeout: 15 * 60_000, maxBuffer: 50 * 1024 * 1024,
});
const ok = r.status === 0;
const tail = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n");
log(ok ? "ok" : `falhou (status ${r.status}, ${r.error?.message ?? r.signal ?? ""})\n${tail}`);

writeState({
  ...readState(),
  state: "idle",
  handledId: req.id,
  finishedAt: new Date().toISOString(),
  ok,
  message: ok ? null : "O build falhou. O site continua com a versão anterior.",
});
