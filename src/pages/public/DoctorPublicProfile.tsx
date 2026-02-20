import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, MapPin, Phone, Star, Clock, CreditCard, Shield, Calendar, ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Globe, Award } from "lucide-react";

const doctorData = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  photo: null,
  initials: "AB",
  rating: 4.8,
  reviewCount: 127,
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  convention: "Conventionné Secteur 1",
  price: "35 DT",
  languages: ["Français", "Arabe"],
  experience: "15 ans d'expérience",
  diplomas: ["Doctorat en Médecine - Faculté de Médecine de Tunis (2010)", "DU Diabétologie - Université de Tunis (2012)"],
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis. Je vous accueille dans mon cabinet à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé et vaccinations. Conventionné CNAM.",
  horaires: [
    { day: "Lundi", hours: "08:00 - 12:00 / 14:00 - 18:00" },
    { day: "Mardi", hours: "08:00 - 12:00 / 14:00 - 18:00" },
    { day: "Mercredi", hours: "08:00 - 12:00" },
    { day: "Jeudi", hours: "08:00 - 12:00 / 14:00 - 18:00" },
    { day: "Vendredi", hours: "08:00 - 12:00 / 14:00 - 17:00" },
    { day: "Samedi", hours: "Fermé" },
    { day: "Dimanche", hours: "Fermé" },
  ],
  motifs: ["Consultation générale", "Suivi diabète", "Suivi hypertension", "Certificat médical", "Bilan de santé", "Vaccination"],
  teleconsultation: true,
};

const availableSlots = [
  { date: "Jeu. 20 Fév", slots: ["09:00", "09:30", "10:00", "11:00", "14:30", "15:00", "16:00"] },
  { date: "Ven. 21 Fév", slots: ["08:30", "09:00", "10:30", "11:00"] },
  { date: "Lun. 24 Fév", slots: ["08:00", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "16:00", "16:30"] },
  { date: "Mar. 25 Fév", slots: ["08:30", "10:00", "11:00", "14:30", "15:30"] },
];

const reviews = [
  { author: "Amine B.", rating: 5, date: "10 Fév 2026", text: "Très bon médecin, à l'écoute et professionnel. Je recommande." },
  { author: "Fatma T.", rating: 5, date: "5 Fév 2026", text: "Ponctuel et efficace. Explique bien les traitements." },
  { author: "Mohamed S.", rating: 4, date: "28 Jan 2026", text: "Bon suivi médical, cabinet propre et moderne." },
];

const DoctorPublicProfile = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MediConnect</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="outline" size="sm">Se connecter</Button></Link>
            <Link to="/register"><Button size="sm" className="gradient-primary text-primary-foreground">S'inscrire</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/dashboard/patient/search" className="flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
          <ChevronLeft className="h-4 w-4" />Retour aux résultats
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor card */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
                  {doctorData.initials}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{doctorData.name}</h1>
                  <p className="text-primary font-medium">{doctorData.specialty}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold text-foreground">{doctorData.rating}</span>
                      <span className="text-xs text-muted-foreground">({doctorData.reviewCount} avis)</span>
                    </div>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="h-3 w-3" />{doctorData.convention}</span>
                    {doctorData.teleconsultation && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">📹 Téléconsultation</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{doctorData.address}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CreditCard className="h-4 w-4" />{doctorData.price}</span>
                    <span className="flex items-center gap-1"><Award className="h-4 w-4" />{doctorData.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Presentation */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Présentation</h3>
              <p className="text-sm text-foreground leading-relaxed">{doctorData.presentation}</p>
            </div>

            {/* Diplomas */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Formation</h3>
              <ul className="space-y-2">
                {doctorData.diplomas.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0" />{d}</li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="h-4 w-4" />Langues parlées</h3>
              <div className="flex gap-2">{doctorData.languages.map(l => <span key={l} className="text-sm bg-muted px-3 py-1 rounded-full text-foreground">{l}</span>)}</div>
            </div>

            {/* Horaires */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="h-4 w-4" />Horaires d'ouverture</h3>
              <div className="space-y-2">
                {doctorData.horaires.map((h, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 text-sm ${h.hours === "Fermé" ? "text-muted-foreground" : "text-foreground"}`}>
                    <span className="font-medium">{h.day}</span>
                    <span>{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avis */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4" />Avis patients ({doctorData.reviewCount})</h3>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{r.author}</span>
                        <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-warning text-warning" />)}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Prendre rendez-vous</h3>

              {/* Motif */}
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Motif de consultation</p>
                <div className="flex flex-wrap gap-1.5">
                  {doctorData.motifs.map(m => (
                    <button key={m} onClick={() => setSelectedMotif(m)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedMotif === m ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/50"}`}>{m}</button>
                  ))}
                </div>
              </div>

              {/* Available slots */}
              <div className="space-y-4">
                {availableSlots.map((day, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-foreground mb-2">{day.date}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {day.slots.map(s => (
                        <button key={s} onClick={() => setSelectedSlot(`${day.date}-${s}`)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${selectedSlot === `${day.date}-${s}` ? "border-primary bg-primary text-primary-foreground" : "text-primary border-primary/30 hover:bg-primary/10"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6 gradient-primary text-primary-foreground shadow-primary-glow h-11" disabled={!selectedSlot || !selectedMotif}>
                <Calendar className="h-4 w-4 mr-2" />Confirmer le rendez-vous
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">Prise en charge CNAM possible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPublicProfile;
