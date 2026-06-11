import heroImg from "@/assets/images/hero.png";
import solarCarImg from "@/assets/images/solar-car.png";
import catapultImg from "@/assets/images/catapult.png";
import volcanoImg from "@/assets/images/volcano.png";
import spinningTopImg from "@/assets/images/spinning-top.png";
import team1Img from "@/assets/images/team-1.png";
import team2Img from "@/assets/images/team-2.png";
import team3Img from "@/assets/images/team-3.png";
import team4Img from "@/assets/images/team-4.png";
import cristinaImg from "@/assets/images/equipe/cristina-paludo-santos.jpg";
import rosangelaImg from "@/assets/images/equipe/rosangela-ferreira-prestes.jpg";
import flavioImg from "@/assets/images/equipe/flavio-kiekow.jpg";
import denilsonImg from "@/assets/images/equipe/denilson-rodrigues-da-silva.jpg";
import leandroImg from "@/assets/images/equipe/leandro-ventura-farias.jpg";
import karliseImg from "@/assets/images/equipe/karlise-soares-nascimento.jpg";
import ecleiaImg from "@/assets/images/equipe/ecleia-bozata.jpg";
import irenaImg from "@/assets/images/equipe/irena-bielohoubek.jpg";
import luizImg from "@/assets/images/equipe/luiz-antonio-iegli.jpg";
import alexandreImg from "@/assets/images/equipe/alexandre-preussler.jpg";
import rosmeriImg from "@/assets/images/equipe/rosmeri-reichel.jpg";
import vanessaImg from "@/assets/images/equipe/vanessa-aina-person.jpg";
import patriciaImg from "@/assets/images/equipe/patricia-ritter.jpg";
import romuloImg from "@/assets/images/equipe/romulo-madrid-de-mello.jpg";
import amandaImg from "@/assets/images/equipe/amanda-pauletto.jpg";
import camilaImg from "@/assets/images/equipe/camila-schieffelbein-dos-santos.jpg";
import milenaImg from "@/assets/images/equipe/milena-costa-nascimento.jpg";
import daianaImg from "@/assets/images/equipe/daiana-machry-ledur.jpg";
import lorenzoImg from "@/assets/images/equipe/lorenzo-callegaro.jpg";

export const toys = [
  { id: "carrinho-solar", title: "Carrinho Solar", description: "Um carrinho movido a energia solar, perfeito para ensinar sobre energias renováveis.", image: solarCarImg, concepts: ["Energia Solar", "Mecânica", "Circuitos"], materials: ["Painel Solar 5V", "Motor DC", "Rodas", "Madeira", "Fios"] },
  { id: "catapulta", title: "Catapulta", description: "Uma catapulta feita de palitos de picolé para explorar os conceitos de força e movimento.", image: catapultImg, concepts: ["Física", "Alavancas", "Força"], materials: ["Palitos de Picolé", "Elásticos", "Tampinha de Garrafa", "Cola Quente"] },
  { id: "vulcao-de-lava", title: "Vulcão de Lava", description: "Um modelo de vulcão que entra em erupção, demonstrando reações químicas.", image: volcanoImg, concepts: ["Química", "Reações Ácido-Base", "Geologia"], materials: ["Argila", "Bicarbonato de Sódio", "Vinagre", "Corante Vermelho"] },
  { id: "piao-equilibrista", title: "Pião Equilibrista", description: "Um pião construído com materiais reciclados para ensinar sobre inércia rotacional.", image: spinningTopImg, concepts: ["Física", "Inércia", "Rotação"], materials: ["CD Velho", "Bolinha de Gude", "Tampinha", "Cola"] },
  { id: "ponte-de-palitos", title: "Ponte de Palitos", description: "Estrutura resistente feita de palitos, ensinando conceitos de engenharia.", image: heroImg, concepts: ["Engenharia", "Distribuição de Peso", "Geometria"], materials: ["Palitos de Picolé", "Cola de Madeira", "Pesos para teste"] },
  { id: "robo-reciclado", title: "Robô Reciclado", description: "Robô construído com sucata, com um circuito simples para acender LEDs.", image: heroImg, concepts: ["Reciclagem", "Eletrônica Básica", "Circuitos"], materials: ["Caixas de Papelão", "LEDs", "Bateria", "Fios", "Interruptor"] }
];

export const VIDEO_CATEGORIES = ["Montagem", "Eletrônica", "Física", "Química", "Desenvolvimento de Produto", "Oficina de Design"];
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
      { id: 1, nome: "Cristina Paludo Santos", cargo: "Coordenadora", bio: "Docente/pesquisadora da URI Santo Ângelo. Responsável pela coordenação do projeto.\nÁrea de atuação: Ciência da Computação", foto: cristinaImg },
      { id: 2, nome: "Rosangela Ferreira Prestes", cargo: "Coordenadora", bio: "Docente/pesquisadora da URI Santo Ângelo. Responsável pela coordenação do projeto.\nÁrea de atuação: Matemática", foto: rosangelaImg },
    ],
  },
  {
    id: "professores",
    titulo: "Professores Orientadores",
    subtitulo: "Docentes que orientam as pesquisas e atividades do projeto.",
    membros: [
      { id: 3, nome: "Flávio Kiekow", cargo: "", bio: "Área de atuação: Engenharia Mecânica", foto: flavioImg },
      { id: 4, nome: "Denilson Rodrigues da Silva", cargo: "", bio: "Área de atuação: Ciência da Computação", foto: denilsonImg },
      { id: 5, nome: "Leandro Ventura Farias", cargo: "", bio: "Área de atuação: Licenciatura em Computação/ Matemática", foto: leandroImg },
      { id: 6, nome: "Karlise Soares Nascimento", cargo: "", bio: "Área de atuação: Ciência da Computação", foto: karliseImg },
    ],
  },
  {
    id: "professores-bolsistas",
    titulo: "Professores Bolsistas – Ed. Básica",
    subtitulo: "Mentores da rede pública que integram o projeto nas escolas.",
    membros: [
      { id: 7, nome: "Ecléia Bozata", cargo: "Mentora", bio: "E. E. Ens. Médio Nossa Senhora do Perpétuo Socorro – Vitória das Missões.\nÁrea de atuação: Matemática", foto: ecleiaImg },
      { id: 8, nome: "Irena Bielohoubek", cargo: "Mentora", bio: "Instituto Estadual Odão Felippe Pipi – Santo Ângelo.\nÁreas de atuação: Física, Química e Biologia", foto: irenaImg },
      { id: 9, nome: "Luiz Antonio Iegli", cargo: "Mentor", bio: "Instituto Estadual de Educação João XXIII – Giruá.\nÁrea de atuação: Matemática", foto: luizImg },
      { id: 10, nome: "Alexandre Preussler", cargo: "Mentor", bio: "Escola Estadual de Ensino Médio Santo Estanislau – Mato Queimado.\nÁrea de atuação: Matemática e Física", foto: alexandreImg },
      { id: 11, nome: "Rosméri Reichel", cargo: "Mentora", bio: "Escola Estadual de Ensino Médio Henrique Sommer – Pirapó.\nÁrea de atuação: Matemática", foto: rosmeriImg },
      { id: 12, nome: "Vanessa Aina Person", cargo: "Mentora", bio: "Escola Estadual de Ensino Médio João Przyczynski – Guarani das Missões.\nÁrea de atuação: Ciência e Biologia", foto: vanessaImg },
      { id: 13, nome: "Patrícia Ritter", cargo: "Mentora", bio: "Escola Estadual de Ensino Médio Buriti – Santo Ângelo.\nÁrea de atuação: Matemática", foto: patriciaImg },
    ],
  },
  {
    id: "apoio-administrativo",
    titulo: "Apoio Administrativo",
    subtitulo: "Suporte administrativo e técnico do projeto.",
    membros: [
      { id: 14, nome: "Romulo Madrid de Mello", cargo: "", bio: "Área de atuação: Ciência da Computação", foto: romuloImg },
    ],
  },
  {
    id: "academicos-bolsistas",
    titulo: "Acadêmicos Bolsistas",
    subtitulo: "Estudantes bolsistas CNPq que desenvolvem pesquisa e extensão no projeto.",
    membros: [
      { id: 15, nome: "Amanda Pauletto", cargo: "Bolsista CNPq", bio: "Mentora.\nÁrea de atuação: Ciência da Computação", foto: amandaImg },
      { id: 16, nome: "Camila Schieffelbein dos Santos", cargo: "Bolsista CNPq", bio: "Mentora.\nÁrea de atuação: Ciência da Computação", foto: camilaImg },
      { id: 17, nome: "Milena Costa Nascimento", cargo: "Bolsista CNPq", bio: "Mentora.\nÁrea de atuação: Matemática", foto: milenaImg },
      { id: 18, nome: "Daiana Machry Ledur", cargo: "Bolsista CNPq", bio: "Mentora.\nÁrea de atuação: Engenharia Mecânica", foto: daianaImg },
      { id: 19, nome: "Lorenzo Callegaro", cargo: "Bolsista CNPq", bio: "Webmaster.\nÁrea de atuação: Ciência da Computação", foto: lorenzoImg },
    ],
  },
];

