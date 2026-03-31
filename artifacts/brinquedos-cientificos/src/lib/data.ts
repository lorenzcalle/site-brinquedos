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

export const blogPosts = [
  { id: "feira-de-ciencias", title: "Nossa participação na Feira de Ciências 2023", excerpt: "Levamos nossos brinquedos científicos para a feira e o resultado foi incrível.", date: "15 Out 2023", image: heroImg },
  { id: "oficina-de-foguetes", title: "Oficina de Foguetes de Garrafa PET", excerpt: "Mais de 50 crianças participaram da nossa última oficina de física na prática.", date: "02 Nov 2023", image: heroImg },
  { id: "novo-brinquedo", title: "Lançamento do Kit Carrinho Solar", excerpt: "Estamos disponibilizando os manuais para a construção do mais novo brinquedo.", date: "20 Nov 2023", image: heroImg },
  { id: "educacao-e-brincadeira", title: "Por que ensinar ciência brincando?", excerpt: "A importância do lúdico no processo de aprendizagem das ciências exatas.", date: "10 Dez 2023", image: heroImg }
];

export const upcomingEvents = [
  { title: "Mostra de Inovação Escolar", date: "25 Março 2024", time: "08:00 - 17:00", location: "Colégio Estadual Central, São Paulo - SP" },
  { title: "Oficina: Construindo seu Robô", date: "10 Abril 2024", time: "14:00 - 16:00", location: "Laboratório Maker, Universidade Federal" }
];

export const pastEvents = [
  { title: "Feira de Ciências Regional", date: "15 Out 2023", description: "Apresentação de mais de 20 projetos desenvolvidos por alunos.", image: heroImg },
  { title: "Semana da Física Divertida", date: "02 a 06 Set 2023", description: "Uma semana inteira dedicada a experimentos lúdicos.", image: heroImg }
];