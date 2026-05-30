import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users, Microscope, Target, Heart, ArrowRight, BookOpen, Cpu, GraduationCap } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import logoURI from "@/assets/images/logo-principal.png";
import videoBC from "@/assets/videos/videobrinquedos.mp4";
import { team } from "@/lib/data";

export default function About() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-black mb-4">Sobre o Projeto</h1>
          <p className="text-xl font-medium text-white/80 max-w-2xl mx-auto mb-10">
            Conheça a história, a missão e as pessoas por trás do Brinquedos Científicos.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Realização</span>
            <img src={logoURI} alt="Brinquedos Científicos" className="h-12 object-contain brightness-0 invert opacity-90" />
          </div>
        </div>
      </div>

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
                text: "O projeto Brinquedos Científicos é uma iniciativa educacional promovida pela URI – Campus Santo Ângelo, com apoio financeiro do Governo Federal, por meio do CNPq e do MCTI. Seu objetivo é estimular o interesse de estudantes pelas áreas de ciência, tecnologia e inovação, promovendo inclusão e protagonismo — especialmente entre jovens e meninas.",
              },
              {
                icon: <Cpu className="h-7 w-7 text-primary" />,
                title: "A Metodologia",
                text: "Desenvolvido em escolas públicas da Região das Missões, o projeto adota atividades mão na massa: construção de brinquedos científicos e aprendizado de eletrônica, robótica e programação. Essas experiências permitem que os estudantes compreendam, de forma concreta, conteúdos que muitas vezes são apresentados apenas na teoria.",
              },
              {
                icon: <BookOpen className="h-7 w-7 text-primary" />,
                title: "O Impacto",
                text: "O projeto conta com vídeos tutoriais, materiais didáticos e acompanhamento pedagógico, garantindo uma aprendizagem estruturada. A integração entre teoria e prática estimula criatividade, pensamento crítico e trabalho em equipe, preparando os participantes para os desafios do futuro.",
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
                <p>
                  Um brinquedo científico é um objeto lúdico criado para demonstrar, de forma prática e interativa, conceitos de ciência, tecnologia, engenharia ou matemática. Diferente de um brinquedo comum, ele não serve apenas para entretenimento, mas também para ensinar, permitindo que a pessoa aprenda enquanto brinca. Esses brinquedos transformam ideias abstratas — como eletricidade, força, movimento ou programação — em experiências concretas e fáceis de entender.
                </p>
                <p>
                  Geralmente, os brinquedos científicos são simples de montar e utilizam materiais acessíveis, o que facilita sua reprodução em ambientes educativos, como escolas e projetos pedagógicos. Exemplos incluem carrinhos movidos a motor elétrico, circuitos com luzes, catapultas, robôs básicos ou dispositivos que demonstram princípios físicos. Ao construir e testar esses objetos, os estudantes desenvolvem habilidades como raciocínio lógico, criatividade e resolução de problemas.
                </p>
                <p>
                  Além do aprendizado técnico, os brinquedos científicos também estimulam a curiosidade e o pensamento crítico. Eles incentivam a experimentação, o erro e a descoberta. Dessa forma, são ferramentas importantes para aproximar a ciência do cotidiano e despertar o interesse dos alunos pelas áreas tecnológicas.
                </p>
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
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="mb-5 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl group-hover:border-primary transition-colors duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-bold text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed px-2">{member.bio}</p>
              </motion.div>
            ))}
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
