import { useRef, useState } from "react";
import { X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Peças comuns às seções do /admin.

export const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} {hint && <span className="font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export function Modal({ title, onClose, wide, children, footer }: {
  title: string; onClose: () => void; wide?: boolean; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto p-6`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" title="Fechar"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex gap-3 mt-6">{footer}</div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Substitui o confirm() do navegador por um diálogo do próprio site:
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm("Excluir?", "Não dá para desfazer."))) return;
//   ... e renderizar {confirmDialog} no componente.
export function useConfirm(): [(title: string, description?: string, action?: string) => Promise<boolean>, React.ReactNode] {
  const [state, setState] = useState<{ title: string; description?: string; action: string } | null>(null);
  const resolver = useRef<(ok: boolean) => void>(() => {});
  const confirm = (title: string, description?: string, action = "Excluir") =>
    new Promise<boolean>(resolve => {
      resolver.current = resolve;
      setState({ title, description, action });
    });
  const done = (ok: boolean) => {
    resolver.current(ok);
    setState(null);
  };
  const dialog = (
    <AlertDialog open={!!state} onOpenChange={open => !open && done(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          {state?.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => done(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => done(true)} className="bg-red-600 hover:bg-red-700">{state?.action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return [confirm, dialog];
}
