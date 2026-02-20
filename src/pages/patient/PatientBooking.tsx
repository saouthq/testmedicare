import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar, ChevronLeft, ChevronRight, MapPin, Star, Clock, CheckCircle2,
  ArrowLeft, User, Shield, Video, Upload, FileText, Users, Plus, AlertTriangle,
  CalendarPlus, MessageSquare
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const doctor = {
  id: "1",
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  rating: 4.8,
  reviews: 234,
  avatar: "AB",
  languages: ["Français", "Arabe"],
  cnam: true,
  teleconsultation: true,
  cancellationPolicy: "Annulation gratuite jusqu'à 24h avant le RDV",
  autoConfirm: true,
  motifs: [
    { name: "Consultation générale", duration: "30 min", price: 35 },
    { name: "Renouvellement d'ordonnance", duration: "15 min", price: 25 },
    { name: "Suivi maladie chronique", duration: "20 min", price: 30 },
    { name: "Certificat médical", duration: "15 min", price: 20 },
    { name: "Première consultation", duration: "45 min", price: 50 },
    { name: "Vaccination", duration: "15 min", price: 25 },
    { name: "Résultat d'analyses", duration: "20 min", price: 25 },
  ],
  lieux: [
    { name: "Cabinet El Manar", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", type: "cabinet" },
    { name: "Téléconsultation", address: "Consultation vidéo sécurisée", type: "teleconsultation" },
  ],
};

const profiles = [
  { id: "me", name: "Moi-même", relation: "", avatar: "JD" },
  { id: "child1", name: "Yassine Dridi", relation: "Fils · 8 ans", avatar: "YD" },
];

const weekDays = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21"];
const availableSlots: Record<string, { time: string; remaining: number }[]> = {
  "Lun 17": [
    { time: "09:00", remaining: 1 }, { time: "09:30", remaining: 3 }, { time: "10:30", remaining: 2 },
    { time: "11:00", remaining: 1 }, { time: "14:00", remaining: 4 }, { time: "14:30", remaining: 1 },
    { time: "16:00", remaining: 2 },
  ],
  "Mar 18": [
    { time: "08:30", remaining: 3 }, { time: "09:00", remaining: 2 }, { time: "10:00", remaining: 1 },
    { time: "11:30", remaining: 4 }, { time: "15:00", remaining: 2 }, { time: "15:30", remaining: 1 },
  ],
  "Mer 19": [
    { time: "09:00", remaining: 2 }, { time: "09:30", remaining: 1 }, { time: "11:00", remaining: 3 },
    { time: "14:00", remaining: 2 }, { time: "14:30", remaining: 1 },
  ],
  "Jeu 20": [
    { time: "08:00", remaining: 4 }, { time: "10:00", remaining: 2 }, { time: "10:30", remaining: 1 },
    { time: "11:00", remaining: 3 }, { time: "14:30", remaining: 2 }, { time: "15:00", remaining: 1 },
    { time: "16:00", remaining: 2 }, { time: "16:30", remaining: 1 },
  ],
  "Ven 21": [
    { time: "09:30", remaining: 3 }, { time: "10:00", remaining: 2 }, { time: "14:00", remaining: 1 },
    { time: "15:00", remaining: 2 },
  ],
};

type Step = "patient" | "motif" | "lieu" | "slot" | "confirm" | "done" | "conflict" | "waitlist";

const steps = [
  { key: "patient", label: "Patient" },
  { key: "motif", label: "Motif" },
  { key: "lieu", label: "Lieu" },
  { key: "slot", label: "Créneau" },
  { key: "confirm", label: "Confirmation" },
];

const PatientBooking = () => {
  const { doctorId } = useParams();
  const [step, setStep] = useState<Step>("patient");
  const [selectedProfile, setSelectedProfile] = useState("me");
  const [selectedMotif, setSelectedMotif] = useState("");
  const [selectedLieu, setSelectedLieu] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [showAddProfile, setShowAddProfile] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const selectedMotifData = doctor.motifs.find(m => m.name === selectedMotif);
  const selectedLieuData = doctor.lieux.find(l => l.name === selectedLieu);

  const goBack = () => {
    const order: Step[] = ["patient", "motif", "lieu", "slot", "confirm"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  return (
    <DashboardLayout role="patient" title="Prendre rendez-vous">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Doctor header */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <div className="flex items-start gap-3 sm:gap-4">
            <Link to={`/doctor/${doctorId || 1}`}>
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shrink-0 hover:opacity-90 transition-opacity">{doctor.avatar}</div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{doctor.name}</h2>
                {doctor.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
              </div>
              <p className="text-primary font-medium text-sm">{doctor.specialty}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{doctor.address}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{doctor.rating} ({doctor.reviews} avis)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        {step !== "done" && step !== "conflict" && step !== "waitlist" && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  i < currentStepIndex ? "bg-accent text-accent-foreground" : i === currentStepIndex ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${i === currentStepIndex ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`w-6 sm:w-12 h-px ${i < currentStepIndex ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Choose patient */}
        {step === "patient" && (
          <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-1">Pour qui est ce rendez-vous ?</h3>
            <p className="text-sm text-muted-foreground mb-5">Sélectionnez le patient ou ajoutez un proche.</p>
            <div className="space-y-3">
              {profiles.map(p => (
                <button key={p.id} onClick={() => setSelectedProfile(p.id)}
                  className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    selectedProfile === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"
                  }`}>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    selectedProfile === p.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{p.avatar}</div>
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.relation && <p className="text-xs text-muted-foreground">{p.relation}</p>}
                  </div>
                  {selectedProfile === p.id && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                </button>
              ))}
              <button onClick={() => setShowAddProfile(!showAddProfile)}
                className="w-full flex items-center gap-4 rounded-xl border border-dashed p-4 text-left text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center"><Plus className="h-5 w-5" /></div>
                <p className="font-medium">Ajouter un proche</p>
              </button>
              {showAddProfile && (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Prénom</label><Input placeholder="Prénom" className="mt-1 h-9" /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">Nom</label><Input placeholder="Nom" className="mt-1 h-9" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Lien de parenté</label>
                      <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm h-9">
                        <option>Enfant</option><option>Conjoint(e)</option><option>Parent</option><option>Autre</option>
                      </select>
                    </div>
                    <div><label className="text-xs font-medium text-muted-foreground">Date de naissance</label><Input type="date" className="mt-1 h-9" /></div>
                  </div>
                  <Button size="sm" className="gradient-primary text-primary-foreground">Ajouter</Button>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => setStep("motif")}>Continuer</Button>
            </div>
          </div>
        )}

        {/* Step 2: Choose motif */}
        {step === "motif" && (
          <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" />Retour</button>
            <h3 className="text-lg font-semibold text-foreground mb-1">Quel est le motif de votre consultation ?</h3>
            <p className="text-sm text-muted-foreground mb-5">La durée et le tarif s'adaptent automatiquement.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {doctor.motifs.map(m => (
                <button key={m.name} onClick={() => setSelectedMotif(m.name)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedMotif === m.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${selectedMotif === m.name ? "text-primary" : "text-foreground"}`}>{m.name}</p>
                    {selectedMotif === m.name && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.duration}</span>
                    <span className="font-semibold text-primary">{m.price} DT</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!selectedMotif} onClick={() => setStep("lieu")}>Continuer</Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose lieu */}
        {step === "lieu" && (
          <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" />Retour</button>
            <h3 className="text-lg font-semibold text-foreground mb-1">Où souhaitez-vous consulter ?</h3>
            <p className="text-sm text-muted-foreground mb-5">Choisissez le cabinet ou la téléconsultation.</p>
            <div className="space-y-3">
              {doctor.lieux.map(l => (
                <button key={l.name} onClick={() => setSelectedLieu(l.name)}
                  className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    selectedLieu === l.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"
                  }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    l.type === "teleconsultation" ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {l.type === "teleconsultation" ? <Video className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${selectedLieu === l.name ? "text-primary" : "text-foreground"}`}>{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.address}</p>
                  </div>
                  {selectedLieu === l.name && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!selectedLieu} onClick={() => setStep("slot")}>Continuer</Button>
            </div>
          </div>
        )}

        {/* Step 4: Choose slot */}
        {step === "slot" && (
          <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Retour</button>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                <h3 className="text-sm sm:text-lg font-semibold text-foreground">Semaine du 17 Février</h3>
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {weekDays.map(day => {
                const daySlots = availableSlots[day] || [];
                return (
                  <div key={day} className="text-center">
                    <p className="text-sm font-medium text-foreground mb-3 pb-2 border-b">{day}</p>
                    <div className="space-y-2">
                      {daySlots.map(slot => (
                        <button key={`${day}-${slot.time}`} onClick={() => { setSelectedDay(day); setSelectedSlot(slot.time); }}
                          className={`w-full rounded-lg border py-2 text-sm transition-all relative ${
                            selectedDay === day && selectedSlot === slot.time
                              ? "border-primary bg-primary text-primary-foreground font-medium"
                              : "border-border text-foreground hover:border-primary hover:bg-primary/5"
                          }`}>
                          {slot.time}
                          {slot.remaining <= 2 && (
                            <span className={`block text-[9px] mt-0.5 ${
                              selectedDay === day && selectedSlot === slot.time ? "text-primary-foreground/70" : "text-warning"
                            }`}>
                              {slot.remaining === 1 ? "Dernière place" : `${slot.remaining} places`}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <button className="text-xs text-primary hover:underline font-medium">Aucun créneau ne vous convient ? Rejoindre la liste d'attente →</button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!selectedSlot} onClick={() => setStep("confirm")}>Continuer</Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === "confirm" && (
          <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Retour</button>
            <h3 className="text-lg font-semibold text-foreground mb-6">Confirmez votre rendez-vous</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary shrink-0" /><div><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground">{profiles.find(p => p.id === selectedProfile)?.name}</p></div></div>
                <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary shrink-0" /><div><p className="text-xs text-muted-foreground">Praticien</p><p className="text-sm font-medium text-foreground">{doctor.name} — {doctor.specialty}</p></div></div>
                <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary shrink-0" /><div><p className="text-xs text-muted-foreground">Date et heure</p><p className="text-sm font-medium text-foreground">{selectedDay} Février 2026 à {selectedSlot}</p></div></div>
                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary shrink-0" /><div><p className="text-xs text-muted-foreground">Motif · Durée</p><p className="text-sm font-medium text-foreground">{selectedMotif} · {selectedMotifData?.duration}</p></div></div>
                <div className="flex items-center gap-3">
                  {selectedLieuData?.type === "teleconsultation" ? <Video className="h-5 w-5 text-primary shrink-0" /> : <MapPin className="h-5 w-5 text-primary shrink-0" />}
                  <div><p className="text-xs text-muted-foreground">Lieu</p><p className="text-sm font-medium text-foreground">{selectedLieu}</p></div>
                </div>
                <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary shrink-0" /><div><p className="text-xs text-muted-foreground">Tarif</p><p className="text-sm font-medium text-foreground">{selectedMotifData?.price} DT · Prise en charge CNAM</p></div></div>
              </div>

              {/* Optional: message */}
              <div>
                <label className="text-sm font-medium text-foreground">Message au médecin (optionnel)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Décrivez brièvement votre motif de consultation..." className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {/* Optional: documents */}
              <div>
                <label className="text-sm font-medium text-foreground">Documents à joindre (optionnel)</label>
                <p className="text-xs text-muted-foreground mt-0.5">Ordonnance, résultats d'analyses, photo...</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all">
                    <Upload className="h-4 w-4" />Ajouter un document
                  </button>
                  {documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2 text-xs">
                      <FileText className="h-3.5 w-3.5 text-primary" />{d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Important info */}
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-foreground"><strong>Important :</strong> Merci de vous présenter 10 minutes avant l'heure de votre rendez-vous avec votre carte CNAM et votre carte d'identité.</p>
                <p className="text-xs text-muted-foreground mt-2">📋 {doctor.cancellationPolicy}</p>
                {doctor.autoConfirm && <p className="text-xs text-accent mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ce médecin confirme automatiquement les RDV</p>}
              </div>

              <div className="flex items-center gap-2"><input type="checkbox" id="sms" className="rounded border-input" defaultChecked /><label htmlFor="sms" className="text-sm text-muted-foreground">Recevoir un rappel par SMS (+216)</label></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="email" className="rounded border-input" defaultChecked /><label htmlFor="email" className="text-sm text-muted-foreground">Recevoir un rappel par email</label></div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={goBack}>Modifier</Button>
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow h-11" onClick={() => setStep("done")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Confirmer le rendez-vous
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === "done" && (
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-accent" /></div>
            <h3 className="text-xl font-bold text-foreground">Rendez-vous {doctor.autoConfirm ? "confirmé" : "en attente de confirmation"} !</h3>
            <p className="mt-2 text-muted-foreground">Votre rendez-vous avec {doctor.name} est prévu le {selectedDay} Février 2026 à {selectedSlot}.</p>
            <p className="mt-1 text-sm text-muted-foreground">Un SMS de confirmation a été envoyé à votre numéro +216.</p>
            
            <div className="mt-6 rounded-xl bg-muted/50 p-4 max-w-md mx-auto text-left space-y-2 text-sm">
              <p className="font-medium text-foreground">📍 Préparez votre RDV :</p>
              <ul className="space-y-1.5 text-muted-foreground text-xs">
                <li>• Apportez votre carte CNAM et votre pièce d'identité</li>
                <li>• Préparez vos ordonnances / résultats récents</li>
                <li>• Arrivez 10 minutes à l'avance</li>
                {selectedLieuData?.type === "teleconsultation" && <li>• Vérifiez votre connexion internet et caméra</li>}
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" className="flex items-center gap-2"><CalendarPlus className="h-4 w-4" />Ajouter au calendrier</Button>
              <Link to="/dashboard/patient/appointments"><Button variant="outline">Voir mes RDV</Button></Link>
              <Link to="/dashboard/patient"><Button className="gradient-primary text-primary-foreground">Retour au tableau de bord</Button></Link>
            </div>
          </div>
        )}

        {/* Conflict state */}
        {step === "conflict" && (
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-4"><AlertTriangle className="h-8 w-8 text-warning" /></div>
            <h3 className="text-xl font-bold text-foreground">Créneau indisponible</h3>
            <p className="mt-2 text-muted-foreground">Le créneau que vous avez sélectionné a été pris entre-temps. Voici des alternatives :</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["14:30", "15:00", "16:00"].map(s => (
                <button key={s} onClick={() => { setSelectedSlot(s); setStep("confirm"); }}
                  className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  {selectedDay} à {s}
                </button>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setStep("slot")}>Choisir un autre créneau</Button>
          </div>
        )}

        {/* Waitlist state */}
        {step === "waitlist" && (
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Clock className="h-8 w-8 text-primary" /></div>
            <h3 className="text-xl font-bold text-foreground">Inscrit sur la liste d'attente</h3>
            <p className="mt-2 text-muted-foreground">Vous serez notifié par SMS dès qu'un créneau se libère chez {doctor.name}.</p>
            <p className="mt-1 text-xs text-muted-foreground">Position dans la file : <span className="font-semibold text-primary">3ème</span></p>
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
