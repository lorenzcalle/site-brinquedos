import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout";
import { Loader2, LogOut, Home, Puzzle, Inbox, Video, CalendarDays, Users, Type } from "lucide-react";
import { Dashboard } from "@/components/admin/dashboard";
import { ToysAdmin } from "@/components/admin/toys-admin";
import { SubmissionsAdmin } from "@/components/admin/submissions-admin";
import { VideosAdmin } from "@/components/admin/videos-admin";
import { EventsAdmin } from "@/components/admin/events-admin";
import { TeamAdmin } from "@/components/admin/team-admin";
import { TextsAdmin } from "@/components/admin/texts-admin";
import { PublishButton } from "@/components/admin/publish-button";

export type Section = "inicio" | "brinquedos" | "submissoes" | "videos" | "eventos" | "equipe" | "textos";

const SECTIONS: { key: Section; label: string; icon: typeof Home }[] = [
  { key: "inicio", label: "Início", icon: Home },
  { key: "brinquedos", label: "Brinquedos", icon: Puzzle },
  { key: "submissoes", label: "Submissões", icon: Inbox },
  { key: "videos", label: "Vídeos", icon: Video },
  { key: "eventos", label: "Eventos", icon: CalendarDays },
  { key: "equipe", label: "Equipe", icon: Users },
  { key: "textos", label: "Textos do site", icon: Type },
];

// A seção fica no endereço (/admin#eventos): recarregar a página não volta para o início.
const sectionFromHash = (): Section => {
  const h = window.location.hash.slice(1);
  return SECTIONS.some(s => s.key === h) ? (h as Section) : "inicio";
};

type Counts = Partial<Record<Section, number>>;

// Painel administrativo. Cada seção é um componente em components/admin/ que carrega
// os próprios dados; aqui ficam o login, o menu e as contagens do menu.
export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [section, setSection] = useState<Section>(sectionFromHash);
  const [startNew, setStartNew] = useState(false); // atalho "Novo …" do Início
  const [counts, setCounts] = useState<Counts>({});

  // ─── Sessão ────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error) setLoginError("Email ou senha incorretos.");
  };

  const handleLogout = () => supabase.auth.signOut();

  // ─── Navegação e contagens ───────────────────────────────────────────────────
  useEffect(() => {
    const onHash = () => setSection(sectionFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (s: Section, novo = false) => {
    setStartNew(novo);
    setSection(s);
    history.replaceState(null, "", s === "inicio" ? window.location.pathname : `#${s}`);
    window.scrollTo({ top: 0 });
  };

  const loadCounts = async () => {
    const head = { count: "exact" as const, head: true };
    const [t, s, v, e, m] = await Promise.all([
      supabase.from("toys").select("id", head).eq("status", "approved"),
      supabase.from("submissions").select("id", head).eq("status", "pending"),
      supabase.from("materials").select("id", head),
      supabase.from("events").select("id", head),
      supabase.from("team_members").select("id", head),
    ]);
    setCounts({ brinquedos: t.count ?? 0, submissoes: s.count ?? 0, videos: v.count ?? 0, eventos: e.count ?? 0, equipe: m.count ?? 0 });
  };

  useEffect(() => { if (session) loadCounts(); }, [session]);

  // ─── Telas de auth ────────────────────────────────────────────────────────────
  if (checkingSession) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    </Layout>
  );

  if (!session) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4">
          <h1 className="text-2xl font-black text-center">Área Admin</h1>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="username"
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors"
          />
          <input
            type="password" placeholder="Senha" value={password}
            onChange={e => setPassword(e.target.value)} autoComplete="current-password"
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors"
          />
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <button
            type="submit" disabled={loggingIn}
            className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loggingIn && <Loader2 className="h-5 w-5 animate-spin" />}
            {loggingIn ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </Layout>
  );

  const sectionProps = { onChange: loadCounts, startNew, onStarted: () => setStartNew(false) };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-orange-500 pt-16 pb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Painel do site</h1>
            <p className="text-white/80 text-sm mt-1">{session.user.email}</p>
          </div>
          <div className="flex items-start gap-3">
          <PublishButton />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 md:grid md:grid-cols-[13rem_1fr] md:gap-8">
        {/* Menu: coluna lateral no computador, faixa rolável no celular */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible mb-6 md:mb-0 md:sticky md:top-24 md:self-start -mx-4 px-4 md:mx-0 md:px-0">
          {SECTIONS.map(s => {
            const n = counts[s.key];
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => go(s.key)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${active ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <s.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{s.label}</span>
                {n !== undefined && s.key !== "inicio" && (
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    active ? "bg-white/25" : s.key === "submissoes" && n > 0 ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500"
                  }`}>{n}</span>
                )}
              </button>
            );
          })}
        </nav>

        <main className="min-w-0">
          {section === "inicio" && <Dashboard go={go} />}
          {section === "brinquedos" && <ToysAdmin {...sectionProps} />}
          {section === "submissoes" && <SubmissionsAdmin onChange={loadCounts} />}
          {section === "videos" && <VideosAdmin {...sectionProps} />}
          {section === "eventos" && <EventsAdmin {...sectionProps} />}
          {section === "equipe" && <TeamAdmin onChange={loadCounts} />}
          {section === "textos" && <TextsAdmin />}
        </main>
      </div>
    </Layout>
  );
}
