/**
 * How It Works Page — Comment ça marche
 * Enriched with testimonials, interactive FAQ, and download CTA
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Search, Calendar, CheckCircle, Video, Shield, Clock, Smartphone,
  CreditCard, FileText, Bell, Heart, Users, ChevronRight, ChevronDown,
  ChevronUp, MapPin, Stethoscope, Pill, Star, ArrowRight, Lock,
} from "lucide-react";

const HowItWorks = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const steps = [
    { step: "1", icon: Search, title: "Recherchez", description: "Trouvez un praticien par spécialité, ville ou nom. Filtrez par disponibilité, téléconsultation ou prise en charge assurance.", color: "bg-primary/10 text-primary" },
    { step: "2", icon: Calendar, title: "Réservez", description: "Choisissez un créneau disponible et confirmez votre rendez-vous en quelques clics. Pas besoin de compte pour réserver.", color: "bg-accent/10 text-accent" },
    { step: "3", icon: Smartphone, title: "Recevez un rappel", description: "Un SMS de confirmation est envoyé immédiatement. Vous recevez également un rappel 24h avant votre rendez-vous.", color: "bg-warning/10 text-warning" },
    { step: "4", icon: CheckCircle, title: "Consultez", description: "Présentez-vous au cabinet ou rejoignez votre téléconsultation vidéo. Votre dossier médical est accessible au praticien.", color: "bg-accent/10 text-accent" },
  ];

  const features = [
    { icon: Video, title: "Téléconsultation", description: "Consultez votre médecin depuis chez vous en visioconférence sécurisée. Ordonnance numérique incluse." },
    { icon: Shield, title: "Prise en charge assurance", description: "Trouvez des praticiens conventionnés. Feuille de soins électronique." },
    { icon: Clock, title: "Disponible 24h/24", description: "Prenez rendez-vous à tout moment, même en dehors des heures d'ouverture." },
    { icon: CreditCard, title: "Tarifs affichés", description: "Consultez les tarifs avant de réserver. Paiement en Dinars tunisiens." },
    { icon: FileText, title: "Documents numériques", description: "Accédez à vos ordonnances, résultats d'analyses et feuilles de soins en ligne." },
    { icon: Bell, title: "Rappels automatiques", description: "Ne manquez plus vos rendez-vous grâce aux rappels SMS et notifications." },
    { icon: Pill, title: "Ordonnances en pharmacie", description: "Envoyez vos ordonnances à plusieurs pharmacies et comparez les disponibilités." },
    { icon: Lock, title: "Données sécurisées", description: "Vos données de santé sont chiffrées et protégées selon les normes en vigueur." },
  ];

  const testimonials = [
    { name: "Fatma T.", city: "Ariana", text: "J'ai pris rendez-vous avec un cardiologue en 2 minutes. Le rappel SMS m'a évité d'oublier. Service excellent !", role: "Patiente" },
    { name: "Mehdi B.", city: "Sousse", text: "La téléconsultation m'a fait gagner 3 heures de trajet. Mon médecin m'a envoyé l'ordonnance directement.", role: "Patient" },
    { name: "Dr. Sonia G.", city: "Tunis", text: "Medicare a réduit mes absences de 40%. L'agenda en ligne et les rappels automatiques changent tout.", role: "Cardiologue" },
    { name: "Nadia J.", city: "Manouba", text: "Pouvoir comparer les disponibilités des médecins et leurs tarifs, c'est un vrai plus.", role: "Patiente" },
  ];

  const faqs = [
    { q: "Dois-je créer un compte pour prendre rendez-vous ?", a: "Non, vous pouvez prendre rendez-vous sans compte en vérifiant simplement votre numéro de téléphone par SMS. Un compte vous permet toutefois d'accéder à votre historique, vos ordonnances et vos documents." },
    { q: "Comment annuler ou modifier un rendez-vous ?", a: "Vous pouvez annuler ou modifier votre rendez-vous via la page 'Mes rendez-vous' en entrant votre numéro de téléphone. Depuis votre espace patient, l'annulation est en un clic." },
    { q: "Comment fonctionne la téléconsultation ?", a: "La téléconsultation se fait par visioconférence sécurisée directement dans votre navigateur — aucune application à installer. Vous recevez un lien par SMS avant le rendez-vous." },
    { q: "Les praticiens sont-ils vérifiés ?", a: "Oui, tous les praticiens sur Medicare sont des professionnels de santé diplômés et inscrits à l'Ordre des Médecins ou à l'ordre professionnel correspondant." },
    { q: "Puis-je envoyer mon ordonnance à une pharmacie ?", a: "Oui ! Depuis votre espace patient, vous pouvez envoyer vos ordonnances à jusqu'à 6 pharmacies partenaires et suivre la préparation en temps réel." },
    { q: "Est-ce que ma mutuelle est prise en charge ?", a: "Oui, vous pouvez filtrer les praticiens par prise en charge assurance. Les principales mutuelles tunisiennes sont référencées sur la plateforme." },
    { q: "Medicare est-il gratuit pour les patients ?", a: "Oui, l'utilisation de Medicare est entièrement gratuite pour les patients. Vous ne payez que la consultation auprès du praticien." },
  ];

  const useCases = [
    { icon: Stethoscope, title: "Consultation classique", desc: "Trouvez un généraliste ou spécialiste, réservez un créneau, consultez au cabinet.", steps: ["Recherche par spécialité", "Choix du créneau", "SMS de confirmation", "Consultation"] },
    { icon: Video, title: "Téléconsultation", desc: "Consultez depuis chez vous en vidéo sécurisée, recevez votre ordonnance.", steps: ["Filtrer 'Téléconsultation'", "Réserver le créneau", "Paiement en ligne", "Vidéo sécurisée"] },
    { icon: Pill, title: "Renouvellement ordonnance", desc: "Demandez le renouvellement de vos traitements sans vous déplacer.", steps: ["Accéder à l'ordonnance", "Cliquer 'Renouveler'", "Validation médecin", "Pharmacie notifiée"] },
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Comment ça marche ?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prenez rendez-vous avec un médecin en Tunisie en quelques clics. Simple, rapide et sécurisé.
          </p>
        </div>

        {/* Steps — with connecting lines */}
        <div className="relative mb-16">
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-border" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`h-16 w-16 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-4 relative z-10 border-4 border-background`}>
                  <s.icon className="h-8 w-8" />
                </div>
                <div className="text-xs text-primary font-bold mb-1">Étape {s.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl gradient-hero p-8 text-center mb-16">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Prêt à prendre rendez-vous ?</h2>
          <p className="text-primary-foreground/80 mb-6">Trouvez un médecin disponible près de chez vous dès maintenant.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/search"><Button size="lg" className="bg-white text-primary hover:bg-white/90"><Search className="h-4 w-4 mr-2" />Trouver un médecin</Button></Link>
            <Link to="/my-appointments"><Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Calendar className="h-4 w-4 mr-2" />Retrouver mes RDV</Button></Link>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Cas d'usage concrets</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {useCases.map((uc, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <uc.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{uc.title}</h3>
                    <p className="text-xs text-muted-foreground">{uc.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {uc.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${j === uc.steps.length - 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{j + 1}</div>
                      <span className="text-sm text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Les avantages Medicare</h2>
          <p className="text-muted-foreground text-center mb-8">Tout ce dont vous avez besoin pour gérer votre santé en ligne.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group">
                <f.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Ce qu'ils en disent</h2>
          <p className="text-muted-foreground text-center mb-8">Patients et praticiens partagent leur expérience.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role} · {t.city}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ — Interactive accordion */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Questions fréquentes</h2>
          <p className="text-muted-foreground text-center mb-8">Tout ce que vous devez savoir avant de commencer.</p>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1 animate-fade-in">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/help" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              Voir toutes les questions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border bg-card shadow-card p-8 mb-16">
          <div className="grid gap-6 text-center sm:grid-cols-4">
            {[
              { value: "5 000+", label: "Praticiens vérifiés" },
              { value: "500K+", label: "Patients inscrits" },
              { value: "2M+", label: "RDV pris en ligne" },
              { value: "98%", label: "Taux de satisfaction" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro CTA */}
        <div className="rounded-xl border bg-card p-8 text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <Heart className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Vous êtes professionnel de santé ?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">Rejoignez Medicare pour gérer votre agenda, vos patients et développer votre activité.</p>
          <Link to="/become-partner"><Button className="gradient-primary text-primary-foreground">Devenir partenaire <ChevronRight className="h-4 w-4 ml-1" /></Button></Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default HowItWorks;
