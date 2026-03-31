import { Layout } from "@/components/layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <Layout>
      <div className="bg-accent pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Fale Conosco</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Dúvidas, parcerias ou sugestões? Adoraríamos ouvir você!
          </p>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/3 space-y-8"
            >
              <h2 className="text-3xl font-black text-foreground mb-8">Informações de Contato</h2>
              
              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Telefone / WhatsApp</h4>
                  <p className="text-muted-foreground">+55 (11) 98765-4321</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">E-mail</h4>
                  <p className="text-muted-foreground">contato@brinquedoscientificos.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Endereço</h4>
                  <p className="text-muted-foreground">Rua da Ciência, 123 - Vila Inovação<br/>São Paulo - SP</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-2/3 bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100"
            >
              <h2 className="text-3xl font-black text-foreground mb-8">Envie uma Mensagem</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Nome Completo</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">E-mail</label>
                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" placeholder="seu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-gray-700">Assunto</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all">
                    <option>Dúvida Geral</option>
                    <option>Parceria Escolar</option>
                    <option>Suporte com Materiais</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-sm text-gray-700">Mensagem</label>
                  <textarea rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" placeholder="Escreva sua mensagem aqui..."></textarea>
                </div>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2">
                  <Send className="h-5 w-5" /> Enviar Mensagem
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}