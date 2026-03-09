import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import GuestOtpFlow from "@/components/booking/GuestOtpFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockDoctorProfile } from "@/data/mockData";
import {
  MapPin, Clock, Shield, CheckCircle2, ChevronLeft, Video, Calendar, FileText, Pill, Activity, User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const doctor = {
  id: "1",
  name: mockDoctorProfile.name,
  specialty: mockDoctorProfile.specialty,
  address: mockDoctorProfile.address,
  initials: mockDoctorProfile.initials,
  motifs: mockDoctorProfile.motifs.map(m => ({ name: m.name, duration: m.duration, price: parseInt(m.price) })),
};

const generateSlots = () => {
  const s: string[] = [];
  for (let h = 8; h <= 17; h++) { s.push(`${h.toString().padStart(2, "0")}:00`); if (h < 17) s.push(`${h.toString().padStart(2, "0")}:30`); }
  return s;
};

const daysOfMonth = () => {
  const d: { day: number; name: string; available: boolean }[] = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  for (let i = 21; i <= 28; i++) {
    const date = new Date(2026, 1, i);
    d.push({ day: i, name: dayNames[date.getDay()], available: i !== 22 && i !== 25 });
  }
  return d;
};

type Step = "auth" | "motif" | "date" | "confirm" | "done" | "create-account";

const PublicBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("auth");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedMotif, setSelectedMotif] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");

  const slots = generateSlots();
  const days = daysOfMonth();

  const handleOtpVerified = (patientId: string, phone: string) => {
    setGuestPhone(phone);
    setStep("motif");
  };

  const handleConfirm = () => {
    // TODO BACKEND: POST /api/appointments/create
    // Store guest appointment in localStorage
    const guestAppointments = JSON.parse(localStorage.getItem("guestAppointments") || "[]");
    guestAppointments.push({
      id: `guest-${Date.now()}`,
      phone: guestPhone,
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: `${selectedDay} Fév 2026`,
      time: selectedSlot,
      motif: selectedMotif,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("guestAppointments", JSON.stringify(guestAppointments));
    
    toast({ title: "RDV confirmé !", description: `Votre rendez-vous avec ${doctor.name} est prévu le ${selectedDay} Février 2026 à ${selectedSlot}.` });
    setStep("done");
  };

  const isLoggedIn = !!localStorage.getItem("userRole") && localStorage.getItem("userRole") !== "guest";
  const isGuestSession = !!localStorage.getItem("guestPatientId");

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title={`Prendre RDV avec ${doctor.name} | Medicare`} description={`Prenez rendez-vous en ligne avec ${doctor.name}, ${doctor.specialty} à ${doctor.address}.`} />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to={`/doctor/${doctorId || 1}`} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline"><ChevronLeft className="h-4 w-4" />Retour au profil</Link>

        {/* Doctor mini card */}
        <div className="rounded-xl border bg-card p-4 shadow-card mb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{doctor.initials}</div>
            <div>
              <h2 className="font-bold text-foreground">{doctor.name}</h2>
              <p className="text-xs text-primary">{doctor.specialty}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{doctor.address}</p>
            </div>
          </div>
        </div>

        {/* Step: Auth */}
        {step === "auth" && !isLoggedIn && !isGuestSession && (
          <div className="space-y-4">
            <GuestOtpFlow onVerified={handleOtpVerified} />
            <div className="text-center text-sm text-muted-foreground">
              Déjà inscrit ? <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link>
            </div>
          </div>
        )}
        {step === "auth" && (isLoggedIn || isGuestSession) && (
          <div className="rounded-xl border bg-card p-5 shadow-card text-center">
            <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-medium text-foreground">Vous êtes connecté</p>
            <Button onClick={() => setStep("motif")} className="mt-3 gradient-primary text-primary-foreground">Continuer la réservation</Button>
          </div>
        )}

        {/* Step: Motif */}
        {step === "motif" && (
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-3">Quel est le motif de consultation ?</h3>
            <div className="space-y-2">
              {doctor.motifs.map(m => (
                <button key={m.name} onClick={() => setSelectedMotif(m.name)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${selectedMotif === m.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50"}`}>
                  <div className="flex items-center gap-2"><Clock className={`h-4 w-4 ${selectedMotif === m.name ? "text-primary" : "text-muted-foreground"}`} /><span className="text-sm font-medium">{m.name}</span></div>
                  {selectedMotif === m.name && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep("date")} disabled={!selectedMotif} className="w-full mt-4 gradient-primary text-primary-foreground">Continuer</Button>
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-3">Choisissez une date et un horaire</h3>
            <p className="text-sm text-muted-foreground mb-3">Février 2026</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map(d => (
                <button key={d.day} onClick={() => d.available && setSelectedDay(String(d.day))} disabled={!d.available}
                  className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${selectedDay === String(d.day) ? "border-primary bg-primary/5 ring-1 ring-primary" : !d.available ? "opacity-40 cursor-not-allowed" : "hover:border-primary/50"}`}>
                  <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
                  <span className={`text-base font-bold ${selectedDay === String(d.day) ? "text-primary" : "text-foreground"}`}>{d.day}</span>
                </button>
              ))}
            </div>
            {selectedDay && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Créneaux disponibles</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {slots.map(s => (
                    <button key={s} onClick={() => setSelectedSlot(s)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${selectedSlot === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50 text-foreground"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep("motif")}>Retour</Button>
              <Button onClick={() => setStep("confirm")} disabled={!selectedDay || !selectedSlot} className="flex-1 gradient-primary text-primary-foreground">Continuer</Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Praticien</span><span className="font-medium">{doctor.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Motif</span><span className="font-medium">{selectedMotif}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{selectedDay} Fév 2026 à {selectedSlot}</span></div>
              {guestPhone && <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span className="font-medium">{guestPhone}</span></div>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message (optionnel)</label>
              <Input placeholder="Précisez le motif si nécessaire..." value={message} onChange={e => setMessage(e.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("date")}>Retour</Button>
              <Button onClick={handleConfirm} className="flex-1 gradient-primary text-primary-foreground">Confirmer le rendez-vous</Button>
            </div>
          </div>
        )}

        {/* Step: Done - Show create account option */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 shadow-card text-center">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground">Rendez-vous confirmé !</h3>
              <p className="text-muted-foreground mt-2">Votre rendez-vous avec {doctor.name} est prévu le {selectedDay} Février 2026 à {selectedSlot}.</p>
              <p className="text-xs text-muted-foreground mt-1">Un SMS de confirmation a été envoyé.</p>
            </div>

            {/* Account creation prompt (for guest users) */}
            {!isLoggedIn && (
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 shadow-card">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><User className="h-5 w-5 text-primary" />Créer un compte Medicare</h4>
                <p className="text-sm text-muted-foreground mb-4">En créant un compte, vous bénéficiez de :</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Calendar className="h-4 w-4 text-accent" />Accès à tous vos rendez-vous</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><FileText className="h-4 w-4 text-accent" />Vos documents médicaux centralisés</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Pill className="h-4 w-4 text-accent" />Vos ordonnances numériques</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Activity className="h-4 w-4 text-accent" />Vos résultats d'analyses</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Shield className="h-4 w-4 text-accent" />Suivi des pharmacies</li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setStep("create-account")} className="gradient-primary text-primary-foreground">
                    <User className="h-4 w-4 mr-2" />Créer un compte
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
                    Plus tard
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/find-appointments"><Button variant="outline">Retrouver mes RDV</Button></Link>
              <Link to="/"><Button className="gradient-primary text-primary-foreground">Retour à l'accueil</Button></Link>
            </div>
          </div>
        )}

        {/* Step: Create Account (simple form) */}
        {step === "create-account" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Créer votre compte</h3>
            <p className="text-sm text-muted-foreground">Complétez vos informations pour finaliser votre inscription.</p>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Prénom</label><Input placeholder="Votre prénom" className="mt-1" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Nom</label><Input placeholder="Votre nom" className="mt-1" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Email</label><Input type="email" placeholder="votre@email.tn" className="mt-1" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Mot de passe</label><Input type="password" placeholder="Choisissez un mot de passe" className="mt-1" /></div>
            </div>
            <p className="text-[11px] text-muted-foreground">Le téléphone {guestPhone} sera associé à votre compte.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("done")}>Retour</Button>
              <Button 
                onClick={() => {
                  // TODO BACKEND: POST /api/auth/register
                  localStorage.setItem("userRole", "patient");
                  localStorage.removeItem("guestPatientId");
                  toast({ title: "Compte créé !", description: "Bienvenue sur Medicare." });
                  navigate("/dashboard/patient/appointments");
                }} 
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Créer mon compte
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
