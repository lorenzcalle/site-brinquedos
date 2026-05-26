import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { ArrowRight, BookOpen, Lightbulb, Play, Microscope, TestTube, Target, PlayCircle } from "lucide-react";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cachifyImage } from "@/lib/utils";
import { type Toy } from "@/lib/types";
import bannerImg from "@/assets/images/banner-principal.jpg";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const [homeToys, setHomeToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from("toys")
      .select("id, title, description, image, concepts")
      .eq("status", "approved")
      .limit(20)
      .then(({ data, error }) => {
        if (error) setError(true);
        else {
          const shuffled = (data ?? []).sort(() => Math.random() - 0.5);
          setHomeToys(shuffled.slice(0, 4));
        }
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      {/* Banner Section */}
      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative">
          <img
            src={bannerImg}
            alt="Banner Projeto Brinquedos Científicos"
            className="w-full h-auto block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-xl"
              >
                <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
                  URI – Campus Santo Ângelo
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Aprender Ciência <br className="hidden md:block" />Brincando
                </h1>
                <p className="text-white/90 text-base md:text-lg mb-6 leading-relaxed">
                  Brinquedos que as crianças constroem e que ensinam física, eletrônica e robótica de forma lúdica.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/portfolio" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg">
                    Ver Projetos <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/sobre#o-que-sao" className="inline-flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all">
                    Saiba Mais
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">O que você encontra aqui</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-red-500 rounded-2xl p-8 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300"
            >
              <Lightbulb className="h-12 w-12 mb-6 opacity-90" />
              <h3 className="text-2xl font-black mb-4">O que são Brinquedos Científicos?</h3>
              <p className="font-medium text-white/90 mb-6 leading-relaxed">
                São projetos lúdicos que ensinam conceitos complexos de forma simples, tátil e divertida.
              </p>
              <Link href="/sobre#o-que-sao" className="inline-flex items-center font-bold hover:underline">
                Entenda o conceito <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500 rounded-2xl p-8 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300"
            >
              <BookOpen className="h-12 w-12 mb-6 opacity-90" />
              <h3 className="text-2xl font-black mb-4">Guias e Atividades</h3>
              <p className="font-medium text-white/90 mb-6 leading-relaxed">
                Baixe nossos manuais detalhados e planos de aula para usar em casa ou na sala de aula.
              </p>
              <Link href="/materiais" className="inline-flex items-center font-bold hover:underline">
                Acessar materiais <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-500 rounded-2xl p-8 text-white shadow-xl hover:-translate-y-2 transition-transform duration-300"
            >
              <Target className="h-12 w-12 mb-6 opacity-90" />
              <h3 className="text-2xl font-black mb-4">Mostra de Projetos</h3>
              <p className="font-medium text-white/90 mb-6 leading-relaxed">
                Explore a galeria completa dos brinquedos que já desenvolvemos e inspire-se.
              </p>
              <Link href="/portfolio" className="inline-flex items-center font-bold hover:underline">
                Ver portfólio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sobre o Projeto Section */}
      <section className="py-20 bg-blue-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:w-1/2 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-full">
                <Microscope className="h-5 w-5" /> Nossa Missão
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground">
                Transformando a <span className="text-primary">Educação Científica</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Acreditamos que a melhor forma de aprender é fazendo. Nosso projeto desenvolve brinquedos que as próprias crianças podem construir, transformando conceitos abstratos em experiências reais e empolgantes.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Desenvolvimento do pensamento crítico",
                  "Estímulo à criatividade e resolução de problemas",
                  "Acessibilidade com materiais de baixo custo",
                  "Aprendizado prático de eletrônica e robótica",
                  "Inclusão e protagonismo feminino na tecnologia",
                  "Integração entre teoria e experiências concretas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg font-medium text-foreground/80">
                    <div className="bg-accent/20 p-1.5 rounded-full text-accent">
                      <TestTube className="h-5 w-5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full"
            >
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gray-200 animate-pulse w-full h-48 md:h-64" />
                  <div className="rounded-2xl bg-gray-200 animate-pulse w-full h-48 md:h-64 mt-8" />
                </div>
              ) : homeToys.length >= 2 ? (
                <div className="grid grid-cols-2 gap-4">
                  <img src={cachifyImage(homeToys[0].image)} alt={homeToys[0].title} className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover" />
                  <img src={cachifyImage(homeToys[1].image)} alt={homeToys[1].title} className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover mt-8" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-primary/10 w-full h-48 md:h-64 flex items-center justify-center">
                    <Microscope className="h-12 w-12 text-primary/40" />
                  </div>
                  <div className="rounded-2xl bg-primary/10 w-full h-48 md:h-64 flex items-center justify-center mt-8">
                    <TestTube className="h-12 w-12 text-primary/40" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galeria de Projetos */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Galeria de Projetos</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça alguns dos nossos brinquedos científicos mais populares.
            </p>
          </div>

          {error ? (
            <p className="text-center text-muted-foreground py-12">
              Não foi possível carregar os projetos. Tente novamente mais tarde.
            </p>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : homeToys.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum projeto disponível no momento.
            </p>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {homeToys.slice(0, 4).map((toy) => (
                <motion.div key={toy.id} variants={fadeIn} className="group cursor-pointer">
                  <Link href={`/portfolio/${toy.id}`}>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={cachifyImage(toy.image)}
                          alt={toy.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x400?text=Sem+Imagem";
                          }}
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white text-primary p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{toy.title}</h3>
                        <p className="text-muted-foreground text-sm flex-1 line-clamp-2">{toy.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {toy.concepts.slice(0, 2).map((concept, i) => (
                            <span key={i} className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-12 text-center">
            <Link href="/portfolio" className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-lg px-8 py-4 rounded-xl transition-all">
              Ver Todos os Brinquedos <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Vídeo Tutoriais */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <PlayCircle className="h-4 w-4" /> Biblioteca gratuita
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Aprenda na prática com nossos Vídeo Tutoriais
              </h2>
              <p className="text-white/85 text-xl leading-relaxed mb-8">
                Assista passo a passo como montar cada brinquedo científico. Vídeos gravados horizontalmente, didáticos e gratuitos para estudantes e professores.
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { label: "Vídeos", value: "12+" },
                  { label: "Categorias", value: "3" },
                  { label: "Gratuitos", value: "100%" },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-black">{value}</div>
                    <div className="text-white/70 text-sm font-medium">{label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/materiais"
                className="inline-flex items-center gap-2 bg-white text-orange-500 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
              >
                Acessar Vídeos <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full grid grid-cols-2 gap-4"
            >
              {[
                { label: "Montagem", color: "bg-white/20" },
                { label: "Eletrônica", color: "bg-white/15" },
                { label: "Física", color: "bg-white/15" },
                { label: "Robótica", color: "bg-white/20" },
              ].map(({ label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`${color} backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center gap-3 border border-white/20 hover:bg-white/25 transition-colors cursor-default`}
                >
                  <div className="bg-white/20 p-3 rounded-full">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white font-bold text-sm">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Pronto para colocar a mão na massa?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium">
              Explore nossa Mostra de Brinquedos Científicos e comece seu primeiro projeto hoje mesmo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/portfolio" className="inline-block bg-accent hover:bg-accent/90 text-white font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
                Acessar a Mostra de Projetos
              </Link>
              <Link href="/equipe" className="inline-block bg-white/20 hover:bg-white/30 text-white font-bold text-xl px-10 py-5 rounded-2xl hover:-translate-y-1 transition-all">
                Conheça a Equipe
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
