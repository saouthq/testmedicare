import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import SeoHelmet from "@/components/seo/SeoHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Shield, Clock, Users, Stethoscope, Pill, FlaskConical, ChevronRight, Building2,
  Video, MapPin, Hospital, Moon, CheckCircle, Lock, Heart,
} from "lucide-react";
import { useClinicsDirectory, useHospitalsDirectory, usePharmaciesDirectory, useMedicinesDirectory } from "@/stores/directoryStore";

const specialties = ["Médecin généraliste", "Dentiste", "Ophtalmologue", "Dermatologue", "Gynécologue", "Pédiatre", "Kinésithérapeute", "Cardiologue"];

type SearchTab = "doctors" | "clinics" | "hospitals" | "pharmacies" | "medicines";

const Landing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [deGarde, setDeGarde] = useState(false);
  const mockClinics = useClinicsDirectory();
  const mockHospitals = useHospitalsDirectory();
  const mockPublicPharmacies = usePharmaciesDirectory();
  const mockTopMedicines = useMedicinesDirectory();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (activeTab === "doctors") {
      if (searchQuery) params.set("q", searchQuery);
      if (cityQuery) params.set("city", cityQuery);
      navigate(`/search?${params.toString()}`);
    }
    else if (activeTab === "clinics") navigate(`/clinics`);
    else if (activeTab === "hospitals") navigate(`/hospitals`);
    else if (activeTab === "pharmacies") navigate(deGarde ? `/pharmacies?garde=true` : `/pharmacies`);
    else if (activeTab === "medicines") navigate(`/medicaments`);
  };

  const tabs: { key: SearchTab; label: string; icon: any }[] = [
    { key: "doctors", label: "Médecins", icon: Stethoscope },
    { key: "clinics", label: "Cliniques", icon: Building2 },
    { key: "hospitals", label: "Hôpitaux", icon: Hospital },
    { key: "pharmacies", label: "Pharmacies", icon: Pill },
    { key: "medicines", label: "Médicaments", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Medicare Tunisie — Prenez rendez-vous avec un médecin en ligne" 
        description="La plateforme médicale complète en Tunisie. Trouvez un médecin, une clinique, un hôpital ou une pharmacie. Prenez RDV en ligne 24h/24." 
      />
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl animate-fade-in">
              Votre santé en Tunisie,{" "}<span className="text-primary">simplifiée</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Trouvez un médecin, une clinique, un hôpital ou une pharmacie. Prenez RDV en ligne 24h/24, praticiens conventionnés, paiement en Dinars.
            </p>
          </div>

          {/* Multi-tab search */}
          <div className="mx-auto max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-2xl border bg-card shadow-elevated overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center border-b-2 ${activeTab === t.key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    <t.icon className="h-3.5 w-3.5" />{t.label}
                  </button>
                ))}
              </div>
              <div className="p-4 space-y-3">
                {activeTab === "doctors" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Spécialité, nom du médecin..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1" />
                    <Input placeholder="Ville..." value={cityQuery} onChange={e => setCityQuery(e.target.value)} className="sm:w-36" />
                  </div>
                )}
                {activeTab === "clinics" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Ville..." className="flex-1" />
                    <Input placeholder="Spécialité / service..." className="flex-1" />
                  </div>
                )}
                {activeTab === "hospitals" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Ville..." className="flex-1" />
                    <Input placeholder="Service..." className="flex-1" />
                  </div>
                )}
                {activeTab === "pharmacies" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Ville..." className="flex-1" />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={deGarde} onChange={e => setDeGarde(e.target.checked)} className="rounded" />
                      <Moon className="h-3.5 w-3.5" />De garde
                    </label>
                  </div>
                )}
                {activeTab === "medicines" && (
                  <Input placeholder="Nom du médicament (ex: Doliprane, Augmentin...)" />
                )}
                <Button onClick={handleSearch} className="w-full gradient-primary text-primary-foreground shadow-primary-glow">
                  <Search className="h-4 w-4 mr-1.5" />Rechercher
                </Button>
              </div>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/search">
              <Button variant="outline" size="sm" className="text-xs">
                <Stethoscope className="h-3.5 w-3.5 mr-1" />Trouver un médecin
              </Button>
            </Link>
            <Link to="/pharmacies?garde=true">
              <Button variant="outline" size="sm" className="text-xs">
                <Moon className="h-3.5 w-3.5 mr-1" />Pharmacies de garde
              </Button>
            </Link>
            <Link to="/my-appointments">
              <Button variant="outline" size="sm" className="text-xs">
                <Search className="h-3.5 w-3.5 mr-1" />Retrouver mes RDV
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="border-y bg-card py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-sm font-medium text-muted-foreground mb-4">Spécialités populaires</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {specialties.map(s => (
              <Link key={s} to={`/search?specialty=${encodeURIComponent(s)}`} className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-card">{s}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Establishments */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Établissements recommandés</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {mockClinics.slice(0, 3).map(c => (
              <Link key={c.id} to={`/clinic/${c.slug}`} className="group rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</p>
              </Link>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockHospitals.slice(0, 4).map(h => (
              <Link key={h.id} to={`/hospital/${h.slug}`} className="group rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Hospital className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{h.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{h.city}</p>
                {h.urgences && <span className="text-[10px] text-destructive font-medium">🚨 Urgences</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pharmacies de garde */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Pharmacies de garde</h2>
            <Link to="/pharmacies?garde=true" className="text-sm text-primary hover:underline flex items-center gap-1">Voir toutes <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockPublicPharmacies.filter(p => p.deGarde).slice(0, 3).map(p => (
              <Link key={p.id} to={`/pharmacy/${p.slug}`} className="group rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="h-4 w-4 text-accent" />
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">🌙 De garde</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city} · {p.horaires}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top medicines */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Médicaments les plus recherchés</h2>
            <Link to="/medicaments" className="text-sm text-primary hover:underline flex items-center gap-1">Voir l'annuaire <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockTopMedicines.map(m => (
              <Link key={m.id} to={`/medicament/${m.slug}`} className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all shadow-card">
                {m.name} · <span className="text-xs">{m.form}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground">Comment ça marche ?</h2>
            <Link to="/how-it-works" className="text-sm text-primary hover:underline">En savoir plus</Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: "1", icon: Search, title: "Recherchez", desc: "Trouvez un praticien par spécialité, ville ou nom." },
              { step: "2", icon: Clock, title: "Réservez", desc: "Choisissez un créneau et confirmez en quelques clics." },
              { step: "3", icon: CheckCircle, title: "Consultez", desc: "Rendez-vous en cabinet ou en téléconsultation." },
            ].map((s, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">{s.step}</div>
                <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Ce qu'ils en disent</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Avis vérifiés de nos utilisateurs</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: "Fatma B.", role: "Patiente", text: "J'ai trouvé un ophtalmologue en 2 minutes et pris RDV pour le lendemain. Simple et rapide !", avatar: "FB" },
              { name: "Dr. Karim M.", role: "Cardiologue", text: "Medicare me permet de gérer mon planning et mes patients efficacement. L'interface est intuitive et professionnelle.", avatar: "KM" },
              { name: "Sarra T.", role: "Patiente", text: "La téléconsultation m'a évité un déplacement inutile. Le paiement sécurisé et le compte-rendu reçu immédiatement.", avatar: "ST" },
              { name: "Dr. Nadia H.", role: "Pédiatre", text: "Les outils de suivi de croissance et le carnet vaccinal intégrés facilitent le suivi de mes petits patients.", avatar: "NH" },
              { name: "Mohamed A.", role: "Pharmacien", text: "Je reçois les ordonnances directement sur la plateforme et peux informer le patient quand c'est prêt. Fini les appels !", avatar: "MA" },
              { name: "Leila K.", role: "Patiente", text: "Mon espace santé centralise tous mes documents, vaccins et traitements. Mon médecin a accès à tout instantanément.", avatar: "LK" },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-primary">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Confiance & Confidentialité</h2>
          <div className="grid gap-6 sm:grid-cols-4 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Données chiffrées", desc: "Chiffrement AES-256 de bout en bout pour toutes vos données médicales." },
              { icon: Lock, title: "RGPD conforme", desc: "Conformité totale avec la réglementation tunisienne et européenne sur la protection des données." },
              { icon: Heart, title: "Praticiens vérifiés", desc: "Tous les professionnels sont vérifiés via leur numéro d'inscription au Conseil de l'Ordre." },
              { icon: Video, title: "Téléconsultation sécurisée", desc: "Appels vidéo chiffrés avec partage de dossier médical en temps réel." },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card text-center">
                <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center sm:grid-cols-4">
            {[{ value: "5 000+", label: "Praticiens" }, { value: "500K+", label: "Patients" }, { value: "2M+", label: "RDV pris" }, { value: "4.8/5", label: "Satisfaction" }].map(s => (
              <div key={s.label}><div className="text-3xl font-bold text-primary">{s.value}</div><div className="mt-1 text-sm text-muted-foreground">{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Pro */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Vous êtes professionnel de santé ?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">Rejoignez Medicare pour gérer votre agenda, vos patients et booster votre visibilité en ligne.</p>
          <Link to="/become-partner"><Button size="lg" className="gradient-primary text-primary-foreground shadow-primary-glow">Devenir partenaire <ChevronRight className="ml-1 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;
