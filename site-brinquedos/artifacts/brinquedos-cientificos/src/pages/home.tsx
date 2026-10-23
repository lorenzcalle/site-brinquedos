import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { ArrowRight, BookOpen, Bot, Lightbulb, Play, Microscope, TestTube, Target, PlayCircle, School, Send, ClipboardCheck, Sparkles } from "lucide-react";
import agenteImg from "@/assets/images/agente/fig2_card_robotica.png";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cachifyImage, videoThumb } from "@/lib/utils";
import { type Toy } from "@/lib/types";
import { useSiteTexts } from "@/lib/site-texts";

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

type VideoRow = { id: string; title: string; video_url: string; category: string | null };

// Posição/tamanho de cada vídeo no coverflow conforme a distância (em passos) do centro.
const COVER_POS = [
  { x: 0,   scale: 1,    opacity: 1,    z: 40 }, // centro (em foco)
  { x: 58,  scale: 0.72, opacity: 0.6,  z: 30 },
  { x: 104, scale: 0.5,  opacity: 0.28, z: 20 },
  { x: 145, scale: 0.4,  opacity: 0,    z: 10 }, // entra/sai invisível nas bordas
];

// Distância circular (com sinal) de i até o índice em foco, p/ loop infinito.
function ringOffset(i: number, current: number, n: number) {
  let d = (((i - current) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

export default function Home() {
  const t = useSiteTexts();
  const [homeToys, setHomeToys] = useState<Toy[]>([]);
  const [missionToys, setMissionToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [vIndex, setVIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    supabase
      .from("toys")
      .select("id, title, description, image, concepts, featured")
      .eq("status", "approved")
      .order("featured", { ascending: false }) // destaques entram mesmo se passar do limite
      .limit(20)
      .then(({ data, error }) => {
        if (error) setError(true);
        else {
          const all = data ?? [];
          // Os 2 da seção "Nossa missão" são os marcados com estrela no /admin (Brinquedos).
          setMissionToys(all.filter(t => t.featured).slice(0, 2) as Toy[]);
          const shuffled = [...all].sort(() => Math.random() - 0.5);
          setHomeToys(shuffled.slice(0, 4));
        }
        setLoading(false);
      });

    supabase
      .from("materials")
      .select("id, title, video_url, category")
      .order("created_at", { ascending: false })
      .then(({ data }) => setVideos((data as VideoRow[]) ?? []));
  }, []);

  // Avança o coverflow sozinho (pausa no hover).
  useEffect(() => {
    if (paused || videos.length < 2) return;
    const t = setInterval(() => setVIndex((i) => (i + 1) % videos.length), 2800);
    return () => clearInterval(t);
  }, [paused, videos.length]);

  const videoCats = [...new Set(videos.map((v) => v.category).filter(Boolean))] as string[];

  return (
    <Layout>
      {/* Banner Section */}
      <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative">
          <img
            src={t("inicio.banner")}
            alt="Banner Projeto Brinquedos Científicos"
            className="w-full h-auto block"
          />
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
                {t("inicio.card_conceito")}
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
              <h3 className="text-2xl font-black mb-4">Materiais de Apoio</h3>
              <p className="font-medium text-white/90 mb-6 leading-relaxed">
                {t("inicio.card_materiais")}
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
                {t("inicio.card_mostra")}
              </p>
              <Link href="/portfolio" className="inline-flex items-center font-bold hover:underline">
                Ver portfólio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agente BNCC Computação */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
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
              <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Bot className="h-4 w-4" /> Novidade: IA para professores
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
                Agente BNCC Computação
              </h2>
              <p className="text-white/85 text-xl leading-relaxed mb-8">
                Descreva o que você quer ensinar e receba uma atividade pronta, alinhada à BNCC Computação, com plano de aula, roteiro, folha do aluno e rubrica em PDF. Com Modo Robótica para a escola pública.
              </p>
              <Link
                href="/agente"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
              >
                Conhecer o agente <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full"
            >
              <Link href="/agente" className="block">
                <img
                  src={agenteImg}
                  alt="Atividade gerada pelo Agente BNCC Computação"
                  loading="lazy"
                  className="rounded-2xl shadow-2xl ring-1 ring-white/20 w-full h-auto"
                />
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
                {t("inicio.missao_texto")}
              </p>
              <ul className="space-y-4 pt-4">
                {t("inicio.missao_itens").split("\n").map(s => s.trim()).filter(Boolean).map((item, i) => (
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
              ) : missionToys.length >= 2 ? (
                <div className="grid grid-cols-2 gap-4">
                  <img src={cachifyImage(missionToys[0].image)} alt={missionToys[0].title} className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover" />
                  <img src={cachifyImage(missionToys[1].image)} alt={missionToys[1].title} className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover mt-8" />
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
              {t("inicio.galeria_sub")}
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

      {/* Envie seu brinquedo (formulário /submit → /admin → Envios da comunidade) */}
      <section className="pb-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-orange-100 p-8 md:p-12 lg:p-14"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-200/40" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-amber-200/40" />
            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-sm">
                  <School className="h-4 w-4" /> Para escolas e professores
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-5 leading-tight">
                  {t("inicio.envio_titulo")}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  {t("inicio.envio_texto")}
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:-translate-y-1 transition-all"
                >
                  <Send className="h-5 w-5" /> Enviar um brinquedo
                </Link>
                <p className="mt-4 text-sm text-muted-foreground">Gratuito. Leva uns 10 minutos.</p>
              </div>

              <ol className="space-y-4">
                {[
                  { icon: Send, title: "Envie pelo site", text: "Uma foto, os materiais usados, os conceitos que o brinquedo ensina e o guia de montagem em PDF." },
                  { icon: ClipboardCheck, title: "A equipe avalia", text: "O time do projeto confere cada envio antes de publicar." },
                  { icon: Sparkles, title: "Aprovado, vai para a galeria", text: "O brinquedo entra no Portfólio, com foto e guia, para outras escolas reproduzirem." },
                ].map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="flex gap-4 bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm border border-white">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-foreground text-white text-xs font-black flex items-center justify-center ring-2 ring-white">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{title}</h3>
                      <p className="text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vídeo Tutoriais */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden relative pt-24 pb-36">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="hsl(var(--primary))" />
          </svg>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <PlayCircle className="h-4 w-4" /> Biblioteca gratuita
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
                Aprenda com nossos vídeos
              </h2>
              <p className="text-white/85 text-xl leading-relaxed mb-8">
                {t("inicio.videos_texto")}
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { label: "Vídeos", value: videos.length ? String(videos.length) : "—" },
                  { label: "Categorias", value: videoCats.length ? String(videoCats.length) : "—" },
                  { label: "Gratuitos", value: "100%" },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-black text-white">{value}</div>
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
              className="lg:w-1/2 w-full"
            >
              <div
                className="relative h-64 sm:h-72 md:h-80 w-full"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {videos.map((v, i) => {
                  const off = ringOffset(i, vIndex, videos.length);
                  if (Math.abs(off) > 3) return null;
                  const p = COVER_POS[Math.abs(off)];
                  const sign = off > 0 ? 1 : off < 0 ? -1 : 0;
                  const thumb = videoThumb(v.video_url);
                  return (
                    <div
                      key={v.id}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%]"
                      style={{ zIndex: p.z }}
                    >
                      <motion.div
                        animate={{ x: `${p.x * sign}%`, scale: p.scale, opacity: p.opacity }}
                        transition={{ type: "spring", stiffness: 200, damping: 28 }}
                      >
                        <Link href="/materiais" className="block group" aria-label={v.title}>
                          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-orange-900/40 relative ring-1 ring-white/20">
                            {thumb && (
                              <img
                                src={thumb}
                                alt={v.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="h-5 w-5 text-orange-500 ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-6 pb-2.5">
                              <span className="text-white text-xs font-bold line-clamp-1">{v.title}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
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
              {t("inicio.cta_titulo")}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium">
              {t("inicio.cta_texto")}
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
