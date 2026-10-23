import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import bannerImg from "@/assets/images/banner-principal.jpg";

// Textos do site editáveis no /admin (seção Textos). O valor padrão é o texto que já
// estava no código: chave sem linha em `site_texts` usa o padrão, então apagar a linha
// ("Restaurar texto original") volta ao texto de fábrica.
//
// Para tornar um texto novo editável: acrescentar a chave aqui e trocar o texto fixo da
// página por `t("chave")`. O /admin monta o formulário a partir desta lista.

export type SiteTextDef = {
  key: string;
  label: string;
  default: string;
  kind?: "line" | "text" | "image"; // line = uma linha; text = parágrafos; image = URL de imagem
  help?: string;
};

export type SiteTextPage = { page: string; path: string; texts: SiteTextDef[] };

export const SITE_TEXT_PAGES: SiteTextPage[] = [
  {
    page: "Página inicial",
    path: "/",
    texts: [
      { key: "inicio.banner", label: "Banner do topo", kind: "image", default: bannerImg, help: "Imagem larga (ex.: 1920 × 600). Aparece inteira, sem corte." },
      { key: "inicio.card_conceito", label: "Card “O que são Brinquedos Científicos?”", kind: "text", default: "São projetos lúdicos que ensinam conceitos complexos de forma simples, tátil e divertida." },
      { key: "inicio.card_materiais", label: "Card “Materiais de Apoio”", kind: "text", default: "Baixe nossos manuais detalhados e planos de aula para usar em casa ou na sala de aula." },
      { key: "inicio.card_mostra", label: "Card “Mostra de Projetos”", kind: "text", default: "Explore a galeria completa dos brinquedos que já desenvolvemos e inspire-se." },
      { key: "inicio.missao_texto", label: "Nossa Missão — texto", kind: "text", default: "Acreditamos que a melhor forma de aprender é fazendo. Nosso projeto desenvolve brinquedos que as próprias crianças podem construir, transformando conceitos abstratos em experiências reais e empolgantes." },
      {
        key: "inicio.missao_itens", label: "Nossa Missão — lista", kind: "text", help: "Um item por linha.",
        default: [
          "Desenvolvimento do pensamento crítico",
          "Estímulo à criatividade e resolução de problemas",
          "Acessibilidade com materiais de baixo custo",
          "Aprendizado prático de eletrônica e robótica",
          "Inclusão e protagonismo feminino na tecnologia",
          "Integração entre teoria e experiências concretas",
        ].join("\n"),
      },
      { key: "inicio.galeria_sub", label: "Galeria de Projetos — subtítulo", default: "Conheça alguns dos nossos brinquedos científicos mais populares." },
      { key: "inicio.envio_titulo", label: "Envie seu brinquedo — título", default: "Sua escola também cria brinquedos científicos?" },
      { key: "inicio.envio_texto", label: "Envie seu brinquedo — texto", kind: "text", default: "Professores e estudantes podem enviar seus próprios brinquedos para a nossa galeria. A equipe do projeto avalia cada envio e, se aprovado, ele passa a inspirar outras escolas." },
      { key: "inicio.videos_texto", label: "Aprenda com nossos vídeos — texto", kind: "text", default: "Explore os materiais disponíveis em nossa Biblioteca e aprenda mais sobre design, desenvolvimento de produtos, componentes eletrônicos e muito mais." },
      { key: "inicio.cta_titulo", label: "Chamada final — título", default: "Pronto para colocar a mão na massa?" },
      { key: "inicio.cta_texto", label: "Chamada final — texto", kind: "text", default: "Explore nossa Mostra de Brinquedos Científicos e comece seu primeiro projeto hoje mesmo." },
    ],
  },
  {
    page: "O Projeto",
    path: "/sobre",
    texts: [
      { key: "sobre.iniciativa", label: "Card “A Iniciativa”", kind: "text", default: "O projeto Brinquedos Científicos é uma iniciativa educacional promovida pela URI – Campus Santo Ângelo, com apoio financeiro do Governo Federal, por meio do CNPq e do MCTI. Seu objetivo é estimular o interesse de estudantes pelas áreas de ciência, tecnologia e inovação, promovendo inclusão e protagonismo — especialmente entre jovens e meninas." },
      { key: "sobre.metodologia", label: "Card “A Metodologia”", kind: "text", default: "Desenvolvido em escolas públicas da Região das Missões, o projeto adota atividades mão na massa: construção de brinquedos científicos e aprendizado de eletrônica, robótica e programação. Essas experiências permitem que os estudantes compreendam, de forma concreta, conteúdos que muitas vezes são apresentados apenas na teoria." },
      { key: "sobre.impacto", label: "Card “O Impacto”", kind: "text", default: "O projeto conta com vídeos tutoriais, materiais didáticos e acompanhamento pedagógico, garantindo uma aprendizagem estruturada. A integração entre teoria e prática estimula criatividade, pensamento crítico e trabalho em equipe, preparando os participantes para os desafios do futuro." },
      {
        key: "sobre.o_que_sao", label: "O que são Brinquedos Científicos?", kind: "text", help: "Linha em branco separa parágrafos.",
        default: [
          "Um brinquedo científico é um objeto lúdico criado para demonstrar, de forma prática e interativa, conceitos de ciência, tecnologia, engenharia ou matemática. Diferente de um brinquedo comum, ele não serve apenas para entretenimento, mas também para ensinar, permitindo que a pessoa aprenda enquanto brinca. Esses brinquedos transformam ideias abstratas — como eletricidade, força, movimento ou programação — em experiências concretas e fáceis de entender.",
          "Geralmente, os brinquedos científicos são simples de montar e utilizam materiais acessíveis, o que facilita sua reprodução em ambientes educativos, como escolas e projetos pedagógicos. Exemplos incluem carrinhos movidos a motor elétrico, circuitos com luzes, catapultas, robôs básicos ou dispositivos que demonstram princípios físicos. Ao construir e testar esses objetos, os estudantes desenvolvem habilidades como raciocínio lógico, criatividade e resolução de problemas.",
          "Além do aprendizado técnico, os brinquedos científicos também estimulam a curiosidade e o pensamento crítico. Eles incentivam a experimentação, o erro e a descoberta. Dessa forma, são ferramentas importantes para aproximar a ciência do cotidiano e despertar o interesse dos alunos pelas áreas tecnológicas.",
        ].join("\n\n"),
      },
    ],
  },
  {
    page: "Equipe",
    path: "/equipe",
    texts: [
      { key: "equipe.apresentacao", label: "Quem está por trás do projeto?", kind: "text", help: "Use **asteriscos duplos** para negrito.", default: "O **Projeto Brinquedos Científicos** é resultado do trabalho dedicado de professores, pesquisadores e estudantes da URI e de professores da Educação Básica que acreditam no poder da educação científica para transformar realidades. Nossa equipe reúne diferentes formações e olhares, unidos pelo mesmo compromisso: levar ciência de qualidade para dentro e fora da universidade, com criatividade, rigor e muita vontade de fazer diferença." },
    ],
  },
  {
    page: "Contato e rodapé",
    path: "/contato",
    texts: [
      { key: "contato.telefone", label: "Telefone", default: "+55 (55) 3313-7900" },
      { key: "contato.whatsapp", label: "WhatsApp (botão verde)", default: "555533137900", help: "Só números, com 55 e DDD." },
      { key: "contato.email", label: "E-mail", default: "bc@san.uri.br", help: "Só o texto exibido. O formulário de contato continua enviando para bc@san.uri.br (configurado no EmailJS)." },
      { key: "contato.endereco", label: "Endereço", kind: "text", default: "Av. Universidade das Missões, 464 — Universitário\nSanto Ângelo – RS" },
      { key: "rodape.frase", label: "Frase do rodapé", kind: "text", default: "Aprender ciência brincando e criando! Um projeto dedicado à educação e inovação." },
      { key: "redes.instagram", label: "Instagram", default: "https://www.instagram.com/brinquecienciauri/", help: "Vazio esconde o ícone." },
      { key: "redes.youtube", label: "YouTube", default: "", help: "Vazio esconde o ícone." },
      { key: "redes.site_uri", label: "Site da URI", default: "https://san.uri.br/sites/site_novo/", help: "Vazio esconde o ícone." },
    ],
  },
];

const DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_TEXT_PAGES.flatMap(p => p.texts.map(t => [t.key, t.default])),
);

// Carrega uma vez por visita e compartilha entre os componentes. O último valor fica no
// localStorage para que, na próxima visita, o texto editado apareça sem piscar o padrão.
const STORAGE_KEY = "site-texts";
let cache: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;
const listeners = new Set<(v: Record<string, string>) => void>();

function readStored(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function loadSiteTexts(force = false): Promise<Record<string, string>> {
  if (!pending || force) {
    pending = Promise.resolve(
      supabase.from("site_texts").select("key, value").then(({ data, error }) => {
        if (error) return cache ?? readStored();
        const v = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
        cache = v;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* sem storage */ }
        listeners.forEach(l => l(v));
        return v;
      }),
    );
  }
  return pending;
}

export function useSiteTexts() {
  const [values, setValues] = useState<Record<string, string>>(() => cache ?? readStored());
  useEffect(() => {
    listeners.add(setValues);
    loadSiteTexts().then(setValues);
    return () => { listeners.delete(setValues); };
  }, []);
  return (key: string): string => values[key] ?? DEFAULTS[key] ?? "";
}

// Texto com **negrito** e quebras: linha em branco separa parágrafos (cada um vira <p>),
// quebra simples vira <br>.
export function richParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

export function RichLine({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/\*\*(.+?)\*\*/g).map((part, i) =>
            i % 2 ? <strong key={i} className="text-foreground">{part}</strong> : part,
          )}
        </span>
      ))}
    </>
  );
}
