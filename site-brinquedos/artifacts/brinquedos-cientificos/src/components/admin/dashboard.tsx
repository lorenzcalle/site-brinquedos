import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type EventRow, isPast, today } from "@/lib/events";
import { type Toy } from "@/lib/types";
import { HOME_FEATURED_SLOTS } from "@/lib/toys";
import { History, LifeBuoy, Inbox, Puzzle, Video, CalendarDays, AlertTriangle, Info, Plus, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Section } from "@/pages/admin";
import { Loading, SectionHeader, SubHeading, btn } from "./ui";
import { type Activity, describe, fetchActivity, fetchAdminUsers, fullDate, namesByEmail, timeAgo } from "@/lib/activity";

type Alert = { tone: "warn" | "info"; text: string; action: string; go: Section };

const daysUntil = (d: string) =>
  Math.round((new Date(`${d}T12:00:00Z`).getTime() - new Date(`${today()}T12:00:00Z`).getTime()) / 86_400_000);

// Tela inicial do painel: o que precisa de atenção, números e atalhos.
export function Dashboard({ go }: { go: (s: Section, startNew?: boolean) => void }) {
  const [loading, setLoading] = useState(true);
  const [toys, setToys] = useState<Toy[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [videos, setVideos] = useState(0);
  const [pending, setPending] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      supabase.from("toys").select("id, title, featured, guide_url").eq("status", "approved"),
      supabase.from("events").select("*"),
      supabase.from("materials").select("id", { count: "exact", head: true }),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([t, e, m, s]) => {
      setToys((t.data as Toy[]) ?? []);
      setEvents((e.data as EventRow[]) ?? []);
      setVideos(m.count ?? 0);
      setPending(s.count ?? 0);
      setLoading(false);
    });
    // Histórico: não segura a tela (e fica vazio até o SQL da Fase C rodar).
    fetchActivity(12).then(setActivity);
    fetchAdminUsers().then(u => setNames(namesByEmail(u)));
  }, []);

  if (loading) return <Loading />;

  const upcoming = events.filter(e => !isPast(e));
  const past = events.filter(e => isPast(e));
  const featured = toys.filter(t => t.featured).length;

  const alerts: Alert[] = [];
  if (pending > 0)
    alerts.push({ tone: "warn", text: `${pending} brinquedo(s) enviado(s) pela comunidade esperando sua revisão.`, action: "Revisar", go: "submissoes" });
  for (const ev of upcoming) {
    if (ev.registration_url && ev.registration_deadline) {
      const d = daysUntil(ev.registration_deadline);
      if (d >= 0 && d <= 7)
        alerts.push({ tone: "info", text: `Inscrições de “${ev.title}” encerram ${d === 0 ? "hoje" : `em ${d} dia(s)`}.`, action: "Ver evento", go: "eventos" });
    }
  }
  if (featured !== HOME_FEATURED_SLOTS)
    alerts.push({ tone: "info", text: `A página inicial tem ${featured} de ${HOME_FEATURED_SLOTS} brinquedos em destaque.`, action: "Escolher", go: "brinquedos" });
  const noGuide = toys.filter(t => !t.guide_url).length;
  if (noGuide > 0)
    alerts.push({ tone: "info", text: `${noGuide} brinquedo(s) sem guia de construção em PDF.`, action: "Ver", go: "brinquedos" });
  if (upcoming.length === 0)
    alerts.push({ tone: "info", text: "Nenhum evento futuro: a página Eventos mostra “Nenhum evento agendado”.", action: "Criar evento", go: "eventos" });

  const stats: { label: string; value: number; sub?: string; icon: typeof Puzzle; go: Section }[] = [
    { label: "Brinquedos publicados", value: toys.length, icon: Puzzle, go: "brinquedos" },
    { label: "Vídeos tutoriais", value: videos, icon: Video, go: "videos" },
    { label: "Eventos", value: events.length, sub: `${upcoming.length} próximo(s) · ${past.length} passado(s)`, icon: CalendarDays, go: "eventos" },
    { label: "Envios para revisar", value: pending, icon: Inbox, go: "submissoes" },
  ];

  return (
    <>
      <SectionHeader
        title="Início"
        subtitle="Tudo o que você muda aqui aparece no site na hora — sem mexer em código."
        action={
          <a href="/" target="_blank" rel="noopener noreferrer" className={btn.secondary}>
            <ExternalLink className="h-4 w-4" /> Abrir o site
          </a>
        }
      />

      {/* Atenção */}
      <SubHeading>Precisa de atenção</SubHeading>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm mb-8 overflow-hidden">
        {alerts.length === 0 ? (
          <p className="px-5 py-4 flex items-center gap-2 text-green-700 font-semibold"><CheckCircle2 className="h-5 w-5" /> Tudo em dia.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {alerts.map((a, i) => (
              <li key={i} className={`flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1 px-5 py-3.5 border-l-4 ${a.tone === "warn" ? "border-amber-400" : "border-blue-300"}`}>
                {a.tone === "warn" ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" /> : <Info className="h-5 w-5 text-blue-500 shrink-0" />}
                <span className="flex-1 min-w-[12rem] text-sm text-gray-700">{a.text}</span>
                <button onClick={() => go(a.go)} className={`${btn.link} text-sm shrink-0 ml-8 sm:ml-0`}>
                  {a.action} <ArrowRight className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Números */}
      <SubHeading>Números do site</SubHeading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <button key={s.label} onClick={() => go(s.go)} className="text-left bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 hover:shadow-md hover:border-orange-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 mb-3"><s.icon className="h-5 w-5 text-orange-500" /></span>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm font-bold text-gray-600">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>}
          </button>
        ))}
      </div>

      {/* Atalhos */}
      <SubHeading>Atalhos</SubHeading>
      <div className="grid sm:grid-cols-3 gap-3">
        {([["brinquedos", "Novo brinquedo"], ["eventos", "Novo evento"], ["videos", "Novo vídeo"]] as const).map(([s, l]) => (
          <button key={s} onClick={() => go(s, true)} className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-orange-700 font-bold py-3.5 rounded-2xl border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            <Plus className="h-5 w-5" /> {l}
          </button>
        ))}
      </div>

      {/* Últimas alterações */}
      <SubHeading className="mt-10">Últimas alterações</SubHeading>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {activity.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-500">Ainda não há alterações registradas. A partir de agora, tudo o que for salvo aparece aqui, com quem fez e quando.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity.map(a => {
              const d = describe(a, names);
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <History className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="flex-1 min-w-0 text-sm text-gray-700"><strong className="text-gray-900">{d.who}</strong> {d.what}</p>
                  <time dateTime={a.at} title={fullDate(a.at)} className="text-xs text-gray-500 shrink-0 whitespace-nowrap">{timeAgo(a.at)}</time>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button onClick={() => go("ajuda")} className="mt-8 w-full flex items-center gap-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <LifeBuoy className="h-8 w-8 text-blue-500 shrink-0" />
        <span>
          <span className="block font-bold text-blue-950">Precisa de ajuda?</span>
          <span className="block text-sm text-blue-900/80">Passo a passo para criar evento, colocar fotos, cadastrar brinquedo, dar acesso a alguém e mais.</span>
        </span>
      </button>
    </>
  );
}
