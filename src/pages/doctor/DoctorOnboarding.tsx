import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope, CheckCircle2, ArrowLeft, ArrowRight, User, MapPin, Clock,
  Calendar, Shield, Plus, Trash2, AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { specialties, languages, mockDefaultMotifs, mockDefaultHoraires } from "@/data/mockData";

type Step = "identity" | "cabinet" | "motifs" | "rules";

const steps = [
  { key: "identity" as Step, label: "Identité", icon: User },
  { key: "cabinet" as Step, label: "Cabinet", icon: MapPin },
  { key: "motifs" as Step, label: "Actes & Motifs", icon: Clock },
  { key: "rules" as Step, label: "Règles RDV", icon: Calendar },
];

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identity");
  const [selectedLangs, setSelectedLangs] = useState(["Français", "Arabe"]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [motifs, setMotifs] = useState(mockDefaultMotifs);
  const [horaires, setHoraires] = useState(mockDefaultHoraires);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [cancellationDelay, setCancellationDelay] = useState("24");
  const [bufferTime, setBufferTime] = useState("5");
  const [cnam, setCnam] = useState(true);

  const currentIndex = steps.findIndex(s => s.key === step);

  const goBack = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1].key);
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1].key);
  };

  const toggleLang = (l: string) => {
    setSelectedLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const addMotif = () => {
    setMotifs([...motifs, { name: "", duration: 30, price: 35 }]);
  };

  const removeMotif = (idx: number) => {
    setMotifs(motifs.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    navigate("/dashboard/doctor");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center"><Stethoscope className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-bold text-foreground">Medicare</span>
          </Link>
          <span className="text-xs text-muted-foreground">Configuration du profil</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i < currentIndex ? "bg-accent text-accent-foreground" : i === currentIndex ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={`text-xs hidden sm:inline ${i === currentIndex ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-px ${i < currentIndex ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === "identity" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
            <div><h3 className="text-lg font-semibold text-foreground">Votre identité professionnelle</h3><p className="text-sm text-muted-foreground">Ces informations seront affichées sur votre profil public.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Prénom</Label><Input placeholder="Ahmed" className="mt-1.5" /></div>
              <div><Label>Nom</Label><Input placeholder="Bouazizi" className="mt-1.5" /></div>
            </div>
            <div><Label>Spécialité principale</Label>
              <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="">Choisir une spécialité</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>N° Ordre des Médecins</Label><Input placeholder="TN-XXXXXXXX" className="mt-1.5" /></div>
            <div><Label>Langues parlées</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map(l => (
                  <button key={l} onClick={() => toggleLang(l)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      selectedLangs.includes(l) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                    }`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="cnam" checked={cnam} onChange={e => setCnam(e.target.checked)} className="rounded border-input" />
              <Label htmlFor="cnam" className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" />Conventionné CNAM</Label>
            </div>
            <div><Label>Présentation</Label><textarea placeholder="Décrivez votre parcours et vos spécialités..." className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
        )}

        {/* Step 2: Cabinet */}
        {step === "cabinet" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
            <div><h3 className="text-lg font-semibold text-foreground">Votre cabinet</h3><p className="text-sm text-muted-foreground">Adresse et horaires d'ouverture.</p></div>
            <div><Label>Nom du cabinet</Label><Input placeholder="Cabinet médical El Manar" className="mt-1.5" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Adresse</Label><Input placeholder="15 Av. de la Liberté, El Manar" className="mt-1.5" /></div>
              <div><Label>Gouvernorat</Label>
                <select className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option>Tunis</option><option>Ariana</option><option>Ben Arous</option><option>Manouba</option><option>Sousse</option><option>Sfax</option>
                </select>
              </div>
            </div>
            <div><Label>Téléphone</Label><Input placeholder="+216 71 XXX XXX" className="mt-1.5" /></div>

            <div>
              <Label className="mb-3 block">Horaires d'ouverture</Label>
              <div className="space-y-2">
                {horaires.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-3 text-sm">
                    <div className="w-24 shrink-0">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={h.open} onChange={e => {
                          const updated = [...horaires]; updated[i] = { ...h, open: e.target.checked }; setHoraires(updated);
                        }} className="rounded border-input" />
                        <span className={`text-sm ${h.open ? "text-foreground font-medium" : "text-muted-foreground"}`}>{h.day}</span>
                      </label>
                    </div>
                    {h.open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={h.morning} onChange={e => { const u = [...horaires]; u[i] = { ...h, morning: e.target.value }; setHoraires(u); }} placeholder="08:00-12:00" className="h-8 text-xs" />
                        <Input value={h.afternoon} onChange={e => { const u = [...horaires]; u[i] = { ...h, afternoon: e.target.value }; setHoraires(u); }} placeholder="14:00-18:00" className="h-8 text-xs" />
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Fermé</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Motifs / Actes */}
        {step === "motifs" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
            <div><h3 className="text-lg font-semibold text-foreground">Actes & Motifs de consultation</h3><p className="text-sm text-muted-foreground">Définissez vos motifs avec durée et tarif. Ils seront visibles par les patients.</p></div>
            <div className="space-y-3">
              {motifs.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="flex-1"><Input value={m.name} onChange={e => { const u = [...motifs]; u[i] = { ...m, name: e.target.value }; setMotifs(u); }} placeholder="Nom du motif" className="h-9 text-sm" /></div>
                  <div className="w-20"><Input type="number" value={m.duration} onChange={e => { const u = [...motifs]; u[i] = { ...m, duration: +e.target.value }; setMotifs(u); }} className="h-9 text-sm text-center" /><p className="text-[10px] text-muted-foreground text-center">min</p></div>
                  <div className="w-20"><Input type="number" value={m.price} onChange={e => { const u = [...motifs]; u[i] = { ...m, price: +e.target.value }; setMotifs(u); }} className="h-9 text-sm text-center" /><p className="text-[10px] text-muted-foreground text-center">DT</p></div>
                  <button onClick={() => removeMotif(i)} className="text-destructive/50 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addMotif} size="sm"><Plus className="h-4 w-4 mr-1.5" />Ajouter un motif</Button>
          </div>
        )}

        {/* Step 4: Rules */}
        {step === "rules" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
            <div><h3 className="text-lg font-semibold text-foreground">Règles de réservation</h3><p className="text-sm text-muted-foreground">Configurez comment les patients prennent RDV.</p></div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Confirmation automatique</p><p className="text-xs text-muted-foreground">Les RDV sont confirmés sans validation manuelle</p></div>
                  <button onClick={() => setAutoConfirm(!autoConfirm)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoConfirm ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${autoConfirm ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <Label>Délai d'annulation gratuite</Label>
                <p className="text-xs text-muted-foreground mb-2">Le patient peut annuler gratuitement jusqu'à X heures avant le RDV</p>
                <div className="flex items-center gap-2">
                  <select value={cancellationDelay} onChange={e => setCancellationDelay(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="2">2 heures</option>
                    <option value="4">4 heures</option>
                    <option value="12">12 heures</option>
                    <option value="24">24 heures</option>
                    <option value="48">48 heures</option>
                  </select>
                  <span className="text-sm text-muted-foreground">avant le RDV</span>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <Label>Temps tampon entre les RDV</Label>
                <p className="text-xs text-muted-foreground mb-2">Pause automatique entre chaque consultation</p>
                <select value={bufferTime} onChange={e => setBufferTime(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="0">Aucun</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>

              <div className="rounded-xl border p-4">
                <Label>Délai minimum de prise de RDV</Label>
                <p className="text-xs text-muted-foreground mb-2">Les patients ne peuvent pas prendre RDV moins de X heures avant</p>
                <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="1">1 heure</option>
                  <option value="2">2 heures</option>
                  <option value="4">4 heures</option>
                  <option value="24">24 heures</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Profil en attente de validation</p>
                <p className="text-xs text-muted-foreground">Après soumission, votre profil sera vérifié par notre équipe sous 24-48h. Vous pourrez commencer à utiliser la plateforme une fois validé.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={goBack} disabled={currentIndex === 0}><ArrowLeft className="h-4 w-4 mr-1.5" />Précédent</Button>
          {currentIndex < steps.length - 1 ? (
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={goNext}>Suivant <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
          ) : (
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSubmit}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />Soumettre mon profil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;