/**
 * PublicHeader — Navigation publique Medicare.tn
 * Liens : Accueil, Rechercher, Annuaire (dropdown), Médicaments, Comment ça marche, Aide, Devenir partenaire, Retrouver mes RDV, Connexion
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, ChevronDown, Menu, X, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PublicHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [annuaireOpen, setAnnuaireOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!annuaireOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setAnnuaireOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [annuaireOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center px-4 gap-4">
        {/* Logo — fixed width */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Stethoscope className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Medicare</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium hidden sm:block">Tunisie 🇹🇳</span>
        </Link>

        {/* Desktop nav — centered */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Rechercher</Link>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setAnnuaireOpen(!annuaireOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">
              Annuaire <ChevronDown className={`h-3 w-3 transition-transform ${annuaireOpen ? "rotate-180" : ""}`} />
            </button>
            {annuaireOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-card shadow-elevated p-1 z-50 animate-fade-in">
                <Link to="/search" onClick={() => setAnnuaireOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">Médecins</Link>
                <Link to="/clinics" onClick={() => setAnnuaireOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">Cliniques</Link>
                <Link to="/hospitals" onClick={() => setAnnuaireOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">Hôpitaux</Link>
                <Link to="/pharmacies" onClick={() => setAnnuaireOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">Pharmacies</Link>
              </div>
            )}
          </div>
          <Link to="/medicaments" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Médicaments</Link>
          <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Comment ça marche</Link>
          <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-muted">Aide</Link>
          <Link to="/my-appointments" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted">
            <Calendar className="h-3.5 w-3.5" />Mes RDV
          </Link>
        </div>

        {/* Right actions — fixed width */}
        <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
          <Link to="/become-partner" className="hidden xl:block">
            <Button variant="ghost" size="sm" className="text-xs">Devenir partenaire</Button>
          </Link>
          <Link to="/login" className="hidden sm:block"><Button variant="ghost" size="sm">Connexion</Button></Link>
          <Link to="/register" className="hidden sm:block"><Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow">S'inscrire</Button></Link>
          <button className="lg:hidden text-muted-foreground p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-card p-4 space-y-1 animate-slide-up">
          <Link to="/search" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Rechercher un médecin</Link>
          <Link to="/clinics" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Cliniques</Link>
          <Link to="/hospitals" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Hôpitaux</Link>
          <Link to="/pharmacies" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Pharmacies</Link>
          <Link to="/medicaments" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Médicaments</Link>
          <div className="border-t my-1" />
          <Link to="/how-it-works" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Comment ça marche</Link>
          <Link to="/help" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Aide / FAQ</Link>
          <Link to="/become-partner" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted active-scale">Devenir partenaire</Link>
          <Link to="/my-appointments" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 active-scale">📅 Retrouver mes RDV</Link>
          <div className="pt-2 border-t flex gap-2">
            <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full" size="sm">Connexion</Button></Link>
            <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}><Button className="w-full gradient-primary text-primary-foreground" size="sm">S'inscrire</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
