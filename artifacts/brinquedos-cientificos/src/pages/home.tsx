import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { ArrowRight, BookOpen, Lightbulb, Play, Microscope, Users, TestTube, Target } from "lucide-react";
import heroImg from "@/assets/images/hero.png";
import { toys, team } from "@/lib/data";

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
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Crianças fazendo experimentos científicos" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/40"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center md:text-left flex flex-col md:items-start items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-block bg-secondary/90 text-white font-bold px-4 py-1.5 rounded-full text-sm mb-6 backdrop-blur-sm shadow-lg">
              Educação Lúdica e Inovadora
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              Aprender ciência <br/>
              <span className="text-secondary">brincando</span> e <span className="text-accent">criando!</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 font-medium max-w-2xl drop-shadow-md">
              Descubra um mundo de imaginação onde a física, química e engenharia viram brincadeira de criança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sobre" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Saiba Mais <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/materiais" className="bg-white hover:bg-gray-50 text-primary font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Materiais de Apoio <BookOpen className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section - Negative margin to pull it up over the hero */}
      <section className="container mx-auto px-4 md:px-6 relative z-20 -mt-20 mb-20">
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
            <Link href="/sobre" className="inline-flex items-center font-bold hover:underline">
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
                  "Integração entre escola e família"
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
              <div className="grid grid-cols-2 gap-4">
                <img src={toys[0].image} alt="Toy" className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover" />
                <img src={toys[1].image} alt="Toy" className="rounded-2xl shadow-lg w-full h-48 md:h-64 object-cover mt-8" />
              </div>
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
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {toys.slice(0, 4).map((toy) => (
              <motion.div key={toy.id} variants={fadeIn} className="group cursor-pointer">
                <Link href={`/portfolio/${toy.id}`}>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={toy.image} 
                        alt={toy.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white text-primary p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <Play className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{toy.title}</h3>
                      <p className="text-muted-foreground text-sm flex-1">{toy.description}</p>
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
          
          <div className="mt-12 text-center">
            <Link href="/portfolio" className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-lg px-8 py-4 rounded-xl transition-all">
              Ver Todos os Brinquedos <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Materiais de Apoio */}
      <section className="py-20 bg-green-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Materiais de Apoio</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos gratuitos para professores, pais e alunos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Guias de Construção", desc: "Passo a passo detalhado com fotos para montar os brinquedos em casa.", color: "bg-blue-500", icon: <BookOpen className="h-8 w-8" /> },
              { title: "Planos de Aula", desc: "Materiais alinhados à BNCC para professores aplicarem em sala de aula.", color: "bg-green-600", icon: <TestTube className="h-8 w-8" /> },
              { title: "Vídeo Tutoriais", desc: "Aprenda assistindo nossos vídeos explicativos sobre cada projeto.", color: "bg-orange-500", icon: <Play className="h-8 w-8" /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className={`${item.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground mb-6 text-lg">{item.desc}</p>
                <Link href="/materiais" className="text-primary font-bold flex items-center gap-2 hover:underline">
                  Acessar Biblioteca <ArrowRight className="h-4 w-4" />
                </Link>
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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:border-primary transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-lg text-primary font-bold">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LThoOHY4aC04em0wLThWMThoOHY4aC04em0tOC04VjEwaDh2OGgtOHptMCAwdjhINDBWMjZIMjZWMThoOHptLTgtOHY4aC04VjEwaDh6bTggMHY4SDI2VjEwaDh6TTI2IDM0djhoOHY4aC04di04SDE4djhoOFYzNEgyNnpNOCAzNHYtOGg4djhIOHptMC04VjE4aDh2OGgtOHptLTgtOFYxMGg4djo4SDBWMTh6bTggMHY4SDBWMThoOHptOCAwdjhIOFYxOGg4em04IDBWMThIMTh2OGg4em04IDhWMjZIMTh2OGg4em04IDBWMjZIMjZ2OGg4em04IDBWMjZIMzR2OGg4em0wIDBWMjZINDJ2OGg4em04IDBWMjZINDB2OGg4em0wLThWMThINDB2OGg4em0wIDBWMThINDJ2OGg4em0tOC04VjEwSDQwdjhoOHptOCAwVjEwSDQydjhoOHptOCAwVjEwSDQwdjh2MThoOHpNOCAyNnYtOEgwdjhoOHptMCA4VjI2SDB2OGg4em0wIDhWMzRIMHY4aDh6bTggMHYtOEg4djhIMTh2OGg4di04SDI2em0tOC04VjM0SDh2OGg4em0tOC04VjI2SDB2OGg4eiIgLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
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
            <Link href="/portfolio" className="inline-block bg-accent hover:bg-accent/90 text-white font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
              Acessar a Mostra de Projetos
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}