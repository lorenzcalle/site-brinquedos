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

export const VIDEO_CATEGORIES = ["Montagem", "Eletrônica", "Física", "Química"];
export const VIDEO_LEVELS = ["Iniciante", "Intermediário", "Avançado"];

export const team = [
  { name: "Gilberto Pacheco", role: "Coordenador", bio: "Docente da URI Santo Ângelo, responsável pela coordenação geral do projeto.", image: team1Img },
  { name: "Ana Lima", role: "Educadora", bio: "Pedagoga com foco em ciências, acompanha as atividades nas escolas parceiras.", image: team2Img },
  { name: "Pedro Souza", role: "Engenheiro", bio: "Engenheiro responsável pelo desenvolvimento dos protótipos e circuitos.", image: team3Img },
  { name: "Mariana Costa", role: "Bolsista", bio: "Bolsista CNPq, atua no desenvolvimento de materiais e vídeos tutoriais.", image: team4Img }
];

export const grupos = [
  {
    id: "coordenacao",
    titulo: "Coordenação",
    subtitulo: "Responsáveis pela gestão e direção do projeto.",
    membros: [
      { id: 1, nome: "Cristina Paludo Santos", cargo: "Coordenadora", bio: "Docente/pesquisadora da URI Santo Ângelo. Responsável pela coordenação do projeto.\nÁrea de atuação: Ciência da Computação", foto: "" },
      { id: 2, nome: "Rosangela Ferreira Prestes", cargo: "Coordenadora", bio: "Docente/pesquisadora da URI Santo Ângelo. Responsável pela coordenação do projeto.\nÁrea de atuação: Matemática", foto: "" },
    ],
  },
  {
    id: "professores",
    titulo: "Professores Orientadores",
    subtitulo: "Docentes que orientam as pesquisas e atividades do projeto.",
    membros: [
      { id: 3, nome: "Flávio Kiekow", cargo: "", bio: "Área de atuação: Engenharia Mecânica", foto: "" },
      { id: 4, nome: "Denilson Rodrigues da Silva", cargo: "", bio: "Área de atuação: Ciência da Computação", foto: "" },
      { id: 5, nome: "Leandro Ventura Farias", cargo: "", bio: "Área de atuação: Licenciatura em Computação/ Matemática", foto: "" },
      { id: 6, nome: "Karlise Soares Nascimento", cargo: "", bio: "Área de atuação: Ciência da Computação", foto: "" },
    ],
  },
  {
    id: "bolsistas",
    titulo: "Bolsistas",
    subtitulo: "Estudantes que desenvolvem pesquisa e extensão no projeto.",
    membros: [
      { id: 7, nome: "Lorenzo Callegaro", cargo: "Bolsista CNPq", bio: "Responsável pelo desenvolvimento do site e materiais digitais do projeto.", foto: team4Img },
    ],
  },
];

