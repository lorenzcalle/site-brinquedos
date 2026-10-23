import { supabase } from "@/lib/supabase";

// A seção "Nossa missão" da home mostra exatamente 2 brinquedos em destaque.
export const HOME_FEATURED_SLOTS = 2;

// Normaliza concepts/materials que podem vir como array (envio novo) ou string (envio antigo)
export function toArray(val: unknown): string[] {
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

export async function removeToyFiles(...urls: (string | null | undefined)[]) {
  const imgs = urls.map(u => storagePath(u, "toy-images")).filter((p): p is string => !!p);
  const pdfs = urls.map(u => storagePath(u, "toy-guides")).filter((p): p is string => !!p);
  if (imgs.length) await supabase.storage.from("toy-images").remove(imgs);
  if (pdfs.length) await supabase.storage.from("toy-guides").remove(pdfs);
}
