import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, MoreHorizontal, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Peças comuns às seções do /admin. Tudo o que é visual e se repete fica aqui, para
// as seções terem a mesma cara (botões, cards, janelas, menus).

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

export const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-orange-500 outline-none transition-colors placeholder:text-gray-400";

export const btn = {
  primary: `inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-colors ${focusRing}`,
  secondary: `inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60 text-gray-700 font-bold px-4 py-2 rounded-xl transition-colors ${focusRing}`,
  subtle: `inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-bold text-sm px-3 py-2 rounded-lg transition-colors ${focusRing}`,
  link: `inline-flex items-center gap-1.5 font-bold text-orange-600 hover:text-orange-700 hover:underline rounded ${focusRing}`,
};

// Card de lista: o card inteiro abre a edição (o <OpenButton> se estica sobre ele), e
// os outros botões do card ficam por cima com `relative z-10`.
export const cardCls = "relative bg-white rounded-2xl border border-gray-200/80 shadow-sm transition hover:border-orange-300 hover:shadow-md focus-within:ring-2 focus-within:ring-orange-500/40";

export function OpenButton({ onClick, label, className = "", children }: { onClick: () => void; label: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className={`text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none ${className}`}>
      {children}
    </button>
  );
}

// Rótulo ligado ao campo: o primeiro <input>/<textarea>/<select> recebe o id do rótulo,
// então clicar no rótulo foca o campo e o leitor de tela lê o nome certo.
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  let linked = false;
  const kids = Children.map(children, child => {
    if (!linked && isValidElement<{ id?: string }>(child) && typeof child.type === "string" && ["input", "textarea", "select"].includes(child.type)) {
      linked = true;
      return child.props.id ? child : cloneElement(child, { id });
    }
    return child;
  });
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">
        {label} {hint && <span className="font-normal text-gray-500">({hint})</span>}
      </label>
      {kids}
    </div>
  );
}

// Janela de edição. Fecha com Esc, clique fora, X ou Cancelar — e, se houver mudança
// não salva (`dirty`), pergunta antes de descartar. Enquanto `busy` (upload), não fecha.
export function Modal({ title, onClose, onSave, saving, busy, dirty, saveLabel = "Salvar", wide, children }: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  busy?: boolean;
  dirty?: boolean;
  saveLabel?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const [confirm, confirmDialog] = useConfirm();

  // Fechar a aba/recarregar com mudança não salva: o navegador pergunta.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const requestClose = async () => {
    if (busy || saving) return;
    if (dirty && !(await confirm("Descartar as mudanças?", "O que você alterou nesta janela ainda não foi salvo.", "Descartar"))) return;
    onClose();
  };

  return (
    <DialogPrimitive.Root open onOpenChange={open => { if (!open) requestClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={`fixed z-50 inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} sm:max-h-[90vh] flex flex-col bg-white sm:rounded-2xl shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:data-[state=open]:zoom-in-95`}
        >
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <DialogPrimitive.Title className="text-xl font-black">{title}</DialogPrimitive.Title>
            <button type="button" onClick={requestClose} aria-label="Fechar" className={`p-2 -mr-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 ${focusRing}`}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-4 [&_fieldset]:min-w-0">{children}</div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 sm:rounded-b-2xl">
            {busy && <span className="mr-auto text-sm text-orange-600 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Enviando arquivo…</span>}
            <button type="button" onClick={requestClose} disabled={busy || saving} className={btn.secondary}>Cancelar</button>
            <button type="button" onClick={onSave} disabled={saving || busy} className={btn.primary}>
              {saving && <Loader2 className="h-5 w-5 animate-spin" />} {saveLabel}
            </button>
          </div>
          {confirmDialog}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SubHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xs font-black uppercase tracking-wider text-gray-500 mb-3 ${className}`}>{children}</h2>;
}

export function Loading() {
  return <div className="flex justify-center py-20" role="status" aria-label="Carregando"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 text-center py-12 px-4">{children}</div>;
}

// Abas em forma de pílula (Submissões, Textos do site).
export function PillTabs<K extends string | number>({ value, onChange, items, label }: {
  value: K; onChange: (k: K) => void; items: { key: K; label: string; count?: number }[]; label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap gap-1 p-1 mb-6 rounded-xl bg-gray-100">
      {items.map(it => {
        const active = it.key === value;
        return (
          <button key={String(it.key)} role="tab" aria-selected={active} onClick={() => onChange(it.key)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${focusRing} ${active ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {it.label}{it.count !== undefined && <span className="ml-1.5 text-xs text-gray-500">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Menu "⋯" de um item da lista. Fica por cima do card clicável e não deixa o clique
// (nem o dos itens, que o React propaga pelo portal) chegar ao card.
export type MenuItem = { label: string; icon?: typeof X; onSelect: () => void; danger?: boolean; hidden?: boolean };

export function ItemMenu({ items, label = "Mais ações" }: { items: MenuItem[]; label?: string }) {
  const shown = items.filter(i => !i.hidden);
  const normal = shown.filter(i => !i.danger);
  const danger = shown.filter(i => i.danger);
  const item = (i: MenuItem) => (
    <DropdownMenuItem key={i.label} onSelect={i.onSelect}
      className={`cursor-pointer py-2 font-semibold ${i.danger ? "text-red-600 focus:text-red-700 focus:bg-red-50" : ""}`}>
      {i.icon && <i.icon />} {i.label}
    </DropdownMenuItem>
  );
  return (
    <div className="relative z-10 shrink-0" onClick={e => e.stopPropagation()}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger aria-label={label} title={label}
          className={`p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 data-[state=open]:bg-gray-100 transition-colors ${focusRing}`}>
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem] rounded-xl p-1.5">
          {normal.map(item)}
          {normal.length > 0 && danger.length > 0 && <DropdownMenuSeparator />}
          {danger.map(item)}
        </DropdownMenuContent>
      </DropdownMenu>
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
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          {state?.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => done(false)} className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => done(true)} className="rounded-xl bg-red-600 hover:bg-red-700">{state?.action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return [confirm, dialog];
}
