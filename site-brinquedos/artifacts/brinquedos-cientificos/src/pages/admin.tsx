import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout";
import { Trash2 } from "lucide-react";

export default function Admin() {
  const [items, setItems] = useState<any[]>([]);
  const [toys, setToys] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"pending" | "approved">("pending");

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const loadPending = () => {
    supabase.from("submissions").select("*").eq("status", "pending").then(({ data }) => setItems(data ?? []));
  };

  const loadToys = () => {
    supabase.from("toys").select("*").eq("status", "approved").then(({ data }) => setToys(data ?? []));
  };

  useEffect(() => {
    if (!authed) return;
    loadPending();
    loadToys();
  }, [authed]);

  const approve = async (item: any) => {
    const { error } = await supabase.from("toys").insert([{
      title: item.title,
      description: item.description,
      image: item.image_url,
      concepts: item.concepts.split(/,|\n/).map((c: string) => c.trim()).filter(Boolean),
      concepts_description: item.concepts_description ?? null,
      materials: item.materials ? item.materials.split(",").map((m: string) => m.trim()) : [],
      guide_url: item.guide_url ?? null,
      status: "approved",
    }]);

    if (error) { alert("Erro: " + error.message); return; }

    await supabase.from("submissions").update({ status: "approved" }).eq("id", item.id);
    setItems(items.filter(i => i.id !== item.id));
    loadToys();
  };

  const reject = async (id: string) => {
    await supabase.from("submissions").update({ status: "rejected" }).eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  const deleteToy = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este brinquedo?")) return;
    await supabase.from("toys").delete().eq("id", id);
    setToys(toys.filter(t => t.id !== id));
  };

  if (!authed) return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black">Área Admin</h1>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setAuthed(password === ADMIN_PASSWORD)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 outline-none w-64"
        />
        <button
          onClick={() => setAuthed(password === ADMIN_PASSWORD)}
          className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Entrar
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-black mb-8">Painel Admin</h1>

        {/* Abas */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("pending")}
            className={`px-6 py-2 rounded-xl font-bold transition-colors ${tab === "pending" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Pendentes ({items.length})
          </button>
          <button
            onClick={() => setTab("approved")}
            className={`px-6 py-2 rounded-xl font-bold transition-colors ${tab === "approved" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Publicados ({toys.length})
          </button>
        </div>

        {/* Pendentes */}
        {tab === "pending" && (
          <>
            {items.length === 0 && (
              <p className="text-gray-500 text-center py-20">Nenhuma submissão pendente. 🎉</p>
            )}
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                <h2 className="text-xl font-bold mb-1">{item.title}</h2>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <p className="text-sm text-orange-600 font-medium mb-1">Conceitos: {item.concepts}</p>
                <p className="text-sm text-gray-500 font-medium mb-1">Materiais: {item.materials}</p>
                <p className="text-sm text-gray-400 mb-4">Por {item.author_name} ({item.author_email})</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => approve(item)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl transition-colors"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    onClick={() => reject(item.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-xl transition-colors"
                  >
                    ✗ Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Publicados */}
        {tab === "approved" && (
          <>
            {toys.length === 0 && (
              <p className="text-gray-500 text-center py-20">Nenhum brinquedo publicado ainda.</p>
            )}
            {toys.map(toy => (
              <div key={toy.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex gap-4 items-center">
                <img src={toy.image} alt={toy.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{toy.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{toy.description}</p>
                </div>
                <button
                  onClick={() => deleteToy(toy.id)}
                  className="p-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </Layout>
  );
}