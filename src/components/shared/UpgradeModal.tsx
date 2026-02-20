import { Crown, CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  role?: "doctor" | "secretary";
}

const proFeatures = [
  "Téléconsultation vidéo",
  "Gestion de secrétaire(s)",
  "Ordonnances numériques",
  "SMS de rappel illimités",
  "Statistiques avancées",
  "Dossier patient complet",
  "Support prioritaire",
];

const UpgradeModal = ({ open, onClose, feature, role = "doctor" }: UpgradeModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-3">
            <Crown className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Passez au plan Pro</h3>
          <p className="text-sm text-muted-foreground mt-1">
            La fonctionnalité <span className="font-medium text-primary">« {feature} »</span> est disponible avec le plan Pro.
          </p>
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">Ce que Pro débloque :</p>
          <ul className="space-y-2">
            {proFeatures.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-foreground">129</span>
          <span className="text-muted-foreground ml-1">DT/mois</span>
        </div>

        <Link to={`/dashboard/${role}/subscription`}>
          <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-11">
            <Zap className="h-4 w-4 mr-2" />Découvrir le plan Pro
          </Button>
        </Link>
        <p className="text-[10px] text-muted-foreground text-center mt-3">Essai gratuit 14 jours · Sans engagement</p>
      </div>
    </div>
  );
};

export default UpgradeModal;
