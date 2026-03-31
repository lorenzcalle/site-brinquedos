import { Link, useLocation } from "wouter";
import { Atom, Menu, X, Facebook, Instagram, Youtube, Phone, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "O Projeto", path: "/sobre" },
  { name: "Portfólio", path: "/portfolio" },
  { name: "Materiais", path: "/materiais" },
  { name: "Blog", path: "/blog" },
  { name: "Eventos", path: "/eventos" },
  { name: "Contato", path: "/contato" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-3" : "bg-white/90 backdrop-blur-sm py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-secondary transition-colors">
            <Atom className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            Brinquedos<br />
            <span className="text-primary group-hover:text-secondary transition-colors">Científicos</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`hover:text-primary transition-colors ${
                location === link.path ? "text-primary" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/portfolio"
            className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-full transition-colors shadow-sm"
          >
            Ver Mostra
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4 font-semibold text-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block py-2 ${
                    location === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/portfolio"
                className="bg-accent text-white text-center py-3 rounded-xl mt-2"
              >
                Ver Mostra
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Atom className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Brinquedos<br />
                <span className="text-primary">Científicos</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              Aprender ciência brincando e criando! Um projeto dedicado à educação e inovação.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 border-b border-white/20 pb-2">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">O Projeto</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfólio</Link></li>
              <li><Link href="/materiais" className="hover:text-white transition-colors">Materiais</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 border-b border-white/20 pb-2">Recursos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Notícias</Link></li>
              <li><Link href="/eventos" className="hover:text-white transition-colors">Eventos</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Guias de Construção</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vídeo Tutoriais</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 border-b border-white/20 pb-2">Contato</h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>+55 (11) 98765-4321</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>contato@brinquedoscientificos.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Brinquedos Científicos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/5511987654321"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-[88px]">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}