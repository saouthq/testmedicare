/**
 * PublicFooter — Footer partagé pour toutes les pages publiques
 * Style Doctolib : liens organisés, trust badges, contact
 */
import { Link } from "react-router-dom";
import { Stethoscope, MapPin, Phone, Mail, Shield, Lock, Heart, ChevronRight } from "lucide-react";

const PublicFooter = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Medicare</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Tunisie 🇹🇳</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs">
            La plateforme médicale complète pour la Tunisie. Trouvez un médecin, prenez rendez-vous en ligne, consultez à distance.
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />+216 71 000 000</p>
            <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />contact@medicare.tn</p>
            <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />Tunis, Tunisie</p>
          </div>
        </div>

        {/* Annuaires */}
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Annuaires</h4>
          <div className="space-y-1.5">
            <Link to="/search" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Médecins</Link>
            <Link to="/clinics" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Cliniques</Link>
            <Link to="/hospitals" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Hôpitaux</Link>
            <Link to="/pharmacies" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Pharmacies</Link>
            <Link to="/pharmacies?garde=true" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Pharmacies de garde</Link>
            <Link to="/medicaments" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Médicaments</Link>
          </div>
        </div>

        {/* Aide & Infos */}
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Aide & Infos</h4>
          <div className="space-y-1.5">
            <Link to="/how-it-works" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Comment ça marche</Link>
            <Link to="/help" className="block text-xs text-muted-foreground hover:text-primary transition-colors">FAQ / Centre d'aide</Link>
            <Link to="/my-appointments" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Retrouver mes RDV</Link>
            <Link to="/become-partner" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Devenir partenaire</Link>
            <Link to="/register" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Créer un compte</Link>
          </div>
        </div>

        {/* Légal */}
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Légal</h4>
          <div className="space-y-1.5">
            <Link to="/legal/cgu" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Conditions générales</Link>
            <Link to="/legal/privacy" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</Link>
            <Link to="/legal/cookies" className="block text-xs text-muted-foreground hover:text-primary transition-colors">Politique cookies</Link>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t pt-6 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" />Données sécurisées</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" />Chiffrement SSL</span>
          <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-primary" />Praticiens vérifiés</span>
          <span className="flex items-center gap-1.5">🇹🇳 Made in Tunisia</span>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Medicare Tunisie. Tous droits réservés. Plateforme de prise de rendez-vous médicaux.</p>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
