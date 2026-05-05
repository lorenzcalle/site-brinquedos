import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout";
import { useState, useRef } from "react";
import { Plus, X, Upload, FileText } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string()
  .min(20, "Descreva melhor o brinquedo")
  .max(400, "Máximo 400 caracteres"),
  materials: z.array(z.object({ value: z.string().min(1, "Campo obrigatório") }))
    .min(1, "Adicione ao menos um material")
    .max(6, "Máximo 6 materiais"),
  concepts: z.array(z.object({ value: z.string().min(1, "Campo obrigatório") }))
    .min(1, "Adicione ao menos um conceito")
    .max(6, "Máximo 6 conceitos"),
  concepts_description: z.string().min(20, "Descreva melhor os conceitos").max(400, "Máximo 400 caracteres"),
  author_name: z.string().min(2, "Informe seu nome"),
  author_email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof schema>;

export default function Submit() {
  const [sent, setSent] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [descLines, setDescLines] = useState(0);
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      materials: [{ value: "" }],
      concepts: [{ value: "" }],
    },
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({ control, name: "materials" });
  const { fields: conceptFields, append: appendConcept, remove: removeConcept } = useFieldArray({ control, name: "concepts" });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
  };

  const onSubmit = async (data: FormData) => {
    if (!imageFile) { alert("Selecione uma imagem."); return; }
    if (!pdfFile) { alert("Selecione o guia em PDF."); return; }
    setUploading(true);

    const imgExt = imageFile.name.split(".").pop();
    const imgName = `${Date.now()}.${imgExt}`;
    const { error: imgError } = await supabase.storage.from("toy-images").upload(imgName, imageFile);
    if (imgError) { alert("Erro ao enviar imagem."); setUploading(false); return; }
    const { data: { publicUrl: imageUrl } } = supabase.storage.from("toy-images").getPublicUrl(imgName);

    const pdfName = `${Date.now()}-guide.pdf`;
    const { error: pdfError } = await supabase.storage.from("toy-guides").upload(pdfName, pdfFile);
    if (pdfError) { alert("Erro ao enviar PDF."); setUploading(false); return; }
    const { data: { publicUrl: guideUrl } } = supabase.storage.from("toy-guides").getPublicUrl(pdfName);

    const { error } = await supabase.from("submissions").insert([{
      title: data.title,
      description: data.description,
      materials: data.materials.map(m => m.value).join(","),
      concepts: data.concepts.map(c => c.value).join(","),
      concepts_description: data.concepts_description,
      author_name: data.author_name,
      author_email: data.author_email,
      image_url: imageUrl,
      guide_url: guideUrl,
    }]);

    setUploading(false);
    if (!error) setSent(true);
    else alert("Erro ao enviar. Tente novamente.");
  };

  if (sent) return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-black mb-2">Enviado com sucesso!</h1>
        <p className="text-gray-500 text-lg">Seu brinquedo foi recebido e será revisado em breve.</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="bg-orange-500 pt-20 pb-16 text-center text-white">
        <h1 className="text-5xl font-black mb-4">Envie seu Brinquedo</h1>
        <p className="text-xl text-white/90">Compartilhe sua criação com a comunidade!</p>
      </div>

      <section className="py-16 bg-gray-50">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 space-y-8">

          {/* Imagem */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do brinquedo</label>
            <div
              onClick={() => imageRef.current?.click()}
              className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-contain" alt="preview" />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="mx-auto mb-2 h-8 w-8" />
                  <p className="font-medium">Clique para selecionar</p>
                  <p className="text-sm">PNG, JPG ou JPEG</p>
                </div>
              )}
            </div>
            <input ref={imageRef} type="file" accept=".png,.jpg,.jpeg" onChange={handleImage} className="hidden" />
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nome do brinquedo</label>
            <input
              {...register("title")}
              placeholder="Ex: Carrinho Solar"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">Descrição do projeto</label>
              <span className={`text-xs font-medium ${(watch("description") ?? "").length > 400 ? "text-red-500" : "text-gray-400"}`}>
                {(watch("description") ?? "").length}/400
              </span>
            </div>
            <textarea
              {...register("description")}
              rows={6}
              placeholder="Resumo do Objetivo Pedagógico..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all resize-none"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Materiais */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Materiais necessários</label>
              <span className={`text-xs font-medium ${materialFields.length >= 6 ? "text-orange-500" : "text-gray-400"}`}>
                {materialFields.length}/6
              </span>
            </div>
            <div className="space-y-2">
              {materialFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`materials.${idx}.value`)}
                    placeholder="Ex: Painel Solar 5V"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                  />
                  {materialFields.length > 1 && (
                    <button type="button" onClick={() => removeMaterial(idx)} className="p-3 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {materialFields.length < 6 && (
              <button type="button" onClick={() => appendMaterial({ value: "" })} className="mt-2 flex items-center gap-2 text-orange-500 font-bold text-sm hover:text-orange-600">
                <Plus className="h-4 w-4" /> Adicionar material
              </button>
            )}
            {errors.materials && <p className="text-red-500 text-sm mt-1">Adicione ao menos um material</p>}
          </div>

          {/* Conceitos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Conceitos abordados</label>
              <span className={`text-xs font-medium ${conceptFields.length >= 6 ? "text-orange-500" : "text-gray-400"}`}>
                {conceptFields.length}/6
              </span>
            </div>
            <div className="space-y-2">
              {conceptFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`concepts.${idx}.value`)}
                    placeholder="Ex: Energia Solar"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                  />
                  {conceptFields.length > 1 && (
                    <button type="button" onClick={() => removeConcept(idx)} className="p-3 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {conceptFields.length < 6 && (
              <button type="button" onClick={() => appendConcept({ value: "" })} className="mt-2 flex items-center gap-2 text-orange-500 font-bold text-sm hover:text-orange-600">
                <Plus className="h-4 w-4" /> Adicionar conceito
              </button>
            )}
            {errors.concepts && <p className="text-red-500 text-sm mt-1">Adicione ao menos um conceito</p>}
          </div>
          
          {/* Descrição dos conceitos */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">Descreva os conceitos abordados</label>
              <span className={`text-xs font-medium ${(watch("concepts_description") ?? "").length > 400 ? "text-red-500" : "text-gray-400"}`}>
                {(watch("concepts_description") ?? "").length}/400
              </span>
            </div>
            <textarea
              {...register("concepts_description")}
              rows={4}
              placeholder="Resumo do Conceito Científico Abordado..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all resize-none"
            />
            {errors.concepts_description && <p className="text-red-500 text-sm mt-1">{errors.concepts_description.message}</p>}
          </div>
        
          {/* PDF */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Guia do brinquedo (PDF)</label>
            <div
              onClick={() => pdfRef.current?.click()}
              className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <FileText className={`h-8 w-8 ${pdfFile ? "text-orange-500" : "text-gray-400"}`} />
              <p className={`font-medium text-sm ${pdfFile ? "text-orange-600" : "text-gray-400"}`}>
                {pdfFile ? pdfFile.name : "Clique para selecionar o PDF"}
              </p>
            </div>
            <input ref={pdfRef} type="file" accept=".pdf" onChange={handlePdf} className="hidden" />
          </div>

          {/* Autor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Seu nome</label>
              <input
                {...register("author_name")}
                placeholder="Maria Silva"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
              />
              {errors.author_name && <p className="text-red-500 text-sm mt-1">{errors.author_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Seu email</label>
              <input
                {...register("author_email")}
                placeholder="maria@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
              />
              {errors.author_email && <p className="text-red-500 text-sm mt-1">{errors.author_email.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          >
            {uploading ? "Enviando arquivos..." : isSubmitting ? "Salvando..." : "Enviar brinquedo"}
          </button>

        </form>
      </section>
    </Layout>
  );
}