import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import logoImg from "@/assets/images/logo-principal.png";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Loader2, LogOut, Home, Puzzle, Inbox, Video, CalendarDays, Users, Type, Atom, Menu, ExternalLink, Eye, EyeOff, ArrowLeft,
  KeyRound, LifeBuoy,
} from "lucide-react";
import { Dashboard } from "@/components/admin/dashboard";
import { ToysAdmin } from "@/components/admin/toys-admin";
import { SubmissionsAdmin } from "@/components/admin/submissions-admin";
import { VideosAdmin } from "@/components/admin/videos-admin";
import { EventsAdmin } from "@/components/admin/events-admin";
import { TeamAdmin } from "@/components/admin/team-admin";
import { TextsAdmin } from "@/components/admin/texts-admin";
import { PublishButton } from "@/components/admin/publish-button";
import { AccessAdmin } from "@/components/admin/access-admin";
import { HelpAdmin } from "@/components/admin/help-admin";
import { AccountModal, FirstPasswordScreen } from "@/components/admin/account";
import { btn, inputCls } from "@/components/admin/ui";

export type Section = "inicio" | "brinquedos" | "submissoes" | "videos" | "eventos" | "equipe" | "textos" | "acesso" | "ajuda";

const SECTIONS: { key: Section; label: string; icon: typeof Home; group?: string }[] = [
  { key: "inicio", label: "Início", icon: Home },
  { key: "brinquedos", label: "Brinquedos", icon: Puzzle, group: "Conteúdo" },
  { key: "submissoes", label: "Envios da comunidade", icon: Inbox, group: "Conteúdo" },
  { key: "videos", label: "Vídeos", icon: Video, group: "Conteúdo" },
  { key: "eventos", label: "Eventos", icon: CalendarDays, group: "Conteúdo" },
  { key: "equipe", label: "Equipe", icon: Users, group: "Páginas" },
  { key: "textos", label: "Textos do site", icon: Type, group: "Páginas" },
  { key: "acesso", label: "Acesso ao painel", icon: KeyRound, group: "Painel" },
  { key: "ajuda", label: "Ajuda", icon: LifeBuoy, group: "Painel" },
];

// A seção fica no endereço (/admin#eventos): recarregar a página não volta para o início.
const sectionFromHash = (): Section => {
  const h = window.location.hash.slice(1);
  return SECTIONS.some(s => s.key === h) ? (h as Section) : "inicio";
};

type Counts = Partial<Record<Section, number>>;

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2" title="Abrir o site">
      <span className="bg-primary text-white p-1.5 rounded-lg"><Atom className="h-6 w-6" /></span>
      <img src={logoImg} alt="Brinquedos Científicos" className="h-9 w-auto" />
    </a>
  );
}

// Menu lateral (no computador fica fixo; no celular abre por cima pelo botão ☰).
function SideNav({ section, counts, go, email, name, onLogout, onAccount }: {
  section: Section; counts: Counts; go: (s: Section) => void; email: string; name: string; onLogout: () => void; onAccount: () => void;
}) {
  let lastGroup: string | undefined;
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="h-16 px-5 flex items-center border-b border-gray-100"><Logo /></div>
      <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map(s => {
          const n = counts[s.key];
          const active = section === s.key;
          const heading = s.group !== lastGroup ? s.group : undefined;
          lastGroup = s.group;
          return (
            <div key={s.key}>
              {heading && <p className="px-3 pt-5 pb-1.5 text-[11px] font-black uppercase tracking-wider text-gray-500">{heading}</p>}
              <button
                onClick={() => go(s.key)}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  active ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <s.icon className={`h-5 w-5 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`} />
                <span className="flex-1 text-left">{s.label}</span>
                {n !== undefined && s.key !== "inicio" && (
                  <span className={`text-xs rounded-full px-2 py-0.5 min-w-[1.75rem] text-center ${
                    s.key === "submissoes" && n > 0 ? "bg-amber-400 text-white" : active ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                  }`}>{n}</span>
                )}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-3 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <ExternalLink className="h-5 w-5 text-gray-400" /> Ver o site
        </a>
        <div className="flex items-center gap-1">
          <button onClick={onAccount} title="Minha conta: nome e senha"
            className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            <span className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center shrink-0" aria-hidden>
              {(name || email).charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-gray-800 truncate">{name || "Minha conta"}</span>
              <span className="block text-xs text-gray-500 truncate">{email}</span>
            </span>
          </button>
          <button onClick={onLogout} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100" title="Sair" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error) setError("E-mail ou senha incorretos.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8"><Logo /></div>
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 flex flex-col gap-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-black">Painel do site</h1>
          <p className="text-sm text-gray-500 mt-1">Entre para editar o conteúdo do site.</p>
        </div>
        <div>
          <label htmlFor="login-email" className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
          <input id="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" className={inputCls} />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
          <div className="relative">
            <input id="login-password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className={`${inputCls} pr-12`} />
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-800">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loggingIn} className={`${btn.primary} py-3 mt-1`}>
          {loggingIn && <Loader2 className="h-5 w-5 animate-spin" />}
          {loggingIn ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" onClick={() => setForgot(f => !f)} aria-expanded={forgot} className="text-sm font-bold text-orange-600 hover:underline">
          Esqueci minha senha
        </button>
        {forgot && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            Peça para outra pessoa que tem acesso ao painel abrir <strong>Acesso ao painel</strong>, clicar no ⋯ ao lado do
            seu nome e em <strong>Gerar senha provisória</strong>. Com ela você entra e cria uma senha nova.
          </p>
        )}
      </form>
      <a href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Voltar ao site
      </a>
    </div>
  );
}

// Painel administrativo, com layout próprio (sem o menu e o rodapé do site). Cada seção
// é um componente em components/admin/ que carrega os próprios dados; aqui ficam o
// login, o menu e as contagens do menu.
export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [section, setSection] = useState<Section>(sectionFromHash);
  const [startNew, setStartNew] = useState(false); // atalho "Novo …" do Início
  const [counts, setCounts] = useState<Counts>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // ─── Sessão ────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

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
    setMenuOpen(false);
    history.replaceState(null, "", s === "inicio" ? window.location.pathname : `#${s}`);
    window.scrollTo({ top: 0 });
  };

  const loadCounts = async () => {
    window.dispatchEvent(new Event("admin:changed")); // o botão Publicar reconta as alterações
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

  // ─── Telas ────────────────────────────────────────────────────────────────────
  if (checkingSession) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (!session) return <LoginScreen />;
  // Entrou com senha provisória: cria a própria antes de usar o painel.
  if (session.user.user_metadata?.must_change_password) return <FirstPasswordScreen user={session.user} />;

  const email = session.user.email ?? "";
  const name: string = session.user.user_metadata?.name ?? "";
  const current = SECTIONS.find(s => s.key === section)!;
  const sectionProps = { onChange: loadCounts, startNew, onStarted: () => setStartNew(false) };
  const openAccount = () => { setMenuOpen(false); setAccountOpen(true); };
  const nav = <SideNav section={section} counts={counts} go={go} email={email} name={name} onLogout={handleLogout} onAccount={openAccount} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-gray-200/80 z-30">{nav}</aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Menu do painel</SheetTitle>
          {nav}
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-gray-200/80 flex items-center gap-3 px-4 lg:px-8">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100" aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          <p className="flex-1 min-w-0 truncate text-sm text-gray-500">
            <span className="hidden sm:inline">Painel do site <span className="mx-1.5 text-gray-300">/</span></span>
            <span className="font-bold text-gray-900">{current.label}</span>
          </p>
          <PublishButton />
        </header>

        <main className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {section === "inicio" && <Dashboard go={go} />}
          {section === "brinquedos" && <ToysAdmin {...sectionProps} />}
          {section === "submissoes" && <SubmissionsAdmin onChange={loadCounts} />}
          {section === "videos" && <VideosAdmin {...sectionProps} />}
          {section === "eventos" && <EventsAdmin {...sectionProps} />}
          {section === "equipe" && <TeamAdmin onChange={loadCounts} />}
          {section === "textos" && <TextsAdmin />}
          {section === "acesso" && <AccessAdmin me={email} onOpenAccount={openAccount} />}
          {section === "ajuda" && <HelpAdmin go={go} />}
        </main>
        {accountOpen && <AccountModal user={session.user} onClose={() => setAccountOpen(false)} />}
      </div>
    </div>
  );
}
