import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Star, Clock, CheckCircle2, ArrowLeft, User, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const doctor = {
  name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste",
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis", rating: 4.8, reviews: 234,
  avatar: "AB", consultationPrice: 35, languages: ["Français", "Arabe"], cnam: true,
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis. Spécialisé dans le suivi des maladies chroniques et la médecine préventive. Conventionné CNAM.",
};

const motifs = ["Consultation générale", "Renouvellement d'ordonnance", "Suivi maladie chronique", "Certificat médical", "Vaccination", "Première consultation", "Résultat d'analyses"];

const weekDays = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21"];
const availableSlots: Record<string, string[]> = {
  "Lun 17": ["09:00", "09:30", "10:30", "11:00", "14:00", "14:30", "16:00"],
  "Mar 18": ["08:30", "09:00", "10:00", "11:30", "15:00", "15:30", "16:30"],
  "Mer 19": ["09:00", "09:30", "11:00", "14:00", "14:30"],
  "Jeu 20": ["08:00", "10:00", "10:30", "11:00", "14:30", "15:00", "16:00", "16:30"],
  "Ven 21": ["09:30", "10:00", "14:00", "15:00"],
};

type Step = "motif" | "slot" | "confirm" | "done";

const PatientBooking = () => {
  const [step, setStep] = useState<Step>("motif");
  const [selectedMotif, setSelectedMotif] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  return (
    <DashboardLayout role="patient" title="Prendre rendez-vous">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">{doctor.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{doctor.name}</h2>
                {doctor.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
              </div>
              <p className="text-primary font-medium">{doctor.specialty}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{doctor.address}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{doctor.rating} ({doctor.reviews} avis)</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{doctor.presentation}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm font-medium text-foreground">Tarif : {doctor.consultationPrice} DT</span>
                <span className="text-sm text-muted-foreground">Langues : {doctor.languages.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {["Motif", "Créneau", "Confirmation"].map((label, i) => {
            const currentIndex = step === "motif" ? 0 : step === "slot" ? 1 : step === "confirm" ? 2 : 3;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${i < currentIndex ? "bg-accent text-accent-foreground" : i === currentIndex ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === currentIndex ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className="w-12 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {step === "motif" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quel est le motif de votre consultation ?</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {motifs.map((m) => (
                <button key={m} onClick={() => setSelectedMotif(m)}
                  className={`rounded-lg border p-4 text-left text-sm transition-all ${selectedMotif === m ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!selectedMotif} onClick={() => setStep("slot")}>Continuer</Button>
            </div>
          </div>
        )}

        {step === "slot" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setStep("motif")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Retour</button>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <h3 className="text-lg font-semibold text-foreground">Semaine du 17 Février</h3>
                <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {weekDays.map((day) => (
                <div key={day} className="text-center">
                  <p className="text-sm font-medium text-foreground mb-3 pb-2 border-b">{day}</p>
                  <div className="space-y-2">
                    {(availableSlots[day] || []).map((slot) => (
                      <button key={`${day}-${slot}`} onClick={() => { setSelectedDay(day); setSelectedSlot(slot); }}
                        className={`w-full rounded-lg border py-2 text-sm transition-all ${selectedDay === day && selectedSlot === slot ? "border-primary bg-primary text-primary-foreground font-medium" : "border-border text-foreground hover:border-primary hover:bg-primary/5"}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!selectedSlot} onClick={() => setStep("confirm")}>Continuer</Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <button onClick={() => setStep("slot")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Retour</button>
            <h3 className="text-lg font-semibold text-foreground mb-6">Confirmez votre rendez-vous</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Praticien</p><p className="font-medium text-foreground">{doctor.name} — {doctor.specialty}</p></div></div>
                <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Date et heure</p><p className="font-medium text-foreground">{selectedDay} Février 2026 à {selectedSlot}</p></div></div>
                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Motif</p><p className="font-medium text-foreground">{selectedMotif}</p></div></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Lieu</p><p className="font-medium text-foreground">{doctor.address}</p></div></div>
                <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Tarif</p><p className="font-medium text-foreground">{doctor.consultationPrice} DT · Prise en charge CNAM</p></div></div>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-foreground"><strong>Important :</strong> Merci de vous présenter 10 minutes avant l'heure de votre rendez-vous avec votre carte CNAM et votre carte d'identité.</p>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="sms" className="rounded border-input" defaultChecked /><label htmlFor="sms" className="text-sm text-muted-foreground">Recevoir un rappel par SMS (+216)</label></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="email" className="rounded border-input" defaultChecked /><label htmlFor="email" className="text-sm text-muted-foreground">Recevoir un rappel par email</label></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("slot")}>Modifier</Button>
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => setStep("done")}>Confirmer le rendez-vous</Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="rounded-xl border bg-card p-8 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-accent" /></div>
            <h3 className="text-xl font-bold text-foreground">Rendez-vous confirmé !</h3>
            <p className="mt-2 text-muted-foreground">Votre rendez-vous avec {doctor.name} est confirmé pour le {selectedDay} Février 2026 à {selectedSlot}.</p>
            <p className="mt-1 text-sm text-muted-foreground">Un SMS de confirmation a été envoyé à votre numéro +216.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/dashboard/patient/appointments"><Button variant="outline">Voir mes RDV</Button></Link>
              <Link to="/dashboard/patient"><Button className="gradient-primary text-primary-foreground">Retour au tableau de bord</Button></Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientBooking;
