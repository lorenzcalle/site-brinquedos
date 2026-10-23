import { supabase } from "@/lib/supabase";
import { uniqueName } from "@/lib/image";

// Manuais em PDF da aba "Manuais" de /materiais (tabela `manuals`, bucket `manuais`).
// Ver site-brinquedos/supabase/manuais.sql.
export type Manual = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_size: number | null;
  pages: number | null;
  cover_url: string | null;
  position: number;
};

const BUCKET = "manuais";
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

export async function fetchManuals(): Promise<Manual[]> {
  const { data, error } = await supabase.from("manuals").select("*").order("position").order("created_at");
  return error ? [] : (data as Manual[]);
}

export async function uploadManualFile(blob: Blob, ext: "pdf" | "jpg"): Promise<string> {
  const path = uniqueName(ext);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: ext === "pdf" ? "application/pdf" : "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function removeManualFiles(...urls: (string | null | undefined)[]) {
  const paths = urls
    .filter((u): u is string => !!u && u.includes(MARKER))
    .map(u => decodeURIComponent(u.slice(u.indexOf(MARKER) + MARKER.length)));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

// Nº de páginas e imagem da 1ª página, lidos no navegador (pdf.js só carrega aqui).
export async function readPdf(file: File): Promise<{ pages: number; cover: Blob }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1000 / Math.max(base.width, base.height) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const cover = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Falha ao gerar a capa"))), "image/jpeg", 0.85));
    return { pages: pdf.numPages, cover };
  } finally {
    pdf.destroy();
  }
}

// "PDF · 10 páginas · 4,6 MB"
export function manualMeta(m: Pick<Manual, "pages" | "file_size">) {
  const mb = m.file_size ? `${(m.file_size / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB` : null;
  return ["PDF", m.pages && `${m.pages} ${m.pages === 1 ? "página" : "páginas"}`, mb].filter(Boolean).join(" · ");
}

// O Supabase devolve o arquivo como download (em vez de abrir) com ?download=nome.
export function manualDownloadUrl(m: Pick<Manual, "file_url" | "title">) {
  const name = m.title.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${m.file_url}?download=${encodeURIComponent(`${name || "manual"}.pdf`)}`;
}
