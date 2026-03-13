/**
 * ResetPassword — Page shown after clicking the password reset link.
 * Allows the user to set a new password.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Stethoscope, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { updatePassword } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Check for recovery session in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValidSession(true);
    }
    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) return;
    setLoading(true);
    setError("");

    try {
      await updatePassword(password);
      setSuccess(true);
      toast({ title: "Mot de passe modifié", description: "Vous pouvez maintenant vous connecter." });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Lien invalide ou expiré</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.</p>
          <Button onClick={() => navigate("/forgot-password")} className="mt-6 gradient-primary text-primary-foreground">
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Medicare</span>
        </div>

        {!success ? (
          <>
            <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && !passwordValid && (
                  <p className="text-xs text-destructive mt-1">Min. 8 caractères, 1 majuscule, 1 chiffre</p>
                )}
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
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11" disabled={loading || !passwordValid || !passwordsMatch}>
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Mot de passe modifié !</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <Button onClick={() => navigate("/login")} className="mt-6 gradient-primary text-primary-foreground">
              Se connecter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
