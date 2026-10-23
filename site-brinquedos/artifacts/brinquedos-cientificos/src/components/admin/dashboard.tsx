import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type EventRow, TBD_DATE, today } from "@/lib/events";
import { type Toy } from "@/lib/types";
import { HOME_FEATURED_SLOTS } from "@/lib/toys";
import { Loader2, Inbox, Puzzle, Video, CalendarDays, AlertTriangle, Info, Plus, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Section } from "@/pages/admin";

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
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  const upcoming = events.filter(e => e.type === "upcoming");
  const past = events.filter(e => e.type === "past");
  const featured = toys.filter(t => t.featured).length;

  const alerts: Alert[] = [];
  if (pending > 0)
    alerts.push({ tone: "warn", text: `${pending} brinquedo(s) enviado(s) pela comunidade aguardando revisão.`, action: "Revisar", go: "submissoes" });
  for (const ev of upcoming) {
    if (ev.date && ev.date !== TBD_DATE && ev.date < today())
      alerts.push({ tone: "warn", text: `“${ev.title}” já aconteceu, mas ainda aparece em Próximos eventos.`, action: "Resolver", go: "eventos" });
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
    { label: "Submissões pendentes", value: pending, icon: Inbox, go: "submissoes" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black">Início</h2>
          <p className="text-sm text-gray-500 mt-1">Tudo o que você muda aqui aparece no site na hora — sem mexer em código.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:underline">
          Abrir o site <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Atenção */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <h3 className="px-5 pt-4 pb-2 text-sm font-black uppercase tracking-wide text-gray-400">Precisa de atenção</h3>
        {alerts.length === 0 ? (
          <p className="px-5 pb-5 flex items-center gap-2 text-green-700 font-semibold"><CheckCircle2 className="h-5 w-5" /> Tudo em dia.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                {a.tone === "warn" ? <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" /> : <Info className="h-5 w-5 text-blue-400 shrink-0" />}
                <span className="flex-1 text-sm text-gray-700">{a.text}</span>
                <button onClick={() => go(a.go)} className="text-sm font-bold text-orange-600 hover:underline shrink-0 inline-flex items-center gap-1">
                  {a.action} <ArrowRight className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <button key={s.label} onClick={() => go(s.go)} className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-orange-200 transition-all">
            <s.icon className="h-6 w-6 text-orange-500 mb-3" />
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm font-bold text-gray-600">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>}
          </button>
        ))}
      </div>

      {/* Atalhos */}
      <h3 className="text-sm font-black uppercase tracking-wide text-gray-400 mb-3">Atalhos</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        {([["brinquedos", "Novo brinquedo"], ["eventos", "Novo evento"], ["videos", "Novo vídeo"]] as const).map(([s, l]) => (
          <button key={s} onClick={() => go(s, true)} className="inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl border border-orange-100 transition-colors">
            <Plus className="h-5 w-5" /> {l}
          </button>
        ))}
      </div>
    </>
  );
}
