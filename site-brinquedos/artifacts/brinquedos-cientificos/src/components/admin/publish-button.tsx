import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

// Status escrito pelo scripts/publish-worker.mjs (cron do servidor) em dist/public.
type Status = {
  state: "idle" | "building";
  handledId: number;
  startedAt: string | null;
  finishedAt: string | null;
  ok: boolean | null;
  message: string | null;
};

const hora = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "";

// Botão "Publicar": as edições aparecem para os visitantes na hora, mas o HTML que o
// Google e as prévias de link (WhatsApp) leem é gerado no build. Publicar pede um build
// ao servidor, que começa em até 1 minuto e leva ~1 minuto, sem tirar o site do ar.
export function PublishButton() {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [latestId, setLatestId] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unpublished, setUnpublished] = useState(0); // alterações depois da última publicação
  const timer = useRef<number | undefined>(undefined);

  const refresh = async () => {
    const [s, r] = await Promise.all([
      fetch(`/publish-status.json?t=${Date.now()}`, { cache: "no-store" })
        .then(res => (res.ok ? res.json() : null)).catch(() => null),
      supabase.from("publish_requests").select("id").order("id", { ascending: false }).limit(1),
    ]);
    setStatus(s);
    setLatestId(r.data?.[0]?.id ?? 0);
    // O que muda as páginas públicas (envio recebido e contas não contam).
    const since = s?.finishedAt ?? s?.startedAt;
    if (since) {
      const c = await supabase.from("activity_log").select("id", { count: "exact", head: true })
        .gt("at", since).not("entity", "in", "(site,acesso,envio)");
      setUnpublished(c.error ? 0 : c.count ?? 0);
    }
    setLoaded(true);
  };

  const queued = !!status && latestId > status.handledId && status.state !== "building";
  const building = status?.state === "building";
  const busy = queued || building;

  // Enquanto há publicação em andamento, consulta a cada 5 s; parado, a cada minuto.
  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("admin:changed", onChange);
    window.addEventListener("focus", onChange);
    return () => { window.removeEventListener("admin:changed", onChange); window.removeEventListener("focus", onChange); };
  }, []);
  useEffect(() => {
    window.clearInterval(timer.current);
    timer.current = window.setInterval(refresh, busy ? 5000 : 60000);
    return () => window.clearInterval(timer.current);
  }, [busy]);

  const wasBusy = useRef(false);
  useEffect(() => {
    if (wasBusy.current && !busy && status?.finishedAt) {
      toast(status.ok
        ? { title: "Publicado! ✅", description: "O Google e as prévias de link já recebem a versão nova." }
        : { title: "A publicação falhou", description: status.message ?? "", variant: "destructive" });
    }
    wasBusy.current = busy;
  }, [busy]);

  const publish = async () => {
    setRequesting(true);
    const { error } = await supabase.from("publish_requests").insert([{}]);
    setRequesting(false);
    if (error) return void toast({ title: "Não foi possível pedir a publicação", description: error.message, variant: "destructive" });
    refresh();
  };

  let line: React.ReactNode;
  if (!loaded) line = "…";
  else if (!status) line = <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Aguardando o servidor</span>;
  else if (building) line = <span className="inline-flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publicando desde {hora(status.startedAt)} (~1 min)</span>;
  else if (queued) line = <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Na fila — começa em até 1 min</span>;
  else if (status.ok === false) line = <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Falhou em {hora(status.finishedAt)}</span>;
  else if (unpublished > 0) line = <span className="inline-flex items-center gap-1 text-orange-700 font-semibold">{unpublished} {unpublished === 1 ? "alteração ainda não está" : "alterações ainda não estão"} no Google</span>;
  else if (status.finishedAt) line = <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Tudo publicado ({hora(status.finishedAt)})</span>;
  else line = "Ainda não publicado pelo painel";

  const hot = unpublished > 0 && !busy && !requesting;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden md:inline text-xs text-gray-500">{line}</span>
      <button
        onClick={publish}
        disabled={busy || requesting || !loaded}
        title="As mudanças já aparecem para quem visita o site. Publicar atualiza a versão que o Google e as prévias de link (WhatsApp) leem, e cria a página de brinquedos novos para o Google."
        className={`inline-flex items-center gap-2 border-2 disabled:opacity-70 px-4 py-2 rounded-xl font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          hot ? "bg-orange-500 border-orange-500 hover:bg-orange-600 text-white" : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-800"}`}
      >
        {busy || requesting ? <Loader2 className={`h-4 w-4 animate-spin ${hot ? "" : "text-orange-500"}`} /> : <Rocket className={`h-4 w-4 ${hot ? "" : "text-orange-500"}`} />}
        {busy ? "Publicando…" : "Publicar"}
        {hot && <span className="sm:hidden text-xs bg-white/25 rounded-full px-1.5">{unpublished}</span>}
      </button>
    </div>
  );
}
