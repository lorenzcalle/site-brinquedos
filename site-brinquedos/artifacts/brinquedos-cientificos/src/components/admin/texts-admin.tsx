import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SITE_TEXT_PAGES, type SiteTextDef, loadSiteTexts } from "@/lib/site-texts";
import { fitToJpeg } from "@/lib/image";
import { removeSiteMedia, uploadSiteMedia } from "@/lib/media";
import { Loader2, ExternalLink, RotateCcw, ImagePlus } from "lucide-react";
import { DropHint, DropZone, Loading, PillTabs, SectionHeader, btn, inputCls, useConfirm } from "./ui";

// Textos das páginas (tabela site_texts). Cada página do site é uma aba; os campos vêm
// do catálogo em src/lib/site-texts.tsx, com o texto original como padrão.
export function TextsAdmin() {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [pageIdx, setPageIdx] = useState(0);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const uploadedNow = useRef<string[]>([]);

  const load = async () => {
    const { data, error } = await supabase.from("site_texts").select("key, value");
    if (error) toast({ title: "Erro ao carregar textos", description: error.message, variant: "destructive" });
    const v = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
    setSaved(v);
    setDraft(v);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const page = SITE_TEXT_PAGES[pageIdx];
  const value = (d: SiteTextDef) => draft[d.key] ?? d.default;
  const isDirty = (d: SiteTextDef) => value(d) !== (saved[d.key] ?? d.default);
  const dirtyKeys = SITE_TEXT_PAGES.flatMap(p => p.texts).filter(isDirty);
  const set = (key: string, v: string) => setDraft(prev => ({ ...prev, [key]: v }));

  // Sair da aba (ou do site) com mudança não salva: pergunta antes.
  const switchPage = async (i: number) => {
    if (i === pageIdx) return;
    if (dirtyKeys.some(d => page.texts.includes(d))) {
      if (!(await confirm("Descartar as mudanças desta página?", "Você alterou textos que ainda não foram salvos.", "Descartar"))) return;
      await discard();
    }
    setPageIdx(i);
  };

  useEffect(() => {
    if (!dirtyKeys.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyKeys.length]);

  const uploadImage = async (key: string, file: File | undefined) => {
    if (!file) return;
    setUploading(key);
    try {
      const url = await uploadSiteMedia("textos", await fitToJpeg(file, 2400));
      uploadedNow.current.push(url);
      set(key, url);
    } catch (e) {
      toast({ title: "Não foi possível enviar a imagem", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const discard = async () => {
    await removeSiteMedia(uploadedNow.current.filter(u => !Object.values(saved).includes(u)));
    uploadedNow.current = [];
    setDraft(saved);
  };

  const save = async () => {
    const changed = page.texts.filter(isDirty);
    if (!changed.length) return;
    setSaving(true);
    // Igual ao original → apaga a linha (a página volta a usar o padrão do código).
    const toDelete = changed.filter(d => value(d) === d.default).map(d => d.key);
    const toUpsert = changed.filter(d => value(d) !== d.default).map(d => ({ key: d.key, value: value(d), updated_at: new Date().toISOString() }));
    const [del, up] = await Promise.all([
      toDelete.length ? supabase.from("site_texts").delete().in("key", toDelete) : Promise.resolve({ error: null }),
      toUpsert.length ? supabase.from("site_texts").upsert(toUpsert) : Promise.resolve({ error: null }),
    ]);
    setSaving(false);
    const error = del.error ?? up.error;
    if (error) return void toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    // Imagens substituídas saem do storage.
    const replaced = changed.filter(d => d.kind === "image").map(d => saved[d.key]);
    const unusedUploads = uploadedNow.current.filter(u => !changed.some(d => value(d) === u));
    await removeSiteMedia([...replaced, ...unusedUploads]);
    uploadedNow.current = [];
    toast({ title: "Textos salvos", description: `${changed.length} campo(s) em ${page.page}. Já aparecem no site.` });
    loadSiteTexts(true);
    load();
    window.dispatchEvent(new Event("admin:changed"));
  };

  if (loading) return <Loading />;

  const pageDirty = page.texts.filter(isDirty).length;

  return (
    <>
      <SectionHeader
        title="Textos do site"
        subtitle="Os textos fixos de cada página. “Restaurar original” volta ao texto de quando o site foi feito."
        action={
          <a href={page.path} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
            <ExternalLink className="h-4 w-4" /> Ver {page.page}
          </a>
        }
      />
      <PillTabs<number> label="Páginas do site" value={pageIdx} onChange={switchPage}
        items={SITE_TEXT_PAGES.map((p, i) => ({ key: i, label: p.page }))} />

      <div className="space-y-5">
        {page.texts.map(d => {
          const v = value(d);
          const custom = v !== d.default;
          return (
            <div key={d.key} className={`bg-white rounded-2xl border shadow-sm p-5 ${isDirty(d) ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200/80"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label htmlFor={`txt-${d.key}`} className="text-sm font-bold text-gray-700">
                  {d.label}
                  {isDirty(d) && <span className="ml-2 text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">não salvo</span>}
                </label>
                {custom && (
                  <button onClick={() => set(d.key, d.default)} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 rounded px-1">
                    <RotateCcw className="h-3.5 w-3.5" /> Restaurar original
                  </button>
                )}
              </div>
              {d.kind === "image" ? (
                <div className="flex flex-wrap items-center gap-4">
                  <img src={v} alt="" className="max-h-32 rounded-lg border" />
                  <DropZone label="Trocar imagem" accept="image/*" disabled={!!uploading} onFiles={f => uploadImage(d.key, f[0])}
                    className="rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 px-5 py-4">
                    {uploading === d.key ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" /> : <DropHint icon={ImagePlus} text="Trocar imagem" sub="clique ou arraste a nova" />}
                  </DropZone>
                </div>
              ) : d.kind === "text" ? (
                <textarea id={`txt-${d.key}`} value={v} onChange={e => set(d.key, e.target.value)} rows={Math.min(10, Math.max(3, Math.ceil(v.length / 90) + v.split("\n").length))} className={`${inputCls} resize-y`} />
              ) : (
                <input id={`txt-${d.key}`} value={v} onChange={e => set(d.key, e.target.value)} className={inputCls} />
              )}
              {d.help && <p className="text-xs text-gray-500 mt-1.5">{d.help}</p>}
            </div>
          );
        })}
      </div>

      {/* Barra de salvar fixa enquanto houver mudança */}
      {pageDirty > 0 && (
        <div className="sticky bottom-4 mt-6 bg-white border border-orange-200 shadow-xl rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="flex-1 text-sm font-bold text-gray-700">{pageDirty} campo(s) alterado(s) ainda não salvo(s)</span>
          <button onClick={discard} disabled={saving} className={btn.secondary}>Descartar</button>
          <button onClick={save} disabled={saving || !!uploading} className={btn.primary}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </button>
        </div>
      )}
      {confirmDialog}
    </>
  );
}
