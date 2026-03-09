import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicFooter from "@/components/public/PublicFooter";
import {
  Stethoscope, Eye, EyeOff, User, Building2, FlaskConical, Pill,
  CheckCircle2, Shield, ArrowRight, ChevronRight, Calendar, Heart,
  Phone, Mail, MapPin, Lock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const roles = [
  { value: "patient", label: "Patient", icon: User, desc: "Prenez RDV et gérez votre santé en ligne", color: "bg-primary/10 text-primary" },
  { value: "doctor", label: "Médecin", icon: Stethoscope, desc: "Gérez votre agenda et vos patients", color: "bg-accent/10 text-accent", redirect: true },
  { value: "pharmacy", label: "Pharmacie", icon: Pill, desc: "Recevez les ordonnances en ligne", color: "bg-warning/10 text-warning", redirect: true },
  { value: "laboratory", label: "Laboratoire", icon: FlaskConical, desc: "Gérez vos analyses et résultats", color: "bg-primary/10 text-primary", redirect: true },
];

const gouvernorats = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Nabeul", "Bizerte", "Monastir", "Gabès", "Kairouan"];

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [step, setStep] = useState<"role" | "form" | "success">("role");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", gouvernorat: "Tunis",
    assuranceNumber: "", password: "", confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const passwordValid = formData.password.length >= 8;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const formValid = formData.firstName && formData.lastName && formData.email && formData.phone && passwordValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    // Mock registration
    localStorage.setItem("userRole", "patient");
    toast({ title: "Compte créé !", description: "Bienvenue sur Medicare. Vous pouvez maintenant prendre rendez-vous." });
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - branding */}
        <div className="hidden lg:flex lg:w-5/12 gradient-hero items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="max-w-md text-primary-foreground relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
                <Stethoscope className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <span className="text-2xl font-bold">Medicare</span>
                <p className="text-primary-foreground/70 text-xs">Tunisie 🇹🇳</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Rejoignez Medicare</h2>
            <p className="text-primary-foreground/80 mb-8">Créez votre compte et accédez à l'ensemble des services de la plateforme.</p>
            
            <div className="space-y-4">
              {[
                { icon: Calendar, text: "Prenez RDV en ligne 24h/24" },
                { icon: Shield, text: "Données sécurisées et confidentielles" },
                { icon: Heart, text: "Suivi médical complet et ordonnances" },
                { icon: Phone, text: "Rappels SMS automatiques" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-primary-foreground/90">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-7/12">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Medicare</span>
              </Link>
            </div>

            {/* Step: Role selection */}
            {step === "role" && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Créer un compte</h1>
                <p className="text-muted-foreground mb-6">Sélectionnez votre profil pour commencer.</p>

                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  {roles.map(r => (
                    <button
                      key={r.value}
                      onClick={() => {
                        if (r.redirect) {
                          navigate("/become-partner");
                          return;
                        }
                        setSelectedRole(r.value);
                        setStep("form");
                      }}
                      className={`rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-card group ${
                        selectedRole === r.value ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl ${r.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <r.icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{r.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                      {r.redirect && (
                        <p className="text-[10px] text-primary mt-1 flex items-center gap-0.5">Inscription pro <ChevronRight className="h-3 w-3" /></p>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
                </p>
              </div>
            )}

            {/* Step: Patient registration form */}
            {step === "form" && (
              <div>
                <button onClick={() => setStep("role")} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">
                  ← Retour au choix du profil
                </button>
                <h1 className="text-2xl font-bold text-foreground mb-2">Créer votre compte patient</h1>
                <p className="text-muted-foreground mb-6">Remplissez vos informations pour accéder à tous les services.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Prénom *</Label><Input value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} placeholder="Amine" className="mt-1.5" required /></div>
                    <div><Label>Nom *</Label><Input value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} placeholder="Ben Ali" className="mt-1.5" required /></div>
                  </div>
                  <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} placeholder="votre@email.tn" className="mt-1.5" required /></div>
                  <div><Label>Téléphone *</Label><Input value={formData.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+216 XX XXX XXX" className="mt-1.5" required /></div>
                  <div><Label>Gouvernorat</Label>
                    <select value={formData.gouvernorat} onChange={e => handleChange("gouvernorat", e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {gouvernorats.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div><Label>N° Assuré <span className="text-muted-foreground text-xs">(optionnel)</span></Label><Input value={formData.assuranceNumber} onChange={e => handleChange("assuranceNumber", e.target.value)} placeholder="XXXXXXXX" className="mt-1.5" /></div>
                  
                  <div className="border-t pt-4">
                    <div><Label>Mot de passe *</Label>
                      <div className="relative mt-1.5">
                        <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleChange("password", e.target.value)} placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.password && !passwordValid && (
                        <p className="text-xs text-destructive mt-1">Minimum 8 caractères</p>
                      )}
                    </div>
                    <div className="mt-3"><Label>Confirmer le mot de passe *</Label>
                      <Input type="password" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="••••••••" className="mt-1.5" required />
                      {formData.confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-destructive mt-1">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input type="checkbox" required className="rounded border-input mt-1" />
                    <p className="text-xs text-muted-foreground">
                      J'accepte les <Link to="/legal/cgu" className="text-primary hover:underline">CGU</Link> et la <Link to="/legal/privacy" className="text-primary hover:underline">politique de confidentialité</Link> de Medicare.
                    </p>
                  </div>

                  <Button type="submit" disabled={!formValid} className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-11">
                    Créer mon compte <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
                </p>
              </div>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <div className="text-center py-8">
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenue sur Medicare ! 🎉</h2>
                <p className="text-muted-foreground mb-6">Votre compte patient a été créé avec succès.</p>
                
                <div className="rounded-xl border bg-card p-5 text-left mb-6 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Prochaines étapes :</p>
                  {[
                    { done: true, text: "Compte créé" },
                    { done: false, text: "Complétez votre profil santé" },
                    { done: false, text: "Prenez votre premier rendez-vous" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {s.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={`text-sm ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <Link to="/dashboard/patient"><Button className="w-full gradient-primary text-primary-foreground">Accéder à mon espace <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
                  <Link to="/search"><Button variant="outline" className="w-full"><Stethoscope className="h-4 w-4 mr-1" />Trouver un médecin</Button></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
