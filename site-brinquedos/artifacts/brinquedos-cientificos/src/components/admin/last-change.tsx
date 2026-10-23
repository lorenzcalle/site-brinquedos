import { History } from "lucide-react";
import { actorLabel, fullDate, timeAgo, useLastChange } from "@/lib/activity";

// "Alterado por Cristina há 2 dias" no rodapé das janelas de edição.
export function LastChange({ entity, id }: { entity: string; id: string | null | undefined }) {
  const last = useLastChange(entity, id);
  if (!last) return null;
  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500" title={fullDate(last.at)}>
      <History className="h-3.5 w-3.5" /> {last.action === "criou" ? "Criado" : "Alterado"} por {actorLabel(last)} {timeAgo(last.at)}
    </span>
  );
}
