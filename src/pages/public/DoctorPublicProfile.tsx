import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, MapPin, Phone, Star, Clock, CreditCard, Shield, Calendar, ChevronLeft, ChevronRight,
  CheckCircle, MessageSquare, Globe, Award, Video, Heart, Share2, Navigation, GraduationCap,
  ThumbsUp, Users, Building2, Briefcase, ChevronDown, ChevronUp, FileText, Verified, AlertCircle, User
} from "lucide-react";
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
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis, je vous accueille dans mon cabinet moderne à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé complets et vaccinations.\n\nJe porte une attention particulière à l'écoute de mes patients et à une approche globale de la santé. Mon cabinet est équipé d'un ECG, d'un échographe et d'un laboratoire d'analyses rapides.\n\nConventionné CNAM, je pratique le tiers payant pour faciliter vos démarches.",
  diplomas: [
    { title: "Doctorat en Médecine", school: "Faculté de Médecine de Tunis", year: "2010" },
    { title: "DU Diabétologie", school: "Université de Tunis El Manar", year: "2012" },
    { title: "DIU Médecine du Sport", school: "Université Paris Descartes", year: "2014" },
    { title: "Formation Échographie", school: "Institut Pasteur de Tunis", year: "2016" },
  ],
  horaires: [
    { day: "Lundi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mardi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mercredi", hours: "08:00 - 12:00", open: true },
    { day: "Jeudi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Vendredi", hours: "08:00 - 12:00 / 14:00 - 17:00", open: true },
    { day: "Samedi", hours: "08:00 - 13:00", open: true },
    { day: "Dimanche", hours: "Fermé", open: false },
  ],
  motifs: [
    { name: "Consultation générale", duration: "30 min", price: "35 DT" },
    { name: "Suivi maladie chronique", duration: "20 min", price: "25 DT" },
    { name: "Première consultation", duration: "45 min", price: "50 DT" },
    { name: "Certificat médical", duration: "15 min", price: "20 DT" },
    { name: "Bilan de santé complet", duration: "60 min", price: "80 DT" },
    { name: "Vaccination", duration: "15 min", price: "25 DT" },
    { name: "Téléconsultation", duration: "20 min", price: "30 DT" },
  ],
  teleconsultation: true,
  actes: ["ECG", "Échographie abdominale", "Spirométrie", "Tests rapides (glycémie, CRP)", "Vaccinations", "Petite chirurgie"],
  memberships: ["Ordre National des Médecins de Tunisie", "Société Tunisienne de Médecine Générale", "Association Tunisienne de Diabétologie"],
  accessInfo: {
    parking: true,
    handicap: true,
    elevator: true,
    publicTransport: "Métro ligne 1 - Station El Manar (200m)",
  },
};

const availableSlots = [
  { date: "Jeu. 20 Fév", day: "Jeudi", slots: ["09:00", "09:30", "10:00", "11:00", "14:30", "15:00", "16:00"] },
  { date: "Ven. 21 Fév", day: "Vendredi", slots: ["08:30", "09:00", "10:30", "11:00"] },
  { date: "Sam. 22 Fév", day: "Samedi", slots: ["08:00", "09:00", "10:00", "11:00", "12:00"] },
  { date: "Lun. 24 Fév", day: "Lundi", slots: ["08:00", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "16:00", "16:30"] },
  { date: "Mar. 25 Fév", day: "Mardi", slots: ["08:30", "10:00", "11:00", "14:30", "15:30"] },
];

const reviews = [
  { author: "Amine B.", rating: 5, date: "10 Fév 2026", text: "Très bon médecin, à l'écoute et professionnel.", helpful: 12, verified: true },
  { author: "Fatma T.", rating: 5, date: "5 Fév 2026", text: "Ponctuel et efficace. Explique bien les traitements.", helpful: 8, verified: true },
  { author: "Mohamed S.", rating: 4, date: "28 Jan 2026", text: "Bon suivi médical, cabinet propre et moderne.", helpful: 5, verified: true },
  { author: "Nadia J.", rating: 5, date: "20 Jan 2026", text: "Excellent suivi pour mon diabète.", helpful: 15, verified: true },
  { author: "Sami A.", rating: 4, date: "15 Jan 2026", text: "Bonne consultation, docteur à l'écoute.", helpful: 3, verified: false },
];

const faqItems = [
  { q: "Comment se déroule une première consultation ?", a: "La première consultation dure environ 45 minutes. Elle comprend un entretien approfondi sur vos antécédents médicaux, un examen clinique complet et si nécessaire, des examens complémentaires." },
  { q: "Prenez-vous la CNAM ?", a: "Oui, le cabinet est conventionné CNAM Secteur 1. Le tiers payant est pratiqué." },
  { q: "Faites-vous des téléconsultations ?", a: "Oui, je propose des téléconsultations vidéo pour le suivi de maladies chroniques et le renouvellement d'ordonnances." },
  { q: "Quel est le délai moyen pour obtenir un RDV ?", a: "Le délai moyen est de 2 à 3 jours ouvrés. Pour les urgences, des créneaux sont réservés chaque jour." },
];

const DoctorPublicProfile = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "reviews" | "faq">("info");
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  /* Mobile accordion sections */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const displaySlots = showAllSlots ? availableSlots : availableSlots.slice(0, 3);
  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const ratingDistribution = [
    { stars: 5, count: 89, pct: 70 },
    { stars: 4, count: 25, pct: 20 },
    { stars: 3, count: 8, pct: 6 },
    { stars: 2, count: 3, pct: 2 },
    { stars: 1, count: 2, pct: 2 },
  ];

  const toggleSection = (key: string) => setOpenSection(openSection === key ? null : key);

  /* Accordion wrapper for mobile */
  const AccordionSection = ({ title, sectionKey, icon: Icon, children }: { title: string; sectionKey: string; icon: any; children: React.ReactNode }) => {
    if (!isMobile) return <div className="rounded-xl border bg-card p-6 shadow-card"><h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</h3>{children}</div>;
    const isOpen = openSection === sectionKey;
    return (
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <button onClick={() => toggleSection(sectionKey)} className="w-full flex items-center justify-between p-4 text-left">
          <span className="font-semibold text-foreground text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {isOpen && <div className="px-4 pb-4">{children}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center"><Stethoscope className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-bold text-foreground">Medicare</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="outline" size="sm">Se connecter</Button></Link>
            <Link to="/register"><Button size="sm" className="gradient-primary text-primary-foreground">S'inscrire</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/search" className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" />Retour aux résultats
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero doctor card */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-card">
              <div className="h-28 gradient-hero relative">
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40"><Heart className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40"><Share2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="px-4 sm:px-6 pb-6 -mt-10">
                <div className="flex items-end gap-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl sm:text-3xl font-bold border-4 border-card shadow-elevated shrink-0">
                    {doctorData.initials}
                  </div>
                  <div className="flex-1 pb-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{doctorData.name}</h1>
                      <Verified className="h-5 w-5 text-primary shrink-0" />
                    </div>
                    <p className="text-primary font-medium text-sm">{doctorData.specialty}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctorData.subSpecialties.map(s => (
                        <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="rounded-xl bg-warning/5 border border-warning/20 p-3 text-center">
                    <div className="flex items-center justify-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="text-lg font-bold text-foreground">{doctorData.rating}</span></div>
                    <p className="text-[10px] text-muted-foreground">{doctorData.reviewCount} avis</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center"><Shield className="h-4 w-4 text-primary mx-auto" /><p className="text-[10px] text-primary font-medium">CNAM</p></div>
                  <div className="rounded-xl bg-accent/5 border border-accent/20 p-3 text-center"><p className="text-lg font-bold text-foreground">{doctorData.experience}</p><p className="text-[10px] text-muted-foreground">d'expérience</p></div>
                  <div className="rounded-xl bg-muted/50 p-3 text-center"><p className="text-lg font-bold text-foreground">{doctorData.price}</p><p className="text-[10px] text-muted-foreground">Consultation</p></div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{doctorData.address}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{doctorData.phone}</span>
                  {doctorData.teleconsultation && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Video className="h-3 w-3" />Téléconsultation</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {[
                { key: "info" as const, label: "Informations" },
                { key: "reviews" as const, label: `Avis (${doctorData.reviewCount})` },
                { key: "faq" as const, label: "FAQ" },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div className="space-y-4 sm:space-y-5">
                <AccordionSection title="Présentation" sectionKey="presentation" icon={User}>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{doctorData.presentation}</p>
                </AccordionSection>

                <AccordionSection title="Expertises & Actes" sectionKey="actes" icon={Briefcase}>
                  <div className="flex flex-wrap gap-2">
                    {doctorData.actes.map((a, i) => (
                      <span key={i} className="text-xs bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-lg">{a}</span>
                    ))}
                  </div>
                </AccordionSection>

                {/* Tarifs – separated from motif selection, in accordion on mobile */}
                <AccordionSection title="Tarifs" sectionKey="tarifs" icon={CreditCard}>
                  <div className="space-y-2">
                    {doctorData.motifs.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">{m.duration}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{m.price}</span>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Formation & Diplômes" sectionKey="diplomas" icon={GraduationCap}>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/20 rounded-full" />
                    {doctorData.diplomas.map((d, i) => (
                      <div key={i} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.school} · {d.year}</p>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Langues parlées" sectionKey="languages" icon={Globe}>
                  <div className="flex gap-2">{doctorData.languages.map(l => <span key={l} className="text-sm bg-muted px-3 py-1.5 rounded-full text-foreground font-medium">{l}</span>)}</div>
                </AccordionSection>

                <AccordionSection title="Horaires" sectionKey="horaires" icon={Clock}>
                  <div className="space-y-1.5">
                    {doctorData.horaires.map((h, i) => {
                      const isToday = h.day === "Jeudi";
                      return (
                        <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${isToday ? "bg-primary/5 border border-primary/20" : ""} ${!h.open ? "text-muted-foreground" : "text-foreground"}`}>
                          <span className="font-medium">{h.day} {isToday && <span className="text-[10px] text-primary font-semibold ml-1">Aujourd'hui</span>}</span>
                          <span className="text-xs sm:text-sm">{h.hours}</span>
                        </div>
                      );
                    })}
                  </div>
                </AccordionSection>

                <AccordionSection title="Accès & Infos pratiques" sectionKey="access" icon={Navigation}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-sm"><span className="text-lg">🅿️</span><span className="text-foreground">Parking</span></div>
                    <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-sm"><span className="text-lg">♿</span><span className="text-foreground">Accès handicapé</span></div>
                    <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-sm"><span className="text-lg">🛗</span><span className="text-foreground">Ascenseur</span></div>
                    <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2 text-sm"><span className="text-lg">🚇</span><span className="text-xs text-foreground">{doctorData.accessInfo.publicTransport}</span></div>
                  </div>
                  <div className="mt-4 rounded-xl bg-muted h-40 flex items-center justify-center border">
                    <div className="text-center"><MapPin className="h-6 w-6 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">{doctorData.address}</p><Button variant="link" size="sm" className="text-xs mt-1">Voir sur la carte</Button></div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Affiliations" sectionKey="memberships" icon={Award}>
                  <ul className="space-y-2">
                    {doctorData.memberships.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0" />{m}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">N° Ordre : {doctorData.orderNumber} · Inscrit depuis {doctorData.registrationYear}</p>
                </AccordionSection>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-5">
                <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="text-center">
                      <p className="text-3xl sm:text-4xl font-bold text-foreground">{doctorData.rating}</p>
                      <div className="flex mt-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-4 w-4 ${j < Math.round(doctorData.rating) ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                      <p className="text-xs text-muted-foreground mt-1">{doctorData.reviewCount} avis</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {ratingDistribution.map(r => (
                        <div key={r.stars} className="flex items-center gap-2">
                          <span className="text-xs w-6 text-right text-muted-foreground">{r.stars}★</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${r.pct}%` }} /></div>
                          <span className="text-xs w-8 text-muted-foreground">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {displayReviews.map((r, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 sm:p-5 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{r.author.split(" ").map(n => n[0]).join("")}</div>
                          <div>
                            <div className="flex items-center gap-1.5"><span className="font-medium text-sm text-foreground">{r.author}</span>{r.verified && <Verified className="h-3.5 w-3.5 text-primary" />}</div>
                            <div className="flex items-center gap-1">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-warning text-warning" />)}</div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <p className="text-sm text-foreground mt-3 leading-relaxed">{r.text}</p>
                      <div className="flex items-center gap-3 mt-3"><button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><ThumbsUp className="h-3 w-3" />{r.helpful} utile{r.helpful > 1 ? "s" : ""}</button></div>
                    </div>
                  ))}
                </div>
                {reviews.length > 3 && <Button variant="outline" className="w-full" onClick={() => setShowAllReviews(!showAllReviews)}>{showAllReviews ? "Voir moins" : `Voir tous les avis (${doctorData.reviewCount})`}</Button>}
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-3">
                {faqItems.map((f, i) => (
                  <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
                      <span className="text-sm font-medium text-foreground">{f.q}</span>
                      {expandedFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {expandedFaq === i && <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-2 animate-fade-in"><p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking sidebar – show SLOTS FIRST, then motif */}
          <div className="space-y-5">
            <div className="rounded-2xl border bg-card shadow-card sticky top-20 overflow-hidden">
              <div className="gradient-primary p-4">
                <h3 className="font-bold text-primary-foreground text-lg">Prendre rendez-vous</h3>
                <p className="text-primary-foreground/70 text-xs mt-0.5">Prochain créneau : Aujourd'hui 14:30</p>
              </div>

              <div className="p-4 sm:p-5 space-y-5">
                {/* STEP 1: Choose date → expand to see time slots */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">1. Choisissez une date</p>
                  <div className="space-y-2">
                    {displaySlots.map((day, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                          className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                            expandedDay === day.date ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{day.date}</p>
                            <p className="text-[11px] text-muted-foreground">{day.slots.length} créneaux disponibles</p>
                          </div>
                          {expandedDay === day.date ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        {/* Expanded: show time slots */}
                        {expandedDay === day.date && (
                          <div className="flex flex-wrap gap-1.5 mt-2 ml-1 animate-fade-in">
                            {day.slots.map(s => (
                              <button key={s} onClick={() => setSelectedSlot(`${day.date}-${s}`)}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                  selectedSlot === `${day.date}-${s}` ? "border-primary bg-primary text-primary-foreground" : "text-primary border-primary/30 hover:bg-primary/10"
                                }`}>{s}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {!showAllSlots && (
                    <button onClick={() => setShowAllSlots(true)} className="text-xs text-primary font-medium mt-2 hover:underline">Voir plus de créneaux →</button>
                  )}
                </div>

                {/* STEP 2: Choose motif – no price/duration shown inline */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">2. Motif de consultation</p>
                  <div className="space-y-1.5">
                    {doctorData.motifs.map(m => (
                      <button key={m.name} onClick={() => setSelectedMotif(m.name)}
                        className={`w-full flex items-center justify-between text-left rounded-lg border p-3 text-xs transition-all ${
                          selectedMotif === m.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50"
                        }`}>
                        <p className="font-medium text-foreground">{m.name}</p>
                        {selectedMotif === m.name && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recap */}
                {selectedSlot && selectedMotif && (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 space-y-2">
                    <p className="text-xs font-semibold text-accent">Récapitulatif</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Motif</span><span className="font-medium text-foreground">{selectedMotif}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{selectedSlot.split("-")[0]}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Heure</span><span className="font-medium text-foreground">{selectedSlot.split("-").slice(1).join(":")}</span></div>
                    </div>
                  </div>
                )}

                <Link to="/booking/1">
                  <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-11" disabled={!selectedSlot || !selectedMotif}>
                    <Calendar className="h-4 w-4 mr-2" />Confirmer le rendez-vous
                  </Button>
                </Link>
                <p className="text-[10px] text-muted-foreground text-center">Prise en charge CNAM · Annulation gratuite 24h avant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPublicProfile;
