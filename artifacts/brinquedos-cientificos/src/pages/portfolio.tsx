import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toys } from "@/lib/data";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export default function Portfolio() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredToys = toys.filter(toy => 
    toy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toy.concepts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div className="mb-12 max-w-md mx-auto relative">
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

          {filteredToys.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-500">Nenhum brinquedo encontrado.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredToys.map((toy, i) => (
                <motion.div 
                  key={toy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={toy.image} 
                      alt={toy.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">{toy.title}</h3>
                    <p className="text-muted-foreground mb-6 flex-1 text-lg leading-relaxed">{toy.description}</p>
                    
                    <div className="mb-6 flex flex-wrap gap-2">
                      {toy.concepts.map((concept, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-lg text-sm">
                          {concept}
                        </span>
                      ))}
                    </div>

                    <Link href={`/portfolio/${toy.id}`} className="w-full block">
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