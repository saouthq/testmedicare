import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff, Shield, Users, Calendar, Pill, FlaskConical, Building2, ShieldCheck, Play } from "lucide-react";
import { loginDemoAs, DEMO_SCENARIOS, useAuth, type UserRole } from "@/stores/authStore";

const roleIcons: Record<string, any> = {
  patient: Users, doctor: Stethoscope, pharmacy: Pill, laboratory: FlaskConical,
  secretary: Building2, admin: ShieldCheck, hospital: Building2, clinic: Building2,
};

const roleColors: Record<string, string> = {
  patient: "text-primary", doctor: "text-accent", pharmacy: "text-warning",
  laboratory: "text-primary", secretary: "text-primary", admin: "text-destructive",
  hospital: "text-primary", clinic: "text-primary",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect
  if (user) {
    navigate(`/dashboard/${user.role}`, { replace: true });
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO BACKEND: POST /api/auth/login with email/password
    setTimeout(() => {
      setLoading(false);
      let role: UserRole = "patient";
      if (email.includes("doctor") || email.includes("dr")) role = "doctor";
      else if (email.includes("pharma")) role = "pharmacy";
      else if (email.includes("labo")) role = "laboratory";
      else if (email.includes("admin")) role = "admin";
      else if (email.includes("secr")) role = "secretary";
      else if (email.includes("hopit") || email.includes("hospit")) role = "hospital";
      else if (email.includes("clini")) role = "clinic";
      loginDemoAs(role);
      navigate(`/dashboard/${role}`);
    }, 800);
  };

  const handleDemoLogin = (scenarioId: string) => {
    const user = loginDemoAs(scenarioId);
    navigate(`/dashboard/${user.role}`);
  };

  const handleQuickLogin = (role: string) => {
    loginDemoAs(role);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur"><Stethoscope className="h-7 w-7 text-primary-foreground" /></div>
            <div>
              <span className="text-2xl font-bold">Medicare</span>
              <p className="text-primary-foreground/70 text-xs">Tunisie 🇹🇳</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold">Bienvenue sur votre plateforme de santé</h2>
          <p className="mt-4 text-primary-foreground/80">Gérez vos rendez-vous, consultez vos résultats et communiquez avec vos professionnels de santé en toute sécurité. Toutes assurances acceptées.</p>
          <div className="mt-6 flex items-center gap-2 text-primary-foreground/70 text-sm"><Shield className="h-4 w-4" />Données hébergées en Tunisie · Conforme réglementation</div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"><Stethoscope className="h-5 w-5 text-primary-foreground" /></div>
            <span className="text-xl font-bold text-foreground">Medicare</span>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-2 text-muted-foreground">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="votre@email.tn" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-input" /><span className="text-muted-foreground">Se souvenir de moi</span></label>
              <a href="#" className="text-sm text-primary hover:underline">Mot de passe oublié ?</a>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-11" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Demo profiles selector */}
          <div className="mt-8">
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Accès rapide (démo)</span></div></div>
            
            {!showDemoProfiles ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { role: "patient", label: "Patient" },
                  { role: "doctor", label: "Médecin" },
                  { role: "pharmacy", label: "Pharmacie" },
                  { role: "secretary", label: "Secrétaire" },
                  { role: "laboratory", label: "Laboratoire" },
                  { role: "hospital", label: "Hôpital" },
                  { role: "clinic", label: "Clinique" },
                  { role: "admin", label: "Admin" },
                ].map(r => {
                  const Icon = roleIcons[r.role] || Users;
                  return (
                    <Button key={r.role} variant="outline" className="w-full" size="sm" onClick={() => handleQuickLogin(r.role)}>
                      <Icon className={`h-3.5 w-3.5 mr-1.5 ${roleColors[r.role]}`} />
                      {r.label}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {DEMO_SCENARIOS.map(scenario => {
                  const Icon = roleIcons[scenario.user.role] || Users;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleDemoLogin(scenario.id)}
                      className="w-full rounded-xl border bg-card p-3 text-left hover:border-primary/50 hover:shadow-card transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          scenario.user.role === "patient" ? "bg-primary/10" :
                          scenario.user.role === "doctor" ? "bg-accent/10" :
                          scenario.user.role === "admin" ? "bg-destructive/10" :
                          "bg-muted"
                        }`}>
                          <Icon className={`h-5 w-5 ${roleColors[scenario.user.role]}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{scenario.label}</p>
                          <p className="text-[11px] text-muted-foreground">{scenario.description}</p>
                        </div>
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowDemoProfiles(!showDemoProfiles)}
              className="mt-3 w-full text-center text-xs text-primary hover:underline"
            >
              {showDemoProfiles ? "← Accès rapide" : "Voir les profils de démo détaillés →"}
            </button>
          </div>

          {/* Demo banner */}
          <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3">
            <p className="text-[11px] text-muted-foreground text-center">
              🔒 <span className="font-medium text-foreground">Mode démo</span> — SMS / paiements simulés, aucune donnée réelle transmise.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">Pas encore de compte ?{" "}<Link to="/register" className="text-primary hover:underline font-medium">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
