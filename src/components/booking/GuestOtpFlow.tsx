import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { sendOtp, verifyOtp } from "@/services/authOtpService";
import { toast } from "@/hooks/use-toast";

interface GuestOtpFlowProps {
  onVerified: (patientId: string, phone: string) => void;
}

const GuestOtpFlow = ({ onVerified }: GuestOtpFlowProps) => {
  const [step, setStep] = useState<"phone" | "code" | "info">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) return;
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      toast({ title: "Code envoyé", description: `Un code de vérification a été envoyé au ${phone}` });
      setStep("code");
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await verifyOtp(phone, code);
    setLoading(false);
    if (res.success && res.patientId) {
      setStep("info");
    } else {
      toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
    }
  };

  const handleComplete = () => {
    if (!firstName || !lastName) return;
    localStorage.setItem("guestName", `${firstName} ${lastName}`);
    toast({ title: "Compte créé", description: "Vous pouvez maintenant prendre rendez-vous." });
    const patientId = localStorage.getItem("guestPatientId") || "guest";
    onVerified(patientId, phone);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
      <h3 className="font-semibold text-foreground">Continuer en tant qu'invité</h3>
      <p className="text-sm text-muted-foreground">Vérifiez votre numéro de téléphone pour prendre rendez-vous sans créer de compte complet.</p>

      {step === "phone" && (
        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="+216 XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={handleSendOtp} disabled={loading || phone.length < 8} className="w-full gradient-primary text-primary-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
            Recevoir le code
          </Button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Entrez le code reçu par SMS au {phone}</p>
          <Input placeholder="Code à 6 chiffres" value={code} onChange={e => setCode(e.target.value)} maxLength={6} className="text-center text-lg tracking-widest" />
          <Button onClick={handleVerify} disabled={loading || code.length < 6} className="w-full gradient-primary text-primary-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Vérifier
          </Button>
          <button onClick={() => setStep("phone")} className="text-xs text-primary hover:underline">Changer de numéro</button>
        </div>
      )}

      {step === "info" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-accent" />Numéro vérifié ! Entrez vos informations.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <Button onClick={handleComplete} disabled={!firstName || !lastName} className="w-full gradient-primary text-primary-foreground">
            Continuer la réservation
          </Button>
        </div>
      )}
    </div>
  );
};

export default GuestOtpFlow;
