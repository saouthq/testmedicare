import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  MapPin,
  Phone,
  Star,
  Clock,
  CreditCard,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  Globe,
  Award,
  Video,
  Heart,
  Share2,
  Navigation,
  GraduationCap,
  ThumbsUp,
  Users,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileText,
  Verified,
  AlertCircle,
  User } from
"lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const doctorData = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  subSpecialties: ["Diabétologie", "Médecine du sport"],
  photo: null,
  initials: "AB",
  rating: 4.8,
  reviewCount: 127,
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  convention: "Conventionné CNAM",
  price: "35 DT",
  priceRange: { consultation: 35, suivi: 25, premiere: 50, certificat: 20 },
  languages: ["Français", "Arabe", "Anglais"],
  experience: "15 ans",
  registrationYear: 2010,
  orderNumber: "TN-10101010",
  presentation:
  "Médecin généraliste diplômé de la Faculté de Médecine de Tunis, je vous accueille dans mon cabinet moderne à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé complets et vaccinations.\n\nJe porte une attention particulière à l'écoute de mes patients et à une approche globale de la santé. Mon cabinet est équipé d'un ECG, d'un échographe et d'un laboratoire d'analyses rapides.\n\nConventionné CNAM, je pratique le tiers payant pour faciliter vos démarches.",
  diplomas: [
  { title: "Doctorat en Médecine", school: "Faculté de Médecine de Tunis", year: "2010" },
  { title: "DU Diabétologie", school: "Université de Tunis El Manar", year: "2012" },
  { title: "DIU Médecine du Sport", school: "Université Paris Descartes", year: "2014" },
  { title: "Formation Échographie", school: "Institut Pasteur de Tunis", year: "2016" }],


  horaires: [
  { day: "Lundi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
  { day: "Mardi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
  { day: "Mercredi", hours: "08:00 - 12:00", open: true },
  { day: "Jeudi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
  { day: "Vendredi", hours: "08:00 - 12:00 / 14:00 - 17:00", open: true },
  { day: "Samedi", hours: "08:00 - 13:00", open: true },
  { day: "Dimanche", hours: "Fermé", open: false }],


  motifs: [
  { name: "Consultation générale", duration: "30 min", price: "35 DT" },
  { name: "Suivi maladie chronique", duration: "20 min", price: "25 DT" },
  { name: "Première consultation", duration: "45 min", price: "50 DT" },
  { name: "Certificat médical", duration: "15 min", price: "20 DT" },
  { name: "Bilan de santé complet", duration: "60 min", price: "80 DT" },
  { name: "Vaccination", duration: "15 min", price: "25 DT" },
  { name: "Téléconsultation", duration: "20 min", price: "30 DT" }],


  teleconsultation: true,
  actes: [
  "ECG",
  "Échographie abdominale",
  "Spirométrie",
  "Tests rapides (glycémie, CRP)",
  "Vaccinations",
  "Petite chirurgie"],

  memberships: [
  "Ordre National des Médecins de Tunisie",
  "Société Tunisienne de Médecine Générale",
  "Association Tunisienne de Diabétologie"],

  accessInfo: {
    parking: true,
    handicap: true,
    elevator: true,
    publicTransport: "Métro ligne 1 - Station El Manar (200m)"
  }
};

const availableSlots = [
{ date: "Jeu. 20 Fév", day: "Jeudi", slots: ["09:00", "09:30", "10:00", "11:00", "14:30", "15:00", "16:00"] },
{ date: "Ven. 21 Fév", day: "Vendredi", slots: ["08:30", "09:00", "10:30", "11:00"] },
{ date: "Sam. 22 Fév", day: "Samedi", slots: ["08:00", "09:00", "10:00", "11:00", "12:00"] },
{
  date: "Lun. 24 Fév",
  day: "Lundi",
  slots: ["08:00", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "16:00", "16:30"]
},
{ date: "Mar. 25 Fév", day: "Mardi", slots: ["08:30", "10:00", "11:00", "14:30", "15:30"] }];


const reviews = [
{
  author: "Amine B.",
  rating: 5,
  date: "10 Fév 2026",
  text: "Très bon médecin, à l'écoute et professionnel.",
  helpful: 12,
  verified: true
},
{
  author: "Fatma T.",
  rating: 5,
  date: "5 Fév 2026",
  text: "Ponctuel et efficace. Explique bien les traitements.",
  helpful: 8,
  verified: true
},
{
  author: "Mohamed S.",
  rating: 4,
  date: "28 Jan 2026",
  text: "Bon suivi médical, cabinet propre et moderne.",
  helpful: 5,
  verified: true
},
{
  author: "Nadia J.",
  rating: 5,
  date: "20 Jan 2026",
  text: "Excellent suivi pour mon diabète.",
  helpful: 15,
  verified: true
},
{
  author: "Sami A.",
  rating: 4,
  date: "15 Jan 2026",
  text: "Bonne consultation, docteur à l'écoute.",
  helpful: 3,
  verified: false
}];


const faqItems = [
{
  q: "Comment se déroule une première consultation ?",
  a: "La première consultation dure environ 45 minutes. Elle comprend un entretien approfondi sur vos antécédents médicaux, un examen clinique complet et si nécessaire, des examens complémentaires."
},
{ q: "Prenez-vous la CNAM ?", a: "Oui, le cabinet est conventionné CNAM Secteur 1. Le tiers payant est pratiqué." },
{
  q: "Faites-vous des téléconsultations ?",
  a: "Oui, je propose des téléconsultations vidéo pour le suivi de maladies chroniques et le renouvellement d'ordonnances."
},
{
  q: "Quel est le délai moyen pour obtenir un RDV ?",
  a: "Le délai moyen est de 2 à 3 jours ouvrés. Pour les urgences, des créneaux sont réservés chaque jour."
}];


const DoctorPublicProfile = () => {
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "reviews" | "faq">("info");
  const [openSection, setOpenSection] = useState<string | null>("presentation");
  const isMobile = useIsMobile();

  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const ratingDistribution = [
  { stars: 5, count: 89, pct: 70 },
  { stars: 4, count: 25, pct: 20 },
  { stars: 3, count: 8, pct: 6 },
  { stars: 2, count: 3, pct: 2 },
  { stars: 1, count: 2, pct: 2 }];


  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const AccordionSection = ({
    title,
    sectionKey,
    icon: Icon,
    children





  }: {title: string;sectionKey: string;icon: any;children: React.ReactNode;}) => {
    if (!isMobile)
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </h3>
          {children}
        </div>);

    const isOpen = openSection === sectionKey;
    return (
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 text-left">

          <span className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </span>
          {isOpen ?
          <ChevronUp className="h-4 w-4 text-muted-foreground" /> :

          <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </button>
        {isOpen && <div className="px-4 pb-4">{children}</div>}
      </div>);

  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Medicare</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <Link to="/search" className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Retour aux résultats
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr] max-w-3xl mx-auto">
          {/* Main content */}
          <div className="space-y-4 sm:space-y-5">
            {/* Hero doctor card – fixed mobile layout */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-card">
              {/* Banner – shorter on mobile */}
              <div className="h-20 sm:h-28 gradient-hero relative my-0 mb-[34px]">
                <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40">

                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40">

                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Profile card – proper negative margin so avatar overlaps banner without hiding content */}
              <div className="px-4 sm:px-6 pb-5 -mt-8 sm:-mt-10 relative">
                <div className="flex items-end gap-3 sm:gap-4">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl sm:text-3xl font-bold border-4 border-card shadow-elevated shrink-0">
                    {doctorData.initials}
                  </div>
                  <div className="flex-1 pb-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{doctorData.name}</h1>
                      <Verified className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    </div>
                    <p className="text-primary font-medium text-xs sm:text-sm">{doctorData.specialty}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctorData.subSpecialties.map((s) =>
                      <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats row – compact */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3">
                  <div className="rounded-lg bg-warning/5 border border-warning/20 p-1.5 sm:p-2 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-warning text-warning" />
                      <span className="text-sm sm:text-base font-bold text-foreground">{doctorData.rating}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">{doctorData.reviewCount} avis</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-1.5 sm:p-2 text-center">
                    <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary mx-auto" />
                    <p className="text-[9px] sm:text-[10px] text-primary font-medium">CNAM</p>
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-1.5 sm:p-2 text-center">
                    <p className="text-sm sm:text-base font-bold text-foreground">{doctorData.experience}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Expérience</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-1.5 sm:p-2 text-center">
                    <p className="text-sm sm:text-base font-bold text-foreground">{doctorData.price}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Consultation</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{doctorData.address}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {doctorData.phone}
                  </span>
                  {doctorData.teleconsultation &&
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium w-fit">
                      <Video className="h-3 w-3" />
                      Téléconsultation
                    </span>
                  }
                </div>
              </div>
            </div>

            {/* Tab navigation – scrollable on mobile */}
            <div className="flex gap-1 rounded-lg border bg-card p-0.5 overflow-x-auto">
              {[
              { key: "info" as const, label: "Informations" },
              { key: "reviews" as const, label: `Avis (${doctorData.reviewCount})` },
              { key: "faq" as const, label: "FAQ" }].
              map((t) =>
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>

                  {t.label}
                </button>
              )}
            </div>

            {activeTab === "info" &&
            <div className="space-y-3 sm:space-y-5">
                {/* Présentation — always visible, not in accordion */}
                <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Présentation
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {doctorData.presentation}
                  </p>
                </div>

                <AccordionSection title="Expertises & Actes" sectionKey="actes" icon={Briefcase}>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {doctorData.actes.map((a, i) =>
                  <span
                    key={i}
                    className="text-xs bg-primary/5 text-foreground border border-primary/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">

                        {a}
                      </span>
                  )}
                  </div>
                </AccordionSection>

                <AccordionSection title="Tarifs" sectionKey="tarifs" icon={CreditCard}>
                  <div className="space-y-1.5 sm:space-y-2">
                    {doctorData.motifs.map((m, i) =>
                  <div key={i} className="flex items-center justify-between py-1.5 sm:py-2 border-b last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                          
                        </div>
                        <span className="text-sm font-bold text-primary ml-2 shrink-0">{m.price}</span>
                      </div>
                  )}
                  </div>
                </AccordionSection>

                <AccordionSection title="Formation & Diplômes" sectionKey="diplomas" icon={GraduationCap}>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/20 rounded-full" />
                    {doctorData.diplomas.map((d, i) =>
                  <div key={i} className="relative mb-3 last:mb-0">
                        <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.school} · {d.year}
                        </p>
                      </div>
                  )}
                  </div>
                </AccordionSection>

                <AccordionSection title="Langues parlées" sectionKey="languages" icon={Globe}>
                  <div className="flex flex-wrap gap-2">
                    {doctorData.languages.map((l) =>
                  <span key={l} className="text-sm bg-muted px-3 py-1.5 rounded-full text-foreground font-medium">
                        {l}
                      </span>
                  )}
                  </div>
                </AccordionSection>

                <AccordionSection title="Horaires" sectionKey="horaires" icon={Clock}>
                  <div className="space-y-1">
                    {doctorData.horaires.map((h, i) => {
                    const isToday = h.day === "Jeudi";
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-sm ${isToday ? "bg-primary/5 border border-primary/20" : ""} ${!h.open ? "text-muted-foreground" : "text-foreground"}`}>

                          <span className="font-medium text-xs sm:text-sm">
                            {h.day}{" "}
                            {isToday &&
                          <span className="text-[10px] text-primary font-semibold ml-1">Aujourd'hui</span>
                          }
                          </span>
                          <span className="text-[11px] sm:text-sm">{h.hours}</span>
                        </div>);

                  })}
                  </div>
                </AccordionSection>

                <AccordionSection title="Accès & Infos pratiques" sectionKey="access" icon={Navigation}>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-base sm:text-lg">🅿️</span>
                      <span className="text-foreground">Parking</span>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-base sm:text-lg">♿</span>
                      <span className="text-foreground">Accès handicapé</span>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-base sm:text-lg">🛗</span>
                      <span className="text-foreground">Ascenseur</span>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-base sm:text-lg">🚇</span>
                      <span className="text-xs text-foreground">{doctorData.accessInfo.publicTransport}</span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 rounded-xl bg-muted h-32 sm:h-40 flex items-center justify-center border">
                    <div className="text-center">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{doctorData.address}</p>
                      <Button variant="link" size="sm" className="text-xs mt-1">
                        Voir sur la carte
                      </Button>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Affiliations" sectionKey="memberships" icon={Award}>
                  <ul className="space-y-2">
                    {doctorData.memberships.map((m, i) =>
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                        {m}
                      </li>
                  )}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    N° Ordre : {doctorData.orderNumber} · Inscrit depuis {doctorData.registrationYear}
                  </p>
                </AccordionSection>
              </div>
            }

            {activeTab === "reviews" &&
            <div className="space-y-4 sm:space-y-5">
                <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="text-center shrink-0">
                      <p className="text-3xl sm:text-4xl font-bold text-foreground">{doctorData.rating}</p>
                      <div className="flex mt-1">
                        {Array.from({ length: 5 }).map((_, j) =>
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${j < Math.round(doctorData.rating) ? "fill-warning text-warning" : "text-muted"}`} />

                      )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{doctorData.reviewCount} avis</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {ratingDistribution.map((r) =>
                    <div key={r.stars} className="flex items-center gap-2">
                          <span className="text-xs w-6 text-right text-muted-foreground">{r.stars}★</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-warning rounded-full" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="text-xs w-8 text-muted-foreground">{r.count}</span>
                        </div>
                    )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {displayReviews.map((r, i) =>
                <div key={i} className="rounded-xl border bg-card p-4 sm:p-5 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {r.author.
                        split(" ").
                        map((n) => n[0]).
                        join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm text-foreground">{r.author}</span>
                              {r.verified && <Verified className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: r.rating }).map((_, j) =>
                          <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                          )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <p className="text-sm text-foreground mt-3 leading-relaxed">{r.text}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                          {r.helpful} utile{r.helpful > 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                )}
                </div>
                {reviews.length > 3 &&
              <Button variant="outline" className="w-full" onClick={() => setShowAllReviews(!showAllReviews)}>
                    {showAllReviews ? "Voir moins" : `Voir tous les avis (${doctorData.reviewCount})`}
                  </Button>
              }
              </div>
            }

            {activeTab === "faq" &&
            <div className="space-y-3">
                {faqItems.map((f, i) =>
              <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
                    <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left">

                      <span className="text-sm font-medium text-foreground pr-2">{f.q}</span>
                      {expandedFaq === i ?
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> :

                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                    </button>
                    {expandedFaq === i &&
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-2 animate-fade-in">
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                      </div>
                }
                  </div>
              )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-md p-3 sm:p-4">
        <div className="max-w-3xl mx-auto">
          <Button
            className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-12 text-sm font-semibold"
            onClick={() => navigate("/booking/1")}>

            <Calendar className="h-4 w-4 mr-2" />
            Prendre rendez-vous
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            Prise en charge CNAM · Annulation gratuite 24h avant
          </p>
        </div>
      </div>

      {/* Bottom spacer for sticky CTA */}
      <div className="h-24" />
    </div>);

};

export default DoctorPublicProfile;