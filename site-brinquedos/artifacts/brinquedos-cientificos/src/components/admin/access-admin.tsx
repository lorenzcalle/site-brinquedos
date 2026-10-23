import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { type AdminUser, fetchAdminUsers, fullDate, timeAgo } from "@/lib/activity";
import { Check, Copy, KeyRound, Loader2, Plus, RefreshCw, Trash2, UserCog, X } from "lucide-react";
import { EmptyState, Field, ItemMenu, Loading, Modal, SectionHeader, btn, inputCls, useConfirm, useFieldErrors } from "./ui";

// Senha provisória fácil de ditar/copiar, sem letras que confundem (l/1, O/0).
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
export function tempPassword() {
  const n = new Uint32Array(12);
  crypto.getRandomValues(n);
  const c = Array.from(n, x => ALPHA[x % ALPHA.length]).join("");
  return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`;
}

type Job = {
  id: number; kind: "create" | "reset_password" | "remove";
  name: string; email: string; password?: string;
  status: "pending" | "done" | "error"; message?: string | null;
};

const shareText = (j: Job) =>
  `Olá, ${j.name || j.email}! Seu acesso ao painel do site Brinquedos Científicos:\n` +
  `Endereço: ${window.location.origin}/admin\nE-mail: ${j.email}\nSenha provisória: ${j.password}\n` +
  `No primeiro acesso o painel pede para você criar a sua própria senha.`;

// Aba "Acesso ao painel": quem pode entrar, adicionar pessoa, nova senha provisória e
// remover acesso. O painel só grava o pedido em account_requests; quem cria/altera a conta
// é o scripts/accounts-worker.mjs no servidor (a chave secreta não vem para o navegador).
export function AccessAdmin({ me, onOpenAccount }: { me: string; onOpenAccount: () => void }) {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [copied, setCopied] = useState(false);

  const [open, setOpen] = useState(false);
  const empty = { name: "", email: "", password: "" };
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const { errors, check, clear, reset } = useFieldErrors<"name" | "email" | "password">();
  const timer = useRef<number | undefined>(undefined);

  const load = async () => {
    setUsers(await fetchAdminUsers());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Acompanha o pedido até o servidor atender (cron a cada minuto).
  useEffect(() => {
    window.clearInterval(timer.current);
    if (job?.status !== "pending") return;
    timer.current = window.setInterval(async () => {
      const { data } = await supabase.from("account_requests").select("status, message").eq("id", job.id).single();
      if (data && data.status !== "pending") {
        setJob(j => j && { ...j, status: data.status, message: data.message });
        load();
      }
    }, 4000);
    return () => window.clearInterval(timer.current);
  }, [job?.id, job?.status]);

  const request = async (j: Omit<Job, "id" | "status">, userId?: string) => {
    const { data, error } = await supabase.from("account_requests").insert([{
      kind: j.kind, email: j.email, name: j.name, temp_password: j.password ?? null, user_id: userId ?? null,
    }]).select("id").single();
    if (error) {
      toast({ title: "Não foi possível fazer o pedido", description: error.message, variant: "destructive" });
      return false;
    }
    setCopied(false);
    setJob({ ...j, id: data.id, status: "pending" });
    return true;
  };

  const openAdd = () => { setForm({ ...empty, password: tempPassword() }); reset(); setOpen(true); };

  const add = async () => {
    const email = form.email.trim().toLowerCase();
    if (!check({
      name: !form.name.trim() && "Escreva o nome da pessoa.",
      email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Escreva um e-mail válido." : users.some(u => u.email.toLowerCase() === email) && "Esse e-mail já tem acesso.",
      password: form.password.length < 8 && "A senha provisória precisa de 8 caracteres ou mais.",
    })) return;
    setSending(true);
    const ok = await request({ kind: "create", name: form.name.trim(), email, password: form.password });
    setSending(false);
    if (ok) setOpen(false);
  };

  const resetPassword = async (u: AdminUser) => {
    if (!(await confirm(`Gerar uma senha provisória para ${u.name || u.email}?`, "A senha atual deixa de funcionar. Você vai receber a nova senha aqui para repassar à pessoa, que cria a própria senha no próximo acesso.", "Gerar senha"))) return;
    request({ kind: "reset_password", name: u.name, email: u.email, password: tempPassword() }, u.id);
  };

  const remove = async (u: AdminUser) => {
    if (!(await confirm(`Remover o acesso de ${u.name || u.email}?`, "A pessoa não consegue mais entrar no painel. O que ela já fez no site continua lá.", "Remover acesso"))) return;
    request({ kind: "remove", name: u.name, email: u.email }, u.id);
  };

  const copy = async () => {
    if (!job) return;
    try {
      await navigator.clipboard.writeText(shareText(job));
      setCopied(true);
    } catch {
      toast({ title: "Não deu para copiar", description: "Selecione o texto e copie com Ctrl+C.", variant: "destructive" });
    }
  };

  const meLower = me.toLowerCase();

  return (
    <>
      <SectionHeader
        title="Acesso ao painel"
        subtitle="Quem pode entrar aqui. Cada pessoa tem o próprio login, e o painel registra quem alterou o quê."
        action={<button onClick={openAdd} className={btn.primary}><Plus className="h-5 w-5" /> Adicionar pessoa</button>}
      />

      {job && (
        <div role="status" className={`mb-6 rounded-2xl border p-5 ${job.status === "error" ? "border-red-200 bg-red-50" : job.status === "done" ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {job.status === "pending" && (
                <p className="font-bold text-orange-900 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />
                  {job.kind === "create" ? `Criando a conta de ${job.name}…` : job.kind === "reset_password" ? `Gerando a senha provisória de ${job.name || job.email}…` : `Removendo o acesso de ${job.name || job.email}…`}
                  <span className="font-normal text-sm">(leva até 1 minuto)</span>
                </p>
              )}
              {job.status === "error" && <p className="font-bold text-red-800">Não deu certo: {job.message}</p>}
              {job.status === "done" && job.kind === "remove" && <p className="font-bold text-green-800 flex items-center gap-2"><Check className="h-5 w-5" /> Acesso de {job.name || job.email} removido.</p>}
              {job.status === "done" && job.kind !== "remove" && <>
                <p className="font-bold text-green-800 flex items-center gap-2"><Check className="h-5 w-5" /> Pronto! Envie estes dados para {job.name || job.email}:</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm bg-white border border-green-200 rounded-xl p-3 font-sans text-gray-800 select-all">{shareText(job)}</pre>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button onClick={copy} className={btn.primary}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado!" : "Copiar mensagem"}</button>
                  <span className="text-xs text-gray-600">Mande por WhatsApp ou e-mail. A senha não fica guardada: depois de fechar este aviso, só gerando outra.</span>
                </div>
              </>}
            </div>
            {job.status !== "pending" && (
              <button onClick={() => setJob(null)} aria-label="Fechar aviso" className="p-1.5 rounded-lg text-gray-500 hover:bg-white/70"><X className="h-5 w-5" /></button>
            )}
          </div>
        </div>
      )}

      {loading ? <Loading /> : users.length === 0 ? (
        <EmptyState>A lista de contas aparece depois que o SQL da Fase C for rodado no Supabase.</EmptyState>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm divide-y divide-gray-100">
          {users.map(u => {
            const self = u.email.toLowerCase() === meLower;
            return (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <span className="h-10 w-10 rounded-full bg-orange-100 text-orange-700 font-black flex items-center justify-center shrink-0" aria-hidden>
                  {(u.name || u.email).charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {u.name || <span className="text-gray-500 font-semibold">Sem nome</span>}
                    {self && <span className="ml-2 text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full align-middle">Você</span>}
                    {u.must_change_password && <span className="ml-2 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full align-middle">Ainda não criou a senha</span>}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                </div>
                <p className="hidden sm:block text-xs text-gray-500 text-right shrink-0" title={u.last_sign_in_at ? fullDate(u.last_sign_in_at) : undefined}>
                  {u.last_sign_in_at ? <>Último acesso<br />{timeAgo(u.last_sign_in_at)}</> : "Nunca entrou"}
                </p>
                <ItemMenu label={`Ações de ${u.name || u.email}`} items={self ? [
                  { label: "Minha conta (nome e senha)", icon: UserCog, onSelect: onOpenAccount },
                ] : [
                  { label: "Gerar senha provisória", icon: KeyRound, onSelect: () => resetPassword(u) },
                  { label: "Remover acesso", icon: Trash2, danger: true, onSelect: () => remove(u) },
                ]} />
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-gray-500 flex items-start gap-1.5">
        <RefreshCw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Alguém esqueceu a senha? Use “Gerar senha provisória” no menu ⋯ da pessoa e repasse a senha nova.
      </p>

      {open && (
        <Modal title="Adicionar pessoa" onClose={() => setOpen(false)} onSave={add} saving={sending} saveLabel="Criar acesso"
          dirty={!!(form.name || form.email)}>
          <p className="text-sm text-gray-600">
            A pessoa vai poder mexer em todo o painel. Depois de criar, você recebe aqui uma mensagem pronta para mandar
            para ela com o endereço e a senha provisória.
          </p>
          <Field label="Nome" required error={errors.name}>
            <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); clear("name"); }} placeholder="Ex: Cristina Paludo Santos" className={inputCls} />
          </Field>
          <Field label="E-mail" required error={errors.email} help="É o que a pessoa vai usar para entrar. Não precisa ser do Google.">
            <input type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); clear("email"); }} placeholder="nome@exemplo.com" className={inputCls} />
          </Field>
          <Field label="Senha provisória" required error={errors.password} help="Já vem uma sugestão. No primeiro acesso a pessoa troca pela dela.">
            <div className="flex gap-2">
              <input value={form.password} aria-label="Senha provisória" onChange={e => { setForm({ ...form, password: e.target.value }); clear("password"); }} className={`${inputCls} font-mono`} />
              <button type="button" onClick={() => setForm({ ...form, password: tempPassword() })} className={btn.secondary} title="Gerar outra">
                <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Outra</span>
              </button>
            </div>
          </Field>
        </Modal>
      )}
      {confirmDialog}
    </>
  );
}
