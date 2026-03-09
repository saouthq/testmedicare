/**
 * Find Appointments via OTP — Page publique pour retrouver ses RDV sans compte
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Video, ChevronLeft, CheckCircle2, Phone, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { sendOtp, verifyOtp } from "@/services/authOtpService";
import { type GuestAppointment } from "@/data/mocks/patient";
import StatusBadge from "@/components/shared/StatusBadge";

type Step = "phone" | "otp" | "results";

const FindAppointments = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [appointments, setAppointments] = useState<GuestAppointment[]>([]);

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    const result = await sendOtp(phone);
    if (result.success) {
      toast({ title: "Code envoyé", description: result.message });
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    const result = await verifyOtp(phone, otp);
    if (result.success) {
      // Load appointments from localStorage
      const stored = JSON.parse(localStorage.getItem("guestAppointments") || "[]") as GuestAppointment[];
      const matching = stored.filter(a => a.phone === phone || a.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, ""));
      setAppointments(matching);
      setStep("results");
      toast({ title: "Vérification réussie" });
    } else {
      toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title="Retrouver mes rendez-vous | Medicare" description="Retrouvez vos rendez-vous médicaux avec votre numéro de téléphone." />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link to="/" className="flex items-center gap-1 text-sm text-primary mb-6 hover:underline"><ChevronLeft className="h-4 w-4" />Retour à l'accueil</Link>

        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
            <Search className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Retrouver mes rendez-vous</h1>
          <p className="text-muted-foreground mt-1">Entrez votre numéro de téléphone pour consulter vos RDV.</p>
        </div>

        {/* Step: Phone */}
        {step === "phone" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Numéro de téléphone</label>
              <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1 rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                  <span>🇹🇳</span><span>+216</span>
                </div>
                <Input 
                  placeholder="XX XXX XXX" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  className="flex-1"
                />
              </div>
            </div>
            <Button onClick={handleSendOtp} disabled={!phone.trim()} className="w-full gradient-primary text-primary-foreground">
              <Phone className="h-4 w-4 mr-2" />Recevoir le code
            </Button>
          </div>
        )}

        {/* Step: OTP */}
        {step === "otp" && (
          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Un code a été envoyé au</p>
              <p className="font-semibold text-foreground">+216 {phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Code de vérification</label>
              <Input 
                placeholder="123456" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                className="mt-2 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("phone")}>Retour</Button>
              <Button onClick={handleVerifyOtp} disabled={otp.length < 6} className="flex-1 gradient-primary text-primary-foreground">
                Vérifier
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">Code de test : <span className="font-mono font-bold">123456</span></p>
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 shadow-card text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Aucun rendez-vous trouvé</h3>
                <p className="text-sm text-muted-foreground mt-1">Aucun rendez-vous associé à ce numéro.</p>
                <Link to="/search"><Button className="mt-4 gradient-primary text-primary-foreground">Prendre un RDV</Button></Link>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
                  <p className="text-sm font-medium text-accent flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{appointments.length} rendez-vous trouvé(s)</p>
                </div>
                {appointments.map(apt => (
                  <div key={apt.id} className="rounded-xl border bg-card p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                        {apt.doctor.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm">{apt.doctor}</h3>
                          <StatusBadge status={apt.status} />
                        </div>
                        <p className="text-[11px] text-primary">{apt.specialty}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{apt.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Motif : {apt.motif}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => { setStep("phone"); setPhone(""); setOtp(""); }}>
                    Chercher un autre numéro
                  </Button>
                  <Link to="/search"><Button className="gradient-primary text-primary-foreground">Prendre un nouveau RDV</Button></Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindAppointments;
