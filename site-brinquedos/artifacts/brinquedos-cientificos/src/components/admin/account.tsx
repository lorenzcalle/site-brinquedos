import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { Field, Modal, btn, inputCls, useFieldErrors } from "./ui";

const MIN = 8;

function PasswordInput({ value, onChange, id, autoComplete = "new-password", ...aria }: {
  value: string; onChange: (v: string) => void; id?: string; autoComplete?: string;
  "aria-invalid"?: boolean; "aria-describedby"?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} {...aria} type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} className={`${inputCls} pr-12`} />
      <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Esconder senha" : "Mostrar senha"}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-800">
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
PasswordInput.fieldControl = true;

const passwordErrors = (pw: string, again: string, required: boolean) => ({
  password: (required || pw) && pw.length < MIN && `Use pelo menos ${MIN} caracteres.`,
  again: (required || pw) && pw !== again && "As duas senhas não estão iguais.",
});

// Primeiro acesso (ou depois de uma senha provisória): a pessoa cria a própria senha
// antes de usar o painel.
export function FirstPasswordScreen({ user }: { user: User }) {
  const [name, setName] = useState<string>(user.user_metadata?.name ?? "");
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [saving, setSaving] = useState(false);
  const [fail, setFail] = useState("");
  const { errors, check, clear } = useFieldErrors<"name" | "password" | "again">();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFail("");
    if (!check({ name: !name.trim() && "Escreva seu nome.", ...passwordErrors(pw, again, true) })) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw, data: { name: name.trim(), must_change_password: false } });
    setSaving(false);
    if (error) setFail(/different|same/i.test(error.message) ? "A senha nova precisa ser diferente da provisória." : error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <form onSubmit={save} className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-sm p-8 flex flex-col gap-4">
        <div className="mb-2">
          <h1 className="text-2xl font-black">Bem-vindo(a) ao painel!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Você entrou com uma senha provisória. Crie agora a sua senha — só você vai saber.
          </p>
        </div>
        <Field label="Seu nome" required error={errors.name} help="Aparece no histórico de alterações.">
          <input value={name} onChange={e => { setName(e.target.value); clear("name"); }} autoComplete="name" className={inputCls} />
        </Field>
        <Field label="Nova senha" required error={errors.password} help={`Pelo menos ${MIN} caracteres.`}>
          <PasswordInput value={pw} onChange={v => { setPw(v); clear("password"); }} />
        </Field>
        <Field label="Repita a nova senha" required error={errors.again}>
          <PasswordInput value={again} onChange={v => { setAgain(v); clear("again"); }} />
        </Field>
        {fail && <p role="alert" className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2">{fail}</p>}
        <button type="submit" disabled={saving} className={`${btn.primary} py-3 mt-1`}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />} Salvar e entrar no painel
        </button>
        <button type="button" onClick={() => supabase.auth.signOut()} className="text-sm font-bold text-gray-500 hover:text-gray-800 inline-flex items-center justify-center gap-1.5">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </form>
    </div>
  );
}

// "Minha conta": trocar o nome e a senha.
export function AccountModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { toast } = useToast();
  const original = user.user_metadata?.name ?? "";
  const [name, setName] = useState<string>(original);
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [saving, setSaving] = useState(false);
  const { errors, check, clear } = useFieldErrors<"name" | "password" | "again">();

  const save = async () => {
    if (!check({ name: !name.trim() && "Escreva seu nome.", ...passwordErrors(pw, again, false) })) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ ...(pw ? { password: pw } : {}), data: { name: name.trim() } });
    setSaving(false);
    if (error) return void toast({ title: "Não foi possível salvar", description: error.message, variant: "destructive" });
    toast({ title: pw ? "Nome e senha atualizados" : "Nome atualizado" });
    onClose();
  };

  return (
    <Modal title="Minha conta" onClose={onClose} onSave={save} saving={saving} dirty={name !== original || !!pw}>
      <p className="text-sm text-gray-600">Você entra com <strong>{user.email}</strong>.</p>
      <Field label="Seu nome" required error={errors.name} help="Aparece no histórico de alterações e na lista de acesso.">
        <input value={name} onChange={e => { setName(e.target.value); clear("name"); }} autoComplete="name" className={inputCls} />
      </Field>
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-bold text-gray-700">Trocar a senha <span className="font-normal text-gray-500">(deixe em branco para manter)</span></p>
        <Field label="Nova senha" error={errors.password}>
          <PasswordInput value={pw} onChange={v => { setPw(v); clear("password"); }} />
        </Field>
        <Field label="Repita a nova senha" error={errors.again}>
          <PasswordInput value={again} onChange={v => { setAgain(v); clear("again"); }} />
        </Field>
      </div>
    </Modal>
  );
}
