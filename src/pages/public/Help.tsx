/**
 * Help / FAQ Page
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, HelpCircle, Calendar, CreditCard,
  Video, Shield, User, Phone, Mail,
} from "lucide-react";

const faqCategories = [
  {
    id: "appointments",
    icon: Calendar,
    title: "Rendez-vous",
    questions: [
      {
        q: "Comment prendre rendez-vous ?",
        a: "Recherchez un praticien par spécialité ou nom, sélectionnez un créneau disponible, et confirmez votre rendez-vous. Vous pouvez réserver sans compte en vérifiant votre numéro de téléphone.",
      },
      {
        q: "Comment annuler ou modifier un rendez-vous ?",
        a: "Rendez-vous sur la page 'Mes rendez-vous', entrez votre numéro de téléphone, puis sélectionnez le rendez-vous à modifier ou annuler. L'annulation est gratuite jusqu'à 24h avant.",
      },
      {
        q: "Que faire si je suis en retard ?",
        a: "Contactez le cabinet directement. Un retard de plus de 15 minutes peut entraîner l'annulation du rendez-vous selon la politique du praticien.",
      },
      {
        q: "Comment retrouver mes rendez-vous passés ?",
        a: "Depuis la page 'Mes rendez-vous' avec votre numéro de téléphone, ou depuis votre espace patient si vous avez créé un compte.",
      },
    ],
  },
  {
    id: "teleconsultation",
    icon: Video,
    title: "Téléconsultation",
    questions: [
      {
        q: "Comment fonctionne la téléconsultation ?",
        a: "La consultation se fait par visioconférence sécurisée. Vous recevez un lien par SMS quelques minutes avant le rendez-vous. Cliquez dessus pour rejoindre la salle d'attente virtuelle.",
      },
      {
        q: "De quoi ai-je besoin pour une téléconsultation ?",
        a: "Un smartphone, tablette ou ordinateur avec une caméra et un microphone, ainsi qu'une connexion internet stable. Aucune application à installer.",
      },
      {
        q: "Puis-je recevoir une ordonnance en téléconsultation ?",
        a: "Oui, le médecin peut vous délivrer une ordonnance numérique que vous pouvez présenter en pharmacie ou télécharger depuis votre espace.",
      },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Paiement & Assurance",
    questions: [
      {
        q: "Comment payer ma consultation ?",
        a: "Le paiement se fait généralement au cabinet (espèces, carte bancaire). Pour les téléconsultations, le paiement en ligne peut être proposé par certains praticiens.",
      },
      {
        q: "Les consultations sont-elles prises en charge par l'assurance ?",
        a: "De nombreux praticiens sont conventionnés CNAM ou acceptent les assurances privées. Filtrez par 'Assurance' lors de votre recherche pour trouver des praticiens conventionnés.",
      },
      {
        q: "Comment fonctionne le tiers payant ?",
        a: "Avec le tiers payant, vous ne payez que la partie non remboursée (ticket modérateur). Présentez votre carte d'assurance au praticien.",
      },
    ],
  },
  {
    id: "account",
    icon: User,
    title: "Compte & Données",
    questions: [
      {
        q: "Dois-je créer un compte ?",
        a: "Non, vous pouvez prendre rendez-vous sans compte en vérifiant votre numéro de téléphone. Un compte vous permet cependant d'accéder facilement à votre historique, documents et ordonnances.",
      },
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur 'S'inscrire' ou créez un compte après avoir pris un rendez-vous. Vous aurez besoin d'un email et d'un mot de passe.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Contactez-nous via le formulaire de contact. Votre compte et vos données seront supprimés conformément à la réglementation.",
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Oui, vos données de santé sont chiffrées et stockées de manière sécurisée. Nous respectons les normes de protection des données de santé.",
      },
    ],
  },
  {
    id: "practitioners",
    icon: Shield,
    title: "Praticiens",
    questions: [
      {
        q: "Les praticiens sont-ils vérifiés ?",
        a: "Oui, tous les praticiens sur Medicare sont des professionnels de santé diplômés et inscrits à l'Ordre des Médecins de Tunisie ou à leur ordre professionnel respectif.",
      },
      {
        q: "Comment signaler un problème avec un praticien ?",
        a: "Utilisez le formulaire de contact en précisant le nom du praticien et la nature du problème. Nous traiterons votre signalement dans les plus brefs délais.",
      },
      {
        q: "Comment devenir praticien partenaire ?",
        a: "Rendez-vous sur la page 'Devenir partenaire' et remplissez le formulaire d'inscription. Notre équipe vous contactera pour finaliser votre inscription.",
      },
    ],
  },
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("appointments");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedQuestions(newExpanded);
  };

  // Filter questions by search
  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      !searchQuery || 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Aide & FAQ | Medicare Tunisie" 
        description="Trouvez des réponses à vos questions sur Medicare : rendez-vous, téléconsultation, paiement, compte et plus." 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Aide" }]} />

        <div className="text-center mb-8">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Centre d'aide</h1>
          <p className="text-muted-foreground">Comment pouvons-nous vous aider ?</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une question..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10" 
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">{cat.title}</span>
                  <span className="text-xs text-muted-foreground">({cat.questions.length})</span>
                </div>
                {expandedCategory === cat.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {expandedCategory === cat.id && (
                <div className="border-t">
                  {cat.questions.map((q, i) => {
                    const isExpanded = expandedQuestions.has(`${cat.id}-${i}`);
                    return (
                      <div key={i} className="border-b last:border-0">
                        <button
                          onClick={() => toggleQuestion(cat.id, i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          <span className="font-medium text-foreground pr-4">{q.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">{q.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-xl border bg-card p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Vous n'avez pas trouvé de réponse ?</h2>
          <p className="text-muted-foreground mb-6">Notre équipe est là pour vous aider.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:support@medicare.tn" className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="h-4 w-4" />support@medicare.tn
            </a>
            <a href="tel:+21671234567" className="flex items-center gap-2 text-primary hover:underline">
              <Phone className="h-4 w-4" />+216 71 234 567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
