import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users, Microscope, Target, Heart } from "lucide-react";
import heroImg from "@/assets/images/hero.png";
import { team } from "@/lib/data";

export default function About() {
  return (
    <Layout>
      <div className="bg-primary pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Sobre o Projeto</h1>
          <p className="text-xl font-medium text-white/80 max-w-2xl mx-auto">
            Conheça a história, a missão e as pessoas por trás do Brinquedos Científicos.
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 space-y-6"
            >
              <h2 className="text-4xl font-black text-foreground mb-6">O que são <br/><span className="text-primary">Brinquedos Científicos?</span></h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  Brinquedos científicos são dispositivos lúdicos, muitas vezes construídos com materiais de baixo custo ou reciclados, que demonstram princípios científicos de forma prática e interativa.
                </p>
                <p>
                  Em vez de apenas ler sobre física ou química em um livro, as crianças constroem carrinhos, catapultas e vulcões, vivenciando a ciência na prática. Isso transforma o aprendizado em uma aventura.
                </p>
                <p>
                  Nosso projeto nasceu da necessidade de tornar o ensino de ciências mais acessível e cativante para escolas públicas e famílias em todo o Brasil.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 w-full"
            >
              <img src={heroImg} alt="Crianças brincando" className="w-full rounded-3xl shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
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

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-secondary font-bold bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Users className="h-5 w-5" /> Quem Somos
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Educadores, engenheiros e estudantes apaixonados por ensinar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mb-6 mx-auto w-56 h-56 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-lg text-primary font-bold">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}