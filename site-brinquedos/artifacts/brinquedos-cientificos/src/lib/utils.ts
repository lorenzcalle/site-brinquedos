import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cachifyImage = (url: string) =>
  url.replace(
    "https://ssreltrosmcnegmozbyf.supabase.co/storage/v1/object/public/toy-images/",
    "/img-cache/"
  );

// Extrai o ID de um vídeo do YouTube a partir de qualquer formato de link
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const youtubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id: string) => `https://www.youtube.com/embed/${id}`;

// Extrai o ID de um arquivo do Google Drive (file/d/ID, open?id=, uc?id=, thumbnail?id=)
export function driveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|(?:uc|open|thumbnail)\?(?:[\w=&-]*?)id=)([A-Za-z0-9_-]{10,})/);
  return m ? m[1] : null;
}

export const driveThumb = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w640`;
export const driveEmbed = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

// ─── Genéricos: aceitam link do YouTube OU do Google Drive ───────────────────
export function videoThumb(url: string): string | null {
  const yt = youtubeId(url);
  if (yt) return youtubeThumb(yt);
  const dr = driveId(url);
  if (dr) return driveThumb(dr);
  return null;
}

export function videoEmbed(url: string): string | null {
  const yt = youtubeId(url);
  if (yt) return `${youtubeEmbed(yt)}?autoplay=1`;
  const dr = driveId(url);
  if (dr) return driveEmbed(dr);
  return null;
}

export const isVideoUrl = (url: string) => Boolean(youtubeId(url) || driveId(url));