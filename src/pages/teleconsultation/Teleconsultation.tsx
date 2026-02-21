import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Video, VideoOff, Mic, MicOff, Phone, MessageSquare, Monitor,
  FileText, Send, User, CheckCircle2, AlertTriangle, Wifi, Camera,
  Shield, Clock, Pill, Activity, Save, Printer, X, Stethoscope,
  Calendar, ArrowRight, Download
} from "lucide-react";

type TelePhase = "checklist" | "call" | "summary";

const Teleconsultation = ({ role = "patient" }: { role?: "patient" | "doctor" }) => {
  const [phase, setPhase] = useState<TelePhase>(role === "patient" ? "checklist" : "call");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00:00");
  const [chatMessages, setChatMessages] = useState([
    { sender: "doctor", text: "Bonjour, comment allez-vous aujourd'hui ?", time: "14:30" },
    { sender: "patient", text: "Bonjour docteur, j'ai quelques questions sur mon traitement.", time: "14:31" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Checklist state (patient)
  const [checks, setChecks] = useState({
    internet: false, camera: false, micro: false, quiet: false, documents: false, identity: false,
  });
  const allChecked = Object.values(checks).every(Boolean);

  // Summary state (doctor)
  const [summary, setSummary] = useState({
    diagnosis: "",
    notes: "Le patient présente des symptômes de fatigue chronique. Bilan sanguin demandé. Suivi dans 15 jours.",
    prescriptions: [
      { medication: "Vitamine D3 1000UI", dosage: "1 gélule/jour pendant 3 mois" },
      { medication: "Magnésium B6", dosage: "2 comprimés/jour pendant 1 mois" },
    ],
    analyses: ["NFS complète", "Bilan thyroïdien (TSH, T3, T4)"],
    nextRdv: "15 jours",
    amount: "35",
    paymentStatus: "captured" as "captured" | "pending",
  });
  const [summaryStep, setSummaryStep] = useState<"review" | "done">("review");

  const otherPerson = role === "patient"
    ? { name: "Dr. Ahmed Bouazizi", role: "Médecin généraliste" }
    : { name: "Amine Ben Ali", role: "Patient · 33 ans · CNAM" };

  const sendChat = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      sender: role, text: newMessage,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setNewMessage("");
  };

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Start call timer simulation
  const startCall = () => {
    setPhase("call");
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setCallDuration(`${h}:${m}:${s}`);
    }, 1000);
    // Store for cleanup (simplified)
    (window as any).__teleInterval = interval;
  };

  const endCall = () => {
    clearInterval((window as any).__teleInterval);
    if (role === "doctor") {
      setPhase("summary");
    } else {
      // Patient gets a simple end screen
      setPhase("summary");
    }
  };

  const checklistItems = [
    { key: "internet" as const, label: "Connexion internet stable", desc: "Privilégiez le Wi-Fi ou la 4G", icon: Wifi },
    { key: "camera" as const, label: "Caméra fonctionnelle", desc: "Testez votre caméra avant l'appel", icon: Camera },
    { key: "micro" as const, label: "Microphone activé", desc: "Vérifiez que le son fonctionne", icon: Mic },
    { key: "quiet" as const, label: "Environnement calme", desc: "Installez-vous dans un endroit calme et privé", icon: Shield },
    { key: "documents" as const, label: "Documents à portée de main", desc: "Ordonnances, résultats d'analyses...", icon: FileText },
    { key: "identity" as const, label: "Pièce d'identité prête", desc: "Le médecin peut la demander pour vérification", icon: User },
  ];

  return (
    <DashboardLayout role={role} title="Téléconsultation">
      <div className="space-y-4">

        {/* ═══ PATIENT CHECKLIST ═══ */}
        {phase === "checklist" && role === "patient" && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* RDV info banner */}
            <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Video className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Téléconsultation à venir</h2>
                  <p className="text-primary-foreground/80 text-sm mt-0.5">
                    {otherPerson.name} · {otherPerson.role}
                  </p>
                  <p className="text-primary-foreground/80 text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />Aujourd'hui à 14:30 · Durée estimée : 20 min
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-1">Checklist pré-consultation</h3>
              <p className="text-xs text-muted-foreground mb-4">Vérifiez ces points avant de rejoindre la téléconsultation</p>

              <div className="space-y-3">
                {checklistItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleCheck(item.key)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 transition-all text-left ${
                      checks[item.key]
                        ? "border-accent bg-accent/5"
                        : "hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checks[item.key] ? "border-accent bg-accent" : "border-muted-foreground/30"
                    }`}>
                      {checks[item.key] && <CheckCircle2 className="h-4 w-4 text-accent-foreground" />}
                    </div>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      checks[item.key] ? "bg-accent/10" : "bg-muted"
                    }`}>
                      <item.icon className={`h-4 w-4 ${checks[item.key] ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${checks[item.key] ? "text-foreground" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {Object.values(checks).filter(Boolean).length}/{checklistItems.length} vérifié(s)
                </p>
                <Button
                  className="gradient-primary text-primary-foreground shadow-primary-glow"
                  disabled={!allChecked}
                  onClick={startCall}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Rejoindre la téléconsultation
                </Button>
              </div>

              {!allChecked && (
                <p className="text-xs text-warning mt-3 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Veuillez valider tous les points avant de rejoindre l'appel
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">💡 Conseils</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Préparez vos questions à l'avance</li>
                <li>• Ayez vos médicaments actuels sous les yeux</li>
                <li>• Notez les symptômes que vous souhaitez décrire</li>
                <li>• La consultation est chiffrée de bout en bout</li>
              </ul>
            </div>
          </div>
        )}

        {/* ═══ ACTIVE CALL ═══ */}
        {phase === "call" && (
          <>
            <div className="relative rounded-xl border bg-foreground/95 overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-primary-foreground/50" />
                  </div>
                  <p className="text-primary-foreground/80 text-lg font-medium">{otherPerson.name}</p>
                  <p className="text-primary-foreground/50 text-sm">{otherPerson.role}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <p className="text-accent text-xs font-medium">Connecté</p>
                  </div>
                </div>
              </div>

              {/* Self camera */}
              <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg bg-foreground/80 border border-primary-foreground/20 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-primary-foreground/60 text-xs">Vous</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="h-8 w-8 text-primary-foreground/40 mx-auto" />
                    <p className="text-primary-foreground/40 text-xs mt-1">Caméra désactivée</p>
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="absolute top-4 left-4 rounded-full bg-foreground/60 backdrop-blur px-3 py-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <p className="text-primary-foreground text-sm font-medium">{callDuration}</p>
              </div>

              {/* Connection quality */}
              <div className="absolute top-4 right-4 rounded-full bg-foreground/60 backdrop-blur px-3 py-1 flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-accent" />
                <span className="text-accent text-xs font-medium">Excellente</span>
              </div>

              {/* Doctor side panel: patient antecedents */}
              {role === "doctor" && !isChatOpen && (
                <div className="absolute top-14 left-4 w-64 rounded-xl bg-card/95 backdrop-blur border shadow-elevated p-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-primary" />Fiche rapide patient
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Âge</span>
                      <span className="text-foreground font-medium">33 ans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Groupe sanguin</span>
                      <span className="text-foreground font-medium">A+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allergies</span>
                      <span className="text-destructive font-medium">Pénicilline</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Traitements</span>
                      <span className="text-foreground font-medium">Metformine 500mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Antécédents</span>
                      <span className="text-foreground font-medium">Diabète T2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dernière visite</span>
                      <span className="text-foreground font-medium">5 Fév 2026</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat panel */}
              {isChatOpen && (
                <div className="absolute top-0 right-0 bottom-0 w-80 bg-card border-l flex flex-col">
                  <div className="p-3 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Chat</h3>
                    <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === role ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.sender === role ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-0.5 ${
                            msg.sender === role ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-2 flex gap-2">
                    <input
                      value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendChat()}
                      placeholder="Message..."
                      className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button size="icon" className="h-8 w-8 gradient-primary text-primary-foreground" onClick={sendChat}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button variant={isMuted ? "destructive" : "outline"} size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button variant={!isVideoOn ? "destructive" : "outline"} size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsVideoOn(!isVideoOn)}>
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                <Monitor className="h-5 w-5" />
              </Button>
              <Button variant={isChatOpen ? "default" : "outline"} size="icon" className="h-12 w-12 rounded-full" onClick={() => setIsChatOpen(!isChatOpen)}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              {role === "doctor" && (
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                  <FileText className="h-5 w-5" />
                </Button>
              )}
              <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={endCall}>
                <Phone className="h-6 w-6 rotate-[135deg]" />
              </Button>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                  {otherPerson.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{otherPerson.name}</p>
                  <p className="text-xs text-muted-foreground">{otherPerson.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Connexion sécurisée · Chiffrée de bout en bout
              </div>
            </div>
          </>
        )}

        {/* ═══ DOCTOR SUMMARY (end of consultation) ═══ */}
        {phase === "summary" && role === "doctor" && summaryStep === "review" && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Clôture de consultation</h2>
                  <p className="text-primary-foreground/80 text-sm">
                    {otherPerson.name} · Durée : {callDuration}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis & Notes */}
            <div className="rounded-xl border bg-card shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />Diagnostic & Notes
              </h3>
              <div>
                <Label className="text-xs">Diagnostic principal</Label>
                <Input
                  value={summary.diagnosis}
                  onChange={e => setSummary(s => ({ ...s, diagnosis: e.target.value }))}
                  placeholder="Ex: Fatigue chronique, carence vitaminique suspectée"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Notes de consultation</Label>
                <Textarea
                  value={summary.notes}
                  onChange={e => setSummary(s => ({ ...s, notes: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Prescriptions */}
            <div className="rounded-xl border bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4 text-warning" />Ordonnance
                </h3>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setSummary(s => ({
                  ...s,
                  prescriptions: [...s.prescriptions, { medication: "", dosage: "" }],
                }))}>+ Ajouter</Button>
              </div>
              {summary.prescriptions.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={p.medication}
                    onChange={e => {
                      const u = [...summary.prescriptions];
                      u[i] = { ...u[i], medication: e.target.value };
                      setSummary(s => ({ ...s, prescriptions: u }));
                    }}
                    placeholder="Médicament"
                    className="flex-1"
                  />
                  <Input
                    value={p.dosage}
                    onChange={e => {
                      const u = [...summary.prescriptions];
                      u[i] = { ...u[i], dosage: e.target.value };
                      setSummary(s => ({ ...s, prescriptions: u }));
                    }}
                    placeholder="Posologie"
                    className="flex-1"
                  />
                  {summary.prescriptions.length > 1 && (
                    <button
                      onClick={() => setSummary(s => ({ ...s, prescriptions: s.prescriptions.filter((_, j) => j !== i) }))}
                      className="text-destructive/50 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Analyses */}
            <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />Analyses prescrites
                </h3>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setSummary(s => ({
                  ...s, analyses: [...s.analyses, ""],
                }))}>+ Ajouter</Button>
              </div>
              {summary.analyses.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={a}
                    onChange={e => {
                      const u = [...summary.analyses];
                      u[i] = e.target.value;
                      setSummary(s => ({ ...s, analyses: u }));
                    }}
                    placeholder="Type d'analyse"
                    className="flex-1"
                  />
                  {summary.analyses.length > 1 && (
                    <button
                      onClick={() => setSummary(s => ({ ...s, analyses: s.analyses.filter((_, j) => j !== i) }))}
                      className="text-destructive/50 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Next RDV + Payment */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />Prochain RDV
                </h3>
                <select
                  value={summary.nextRdv}
                  onChange={e => setSummary(s => ({ ...s, nextRdv: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Pas de suivi prévu</option>
                  <option value="1 semaine">1 semaine</option>
                  <option value="15 jours">15 jours</option>
                  <option value="1 mois">1 mois</option>
                  <option value="3 mois">3 mois</option>
                  <option value="6 mois">6 mois</option>
                </select>
              </div>

              <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />Paiement
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{summary.amount} DT</p>
                    <p className="text-xs text-muted-foreground">Téléconsultation</p>
                  </div>
                  <span className="rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />Capturé
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => setSummaryStep("done")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Valider et clôturer
              </Button>
              <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Imprimer le résumé</Button>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter PDF</Button>
            </div>
          </div>
        )}

        {/* Doctor summary done */}
        {phase === "summary" && role === "doctor" && summaryStep === "done" && (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Le compte-rendu a été sauvegardé et l'ordonnance envoyée au patient.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />Retour au planning
              </Button>
              <Button className="gradient-primary text-primary-foreground">
                <Stethoscope className="h-4 w-4 mr-2" />Prochaine consultation
              </Button>
            </div>
          </div>
        )}

        {/* ═══ PATIENT END SCREEN ═══ */}
        {phase === "summary" && role === "patient" && (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Consultation terminée</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Merci d'avoir consulté {otherPerson.name}.<br />
              Votre ordonnance et le compte-rendu seront disponibles dans votre espace santé.
            </p>

            <div className="rounded-xl border bg-card shadow-card p-5 mt-6 text-left max-w-sm mx-auto space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Résumé</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground">Durée</p>
                  <p className="font-medium text-foreground mt-0.5">{callDuration}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-muted-foreground">Montant</p>
                  <p className="font-medium text-foreground mt-0.5">35 DT</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💊 Ordonnance en cours de préparation par votre médecin
              </p>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => window.history.back()}>
                Retour au tableau de bord
              </Button>
              <Button className="gradient-primary text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />Voir mon dossier
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teleconsultation;
