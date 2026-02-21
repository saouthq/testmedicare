import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar, ChevronLeft, ChevronRight, MapPin, Star, Clock, CheckCircle2,
  Shield, Video, Upload, FileText, Plus, AlertTriangle,
  CalendarPlus, Edit3 } from
"lucide-react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";

const doctor = {
  id: "1",
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  rating: 4.8,
  reviews: 234,
  avatar: "AB",
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
  { name: "Résultat d'analyses", duration: "20 min", price: 25 }],

  lieux: [
  { name: "Cabinet El Manar", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", type: "cabinet" },
  { name: "Téléconsultation", address: "Consultation vidéo sécurisée", type: "teleconsultation" }]

};

const profiles = [
{ id: "me", name: "Moi-même", relation: "", avatar: "JD" },
{ id: "child1", name: "Yassine Dridi", relation: "Fils · 8 ans", avatar: "YD" }];


const generateSlots = () => {
  const slots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 17) slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const daysOfMonth = () => {
  const days: {day: number;name: string;available: boolean;}[] = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  for (let d = 21; d <= 28; d++) {
    const date = new Date(2026, 1, d);
    days.push({ day: d, name: dayNames[date.getDay()], available: d !== 22 && d !== 25 });
  }
  return days;
};

type MainStep = 1 | 2 | 3 | 4 | 5;
type FinalState = "done" | "conflict" | "waitlist" | null;

const stepLabels = ["Patient", "Motif", "Date", "Lieu", "Confirmation"];

const PatientBooking = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preDate = searchParams.get("date") || "";
  const preTime = searchParams.get("time") || "";
  const preMotif = searchParams.get("motif") || "";

  const [currentStep, setCurrentStep] = useState<MainStep>(preMotif ? preDate ? preTime ? 5 : 3 : 2 : 1);
  const [finalState, setFinalState] = useState<FinalState>(null);

  const [selectedProfile, setSelectedProfile] = useState("me");
  const [selectedMotif, setSelectedMotif] = useState(preMotif);
  const [selectedLieu, setSelectedLieu] = useState(doctor.lieux[0].name);
  const [selectedDay, setSelectedDay] = useState(preDate || "24");
  const [selectedSlot, setSelectedSlot] = useState(preTime);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [showAddProfile, setShowAddProfile] = useState(false);

  const selectedMotifData = doctor.motifs.find((m) => m.name === selectedMotif);
  const selectedLieuData = doctor.lieux.find((l) => l.name === selectedLieu);
  const slots = generateSlots();
  const days = daysOfMonth();

  const canGoNext = () => {
    if (currentStep === 1) return !!selectedProfile;
    if (currentStep === 2) return !!selectedMotif;
    if (currentStep === 3) return !!selectedDay && !!selectedSlot;
    if (currentStep === 4) return !!selectedLieu;
    return true;
  };

  const handleConfirm = () => {
    setFinalState("done");
  };

  // Final states (done, conflict, waitlist)
  if (finalState) {
    return (
      <DashboardLayout role="patient" title="Prendre rendez-vous">
        <div className="max-w-2xl mx-auto space-y-5">
          {finalState === "done" &&
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
          }
          {finalState === "conflict" &&
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-4"><AlertTriangle className="h-8 w-8 text-warning" /></div>
              <h3 className="text-xl font-bold text-foreground">Créneau indisponible</h3>
              <p className="mt-2 text-muted-foreground">Le créneau sélectionné a été pris. Voici des alternatives :</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["14:30", "15:00", "16:00"].map((s) =>
              <button key={s} onClick={() => {setSelectedSlot(s);setFinalState(null);setCurrentStep(5);}}
              className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    {selectedDay} à {s}
                  </button>
              )}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => {setFinalState(null);setCurrentStep(3);}}>Choisir un autre créneau</Button>
            </div>
          }
          {finalState === "waitlist" &&
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
          }
        </div>
      </DashboardLayout>);

  }

  return (
    <DashboardLayout role="patient" title="Prendre rendez-vous">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Doctor header */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Link to={`/doctor/${doctorId || 1}`}>
              <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-base shrink-0 hover:opacity-90 transition-opacity">{doctor.avatar}</div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground">{doctor.name}</h2>
                {doctor.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
              </div>
              <p className="text-primary font-medium text-xs">{doctor.specialty}</p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="h-3 w-3" />{doctor.address}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{doctor.rating} ({doctor.reviews} avis)</span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1 as MainStep;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            return (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => stepNum < currentStep && setCurrentStep(stepNum)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive ? "gradient-primary text-primary-foreground shadow-primary-glow" :
                  isDone ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"} ${
                  isDone ? "cursor-pointer hover:opacity-80" : ""}`}>

                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                </button>
                {i < stepLabels.length - 1 &&
                <div className={`w-8 h-0.5 ${stepNum < currentStep ? "bg-primary" : "bg-muted"}`} />
                }
              </div>);

          })}
        </div>

        {/* Step 1: Patient */}
        {currentStep === 1 &&
        <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">Pour qui est ce rendez-vous ?</h3>
            <p className="text-sm text-muted-foreground mt-1">Sélectionnez le patient ou ajoutez un proche.</p>
            <div className="mt-4 space-y-2">
              {profiles.map((p) =>
            <button key={p.id} onClick={() => setSelectedProfile(p.id)}
            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
            selectedProfile === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"}`
            }>
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              selectedProfile === p.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
              }>{p.avatar}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{p.name}</p>
                    {p.relation && <p className="text-xs text-muted-foreground">{p.relation}</p>}
                  </div>
                  {selectedProfile === p.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </button>
            )}
              <button onClick={() => setShowAddProfile(!showAddProfile)}
            className="w-full flex items-center gap-3 rounded-xl border border-dashed p-3 text-left text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                <div className="h-11 w-11 rounded-full bg-muted/50 flex items-center justify-center"><Plus className="h-4 w-4" /></div>
                <p className="font-medium text-sm">Ajouter un proche</p>
              </button>
              {showAddProfile &&
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
            }
            </div>
          </div>
        }

        {/* Step 2: Motif */}
        {currentStep === 2 &&
        <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">Quel est le motif de consultation ?</h3>
            <p className="text-sm text-muted-foreground mt-1">Choisissez le motif adapté à votre besoin.</p>
            <div className="mt-4 space-y-2">
              {doctor.motifs.map((m) =>
            <button key={m.name} onClick={() => setSelectedMotif(m.name)}
            className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
            selectedMotif === m.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"}`
            }>
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 shrink-0 ${selectedMotif === m.name ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-medium text-sm text-foreground">{m.name}</p>
                  </div>
                  {selectedMotif === m.name && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
            )}
            </div>
          </div>
        }

        {/* Step 3: Date & Time */}
        {currentStep === 3 &&
        <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">Choisissez une date et un horaire</h3>
            <p className="text-sm text-muted-foreground mt-1">Sélectionnez le créneau qui vous convient.</p>

            {/* Days */}
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Février 2026</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((d) =>
              <button key={d.day} onClick={() => d.available && setSelectedDay(String(d.day))}
              disabled={!d.available}
              className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${
              selectedDay === String(d.day) ? "border-primary bg-primary/5 ring-1 ring-primary" :
              !d.available ? "opacity-40 cursor-not-allowed" :
              "hover:border-primary/50"}`
              }>
                    <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
                    <span className={`text-base font-bold ${selectedDay === String(d.day) ? "text-primary" : "text-foreground"}`}>{d.day}</span>
                    {d.available && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
                  </button>
              )}
              </div>
            </div>

            {/* Slots */}
            {selectedDay &&
          <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Créneaux disponibles</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {slots.map((s) =>
              <button key={s} onClick={() => setSelectedSlot(s)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              selectedSlot === s ? "border-primary bg-primary text-primary-foreground" :
              "hover:border-primary/50 text-foreground"}`
              }>{s}</button>
              )}
                </div>
              </div>
          }
          </div>
        }

        {/* Step 4: Lieu */}
        {currentStep === 4 &&
        <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">Où souhaitez-vous consulter ?</h3>
            <p className="text-sm text-muted-foreground mt-1">Choisissez le lieu de consultation.</p>
            <div className="mt-4 space-y-2">
              {doctor.lieux.map((l) =>
            <button key={l.name} onClick={() => setSelectedLieu(l.name)}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
            selectedLieu === l.name ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/30"}`
            }>
                  {l.type === "teleconsultation" ? <Video className={`h-5 w-5 shrink-0 ${selectedLieu === l.name ? "text-primary" : "text-muted-foreground"}`} /> : <MapPin className={`h-5 w-5 shrink-0 ${selectedLieu === l.name ? "text-primary" : "text-muted-foreground"}`} />}
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.address}</p>
                  </div>
                  {selectedLieu === l.name && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </button>
            )}
            </div>
          </div>
        }

        {/* Step 5: Confirmation */}
        {currentStep === 5 &&
        <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Récapitulatif du rendez-vous</h3>

            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date et heure</p>
                    <p className="text-sm font-medium text-foreground">{selectedDay} Février 2026 à {selectedSlot}</p>
                  </div>
                </div>
                <button onClick={() => setCurrentStep(3)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"><Edit3 className="h-3 w-3" />Changer</button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Motif · Durée</p>
                    <p className="text-sm font-medium text-foreground">{selectedMotif} {selectedMotifData ? `· ${selectedMotifData.duration}` : ""}</p>
                  </div>
                </div>
                <button onClick={() => setCurrentStep(2)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"><Edit3 className="h-3 w-3" />Changer</button>
              </div>

              <div className="flex items-center gap-3">
                {selectedLieuData?.type === "teleconsultation" ? <Video className="h-5 w-5 text-primary shrink-0" /> : <MapPin className="h-5 w-5 text-primary shrink-0" />}
                <div>
                  <p className="text-xs text-muted-foreground">Lieu</p>
                  <p className="text-sm font-medium text-foreground">{selectedLieu}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tarif</p>
                  <p className="text-sm font-medium text-foreground">{selectedMotifData?.price || "—"} DT · Prise en charge CNAM</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-5">
              <label className="text-sm font-medium text-foreground">Message au médecin (optionnel)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Décrivez brièvement votre motif de consultation..." className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            {/* Documents */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">Documents à joindre (optionnel)</label>
              <p className="text-xs text-muted-foreground mt-0.5">Ordonnance, résultats d'analyses, photo...</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  <Upload className="h-4 w-4" />Ajouter un document
                </button>
                {documents.map((d, i) =>
              <div key={i} className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-primary" />{d}
                  </div>
              )}
              </div>
            </div>

            {/* Important info */}
            <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="text-sm text-foreground"><strong>Important :</strong> Merci de vous présenter 10 minutes avant l'heure de votre rendez-vous avec votre carte CNAM et votre carte d'identité.</p>
              <p className="text-xs text-muted-foreground mt-2">📋 {doctor.cancellationPolicy}</p>
              {doctor.autoConfirm && <p className="text-xs text-accent mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ce médecin confirme automatiquement les RDV</p>}
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2"><input type="checkbox" id="sms" className="rounded border-input" defaultChecked /><label htmlFor="sms" className="text-sm text-muted-foreground">Recevoir un rappel par SMS (+216)</label></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="email" className="rounded border-input" defaultChecked /><label htmlFor="email" className="text-sm text-muted-foreground">Recevoir un rappel par email</label></div>
            </div>
          </div>
        }

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3">
          {currentStep > 1 ?
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1 as MainStep)}>
              <ChevronLeft className="h-4 w-4 mr-1" />Retour
            </Button> :

          <Button variant="outline" onClick={() => navigate(`/doctor/${doctorId || 1}`)}>
              <ChevronLeft className="h-4 w-4 mr-1" />Retour à la fiche
            </Button>
          }

          {currentStep < 5 ?
          <Button className="gradient-primary text-primary-foreground" disabled={!canGoNext()} onClick={() => setCurrentStep(currentStep + 1 as MainStep)}>
              Continuer<ChevronRight className="h-4 w-4 ml-1" />
            </Button> :

          <Button className="gradient-primary text-primary-foreground shadow-primary-glow h-11" onClick={handleConfirm}>
              <CheckCircle2 className="h-4 w-4 mr-2" />Confirmer le rendez-vous
            </Button>
          }
        </div>
      </div>
    </DashboardLayout>);

};

export default PatientBooking;