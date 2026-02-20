import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff, Shield } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login - simulate redirect based on email
    setTimeout(() => {
      setLoading(false);
      if (email.includes("doctor") || email.includes("dr")) {
        navigate("/dashboard/doctor");
      } else if (email.includes("pharma")) {
        navigate("/dashboard/pharmacy");
      } else if (email.includes("labo")) {
        navigate("/dashboard/laboratory");
      } else if (email.includes("admin")) {
        navigate("/dashboard/admin");
      } else if (email.includes("secr")) {
        navigate("/dashboard/secretary");
      } else {
        navigate("/dashboard/patient");
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur"><Stethoscope className="h-7 w-7 text-primary-foreground" /></div>
            <div>
              <span className="text-2xl font-bold">MediConnect</span>
              <p className="text-primary-foreground/70 text-xs">Tunisie 🇹🇳</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold">Bienvenue sur votre plateforme de santé</h2>
          <p className="mt-4 text-primary-foreground/80">Gérez vos rendez-vous, consultez vos résultats et communiquez avec vos professionnels de santé en toute sécurité. Praticiens conventionnés CNAM.</p>
          <div className="mt-6 flex items-center gap-2 text-primary-foreground/70 text-sm"><Shield className="h-4 w-4" />Données hébergées en Tunisie · Conforme CNAM</div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary"><Stethoscope className="h-5 w-5 text-primary-foreground" /></div>
            <span className="text-xl font-bold text-foreground">MediConnect</span>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-2 text-muted-foreground">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="votre@email.tn" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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

          <div className="mt-8">
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Accès rapide (démo)</span></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/dashboard/patient"><Button variant="outline" className="w-full" size="sm">Patient</Button></Link>
              <Link to="/dashboard/doctor"><Button variant="outline" className="w-full" size="sm">Médecin</Button></Link>
              <Link to="/dashboard/pharmacy"><Button variant="outline" className="w-full" size="sm">Pharmacie</Button></Link>
              <Link to="/dashboard/secretary"><Button variant="outline" className="w-full" size="sm">Secrétaire</Button></Link>
              <Link to="/dashboard/laboratory"><Button variant="outline" className="w-full" size="sm">Laboratoire</Button></Link>
              <Link to="/dashboard/admin"><Button variant="outline" className="w-full" size="sm">Admin</Button></Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">Pas encore de compte ?{" "}<Link to="/register" className="text-primary hover:underline font-medium">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
