import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertCircle, GripVertical, Loader2, MoreHorizontal, UploadCloud, X } from "lucide-react";
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

// Rótulo ligado ao campo: o primeiro <input>/<textarea>/<select> (ou componente marcado
// com `fieldControl`, como o <TagInput>) recebe o id do rótulo e o estado de erro, então
// clicar no rótulo foca o campo e o leitor de tela lê o nome e o erro.
export function Field({ label, hint, help, required, error, children }: {
  label: string; hint?: string; help?: React.ReactNode; required?: boolean; error?: string; children: React.ReactNode;
}) {
  const id = useId();
  const errId = `${id}-erro`;
  let linked = false;
  const kids = Children.map(children, child => {
    if (linked || !isValidElement<{ id?: string; className?: string }>(child)) return child;
    const t = child.type as string | { fieldControl?: boolean };
    if (typeof t === "string" ? ["input", "textarea", "select"].includes(t) : !!t?.fieldControl) {
      linked = true;
      return cloneElement(child, {
        id: child.props.id ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errId : undefined,
        className: `${child.props.className ?? ""} ${error ? "!border-red-400" : ""}`,
      } as Record<string, unknown>);
    }
    return child;
  });
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5" aria-hidden>*</span>}
        {hint && <span className="font-normal text-gray-500"> ({hint})</span>}
      </label>
      {kids}
      {error && (
        <p id={errId} data-field-error className="mt-1.5 text-sm font-semibold text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {help && <p className="mt-1.5 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

// Erros de validação mostrados embaixo de cada campo (no lugar de um aviso no canto).
//   const { errors, check, clear } = useFieldErrors<"title" | "date">();
//   if (!check({ title: !form.title.trim() && "Escreva o título" })) return;
// `check` guarda os erros, rola até o primeiro e põe o cursor nele; devolve true se não há erro.
export function useFieldErrors<K extends string>() {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  const check = (found: Partial<Record<K, string | false | null | undefined>>) => {
    const real = Object.fromEntries(Object.entries(found).filter(([, v]) => v)) as Partial<Record<K, string>>;
    setErrors(real);
    if (!Object.keys(real).length) return true;
    setTimeout(() => {
      const first = document.querySelector<HTMLElement>("[data-field-error]");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus({ preventScroll: true });
    }, 60);
    return false;
  };
  const clear = (k: K) => setErrors(e => {
    if (!e[k]) return e;
    const n = { ...e };
    delete n[k];
    return n;
  });
  return { errors, check, clear, reset: () => setErrors({}) };
}

// Área que aceita arquivo por clique ou arrastando do computador.
const accepts = (accept: string | undefined, f: File) =>
  !accept || accept.split(",").some(a => {
    a = a.trim();
    return a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : a.startsWith(".") ? f.name.toLowerCase().endsWith(a) : f.type === a;
  });

export function DropZone({ onFiles, accept, multiple, disabled, className = "", label, children }: {
  onFiles: (files: File[]) => void; accept?: string; multiple?: boolean; disabled?: boolean; className?: string; label: string; children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const isFiles = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");
  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter(f => accepts(accept, f));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <>
      <button type="button" aria-label={label} title={label} disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={e => { if (!isFiles(e) || disabled) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { if (!isFiles(e) || disabled) return; e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
        className={`${className} transition-colors ${focusRing} ${over ? "!border-orange-500 !bg-orange-50 ring-4 ring-orange-100" : ""}`}>
        {children}
      </button>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={e => { take(e.target.files); e.target.value = ""; }} />
    </>
  );
}

// Texto padrão dentro de uma <DropZone> vazia.
export function DropHint({ icon: Icon = UploadCloud, text, sub }: { icon?: typeof X; text: string; sub?: string }) {
  return (
    <span className="flex flex-col items-center text-center gap-1 px-3 text-gray-500">
      <Icon className="h-6 w-6" />
      <span className="text-sm font-bold">{text}</span>
      <span className="text-xs">{sub ?? "ou arraste o arquivo para cá"}</span>
    </span>
  );
}

// Lista de etiquetas (conceitos, materiais): Enter ou vírgula cria; × remove.
export function TagInput({ value, onChange, placeholder, id, className = "", ...aria }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string; id?: string; className?: string;
  "aria-invalid"?: boolean; "aria-describedby"?: string;
}) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const novos = raw.split(/,|\n/).map(t => t.trim()).filter(t => t && !value.some(v => v.toLowerCase() === t.toLowerCase()));
    if (novos.length) onChange([...value, ...novos]);
    setText("");
  };
  return (
    <div className={`${inputCls} ${className} !px-2 !py-1.5 flex flex-wrap items-center gap-1.5 focus-within:border-orange-500 cursor-text`}
      onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}>
      {value.map((t, i) => (
        <span key={t} className="inline-flex items-center gap-1 bg-orange-50 text-orange-800 border border-orange-200 text-sm font-semibold pl-2.5 pr-1 py-0.5 rounded-lg">
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remover ${t}`} className="p-0.5 rounded hover:bg-orange-100"><X className="h-3.5 w-3.5" /></button>
        </span>
      ))}
      <input id={id} {...aria} value={text} placeholder={value.length ? "" : placeholder}
        onChange={e => e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") { e.preventDefault(); add(text); }
          else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => text.trim() && add(text)}
        className="flex-1 min-w-[8rem] py-1 px-1 outline-none bg-transparent placeholder:text-gray-400" />
    </div>
  );
}
TagInput.fieldControl = true;

// Reordenar arrastando (no computador). No celular continuam as setas/menu.
//   const sort = useDragSort((from, to) => setList(l => moveItem(l, from, to)));
//   <div {...sort.item(i)}> … <span {...sort.handle(i)} /> (ou o item todo com sort.whole(i))
export const moveItem = <T,>(list: T[], from: number, to: number): T[] => {
  const c = [...list];
  const [x] = c.splice(from, 1);
  c.splice(to, 0, x);
  return c;
};

export function useDragSort(onMove: (from: number, to: number) => void) {
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const end = () => { setFrom(null); setOver(null); };
  const start = (i: number, e: React.DragEvent, el?: Element | null) => {
    setFrom(i);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i));
    if (el) e.dataTransfer.setDragImage(el, 20, 20);
  };
  const item = (i: number) => ({
    onDragOver: (e: React.DragEvent) => { if (from === null) return; e.preventDefault(); if (over !== i) setOver(i); },
    onDrop: (e: React.DragEvent) => { if (from === null) return; e.preventDefault(); if (from !== i) onMove(from, i); end(); },
    "data-drag-over": over === i && from !== i ? "" : undefined,
    className: `${from === i ? "opacity-40" : ""} ${over === i && from !== null && from !== i ? "ring-2 ring-orange-400 ring-offset-2" : ""}`,
  });
  const handle = (i: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => start(i, e, (e.currentTarget as Element).closest("[data-sort-item]")),
    onDragEnd: end,
  });
  const whole = (i: number) => ({ ...item(i), draggable: true, onDragStart: (e: React.DragEvent) => start(i, e), onDragEnd: end });
  return { item, handle, whole };
}

export function DragHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} title="Arraste para mudar a ordem" aria-hidden
      className="hidden sm:flex cursor-grab active:cursor-grabbing p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0">
      <GripVertical className="h-4 w-4" />
    </span>
  );
}

// Janela de edição. Fecha com Esc, clique fora, X ou Cancelar — e, se houver mudança
// não salva (`dirty`), pergunta antes de descartar. Enquanto `busy` (upload), não fecha.
export function Modal({ title, onClose, onSave, saving, busy, dirty, saveLabel = "Salvar", wide, toolbar, children }: {
  title: string;
  toolbar?: React.ReactNode; // fica fixo abaixo do título (ex.: abas)
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
          className={`fixed z-50 inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} ${toolbar ? "sm:h-[88vh]" : ""} sm:max-h-[90vh] flex flex-col bg-white sm:rounded-2xl shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:data-[state=open]:zoom-in-95`}
        >
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <DialogPrimitive.Title className="text-xl font-black">{title}</DialogPrimitive.Title>
            <button type="button" onClick={requestClose} aria-label="Fechar" className={`p-2 -mr-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 ${focusRing}`}>
              <X className="h-5 w-5" />
            </button>
          </div>
          {toolbar && <div className="px-6 pt-3 border-b border-gray-100">{toolbar}</div>}
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

// Abas em forma de pílula (Envios, Textos do site, abas do evento).
export function PillTabs<K extends string | number>({ value, onChange, items, label, className = "mb-6" }: {
  value: K; onChange: (k: K) => void; items: { key: K; label: string; count?: number; alert?: boolean }[]; label: string; className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={`inline-flex flex-wrap gap-1 p-1 rounded-xl bg-gray-100 ${className}`}>
      {items.map(it => {
        const active = it.key === value;
        return (
          <button key={String(it.key)} role="tab" aria-selected={active} onClick={() => onChange(it.key)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${focusRing} ${active ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {it.label}{it.count !== undefined && <span className="ml-1.5 text-xs text-gray-500">{it.count}</span>}
            {it.alert && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-red-500 align-middle" aria-label="tem erro" />}
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
