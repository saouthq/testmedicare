/**
 * Public Booking Page — Wizard en 6 étapes (Doctolib-style)
 * Ordre: type → motif+créneau → infos patient → OTP → récap/paiement → confirmation
 * Toutes les données passent par les stores centraux.
 *
 * // TODO BACKEND: Replace createAppointment with POST /api/appointments
 */
import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockAssurances } from "@/data/mocks/common";
import { mockDoctors } from "@/data/mocks/doctor";
import { sendOtp, verifyOtp } from "@/services/authOtpService";
import { bookAppointment, sharedAppointmentsStore } from "@/stores/sharedAppointmentsStore";
import { sharedAvailabilityStore, WEEK_DAYS } from "@/stores/sharedAvailabilityStore";
import { sharedBlockedSlotsStore } from "@/stores/sharedBlockedSlotsStore";
import { sharedLeavesStore } from "@/stores/sharedLeavesStore";
import { sharedPatientsStore } from "@/stores/sharedPatientsStore";
import { doctorProfileStore, readDoctorProfile } from "@/stores/doctorProfileStore";
import { useDoctorsDirectory } from "@/stores/directoryStore";
import { validateBooking } from "@/lib/appointmentRules";
import { getCurrentRole, readAuthUser } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import {
  MapPin, Clock, Shield, CheckCircle2, ChevronLeft, Video, Calendar,
  FileText, Pill, Activity, User, Phone, Loader2, ArrowRight, Upload,
  CreditCard, Ban, Building2, Info,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

const JS_DAY_TO_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// ─── Doctor Data Builder ────────────────────────────────────
const buildDoctor = (id: string, directoryDoctors: ReturnType<typeof useDoctorsDirectory>) => {
  const fromDirectory = directoryDoctors.find(d => String(d.id) === String(id));
  const profile = readDoctorProfile();

  if (fromDirectory) {
    return {
      id: String(fromDirectory.id),
      doctorId: String(fromDirectory.id),
      name: fromDirectory.name,
      specialty: fromDirectory.specialty,
      address: fromDirectory.address,
      initials: fromDirectory.avatar || fromDirectory.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      motifs: [
        { name: "Consultation", duration: 30, price: fromDirectory.price || 35 },
        { name: "Suivi", duration: 20, price: Math.round((fromDirectory.price || 35) * 0.75) },
        { name: "Première visite", duration: 45, price: Math.round((fromDirectory.price || 35) * 1.35) },
      ],
      teleconsultation: fromDirectory.teleconsultation,
      doctorRef: fromDirectory.name,
    };
  }

  const numId = Number.parseInt(id, 10);
  const found = mockDoctors.find(d => d.id === numId);

  if (found) {
    const motifs = numId === 1
      ? profile.motifs.map(m => ({ name: m.name, duration: parseInt(m.duration) || 30, price: parseInt(m.price) || 35 }))
      : [
          { name: "Consultation", duration: 30, price: found.price },
          { name: "Suivi", duration: 20, price: Math.round(found.price * 0.7) },
          { name: "Première visite", duration: 45, price: Math.round(found.price * 1.4) },
        ];

    return {
      id: String(found.id),
      doctorId: undefined,
      name: found.name,
      specialty: found.specialty,
      address: found.address,
      initials: found.avatar,
      motifs,
      teleconsultation: found.teleconsultation,
      doctorRef: found.name,
    };
  }

  return {
    id: "1",
    doctorId: undefined,
    name: profile.name,
    specialty: profile.specialty,
    address: profile.address,
    initials: profile.initials,
    motifs: profile.motifs.map(m => ({ name: m.name, duration: parseInt(m.duration) || 30, price: parseInt(m.price) || 35 })),
    teleconsultation: true,
    doctorRef: profile.name,
  };
};

// ─── Day Generation (checks availability + leaves + blocked slots) ───
const generateDays = (weekOffset: number, doctorRef: string) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + (weekOffset * 7));
  if (weekOffset === 0 && today.getHours() >= 16) start.setDate(start.getDate() + 1);
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const availability = sharedAvailabilityStore.read();
  const leaves = sharedLeavesStore.read().filter(l => l.doctor === doctorRef);
  const blockedSlots = sharedBlockedSlotsStore.read().filter(b => b.doctor === doctorRef);

  const d: { day: number; month: number; year: number; name: string; available: boolean; label: string; dateStr: string; frDayName: string; leaveReason?: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const frDayName = JS_DAY_TO_FR[date.getDay()];
    const dayConfig = availability.days[frDayName];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
    const isPast = dateStr < todayStr;
    const leave = leaves.find(l => l.status !== "past" && dateStr >= l.startDate && dateStr <= l.endDate);
    const fullDayBlock = blockedSlots.find(b => b.date === dateStr && b.duration >= 480);

    const isAvailable = !isPast && (dayConfig ? dayConfig.active : false) && !leave && !fullDayBlock;

    d.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      name: dayNames[date.getDay()],
      available: isAvailable,
      label: `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })} ${date.getFullYear()}`,
      dateStr,
      frDayName,
      leaveReason: leave ? leave.motif : fullDayBlock ? fullDayBlock.reason : undefined,
    });
  }
  return d;
};

// ─── Step Types ─────────────────────────────────────────────
type Step = "type" | "motif" | "info" | "otp" | "confirm" | "payment" | "done" | "create-account";

type ConsultType = "cabinet" | "teleconsultation";

const PublicBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctorsDirectory = useDoctorsDirectory();
  const doctor = useMemo(() => buildDoctor(doctorId || "1", doctorsDirectory), [doctorId, doctorsDirectory]);

  // Check if user is logged in
  const authUser = readAuthUser();
  const isLoggedIn = authUser?.role === "patient";

  // Wizard state
  const [step, setStep] = useState<Step>("type");
  const [consultType, setConsultType] = useState<ConsultType | null>(null);
  const [selectedMotif, setSelectedMotif] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedDayDateStr, setSelectedDayDateStr] = useState("");
  const [selectedDayFr, setSelectedDayFr] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  // Patient info
  const [firstName, setFirstName] = useState(isLoggedIn && authUser ? authUser.firstName : "");
  const [lastName, setLastName] = useState(isLoggedIn && authUser ? authUser.lastName : "");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [assurance, setAssurance] = useState("none");
  const [assuranceNumber, setAssuranceNumber] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // OTP state
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(isLoggedIn);

  // Payment state
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const days = generateDays(weekOffset, doctor.doctorRef);
  const isTeleconsult = consultType === "teleconsultation";
  const selectedMotifData = doctor.motifs.find(m => m.name === selectedMotif);

  // Generate filtered slots (checks availability + blocked + leaves + existing apts)
  const filteredSlots = useMemo(() => {
    if (!selectedDayDateStr || !selectedDayFr) return [];
    const availability = sharedAvailabilityStore.read();
    const dayConfig = availability.days[selectedDayFr];
    if (!dayConfig || !dayConfig.active) return [];

    const leaves = sharedLeavesStore.read().filter(l => l.doctor === doctor.doctorRef);
    const isOnLeave = leaves.some(l => l.status !== "past" && selectedDayDateStr >= l.startDate && selectedDayDateStr <= l.endDate);
    if (isOnLeave) return [];

    const slotDuration = selectedMotifData?.duration || availability.slotDuration || 30;
    const startMin = timeToMin(dayConfig.start);
    const endMin = timeToMin(dayConfig.end);
    const breakStartMin = dayConfig.breakStart ? timeToMin(dayConfig.breakStart) : -1;
    const breakEndMin = dayConfig.breakEnd ? timeToMin(dayConfig.breakEnd) : -1;

    const existingApts = sharedAppointmentsStore.read().filter(a => {
      if (a.date !== selectedDayDateStr || ["cancelled", "absent"].includes(a.status)) return false;
      if (doctor.doctorId) return a.doctorId === doctor.doctorId || a.doctor === doctor.doctorRef;
      return a.doctor === doctor.doctorRef;
    });

    const blockedSlots = sharedBlockedSlotsStore.read()
      .filter(b => b.date === selectedDayDateStr && b.doctor === doctor.doctorRef);

    const slots: string[] = [];
    const now = new Date();
    const isToday = selectedDayDateStr === now.toISOString().slice(0, 10);

    for (let m = startMin; m + slotDuration <= endMin; m += slotDuration) {
      // Skip break time
      if (breakStartMin >= 0 && breakEndMin >= 0 && m >= breakStartMin && m < breakEndMin) continue;

      // Skip past slots if today
      if (isToday) {
        const slotHour = Math.floor(m / 60);
        const slotMin = m % 60;
        if (slotHour < now.getHours() || (slotHour === now.getHours() && slotMin <= now.getMinutes())) continue;
      }

      // Check overlap with existing appointments
      const isBooked = existingApts.some(a => {
        const aptStart = timeToMin(a.startTime);
        const aptEnd = aptStart + a.duration;
        return m < aptEnd && (m + slotDuration) > aptStart;
      });
      if (isBooked) continue;

      // Check overlap with blocked slots
      const isBlocked = blockedSlots.some(b => {
        const bStart = timeToMin(b.startTime);
        const bEnd = bStart + b.duration;
        return m < bEnd && (m + slotDuration) > bStart;
      });
      if (isBlocked) continue;

      slots.push(minToTime(m));
    }
    return slots;
  }, [selectedDayDateStr, selectedDayFr, selectedMotifData, doctor.doctorRef]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleSelectDay = (d: typeof days[0]) => {
    if (!d.available) return;
    setSelectedDay(d.label);
    setSelectedDayDateStr(d.dateStr);
    setSelectedDayFr(d.frDayName);
    setSelectedSlot("");
  };

  const handleSendOtp = async () => {
    const ph = phoneInput || phone;
    if (!ph || ph.length < 8) return;
    setOtpLoading(true);
    const res = await sendOtp(ph);
    setOtpLoading(false);
    if (res.success) {
      toast({ title: "Code envoyé", description: `Un code de vérification a été envoyé au ${ph}` });
      setOtpSent(true);
      if (!phone) setPhone(ph);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    const res = await verifyOtp(phoneInput || phone, otpCode);
    setOtpLoading(false);
    if (res.success) {
      setOtpVerified(true);
      toast({ title: "Numéro vérifié !" });
      // Go directly to confirm (or payment for teleconsult)
      setStep("confirm");
    } else {
      toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
    }
  };

  const handleGoToPayment = () => {
    if (isTeleconsult && selectedMotifData) {
      setStep("payment");
    } else {
      handleConfirmBooking();
    }
  };

  const handlePayAndConfirm = () => {
    setPaymentProcessing(true);
    // TODO BACKEND: POST /api/payments
    setTimeout(() => {
      setPaymentProcessing(false);
      handleConfirmBooking(true);
    }, 2000);
  };

  const handleConfirmBooking = (paid = false) => {
    const duration = selectedMotifData?.duration || 30;

    const normalizedPhone = (phone || phoneInput).replace(/\s+/g, "");
    const normalizedFullName = `${firstName} ${lastName}`.trim().toLowerCase();
    const linkedPatient = sharedPatientsStore.read().find((p) => {
      const pName = p.name.trim().toLowerCase();
      const pPhone = (p.phone || "").replace(/\s+/g, "");
      return pName === normalizedFullName || (!!normalizedPhone && pPhone.endsWith(normalizedPhone));
    });

    const resolvedPatientId = isLoggedIn
      ? (authUser?.patientId ?? linkedPatient?.id ?? null)
      : (linkedPatient?.id ?? null);

    // Validate via centralized rules
    const validation = validateBooking({
      date: selectedDayDateStr,
      startTime: selectedSlot,
      duration,
      doctor: doctor.doctorRef,
      type: isTeleconsult ? "Téléconsultation" : "Consultation",
      teleconsultation: isTeleconsult,
    });

    if (!validation.valid) {
      toast({ title: "Réservation impossible", description: validation.errors[0], variant: "destructive" });
      return;
    }

    const result = bookAppointment({
      date: selectedDayDateStr,
      startTime: selectedSlot,
      duration,
      patient: `${firstName} ${lastName}`,
      patientId: resolvedPatientId,
      avatar: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase(),
      doctor: doctor.doctorRef,
      doctorId: doctor.doctorId,
      type: isTeleconsult ? "Téléconsultation" : (selectedMotifData?.name === "Première visite" ? "Première visite" : selectedMotifData?.name === "Suivi" || selectedMotifData?.name === "Suivi maladie chronique" ? "Suivi" : "Consultation"),
      motif: selectedMotif,
      phone: phone || phoneInput,
      assurance: mockAssurances.find(a => a.id === assurance)?.name || "Sans assurance",
      teleconsultation: isTeleconsult,
      createdBy: isLoggedIn ? "patient" : "public",
    });

    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
      return;
    }

    // Mark as paid if teleconsult
    if (paid && result.id) {
      sharedAppointmentsStore.set((prev: any[]) => prev.map((a: any) =>
        a.id === result.id ? { ...a, paymentStatus: "paid", paidAmount: selectedMotifData?.price || 0 } : a
      ));
    }

    toast({
      title: "RDV confirmé !",
      description: `Votre rendez-vous avec ${doctor.name} est prévu le ${selectedDay} à ${selectedSlot}.`
    });
    setStep("done");
  };

  const handleAddDocument = () => {
    setDocuments([...documents, `Document_${documents.length + 1}.pdf`]);
    toast({ title: "Document ajouté" });
  };

  // ─── Step navigation helpers ──────────────────────────────
  const stepOrder: Step[] = ["type", "motif", "info", "otp", "confirm"];
  const currentStepIndex = stepOrder.indexOf(step);

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

        {/* Demo banner */}
        <div className="rounded-lg bg-warning/5 border border-warning/20 p-2.5 mb-5">
          <p className="text-[11px] text-muted-foreground text-center">
            🔒 <span className="font-medium text-foreground">Mode démo</span> — OTP : <span className="font-mono font-bold text-foreground">123456</span> • Paiements simulés • Aucune donnée réelle transmise.
          </p>
        </div>

        {/* Progress indicator */}
        {!["done", "create-account", "payment"].includes(step) && (
          <div className="flex items-center gap-2 mb-5">
            {[
              { key: "type", label: "Type" },
              { key: "motif", label: "Créneau" },
              { key: "info", label: "Infos" },
              { key: "otp", label: "Vérif." },
              { key: "confirm", label: "Confirmer" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.key ? "gradient-primary text-primary-foreground" :
                  currentStepIndex > i ? "bg-accent text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {currentStepIndex > i ? "✓" : i + 1}
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 ${currentStepIndex > i ? "bg-accent" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ═══ STEP 1: Consultation Type ═══ */}
        {step === "type" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Type de consultation</h3>
            <p className="text-sm text-muted-foreground">Souhaitez-vous consulter au cabinet ou en téléconsultation ?</p>

            <div className="grid gap-3">
              <button
                onClick={() => { setConsultType("cabinet"); setStep("motif"); }}
                className="flex items-center gap-4 rounded-xl border p-4 text-left hover:border-primary/50 transition-all hover:bg-primary/5"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Au cabinet</p>
                  <p className="text-xs text-muted-foreground">{doctor.address}</p>
                </div>
              </button>

              {doctor.teleconsultation ? (
                <button
                  onClick={() => { setConsultType("teleconsultation"); setStep("motif"); }}
                  className="flex items-center gap-4 rounded-xl border p-4 text-left hover:border-primary/50 transition-all hover:bg-primary/5"
                >
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Video className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Téléconsultation</p>
                    <p className="text-xs text-muted-foreground">Consultez en vidéo depuis chez vous · Paiement en ligne requis</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border p-4 opacity-50 cursor-not-allowed">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Téléconsultation</p>
                    <p className="text-xs text-muted-foreground">Non disponible chez ce praticien</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Motif + Date/Slot ═══ */}
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
                      <span className="text-xs text-muted-foreground">({m.duration} min)</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMotif && (
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">Date et horaire</h3>
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="h-8 w-8 p-0" aria-label="Semaine précédente">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {days[0]?.label} — {days[6]?.label}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.min(4, weekOffset + 1))} disabled={weekOffset >= 4} className="h-8 w-8 p-0" aria-label="Semaine suivante">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map(d => (
                    <button
                      key={`${d.day}-${d.month}`}
                      onClick={() => handleSelectDay(d)}
                      disabled={!d.available}
                      className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${
                        selectedDay === d.label
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : !d.available
                            ? "opacity-40 cursor-not-allowed bg-muted/30"
                            : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
                      <span className={`text-base font-bold ${selectedDay === d.label ? "text-primary" : !d.available ? "text-muted-foreground" : "text-foreground"}`}>
                        {d.day}
                      </span>
                      {!d.available && <Ban className="h-3 w-3 text-muted-foreground mt-0.5" />}
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Créneaux disponibles
                      {filteredSlots.length === 0 && (
                        <span className="text-xs text-muted-foreground ml-2">— Aucun créneau disponible</span>
                      )}
                    </p>
                    {filteredSlots.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {filteredSlots.map(s => (
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
                    ) : (
                      <div className="rounded-lg bg-muted/50 p-4 text-center">
                        <Ban className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Tous les créneaux sont pris.</p>
                        <p className="text-xs text-muted-foreground mt-1">Essayez un autre jour.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep("type"); setSelectedMotif(""); setSelectedSlot(""); }}>
                Retour
              </Button>
              <Button
                onClick={() => setStep("info")}
                disabled={!selectedMotif || !selectedDay || !selectedSlot}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Patient Info ═══ */}
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
              <label className="text-xs font-medium text-muted-foreground">Téléphone *</label>
              {isLoggedIn ? (
                <Input value={authUser?.email || ""} disabled className="mt-1 bg-muted" />
              ) : (
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="+216 XX XXX XXX"
                    value={phoneInput || phone}
                    onChange={e => { setPhoneInput(e.target.value); setPhone(e.target.value); }}
                    className="pl-10"
                  />
                </div>
              )}
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
              <p className="text-xs text-muted-foreground mb-2">Ordonnances, résultats d'analyses...</p>
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
                onClick={() => {
                  if (isLoggedIn) {
                    // Skip OTP for logged-in patients
                    setOtpVerified(true);
                    setStep("confirm");
                  } else {
                    setStep("otp");
                  }
                }}
                disabled={!firstName || !lastName || !dob || (!isLoggedIn && (!phone && !phoneInput))}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: OTP Verification ═══ */}
        {step === "otp" && !otpVerified && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Vérification du téléphone</h3>
            <p className="text-sm text-muted-foreground">
              Un code de vérification sera envoyé au <span className="font-medium text-foreground">{phone || phoneInput}</span>
            </p>

            {!otpSent ? (
              <div className="space-y-3">
                <Button
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
                  Envoyer le code
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Entrez le code reçu par SMS
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
                <button onClick={() => setOtpSent(false)} className="text-xs text-primary hover:underline">
                  Renvoyer le code
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("info")}>Retour</Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: Confirm / Recap ═══ */}
        {step === "confirm" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Praticien</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium flex items-center gap-1">
                  {isTeleconsult ? <><Video className="h-3.5 w-3.5 text-accent" />Téléconsultation</> : <><Building2 className="h-3.5 w-3.5" />Cabinet</>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motif</span>
                <span className="font-medium">{selectedMotif}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedDay} à {selectedSlot}</span>
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
              {/* Prices hidden by default in booking flow — only show in recap for teleconsult payment */}
            </div>

            {isTeleconsult && (
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-accent" />
                  Le paiement en ligne est requis pour confirmer une téléconsultation.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">Message (optionnel)</label>
              <Input
                placeholder="Précisez le motif si nécessaire..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <p>💡 Annulation gratuite jusqu'à 24h avant le rendez-vous.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(isLoggedIn ? "info" : "otp")}>Retour</Button>
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

        {/* ═══ STEP 5b: Payment (teleconsultation only) ═══ */}
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
                    <p className="text-xs text-muted-foreground">{selectedMotif} · {selectedDay} à {selectedSlot}</p>
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

        {/* ═══ STEP 6: Done ═══ */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 shadow-card text-center">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground">Rendez-vous confirmé !</h3>
              <p className="text-muted-foreground mt-2">
                Votre rendez-vous avec {doctor.name} est prévu le {selectedDay} à {selectedSlot}.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Un SMS de confirmation a été envoyé.</p>
              {isTeleconsult && (
                <p className="text-xs text-accent mt-2 font-medium">
                  💳 Paiement confirmé · Vous recevrez un lien d'accès 15 min avant le RDV.
                </p>
              )}
            </div>

            {!isLoggedIn && (
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-5 shadow-card">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />Créer un compte Medicare
                </h4>
                <p className="text-sm text-muted-foreground mb-4">Gérez tous vos RDV, ordonnances et documents en un seul endroit.</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-foreground"><Calendar className="h-4 w-4 text-accent" />Accès à tous vos rendez-vous</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><FileText className="h-4 w-4 text-accent" />Documents médicaux centralisés</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Pill className="h-4 w-4 text-accent" />Ordonnances numériques</li>
                  <li className="flex items-center gap-2 text-sm text-foreground"><Activity className="h-4 w-4 text-accent" />Résultats d'analyses</li>
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

        {/* Create Account */}
        {step === "create-account" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Créer votre compte</h3>
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("done")}>Retour</Button>
              <Button
                onClick={() => {
                  // TODO BACKEND: POST /api/auth/register
                  localStorage.setItem("userRole", "patient");
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
