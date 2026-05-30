import { Layout } from "@/components/layout";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import emailjs from "@emailjs/browser";

// ─── EmailJS – configure em https://emailjs.com ───────────────────────────────
const EMAILJS_SERVICE_ID  = "service_aetz69c";
const EMAILJS_TEMPLATE_ID = "template_rmd1rhf";
const EMAILJS_PUBLIC_KEY  = "AIP6sUf5Bw20cC5hD";
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  name:    z.string().min(2, "Informe seu nome"),
  email:   z.string().email("E-mail inválido"),
  subject: z.string().min(1),
  message: z.string().min(10, "Mensagem muito curta"),
});

type FormData = z.infer<typeof schema>;

const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "Dúvida Geral" },
  });

  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSendError(false);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    data.name,
          from_email:   data.email,
          subject:      data.subject,
          message:      data.message,
          to_email:     "bc@san.uri.br",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setSent(true);
      reset();
    } catch {
      setSendError(true);
    }
  };

  return (
    <Layout>
      <div className="bg-accent pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-black mb-4">Fale Conosco</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Dúvidas, parcerias ou sugestões? Adoraríamos ouvir você!
          </p>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">

            {/* Informações + Mapa */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/3 space-y-8"
            >
              <h2 className="text-3xl font-black text-foreground">Informações de Contato</h2>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Telefone</h4>
                  <p className="text-muted-foreground">+55 (55) 3313-7900</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">E-mail</h4>
                  <p className="text-muted-foreground">bc@san.uri.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Endereço</h4>
                  <p className="text-muted-foreground">Av. Universidade das Missões, 464 — Universitário<br />Santo Ângelo – RS</p>
                </div>
              </div>

              {/* Mapa */}
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 h-48">
                <iframe
                  title="URI Santo Ângelo"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3554.0!2d-54.2622!3d-28.2996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94fdb8e0e0e0e0e1%3A0x1!2sAv.+Universidade+das+Miss%C3%B5es%2C+464+-+Santo+%C3%82ngelo%2C+RS!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-2/3 bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100"
            >
              <h2 className="text-3xl font-black text-foreground mb-8">Envie uma Mensagem</h2>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                  <h3 className="text-2xl font-black text-foreground">Mensagem enviada!</h3>
                  <p className="text-muted-foreground text-lg">Entraremos em contato em breve.</p>
                  <button onClick={() => setSent(false)} className="mt-4 text-accent font-bold hover:underline">
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-bold text-sm text-gray-700">Nome Completo</label>
                      <input {...register("name")} placeholder="Seu nome" className={inputClass} />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-sm text-gray-700">E-mail</label>
                      <input {...register("email")} placeholder="seu@email.com" className={inputClass} />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Assunto</label>
                    <select {...register("subject")} className={inputClass}>
                      <option>Dúvida Geral</option>
                      <option>Parceria Escolar</option>
                      <option>Suporte com Materiais</option>
                      <option>Inscrição em Evento</option>
                      <option>Outros</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Mensagem</label>
                    <textarea {...register("message")} rows={5} placeholder="Escreva sua mensagem aqui..." className={`${inputClass} resize-none`} />
                    {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
                  </div>

                  {sendError && (
                    <p className="text-red-500 text-sm font-medium">Erro ao enviar. Tente novamente ou escreva diretamente para bc@san.uri.br.</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}