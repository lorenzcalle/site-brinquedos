import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, X, FlaskConical } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type Toy } from "@/lib/types";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-8 flex flex-col gap-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="h-7 w-20 bg-gray-200 rounded-lg" />
          <div className="h-7 w-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-11 bg-gray-200 rounded-xl mt-auto" />
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [toys, setToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from("toys")
      .select("id, title, description, image, concepts, materials")
      .eq("status", "approved")
      .then(({ data, error }) => {
        if (error) setError(true);
        else setToys(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredToys = toys.filter(toy =>
    toy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toy.concepts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const clearFilters = () => setSearchTerm("");
  const hasFilters = searchTerm !== "";

  return (
    <Layout>
      <div className="bg-orange-500 pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Portfólio de Projetos</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Explore nossa coleção completa de brinquedos científicos e descubra a ciência na prática.
          </p>
        </div>
      </div>

      <section className="py-16 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4 md:px-6">

          {/* Busca */}
          <div className="mb-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou conceito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 outline-none text-lg transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Contador */}
          {!loading && !error && (
            <p className="text-center text-gray-400 text-sm font-medium mb-8">
              {filteredToys.length} {filteredToys.length === 1 ? "brinquedo encontrado" : "brinquedos encontrados"}
            </p>
          )}

          {/* Estados */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <FlaskConical className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">Erro ao carregar brinquedos.</h3>
              <p className="text-gray-400">Verifique sua conexão e tente novamente.</p>
            </div>
          ) : filteredToys.length === 0 ? (
            <div className="text-center py-20">
              <FlaskConical className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">Nenhum brinquedo encontrado.</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600">
                  <X className="h-4 w-4" /> Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredToys.map((toy, i) => (
                <motion.div
                  key={toy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={toy.image}
                      alt={toy.title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">{toy.title}</h3>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed line-clamp-3">{toy.description}</p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {toy.concepts.map((concept, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-lg text-sm">
                          {concept}
                        </span>
                      ))}
                    </div>

                    <Link href={`/portfolio/${toy.id}`} className="mt-auto w-full block">
                      <button className="w-full bg-gray-100 hover:bg-orange-500 text-foreground hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Ver Detalhes <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}