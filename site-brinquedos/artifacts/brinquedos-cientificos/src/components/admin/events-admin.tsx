import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  type EventPhoto, type EventRow, TBD_DATE, today, isPast,
  type ParticipantInfo, eventFileUrls,
  normalizeDriveFolder, uploadEventPhoto, uploadEventCover, removeEventFiles,
} from "@/lib/events";
import {
  DragHandle, DropHint, DropZone, EmptyState, Field, ItemMenu, Loading, Modal, OpenButton, PillTabs, SectionHeader, SubHeading,
  btn, cardCls, inputCls, moveItem, useConfirm, useDragSort, useFieldErrors,
} from "./ui";
import { LastChange } from "./last-change";
import { ParticipantEditor, cleanParticipantInfo } from "./participant-editor";
import { Trash2, Pencil, Plus, ImagePlus, ArrowLeft, ArrowRight, CalendarCheck, CalendarX, ExternalLink, Info } from "lucide-react";

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

type Tab = "info" | "inscricao" | "fotos" | "materiais";
type ErrKey = "title" | "date" | "registration_url" | "registration_deadline" | "album_url";
const ERR_TAB: Record<ErrKey, Tab> = { title: "info", date: "info", registration_url: "inscricao", registration_deadline: "inscricao", album_url: "fotos" };

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
  const [tab, setTab] = useState<Tab>("info");
  const { errors, check, clear, reset } = useFieldErrors<ErrKey>();
  const photoSort = useDragSort((from, to) => set("photos", moveItem(form.photos, from, to)));

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

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k in ERR_TAB) clear(k as ErrKey);
    if (k === "dateTbd") clear("date");
  };

  const openNew = () => {
    setEditingId(crypto.randomUUID());
    setIsNew(true);
    setForm(emptyForm);
    setOriginal(emptyForm);
    setTab("info");
    reset();
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
    setTab("info");
    reset();
    uploadedNow.current = [];
  };

  const close = async () => {
    if (uploading) return;
    // Cancelou: o que subiu agora e não foi salvo vira lixo no bucket.
    await removeEventFiles(uploadedNow.current);
    uploadedNow.current = [];
    setEditingId(null);
  };

  const addPhotos = async (list: File[]) => {
    if (!list.length || !editingId) return;
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
    const reg = form.registration_url.trim();
    const album = form.album_url.trim();
    const found: Partial<Record<ErrKey, string | false>> = {
      title: !form.title.trim() && "Escreva o nome do evento.",
      date: !form.dateTbd && !form.date && "Escolha a data — ou marque “Ainda sem data”.",
      registration_url: !!reg && !/^https?:\/\//.test(reg) && "O link precisa começar com https:// (copie o endereço inteiro do formulário).",
      registration_deadline: !!reg && !!form.registration_deadline && !form.dateTbd && !!form.date && form.registration_deadline > form.date && "O prazo de inscrição está depois do dia do evento.",
      album_url: !!album && !/^https?:\/\//.test(album) && "O link do álbum precisa começar com https://",
    };
    if (!check(found)) {
      const first = (Object.keys(ERR_TAB) as ErrKey[]).find(k => found[k]);
      if (first) setTab(ERR_TAB[first]);
      return;
    }

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

  const upcoming = events.filter(e => !isPast(e));
  const past = events.filter(e => isPast(e));

  const card = (ev: EventRow) => {
    const cover = ev.image_url ?? ev.photos?.[0]?.mini;
    return (
      <div key={ev.id} className={`${cardCls} p-3 sm:p-4 flex gap-4 items-center`}>
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
          { label: "Mover para passados", icon: CalendarX, hidden: isPast(ev), onSelect: () => markPast(ev) },
          { label: "Excluir", icon: Trash2, danger: true, onSelect: () => remove(ev) },
        ]} />
      </div>
    );
  };

  const autoPast = form.type === "upcoming" && !form.dateTbd && !!form.date && form.date < today();
  const errTabs = new Set((Object.keys(errors) as ErrKey[]).map(k => ERR_TAB[k]));
  const docsCount = form.participant.docs?.length ?? 0;

  return (
    <>
      <SectionHeader
        title="Eventos"
        subtitle="Página Eventos e Oficinas. Depois da data, o evento passa sozinho para “Passados”."
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
          note={<LastChange entity="evento" id={isNew ? null : editingId} />}
          toolbar={
            <PillTabs<Tab> label="Partes do evento" value={tab} onChange={setTab} className="mb-3 !flex-nowrap max-w-full overflow-x-auto" items={[
              { key: "info", label: "Informações", alert: errTabs.has("info") },
              { key: "inscricao", label: "Inscrição", alert: errTabs.has("inscricao") },
              { key: "fotos", label: "Fotos", count: form.photos.length || undefined, alert: errTabs.has("fotos") },
              { key: "materiais", label: "Materiais", count: docsCount || undefined },
            ]} />
          }
        >
          {tab === "info" && <>
            <Field label="Nome do evento" required error={errors.title}>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Mostra Missioneira de Brinquedos Científicos" className={inputCls} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Data" required error={errors.date}>
                <input type="date" value={form.date} disabled={form.dateTbd} onChange={e => set("date", e.target.value)} className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`} />
                <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.dateTbd} onChange={e => set("dateTbd", e.target.checked)} className="h-4 w-4 accent-orange-500" /> Ainda sem data (aparece “A definir”)
                </label>
              </Field>
              <Field label="Horário" help="Escreva como quiser.">
                <input value={form.time} onChange={e => set("time", e.target.value)} placeholder="Ex: 8h às 18h" className={inputCls} />
              </Field>
            </div>

            <Field label="Local">
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Ex: URI — Santo Ângelo/RS" className={inputCls} />
            </Field>

            <Field label="Descrição" help="Aparece no card do evento.">
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className={`${inputCls} resize-y`} />
            </Field>

            <Field label="Onde aparece">
              <div className="grid grid-cols-2 gap-2">
                {([["upcoming", "Próximos eventos"], ["past", "Eventos passados"]] as const).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => set("type", v)} aria-pressed={form.type === v}
                    className={`py-2.5 rounded-xl font-bold border-2 transition-colors ${form.type === v ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            {autoPast && (
              <p className="flex gap-2 text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" /> A data já passou, então o site mostra este evento em “Eventos passados” automaticamente.
              </p>
            )}
          </>}

          {tab === "inscricao" && <>
            <p className="flex gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
              <span>Com link, o evento ganha o botão laranja “Inscrever-se”. Depois do prazo, o botão some e aparece
              “Inscrições encerradas”. Sem link, o botão leva para a página de contato.</span>
            </p>
            <Field label="Link do formulário de inscrição" error={errors.registration_url} help="Ex.: o endereço do Google Forms.">
              <input value={form.registration_url} onChange={e => set("registration_url", e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Último dia de inscrição" error={errors.registration_deadline} help={form.registration_url.trim() ? "Vazio = inscrições abertas até o evento." : "Preencha o link primeiro."}>
              <input type="date" value={form.registration_deadline} disabled={!form.registration_url.trim()} onChange={e => set("registration_deadline", e.target.value)} className={`${inputCls} disabled:bg-gray-50`} />
            </Field>
          </>}

          {tab === "fotos" && <>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Imagem de capa</p>
              <p className="text-xs text-gray-500 mb-2">Aparece no topo do card. Sem capa, o site usa a primeira foto.</p>
              <div className="flex flex-wrap items-center gap-3">
                <DropZone label={form.image_url ? "Trocar a capa" : "Enviar capa"} accept="image/*" onFiles={f => setCover(f[0])}
                  className="w-48 aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {form.image_url ? <img src={form.image_url} alt="" className="w-full h-full object-cover" /> : <DropHint icon={ImagePlus} text="Enviar capa" sub="ou arraste" />}
                </DropZone>
                {form.image_url && <button type="button" onClick={() => set("image_url", null)} className="text-sm font-bold text-red-600 hover:underline">Remover capa</button>}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Fotos do evento</p>
              <p className="text-xs text-gray-500 mb-2">
                Miniaturas que ampliam ao clicar. São cortadas em 16:9 pelo centro (foto em pé perde o topo e a base).
                4 a 6 fotos ficam bem. Arraste uma foto para mudar a ordem.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.photos.map((p, i) => (
                  <div key={p.mini} {...photoSort.whole(i)}
                    className={`relative w-32 aspect-video rounded-lg overflow-hidden border group cursor-grab ${photoSort.whole(i).className}`}>
                    <img src={p.mini} alt={`Foto ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/50 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => set("photos", moveItem(form.photos, i, Math.max(0, i - 1)))} className="p-1 rounded bg-white/90" title="Mover para a esquerda" aria-label="Mover para a esquerda"><ArrowLeft className="h-4 w-4" /></button>
                      <button type="button" onClick={() => set("photos", form.photos.filter((_, j) => j !== i))} className="p-1 rounded bg-white/90 text-red-600" title="Remover" aria-label="Remover foto"><Trash2 className="h-4 w-4" /></button>
                      <button type="button" onClick={() => set("photos", moveItem(form.photos, i, Math.min(form.photos.length - 1, i + 1)))} className="p-1 rounded bg-white/90" title="Mover para a direita" aria-label="Mover para a direita"><ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                <DropZone label="Adicionar fotos" accept="image/*" multiple onFiles={addPhotos}
                  className="w-32 aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-500 hover:text-orange-600 flex flex-col items-center justify-center text-xs font-bold">
                  <ImagePlus className="h-5 w-5 mb-1" /> Adicionar
                </DropZone>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Álbum completo" hint="pasta do Google Drive" error={errors.album_url}>
                <input value={form.album_url} onChange={e => set("album_url", e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className={inputCls} />
              </Field>
              <Field label="Texto do botão do álbum">
                <input value={form.album_label} onChange={e => set("album_label", e.target.value)} placeholder="Confira as fotos e vídeos" className={inputCls} />
              </Field>
            </div>
            {form.album_url.trim() && (
              <a href={normalizeDriveFolder(form.album_url)} target="_blank" rel="noopener noreferrer" className={`${btn.link} text-xs`}>
                <ExternalLink className="h-3 w-3" /> Testar o link do álbum (abra numa janela anônima para ver como o público vê)
              </a>
            )}
          </>}

          {tab === "materiais" && (
            <ParticipantEditor
              eventId={editingId}
              value={form.participant}
              onChange={v => set("participant", v)}
              onUploaded={url => uploadedNow.current.push(url)}
              onBusy={d => setUploading(n => n + d)}
            />
          )}
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
