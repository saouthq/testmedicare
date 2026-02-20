import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff } from "lucide-react";

const roles = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Médecin" },
  { value: "pharmacy", label: "Pharmacie" },
  { value: "laboratory", label: "Laboratoire" },
  { value: "secretary", label: "Secrétaire" },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("patient");

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
              <Stethoscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">MediConnect</span>
          </div>
          <h2 className="text-3xl font-bold">Rejoignez MediConnect</h2>
          <p className="mt-4 text-primary-foreground/80">
            Créez votre compte et accédez à l'ensemble des services de la plateforme.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediConnect</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="mt-2 text-muted-foreground">Choisissez votre profil et remplissez vos informations</p>

          <div className="mt-6">
            <Label>Vous êtes</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                    selectedRole === r.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstname">Prénom</Label>
                <Input id="firstname" placeholder="Jean" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="lastname">Nom</Label>
                <Input id="lastname" placeholder="Dupont" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" placeholder="06 12 34 56 78" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-11">
              Créer mon compte
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
