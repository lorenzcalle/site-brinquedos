import { Layout } from "@/components/layout";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const tutorials = [
  { title: "Como montar o Pião", category: "Montagem", duration: "8:24", level: "Iniciante", desc: "Monte e aprenda sobre equilíbrio e rotação.", color: "bg-orange-100" },
  { title: "Dicas para a Ponte", category: "Física", duration: "12:05", level: "Intermediário", desc: "Estruturas resistentes com materiais simples.", color: "bg-blue-100" },
  { title: "Eletrônica Básica", category: "Eletrônica", duration: "15:40", level: "Iniciante", desc: "Circuitos, LEDs e pilhas de forma simples.", color: "bg-green-100" },
  { title: "Carrinho Solar", category: "Montagem", duration: "10:18", level: "Intermediário", desc: "Da placa solar às rodas em movimento.", color: "bg-purple-100" },
  { title: "Catapulta na Prática", category: "Física", duration: "9:55", level: "Avançado", desc: "Física das alavancas com experimento real.", color: "bg-pink-100" },
  { title: "Vulcão Eletroquímico", category: "Eletrônica", duration: "7:30", level: "Intermediário", desc: "Reações químicas e circuitos juntos.", color: "bg-yellow-100" },
];

const levelColors: Record<string, string> = {
  Iniciante: "bg-green-100 text-green-700",
  Intermediário: "bg-orange-100 text-orange-700",
  Avançado: "bg-red-100 text-red-700",
};

const filters = ["Todos", "Montagem", "Eletrônica", "Física"];

export default function Materiais() {
  const [active, setActive] = useState("Todos");

  const filtered = active === "Todos"
    ? tutorials
    : tutorials.filter((t) => t.category === active);

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
            Aprenda na prática com vídeos passo a passo para montar e entender cada brinquedo científico.
          </p>
          <div className="flex justify-center gap-12 mt-8">
            {[["12", "Vídeos"], ["3", "Categorias"], ["100%", "Gratuitos"]].map(([num, label]) => (
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
                active === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
            {filtered.length} tutoriais disponíveis
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className={`${item.color} aspect-video flex items-center justify-center relative`}>
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-orange-500 ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-3 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {item.duration}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
                    {item.category}
                  </p>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColors[item.level]}`}>
                    {item.level}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}