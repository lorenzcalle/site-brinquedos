import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { fitToJpeg } from "@/lib/image";
import { type Manual, fetchManuals, manualMeta, readPdf, removeManualFiles, uploadManualFile } from "@/lib/manuals";
import { Trash2, Loader2, Pencil, Plus, FileText, ImagePlus, ExternalLink, ArrowUp, ArrowDown, BookOpen } from "lucide-react";
import {
  DragHandle, DropHint, DropZone, EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, SectionHeader, btn, cardCls, inputCls,
  moveItem, useConfirm, useDragSort, useFieldErrors,
} from "./ui";
import { LastChange } from "./last-change";

type Form = { title: string; description: string; file_url: string; file_size: number | null; pages: number | null; cover_url: string | null };
const emptyForm: Form = { title: "", description: "", file_url: "", file_size: null, pages: null, cover_url: null };

const MAX_MB = 50;

// "Manual_de_montagem.pdf" → "Manual de montagem"
const titleFromFile = (name: string) => name.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

// PDFs da aba "Manuais" de /materiais (tabela `manuals`).
export function ManualsAdmin({ onChange, startNew, onStarted }: { onChange: () => void; startNew?: boolean; onStarted?: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modal, setModal] = useState<null | "new" | string>(null); // "new" ou id
  const [form, setForm] = useState<Form>(emptyForm);
  const [original, setOriginal] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<null | "pdf" | "cover">(null);
  const uploadedNow = useRef<string[]>([]); // apagados do storage se cancelar
  const { errors, check, clear, reset } = useFieldErrors<"title" | "file_url">();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "title" || k === "file_url") clear(k);
  };

  const load = async () => {
    setManuals(await fetchManuals());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (startNew) { openNew(); onStarted?.(); }
  }, [startNew]);

  const openNew = () => { setForm(emptyForm); setOriginal(emptyForm); reset(); uploadedNow.current = []; setModal("new"); };

  const openEdit = (m: Manual) => {
    const f: Form = { title: m.title, description: m.description ?? "", file_url: m.file_url, file_size: m.file_size, pages: m.pages, cover_url: m.cover_url };
    setForm(f);
    setOriginal(f);
    reset();
    uploadedNow.current = [];
    setModal(m.id);
  };

  const close = async () => {
    await removeManualFiles(...uploadedNow.current);
    uploadedNow.current = [];
    setModal(null);
  };

  const uploadPdf = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return void toast({ title: `PDF maior que ${MAX_MB} MB`, description: "Comprima o arquivo antes de enviar.", variant: "destructive" });
    setUploading("pdf");
    try {
      // A capa sai da 1ª página; se o PDF não abrir aqui, segue sem capa.
      const info = await readPdf(file).catch(() => null);
      const url = await uploadManualFile(file, "pdf");
      uploadedNow.current.push(url);
      const cover = info ? await uploadManualFile(info.cover, "jpg") : null;
      if (cover) uploadedNow.current.push(cover);
      setForm(f => ({
        ...f,
        title: f.title.trim() ? f.title : titleFromFile(file.name),
        file_url: url,
        file_size: file.size,
        pages: info?.pages ?? null,
        cover_url: cover ?? f.cover_url,
      }));
      clear("file_url");
      clear("title");
    } catch (e) {
      toast({ title: "Não foi possível enviar o PDF", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading("cover");
    try {
      const url = await uploadManualFile(await fitToJpeg(file, 1000), "jpg");
      uploadedNow.current.push(url);
      set("cover_url", url);
    } catch (e) {
      toast({ title: "Não foi possível enviar a imagem", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!check({
      file_url: !form.file_url && "Envie o arquivo em PDF.",
      title: !form.title.trim() && "Escreva o título do manual.",
    })) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      file_url: form.file_url,
      file_size: form.file_size,
      pages: form.pages,
      cover_url: form.cover_url,
    };
    const { error } = modal === "new"
      ? await supabase.from("manuals").insert([{ ...payload, position: Math.max(-1, ...manuals.map(m => m.position)) + 1 }])
      : await supabase.from("manuals").update(payload).eq("id", modal);
    setSaving(false);
    if (error) return void toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });

    // Salvo: apaga do storage o PDF/capa que foram trocados.
    const kept = new Set([form.file_url, form.cover_url]);
    await removeManualFiles(...[original.file_url, original.cover_url, ...uploadedNow.current].filter(u => u && !kept.has(u)));
    uploadedNow.current = [];
    toast({ title: modal === "new" ? "Manual publicado" : "Manual atualizado", description: payload.title });
    setModal(null);
    load();
    onChange();
  };

  const remove = async (m: Manual) => {
    if (!(await confirm(`Excluir o manual "${m.title}"?`, "Ele sai da página Materiais e o PDF é apagado. Isso não pode ser desfeito."))) return;
    setBusyId(m.id);
    const { error } = await supabase.from("manuals").delete().eq("id", m.id);
    if (!error) await removeManualFiles(m.file_url, m.cover_url);
    setBusyId(null);
    if (error) return void toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    toast({ title: "Manual excluído", description: m.title });
    load();
    onChange();
  };

  // Grava position = índice só nas linhas que mudaram de lugar.
  const reorder = async (from: number, to: number) => {
    if (to < 0 || to >= manuals.length || from === to) return;
    const novo = moveItem(manuals, from, to);
    setManuals(novo);
    const r = await Promise.all(novo.map((m, i) => m.position === i ? null : supabase.from("manuals").update({ position: i }).eq("id", m.id)));
    if (r.some(x => x?.error)) toast({ title: "Não foi possível mudar a ordem", variant: "destructive" });
    load();
  };
  const sort = useDragSort(reorder);

  return (
    <>
      <SectionHeader
        title="Manuais"
        subtitle="PDFs da aba Manuais da página Materiais: manuais de montagem, álbuns, apostilas. A ordem daqui é a ordem do site."
        action={
          <button onClick={openNew} className={btn.primary}>
            <Plus className="h-5 w-5" /> Novo manual
          </button>
        }
      />
      {loading ? <Loading /> : manuals.length === 0 ? (
        <EmptyState>Nenhum manual ainda. Clique em “Novo manual” e envie o PDF.</EmptyState>
      ) : (
        <div className="space-y-3">
          {manuals.map((m, i) => (
            <div key={m.id} data-sort-item {...sort.item(i)} className={`${cardCls} p-3 sm:p-4 flex gap-3 sm:gap-4 items-center ${sort.item(i).className}`}>
              <span className="relative z-10"><DragHandle {...sort.handle(i)} /></span>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                {m.cover_url ? <img src={m.cover_url} alt="" draggable={false} className="w-full h-full object-contain" /> : <BookOpen className="h-6 w-6 text-gray-400" />}
              </div>
              <OpenButton onClick={() => openEdit(m)} label={`Editar ${m.title}`} className="flex-1 min-w-0">
                <span className="text-base font-bold leading-snug line-clamp-2 sm:line-clamp-1">{m.title}</span>
                <span className="block text-sm text-gray-500 sm:truncate">{manualMeta(m)}</span>
              </OpenButton>
              <ItemMenu items={[
                { label: "Editar", icon: Pencil, onSelect: () => openEdit(m) },
                { label: "Abrir o PDF", icon: ExternalLink, onSelect: () => window.open(m.file_url, "_blank", "noopener") },
                ...(i > 0 ? [{ label: "Mover para cima", icon: ArrowUp, onSelect: () => reorder(i, i - 1) }] : []),
                ...(i < manuals.length - 1 ? [{ label: "Mover para baixo", icon: ArrowDown, onSelect: () => reorder(i, i + 1) }] : []),
                { label: busyId === m.id ? "Excluindo…" : "Excluir", icon: Trash2, danger: true, onSelect: () => remove(m) },
              ]} />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "new" ? "Novo manual" : "Editar manual"}
          onClose={close}
          onSave={save}
          saving={saving}
          busy={!!uploading}
          dirty={JSON.stringify(form) !== JSON.stringify(original)}
          saveLabel={modal === "new" ? "Publicar" : "Salvar"}
          note={<LastChange entity="manual" id={modal === "new" ? null : modal} />}
        >
          <Field label="Arquivo em PDF" required error={errors.file_url} hint={`até ${MAX_MB} MB`}>
            {form.file_url ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-gray-200 p-2.5">
                <FileText className="h-5 w-5 text-red-500 shrink-0" />
                <span className="flex-1 min-w-0 text-sm text-gray-600">{manualMeta(form)}</span>
                <a href={form.file_url} target="_blank" rel="noopener noreferrer" className={`${btn.link} text-sm`}>Abrir</a>
                <DropZone label="Trocar o PDF" accept="application/pdf" disabled={!!uploading} onFiles={f => uploadPdf(f[0])} className={btn.subtle}>
                  {uploading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trocar"}
                </DropZone>
              </div>
            ) : (
              <DropZone label="Enviar PDF" accept="application/pdf" disabled={!!uploading} onFiles={f => uploadPdf(f[0])}
                className={`w-full rounded-xl border-2 border-dashed ${errors.file_url ? "border-red-400" : "border-gray-300"} hover:border-orange-400 bg-gray-50 py-6 flex items-center justify-center`}>
                {uploading === "pdf"
                  ? <span className="flex items-center gap-2 text-sm font-bold text-gray-600"><Loader2 className="h-5 w-5 animate-spin text-orange-500" /> Enviando… (PDF grande demora um pouco)</span>
                  : <DropHint icon={FileText} text="Enviar PDF" />}
              </DropZone>
            )}
          </Field>

          <Field label="Título" required error={errors.title}>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Manual de montagem do Robô Sumô" className={inputCls} />
          </Field>

          <div className="grid sm:grid-cols-[10rem_1fr] gap-4">
            <Field label="Capa" help="Sai da 1ª página do PDF. Arraste outra imagem para trocar.">
              <DropZone label={form.cover_url ? "Trocar a capa" : "Enviar capa"} accept="image/*" disabled={!!uploading} onFiles={f => uploadCover(f[0])}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 overflow-hidden flex items-center justify-center bg-gray-50">
                {uploading === "cover" ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  : form.cover_url ? <img src={form.cover_url} alt="" className="w-full h-full object-contain" />
                  : <DropHint icon={ImagePlus} text="Capa" sub="opcional" />}
              </DropZone>
            </Field>
            <Field label="Descrição" help="Uma ou duas frases: o que é e como usar.">
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} className={`${inputCls} resize-y`} />
            </Field>
          </div>
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
