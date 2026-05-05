import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users, Microscope, Target, Heart } from "lucide-react";
import heroImg from "@/assets/images/hero.png";
import videoBC from "@/assets/videos/videobrinquedos.mp4";
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

      {/* NOVA SEÇÃO - Do que se trata o projeto? */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-foreground">
              Do que se trata o <span className="text-primary">Projeto?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "O projeto Brinquedos Científicos é uma iniciativa educacional promovida pela URI – Campus Santo Ângelo, com apoio financeiro do Governo Federal, por meio do CNPq e do MCTI. Seu objetivo é estimular o interesse de estudantes pelas áreas de ciência, tecnologia e inovação, despertando a curiosidade — especialmente entre jovens e meninas — e promovendo a inclusão e o protagonismo no universo tecnológico.",
              "Desenvolvido em escolas públicas da Região das Missões, o projeto adota uma metodologia baseada em atividades mão na massa, como a construção de brinquedos científicos e o aprendizado de conceitos relacionados à eletrônica, robótica e programação. Essas experiências permitem que os estudantes compreendam, de forma concreta, conteúdos que muitas vezes são apresentados apenas na teoria.",
              "Além disso, o projeto conta com o suporte de vídeos tutoriais, materiais didáticos e acompanhamento pedagógico, garantindo uma aprendizagem estruturada e de qualidade. A integração entre teoria e prática estimula criatividade, pensamento crítico e trabalho em equipe, preparando os participantes para os desafios do futuro."
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100"
              >
                <p className="text-muted-foreground text-lg leading-relaxed text-justify">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 w-full"
            >
              {/* Por isso: */}
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
              Educadores e estudantes apaixonados por ensinar.
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