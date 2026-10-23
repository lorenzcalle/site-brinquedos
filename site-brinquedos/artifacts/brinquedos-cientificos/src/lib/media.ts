import { supabase } from "@/lib/supabase";
import { uniqueName } from "@/lib/image";

// Bucket `site-media`: fotos da equipe e imagens dos textos do site (banner da home).
const BUCKET = "site-media";
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

export async function uploadSiteMedia(folder: string, blob: Blob): Promise<string> {
  const path = `${folder}/${uniqueName("jpg")}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Apaga só o que está neste bucket (imagens embutidas no site são ignoradas).
export async function removeSiteMedia(urls: (string | null | undefined)[]) {
  const paths = urls
    .filter((u): u is string => !!u && u.includes(MARKER))
    .map(u => decodeURIComponent(u.slice(u.indexOf(MARKER) + MARKER.length)));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}
