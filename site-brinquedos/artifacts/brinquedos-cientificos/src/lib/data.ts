import heroImg from "@/assets/images/hero.png";
import solarCarImg from "@/assets/images/solar-car.png";
import catapultImg from "@/assets/images/catapult.png";
import volcanoImg from "@/assets/images/volcano.png";
import spinningTopImg from "@/assets/images/spinning-top.png";
import team1Img from "@/assets/images/team-1.png";
import team2Img from "@/assets/images/team-2.png";
import team3Img from "@/assets/images/team-3.png";
import team4Img from "@/assets/images/team-4.png";

export const toys = [
  { id: "carrinho-solar", title: "Carrinho Solar", description: "Um carrinho movido a energia solar, perfeito para ensinar sobre energias renováveis.", image: solarCarImg, concepts: ["Energia Solar", "Mecânica", "Circuitos"], materials: ["Painel Solar 5V", "Motor DC", "Rodas", "Madeira", "Fios"] },
  { id: "catapulta", title: "Catapulta", description: "Uma catapulta feita de palitos de picolé para explorar os conceitos de força e movimento.", image: catapultImg, concepts: ["Física", "Alavancas", "Força"], materials: ["Palitos de Picolé", "Elásticos", "Tampinha de Garrafa", "Cola Quente"] },
  { id: "vulcao-de-lava", title: "Vulcão de Lava", description: "Um modelo de vulcão que entra em erupção, demonstrando reações químicas.", image: volcanoImg, concepts: ["Química", "Reações Ácido-Base", "Geologia"], materials: ["Argila", "Bicarbonato de Sódio", "Vinagre", "Corante Vermelho"] },
  { id: "piao-equilibrista", title: "Pião Equilibrista", description: "Um pião construído com materiais reciclados para ensinar sobre inércia rotacional.", image: spinningTopImg, concepts: ["Física", "Inércia", "Rotação"], materials: ["CD Velho", "Bolinha de Gude", "Tampinha", "Cola"] },
  { id: "ponte-de-palitos", title: "Ponte de Palitos", description: "Estrutura resistente feita de palitos, ensinando conceitos de engenharia.", image: heroImg, concepts: ["Engenharia", "Distribuição de Peso", "Geometria"], materials: ["Palitos de Picolé", "Cola de Madeira", "Pesos para teste"] },
  { id: "robo-reciclado", title: "Robô Reciclado", description: "Robô construído com sucata, com um circuito simples para acender LEDs.", image: heroImg, concepts: ["Reciclagem", "Eletrônica Básica", "Circuitos"], materials: ["Caixas de Papelão", "LEDs", "Bateria", "Fios", "Interruptor"] }
];

export const team = [
  { name: "Gilberto Pacheco", role: "Coordenador", image: team1Img },
  { name: "Ana Lima", role: "Educadora", image: team2Img },
  { name: "Pedro Souza", role: "Engenheiro", image: team3Img },
  { name: "Mariana Costa", role: "Bolsista", image: team4Img }
];

export const grupos = [
  {
    id: "coordenacao",
    titulo: "Coordenação",
    subtitulo: "Responsáveis pela gestão e direção do projeto.",
    membros: [
      { id: 1, nome: "Gilberto Pacheco", cargo: "Coordenador", foto: team1Img },
      { id: 2, nome: "Ana Lima", cargo: "Educadora", foto: team2Img },
    ],
  },
  {
    id: "professores",
    titulo: "Professores Orientadores",
    subtitulo: "Docentes que orientam as pesquisas e atividades do projeto.",
    membros: [
      { id: 3, nome: "Nome do Professor", cargo: "Orientador", foto: "/images/equipe/prof1.jpg" },
      { id: 4, nome: "Nome do Professor", cargo: "Orientador", foto: "/images/equipe/prof2.jpg" },
    ],
  },
  {
    id: "bolsistas",
    titulo: "Bolsistas",
    subtitulo: "Estudantes que desenvolvem pesquisa e extensão no projeto.",
    membros: [
      { id: 5, nome: "Lorenzo Callegaro", cargo: "Bolsista CNPq", foto: "/images/equipe/bolsista1.jpg" },
      { id: 6, nome: "Nome do Bolsista", cargo: "Bolsista Extensão", foto: "/images/equipe/bolsista2.jpg" },
      { id: 7, nome: "Nome do Bolsista", cargo: "Bolsista Extensão", foto: "/images/equipe/bolsista2.jpg" },
      { id: 8, nome: "Nome do Bolsista", cargo: "Bolsista Extensão", foto: "/images/equipe/bolsista2.jpg" },
    ],
  },
];

export const upcomingEvents = [
  { title: "Mostra de Inovação Escolar", date: "25 Março 2024", time: "08:00 - 17:00", location: "Colégio Estadual Central, São Paulo - SP" },
  { title: "Oficina: Construindo seu Robô", date: "10 Abril 2024", time: "14:00 - 16:00", location: "Laboratório Maker, Universidade Federal" }
];

export const pastEvents = [
  { title: "Feira de Ciências Regional", date: "15 Out 2023", description: "Apresentação de mais de 20 projetos desenvolvidos por alunos.", image: heroImg },
  { title: "Semana da Física Divertida", date: "02 a 06 Set 2023", description: "Uma semana inteira dedicada a experimentos lúdicos.", image: heroImg }
];