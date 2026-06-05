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