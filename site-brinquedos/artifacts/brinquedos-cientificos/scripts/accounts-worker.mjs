#!/usr/bin/env node
/**
 * Worker das contas do /admin (aba "Acesso ao painel"). Roda no cron a cada minuto:
 *
 *   * * * * * cd <app> && node scripts/accounts-worker.mjs >> ~/.local/state/bc-site/accounts.log 2>&1
 *
 * O painel não pode criar conta sozinho (precisa da chave secreta do Supabase, que nunca
 * vai para o navegador). Então ele grava um pedido em `account_requests` e este script,
 * no servidor, atende com a chave secreta:
 *   create         → cria a conta com a senha provisória (já confirmada, sem e-mail)
 *   reset_password → troca a senha por uma provisória
 *   remove         → apaga a conta
 * Nos dois primeiros a pessoa é obrigada a criar a própria senha no próximo acesso
 * (user_metadata.must_change_password). A senha provisória é apagada da fila na hora.
 *
 * A chave secreta fica em ~/.config/bc-site/service-role.env (modo 600, fora do git e
 * do site), na linha SUPABASE_SERVICE_ROLE_KEY=...
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readEnv = file => Object.fromEntries(
  fs.readFileSync(file, "utf8").split("\n").filter(l => l.includes("="))
    .map(l => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_BASE = readEnv(path.join(APP, ".env")).VITE_SUPABASE_URL;
const KEY_FILE = path.join(os.homedir(), ".config/bc-site/service-role.env");
const log = (...a) => console.log(new Date().toISOString(), ...a);

if (!fs.existsSync(KEY_FILE)) process.exit(0); // ainda não configurado
const KEY = readEnv(KEY_FILE).SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function api(method, p, body) {
  const r = await fetch(`${URL_BASE}${p}`, { method, headers: { ...headers, Prefer: "return=minimal" }, body: body && JSON.stringify(body) });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) {
    const msg = data?.msg ?? data?.message ?? data?.error_description ?? text;
    throw Object.assign(new Error(`${r.status} ${msg}`), { status: r.status, data });
  }
  return data;
}

const finish = (req, status, message) =>
  api("PATCH", `/rest/v1/account_requests?id=eq.${req.id}`, { status, message, temp_password: null, handled_at: new Date().toISOString() });

const record = (req, action, title) =>
  api("POST", "/rest/v1/activity_log", { actor: req.requested_by, actor_name: req.requested_by, action, entity: "acesso", title })
    .catch(e => log("activity_log:", e.message));

let pending;
try {
  pending = await api("GET", "/rest/v1/account_requests?status=eq.pending&order=id&select=*");
} catch (e) {
  if (e.status === 404 || /account_requests/.test(e.message)) process.exit(0); // SQL ainda não rodado
  log("erro ao ler a fila:", e.message);
  process.exit(1);
}

for (const req of pending ?? []) {
  try {
    if (req.kind === "create") {
      const email = String(req.email ?? "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("E-mail inválido.");
      if (String(req.temp_password ?? "").length < 8) throw new Error("A senha provisória precisa de 8 caracteres ou mais.");
      try {
        await api("POST", "/auth/v1/admin/users", {
          email, password: req.temp_password, email_confirm: true,
          user_metadata: { name: (req.name ?? "").trim(), must_change_password: true },
        });
      } catch (e) {
        if (e.status === 422 || /already|registered|exists/i.test(e.message)) throw new Error("Esse e-mail já tem acesso ao painel.");
        throw e;
      }
      await finish(req, "done", "Conta criada.");
      await record(req, "deu acesso ao painel para", `${req.name || email} (${email})`);
      log(`#${req.id} conta criada: ${email}`);
    } else if (req.kind === "reset_password") {
      if (String(req.temp_password ?? "").length < 8) throw new Error("A senha provisória precisa de 8 caracteres ou mais.");
      const user = await api("GET", `/auth/v1/admin/users/${req.user_id}`);
      await api("PUT", `/auth/v1/admin/users/${req.user_id}`, {
        password: req.temp_password,
        user_metadata: { ...(user.user_metadata ?? {}), must_change_password: true },
      });
      await finish(req, "done", "Senha provisória definida.");
      await record(req, "gerou senha provisória para", user.user_metadata?.name || user.email);
      log(`#${req.id} senha provisória: ${user.email}`);
    } else if (req.kind === "remove") {
      const user = await api("GET", `/auth/v1/admin/users/${req.user_id}`);
      if (user.email?.toLowerCase() === String(req.requested_by ?? "").toLowerCase()) throw new Error("Você não pode remover o próprio acesso.");
      const list = await api("GET", "/auth/v1/admin/users?per_page=1000");
      if ((list.users ?? []).length <= 1) throw new Error("É a última conta com acesso; não dá para remover.");
      await api("DELETE", `/auth/v1/admin/users/${req.user_id}`);
      await finish(req, "done", "Acesso removido.");
      await record(req, "removeu o acesso de", user.user_metadata?.name || user.email);
      log(`#${req.id} acesso removido: ${user.email}`);
    } else {
      throw new Error("Pedido desconhecido.");
    }
  } catch (e) {
    log(`#${req.id} erro:`, e.message);
    await finish(req, "error", e.message.replace(/^\d{3} /, "")).catch(err => log("falha ao marcar erro:", err.message));
  }
}
