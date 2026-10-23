import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { type Toy } from "@/lib/types";
import { fitToJpeg, uniqueName } from "@/lib/image";
import { Trash2, Loader2, Pencil, Plus, Search, Star, FileText, ImagePlus, ExternalLink } from "lucide-react";
import { HOME_FEATURED_SLOTS, removeToyFiles, toArray } from "@/lib/toys";
import {
  DropHint, DropZone, EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, SectionHeader, TagInput, btn, cardCls, inputCls,
  useConfirm, useFieldErrors,
} from "./ui";

type Form = {
  title: string;
  description: string;
  concepts: string[];
  materials: string[];
  concepts_description: string;
  image: string;
  guide_url: string | null;
  featured: boolean;
};

const emptyForm: Form = { title: "", description: "", concepts: [], materials: [], concepts_description: "", image: "", guide_url: null, featured: false };

const MAX_PDF_MB = 20;

// Brinquedos publicados no Portfólio (tabela `toys`, status 'approved').
export function ToysAdmin({ onChange, startNew, onStarted }: { onChange: () => void; startNew?: boolean; onStarted?: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [toys, setToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [modal, setModal] = useState<null | "new" | string>(null); // "new" ou id
  const [form, setForm] = useState<Form>(emptyForm);
  const [original, setOriginal] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<null | "image" | "guide">(null);
  const uploadedNow = useRef<string[]>([]); // apagados do storage se cancelar
  const { errors, check, clear, reset } = useFieldErrors<"title" | "description" | "image">();

  const load = async () => {
    const { data, error } = await supabase.from("toys").select("*").eq("status", "approved").order("title");
    if (error) toast({ title: "Erro ao carregar brinquedos", description: error.message, variant: "destructive" });
    setToys((data as Toy[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (startNew) { openNew(); onStarted?.(); }
  }, [startNew]);

  const featuredCount = toys.filter(t => t.featured).length;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "title" || k === "description" || k === "image") clear(k);
  };

  const openNew = () => {
    setForm(emptyForm);
    setOriginal(emptyForm);
    reset();
    uploadedNow.current = [];
    setModal("new");
  };

  const openEdit = (toy: Toy) => {
    const f: Form = {
      title: toy.title,
      description: toy.description ?? "",
      concepts: toArray(toy.concepts),
      materials: toArray(toy.materials),
      concepts_description: toy.concepts_description ?? "",
      image: toy.image ?? "",
      guide_url: toy.guide_url ?? null,
      featured: !!toy.featured,
    };
    setForm(f);
    setOriginal(f);
    reset();
    uploadedNow.current = [];
    setModal(toy.id);
  };

  const close = async () => {
    if (uploading) return;
    await removeToyFiles(...uploadedNow.current);
    uploadedNow.current = [];
    setModal(null);
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading("image");
    try {
      const name = uniqueName("jpg");
      const { error } = await supabase.storage.from("toy-images").upload(name, await fitToJpeg(file, 1600), { contentType: "image/jpeg" });
      if (error) throw error;
      const url = supabase.storage.from("toy-images").getPublicUrl(name).data.publicUrl;
      uploadedNow.current.push(url);
      set("image", url);
    } catch (e) {
      toast({ title: "Não foi possível enviar a imagem", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const uploadGuide = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return void toast({ title: "O guia precisa ser um PDF", variant: "destructive" });
    if (file.size > MAX_PDF_MB * 1024 * 1024) return void toast({ title: `PDF maior que ${MAX_PDF_MB} MB`, description: "Comprima o arquivo antes de enviar.", variant: "destructive" });
    setUploading("guide");
    try {
      const name = uniqueName("pdf");
      const { error } = await supabase.storage.from("toy-guides").upload(name, file, { contentType: "application/pdf" });
      if (error) throw error;
      const url = supabase.storage.from("toy-guides").getPublicUrl(name).data.publicUrl;
      uploadedNow.current.push(url);
      set("guide_url", url);
    } catch (e) {
      toast({ title: "Não foi possível enviar o PDF", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  // Liga/desliga destaque respeitando as 2 vagas da home (o próprio brinquedo não conta).
  const canFeature = (id: string | null) => toys.filter(t => t.featured && t.id !== id).length < HOME_FEATURED_SLOTS;
  const fullMsg = { title: `A página inicial mostra só ${HOME_FEATURED_SLOTS} destaques`, description: "Tire a estrela de outro brinquedo antes.", variant: "destructive" as const };

  const save = async () => {
    if (!check({
      title: !form.title.trim() && "Escreva o nome do brinquedo.",
      image: !form.image && "Envie uma foto do brinquedo.",
      description: !form.description.trim() && "Escreva uma descrição curta.",
    })) return;
    if (form.featured && !original.featured && !canFeature(modal === "new" ? null : modal)) return void toast(fullMsg);

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      concepts: form.concepts,
      materials: form.materials,
      concepts_description: form.concepts_description.trim() || null,
      image: form.image,
      guide_url: form.guide_url,
      featured: form.featured,
    };
    const { error } = modal === "new"
      ? await supabase.from("toys").insert([{ ...payload, status: "approved" }])
      : await supabase.from("toys").update(payload).eq("id", modal);
    setSaving(false);
    if (error) return void toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });

    // Salvo: apaga do storage a imagem/PDF que foram trocados.
    const kept = new Set([form.image, form.guide_url]);
    await removeToyFiles(...[original.image, original.guide_url, ...uploadedNow.current].filter(u => u && !kept.has(u)));
    uploadedNow.current = [];
    toast({ title: modal === "new" ? "Brinquedo publicado! 🎉" : "Brinquedo atualizado", description: payload.title });
    setModal(null);
    load();
    onChange();
  };

  const toggleFeatured = async (toy: Toy) => {
    if (!toy.featured && !canFeature(toy.id)) return void toast(fullMsg);
    setBusyId(toy.id);
    const { error } = await supabase.from("toys").update({ featured: !toy.featured }).eq("id", toy.id);
    setBusyId(null);
    if (error) return void toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    load();
  };

  const remove = async (toy: Toy) => {
    if (!(await confirm(`Excluir o brinquedo "${toy.title}"?`, "Ele sai do Portfólio e a imagem e o guia em PDF são apagados. Isso não pode ser desfeito."))) return;
    setBusyId(toy.id);
    const { error } = await supabase.from("toys").delete().eq("id", toy.id);
    if (!error) await removeToyFiles(toy.image, toy.guide_url);
    setBusyId(null);
    if (error) return void toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    toast({ title: "Brinquedo excluído", description: toy.title });
    load();
    onChange();
  };

  const q = query.trim().toLowerCase();
  const shown = q
    ? toys.filter(t => [t.title, t.description, ...(t.concepts ?? [])].join(" ").toLowerCase().includes(q))
    : toys;

  return (
    <>
      <SectionHeader
        title="Brinquedos"
        subtitle={`Portfólio do site. A estrela escolhe os ${HOME_FEATURED_SLOTS} que aparecem na página inicial (${featuredCount}/${HOME_FEATURED_SLOTS}).`}
        action={
          <button onClick={openNew} className={btn.primary}>
            <Plus className="h-5 w-5" /> Novo brinquedo
          </button>
        }
      />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome, descrição ou conceito" className={`${inputCls} pl-9`} />
      </div>

      {loading ? <Loading /> : shown.length === 0 ? (
        <EmptyState>{q ? "Nenhum brinquedo encontrado." : "Nenhum brinquedo publicado ainda."}</EmptyState>
      ) : (
        <div className="space-y-3">
          {shown.map(toy => (
            <div key={toy.id} className={`${cardCls} p-3 sm:p-4 flex gap-4 items-center`}>
              <img src={toy.image} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 bg-gray-100" />
              <OpenButton onClick={() => openEdit(toy)} label={`Editar ${toy.title}`} className="flex-1 min-w-0">
                <span className="text-base font-bold leading-snug line-clamp-2 sm:line-clamp-1">{toy.title}</span>
                <span className="text-sm text-gray-500 line-clamp-1">{toy.description}</span>
                <span className="flex flex-wrap gap-1.5 mt-1.5">
                  {toy.featured && <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Destaque na página inicial</span>}
                  {!toy.guide_url && <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Sem guia em PDF</span>}
                </span>
              </OpenButton>
              <button onClick={() => toggleFeatured(toy)} disabled={busyId === toy.id} aria-pressed={!!toy.featured}
                className={`relative z-10 p-2.5 rounded-xl transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${toy.featured ? "bg-amber-100 text-amber-500 hover:bg-amber-200" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"}`}
                title={toy.featured ? "Tirar da página inicial" : "Destacar na página inicial"} aria-label={toy.featured ? "Tirar da página inicial" : "Destacar na página inicial"}>
                {busyId === toy.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className="h-5 w-5" fill={toy.featured ? "currentColor" : "none"} />}
              </button>
              <ItemMenu items={[
                { label: "Editar", icon: Pencil, onSelect: () => openEdit(toy) },
                { label: "Ver no site", icon: ExternalLink, onSelect: () => window.open(`/portfolio/${toy.id}`, "_blank", "noopener") },
                { label: "Excluir", icon: Trash2, danger: true, onSelect: () => remove(toy) },
              ]} />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          wide
          title={modal === "new" ? "Novo brinquedo" : "Editar brinquedo"}
          onClose={close}
          onSave={save}
          saving={saving}
          busy={!!uploading}
          dirty={JSON.stringify(form) !== JSON.stringify(original)}
          saveLabel={modal === "new" ? "Publicar" : "Salvar"}
        >
          <Field label="Nome do brinquedo" required error={errors.title}>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Carrinho Solar" className={inputCls} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Foto" required error={errors.image} help={form.image ? "Clique na foto ou arraste outra para trocar." : undefined}>
              <DropZone label={form.image ? "Trocar a foto" : "Enviar foto"} accept="image/*" disabled={!!uploading} onFiles={f => uploadImage(f[0])}
                className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed ${errors.image ? "border-red-400" : "border-gray-300"} hover:border-orange-400 overflow-hidden flex items-center justify-center bg-gray-50`}>
                {uploading === "image" ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  : form.image ? <img src={form.image} alt="" className="w-full h-full object-contain" />
                  : <DropHint icon={ImagePlus} text="Enviar foto" />}
              </DropZone>
            </Field>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-1">Guia de construção <span className="font-normal text-gray-500">(PDF, até {MAX_PDF_MB} MB)</span></p>
                {form.guide_url ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-gray-200 p-2.5">
                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                    <a href={form.guide_url} target="_blank" rel="noopener noreferrer" className={`${btn.link} text-sm flex-1`}>Abrir o PDF</a>
                    <DropZone label="Trocar o PDF" accept="application/pdf" disabled={!!uploading} onFiles={f => uploadGuide(f[0])} className={btn.subtle}>
                      {uploading === "guide" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trocar"}
                    </DropZone>
                    <button type="button" onClick={() => set("guide_url", null)} className="text-sm font-bold text-red-600 hover:underline px-1">Remover</button>
                  </div>
                ) : (
                  <DropZone label="Enviar PDF" accept="application/pdf" disabled={!!uploading} onFiles={f => uploadGuide(f[0])}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 py-4 flex items-center justify-center">
                    {uploading === "guide" ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" /> : <DropHint icon={FileText} text="Enviar PDF" />}
                  </DropZone>
                )}
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="mt-1 h-4 w-4 accent-amber-500" />
                <span className="text-sm text-amber-900">
                  <strong>Destaque na página inicial</strong><br />
                  Aparece na seção “Nossa missão” ({HOME_FEATURED_SLOTS} vagas).
                </span>
              </label>
            </div>
          </div>

          <Field label="Descrição" required error={errors.description} help="O que o brinquedo faz e o que ele ensina.">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Conceitos científicos" help="Digite um conceito e aperte Enter (ou vírgula) para adicionar.">
            <TagInput value={form.concepts} onChange={v => set("concepts", v)} placeholder="Ex: Energia solar" />
          </Field>
          <Field label="Explicação dos conceitos" hint="opcional">
            <textarea value={form.concepts_description} onChange={e => set("concepts_description", e.target.value)} rows={3} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Materiais usados" help="Um por vez, Enter para adicionar.">
            <TagInput value={form.materials} onChange={v => set("materials", v)} placeholder="Ex: Garrafa PET" />
          </Field>
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
