import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, CalendarX } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  image_url?: string;
  type: "upcoming" | "past";
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateStr));
}

export default function Events() {
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [past, setPast] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, title, date, time, location, description, image_url, type")
      .order("date", { ascending: false })
      .then(({ data }) => {
        const all = (data ?? []) as Event[];
        setUpcoming(all.filter(e => e.type === "upcoming"));
        setPast(all.filter(e => e.type === "past"));
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="bg-secondary pt-20 pb-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-black mb-4">Eventos e Oficinas</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Participe dos nossos encontros presenciais e online.
          </p>
        </div>
      </div>

      {/* Próximos Eventos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-black text-foreground mb-10 border-b-4 border-secondary pb-2 inline-block">Próximos Eventos</h2>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-orange-50 rounded-r-2xl p-8 animate-pulse h-28" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarX className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl font-bold">Nenhum evento agendado no momento.</p>
              <p className="mt-2">Fique de olho — em breve novas datas!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-orange-50 border-l-8 border-secondary rounded-r-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-stretch gap-0"
                >
                  {ev.image_url && (
                    <div className="md:w-48 h-48 md:h-auto shrink-0">
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 flex-1">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-4">{ev.title}</h3>
                      <div className="flex flex-wrap gap-6 text-orange-900 font-medium">
                        <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-secondary" /> {formatDate(ev.date)}</div>
                        {ev.time && <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-secondary" /> {ev.time}</div>}
                        {ev.location && <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-secondary" /> {ev.location}</div>}
                      </div>
                    </div>
                    <Link href="/contato" className="w-full md:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors shrink-0 text-center">
                      Inscrever-se
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Eventos Passados */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-black text-foreground mb-10 border-b-4 border-gray-300 pb-2 inline-block">Eventos Passados</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : past.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarX className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl font-bold">Nenhum evento passado registrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {past.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row"
                >
                  {ev.image_url && (
                    <div className="sm:w-1/3 h-48 sm:h-auto shrink-0">
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm font-bold text-gray-500 mb-2">{formatDate(ev.date)}</div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{ev.title}</h3>
                    {ev.description && <p className="text-muted-foreground">{ev.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}