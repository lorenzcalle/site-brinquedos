import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  type EventPhoto, type EventRow, TBD_DATE, today,
  type ParticipantInfo, eventFileUrls,
  normalizeDriveFolder, uploadEventPhoto, uploadEventCover, removeEventFiles,
} from "@/lib/events";
import { EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, SectionHeader, SubHeading, btn, cardCls, inputCls, useConfirm } from "./ui";
import { ParticipantEditor, cleanParticipantInfo } from "./participant-editor";
import { Trash2, Loader2, Pencil, Plus, ImagePlus, ArrowLeft, ArrowRight, CalendarCheck, CalendarX, AlertTriangle, ExternalLink } from "lucide-react";

type Form = {
  title: string;
  date: string;
  dateTbd: boolean;
  time: string;
  location: string;
  description: string;
  type: "upcoming" | "past";
  registration_url: string;
  registration_deadline: string;
  album_url: string;
  album_label: string;
  image_url: string | null;
  photos: EventPhoto[];
  participant: ParticipantInfo;
};

const emptyForm: Form = {
  title: "", date: "", dateTbd: false, time: "", location: "", description: "", type: "upcoming",
  registration_url: "", registration_deadline: "", album_url: "", album_label: "", image_url: null, photos: [], participant: {},
};

function formatDate(d?: string | null) {
  if (!d || d === TBD_DATE) return "Data a definir";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(d));
}

// Aba "Eventos" do /admin: cria, edita e apaga eventos, com capa, fotos e álbum.
// Tudo vai direto para o Supabase — o site mostra a mudança na hora.
export function EventsAdmin({ onChange, startNew, onStarted }: { onChange: () => void; startNew?: boolean; onStarted?: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal: `editingId` é o id do evento (novo já nasce com id, para as fotos terem pasta).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [original, setOriginal] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  // Arquivos enviados nesta edição: se cancelar, são apagados do bucket.
  const uploadedNow = useRef<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
    if (error) toast({ title: "Erro ao carregar eventos", description: error.message, variant: "destructive" });
    const rows = (data as EventRow[]) ?? [];
    setEvents(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (startNew) { openNew(); onStarted?.(); }
  }, [startNew]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditingId(crypto.randomUUID());
    setIsNew(true);
    setForm(emptyForm);
    setOriginal(emptyForm);
    uploadedNow.current = [];
  };

  const openEdit = (ev: EventRow) => {
    const f: Form = {
      title: ev.title,
      date: ev.date && ev.date !== TBD_DATE ? ev.date : "",
      dateTbd: !ev.date || ev.date === TBD_DATE,
      time: ev.time ?? "",
      location: ev.location ?? "",
      description: ev.description ?? "",
      type: ev.type,
      registration_url: ev.registration_url ?? "",
      registration_deadline: ev.registration_deadline ?? "",
      album_url: ev.album_url ?? "",
      album_label: ev.album_label ?? "",
      image_url: ev.image_url ?? null,
      photos: ev.photos ?? [],
      participant: ev.participant_info ?? {},
    };
    setEditingId(ev.id);
    setIsNew(false);
    setForm(f);
    setOriginal(f);
    uploadedNow.current = [];
  };

  const close = async () => {
    if (uploading) return;
    // Cancelou: o que subiu agora e não foi salvo vira lixo no bucket.
    await removeEventFiles(uploadedNow.current);
    uploadedNow.current = [];
    setEditingId(null);
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length || !editingId) return;
    const list = Array.from(files);
    setUploading(n => n + list.length);
    for (const file of list) {
      try {
        const photo = await uploadEventPhoto(editingId, file);
        uploadedNow.current.push(photo.mini, photo.full);
        setForm(f => ({ ...f, photos: [...f.photos, photo] }));
      } catch (e) {
        toast({ title: `Não foi possível enviar ${file.name}`, description: (e as Error).message, variant: "destructive" });
      } finally {
        setUploading(n => n - 1);
      }
    }
  };

  const setCover = async (file: File | undefined) => {
    if (!file || !editingId) return;
    setUploading(n => n + 1);
    try {
      const url = await uploadEventCover(editingId, file);
      uploadedNow.current.push(url);
      set("image_url", url);
    } catch (e) {
      toast({ title: "Não foi possível enviar a capa", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(n => n - 1);
    }
  };

  const movePhoto = (i: number, dir: -1 | 1) => setForm(f => {
    const photos = [...f.photos];
    const j = i + dir;
    if (j < 0 || j >= photos.length) return f;
    [photos[i], photos[j]] = [photos[j], photos[i]];
    return { ...f, photos };
  });

  const save = async () => {
    if (!editingId) return;
    if (!form.title.trim()) return void toast({ title: "Preencha o título", variant: "destructive" });
    if (!form.dateTbd && !form.date) return void toast({ title: "Preencha a data (ou marque “Data a definir”)", variant: "destructive" });
    const reg = form.registration_url.trim();
    if (reg && !/^https?:\/\//.test(reg)) return void toast({ title: "O link de inscrição deve começar com https://", variant: "destructive" });

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      date: form.dateTbd ? TBD_DATE : form.date,
      time: form.time.trim() || null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      type: form.type,
      registration_url: reg || null,
      registration_deadline: reg && form.registration_deadline ? form.registration_deadline : null,
      album_url: form.album_url.trim() ? normalizeDriveFolder(form.album_url) : null,
      album_label: form.album_label.trim() || null,
      image_url: form.image_url,
      photos: form.photos,
      participant_info: cleanParticipantInfo(form.participant),
    };
    const { error } = isNew
      ? await supabase.from("events").insert([{ id: editingId, ...payload }])
      : await supabase.from("events").update(payload).eq("id", editingId);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar evento", description: error.message, variant: "destructive" });
      return;
    }
    // Salvo: apaga do bucket o que foi tirado (capa trocada, fotos removidas).
    const kept = new Set(eventFileUrls({ image_url: form.image_url, photos: form.photos, participant_info: payload.participant_info }));
    const before = [...eventFileUrls({ image_url: original.image_url, photos: original.photos, participant_info: original.participant }), ...uploadedNow.current];
    await removeEventFiles(before.filter(u => u && !kept.has(u)));
    uploadedNow.current = [];
    setEditingId(null);
    toast({ title: isNew ? "Evento criado" : "Evento atualizado", description: payload.title });
    load();
    onChange();
  };

  const markPast = async (ev: EventRow) => {
    setBusyId(ev.id);
    const { error } = await supabase.from("events").update({ type: "past" }).eq("id", ev.id);
    setBusyId(null);
    if (error) return void toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    toast({ title: "Movido para eventos passados", description: ev.title });
    load();
    onChange();
  };

  const remove = async (ev: EventRow) => {
    if (!(await confirm(`Excluir o evento "${ev.title}"?`, "Ele sai da página Eventos e as fotos enviadas por aqui são apagadas. Isso não pode ser desfeito."))) return;
    setBusyId(ev.id);
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (!error) await removeEventFiles(eventFileUrls(ev));
    setBusyId(null);
    if (error) return void toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    toast({ title: "Evento excluído", description: ev.title });
    load();
    onChange();
  };

  if (loading) return <Loading />;

  const upcoming = events.filter(e => e.type === "upcoming");
  const past = events.filter(e => e.type === "past");

  const card = (ev: EventRow) => {
    const late = ev.type === "upcoming" && ev.date && ev.date !== TBD_DATE && ev.date < today();
    const cover = ev.image_url ?? ev.photos?.[0]?.mini;
    return (
      <div key={ev.id} className={`${cardCls} p-3 sm:p-4 ${late ? "!border-amber-300" : ""}`}>
        <div className="flex gap-4 items-center">
          <div className="w-20 sm:w-28 aspect-video rounded-lg overflow-hidden bg-orange-50 shrink-0 flex items-center justify-center">
            {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <CalendarCheck className="h-6 w-6 text-orange-300" />}
          </div>
          <OpenButton onClick={() => openEdit(ev)} label={`Editar ${ev.title}`} className="flex-1 min-w-0">
            <span className="text-base font-bold leading-snug line-clamp-2 sm:line-clamp-1">{ev.title}</span>
            <span className="block text-sm text-gray-600 sm:truncate">
              {[formatDate(ev.date), ev.time, ev.location].filter(Boolean).join(" · ")}
            </span>
            <span className="block text-xs text-gray-500 truncate">
              {[ev.registration_url && "com inscrição", ev.photos?.length && `${ev.photos.length} foto(s)`, ev.album_url && "álbum", ev.participant_info && "materiais para participantes"].filter(Boolean).join(" · ")}
            </span>
          </OpenButton>
          <ItemMenu items={[
            { label: "Editar", icon: Pencil, onSelect: () => openEdit(ev) },
            { label: "Ver na página Eventos", icon: ExternalLink, onSelect: () => window.open("/eventos", "_blank", "noopener") },
            { label: "Marcar como passado", icon: CalendarX, hidden: ev.type !== "upcoming", onSelect: () => markPast(ev) },
            { label: "Excluir", icon: Trash2, danger: true, onSelect: () => remove(ev) },
          ]} />
        </div>
        {late && (
          <div className="relative z-10 mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-900 flex-1">A data já passou, mas o evento ainda aparece em “Próximos eventos”.</span>
            <button onClick={() => markPast(ev)} disabled={busyId === ev.id} className="text-sm font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2">
              {busyId === ev.id && <Loader2 className="h-4 w-4 animate-spin" />} Marcar como passado
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SectionHeader
        title="Eventos"
        subtitle="Página Eventos e Oficinas. Mudanças aparecem no site na hora."
        action={
          <button onClick={openNew} className={btn.primary}>
            <Plus className="h-5 w-5" /> Novo evento
          </button>
        }
      />

      <SubHeading>Próximos ({upcoming.length})</SubHeading>
      {upcoming.length === 0
        ? <EmptyState>Nenhum evento futuro — a página mostra “Nenhum evento agendado”.</EmptyState>
        : <div className="space-y-3">{upcoming.map(card)}</div>}

      <SubHeading className="mt-10">Passados ({past.length})</SubHeading>
      {past.length === 0 ? <EmptyState>Nenhum evento passado.</EmptyState> : <div className="space-y-3">{past.map(card)}</div>}

      {editingId && (
        <Modal
          wide
          title={isNew ? "Novo evento" : "Editar evento"}
          onClose={close}
          onSave={save}
          saving={saving}
          busy={uploading > 0}
          dirty={JSON.stringify(form) !== JSON.stringify(original)}
        >
          <Field label="Título">
            <input value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Data">
              <input type="date" value={form.date} disabled={form.dateTbd} onChange={e => set("date", e.target.value)} className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`} />
              <label className="mt-1.5 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.dateTbd} onChange={e => set("dateTbd", e.target.checked)} /> Data a definir
              </label>
            </Field>
            <Field label="Horário" hint="texto livre">
              <input value={form.time} onChange={e => set("time", e.target.value)} placeholder="Ex: 8h às 18h" className={inputCls} />
            </Field>
          </div>

          <Field label="Local">
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Ex: URI — Santo Ângelo/RS" className={inputCls} />
          </Field>

          <Field label="Descrição">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Situação">
            <div className="grid grid-cols-2 gap-2">
              {([["upcoming", "Próximo evento"], ["past", "Já aconteceu"]] as const).map(([v, l]) => (
                <button key={v} type="button" onClick={() => set("type", v)}
                  className={`py-2.5 rounded-xl font-bold border-2 transition-colors ${form.type === v ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </Field>

          {/* Inscrição */}
          <fieldset className="rounded-xl border border-gray-200 p-4 space-y-3">
            <legend className="px-1 text-sm font-black text-gray-700">Inscrição</legend>
            <p className="text-xs text-gray-500">
              Com link, o evento ganha o banner laranja com botão “Inscrever-se”. Depois do prazo, o botão some
              e o selo vira “Inscrições encerradas”. Sem link, o botão leva para a página de contato.
            </p>
            <Field label="Link do formulário" hint="opcional">
              <input value={form.registration_url} onChange={e => set("registration_url", e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Último dia de inscrição" hint="opcional">
              <input type="date" value={form.registration_deadline} disabled={!form.registration_url.trim()} onChange={e => set("registration_deadline", e.target.value)} className={`${inputCls} disabled:bg-gray-50`} />
            </Field>
          </fieldset>

          {/* Imagens */}
          <fieldset className="rounded-xl border border-gray-200 p-4 space-y-4">
            <legend className="px-1 text-sm font-black text-gray-700">Imagens</legend>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Capa do card <span className="font-normal text-gray-500">(opcional)</span></p>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="" className="w-32 aspect-video object-cover rounded-lg border" />}
                <button type="button" onClick={() => coverInput.current?.click()} className="text-sm font-bold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
                  {form.image_url ? "Trocar" : "Enviar capa"}
                </button>
                {form.image_url && <button type="button" onClick={() => set("image_url", null)} className="text-sm font-bold text-red-600 hover:underline">Remover</button>}
                <input ref={coverInput} type="file" accept="image/*" hidden onChange={e => { setCover(e.target.files?.[0]); e.target.value = ""; }} />
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Fotos do evento</p>
              <p className="text-xs text-gray-500 mb-2">
                Aparecem como miniaturas no card de evento passado e ampliam ao clicar. São cortadas em 16:9
                pelo centro — confira a miniatura (foto vertical perde o topo e a base). 4 a 6 fotos ficam bem.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.photos.map((p, i) => (
                  <div key={p.mini} className="relative w-32 aspect-video rounded-lg overflow-hidden border group">
                    <img src={p.mini} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => movePhoto(i, -1)} className="p-1 rounded bg-white/90" title="Mover para a esquerda"><ArrowLeft className="h-4 w-4" /></button>
                      <button type="button" onClick={() => set("photos", form.photos.filter((_, j) => j !== i))} className="p-1 rounded bg-white/90 text-red-600" title="Remover"><Trash2 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => movePhoto(i, 1)} className="p-1 rounded bg-white/90" title="Mover para a direita"><ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => photoInput.current?.click()} className="w-32 aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-500 hover:text-orange-600 flex flex-col items-center justify-center text-xs font-bold transition-colors">
                  <ImagePlus className="h-5 w-5 mb-1" /> Adicionar
                </button>
                <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={e => { addPhotos(e.target.files); e.target.value = ""; }} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Álbum completo" hint="pasta do Drive">
                <input value={form.album_url} onChange={e => set("album_url", e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className={inputCls} />
              </Field>
              <Field label="Texto do botão do álbum">
                <input value={form.album_label} onChange={e => set("album_label", e.target.value)} placeholder="Confira as fotos e vídeos" className={inputCls} />
              </Field>
            </div>
            {form.album_url.trim() && (
              <a href={normalizeDriveFolder(form.album_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                <ExternalLink className="h-3 w-3" /> Testar o link do álbum (abra numa janela anônima para ver como o público vê)
              </a>
            )}
          </fieldset>

          <ParticipantEditor
            eventId={editingId}
            value={form.participant}
            onChange={v => set("participant", v)}
            onUploaded={url => uploadedNow.current.push(url)}
            onBusy={d => setUploading(n => n + d)}
          />
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
