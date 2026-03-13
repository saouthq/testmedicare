/**
 * ForgotPassword — Supabase password reset flow.
 * Sends a reset email via Supabase Auth.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Stethoscope, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { resetPassword } from "@/stores/authStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setSent(true);
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
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

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.tn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11" disabled={loading || !email.trim()}>
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Email envoyé !</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Si un compte existe avec l'adresse <strong className="text-foreground">{email}</strong>, vous recevrez un lien de réinitialisation.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Vérifiez aussi vos spams si vous ne trouvez pas l'email.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
