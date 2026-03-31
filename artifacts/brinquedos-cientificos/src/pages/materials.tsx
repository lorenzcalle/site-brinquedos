import { Layout } from "@/components/layout";
import { BookOpen, FileText, Play, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function Materials() {
  const categories = [
    { title: "Guias de Montagem", icon: <FileText className="h-8 w-8" />, color: "bg-blue-500", items: ["Guia do Carrinho Solar", "Guia da Catapulta", "Guia do Vulcão"] },
    { title: "Planos de Aula", icon: <BookOpen className="h-8 w-8" />, color: "bg-green-600", items: ["Plano: Força e Movimento", "Plano: Energias Renováveis", "Plano: Reações Químicas"] },
    { title: "Tutoriais em Vídeo", icon: <Play className="h-8 w-8" />, color: "bg-orange-500", items: ["Como montar o Pião", "Dicas para a Ponte", "Eletrônica Básica"] }
  ];

  return (
    <Layout>
      <div className="bg-green-600 pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Materiais Formativos</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Uma biblioteca completa de recursos gratuitos para apoiar educadores e famílias.
          </p>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {categories.map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className={`${cat.color} p-8 text-white flex flex-col items-center justify-center text-center`}>
                  <div className="bg-white/20 p-4 rounded-full mb-4">
                    {cat.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{cat.title}</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{item}</span>
                        <Download className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-6 py-3 font-bold text-gray-500 hover:text-foreground transition-colors border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300">
                    Ver todos
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}