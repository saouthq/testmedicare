/**
 * ForgotPassword — OTP-based password reset flow.
 * Steps: 1) Enter phone/email → 2) OTP verification → 3) New password → Success
 * // TODO BACKEND: POST /api/auth/reset-password
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Stethoscope, ArrowLeft, Phone, Mail, KeyRound, CheckCircle, Eye, EyeOff } from "lucide-react";

type Step = "contact" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setLoading(true);
    // TODO BACKEND: POST /api/auth/otp/send
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimer(60);
      toast({ title: "Code envoyé", description: `Un code de vérification a été envoyé à ${contact}.` });
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) return;
    setLoading(true);
    // TODO BACKEND: POST /api/auth/otp/verify
    setTimeout(() => {
      setLoading(false);
      if (otp === "000000") {
        toast({ title: "Code incorrect", description: "Veuillez réessayer.", variant: "destructive" });
        return;
      }
      setStep("password");
      toast({ title: "Code vérifié", description: "Définissez votre nouveau mot de passe." });
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Minimum 6 caractères.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // TODO BACKEND: POST /api/auth/reset-password
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      toast({ title: "Mot de passe modifié", description: "Vous pouvez maintenant vous connecter." });
    }, 800);
  };

  const handleResend = () => {
    setTimer(60);
    setOtp("");
    toast({ title: "Code renvoyé", description: "Un nouveau code a été envoyé." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Medicare</span>
        </div>

        {step === "contact" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre numéro de téléphone ou email pour recevoir un code de vérification.
            </p>
            <form onSubmit={handleSendCode} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="contact">Téléphone ou email</Label>
                <Input
                  id="contact"
                  placeholder="+216 XX XXX XXX ou votre@email.tn"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11" disabled={loading || !contact.trim()}>
                {loading ? "Envoi en cours..." : "Envoyer le code"}
              </Button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Vérification</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez le code à 6 chiffres envoyé à <strong>{contact}</strong>
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                En mode démo, tout code sauf 000000 est accepté.
              </p>
              <Button onClick={handleVerifyOtp} className="w-full gradient-primary text-primary-foreground h-11" disabled={loading || otp.length < 6}>
                {loading ? "Vérification..." : "Vérifier le code"}
              </Button>
              <div className="text-center">
                {timer > 0 ? (
                  <span className="text-xs text-muted-foreground">Renvoyer dans {timer}s</span>
                ) : (
                  <button onClick={handleResend} className="text-xs text-primary hover:underline">
                    Renvoyer le code
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11" disabled={loading}>
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Mot de passe modifié !</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Button onClick={() => navigate("/login")} className="mt-6 gradient-primary text-primary-foreground">
              Se connecter
            </Button>
          </div>
        )}

        {step !== "success" && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />Retour à la connexion
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-warning/5 border border-warning/20 p-3">
          <p className="text-[11px] text-muted-foreground text-center">
            🔒 <span className="font-medium text-foreground">Mode démo</span> — Le code OTP et la réinitialisation sont simulés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
