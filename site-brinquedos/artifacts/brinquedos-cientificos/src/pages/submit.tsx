import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout";
import { DropZone } from "@/components/admin/ui";
import { fitToJpeg } from "@/lib/image";
import { useState, useEffect } from "react";
import {
  Plus, X, FileText, Loader2, ImagePlus, School, Send, ClipboardCheck, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Lock, RefreshCw,
} from "lucide-react";

// Formulário público de envio de brinquedos. Cai em `submissions` e a equipe revisa em
// /admin → Envios da comunidade (aprovar copia para `toys`).

const MAX_IMAGE_MB = 15; // a foto é reduzida no navegador antes de subir
const MAX_PDF_MB = 20;
const MAX_ITEMS = 6;

const schema = z.object({
  title: z.string().trim().min(3, "Escreva o nome do brinquedo (mínimo 3 letras)."),
  description: z.string().trim()
    .min(20, "Conte um pouco mais sobre o brinquedo (mínimo 20 caracteres).")
    .max(400, "Use no máximo 400 caracteres."),
  concepts: z.array(z.object({ value: z.string().trim().min(1, "Preencha ou remova esta linha.") }))
    .min(1, "Adicione ao menos um conceito.")
    .max(MAX_ITEMS),
  concepts_description: z.string().trim()
    .min(20, "Explique um pouco mais (mínimo 20 caracteres).")
    .max(400, "Use no máximo 400 caracteres."),
  materials: z.array(z.object({ value: z.string().trim().min(1, "Preencha ou remova esta linha.") }))
    .min(1, "Adicione ao menos um material.")
    .max(MAX_ITEMS),
  author_name: z.string().trim().min(2, "Escreva o seu nome."),
  author_email: z.string().trim().email("Confira o e-mail (ex.: maria@escola.com)."),
  school: z.string().trim().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400";
const errCls = "!border-red-400";

function Err({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <p data-error className="flex items-center gap-1.5 text-red-600 text-sm font-medium mt-1.5">
      <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
    </p>
  );
}

function Label({ htmlFor, children, hint, count }: { htmlFor?: string; children: React.ReactNode; hint?: string; count?: { n: number; max: number } }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-800">
        {children} {hint && <span className="font-normal text-gray-500">{hint}</span>}
      </label>
      {count && (
        <span className={`text-xs font-semibold shrink-0 ${count.n > count.max ? "text-red-600" : "text-gray-400"}`}>{count.n}/{count.max}</span>
      )}
    </div>
  );
}

function Card({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
      <header className="flex gap-4 mb-6">
        <span className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center shrink-0">{n}</span>
        <div>
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{sub}</p>
        </div>
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

const fmtMB = (b: number) => `${(b / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;

export default function Submit() {
  const [sent, setSent] = useState<string | null>(null); // e-mail de quem enviou
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [step, setStep] = useState<null | string>(null); // "Enviando a foto…" etc.
  const [sendError, setSendError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { materials: [{ value: "" }], concepts: [{ value: "" }], school: "" },
  });
  const materials = useFieldArray({ control, name: "materials" });
  const concepts = useFieldArray({ control, name: "concepts" });

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const pickImage = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setImageError(`A foto deve ter no máximo ${MAX_IMAGE_MB} MB.`);
    setImageError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const pickPdf = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setPdfError("O guia precisa estar em PDF.");
    if (file.size > MAX_PDF_MB * 1024 * 1024) return setPdfError(`O PDF deve ter no máximo ${MAX_PDF_MB} MB.`);
    setPdfError(null);
    setPdfFile(file);
  };

  // Mostra os erros de arquivo junto com os do formulário e rola até o primeiro.
  const checkFiles = () => {
    if (!imageFile) setImageError("Envie uma foto do brinquedo.");
    if (!pdfFile) setPdfError("Envie o guia de montagem em PDF.");
    return !!imageFile && !!pdfFile;
  };
  const scrollToError = () => requestAnimationFrame(() =>
    document.querySelector("[data-error]")?.closest("[data-field]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  const onInvalid = (_: FieldErrors<FormData>) => { checkFiles(); scrollToError(); };

  const onSubmit = async (data: FormData) => {
    if (!checkFiles()) { scrollToError(); return; }
    setSendError(null);
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const imgName = `${stamp}.jpg`;
    const pdfName = `${stamp}-guide.pdf`;
    const uploaded: { bucket: string; name: string }[] = [];
    const undo = () => Promise.all(uploaded.map(u => supabase.storage.from(u.bucket).remove([u.name])));
    try {
      setStep("Enviando a foto…");
      // Foto de celular chega com vários MB: reduz para 1600 px antes de subir.
      const img = await fitToJpeg(imageFile!, 1600).catch(() => null);
      if (!img && imageFile!.size > 5 * 1024 * 1024) throw new Error("Não conseguimos ler essa foto. Tente uma em JPG ou PNG.");
      const up1 = await supabase.storage.from("toy-images").upload(img ? imgName : `${stamp}.${imageFile!.name.split(".").pop()}`, img ?? imageFile!, img ? { contentType: "image/jpeg" } : undefined);
      if (up1.error) throw new Error("Não foi possível enviar a foto.");
      uploaded.push({ bucket: "toy-images", name: up1.data.path });

      setStep("Enviando o guia em PDF…");
      const up2 = await supabase.storage.from("toy-guides").upload(pdfName, pdfFile!, { contentType: "application/pdf" });
      if (up2.error) throw new Error("Não foi possível enviar o PDF.");
      uploaded.push({ bucket: "toy-guides", name: pdfName });

      setStep("Salvando…");
      const school = data.school?.trim();
      const { error } = await supabase.from("submissions").insert([{
        title: data.title.trim(),
        description: data.description.trim(),
        materials: data.materials.map(m => m.value.trim()),
        concepts: data.concepts.map(c => c.value.trim()),
        concepts_description: data.concepts_description.trim(),
        // Não há coluna de escola: vai junto do nome ("Maria Silva — EMEF Sol Nascente").
        author_name: school ? `${data.author_name.trim()} — ${school}` : data.author_name.trim(),
        author_email: data.author_email.trim(),
        image_url: supabase.storage.from("toy-images").getPublicUrl(up1.data.path).data.publicUrl,
        guide_url: supabase.storage.from("toy-guides").getPublicUrl(pdfName).data.publicUrl,
      }]);
      if (error) throw new Error("Não foi possível salvar o envio.");
      setSent(data.author_email.trim());
      window.scrollTo({ top: 0 });
    } catch (e) {
      await undo().catch(() => {});
      setSendError(`${(e as Error).message} Confira a internet e tente de novo. Se continuar, escreva para bc@san.uri.br.`);
      requestAnimationFrame(() => document.querySelector("[role=alert]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } finally {
      setStep(null);
    }
  };

  const startOver = () => {
    reset();
    setImageFile(null); setImagePreview(null); setPdfFile(null);
    setImageError(null); setPdfError(null); setSendError(null);
    setSent(null);
    window.scrollTo({ top: 0 });
  };

  if (sent) return (
    <Layout>
      <section className="min-h-[70vh] bg-gray-50 flex items-center py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Recebemos o seu brinquedo!</h1>
            <p className="text-lg text-gray-600 mb-2">
              Obrigado por compartilhar. A equipe do projeto vai avaliar o envio e, se aprovado, ele aparece na Galeria de Projetos.
            </p>
            <p className="text-sm text-gray-500 mb-8">Se precisarmos de alguma informação, falamos com você em <strong className="text-gray-700">{sent}</strong>.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/portfolio" className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
                Ver a galeria <ArrowRight className="h-5 w-5" />
              </Link>
              <button onClick={startOver} className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl transition-colors">
                <RefreshCw className="h-4 w-4" /> Enviar outro brinquedo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );

  const busy = !!step;
  const len = (k: "description" | "concepts_description") => (watch(k) ?? "").length;

  const listField = (name: "concepts" | "materials", arr: typeof concepts | typeof materials, label: string, placeholder: string, addLabel: string) => (
    <div data-field>
      <Label count={{ n: arr.fields.length, max: MAX_ITEMS }}>{label}</Label>
      <div className="space-y-2">
        {arr.fields.map((f, i) => (
          <div key={f.id}>
            <div className="flex gap-2">
              <input
                {...register(`${name}.${i}.value` as const)}
                aria-label={`${label} ${i + 1}`}
                placeholder={placeholder}
                className={`${inputCls} ${errors[name]?.[i]?.value ? errCls : ""}`}
              />
              {arr.fields.length > 1 && (
                <button type="button" onClick={() => arr.remove(i)} aria-label="Remover linha" title="Remover"
                  className="px-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Err msg={errors[name]?.[i]?.value?.message} />
          </div>
        ))}
      </div>
      {arr.fields.length < MAX_ITEMS && (
        <button type="button" onClick={() => arr.append({ value: "" })}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
      <Err msg={errors[name]?.root?.message ?? errors[name]?.message} />
    </div>
  );

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-orange-500 pt-20 pb-28 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
            <School className="h-3.5 w-3.5" /> Para escolas e professores
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Envie seu Brinquedo</h1>
          <p className="text-lg text-white/85 max-w-xl mx-auto">
            Compartilhe a criação da sua turma. A equipe do projeto avalia cada envio e, se aprovado, ele entra na Galeria de Projetos para inspirar outras escolas.
          </p>
          <ol className="mt-8 flex flex-wrap justify-center gap-2 md:gap-3 text-sm font-bold">
            {[[Send, "Preencha e envie"], [ClipboardCheck, "A equipe avalia"], [Sparkles, "Vai para a galeria"]].map(([Icon, t], i) => {
              const I = Icon as typeof Send;
              return (
                <li key={i} className="inline-flex items-center gap-2 bg-white/15 rounded-full pl-1.5 pr-4 py-1.5">
                  <span className="w-6 h-6 rounded-full bg-white text-orange-600 text-xs font-black flex items-center justify-center">{i + 1}</span>
                  <I className="h-4 w-4" /> {t as string}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <section className="bg-gray-50 pb-20">
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="max-w-3xl mx-auto px-4 -mt-16 relative z-10 space-y-6">

          <Card n={1} title="O brinquedo" sub="Uma foto e uma apresentação rápida.">
            <div data-field>
              <Label hint={`(JPG ou PNG, até ${MAX_IMAGE_MB} MB — de preferência na horizontal)`}>Foto do brinquedo</Label>
              <DropZone label={imageFile ? "Trocar a foto" : "Enviar foto"} accept="image/*" disabled={busy} onFiles={f => pickImage(f[0])}
                className={`w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl border-2 border-dashed ${imageError ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-gray-50"} hover:border-orange-400 overflow-hidden flex items-center justify-center`}>
                {imagePreview ? (
                  <span className="relative w-full h-full block group">
                    <img src={imagePreview} alt="Prévia da foto" className="w-full h-full object-contain bg-gray-100" />
                    <span className="absolute bottom-3 right-3 bg-white/95 text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg shadow">Trocar a foto</span>
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-gray-500 px-4 text-center">
                    <span className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center"><ImagePlus className="h-7 w-7" /></span>
                    <span className="font-bold text-gray-700">Clique para escolher a foto</span>
                    <span className="text-sm">ou arraste o arquivo para cá</span>
                  </span>
                )}
              </DropZone>
              <Err msg={imageError} />
            </div>

            <div data-field>
              <Label htmlFor="title">Nome do brinquedo</Label>
              <input id="title" {...register("title")} placeholder="Ex.: Carrinho Solar" className={`${inputCls} ${errors.title ? errCls : ""}`} />
              <Err msg={errors.title?.message} />
            </div>

            <div data-field>
              <Label htmlFor="description" count={{ n: len("description"), max: 400 }}>Descrição</Label>
              <textarea id="description" {...register("description")} rows={4}
                placeholder="O que é, como funciona e com qual turma vocês usaram. Ex.: Um carrinho movido a energia solar que mostra como a luz vira movimento. Usamos com o 5º ano em Ciências."
                className={`${inputCls} resize-y ${errors.description ? errCls : ""}`} />
              <Err msg={errors.description?.message} />
            </div>
          </Card>

          <Card n={2} title="O que ele ensina" sub="Os conceitos de ciência por trás do brinquedo e o que é preciso para montar.">
            {listField("concepts", concepts, "Conceitos abordados", "Ex.: Energia solar", "Adicionar conceito")}

            <div data-field>
              <Label htmlFor="concepts_description" count={{ n: len("concepts_description"), max: 400 }}>Explique os conceitos</Label>
              <textarea id="concepts_description" {...register("concepts_description")} rows={4}
                placeholder="Como o brinquedo ajuda a entender esses conceitos? Ex.: O painel transforma a luz do sol em energia elétrica, que faz o motor girar as rodas."
                className={`${inputCls} resize-y ${errors.concepts_description ? errCls : ""}`} />
              <Err msg={errors.concepts_description?.message} />
            </div>

            {listField("materials", materials, "Materiais necessários", "Ex.: Painel solar 5V", "Adicionar material")}
          </Card>

          <Card n={3} title="Guia de montagem" sub="O passo a passo para outras escolas montarem o brinquedo.">
            <div data-field>
              <Label hint={`(PDF, até ${MAX_PDF_MB} MB)`}>Guia em PDF</Label>
              {pdfFile ? (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-gray-200 p-3">
                  <span className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"><FileText className="h-6 w-6" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-gray-800 truncate">{pdfFile.name}</span>
                    <span className="text-sm text-gray-500">{fmtMB(pdfFile.size)}</span>
                  </span>
                  <DropZone label="Trocar o PDF" accept="application/pdf,.pdf" disabled={busy} onFiles={f => pickPdf(f[0])}
                    className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border-2 border-transparent">
                    Trocar
                  </DropZone>
                </div>
              ) : (
                <DropZone label="Enviar PDF" accept="application/pdf,.pdf" disabled={busy} onFiles={f => pickPdf(f[0])}
                  className={`w-full rounded-2xl border-2 border-dashed ${pdfError ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-gray-50"} hover:border-orange-400 py-8 flex items-center justify-center`}>
                  <span className="flex flex-col items-center gap-2 text-gray-500 px-4 text-center">
                    <span className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center"><FileText className="h-7 w-7" /></span>
                    <span className="font-bold text-gray-700">Clique para escolher o PDF</span>
                    <span className="text-sm">ou arraste o arquivo para cá</span>
                  </span>
                </DropZone>
              )}
              <p className="text-sm text-gray-500 mt-2">Dica: monte no Word, no Google Docs ou no Canva, com fotos de cada etapa, e salve como PDF.</p>
              <Err msg={pdfError} />
            </div>
          </Card>

          <Card n={4} title="Quem está enviando" sub="Para a equipe saber de quem é o brinquedo e poder falar com você.">
            <div className="grid sm:grid-cols-2 gap-6">
              <div data-field>
                <Label htmlFor="author_name">Seu nome</Label>
                <input id="author_name" {...register("author_name")} autoComplete="name" placeholder="Maria Silva" className={`${inputCls} ${errors.author_name ? errCls : ""}`} />
                <Err msg={errors.author_name?.message} />
              </div>
              <div data-field>
                <Label htmlFor="author_email">Seu e-mail</Label>
                <input id="author_email" type="email" inputMode="email" autoComplete="email" {...register("author_email")} placeholder="maria@escola.com" className={`${inputCls} ${errors.author_email ? errCls : ""}`} />
                <Err msg={errors.author_email?.message} />
              </div>
            </div>
            <div data-field>
              <Label htmlFor="school" hint="(opcional)">Escola ou instituição</Label>
              <input id="school" {...register("school")} autoComplete="organization" placeholder="Ex.: EMEF Sol Nascente — Santo Ângelo" className={inputCls} />
            </div>
            <p className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              <Lock className="h-4 w-4 mt-0.5 shrink-0" /> Seu e-mail não aparece no site. Só a equipe do projeto vê, para falar com você sobre o envio.
            </p>
          </Card>

          {sendError && (
            <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /> <span>{sendError}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 text-center">
            <button type="submit" disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-wait text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition-colors">
              {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> {step}</> : <><Send className="h-5 w-5" /> Enviar para avaliação</>}
            </button>
            <p className="text-sm text-gray-500 mt-3">O brinquedo só aparece no site depois que a equipe aprovar.</p>
          </div>
        </form>
      </section>
    </Layout>
  );
}
