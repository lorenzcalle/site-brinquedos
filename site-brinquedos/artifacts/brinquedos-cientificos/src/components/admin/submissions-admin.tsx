import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, FileText, Check, X, RotateCcw } from "lucide-react";
import { EmptyState, ItemMenu, Loading, PillTabs, SectionHeader, btn, useConfirm } from "./ui";
import { removeToyFiles, toArray } from "@/lib/toys";

type Submission = {
  id: string;
  title: string;
  description: string;
  concepts: string | string[];
  materials: string | string[];
  concepts_description?: string | null;
  author_name: string;
  author_email: string;
  image_url: string;
  guide_url?: string | null;
  status: string;
};

// Envios do formulário /submit. Aprovar copia o envio para `toys` (vira brinquedo
// publicado); rejeitar só muda o status e dá para restaurar depois.
export function SubmissionsAdmin({ onChange }: { onChange: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [view, setView] = useState<"pending" | "rejected">("pending");
  const [pending, setPending] = useState<Submission[]>([]);
  const [rejected, setRejected] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("submissions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").eq("status", "rejected").order("created_at", { ascending: false }),
    ]);
    setPending((p.data as Submission[]) ?? []);
    setRejected((r.data as Submission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changed = () => { load(); onChange(); };

  const approve = async (item: Submission) => {
    setBusyId(item.id);
    const { error: insertErr } = await supabase.from("toys").insert([{
      title: item.title,
      description: item.description,
      image: item.image_url,
      concepts: toArray(item.concepts),
      concepts_description: item.concepts_description ?? null,
      materials: toArray(item.materials),
      guide_url: item.guide_url ?? null,
      status: "approved",
    }]);
    if (insertErr) {
      setBusyId(null);
      toast({ title: "Erro ao publicar", description: insertErr.message, variant: "destructive" });
      return;
    }
    const { error: updErr } = await supabase.from("submissions").update({ status: "approved" }).eq("id", item.id);
    setBusyId(null);
    if (updErr) {
      toast({ title: "Publicado, mas houve um aviso", description: "O brinquedo foi publicado, mas a submissão não foi marcada como aprovada.", variant: "destructive" });
    } else {
      toast({ title: "Brinquedo publicado! 🎉", description: `${item.title} — já aparece em Brinquedos e no site.` });
    }
    changed();
  };

  const setStatus = async (item: Submission, status: "rejected" | "pending") => {
    setBusyId(item.id);
    const { error } = await supabase.from("submissions").update({ status }).eq("id", item.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "rejected" ? "Submissão rejeitada" : "Restaurada para pendentes", description: item.title });
    changed();
  };

  const deleteSubmission = async (item: Submission) => {
    if (!(await confirm(`Excluir "${item.title}" de vez?`, "A imagem e o PDF enviados também são apagados. Isso não pode ser desfeito."))) return;
    setBusyId(item.id);
    await removeToyFiles(item.image_url, item.guide_url);
    const { error } = await supabase.from("submissions").delete().eq("id", item.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Submissão excluída", description: item.title });
    changed();
  };

  const list = view === "pending" ? pending : rejected;

  return (
    <>
      <SectionHeader
        title="Submissões"
        subtitle="Brinquedos enviados pela comunidade no formulário “Enviar brinquedo”. Aprovar publica no site."
      />
      <PillTabs<"pending" | "rejected"> label="Situação das submissões" value={view} onChange={setView} items={[
        { key: "pending", label: "Aguardando revisão", count: pending.length },
        { key: "rejected", label: "Rejeitadas", count: rejected.length },
      ]} />

      {loading ? <Loading /> : list.length === 0 ? (
        <EmptyState>
          {view === "pending" ? "Nenhuma submissão aguardando revisão. 🎉" : "Nenhuma submissão rejeitada."}
        </EmptyState>
      ) : view === "pending" ? pending.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6 mb-4">
          <a href={item.image_url} target="_blank" rel="noopener noreferrer">
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-xl mb-4 hover:opacity-90 transition-opacity" />
          </a>
          <h3 className="text-xl font-bold mb-1">{item.title}</h3>
          <p className="text-gray-600 mb-2">{item.description}</p>
          <p className="text-sm text-orange-600 font-medium mb-1">Conceitos: {toArray(item.concepts).join(", ")}</p>
          <p className="text-sm text-gray-500 font-medium mb-1">Materiais: {toArray(item.materials).join(", ")}</p>
          <p className="text-sm text-gray-500 mb-3">Enviado por {item.author_name} ({item.author_email})</p>
          {item.guide_url && (
            <a href={item.guide_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline mb-4">
              <FileText className="h-4 w-4" /> Ver guia (PDF)
            </a>
          )}
          <div className="flex gap-3 mt-2">
            <button onClick={() => approve(item)} disabled={busyId === item.id}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Aprovar e publicar
            </button>
            <button onClick={() => setStatus(item, "rejected")} disabled={busyId === item.id}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 disabled:opacity-60 text-red-700 font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
              <X className="h-4 w-4" /> Rejeitar
            </button>
          </div>
        </div>
      )) : rejected.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3 sm:p-4 mb-3 flex gap-4 items-center">
          <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0 grayscale" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate">{item.title}</h3>
            <p className="text-sm text-gray-500 truncate">Por {item.author_name}</p>
          </div>
          <button onClick={() => setStatus(item, "pending")} disabled={busyId === item.id}
            className={`${btn.subtle} shrink-0`}>
            {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Restaurar
          </button>
          <ItemMenu items={[{ label: "Excluir de vez", icon: Trash2, danger: true, onSelect: () => deleteSubmission(item) }]} />
        </div>
      ))}
      {confirmDialog}
    </>
  );
}
