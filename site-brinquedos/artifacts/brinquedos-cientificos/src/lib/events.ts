import { supabase } from "@/lib/supabase";
import { cropToJpeg } from "@/lib/image";

export type EventPhoto = { mini: string; full: string };

// Materiais para participantes (regulamento, fichas, modelos, datas importantes),
// exibidos na página Eventos enquanto o evento está em "Próximos".
export type ParticipantFile = { label: string; url: string | null; sub?: string }; // url null = "Em breve"
export type ParticipantDoc = { title: string; description?: string; note?: string; files: ParticipantFile[] };
export type ParticipantInfo = {
  title?: string; // padrão "Para os participantes"
  intro?: string; // aceita **negrito**
  dates?: { label: string; date: string }[]; // date é texto livre ("15/06/2026 a 18/09/2026")
  docs?: ParticipantDoc[];
};

export const hasParticipantInfo = (p?: ParticipantInfo | null) =>
  !!p && !!(p.intro?.trim() || p.dates?.length || p.docs?.length);

// Linha da tabela `events`. Os campos de inscrição, álbum e fotos vieram de constantes
// do events.tsx (chaveadas pelo título) e hoje são editados no /admin — ver
// site-brinquedos/supabase/eventos-admin.sql.
export type EventRow = {
  id: string;
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
  type: "upcoming" | "past";
  registration_url?: string | null;
  registration_deadline?: string | null; // YYYY-MM-DD, último dia de inscrição
  album_url?: string | null; // pasta do Drive, forma drive.google.com/drive/folders/<id>
  album_label?: string | null; // texto do botão; vazio = "Confira as fotos e vídeos"
  photos?: EventPhoto[] | null;
  participant_info?: ParticipantInfo | null;
};

// A coluna `date` é NOT NULL; eventos com data a confirmar usam esta data-placeholder,
// que a UI exibe como "A definir" (manter em sincronia com seed-evento.mjs).
export const TBD_DATE = "2099-12-31";

// Hoje no fuso do Brasil, em YYYY-MM-DD (comparável direto com a coluna `date`).
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

// Evento marcado como "Próximo" cuja data já passou conta como passado: ninguém precisa
// lembrar de mudar a situação depois que o evento acontece. "A definir" nunca passa.
export const isPast = (ev: Pick<EventRow, "type" | "date">) =>
  ev.type === "past" || (!!ev.date && ev.date !== TBD_DATE && ev.date < today());

export const EVENT_BUCKET = "event-media";

// O link que aparece na barra do navegador vem com `/u/2/` (índice da conta Google de
// quem está logado) e daria erro para quem visita o site. Reduz para a forma pública.
export function normalizeDriveFolder(url: string): string {
  const m = url.match(/drive\.google\.com\/.*folders\/([\w-]+)/);
  return m ? `https://drive.google.com/drive/folders/${m[1]}` : url.trim();
}

async function upload(path: string, blob: Blob): Promise<string> {
  const { error } = await supabase.storage.from(EVENT_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(EVENT_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Sobe uma foto do evento em dois tamanhos, como as fotos antigas de public/fotos-eventos:
// miniatura 400x225 para a grade e 1600x900 para o lightbox (16:9).
export async function uploadEventPhoto(eventId: string, file: File): Promise<EventPhoto> {
  const base = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const [mini, full] = await Promise.all([cropToJpeg(file, 400, 225), cropToJpeg(file, 1600, 900)]);
  return { mini: await upload(`${base}-mini.jpg`, mini), full: await upload(`${base}.jpg`, full) };
}

// Imagem de capa do card (image_url), também 16:9.
export async function uploadEventCover(eventId: string, file: File): Promise<string> {
  return upload(`${eventId}/capa-${Date.now()}.jpg`, await cropToJpeg(file, 1200, 675));
}

// Documentos (PDF, Word, PowerPoint…) vão para outro bucket, sem restrição de tipo de
// imagem e com limite de 50 MB. O nome original é mantido para o download sair legível.
export const EVENT_FILES_BUCKET = "event-files";

const SIZE_FMT = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export async function uploadEventDocument(eventId: string, file: File): Promise<ParticipantFile & { url: string }> {
  const safe = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w.-]+/g, "-").toLowerCase();
  const path = `${eventId}/${Date.now()}/${safe}`;
  const { error } = await supabase.storage.from(EVENT_FILES_BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  const ext = (safe.split(".").pop() ?? "").toUpperCase();
  return {
    label: "",
    url: supabase.storage.from(EVENT_FILES_BUCKET).getPublicUrl(path).data.publicUrl,
    sub: [ext, SIZE_FMT(file.size)].filter(Boolean).join(" · "),
  };
}

// Apaga dos buckets do evento os arquivos que são deles (fotos antigas em /fotos-eventos
// e arquivos em /downloads ficam).
export async function removeEventFiles(urls: (string | null | undefined)[]) {
  for (const bucket of [EVENT_BUCKET, EVENT_FILES_BUCKET]) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const paths = urls
      .filter((u): u is string => !!u && u.includes(marker))
      .map(u => decodeURIComponent(u.slice(u.indexOf(marker) + marker.length)));
    if (paths.length) await supabase.storage.from(bucket).remove(paths);
  }
}

// Todos os arquivos guardados por um evento (para limpar ao excluir/trocar).
export const eventFileUrls = (ev: Pick<EventRow, "image_url" | "photos" | "participant_info">) => [
  ev.image_url,
  ...(ev.photos ?? []).flatMap(p => [p.mini, p.full]),
  ...(ev.participant_info?.docs ?? []).flatMap(d => d.files.map(f => f.url)),
];
