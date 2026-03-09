/**
 * Legal Pages — CGU, Confidentialité, Cookies
 */
import { useParams, Link, Navigate } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { FileText, Shield, Cookie } from "lucide-react";

type LegalPage = "cgu" | "privacy" | "cookies";

const legalContent: Record<LegalPage, { title: string; icon: any; sections: { title: string; content: string }[] }> = {
  cgu: {
    title: "Conditions Générales d'Utilisation",
    icon: FileText,
    sections: [
      {
        title: "1. Objet",
        content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme Medicare.tn, accessible à l'adresse medicare.tn. En accédant à ce site, vous acceptez sans réserve les présentes CGU.",
      },
      {
        title: "2. Services proposés",
        content: "Medicare.tn est une plateforme de prise de rendez-vous médicaux en ligne. Elle permet aux patients de rechercher des praticiens, de consulter leurs disponibilités et de réserver des rendez-vous. La plateforme propose également des services de téléconsultation pour certains praticiens.",
      },
      {
        title: "3. Inscription et compte",
        content: "L'utilisation de certains services nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Il est responsable de toutes les activités effectuées depuis son compte.",
      },
      {
        title: "4. Responsabilités",
        content: "Medicare.tn agit en tant qu'intermédiaire technique entre les patients et les praticiens. La plateforme ne se substitue pas à une consultation médicale et ne fournit pas de conseil médical. Les praticiens référencés sont des professionnels de santé indépendants.",
      },
      {
        title: "5. Propriété intellectuelle",
        content: "L'ensemble des contenus présents sur Medicare.tn (textes, images, logos, logiciels) sont protégés par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.",
      },
      {
        title: "6. Données personnelles",
        content: "Le traitement des données personnelles est détaillé dans notre Politique de Confidentialité. En utilisant nos services, vous acceptez notre politique de traitement des données.",
      },
      {
        title: "7. Modification des CGU",
        content: "Medicare.tn se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification importante.",
      },
      {
        title: "8. Droit applicable",
        content: "Les présentes CGU sont régies par le droit tunisien. Tout litige sera soumis aux tribunaux compétents de Tunis.",
      },
    ],
  },
  privacy: {
    title: "Politique de Confidentialité",
    icon: Shield,
    sections: [
      {
        title: "1. Collecte des données",
        content: "Medicare.tn collecte les données personnelles nécessaires à la fourniture de ses services : nom, prénom, email, numéro de téléphone, date de naissance. Pour les rendez-vous médicaux, des données de santé peuvent également être collectées.",
      },
      {
        title: "2. Finalités du traitement",
        content: "Vos données sont utilisées pour : la gestion de votre compte, la prise de rendez-vous, l'envoi de rappels et notifications, l'amélioration de nos services, et le respect de nos obligations légales.",
      },
      {
        title: "3. Base légale",
        content: "Le traitement de vos données repose sur : votre consentement, l'exécution du contrat de service, nos obligations légales, et nos intérêts légitimes.",
      },
      {
        title: "4. Destinataires des données",
        content: "Vos données peuvent être partagées avec : les praticiens pour vos rendez-vous, nos prestataires techniques, les autorités compétentes si requis par la loi.",
      },
      {
        title: "5. Durée de conservation",
        content: "Les données de compte sont conservées pendant la durée de votre inscription. Les données médicales sont conservées conformément à la réglementation applicable (20 ans minimum).",
      },
      {
        title: "6. Sécurité",
        content: "Medicare.tn met en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement, contrôle d'accès, sauvegardes régulières.",
      },
      {
        title: "7. Vos droits",
        content: "Conformément à la loi, vous disposez des droits suivants : accès, rectification, suppression, opposition, limitation, portabilité. Pour exercer vos droits, contactez-nous à privacy@medicare.tn.",
      },
      {
        title: "8. Contact",
        content: "Pour toute question relative à la protection de vos données, contactez notre Délégué à la Protection des Données : dpo@medicare.tn.",
      },
    ],
  },
  cookies: {
    title: "Politique des Cookies",
    icon: Cookie,
    sections: [
      {
        title: "1. Qu'est-ce qu'un cookie ?",
        content: "Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet de stocker des informations relatives à votre navigation.",
      },
      {
        title: "2. Cookies utilisés",
        content: "Medicare.tn utilise : des cookies essentiels (fonctionnement du site), des cookies analytiques (mesure d'audience), des cookies de personnalisation (mémorisation de vos préférences).",
      },
      {
        title: "3. Cookies essentiels",
        content: "Ces cookies sont nécessaires au fonctionnement du site : authentification, sécurité, mémorisation du panier. Ils ne peuvent pas être désactivés.",
      },
      {
        title: "4. Cookies analytiques",
        content: "Nous utilisons des outils d'analyse pour comprendre comment les visiteurs utilisent notre site. Ces données sont anonymisées et nous aident à améliorer nos services.",
      },
      {
        title: "5. Gestion des cookies",
        content: "Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. La désactivation de certains cookies peut affecter votre expérience sur le site.",
      },
      {
        title: "6. Durée de conservation",
        content: "Les cookies sont conservés pour une durée maximale de 13 mois. Passé ce délai, votre consentement sera à nouveau sollicité.",
      },
      {
        title: "7. Mise à jour",
        content: "Cette politique peut être mise à jour. La date de dernière modification est indiquée en bas de page.",
      },
    ],
  },
};

const Legal = () => {
  const { page } = useParams<{ page: string }>();
  
  if (!page || !["cgu", "privacy", "cookies"].includes(page)) {
    return <Navigate to="/legal/cgu" replace />;
  }

  const pageData = legalContent[page as LegalPage];
  const Icon = pageData.icon;

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title={`${pageData.title} | Medicare`} 
        description={`${pageData.title} de Medicare.tn - Plateforme de rendez-vous médicaux en Tunisie.`} 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: pageData.title }]} />

        {/* Navigation tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Link 
            to="/legal/cgu" 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === "cgu" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />CGU
          </Link>
          <Link 
            to="/legal/privacy" 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === "privacy" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4" />Confidentialité
          </Link>
          <Link 
            to="/legal/cookies" 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === "cookies" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cookie className="h-4 w-4" />Cookies
          </Link>
        </div>

        {/* Content */}
        <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{pageData.title}</h1>
          </div>

          <div className="space-y-6">
            {pageData.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
            <p>Dernière mise à jour : 1er Mars 2026</p>
            <p className="mt-1">Medicare.tn - Société ABC SARL - RC Tunis B123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
