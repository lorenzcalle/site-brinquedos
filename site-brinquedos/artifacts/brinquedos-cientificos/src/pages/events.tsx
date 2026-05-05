import { Layout } from "@/components/layout";
import { upcomingEvents, pastEvents } from "@/lib/data";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function Events() {
  return (
    <Layout>
      <div className="bg-secondary pt-20 pb-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black mb-4">Eventos e Oficinas</h1>
          <p className="text-xl font-medium text-white/90 max-w-2xl mx-auto">
            Participe dos nossos encontros presenciais e online.
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-black text-foreground mb-10 border-b-4 border-secondary pb-2 inline-block">Próximos Eventos</h2>
          
          <div className="space-y-6">
            {upcomingEvents.map((ev, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-orange-50 border-l-8 border-secondary rounded-r-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{ev.title}</h3>
                  <div className="flex flex-wrap gap-6 text-orange-900 font-medium">
                    <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-secondary" /> {ev.date}</div>
                    <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-secondary" /> {ev.time}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-secondary" /> {ev.location}</div>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors shrink-0">
                  Inscrever-se
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-black text-foreground mb-10 border-b-4 border-gray-300 pb-2 inline-block">Eventos Passados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pastEvents.map((ev, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row">
                <div className="sm:w-1/3 h-48 sm:h-auto">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                </div>
                <div className="p-6 sm:w-2/3">
                  <div className="text-sm font-bold text-gray-500 mb-2">{ev.date}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{ev.title}</h3>
                  <p className="text-muted-foreground">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}