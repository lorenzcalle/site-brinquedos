import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, Search } from "lucide-react";
import type { Section } from "@/pages/admin";
import { SectionHeader, SubHeading, btn, inputCls } from "./ui";

// Central de ajuda: passo a passo curto das tarefas mais comuns. Texto simples de
// propósito — quem lê pode nunca ter mexido num site.
type Topic = { q: string; steps: string[]; tip?: string; go?: Section };

const GROUPS: { title: string; topics: Topic[] }[] = [
  {
    title: "Eventos",
    topics: [
      {
        q: "Como divulgar um evento novo?", go: "eventos",
        steps: [
          "Vá em Eventos e clique em “Novo evento”.",
          "Na aba Informações, escreva o nome, a data (ou marque “Ainda sem data”), o horário e o local.",
          "Se tiver inscrição, vá na aba Inscrição e cole o link do formulário (Google Forms, por exemplo) e o último dia.",
          "Clique em Salvar. O evento já aparece em “Próximos eventos” no site.",
        ],
        tip: "Depois da data, o evento passa sozinho para “Eventos passados”. Não precisa fazer nada.",
      },
      {
        q: "Como colocar as fotos depois que o evento aconteceu?", go: "eventos",
        steps: [
          "Em Eventos, clique no evento.",
          "Abra a aba Fotos e arraste as fotos do computador para “Adicionar” (ou clique e escolha).",
          "Arraste uma foto para mudar a ordem. A primeira vira a capa se não houver capa.",
          "Se as fotos estiverem num álbum do Google Drive, cole o link da pasta em “Álbum completo”.",
          "Clique em Salvar.",
        ],
        tip: "4 a 6 fotos ficam bem. Fotos em pé perdem um pouco do topo e da base, porque o site corta no formato da tela.",
      },
      {
        q: "Como publicar regulamento, ficha de inscrição e outros arquivos?", go: "eventos",
        steps: [
          "Abra o evento e vá na aba Materiais.",
          "Clique em “Adicionar documento”, dê um nome (ex.: Regulamento) e solte o arquivo em “Enviar arquivo”.",
          "Se o arquivo ainda não existe, deixe sem arquivo: o botão aparece como “Em breve”.",
          "Em “Datas importantes”, escreva as datas como quiser (ex.: 15/06/2026 a 18/09/2026).",
        ],
        tip: "Os materiais aparecem no site só enquanto o evento estiver em “Próximos”.",
      },
    ],
  },
  {
    title: "Brinquedos e vídeos",
    topics: [
      {
        q: "Como cadastrar um brinquedo no Portfólio?", go: "brinquedos",
        steps: [
          "Em Brinquedos, clique em “Novo brinquedo”.",
          "Escreva o nome, envie uma foto e escreva a descrição (os três são obrigatórios).",
          "Em “Conceitos científicos” e “Materiais usados”, digite um item e aperte Enter para cada um.",
          "Se tiver o guia de construção em PDF, solte o arquivo em “Enviar PDF”.",
          "Clique em Publicar.",
        ],
      },
      {
        q: "Como escolher os brinquedos da página inicial?", go: "brinquedos",
        steps: [
          "Em Brinquedos, clique na estrela ☆ do brinquedo.",
          "A página inicial mostra 2. Para trocar, tire a estrela de um antes de pôr em outro.",
        ],
      },
      {
        q: "Alguém mandou um brinquedo pelo site. E agora?", go: "submissoes",
        steps: [
          "Abra “Envios da comunidade”. O número em amarelo no menu mostra quantos esperam revisão.",
          "Leia o envio. “Aprovar e publicar” coloca no Portfólio na hora.",
          "“Rejeitar” guarda em Rejeitados — dá para restaurar depois.",
        ],
        tip: "Depois de aprovar, dá para corrigir texto ou foto em Brinquedos.",
      },
      {
        q: "Como colocar um vídeo tutorial?", go: "videos",
        steps: [
          "Suba o vídeo no YouTube (ou no Google Drive, com acesso “qualquer pessoa com o link”).",
          "Em Vídeos, clique em “Novo vídeo” e cole o endereço do vídeo.",
          "Escolha a categoria e o nível e clique em Salvar.",
        ],
      },
    ],
  },
  {
    title: "Páginas do site",
    topics: [
      {
        q: "Como mudar um texto ou o banner da página inicial?", go: "textos",
        steps: [
          "Em “Textos do site”, escolha a página (Página inicial, O Projeto…).",
          "Altere o texto. O campo mudado fica marcado como “não salvo”.",
          "Clique em Salvar na barra que aparece embaixo.",
          "Para o banner, solte a imagem nova em “Trocar imagem”.",
        ],
        tip: "“Restaurar original” volta o texto ao que era quando o site foi feito.",
      },
      {
        q: "Como adicionar ou mudar alguém da Equipe?", go: "equipe",
        steps: [
          "Em Equipe, clique em “Adicionar pessoa” dentro do grupo certo.",
          "Escreva o nome, o cargo e solte a foto no círculo.",
          "Para mudar a ordem, arraste a pessoa. Para trocar de grupo, abra a pessoa e escolha outro grupo.",
        ],
      },
    ],
  },
  {
    title: "Publicar e acessos",
    topics: [
      {
        q: "Preciso clicar em Publicar depois de mudar algo?",
        steps: [
          "Não para quem visita o site: o que você salva aparece na hora.",
          "O Publicar atualiza a versão que o Google e as prévias de link (WhatsApp) leem. Leva uns 2 minutos e não tira o site do ar.",
          "Quando houver mudanças ainda não publicadas, o botão Publicar fica laranja e mostra quantas.",
        ],
        tip: "Vale publicar depois de criar um evento ou brinquedo novo, para o link já sair bonito no WhatsApp.",
      },
      {
        q: "Como dar acesso ao painel para outra pessoa?", go: "acesso",
        steps: [
          "Em “Acesso ao painel”, clique em “Adicionar pessoa”.",
          "Escreva o nome e o e-mail. A senha provisória já vem sugerida.",
          "Em até 1 minuto aparece uma mensagem pronta: copie e mande para a pessoa (WhatsApp ou e-mail).",
          "No primeiro acesso, ela cria a própria senha.",
        ],
      },
      {
        q: "Esqueci minha senha.",
        steps: [
          "Peça para outra pessoa com acesso abrir “Acesso ao painel”, clicar no ⋯ ao lado do seu nome e em “Gerar senha provisória”.",
          "Entre com a senha provisória: o painel pede para você criar uma nova.",
        ],
        tip: "Para trocar a senha sem ter esquecido, clique no seu nome, no canto de baixo do menu.",
      },
      {
        q: "Errei. Dá para desfazer?",
        steps: [
          "Antes de salvar: clique em Cancelar (ou feche a janela) e escolha “Descartar”.",
          "Depois de salvar: abra de novo e corrija. O histórico na tela Início mostra quem mudou o quê e quando.",
          "Excluir não tem volta — por isso o painel sempre pergunta antes.",
        ],
      },
    ],
  },
];

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function HelpAdmin({ go }: { go: (s: Section) => void }) {
  const [q, setQ] = useState("");
  const words = norm(q).split(/\s+/).filter(Boolean);
  const match = (t: Topic) => !words.length || words.every(w => norm([t.q, ...t.steps, t.tip ?? ""].join(" ")).includes(w));
  const groups = GROUPS.map(g => ({ ...g, topics: g.topics.filter(match) })).filter(g => g.topics.length);

  return (
    <>
      <SectionHeader title="Ajuda" subtitle="Passo a passo das tarefas mais comuns. Clique numa pergunta para abrir." />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar (ex.: fotos, senha, inscrição)" aria-label="Buscar na ajuda" className={`${inputCls} pl-9`} />
      </div>
      {groups.length === 0 && <p className="text-gray-500">Nada encontrado para “{q}”.</p>}
      {groups.map(g => (
        <div key={g.title} className="mb-8">
          <SubHeading>{g.title}</SubHeading>
          <Accordion type="multiple" className="bg-white rounded-2xl border border-gray-200/80 shadow-sm px-5">
            {g.topics.map(t => (
              <AccordionItem key={t.q} value={t.q} className="last:border-b-0">
                <AccordionTrigger className="text-left font-bold hover:no-underline">{t.q}</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-1.5 text-[15px] text-gray-700">
                    {t.steps.map(s => <li key={s}>{s}</li>)}
                  </ol>
                  {t.tip && <p className="mt-3 flex gap-2 text-sm text-blue-900 bg-blue-50 rounded-xl px-3 py-2"><Lightbulb className="h-4 w-4 mt-0.5 shrink-0" /> {t.tip}</p>}
                  {t.go && <button onClick={() => go(t.go!)} className={`${btn.link} text-sm mt-3`}>Ir para essa parte do painel →</button>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </>
  );
}
