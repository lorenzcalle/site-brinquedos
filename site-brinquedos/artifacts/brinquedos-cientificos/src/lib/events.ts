import { supabase } from "@/lib/supabase";

export type EventPhoto = { mini: string; full: string };

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
};

// A coluna `date` é NOT NULL; eventos com data a confirmar usam esta data-placeholder,
// que a UI exibe como "A definir" (manter em sincronia com seed-evento.mjs).
export const TBD_DATE = "2099-12-31";

export const EVENT_BUCKET = "event-media";

// O link que aparece na barra do navegador vem com `/u/2/` (índice da conta Google de
// quem está logado) e daria erro para quem visita o site. Reduz para a forma pública.
export function normalizeDriveFolder(url: string): string {
  const m = url.match(/drive\.google\.com\/.*folders\/([\w-]+)/);
  return m ? `https://drive.google.com/drive/folders/${m[1]}` : url.trim();
}

// Recorta a imagem no centro para a proporção w:h e reduz para w×h, em JPEG.
// Feito no navegador porque não há ferramenta de imagem no servidor; as fotos de
// celular (verticais) perdem topo e base — o admin vê a miniatura antes de salvar.
async function cropToJpeg(file: File, w: number, h: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.max(w / bmp.width, h / bmp.height);
  const sw = w / scale, sh = h / scale;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Falha ao converter a imagem"))), "image/jpeg", 0.85),
  );
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

// Apaga do bucket os arquivos que são dele (fotos antigas em /fotos-eventos ficam).
export async function removeEventFiles(urls: (string | null | undefined)[]) {
  const marker = `/storage/v1/object/public/${EVENT_BUCKET}/`;
  const paths = urls
    .filter((u): u is string => !!u && u.includes(marker))
    .map(u => decodeURIComponent(u.slice(u.indexOf(marker) + marker.length)));
  if (paths.length) await supabase.storage.from(EVENT_BUCKET).remove(paths);
}
