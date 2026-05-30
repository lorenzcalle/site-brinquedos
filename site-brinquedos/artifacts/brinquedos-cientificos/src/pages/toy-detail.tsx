import { Layout } from "@/components/layout";
import { useParams, Link } from "wouter";
import { ArrowLeft, CheckCircle2, Download, BookOpen, Microscope } from "lucide-react";
import NotFound from "./not-found";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type Toy } from "@/lib/types";

function SkeletonDetail() {
  return (
    <Layout>
      <div className="bg-orange-500 pt-20 pb-16 animate-pulse">
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-5 w-36 bg-white/30 rounded mb-6" />
          <div className="flex gap-2 mb-4">
            <div className="h-7 w-20 bg-white/30 rounded-lg" />
            <div className="h-7 w-16 bg-white/30 rounded-lg" />
          </div>
          <div className="h-10 w-2/3 bg-white/30 rounded-lg" />
        </div>
      </div>
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
            <div className="lg:w-1/2">
              <div className="rounded-3xl bg-gray-200 h-80 mb-8" />
              <div className="h-16 bg-gray-200 rounded-2xl" />
            </div>
            <div className="lg:w-1/2 space-y-6">
              <div className="h-7 w-48 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
              <div className="bg-orange-50 p-8 rounded-3xl space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-5 bg-orange-100 rounded w-3/4" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function ToyDetail() {
  const params = useParams();
  const [toy, setToy] = useState<Toy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("toys")
      .select("id, title, description, image, concepts, materials, concepts_description, guide_url")
      .eq("id", params.id)
      .eq("status", "approved")
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setToy(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <SkeletonDetail />;
  if (notFound || !toy) return <NotFound />;

  return (
    <Layout>
      <div className="bg-orange-500 pt-20 pb-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link href="/portfolio" className="inline-flex items-center text-white/80 hover:text-white font-bold mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Portfólio
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {toy.concepts.map((concept, i) => (
              <span key={i} className="bg-white/20 text-white font-bold px-3 py-1 rounded-lg text-sm">
                {concept}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-black">{toy.title}</h1>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            <div className="lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl mb-8">
                <img src={toy.image} alt={toy.title} className="w-full max-h-[420px] object-contain" />
              </div>

              {toy.guide_url && (
                <a href={toy.guide_url} target="_blank" rel="noopener noreferrer" className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border border-green-100">
                  <Download className="h-8 w-8" />
                  <span>Baixar Ficha Catalográfica (PDF)</span>
                </a>
              )}
            </div>

            <div className="lg:w-1/2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="text-orange-500 h-6 w-6" /> Descrição do Projeto
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

              {toy.concepts_description && (
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Microscope className="text-orange-500 h-6 w-6" /> Conceitos Abordados
                  </h3>
                  <p className="text-lg text-muted-foreground text-justify">
                    {toy.concepts_description}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}