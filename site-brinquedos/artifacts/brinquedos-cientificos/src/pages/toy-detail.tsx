import { Layout } from "@/components/layout";
import { useParams, Link } from "wouter";
import { ArrowLeft, CheckCircle2, Download, BookOpen } from "lucide-react";
import NotFound from "./not-found";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Toy = {
  id: string;
  title: string;
  description: string;
  image: string;
  concepts: string[];
  concepts_description?: string;
  materials: string[];
  guide_url?: string;
};

export default function ToyDetail() {
  const params = useParams();
  const [toy, setToy] = useState<Toy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("toys")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setToy(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Carregando...</p>
      </div>
    </Layout>
  );

  if (notFound || !toy) return <NotFound />;

  const guideUrl = toy.guide_url;

  return (
    <Layout>
      <div className="bg-gray-50 py-10 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/portfolio" className="inline-flex items-center text-primary font-bold hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Portfólio
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {toy.concepts.map((concept, i) => (
              <span key={i} className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-sm">
                {concept}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground">{toy.title}</h1>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12">

            <div className="lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl mb-8">
                <img src={toy.image} alt={toy.title} className="w-full object-cover" />
              </div>

              {guideUrl ? (
                <a href={guideUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border border-green-100">
                  <Download className="h-8 w-8" />
                  <span>Baixar Ficha Catalográfica (PDF)</span>
                </a>
              ) : null}
            </div>

            <div className="lg:w-1/2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="text-primary h-6 w-6" /> Descrição do Projeto
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed text-justify">
                  {toy.description}
                </p>
              </div>

              {toy.materials && toy.materials.length > 0 && (
                <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                  <h3 className="text-2xl font-bold text-orange-900 mb-6">Materiais Necessários</h3>
                  <ul className="space-y-4">
                    {toy.materials.map((material, i) => (
                      <li key={i} className="flex items-center gap-3 text-lg font-medium text-orange-800">
                        <CheckCircle2 className="h-6 w-6 text-orange-500 shrink-0" />
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Conceitos Abordados</h3>
                <p className="text-lg text-muted-foreground text-justify">
                  {toy.concepts_description}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}