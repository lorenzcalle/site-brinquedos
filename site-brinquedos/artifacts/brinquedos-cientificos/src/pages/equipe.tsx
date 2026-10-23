import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useState } from "react";
import { type TeamMember, initials, useTeam } from "@/lib/team";
import { RichLine, useSiteTexts } from "@/lib/site-texts";

function MembroCard({ membro, index }: { membro: TeamMember; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center group"
    >
      <div className="mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-xl bg-primary/10 flex items-center justify-center group-hover:border-primary transition-colors duration-300">
        {imgFailed || !membro.photo_url ? (
          <span className="text-3xl font-black text-primary">{initials(membro.name)}</span>
        ) : (
          <img
            src={membro.photo_url}
            alt={membro.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1">{membro.name}</h3>
      {membro.role && (
        <p className="text-primary font-bold text-sm mb-2">{membro.role}</p>
      )}
      {membro.bio && (
        <p className="text-muted-foreground text-sm leading-relaxed px-2 whitespace-pre-line">
          {membro.bio}
        </p>
      )}
    </motion.div>
  );
}

export default function Equipe() {
  const t = useSiteTexts();
  const { groups, loading } = useTeam();
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
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
              <RichLine text={t("equipe.apresentacao")} />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seções por grupo */}
      {loading && (
        <div className="py-24 flex flex-wrap justify-center gap-12">
          {[1, 2, 3, 4].map(i => <div key={i} className="w-48 h-48 rounded-full bg-gray-100 animate-pulse" />)}
        </div>
      )}
      {groups.filter(g => g.members.length > 0).map((grupo, gi) => (
        <section
          key={grupo.id}
          className={`py-24 ${gi % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-orange-600 font-bold bg-orange-100 px-4 py-2 rounded-full mb-4">
                <Users className="h-5 w-5" /> {grupo.title}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground">{grupo.title}</h2>
              {grupo.subtitle && (
                <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                  {grupo.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-12">
              {grupo.members.map((membro, i) => (
                <div key={membro.id} className="w-48">
                  <MembroCard membro={membro} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
}