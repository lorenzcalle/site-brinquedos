import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { videoThumb, isVideoUrl } from "@/lib/utils";
import { VIDEO_CATEGORIES, VIDEO_LEVELS } from "@/lib/data";
import { Trash2, Loader2, Pencil, Plus, Video, Search } from "lucide-react";
import { Field, Modal, SectionHeader, inputCls, useConfirm } from "./ui";

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

  const openNew = () => { setForm(emptyForm); setModal("new"); };

  const openEdit = (mat: Material) => {
    setForm({
      title: mat.title,
      description: mat.description ?? "",
      category: mat.category ?? VIDEO_CATEGORIES[0],
      level: mat.level ?? VIDEO_LEVELS[0],
      video_url: mat.video_url,
    });
    setModal(mat.id);
  };

  const save = async () => {
    if (!form.title.trim() || !form.video_url.trim()) {
      toast({ title: "Preencha título e link do vídeo", variant: "destructive" });
      return;
    }
    if (!isVideoUrl(form.video_url)) {
      toast({ title: "Link de vídeo inválido", description: "Cole um link do YouTube (https://youtu.be/...) ou do Google Drive (https://drive.google.com/file/d/...).", variant: "destructive" });
      return;
    }
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
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="h-5 w-5" /> Novo vídeo
          </button>
        }
      />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, categoria ou nível" className={`${inputCls} pl-9`} />
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
      ) : shown.length === 0 ? (
        <p className="text-gray-500 text-center py-16">{q ? "Nenhum vídeo encontrado." : "Nenhum vídeo cadastrado ainda."}</p>
      ) : shown.map(mat => {
        const thumb = videoThumb(mat.video_url);
        return (
          <div key={mat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3 flex gap-4 items-center">
            <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
              {thumb ? <img src={thumb} alt={mat.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} /> : <Video className="h-6 w-6 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold truncate">{mat.title}</h3>
              <p className="text-xs text-gray-400 truncate">{[mat.category, mat.level].filter(Boolean).join(" · ")}</p>
            </div>
            <button onClick={() => openEdit(mat)} className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors shrink-0" title="Editar">
              <Pencil className="h-5 w-5" />
            </button>
            <button onClick={() => remove(mat)} disabled={busyId === mat.id} className="p-3 rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-600 transition-colors shrink-0" title="Excluir">
              {busyId === mat.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
            </button>
          </div>
        );
      })}

      {modal && (
        <Modal
          title={modal === "new" ? "Novo vídeo" : "Editar vídeo"}
          onClose={() => setModal(null)}
          footer={<>
            <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {saving && <Loader2 className="h-5 w-5 animate-spin" />} Salvar
            </button>
          </>}
        >
          <Field label="Título">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Como montar o Carrinho Solar" className={inputCls} />
          </Field>
          <Field label="Link do vídeo" hint="YouTube ou Google Drive">
            <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtu.be/... ou https://drive.google.com/file/d/..." className={inputCls} />
            {form.video_url && videoThumb(form.video_url) && (
              <img src={videoThumb(form.video_url)!} alt="prévia" className="mt-3 w-40 rounded-lg" onError={e => { e.currentTarget.style.display = "none"; }} />
            )}
          </Field>
          <Field label="Descrição">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {VIDEO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Nível">
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={inputCls}>
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
