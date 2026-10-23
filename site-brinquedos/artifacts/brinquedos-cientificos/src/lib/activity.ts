import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SITE_TEXT_PAGES } from "@/lib/site-texts";

// Registro de alterações (tabela activity_log, preenchida por gatilhos no banco — ver
// site-brinquedos/supabase/painel-acesso.sql). Aqui só se lê e se escreve a frase.

export type Activity = {
  id: number;
  at: string;
  actor: string | null;
  actor_name: string | null;
  action: string;
  entity: string;
  record_id: string | null;
  title: string | null;
};

const ENTITY: Record<string, string> = {
  brinquedo: "o brinquedo", evento: "o evento", video: "o vídeo", manual: "o manual", pessoa: "", grupo: "o grupo",
  texto: "o texto", envio: "o envio", site: "o site", acesso: "",
};

const TEXT_LABELS = Object.fromEntries(SITE_TEXT_PAGES.flatMap(p => p.texts.map(t => [t.key, `${t.label} (${p.page})`])));

// Nome de quem fez: o nome da conta, se houver; senão o e-mail; sem login = sistema.
export const actorLabel = (a: Pick<Activity, "actor" | "actor_name">, names: Record<string, string> = {}) =>
  (a.actor && names[a.actor.toLowerCase()]) || (a.actor_name && a.actor_name !== a.actor ? a.actor_name : null) || a.actor || "Sistema";

export function describe(a: Activity, names: Record<string, string> = {}): { who: string; what: string } {
  if (a.entity === "envio" && a.action === "recebeu") return { who: "Formulário do site", what: `recebeu o envio “${a.title ?? ""}”` };
  if (a.entity === "site") return { who: actorLabel(a, names), what: "publicou o site (Google e prévias de link)" };
  const title = a.entity === "texto" ? TEXT_LABELS[a.title ?? ""] ?? a.title : a.title;
  // Texto igual ao original apaga a linha do banco: para quem lê, é "restaurou o original".
  if (a.entity === "texto" && a.action === "excluiu") return { who: actorLabel(a, names), what: `voltou ao original o texto “${title}”` };
  const what = [a.action, ENTITY[a.entity] ?? a.entity, title && `“${title}”`].filter(Boolean).join(" ");
  return { who: actorLabel(a, names), what };
}

const fmtFull = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const fullDate = (iso: string) => fmtFull.format(new Date(iso));

// "agora", "há 5 min", "há 3 h", "ontem", "há 4 dias", "12/08/2026"
export function timeAgo(iso: string) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

export async function fetchActivity(limit = 20): Promise<Activity[]> {
  const { data, error } = await supabase.from("activity_log").select("*").order("at", { ascending: false }).limit(limit);
  return error ? [] : (data as Activity[]);
}

// Nomes das contas (e-mail → nome) para mostrar "Cristina" em vez do e-mail.
export type AdminUser = { id: string; email: string; name: string; created_at: string; last_sign_in_at: string | null; must_change_password: boolean };

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("admin_users");
  return error ? [] : (data as AdminUser[]);
}

export const namesByEmail = (users: AdminUser[]) =>
  Object.fromEntries(users.filter(u => u.name).map(u => [u.email.toLowerCase(), u.name]));

// Última alteração de um registro, para o rodapé das janelas de edição.
export function useLastChange(entity: string, id: string | null | undefined) {
  const [last, setLast] = useState<Activity | null>(null);
  useEffect(() => {
    setLast(null);
    if (!id) return;
    supabase.from("activity_log").select("*").eq("entity", entity).eq("record_id", id)
      .neq("action", "excluiu").order("at", { ascending: false }).limit(1)
      .then(({ data }) => setLast((data?.[0] as Activity) ?? null));
  }, [entity, id]);
  return last;
}
