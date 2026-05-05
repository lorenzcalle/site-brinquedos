import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { grupos } from "@/lib/data";

type Membro = (typeof grupos)[0]["membros"][0];

function MembroCard({ membro, index }: { membro: Membro; index: number }) {
  const iniciais = membro.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center"
    >
      <div className="mb-6 mx-auto w-56 h-56 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl relative bg-primary/10">
        <img
          src={membro.foto}
          alt={membro.nome}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-1">{membro.nome}</h3>
      <p className="text-lg text-primary font-bold">{membro.cargo}</p>
    </motion.div>
  );
}

export default function Equipe() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Nossa Equipe</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Conheça os responsáveis pelo projeto
          </p>
        </div>
      </div>

      {/* Texto de apresentação */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-black text-foreground mb-4">
              Quem está por trás do projeto?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              O <strong className="text-foreground">Projeto Brinquedos Científicos</strong> é resultado do trabalho dedicado de
              professores, pesquisadores e estudantes da URI que acreditam no poder da educação científica
              para transformar realidades. Nossa equipe reúne diferentes formações e olhares, unidos pelo
              mesmo compromisso: levar ciência de qualidade para dentro e fora da universidade, com
              criatividade, rigor e muita vontade de fazer diferença.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seções por grupo */}
      {grupos.map((grupo, gi) => (
        <section
          key={grupo.id}
          className={`py-24 ${gi % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="container mx-auto px-4 md:px-6">
            {/* Cabeçalho */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-orange-600 font-bold bg-orange-100 px-4 py-2 rounded-full mb-4">
                <Users className="h-5 w-5" /> {grupo.titulo}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground">Nossa Equipe</h2>
              <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                {grupo.subtitulo}
              </p>
            </div>

            {/* Grid de membros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {grupo.membros.map((membro, i) => (
                <MembroCard key={membro.id} membro={membro} index={i} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
}