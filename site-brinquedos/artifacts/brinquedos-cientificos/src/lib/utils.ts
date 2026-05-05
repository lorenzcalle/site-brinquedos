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