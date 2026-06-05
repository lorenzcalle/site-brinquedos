import { Layout } from "@/components/layout";
import { Play, X, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { youtubeId, youtubeThumb, youtubeEmbed } from "@/lib/utils";
import { VIDEO_CATEGORIES } from "@/lib/data";

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

export default function Materiais() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("Todos");
  const [playing, setPlaying] = useState<Material | null>(null);

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
  const usedCategories = new Set(materials.map(m => m.category).filter(Boolean));

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
          <h1 className="text-5xl font-black mb-4">Tutoriais em Vídeo</h1>
          <p className="text-lg text-white/85 max-w-xl mx-auto">
            Aqui você encontrará vídeos explicativos sobre conceitos e componentes eletrônicos utilizados nos Brinquedos Científicos, além de tutoriais passo a passo para aprender, de forma prática, como montar diferentes projetos e experimentos.
          </p>
          <div className="flex justify-center gap-12 mt-8">
            {[[String(materials.length), "Vídeos"], [String(usedCategories.size || VIDEO_CATEGORIES.length), "Categorias"], ["100%", "Gratuitos"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black">{num}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
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
      </div>

      {/* Grid */}
      <section className="py-14 bg-gray-50 min-h-[40vh]">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
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
                  const vid = youtubeId(item.video_url);
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
                        {vid && <img src={youtubeThumb(vid)} alt={item.title} className="w-full h-full object-cover" />}
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
                        {item.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>}
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
      {playing && youtubeId(playing.video_url) && (
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
                src={`${youtubeEmbed(youtubeId(playing.video_url)!)}?autoplay=1`}
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
