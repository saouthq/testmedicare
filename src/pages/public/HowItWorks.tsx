/**
 * How It Works Page — Comment ça marche
 */
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Search, Calendar, CheckCircle, Video, Shield, Clock, Smartphone,
  CreditCard, FileText, Bell, Heart, Users, ChevronRight,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      icon: Search,
      title: "Recherchez",
      description: "Trouvez un praticien par spécialité, ville ou nom. Filtrez par disponibilité, téléconsultation ou prise en charge assurance.",
    },
    {
      step: "2",
      icon: Calendar,
      title: "Réservez",
      description: "Choisissez un créneau disponible et confirmez votre rendez-vous en quelques clics. Pas besoin de compte pour réserver.",
    },
    {
      step: "3",
      icon: Smartphone,
      title: "Recevez un rappel",
      description: "Un SMS de confirmation est envoyé immédiatement. Vous recevez également un rappel 24h avant votre rendez-vous.",
    },
    {
      step: "4",
      icon: CheckCircle,
      title: "Consultez",
      description: "Présentez-vous au cabinet ou rejoignez votre téléconsultation vidéo. Votre dossier médical est accessible au praticien.",
    },
  ];

  const features = [
    {
      icon: Video,
      title: "Téléconsultation",
      description: "Consultez votre médecin depuis chez vous en visioconférence sécurisée.",
    },
    {
      icon: Shield,
      title: "Prise en charge assurance",
      description: "Trouvez des praticiens conventionnés et pris en charge par les assurances.",
    },
    {
      icon: Clock,
      title: "Disponible 24h/24",
      description: "Prenez rendez-vous à tout moment, même en dehors des heures d'ouverture.",
    },
    {
      icon: CreditCard,
      title: "Tarifs affichés",
      description: "Consultez les tarifs avant de réserver. Paiement en Dinars tunisiens.",
    },
    {
      icon: FileText,
      title: "Documents numériques",
      description: "Accédez à vos ordonnances et résultats d'analyses en ligne.",
    },
    {
      icon: Bell,
      title: "Rappels automatiques",
      description: "Ne manquez plus vos rendez-vous grâce aux rappels SMS.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Comment ça marche | Medicare Tunisie" 
        description="Découvrez comment prendre rendez-vous avec un médecin en ligne sur Medicare. Recherche, réservation, téléconsultation : tout est simple et rapide." 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Comment ça marche" }]} />

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prenez rendez-vous avec un médecin en Tunisie en quelques clics. 
            Simple, rapide et sécurisé.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {steps.map((s, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground">
                <s.icon className="h-8 w-8" />
              </div>
              <div className="text-xs text-primary font-bold mb-1">Étape {s.step}</div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl gradient-hero p-8 text-center mb-16">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">
            Prêt à prendre rendez-vous ?
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Trouvez un médecin disponible près de chez vous dès maintenant.
          </p>
          <Link to="/search">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              <Search className="h-4 w-4 mr-2" />Trouver un médecin
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Les avantages Medicare
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "Dois-je créer un compte pour prendre rendez-vous ?",
                a: "Non, vous pouvez prendre rendez-vous sans compte en vérifiant simplement votre numéro de téléphone. Un compte vous permet toutefois d'accéder à votre historique et vos documents.",
              },
              {
                q: "Comment annuler ou modifier un rendez-vous ?",
                a: "Vous pouvez annuler ou modifier votre rendez-vous via la page 'Mes rendez-vous' en entrant votre numéro de téléphone, ou depuis votre espace patient si vous avez un compte.",
              },
              {
                q: "Comment fonctionne la téléconsultation ?",
                a: "La téléconsultation se fait par visioconférence sécurisée. Vous recevez un lien par SMS avant le rendez-vous. Assurez-vous d'avoir une connexion internet stable.",
              },
              {
                q: "Les praticiens sont-ils vérifiés ?",
                a: "Oui, tous les praticiens sur Medicare sont des professionnels de santé diplômés et inscrits à l'Ordre des Médecins de Tunisie.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/help" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              Voir toutes les questions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Pro CTA */}
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <Heart className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Vous êtes professionnel de santé ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Rejoignez Medicare pour gérer votre agenda, vos patients et développer votre activité.
          </p>
          <Link to="/become-partner">
            <Button className="gradient-primary text-primary-foreground">
              Devenir partenaire <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
