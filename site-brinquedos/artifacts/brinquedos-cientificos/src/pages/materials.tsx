import { Layout } from "@/components/layout";
import { Play, X, Video, BookOpen, Download, ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { videoThumb, videoEmbed } from "@/lib/utils";
import { VIDEO_CATEGORIES } from "@/lib/data";
import { type Manual, fetchManuals, manualDownloadUrl, manualMeta } from "@/lib/manuals";

type Material = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  video_url: string;
};

const levelColors: Record<string, string> = {
  Iniciante: "bg-green-100 text-green-700",
  Intermediário: "bg-orange-100 text-orange-700",
  Avançado: "bg-red-100 text-red-700",
};

const filters = ["Todos", ...VIDEO_CATEGORIES];

// Aba no endereço: /materiais#manuais abre direto nos manuais (link para mandar no WhatsApp).
type Tab = "videos" | "manuais";
const tabFromHash = (): Tab => (typeof window !== "undefined" && window.location.hash === "#manuais" ? "manuais" : "videos");

export default function Materiais() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("Todos");
  const [playing, setPlaying] = useState<Material | null>(null);
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loadingManuals, setLoadingManuals] = useState(true);

  useEffect(() => {
    fetchManuals().then(m => { setManuals(m); setLoadingManuals(false); });
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const pickTab = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "manuais" ? "#manuais" : window.location.pathname);
  };

  useEffect(() => {
    supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMaterials((data as Material[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = active === "Todos" ? materials : materials.filter(m => m.category === active);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-orange-500 pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
            Biblioteca gratuita
          </span>
          <h1 className="text-5xl font-black mb-4">Vídeos e Manuais</h1>
          <p className="text-lg text-white/85 max-w-xl mx-auto">
            Todo grande projeto começa pelo conhecimento. Assista aos vídeos, baixe os manuais e aprenda sobre componentes eletrônicos, impressão 3D, desenvolvimento de produtos, programação e outras tecnologias que podem transformar ideias em soluções criativas.
          </p>
          <div className="flex justify-center gap-12 mt-8">
            {[[loading ? "–" : String(materials.length), "Vídeos"], [loadingManuals ? "–" : String(manuals.length), "Manuais"], ["100%", "Gratuitos"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black">{num}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abas (Vídeos | Manuais) e, nos vídeos, as categorias */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-4 pt-3">
          <div role="tablist" aria-label="Tipo de material" className="grid grid-cols-2 sm:inline-grid gap-1 p-1 bg-gray-100 rounded-2xl">
            {([["videos", "Vídeos", Video, materials.length, loading], ["manuais", "Manuais", BookOpen, manuals.length, loadingManuals]] as const).map(([key, label, Icon, n, busy]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => pickTab(key)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                  tab === key ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
                {!busy && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === key ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-500"}`}>{n}</span>}
              </button>
            ))}
          </div>
        </div>
        {tab === "videos" ? (
          <div className="container mx-auto px-4 flex gap-2 py-3 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  active === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        ) : <div className="h-3" />}
      </div>

      {/* Grid */}
      <section className="py-14 bg-gray-50 min-h-[40vh]">
        <div className="container mx-auto px-4 md:px-6">
          {tab === "manuais" ? <ManualsGrid manuals={manuals} loading={loadingManuals} /> : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Video className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl font-bold">Nenhum vídeo {active !== "Todos" ? "nesta categoria" : "cadastrado ainda"}.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
                {filtered.length} {filtered.length === 1 ? "tutorial disponível" : "tutoriais disponíveis"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item, i) => {
                  const thumb = videoThumb(item.video_url);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setPlaying(item)}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer group"
                    >
                      <div className="aspect-video bg-gray-900 relative overflow-hidden">
                        {thumb && <img src={thumb} alt={item.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-orange-500 ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        {item.category && (
                          <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">{item.category}</p>
                        )}
                        <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-400 mb-3 line-clamp-3">{item.description}</p>}
                        {item.level && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColors[item.level] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.level}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Player modal */}
      {playing && videoEmbed(playing.video_url) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-lg pr-4">{playing.title}</h3>
              <button onClick={() => setPlaying(null)} className="text-white/80 hover:text-white shrink-0">
                <X className="h-7 w-7" />
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={videoEmbed(playing.video_url)!}
                title={playing.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Aba "Manuais": PDFs para baixar ou abrir (cadastrados no /admin → Manuais).
function ManualsGrid({ manuals, loading }: { manuals: Manual[]; loading: boolean }) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
  if (manuals.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <BookOpen className="mx-auto h-12 w-12 mb-4" />
      <p className="text-xl font-bold">Nenhum manual publicado ainda.</p>
    </div>
  );
  return (
    <>
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
        {manuals.length} {manuals.length === 1 ? "manual em PDF" : "manuais em PDF"} para baixar
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuals.map((m, i) => (
          <motion.article
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
          >
            <a href={m.file_url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${m.title}`}
              className="relative aspect-[4/3] bg-gradient-to-br from-orange-50 to-amber-100 group">
              {m.cover_url
                ? <img src={m.cover_url} alt="" loading="lazy" className="absolute inset-0 m-auto max-w-[86%] max-h-[86%] object-contain rounded shadow-lg group-hover:scale-[1.03] transition-transform" />
                : <BookOpen className="absolute inset-0 m-auto h-16 w-16 text-orange-300" />}
            </a>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-2">{m.title}</h3>
              {m.description && <p className="text-sm text-gray-500 mb-3">{m.description}</p>}
              <p className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-4">
                <FileText className="h-3.5 w-3.5" /> {manualMeta(m)}
              </p>
              <div className="flex gap-2">
                <a href={manualDownloadUrl(m)} className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                  <Download className="h-4 w-4" /> Baixar PDF
                </a>
                <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                  <ExternalLink className="h-4 w-4" /> Abrir
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}
