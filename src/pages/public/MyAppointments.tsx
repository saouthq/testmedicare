/**
 * My Appointments Page — Retrouver mes RDV sans compte
 * Now reads from sharedAppointmentsStore instead of separate localStorage.
 */
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendOtp, verifyOtp } from "@/services/authOtpService";
import { toast } from "@/hooks/use-toast";
import { useSharedAppointments, cancelAppointment, rescheduleAppointment } from "@/stores/sharedAppointmentsStore";
import { APPOINTMENT_STATUS_CONFIG } from "@/types/appointment";
import type { SharedAppointment } from "@/types/appointment";
import { getCurrentRole } from "@/stores/authStore";
import {
  Phone, Loader2, ArrowRight, CheckCircle2, Calendar, Clock, MapPin,
  User, ChevronRight, Search, X, Video, Shield, RefreshCw, AlertTriangle,
} from "lucide-react";

const MyAppointments = () => {
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<SharedAppointment | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [allAppointments] = useSharedAppointments();

  // Redirect logged-in patients to their dashboard appointments
  const userRole = getCurrentRole();
  if (userRole === "patient") {
    return <Navigate to="/dashboard/patient/appointments" replace />;
  }

  // After OTP verification, filter appointments by phone number
  const matchedAppointments = verified
    ? allAppointments.filter(a => {
        const normalizedInput = phoneInput.replace(/\s/g, "");
        const normalizedPhone = (a.phone || "").replace(/\s/g, "");
        return normalizedPhone.includes(normalizedInput) || normalizedInput.includes(normalizedPhone);
      }).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
    : [];

  const handleSendOtp = async () => {
    if (!phoneInput || phoneInput.length < 8) return;
    setLoading(true);
    const res = await sendOtp(phoneInput);
    setLoading(false);
    if (res.success) {
      toast({ title: "Code envoyé", description: `Un code de vérification a été envoyé au ${phoneInput}` });
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const res = await verifyOtp(phoneInput, otpCode);
    setLoading(false);
    if (res.success) {
      setVerified(true);
      toast({ title: "Numéro vérifié !" });
    } else {
      toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
    }
  };

  const handleCancel = (id: string) => {
    // TODO BACKEND: Check 24h cancellation policy
    cancelAppointment(id);
    setShowCancelConfirm(false);
    setSelectedAppointment(null);
    toast({ title: "RDV annulé", description: "Votre rendez-vous a été annulé avec succès." });
  };

  const getStatusBadge = (status: string) => {
    const config = APPOINTMENT_STATUS_CONFIG[status as keyof typeof APPOINTMENT_STATUS_CONFIG];
    if (!config) return null;
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>{config.label}</span>;
  };

  const canCancel = (apt: SharedAppointment) => ["pending", "confirmed"].includes(apt.status);

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Retrouver mes rendez-vous | Medicare" 
        description="Retrouvez tous vos rendez-vous médicaux pris sur Medicare avec votre numéro de téléphone." 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Breadcrumbs items={[{ label: "Mes rendez-vous" }]} />
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Retrouver mes rendez-vous</h1>
        <p className="text-muted-foreground mb-6">
          Accédez à vos rendez-vous en vérifiant votre numéro de téléphone.
        </p>

        {/* Demo banner */}
        <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 mb-6">
          <p className="text-[11px] text-muted-foreground text-center">
            🔒 <span className="font-medium text-foreground">Mode démo</span> — Code OTP : <span className="font-mono font-bold text-foreground">123456</span>. Aucune donnée réelle transmise.
          </p>
        </div>

        {!verified ? (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Vérification du téléphone</h3>
                <p className="text-xs text-muted-foreground">Entrez le numéro utilisé lors de la réservation</p>
              </div>
            </div>

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
                  disabled={loading || phoneInput.length < 8} 
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
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
                  disabled={loading || otpCode.length < 6} 
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
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
          </div>
        ) : selectedAppointment ? (
          /* Appointment detail */
          <div className="space-y-4">
            <button 
              onClick={() => { setSelectedAppointment(null); setShowCancelConfirm(false); }}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              ← Retour à la liste
            </button>
            
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Détail du rendez-vous</h3>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {selectedAppointment.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedAppointment.doctor}</p>
                    <p className="text-xs text-primary">{selectedAppointment.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Date</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedAppointment.date}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">Heure</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedAppointment.startTime} — {selectedAppointment.endTime}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Motif</span>
                    <span className="font-medium text-foreground">{selectedAppointment.motif}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium text-foreground">{selectedAppointment.patient}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      {selectedAppointment.teleconsultation ? <><Video className="h-3.5 w-3.5 text-primary" />Téléconsultation</> : <><MapPin className="h-3.5 w-3.5" />Cabinet</>}
                    </span>
                  </div>
                  {selectedAppointment.assurance && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Assurance</span>
                      <span className="font-medium text-foreground flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-accent" />{selectedAppointment.assurance}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium text-foreground">{selectedAppointment.duration} min</span>
                  </div>
                </div>

                {canCancel(selectedAppointment) && (
                  <div className="pt-2">
                    {showCancelConfirm ? (
                      <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-3">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                        <span className="text-xs text-destructive font-medium flex-1">Confirmer l'annulation de ce rendez-vous ?</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleCancel(selectedAppointment.id)}>Oui, annuler</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCancelConfirm(false)}>Non</Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setShowCancelConfirm(true)}>
                        <X className="h-3.5 w-3.5 mr-1" />Annuler ce rendez-vous
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Appointments list */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent inline mr-1" />
                {matchedAppointments.length} rendez-vous trouvé(s) pour {phoneInput}
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setVerified(false); setOtpSent(false); setOtpCode(""); }} className="text-xs">
                Changer de numéro
              </Button>
            </div>

            {matchedAppointments.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Aucun rendez-vous trouvé</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun rendez-vous n'est associé à ce numéro.
                </p>
                <Link to="/search">
                  <Button className="mt-4 gradient-primary text-primary-foreground">
                    Prendre un rendez-vous
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matchedAppointments.map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="w-full rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {apt.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{apt.doctor}</p>
                          <p className="text-xs text-primary">{apt.type}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{apt.startTime}
                      </span>
                      <span className="text-muted-foreground">{apt.motif}</span>
                      {getStatusBadge(apt.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="text-center pt-4">
              <Link to="/search">
                <Button variant="outline">Prendre un nouveau RDV</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Create account prompt */}
        {verified && matchedAppointments.length > 0 && !selectedAppointment && (
          <div className="mt-6 rounded-xl border bg-primary/5 border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Créer un compte Medicare</p>
                <p className="text-xs text-muted-foreground">Gérez tous vos RDV, documents et ordonnances en un seul endroit.</p>
              </div>
              <Link to="/register">
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
