import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  FileText,
  GraduationCap,
  MessageSquareText,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import fig1 from "@/assets/images/agente/fig1_modo_ligado.png";
import fig2 from "@/assets/images/agente/fig2_card_robotica.png";
import fig4 from "@/assets/images/agente/fig4_base_robotica.png";

const APP_URL = "https://bncc-agente-812989596718.southamerica-east1.run.app/";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const steps = [
  {
    icon: MessageSquareText,
    title: "1. Descreva na sua linguagem",
    text: "Diga o que você quer ensinar, do seu jeito, como falaria com um colega. Escolha a disciplina e o ano, e o agente cuida do resto.",
    image: fig1,
    alt: "Tela inicial do agente, com o campo para descrever a aula e o Modo Robótica ativado",
  },
  {
    icon: Sparkles,
    title: "2. Receba a atividade alinhada à BNCC",
    text: "A atividade vem pronta, com a habilidade oficial da BNCC Computação (código e texto) e a habilidade da sua disciplina, explicando como uma conecta com a outra.",
    image: fig2,
    alt: "Atividade gerada pelo agente mostrando a conexão com a BNCC Computação e a habilidade EF15CO02",
  },
  {
    icon: FileText,
    title: "3. Exporte em PDF nos 4 formatos",
    text: "Cada atividade vira um documento com Plano de Aula, Roteiro do Professor, Folha do Aluno e Rubrica de avaliação, prontos para imprimir e levar para a sala.",
    image: fig4,
    alt: "Base do agente com as fontes de robótica e suas licenças abertas",
  },
];

const trustItems = [
  {
    icon: Star,
    title: "Avaliado por professores",
    text: "Nota média 4,41 de 5 e 93% de concordância no questionário TAM, respondido por professores que testaram a ferramenta.",
  },
  {
    icon: ShieldCheck,
    title: "Zero alucinação de habilidade",
    text: "Em teste com 20 casos, todas as habilidades da BNCC citadas pelo agente eram reais, com código e texto corretos.",
  },
  {
    icon: CheckCircle2,
    title: "Fontes citadas e verificadas",
    text: "Toda atividade cita as fontes da base curada do agente, e cada fonte tem a licença de uso verificada.",
  },
];

export default function AgenteBncc() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Bot className="h-4 w-4" /> Produto educacional de IA · Bolsa PTB URI
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Descreva o que você quer ensinar. O agente devolve uma atividade pronta, alinhada à BNCC Computação.
              </h1>
              <p className="text-xl text-white/85 mb-10 leading-relaxed">
                O Agente BNCC Computação é um assistente para professores da Educação Básica. Você escreve na sua linguagem e recebe uma atividade completa, com a habilidade oficial da BNCC e materiais prontos para imprimir.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
                >
                  Usar o agente (grátis) <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#materiais"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all"
                >
                  Ver materiais prontos
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">Como funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Três passos entre a sua ideia e a atividade impressa na mão dos alunos.
            </p>
          </div>
          <div className="space-y-20">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10`}
              >
                <div className="lg:w-2/5 space-y-4">
                  <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 p-3 rounded-2xl">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
                <div className="lg:w-3/5 w-full">
                  <img
                    src={step.image}
                    alt={step.alt}
                    loading="lazy"
                    className="rounded-2xl shadow-xl border border-gray-100 w-full h-auto"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modo Robótica */}
      <section className="py-20 bg-blue-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 text-indigo-700 font-bold bg-indigo-100 px-4 py-2 rounded-full mb-6">
              <Cpu className="h-5 w-5" /> Modo Robótica
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
              Robótica para a escola pública, plugada e desplugada
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              O Modo Robótica usa uma base curada de robótica livre: projetos com sucata, micro:bit, Arduino, materiais da OBR e da Olimpíada Missioneira de Robótica. As atividades podem ser plugadas ou desplugadas, pensadas para a realidade da escola pública, na mesma linha dos brinquedos científicos deste site.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {["Sucata e baixo custo", "micro:bit e Arduino", "OBR e Olimpíada Missioneira", "Atividades desplugadas"].map((tag) => (
              <div key={tag} className="bg-white rounded-xl px-4 py-3 text-center font-bold text-foreground/80 shadow-sm border border-gray-100">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">Feito para você confiar no resultado</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O agente foi avaliado como produto educacional dentro de um projeto de pesquisa da URI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 p-3 rounded-2xl mb-5">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materiais para baixar */}
      <section id="materiais" className="py-20 bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12 text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-4">É isto que sai da ferramenta</h2>
            <p className="text-xl text-white/85 leading-relaxed">
              Os materiais abaixo foram gerados e exportados pelo próprio agente em Modo Robótica. Baixe, use na sua aula e veja o que o agente entrega antes mesmo de criar sua conta.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold mt-6">
              Licença aberta CC BY 4.0: use, adapte e compartilhe citando a fonte
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <a
              href="/downloads/guia-professor-robotica.pdf"
              download
              className="bg-white rounded-2xl p-8 shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-700 p-3 rounded-2xl">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-indigo-700 transition-colors">
                    Guia do Professor: Robótica
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Guia de 5 páginas para começar a usar o agente e a robótica em sala de aula. PDF, CC BY 4.0.
                  </p>
                  <span className="inline-flex items-center gap-2 font-bold text-indigo-700">
                    <Download className="h-5 w-5" /> Baixar o guia (PDF)
                  </span>
                </div>
              </div>
            </a>
            <a
              href="/downloads/kit-atividades-robotica.zip"
              download
              className="bg-white rounded-2xl p-8 shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-700 p-3 rounded-2xl">
                  <Package className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-indigo-700 transition-colors">
                    Kit de Atividades de Robótica
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    O guia mais 4 atividades completas, cada uma com Plano de Aula, Roteiro do Professor, Folha do Aluno e Rubrica. ZIP com 17 PDFs, CC BY 4.0.
                  </p>
                  <span className="inline-flex items-center gap-2 font-bold text-indigo-700">
                    <Download className="h-5 w-5" /> Baixar o kit (ZIP)
                  </span>
                </div>
              </div>
            </a>
          </div>
          <div className="text-center mt-12">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
            >
              Criar minha primeira atividade <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé institucional */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 p-3 rounded-2xl mb-6">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">Um produto de pesquisa da URI</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Agente BNCC Computação é o produto educacional de um projeto de bolsa PTB da URI (Edital 03/2025), desenvolvido pelo bolsista Lorenzo Callegaro sob orientação do Prof. Denilson Rodrigues da Silva. O projeto se conecta ao Brinquedos Científicos, à Mostra Missioneira de Brinquedos Científicos e à Olimpíada Missioneira de Robótica, levando a computação e a robótica para as escolas da região.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
