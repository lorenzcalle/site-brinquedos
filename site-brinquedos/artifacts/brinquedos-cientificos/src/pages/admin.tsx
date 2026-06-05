import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { type Toy } from "@/lib/types";
import { youtubeId, youtubeThumb } from "@/lib/utils";
import { VIDEO_CATEGORIES, VIDEO_LEVELS } from "@/lib/data";
import { Trash2, Loader2, LogOut, FileText, Check, X, Pencil, RotateCcw, Plus, Video } from "lucide-react";

type Submission = {
  id: string;
  title: string;
  description: string;
  concepts: string | string[];
  materials: string | string[];
  concepts_description?: string | null;
  author_name: string;
  author_email: string;
  image_url: string;
  guide_url?: string | null;
  status: string;
};

type Material = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  video_url: string;
};

type Tab = "pending" | "approved" | "rejected" | "materials";

const emptyMaterialForm = { title: "", description: "", category: VIDEO_CATEGORIES[0], level: VIDEO_LEVELS[0], video_url: "" };

// Normaliza concepts/materials que podem vir como array (envio novo) ou string (envio antigo)
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof val === "string") return val.split(/,|\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública
function storagePath(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

async function removeFiles(imageUrl?: string | null, guideUrl?: string | null) {
  const img = storagePath(imageUrl, "toy-images");
  const pdf = storagePath(guideUrl, "toy-guides");
  if (img) await supabase.storage.from("toy-images").remove([img]);
  if (pdf) await supabase.storage.from("toy-guides").remove([pdf]);
}

export default function Admin() {
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [items, setItems] = useState<Submission[]>([]);
  const [toys, setToys] = useState<Toy[]>([]);
  const [rejected, setRejected] = useState<Submission[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Edição de brinquedo publicado
  const [editing, setEditing] = useState<Toy | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", concepts: "", materials: "", concepts_description: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // Cadastro/edição de material (vídeo)
  const [matModal, setMatModal] = useState<null | "new" | string>(null); // "new" ou id
  const [matForm, setMatForm] = useState(emptyMaterialForm);
  const [savingMat, setSavingMat] = useState(false);

  // ─── Sessão ────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error) setLoginError("Email ou senha incorretos.");
  };

  const handleLogout = () => supabase.auth.signOut();

  // ─── Carregamento ────────────────────────────────────────────────────────────
  const loadAll = async () => {
    const [p, a, r, m] = await Promise.all([
      supabase.from("submissions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("toys").select("*").eq("status", "approved"),
      supabase.from("submissions").select("*").eq("status", "rejected").order("created_at", { ascending: false }),
      supabase.from("materials").select("*").order("created_at", { ascending: false }),
    ]);
    setItems((p.data as Submission[]) ?? []);
    setToys((a.data as Toy[]) ?? []);
    setRejected((r.data as Submission[]) ?? []);
    setMaterials((m.data as Material[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    loadAll();
  }, [session]);

  // ─── Ações ───────────────────────────────────────────────────────────────────
  const approve = async (item: Submission) => {
    setBusyId(item.id);
    const { error: insertErr } = await supabase.from("toys").insert([{
      title: item.title,
      description: item.description,
      image: item.image_url,
      concepts: toArray(item.concepts),
      concepts_description: item.concepts_description ?? null,
      materials: toArray(item.materials),
      guide_url: item.guide_url ?? null,
      status: "approved",
    }]);
    if (insertErr) {
      setBusyId(null);
      toast({ title: "Erro ao publicar", description: insertErr.message, variant: "destructive" });
      return;
    }
    const { error: updErr } = await supabase.from("submissions").update({ status: "approved" }).eq("id", item.id);
    setBusyId(null);
    if (updErr) {
      toast({ title: "Publicado, mas houve um aviso", description: "O brinquedo foi publicado, mas a submissão não foi marcada como aprovada.", variant: "destructive" });
    } else {
      toast({ title: "Brinquedo publicado! 🎉", description: item.title });
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    loadAll();
  };

  const reject = async (item: Submission) => {
    setBusyId(item.id);
    const { error } = await supabase.from("submissions").update({ status: "rejected" }).eq("id", item.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao rejeitar", description: error.message, variant: "destructive" });
      return;
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setRejected(prev => [{ ...item, status: "rejected" }, ...prev]);
    toast({ title: "Submissão rejeitada", description: item.title });
  };

  const restore = async (item: Submission) => {
    setBusyId(item.id);
    const { error } = await supabase.from("submissions").update({ status: "pending" }).eq("id", item.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao restaurar", description: error.message, variant: "destructive" });
      return;
    }
    setRejected(prev => prev.filter(i => i.id !== item.id));
    setItems(prev => [{ ...item, status: "pending" }, ...prev]);
    toast({ title: "Restaurada para pendentes", description: item.title });
  };

  const deleteSubmission = async (item: Submission) => {
    if (!confirm(`Excluir permanentemente "${item.title}" e seus arquivos? Isso não pode ser desfeito.`)) return;
    setBusyId(item.id);
    await removeFiles(item.image_url, item.guide_url);
    const { error } = await supabase.from("submissions").delete().eq("id", item.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setRejected(prev => prev.filter(i => i.id !== item.id));
    toast({ title: "Submissão excluída", description: item.title });
  };

  const deleteToy = async (toy: Toy) => {
    if (!confirm(`Excluir o brinquedo "${toy.title}"? Isso remove também a imagem e o guia.`)) return;
    setBusyId(toy.id);
    await removeFiles(toy.image, toy.guide_url);
    const { error } = await supabase.from("toys").delete().eq("id", toy.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setToys(prev => prev.filter(t => t.id !== toy.id));
    toast({ title: "Brinquedo excluído", description: toy.title });
  };

  // ─── Edição ──────────────────────────────────────────────────────────────────
  const openEdit = (toy: Toy) => {
    setEditing(toy);
    setEditForm({
      title: toy.title,
      description: toy.description,
      concepts: (toy.concepts ?? []).join(", "),
      materials: (toy.materials ?? []).join(", "),
      concepts_description: toy.concepts_description ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    const { error } = await supabase.from("toys").update({
      title: editForm.title,
      description: editForm.description,
      concepts: toArray(editForm.concepts),
      materials: toArray(editForm.materials),
      concepts_description: editForm.concepts_description || null,
    }).eq("id", editing.id);
    setSavingEdit(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setEditing(null);
    loadAll();
    toast({ title: "Brinquedo atualizado", description: editForm.title });
  };

  // ─── Materiais (vídeos) ───────────────────────────────────────────────────────
  const openNewMaterial = () => {
    setMatForm(emptyMaterialForm);
    setMatModal("new");
  };

  const openEditMaterial = (mat: Material) => {
    setMatForm({
      title: mat.title,
      description: mat.description ?? "",
      category: mat.category ?? VIDEO_CATEGORIES[0],
      level: mat.level ?? VIDEO_LEVELS[0],
      video_url: mat.video_url,
    });
    setMatModal(mat.id);
  };

  const saveMaterial = async () => {
    if (!matForm.title.trim() || !matForm.video_url.trim()) {
      toast({ title: "Preencha título e link do vídeo", variant: "destructive" });
      return;
    }
    if (!youtubeId(matForm.video_url)) {
      toast({ title: "Link do YouTube inválido", description: "Cole um link como https://youtu.be/...", variant: "destructive" });
      return;
    }
    setSavingMat(true);
    const payload = {
      title: matForm.title.trim(),
      description: matForm.description.trim() || null,
      category: matForm.category,
      level: matForm.level,
      video_url: matForm.video_url.trim(),
    };
    const { error } = matModal === "new"
      ? await supabase.from("materials").insert([payload])
      : await supabase.from("materials").update(payload).eq("id", matModal);
    setSavingMat(false);
    if (error) {
      toast({ title: "Erro ao salvar vídeo", description: error.message, variant: "destructive" });
      return;
    }
    setMatModal(null);
    loadAll();
    toast({ title: matModal === "new" ? "Vídeo adicionado" : "Vídeo atualizado", description: matForm.title });
  };

  const deleteMaterial = async (mat: Material) => {
    if (!confirm(`Excluir o vídeo "${mat.title}"?`)) return;
    setBusyId(mat.id);
    const { error } = await supabase.from("materials").delete().eq("id", mat.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setMaterials(prev => prev.filter(m => m.id !== mat.id));
    toast({ title: "Vídeo excluído", description: mat.title });
  };

  // ─── Telas de auth ────────────────────────────────────────────────────────────
  if (checkingSession) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    </Layout>
  );

  if (!session) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4">
          <h1 className="text-2xl font-black text-center">Área Admin</h1>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="username"
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors"
          />
          <input
            type="password" placeholder="Senha" value={password}
            onChange={e => setPassword(e.target.value)} autoComplete="current-password"
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors"
          />
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <button
            type="submit" disabled={loggingIn}
            className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loggingIn && <Loader2 className="h-5 w-5 animate-spin" />}
            {loggingIn ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </Layout>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pendentes", count: items.length },
    { key: "approved", label: "Publicados", count: toys.length },
    { key: "rejected", label: "Rejeitados", count: rejected.length },
    { key: "materials", label: "Materiais", count: materials.length },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="bg-orange-500 pt-20 pb-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Painel Admin</h1>
            <p className="text-white/80 text-sm mt-1">{session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Abas */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2 rounded-xl font-bold transition-colors ${tab === t.key ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* Pendentes */}
            {tab === "pending" && (
              items.length === 0 ? (
                <p className="text-gray-500 text-center py-20">Nenhuma submissão pendente. 🎉</p>
              ) : items.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                  <a href={item.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-xl mb-4 hover:opacity-90 transition-opacity" />
                  </a>
                  <h2 className="text-xl font-bold mb-1">{item.title}</h2>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-orange-600 font-medium mb-1">Conceitos: {toArray(item.concepts).join(", ")}</p>
                  <p className="text-sm text-gray-500 font-medium mb-1">Materiais: {toArray(item.materials).join(", ")}</p>
                  <p className="text-sm text-gray-400 mb-3">Por {item.author_name} ({item.author_email})</p>
                  {item.guide_url && (
                    <a href={item.guide_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline mb-4">
                      <FileText className="h-4 w-4" /> Ver guia (PDF)
                    </a>
                  )}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => approve(item)} disabled={busyId === item.id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Aprovar
                    </button>
                    <button
                      onClick={() => reject(item)} disabled={busyId === item.id}
                      className="flex-1 bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-700 font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" /> Rejeitar
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Publicados */}
            {tab === "approved" && (
              toys.length === 0 ? (
                <p className="text-gray-500 text-center py-20">Nenhum brinquedo publicado ainda.</p>
              ) : toys.map(toy => (
                <div key={toy.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex gap-4 items-center">
                  <img src={toy.image} alt={toy.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold truncate">{toy.title}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2">{toy.description}</p>
                  </div>
                  <button
                    onClick={() => openEdit(toy)}
                    className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors shrink-0"
                    title="Editar"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteToy(toy)} disabled={busyId === toy.id}
                    className="p-3 rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-600 transition-colors shrink-0"
                    title="Excluir"
                  >
                    {busyId === toy.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                  </button>
                </div>
              ))
            )}

            {/* Rejeitados */}
            {tab === "rejected" && (
              rejected.length === 0 ? (
                <p className="text-gray-500 text-center py-20">Nenhuma submissão rejeitada.</p>
              ) : rejected.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex gap-4 items-center">
                  <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-xl shrink-0 grayscale" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold truncate">{item.title}</h2>
                    <p className="text-sm text-gray-400 truncate">Por {item.author_name}</p>
                  </div>
                  <button
                    onClick={() => restore(item)} disabled={busyId === item.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-bold text-sm transition-colors shrink-0"
                    title="Restaurar para pendentes"
                  >
                    {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Restaurar
                  </button>
                  <button
                    onClick={() => deleteSubmission(item)} disabled={busyId === item.id}
                    className="p-3 rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-600 transition-colors shrink-0"
                    title="Excluir permanentemente"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}

            {/* Materiais (vídeos) */}
            {tab === "materials" && (
              <>
                <button
                  onClick={openNewMaterial}
                  className="w-full mb-6 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  <Plus className="h-5 w-5" /> Adicionar vídeo
                </button>
                {materials.length === 0 ? (
                  <p className="text-gray-500 text-center py-16">Nenhum vídeo cadastrado ainda.</p>
                ) : materials.map(mat => {
                  const vid = youtubeId(mat.video_url);
                  return (
                    <div key={mat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex gap-4 items-center">
                      <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {vid ? <img src={youtubeThumb(vid)} alt={mat.title} className="w-full h-full object-cover" /> : <Video className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold truncate">{mat.title}</h2>
                        <p className="text-xs text-gray-400 truncate">{[mat.category, mat.level].filter(Boolean).join(" · ")}</p>
                      </div>
                      <button onClick={() => openEditMaterial(mat)} className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors shrink-0" title="Editar">
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteMaterial(mat)} disabled={busyId === mat.id} className="p-3 rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-600 transition-colors shrink-0" title="Excluir">
                        {busyId === mat.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de edição */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Editar brinquedo</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Conceitos <span className="font-normal text-gray-400">(separados por vírgula)</span></label>
                <input value={editForm.concepts} onChange={e => setEditForm({ ...editForm, concepts: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Materiais <span className="font-normal text-gray-400">(separados por vírgula)</span></label>
                <input value={editForm.materials} onChange={e => setEditForm({ ...editForm, materials: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição dos conceitos</label>
                <textarea value={editForm.concepts_description} onChange={e => setEditForm({ ...editForm, concepts_description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancelar</button>
              <button onClick={saveEdit} disabled={savingEdit} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {savingEdit && <Loader2 className="h-5 w-5 animate-spin" />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de material (vídeo) */}
      {matModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setMatModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{matModal === "new" ? "Adicionar vídeo" : "Editar vídeo"}</h2>
              <button onClick={() => setMatModal(null)} className="text-gray-400 hover:text-gray-700"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                <input value={matForm.title} onChange={e => setMatForm({ ...matForm, title: e.target.value })} placeholder="Ex: Como montar o Carrinho Solar" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link do YouTube</label>
                <input value={matForm.video_url} onChange={e => setMatForm({ ...matForm, video_url: e.target.value })} placeholder="https://youtu.be/..." className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors" />
                {matForm.video_url && youtubeId(matForm.video_url) && (
                  <img src={youtubeThumb(youtubeId(matForm.video_url)!)} alt="prévia" className="mt-3 w-40 rounded-lg" />
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea value={matForm.description} onChange={e => setMatForm({ ...matForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select value={matForm.category} onChange={e => setMatForm({ ...matForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors">
                    {VIDEO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nível</label>
                  <select value={matForm.level} onChange={e => setMatForm({ ...matForm, level: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors">
                    {VIDEO_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMatModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancelar</button>
              <button onClick={saveMaterial} disabled={savingMat} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {savingMat && <Loader2 className="h-5 w-5 animate-spin" />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
