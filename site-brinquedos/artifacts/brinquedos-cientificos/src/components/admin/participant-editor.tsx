import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type ParticipantDoc, type ParticipantInfo, uploadEventDocument } from "@/lib/events";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader2, Link2, FileText } from "lucide-react";

const small = "w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors text-sm";
const MAX_MB = 50;

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

// Editor da seção "Materiais para participantes" de um evento (título, texto, datas
// importantes e documentos com arquivos para baixar).
export function ParticipantEditor({ eventId, value, onChange, onUploaded, onBusy }: {
  eventId: string;
  value: ParticipantInfo;
  onChange: (v: ParticipantInfo) => void;
  onUploaded: (url: string) => void; // para apagar do bucket se o modal for cancelado
  onBusy: (delta: number) => void;
}) {
  const { toast } = useToast();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const dates = value.dates ?? [];
  const docs = value.docs ?? [];
  const setDocs = (d: ParticipantDoc[]) => onChange({ ...value, docs: d });
  const setDoc = (i: number, patch: Partial<ParticipantDoc>) => setDocs(docs.map((d, k) => (k === i ? { ...d, ...patch } : d)));

  const upload = async (di: number, fi: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return void toast({ title: `Arquivo maior que ${MAX_MB} MB`, variant: "destructive" });
    const key = `${di}-${fi}`;
    setUploadingKey(key);
    onBusy(1);
    try {
      const up = await uploadEventDocument(eventId, file);
      onUploaded(up.url);
      const files = [...docs[di].files];
      files[fi] = { ...files[fi], url: up.url, sub: up.sub };
      setDoc(di, { files });
    } catch (e) {
      toast({ title: `Não foi possível enviar ${file.name}`, description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploadingKey(null);
      onBusy(-1);
    }
  };

  return (
    <fieldset className="rounded-xl border border-gray-200 p-4 space-y-4">
      <legend className="px-1 text-sm font-black text-gray-700">Materiais para participantes</legend>
      <p className="text-xs text-gray-500">
        Regulamento, fichas, modelos e datas importantes. Aparece numa faixa laranja abaixo dos próximos eventos
        enquanto este evento estiver como “Próximo evento”. Deixe tudo vazio para não mostrar.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Título da seção</label>
          <input value={value.title ?? ""} onChange={e => onChange({ ...value, title: e.target.value })} placeholder="Para os participantes" className={small} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Texto de apresentação <span className="font-normal text-gray-500">(**negrito**)</span></label>
        <textarea value={value.intro ?? ""} onChange={e => onChange({ ...value, intro: e.target.value })} rows={2} className={`${small} resize-y`} />
      </div>

      {/* Datas importantes */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-1">Datas importantes</p>
        <div className="space-y-2">
          {dates.map((d, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={d.date} onChange={e => onChange({ ...value, dates: dates.map((x, k) => (k === i ? { ...x, date: e.target.value } : x)) })} placeholder="15/06/2026 a 18/09/2026" className={`${small} w-44 shrink-0`} />
              <input value={d.label} onChange={e => onChange({ ...value, dates: dates.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} placeholder="O que acontece" className={small} />
              <button type="button" onClick={() => onChange({ ...value, dates: move(dates, i, -1) })} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 shrink-0" title="Subir"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onChange({ ...value, dates: dates.filter((_, k) => k !== i) })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 shrink-0" title="Remover"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChange({ ...value, dates: [...dates, { date: "", label: "" }] })} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline">
          <Plus className="h-3.5 w-3.5" /> Adicionar data
        </button>
      </div>

      {/* Documentos */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-1">Documentos</p>
        <div className="space-y-3">
          {docs.map((doc, di) => (
            <div key={di} className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <input value={doc.title} onChange={e => setDoc(di, { title: e.target.value })} placeholder="Ex: Regulamento" className={`${small} font-bold`} />
                <button type="button" onClick={() => setDocs(move(docs, di, -1))} className="p-1.5 rounded bg-white hover:bg-gray-100 border shrink-0" title="Subir"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setDocs(move(docs, di, 1))} className="p-1.5 rounded bg-white hover:bg-gray-100 border shrink-0" title="Descer"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setDocs(docs.filter((_, k) => k !== di))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 shrink-0" title="Remover documento"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <textarea value={doc.description ?? ""} onChange={e => setDoc(di, { description: e.target.value })} rows={1} placeholder="Descrição curta (opcional)" className={`${small} resize-y`} />
              <input value={doc.note ?? ""} onChange={e => setDoc(di, { note: e.target.value })} placeholder="Aviso em destaque, amarelo (opcional)" className={small} />

              {doc.files.map((f, fi) => (
                <div key={fi} className="flex flex-wrap gap-2 items-center bg-white rounded-lg border p-2">
                  <input value={f.label} onChange={e => setDoc(di, { files: doc.files.map((x, k) => (k === fi ? { ...x, label: e.target.value } : x)) })} placeholder="Texto do botão (ex: Baixar regulamento)" className={`${small} flex-1 min-w-[10rem]`} />
                  <input value={f.sub ?? ""} onChange={e => setDoc(di, { files: doc.files.map((x, k) => (k === fi ? { ...x, sub: e.target.value } : x)) })} placeholder="PDF · 2 MB" className={`${small} w-28`} />
                  <label className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 px-2.5 py-2 rounded-lg cursor-pointer">
                    {uploadingKey === `${di}-${fi}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {f.url ? "Trocar" : "Enviar"} arquivo
                    <input type="file" hidden onChange={e => { upload(di, fi, e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  <button type="button" onClick={() => setDoc(di, { files: doc.files.filter((_, k) => k !== fi) })} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600" title="Remover botão"><Trash2 className="h-3.5 w-3.5" /></button>
                  <div className="w-full flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <input value={f.url ?? ""} onChange={e => setDoc(di, { files: doc.files.map((x, k) => (k === fi ? { ...x, url: e.target.value.trim() || null } : x)) })} placeholder="…ou cole um link (vazio = “Em breve”)" className={`${small} text-xs`} />
                    {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline shrink-0">Abrir</a>}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setDoc(di, { files: [...doc.files, { label: "", url: null }] })} className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline">
                <Plus className="h-3.5 w-3.5" /> Adicionar botão de download
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setDocs([...docs, { title: "", files: [{ label: "", url: null }] }])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold bg-white border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-600 px-3 py-2 rounded-lg">
          <FileText className="h-4 w-4" /> Adicionar documento
        </button>
      </div>
    </fieldset>
  );
}

// Remove linhas vazias antes de salvar; null se não sobrar nada.
export function cleanParticipantInfo(v: ParticipantInfo): ParticipantInfo | null {
  const dates = (v.dates ?? []).filter(d => d.date.trim() || d.label.trim());
  const docs = (v.docs ?? [])
    .map(d => ({ ...d, files: d.files.filter(f => f.label.trim() || f.url) }))
    .filter(d => d.title.trim() || d.files.length);
  const out: ParticipantInfo = {
    ...(v.title?.trim() ? { title: v.title.trim() } : {}),
    ...(v.intro?.trim() ? { intro: v.intro.trim() } : {}),
    ...(dates.length ? { dates } : {}),
    ...(docs.length ? { docs } : {}),
  };
  return Object.keys(out).length ? out : null;
}
