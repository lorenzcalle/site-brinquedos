import { Layout } from "@/components/layout";
import { blogPosts } from "@/lib/data";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

export default function Blog() {
  return (
    <Layout>
      <div className="bg-primary pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Blog & Notícias</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Acompanhe nossas oficinas, novidades e reflexões sobre educação e ciência.
          </p>
        </div>
      </div>

      <section className="py-20 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogPosts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 sm:w-3/5 flex flex-col justify-center">
                  <div className="flex items-center text-sm font-bold text-secondary mb-3">
                    <Calendar className="h-4 w-4 mr-2" /> {post.date}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight">{post.title}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{post.excerpt}</p>
                  <button className="mt-auto inline-flex items-center text-primary font-bold hover:underline w-fit">
                    Ler artigo <ArrowRight className="ml-2 h-4 w-4" />
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