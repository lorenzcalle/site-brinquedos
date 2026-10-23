import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { videoThumb, isVideoUrl } from "@/lib/utils";
import { VIDEO_CATEGORIES, VIDEO_LEVELS } from "@/lib/data";
import { Trash2, Pencil, Plus, Video, Search, ExternalLink } from "lucide-react";
import { EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, SectionHeader, btn, cardCls, inputCls, useConfirm, useFieldErrors } from "./ui";

type Material = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  video_url: string;
};

const emptyForm = { title: "", description: "", category: VIDEO_CATEGORIES[0], level: VIDEO_LEVELS[0], video_url: "" };

// Vídeos tutoriais da página /materiais (tabela `materials`).
export function VideosAdmin({ onChange, startNew, onStarted }: { onChange: () => void; startNew?: boolean; onStarted?: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<null | "new" | string>(null); // "new" ou id
  const [form, setForm] = useState(emptyForm);
  const [original, setOriginal] = useState(emptyForm);
  const { errors, check, clear, reset } = useFieldErrors<"title" | "video_url">();
  const set = (k: keyof typeof emptyForm, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "title" || k === "video_url") clear(k);
  };
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    setMaterials((data as Material[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (startNew) { openNew(); onStarted?.(); }
  }, [startNew]);

  const openNew = () => { setForm(emptyForm); setOriginal(emptyForm); reset(); setModal("new"); };

  const openEdit = (mat: Material) => {
    const f = {
      title: mat.title,
      description: mat.description ?? "",
      category: mat.category ?? VIDEO_CATEGORIES[0],
      level: mat.level ?? VIDEO_LEVELS[0],
      video_url: mat.video_url,
    };
    setForm(f);
    setOriginal(f);
    reset();
    setModal(mat.id);
  };

  const save = async () => {
    const url = form.video_url.trim();
    if (!check({
      title: !form.title.trim() && "Escreva o título do vídeo.",
      video_url: !url ? "Cole o link do vídeo." : !isVideoUrl(url) && "Esse link não é de vídeo do YouTube nem do Google Drive. Copie o endereço da página do vídeo.",
    })) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      level: form.level,
      video_url: form.video_url.trim(),
    };
    const { error } = modal === "new"
      ? await supabase.from("materials").insert([payload])
      : await supabase.from("materials").update(payload).eq("id", modal);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar vídeo", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: modal === "new" ? "Vídeo adicionado" : "Vídeo atualizado", description: form.title });
    setModal(null);
    load();
    onChange();
  };

  const remove = async (mat: Material) => {
    if (!(await confirm(`Excluir o vídeo "${mat.title}"?`, "Ele sai da página Materiais. O vídeo no YouTube/Drive continua lá."))) return;
    setBusyId(mat.id);
    const { error } = await supabase.from("materials").delete().eq("id", mat.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Vídeo excluído", description: mat.title });
    load();
    onChange();
  };

  const q = query.trim().toLowerCase();
  const shown = q ? materials.filter(m => [m.title, m.category, m.level].join(" ").toLowerCase().includes(q)) : materials;

  return (
    <>
      <SectionHeader
        title="Vídeos"
        subtitle="Tutoriais da página Materiais. O vídeo fica no YouTube ou no Drive; aqui vai só o link."
        action={
          <button onClick={openNew} className={btn.primary}>
            <Plus className="h-5 w-5" /> Novo vídeo
          </button>
        }
      />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, categoria ou nível" className={`${inputCls} pl-9`} />
      </div>
      {loading ? <Loading /> : shown.length === 0 ? (
        <EmptyState>{q ? "Nenhum vídeo encontrado." : "Nenhum vídeo cadastrado ainda."}</EmptyState>
      ) : (
        <div className="space-y-3">
          {shown.map(mat => {
            const thumb = videoThumb(mat.video_url);
            return (
              <div key={mat.id} className={`${cardCls} p-3 sm:p-4 flex gap-4 items-center`}>
                <div className="w-20 sm:w-28 aspect-video rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} /> : <Video className="h-6 w-6 text-gray-400" />}
                </div>
                <OpenButton onClick={() => openEdit(mat)} label={`Editar ${mat.title}`} className="flex-1 min-w-0">
                  <span className="text-base font-bold leading-snug line-clamp-2 sm:line-clamp-1">{mat.title}</span>
                  <span className="block text-sm text-gray-500 sm:truncate">{[mat.category, mat.level].filter(Boolean).join(" · ")}</span>
                </OpenButton>
                <ItemMenu items={[
                  { label: "Editar", icon: Pencil, onSelect: () => openEdit(mat) },
                  { label: "Abrir o vídeo", icon: ExternalLink, onSelect: () => window.open(mat.video_url, "_blank", "noopener") },
                  { label: busyId === mat.id ? "Excluindo…" : "Excluir", icon: Trash2, danger: true, onSelect: () => remove(mat) },
                ]} />
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "new" ? "Novo vídeo" : "Editar vídeo"}
          onClose={() => setModal(null)}
          onSave={save}
          saving={saving}
          dirty={JSON.stringify(form) !== JSON.stringify(original)}
        >
          <Field label="Título" required error={errors.title}>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Como montar o Carrinho Solar" className={inputCls} />
          </Field>
          <Field label="Link do vídeo" required error={errors.video_url} help="Abra o vídeo no YouTube ou no Drive e copie o endereço da barra do navegador.">
            <input value={form.video_url} onChange={e => set("video_url", e.target.value)} placeholder="https://youtu.be/... ou https://drive.google.com/file/d/..." className={inputCls} />
            {form.video_url && videoThumb(form.video_url) && (
              <img src={videoThumb(form.video_url)!} alt="prévia" className="mt-3 w-40 rounded-lg" onError={e => { e.currentTarget.style.display = "none"; }} />
            )}
          </Field>
          <Field label="Descrição">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria">
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                {VIDEO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Nível">
              <select value={form.level} onChange={e => set("level", e.target.value)} className={inputCls}>
                {VIDEO_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
