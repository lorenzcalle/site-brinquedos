import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Microscope, Target, Heart, ArrowRight, BookOpen, Cpu, GraduationCap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import logoURI from "@/assets/images/logo-uri.jpg";
import logoCNPq from "@/assets/images/logo-cnpq.png";
import logoMCTI from "@/assets/images/logo-mcti.jpg";
import logoPop from "@/assets/images/logo-pop.jpg";
import videoBC from "@/assets/videos/videobrinquedos.mp4";
import { useTeam, initials } from "@/lib/team";
import { useSiteTexts, richParagraphs } from "@/lib/site-texts";

const VISIBLE = 4;

export default function About() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const t = useSiteTexts();
  const { groups } = useTeam();
  // Todos os integrantes (achatados dos grupos) p/ o carrossel rotativo da equipe.
  const ALL_MEMBERS = groups.flatMap((g) => g.members);

  // Carrossel da equipe: 4 cards; a cada intervalo um deles troca pelo próximo
  // integrante, percorrendo toda a equipe em loop. Começa quando a equipe carrega.
  const [slots, setSlots] = useState<number[]>([]);
  const nextRef = useRef({ member: 0, slot: 0 });

  useEffect(() => {
    const n = ALL_MEMBERS.length;
    if (!n) return;
    setSlots(Array.from({ length: Math.min(VISIBLE, n) }, (_, k) => k));
    nextRef.current = { member: VISIBLE % n, slot: 0 };
    if (n <= VISIBLE) return;
    const timer = setInterval(() => {
      setSlots((prev) => {
        const { member, slot } = nextRef.current;
        const copy = [...prev];
        copy[slot] = member;
        nextRef.current = {
          member: (member + 1) % n,
          slot: (slot + 1) % VISIBLE,
        };
        return copy;
      });
    }, 2600);
    return () => clearInterval(timer);
  }, [ALL_MEMBERS.length]);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-black mb-4">Sobre o Projeto</h1>
          <p className="text-xl font-medium text-white/80 max-w-2xl mx-auto">
            Conheça a história, a missão e as pessoas por trás do Brinquedos Científicos.
          </p>
        </div>
      </div>

      {/* Realização e Apoio */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
            {/* Realização */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Realização</span>
              <img src={logoURI} alt="URI – Campus Santo Ângelo" className="h-24 w-auto object-contain" />
            </div>

            {/* Divisor */}
            <div className="hidden md:block w-px self-stretch bg-gray-200" />

            {/* Apoio */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Apoio</span>
              <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
                {/* CNPq: o arquivo é uma faixa larga (CNPq + MCTI + Governo Federal);
                    recortamos para mostrar só a parte do CNPq. Ajuste a largura (px) se precisar. */}
                <div className="h-16 overflow-hidden flex items-center" style={{ width: 144 }}>
                  <img src={logoCNPq} alt="CNPq" className="h-16 max-w-none object-left" />
                </div>
                {[
                  { src: logoMCTI, alt: "Ministério da Ciência, Tecnologia e Inovação (MCTI)" },
                  { src: logoPop, alt: "PopCiência" },
                ].map((logo) => (
                  <img key={logo.alt} src={logo.src} alt={logo.alt} className="h-20 w-auto object-contain" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Do que se trata */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-foreground">
              Do que se trata o <span className="text-primary">Projeto?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <GraduationCap className="h-7 w-7 text-primary" />,
                title: "A Iniciativa",
                text: t("sobre.iniciativa"),
              },
              {
                icon: <Cpu className="h-7 w-7 text-primary" />,
                title: "A Metodologia",
                text: t("sobre.metodologia"),
              },
              {
                icon: <BookOpen className="h-7 w-7 text-primary" />,
                title: "O Impacto",
                text: t("sobre.impacto"),
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O que são Brinquedos Científicos */}
      <section id="o-que-sao" className="py-20 bg-white scroll-mt-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 space-y-6"
            >
              <h2 className="text-4xl font-black text-foreground mb-6">O que são <br /><span className="text-primary">Brinquedos Científicos?</span></h2>
              <div className="prose prose-lg text-muted-foreground">
                {richParagraphs(t("sobre.o_que_sao")).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 w-full"
            >
              <video
                src={videoBC}
                className="w-full rounded-3xl shadow-2xl"
                controls
                playsInline
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Missão / Visão / Valores */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-foreground mb-4">
              Nossos <span className="text-primary">Princípios</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Os valores que guiam cada decisão e atividade do projeto.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="h-10 w-10 text-white" />, title: "Missão", desc: "Desmistificar o aprendizado de ciências exatas através do brincar e do construir.", bg: "bg-primary" },
              { icon: <Microscope className="h-10 w-10 text-white" />, title: "Visão", desc: "Ser referência nacional na criação de recursos lúdicos para educação científica.", bg: "bg-secondary" },
              { icon: <Heart className="h-10 w-10 text-white" />, title: "Valores", desc: "Acessibilidade, Sustentabilidade, Curiosidade e Alegria.", bg: "bg-accent" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className={`${item.bg} w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-secondary font-bold bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Users className="h-5 w-5" /> Quem Somos
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Educadores e estudantes apaixonados por ensinar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {slots.map((memberIdx, slot) => {
              const member = ALL_MEMBERS[memberIdx];
              if (!member) return null;
              return (
                <div key={slot} className="text-center min-h-[20rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.95 }}
                      transition={{ duration: 0.45 }}
                      className="group"
                    >
                      <div className="mb-5 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl group-hover:border-primary transition-colors duration-300 bg-primary/10 flex items-center justify-center">
                        {member.photo_url
                          ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                          : <span className="text-3xl font-black text-primary">{initials(member.name)}</span>}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                      {member.role && <p className="text-primary font-bold text-sm mb-2">{member.role}</p>}
                      <p className="text-muted-foreground text-sm leading-relaxed px-2 line-clamp-3 whitespace-pre-line">{member.bio}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/equipe" className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all">
              Conheça toda a equipe <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Quer conhecer os projetos?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Explore a galeria completa de brinquedos científicos desenvolvidos pelo projeto.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/portfolio" className="inline-flex items-center gap-2 bg-white text-primary font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
                Ver Portfólio <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
