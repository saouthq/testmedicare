/**
 * Public Booking Page — Workflow complet en 5 étapes
 * Accessible aux visiteurs (OTP) et patients connectés
 */
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockDoctorProfile, mockAssurances, mockDoctors } from "@/data/mockData";
import { sendOtp, verifyOtp } from "@/services/authOtpService";
import { createAppointment } from "@/stores/sharedAppointmentsStore";
import { toast } from "@/hooks/use-toast";
import {
  MapPin, Clock, Shield, CheckCircle2, ChevronLeft, Video, Calendar, 
  FileText, Pill, Activity, User, Phone, Loader2, ArrowRight, Upload,
  CreditCard,
} from "lucide-react";

const doctor = {
  id: "1",
  name: mockDoctorProfile.name,
  specialty: mockDoctorProfile.specialty,
  address: mockDoctorProfile.address,
  initials: mockDoctorProfile.initials,
  motifs: mockDoctorProfile.motifs.map(m => ({ name: m.name, duration: m.duration, price: parseInt(m.price) })),
  teleconsultation: mockDoctorProfile.teleconsultation,
};

const generateSlots = () => {
  const s: string[] = [];
  for (let h = 8; h <= 17; h++) { 
    s.push(`${h.toString().padStart(2, "0")}:00`); 
    if (h < 17) s.push(`${h.toString().padStart(2, "0")}:30`); 
  }
  return s;
};

const generateDays = (weekOffset: number) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + (weekOffset * 7));
  // Start from next available day (skip today if past 4pm)
  if (weekOffset === 0 && today.getHours() >= 16) start.setDate(start.getDate() + 1);
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const d: { day: number; month: number; year: number; name: string; available: boolean; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const isSunday = date.getDay() === 0;
    d.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      name: dayNames[date.getDay()],
      available: !isSunday, // Sundays unavailable
      label: `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })} ${date.getFullYear()}`,
    });
  }
  return d;
};

type Step = "auth" | "motif" | "info" | "confirm" | "payment" | "done" | "create-account";

const PublicBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  // Auth state
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Booking state
  const [step, setStep] = useState<Step>("auth");
  const [selectedMotif, setSelectedMotif] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  
  // Patient info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [assurance, setAssurance] = useState("none");
  const [assuranceNumber, setAssuranceNumber] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [weekOffset, setWeekOffset] = useState(0);
  const slots = generateSlots();
  const days = generateDays(weekOffset);

  // Check existing session — only consider "patient" role as logged in for booking
  // Other roles (doctor, admin, secretary, etc.) should not auto-skip OTP
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = userRole === "patient";
  const isGuestSession = !!localStorage.getItem("guestPatientId");

  // OTP handlers
  const handleSendOtp = async () => {
    if (!phoneInput || phoneInput.length < 8) return;
    setOtpLoading(true);
    const res = await sendOtp(phoneInput);
    setOtpLoading(false);
    if (res.success) {
      toast({ title: "Code envoyé", description: `Un code de vérification a été envoyé au ${phoneInput}` });
      setOtpSent(true);
      setPhone(phoneInput);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    const res = await verifyOtp(phoneInput, otpCode);
    setOtpLoading(false);
    if (res.success && res.patientId) {
      toast({ title: "Numéro vérifié !" });
      setStep("motif");
    } else {
      toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
    }
  };

  const selectedMotifData = doctor.motifs.find(m => m.name === selectedMotif);
  const isTeleconsult = selectedMotif && doctor.teleconsultation; // simplified check
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleGoToPayment = () => {
    if (isTeleconsult && selectedMotifData) {
      setStep("payment");
    } else {
      handleConfirmBooking();
    }
  };

  const handlePayAndConfirm = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      handleConfirmBooking();
    }, 2000);
  };

  const handleConfirmBooking = () => {
    // Store guest appointment in localStorage
    const guestAppointments = JSON.parse(localStorage.getItem("guestAppointments") || "[]");
    guestAppointments.push({
      id: `guest-${Date.now()}`,
      phone: phone || phoneInput,
      firstName,
      lastName,
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: selectedDay,
      time: selectedSlot,
      motif: selectedMotif,
      assurance: mockAssurances.find(a => a.id === assurance)?.name || "Sans assurance",
      assuranceNumber: assuranceNumber || null,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("guestAppointments", JSON.stringify(guestAppointments));
    
    toast({ 
      title: "RDV confirmé !", 
      description: `Votre rendez-vous avec ${doctor.name} est prévu le ${selectedDay} à ${selectedSlot}.` 
    });
    setStep("done");
  };

  const handleAddDocument = () => {
    // Mock document upload
    setDocuments([...documents, `Document_${documents.length + 1}.pdf`]);
    toast({ title: "Document ajouté" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title={`Prendre RDV avec ${doctor.name} | Medicare`} 
        description={`Prenez rendez-vous en ligne avec ${doctor.name}, ${doctor.specialty} à ${doctor.address}.`} 
      />
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to={`/doctor/${doctorId || 1}`} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" />Retour au profil
        </Link>

        {/* Doctor mini card */}
        <div className="rounded-xl border bg-card p-4 shadow-card mb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {doctor.initials}
            </div>
            <div>
              <h2 className="font-bold text-foreground">{doctor.name}</h2>
              <p className="text-xs text-primary">{doctor.specialty}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{doctor.address}
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {step !== "done" && step !== "create-account" && step !== "payment" && (
          <div className="flex items-center gap-2 mb-5">
            {["auth", "motif", "info", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? "gradient-primary text-primary-foreground" : 
                  ["auth", "motif", "info", "confirm"].indexOf(step) > i ? "bg-accent text-accent-foreground" : 
                  "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                {i < 3 && <div className="flex-1 h-0.5 bg-muted" />}
              </div>
            ))}
          </div>
        )}

        {/* Step: Auth (OTP) */}
        {step === "auth" && !isLoggedIn && !isGuestSession && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Vérifiez votre numéro</h3>
            <p className="text-sm text-muted-foreground">
              Entrez votre numéro de téléphone pour prendre rendez-vous.
            </p>
            
            {!otpSent ? (
              <div className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="+216 XX XXX XXX" 
                    value={phoneInput} 
                    onChange={e => setPhoneInput(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
                <Button 
                  onClick={handleSendOtp} 
                  disabled={otpLoading || phoneInput.length < 8} 
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
                  Recevoir le code
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Entrez le code reçu par SMS au {phoneInput}
                </p>
                <Input 
                  placeholder="Code à 6 chiffres" 
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value)} 
                  maxLength={6} 
                  className="text-center text-lg tracking-widest" 
                />
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={otpLoading || otpCode.length < 6} 
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  Vérifier
                </Button>
                <button 
                  onClick={() => setOtpSent(false)} 
                  className="text-xs text-primary hover:underline"
                >
                  Changer de numéro
                </button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-2 border-t">
              Déjà inscrit ? <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link>
            </div>
          </div>
        )}

        {step === "auth" && (isLoggedIn || isGuestSession) && (
          <div className="rounded-xl border bg-card p-5 shadow-card text-center">
            <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-medium text-foreground">Vous êtes connecté</p>
            <Button onClick={() => setStep("motif")} className="mt-3 gradient-primary text-primary-foreground">
              Continuer la réservation
            </Button>
          </div>
        )}

        {/* Step: Motif + Date/Slot */}
        {step === "motif" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Motif de consultation</h3>
              <div className="space-y-2">
                {doctor.motifs.map(m => (
                  <button 
                    key={m.name} 
                    onClick={() => setSelectedMotif(m.name)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      selectedMotif === m.name 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${selectedMotif === m.name ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">({m.duration})</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{m.price} DT</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedMotif && (
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">Date et horaire</h3>
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {days[0]?.label} — {days[6]?.label}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.min(4, weekOffset + 1))} disabled={weekOffset >= 4} className="h-8 w-8 p-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map(d => (
                    <button 
                      key={`${d.day}-${d.month}`} 
                      onClick={() => d.available && setSelectedDay(d.label)} 
                      disabled={!d.available}
                      className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${
                        selectedDay === d.label 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : !d.available 
                            ? "opacity-40 cursor-not-allowed" 
                            : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
                      <span className={`text-base font-bold ${selectedDay === d.label ? "text-primary" : "text-foreground"}`}>
                        {d.day}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-foreground mb-2">Créneaux disponibles</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slots.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setSelectedSlot(s)} 
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                            selectedSlot === s 
                              ? "border-primary bg-primary text-primary-foreground" 
                              : "hover:border-primary/50 text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={() => setStep("info")} 
              disabled={!selectedMotif || !selectedDay || !selectedSlot} 
              className="w-full gradient-primary text-primary-foreground"
            >
              Continuer
            </Button>
          </div>
        )}

        {/* Step: Patient Info */}
        {step === "info" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Vos informations</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prénom *</label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Votre prénom" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nom *</label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Votre nom" className="mt-1" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date de naissance *</label>
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1" />
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
              <Input value={phone || phoneInput} disabled className="mt-1 bg-muted" />
            </div>

            <div className="border-t pt-4">
              <label className="text-xs font-medium text-muted-foreground">Assurance</label>
              <select 
                value={assurance} 
                onChange={e => setAssurance(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {mockAssurances.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            
            {assurance !== "none" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Numéro d'assurance <span className="text-muted-foreground/60">(optionnel)</span>
                </label>
                <Input 
                  value={assuranceNumber} 
                  onChange={e => setAssuranceNumber(e.target.value)} 
                  placeholder="Numéro de votre carte" 
                  className="mt-1" 
                />
              </div>
            )}

            <div className="border-t pt-4">
              <label className="text-xs font-medium text-muted-foreground">Documents (optionnel)</label>
              <p className="text-xs text-muted-foreground mb-2">Ajoutez des documents utiles (ordonnances, résultats d'analyses...)</p>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, i) => (
                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                    <FileText className="h-3 w-3" />{doc}
                  </span>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddDocument} className="text-xs">
                  <Upload className="h-3 w-3 mr-1" />Ajouter
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("motif")}>Retour</Button>
              <Button 
                onClick={() => setStep("confirm")} 
                disabled={!firstName || !lastName || !dob} 
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Praticien</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motif</span>
                <span className="font-medium">{selectedMotif}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDay} Fév 2026 à {selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium">{phone || phoneInput}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assurance</span>
                <span className="font-medium">{mockAssurances.find(a => a.id === assurance)?.name}</span>
              </div>
              {documents.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">{documents.length} fichier(s)</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message (optionnel)</label>
              <Input 
                placeholder="Précisez le motif si nécessaire..." 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                className="mt-1" 
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("info")}>Retour</Button>
              <Button onClick={handleGoToPayment} className="flex-1 gradient-primary text-primary-foreground">
                {isTeleconsult && selectedMotifData ? (
                  <><CreditCard className="h-4 w-4 mr-1" />Passer au paiement · {selectedMotifData.price} DT</>
                ) : (
                  <>Confirmer le rendez-vous</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Payment (teleconsultation) */}
        {step === "payment" && selectedMotifData && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Paiement de la téléconsultation</h3>
            <p className="text-sm text-muted-foreground">Le paiement est requis pour confirmer votre rendez-vous.</p>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedMotif} · {selectedDay} Fév à {selectedSlot}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-primary">{selectedMotifData.price} DT</p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border p-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Numéro de carte</label>
                <Input placeholder="4242 4242 4242 4242" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Expiration</label>
                  <Input placeholder="MM/AA" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">CVV</label>
                  <Input placeholder="123" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p>🔒 Paiement sécurisé SSL</p>
              <p>💰 Remboursement intégral en cas d'annulation jusqu'à 24h avant le RDV.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("confirm")}>Retour</Button>
              <Button onClick={handlePayAndConfirm} disabled={paymentProcessing} className="flex-1 gradient-primary text-primary-foreground">
                {paymentProcessing ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Traitement...</> : <><CreditCard className="h-4 w-4 mr-1" />Payer {selectedMotifData.price} DT</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 shadow-card text-center">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground">Rendez-vous confirmé !</h3>
              <p className="text-muted-foreground mt-2">
                Votre rendez-vous avec {doctor.name} est prévu le {selectedDay} Février 2026 à {selectedSlot}.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Un SMS de confirmation a été envoyé.</p>
            </div>

            {/* Account creation prompt (for guest users) */}
            {!isLoggedIn && (
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 shadow-card">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />Créer un compte Medicare
                </h4>
                <p className="text-sm text-muted-foreground mb-4">En créant un compte, vous bénéficiez de :</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4 text-accent" />Accès à tous vos rendez-vous
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-4 w-4 text-accent" />Vos documents médicaux centralisés
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Pill className="h-4 w-4 text-accent" />Vos ordonnances numériques
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Activity className="h-4 w-4 text-accent" />Vos résultats d'analyses
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <Shield className="h-4 w-4 text-accent" />Suivi des pharmacies
                  </li>
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
              <Link to="/my-appointments">
                <Button variant="outline">Retrouver mes RDV</Button>
              </Link>
              <Link to="/">
                <Button className="gradient-primary text-primary-foreground">Retour à l'accueil</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Step: Create Account */}
        {step === "create-account" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Créer votre compte</h3>
            <p className="text-sm text-muted-foreground">Complétez vos informations pour finaliser votre inscription.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prénom</label>
                <Input value={firstName} disabled className="mt-1 bg-muted" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nom</label>
                <Input value={lastName} disabled className="mt-1 bg-muted" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input type="email" placeholder="votre@email.tn" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
                <Input type="password" placeholder="Choisissez un mot de passe" className="mt-1" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Le téléphone {phone || phoneInput} sera associé à votre compte.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("done")}>Retour</Button>
              <Button 
                onClick={() => {
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
