import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { type TeamGroup, type TeamMember, fetchTeam, initials } from "@/lib/team";
import { cropToJpeg } from "@/lib/image";
import { removeSiteMedia, uploadSiteMedia } from "@/lib/media";
import { Trash2, Loader2, Pencil, Plus, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ImagePlus, ExternalLink } from "lucide-react";
import { EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, SectionHeader, btn, cardCls, inputCls, useConfirm } from "./ui";

type MemberForm = { group_id: string; name: string; role: string; bio: string; photo_url: string | null };
type GroupForm = { title: string; subtitle: string };

// Página Equipe (e o carrossel de O Projeto): grupos em ordem, pessoas em ordem dentro
// de cada grupo. Grupo sem ninguém não aparece no site.
export function TeamAdmin({ onChange }: { onChange: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Modal de pessoa: id da pessoa, ou "new"
  const [memberModal, setMemberModal] = useState<null | string>(null);
  const [mForm, setMForm] = useState<MemberForm>({ group_id: "", name: "", role: "", bio: "", photo_url: null });
  const [mOriginalPhoto, setMOriginalPhoto] = useState<string | null>(null);
  const [mOriginal, setMOriginal] = useState<MemberForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadedNow = useRef<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);

  // Modal de grupo: id do grupo, ou "new"
  const [groupModal, setGroupModal] = useState<null | string>(null);
  const [gForm, setGForm] = useState<GroupForm>({ title: "", subtitle: "" });
  const [gOriginal, setGOriginal] = useState<GroupForm>({ title: "", subtitle: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setGroups(await fetchTeam());
    } catch (e) {
      toast({ title: "Erro ao carregar a equipe", description: (e as Error).message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changed = () => { load(); onChange(); };
  const fail = (title: string, e: { message: string } | null) => {
    toast({ title, description: e?.message, variant: "destructive" });
  };

  // ─── Pessoas ───────────────────────────────────────────────────────────────
  const openNewMember = (groupId: string) => {
    const f = { group_id: groupId, name: "", role: "", bio: "", photo_url: null };
    setMForm(f);
    setMOriginal(f);
    setMOriginalPhoto(null);
    uploadedNow.current = [];
    setMemberModal("new");
  };

  const openEditMember = (m: TeamMember) => {
    const f = { group_id: m.group_id, name: m.name, role: m.role ?? "", bio: m.bio ?? "", photo_url: m.photo_url ?? null };
    setMForm(f);
    setMOriginal(f);
    setMOriginalPhoto(m.photo_url ?? null);
    uploadedNow.current = [];
    setMemberModal(m.id);
  };

  const closeMember = async () => {
    if (uploading) return;
    await removeSiteMedia(uploadedNow.current);
    uploadedNow.current = [];
    setMemberModal(null);
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      // Quadrada: o site mostra a foto num círculo.
      const url = await uploadSiteMedia("equipe", await cropToJpeg(file, 600, 600));
      uploadedNow.current.push(url);
      setMForm(f => ({ ...f, photo_url: url }));
    } catch (e) {
      fail("Não foi possível enviar a foto", e as Error);
    } finally {
      setUploading(false);
    }
  };

  const saveMember = async () => {
    if (!mForm.name.trim()) return void toast({ title: "Preencha o nome", variant: "destructive" });
    setSaving(true);
    const payload = {
      group_id: mForm.group_id,
      name: mForm.name.trim(),
      role: mForm.role.trim() || null,
      bio: mForm.bio.trim() || null,
      photo_url: mForm.photo_url,
    };
    const isNew = memberModal === "new";
    const prev = groups.flatMap(g => g.members).find(m => m.id === memberModal);
    // Entra no fim do grupo (também ao mudar de grupo).
    const endOf = (gid: string) => Math.max(-1, ...(groups.find(g => g.id === gid)?.members.map(m => m.position) ?? [])) + 1;
    const position = isNew || prev?.group_id !== mForm.group_id ? endOf(mForm.group_id) : prev.position;
    const { error } = isNew
      ? await supabase.from("team_members").insert([{ ...payload, position }])
      : await supabase.from("team_members").update({ ...payload, position }).eq("id", memberModal);
    setSaving(false);
    if (error) return fail("Erro ao salvar", error);
    await removeSiteMedia([mOriginalPhoto, ...uploadedNow.current].filter(u => u && u !== mForm.photo_url));
    uploadedNow.current = [];
    toast({ title: isNew ? "Pessoa adicionada" : "Dados atualizados", description: payload.name });
    setMemberModal(null);
    changed();
  };

  const removeMember = async (m: TeamMember) => {
    if (!(await confirm(`Tirar ${m.name} da equipe?`, "A pessoa sai da página Equipe e a foto é apagada."))) return;
    setBusy(true);
    const { error } = await supabase.from("team_members").delete().eq("id", m.id);
    if (!error) await removeSiteMedia([m.photo_url]);
    setBusy(false);
    if (error) return fail("Erro ao excluir", error);
    toast({ title: "Removida da equipe", description: m.name });
    changed();
  };

  // Troca a posição com o vizinho (dentro do grupo, ou entre grupos).
  const swap = async (table: "team_members" | "team_groups", a: { id: string; position: number }, b: { id: string; position: number } | undefined) => {
    if (!b || busy) return;
    setBusy(true);
    const r = await Promise.all([
      supabase.from(table).update({ position: b.position }).eq("id", a.id),
      supabase.from(table).update({ position: a.position }).eq("id", b.id),
    ]);
    setBusy(false);
    const err = r.find(x => x.error)?.error;
    if (err) return fail("Erro ao reordenar", err);
    load();
  };

  // ─── Grupos ────────────────────────────────────────────────────────────────
  const openGroup = (g?: TeamGroup) => {
    const f = { title: g?.title ?? "", subtitle: g?.subtitle ?? "" };
    setGForm(f);
    setGOriginal(f);
    setGroupModal(g?.id ?? "new");
  };

  const saveGroup = async () => {
    if (!gForm.title.trim()) return void toast({ title: "Preencha o nome do grupo", variant: "destructive" });
    setSaving(true);
    const payload = { title: gForm.title.trim(), subtitle: gForm.subtitle.trim() || null };
    const { error } = groupModal === "new"
      ? await supabase.from("team_groups").insert([{ ...payload, position: Math.max(-1, ...groups.map(g => g.position)) + 1 }])
      : await supabase.from("team_groups").update(payload).eq("id", groupModal);
    setSaving(false);
    if (error) return fail("Erro ao salvar o grupo", error);
    setGroupModal(null);
    changed();
  };

  const removeGroup = async (g: TeamGroup) => {
    if (g.members.length) return void toast({ title: "O grupo ainda tem pessoas", description: "Mova ou remova as pessoas antes de excluir o grupo.", variant: "destructive" });
    if (!(await confirm(`Excluir o grupo "${g.title}"?`))) return;
    const { error } = await supabase.from("team_groups").delete().eq("id", g.id);
    if (error) return fail("Erro ao excluir", error);
    changed();
  };

  if (loading) return <Loading />;

  return (
    <>
      <SectionHeader
        title="Equipe"
        subtitle="Página Equipe e o carrossel de O Projeto. A ordem aqui é a ordem do site. Clique numa pessoa para editar."
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/equipe" target="_blank" rel="noopener noreferrer" className={btn.secondary}>
              <ExternalLink className="h-4 w-4" /> Ver página
            </a>
            <button onClick={() => openGroup()} className={btn.primary}>
              <Plus className="h-5 w-5" /> Novo grupo
            </button>
          </div>
        }
      />

      {groups.length === 0 && <EmptyState>Nenhum grupo ainda. Comece criando um (ex.: “Coordenação”).</EmptyState>}

      <div className="space-y-5">
        {groups.map((g, gi) => (
          <section key={g.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black">{g.title}</h2>
                {g.subtitle && <p className="text-sm text-gray-500">{g.subtitle}</p>}
                {g.members.length === 0 && <p className="text-xs font-semibold text-amber-700 mt-1">Grupo vazio — não aparece no site.</p>}
              </div>
              <ItemMenu label={`Ações do grupo ${g.title}`} items={[
                { label: "Editar grupo", icon: Pencil, onSelect: () => openGroup(g) },
                { label: "Adicionar pessoa", icon: Plus, onSelect: () => openNewMember(g.id) },
                { label: "Subir grupo", icon: ArrowUp, hidden: gi === 0, onSelect: () => swap("team_groups", g, groups[gi - 1]) },
                { label: "Descer grupo", icon: ArrowDown, hidden: gi === groups.length - 1, onSelect: () => swap("team_groups", g, groups[gi + 1]) },
                { label: "Excluir grupo", icon: Trash2, danger: true, onSelect: () => removeGroup(g) },
              ]} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {g.members.map((m, mi) => (
                <div key={m.id} className={`${cardCls} !shadow-none p-3 pt-4 text-center`}>
                  <div className="absolute top-1 right-1">
                    <ItemMenu label={`Ações de ${m.name}`} items={[
                      { label: "Editar", icon: Pencil, onSelect: () => openEditMember(m) },
                      { label: "Mover para antes", icon: ArrowLeft, hidden: mi === 0, onSelect: () => swap("team_members", m, g.members[mi - 1]) },
                      { label: "Mover para depois", icon: ArrowRight, hidden: mi === g.members.length - 1, onSelect: () => swap("team_members", m, g.members[mi + 1]) },
                      { label: "Remover da equipe", icon: Trash2, danger: true, onSelect: () => removeMember(m) },
                    ]} />
                  </div>
                  <div className="mx-auto mb-2 w-20 h-20 rounded-full overflow-hidden bg-orange-50 flex items-center justify-center">
                    {m.photo_url ? <img src={m.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-black text-orange-400">{initials(m.name)}</span>}
                  </div>
                  <OpenButton onClick={() => openEditMember(m)} label={`Editar ${m.name}`} className="w-full !text-center">
                    <span className="block text-sm font-bold leading-tight">{m.name}</span>
                    {m.role && <span className="block text-xs text-orange-700 font-semibold mt-0.5">{m.role}</span>}
                  </OpenButton>
                </div>
              ))}
              <button onClick={() => openNewMember(g.id)} className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-400 text-gray-500 hover:text-orange-600 flex flex-col items-center justify-center gap-1 py-6 text-sm font-bold transition-colors min-h-[9rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                <Plus className="h-5 w-5" /> Adicionar pessoa
              </button>
            </div>
          </section>
        ))}
      </div>
      {busy && <p className="mt-3 text-sm text-orange-600 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Salvando a nova ordem…</p>}

      {memberModal && (
        <Modal
          title={memberModal === "new" ? "Adicionar pessoa" : "Editar pessoa"}
          onClose={closeMember}
          onSave={saveMember}
          saving={saving}
          busy={uploading}
          dirty={JSON.stringify(mForm) !== JSON.stringify(mOriginal)}
        >
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => photoInput.current?.click()} disabled={uploading}
              className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 flex items-center justify-center shrink-0">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                : mForm.photo_url ? <img src={mForm.photo_url} alt="" className="w-full h-full object-cover" />
                : <ImagePlus className="h-6 w-6 text-gray-400" />}
            </button>
            <div className="text-sm text-gray-500">
              <p className="font-bold text-gray-700">Foto</p>
              <p>Clique no círculo para {mForm.photo_url ? "trocar" : "enviar"}. A foto é cortada em quadrado pelo centro.</p>
              {mForm.photo_url && <button type="button" onClick={() => setMForm(f => ({ ...f, photo_url: null }))} className="text-red-600 font-bold hover:underline mt-1">Remover foto</button>}
            </div>
            <input ref={photoInput} type="file" accept="image/*" hidden onChange={e => { uploadPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          <Field label="Nome">
            <input value={mForm.name} onChange={e => setMForm({ ...mForm, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Cargo" hint="opcional">
            <input value={mForm.role} onChange={e => setMForm({ ...mForm, role: e.target.value })} placeholder="Ex: Coordenadora, Bolsista CNPq, Mentora" className={inputCls} />
          </Field>
          <Field label="Descrição" hint="cada linha aparece em uma linha no site">
            <textarea value={mForm.bio} onChange={e => setMForm({ ...mForm, bio: e.target.value })} rows={3} placeholder={"Escola ou instituição.\nÁrea de atuação: Matemática"} className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Grupo">
            <select value={mForm.group_id} onChange={e => setMForm({ ...mForm, group_id: e.target.value })} className={inputCls}>
              {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {groupModal && (
        <Modal
          title={groupModal === "new" ? "Novo grupo" : "Editar grupo"}
          onClose={() => setGroupModal(null)}
          onSave={saveGroup}
          saving={saving}
          dirty={JSON.stringify(gForm) !== JSON.stringify(gOriginal)}
        >
          <Field label="Nome do grupo">
            <input value={gForm.title} onChange={e => setGForm({ ...gForm, title: e.target.value })} placeholder="Ex: Acadêmicos Bolsistas" className={inputCls} />
          </Field>
          <Field label="Frase abaixo do nome" hint="opcional">
            <input value={gForm.subtitle} onChange={e => setGForm({ ...gForm, subtitle: e.target.value })} className={inputCls} />
          </Field>
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
