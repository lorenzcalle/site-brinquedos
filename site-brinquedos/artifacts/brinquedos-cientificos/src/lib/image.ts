// Redimensiona imagens no navegador antes do upload (não há ferramenta de imagem no
// servidor, e foto de celular chega com 4–8 MB).

// Recorta no centro para a proporção w:h e reduz para w×h, em JPEG.
export async function cropToJpeg(file: File, w: number, h: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.max(w / bmp.width, h / bmp.height);
  const sw = w / scale, sh = h / scale;
  return draw(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, w, h);
}

// Mantém a proporção e só reduz (o lado maior fica com no máximo `max` px).
export async function fitToJpeg(file: File, max: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  return draw(bmp, 0, 0, bmp.width, bmp.height, w, h);
}

function draw(bmp: ImageBitmap, sx: number, sy: number, sw: number, sh: number, w: number, h: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // PNG com transparência não fica preto no JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Falha ao converter a imagem"))), "image/jpeg", 0.85),
  );
}

export const uniqueName = (ext: string) => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
