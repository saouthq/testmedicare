import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Shield,
  Clock,
  Users,
  Stethoscope,
  Pill,
  FlaskConical,
  ChevronRight,
  Star,
  MapPin,
  Phone,
} from "lucide-react";

const specialties = [
  "Médecin généraliste",
  "Dentiste",
  "Ophtalmologue",
  "Dermatologue",
  "Gynécologue",
  "Pédiatre",
  "Kinésithérapeute",
  "Cardiologue",
];

const features = [
  {
    icon: Calendar,
    title: "Prise de RDV en ligne",
    description: "Réservez votre rendez-vous 24h/24, 7j/7 en quelques clics.",
  },
  {
    icon: Clock,
    title: "Rappels automatiques",
    description: "Recevez des rappels par SMS et email avant chaque consultation.",
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Vos données médicales sont chiffrées et protégées selon les normes RGPD.",
  },
  {
    icon: Users,
    title: "Téléconsultation",
    description: "Consultez votre médecin à distance depuis votre domicile.",
  },
];

const roles = [
  {
    icon: Stethoscope,
    title: "Médecins",
    description: "Gérez votre agenda, vos patients et vos consultations.",
    link: "/dashboard/doctor",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Patients",
    description: "Prenez RDV, consultez vos ordonnances et votre historique.",
    link: "/dashboard/patient",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Pill,
    title: "Pharmacies",
    description: "Recevez et gérez les ordonnances de vos patients.",
    link: "/dashboard/pharmacy",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: FlaskConical,
    title: "Laboratoires",
    description: "Gérez les analyses et partagez les résultats.",
    link: "/dashboard/laboratory",
    color: "bg-destructive/10 text-destructive",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediConnect</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pour qui ?
            </a>
            <a href="#specialties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Spécialités
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Votre santé,{" "}
              <span className="text-primary">simplifiée</span>
            </h1>
            <p className="mt-6 animate-fade-in text-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
              La plateforme médicale complète qui connecte patients, médecins, pharmacies et laboratoires. 
              Prenez rendez-vous en ligne, gérez vos consultations et accédez à vos données de santé en toute sécurité.
            </p>
            <div
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un praticien, une spécialité..."
                  className="h-12 w-full rounded-xl border bg-card pl-12 pr-4 text-foreground shadow-card focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-primary-glow h-12 px-8">
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="border-y bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {specialties.map((s) => (
              <Link
                key={s}
                to="/dashboard/patient/search"
                className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-card"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-muted-foreground">
              Une plateforme complète pour gérer l'ensemble de votre parcours de santé.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Pour tous les acteurs de santé</h2>
            <p className="mt-4 text-muted-foreground">
              Chaque professionnel dispose de son propre espace adapté à ses besoins.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r, i) => (
              <Link
                key={r.title}
                to={r.link}
                className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${r.color}`}>
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Accéder <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center sm:grid-cols-4">
            {[
              { value: "50 000+", label: "Praticiens" },
              { value: "2M+", label: "Patients" },
              { value: "10M+", label: "RDV pris" },
              { value: "4.8/5", label: "Satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MediConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 MediConnect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
