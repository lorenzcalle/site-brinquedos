export type Toy = {
  id: string;
  title: string;
  description: string;
  image: string;
  concepts: string[];
  materials?: string[];
  concepts_description?: string;
  guide_url?: string;
  featured?: boolean | null; // um dos 2 brinquedos da seção “Nossa missão” da home
};
