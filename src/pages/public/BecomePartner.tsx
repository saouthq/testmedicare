/**
 * Become Partner Page — Doctolib-style pricing with activity selector, plan comparison table
 * Connected to admin promos/promotions store — shows active promos dynamically
 * Registration feeds into AdminVerifications KYC queue
 * TODO BACKEND: Replace with real API
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Stethoscope, FlaskConical, Pill, Building2, CheckCircle2, Users,
  Calendar, TrendingUp, Shield, Video, Clock, ChevronRight, Check, X,
  FileText, Bot, BarChart3, MessageSquare, Phone, Gift, Sparkles, Upload,
} from "lucide-react";
import { getPromotions } from "@/services/admin/adminPromotionsService";
import { submitRegistration } from "@/stores/partnerRegistrationStore";
import type { Promotion } from "@/types/promotion";

// ── Activity types with specialties ──
type ActivityType = "generaliste" | "specialiste" | "dentiste" | "kine" | "laboratory" | "pharmacy" | "clinic";

interface ActivityConfig {
  id: ActivityType;
  label: string;
  icon: any;
  specialties?: string[];
}

const activities: ActivityConfig[] = [
  { id: "generaliste", label: "Médecin généraliste", icon: Stethoscope },
  { id: "specialiste", label: "Médecin spécialiste", icon: Stethoscope, specialties: ["Cardiologue", "Dermatologue", "Gynécologue", "Ophtalmologue", "ORL", "Pédiatre", "Pneumologue", "Rhumatologue", "Urologue", "Neurologue", "Autre"] },
  { id: "dentiste", label: "Dentiste", icon: Stethoscope },
  { id: "kine", label: "Kinésithérapeute", icon: Stethoscope },
  { id: "laboratory", label: "Laboratoire d'analyses", icon: FlaskConical },
  { id: "pharmacy", label: "Pharmacie", icon: Pill },
  { id: "clinic", label: "Clinique / Établissement", icon: Building2 },
];

// ── Plans per activity ──
interface PlanConfig {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted?: boolean;
  features: string[];
}

const plansByActivity: Record<ActivityType, PlanConfig[]> = {
  generaliste: [
    {
      name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 49, yearlyPrice: 39,
      features: ["Agenda en ligne 24h/24", "Prise de RDV patients", "Rappels SMS automatiques", "Fiche patient basique", "Support email"],
    },
    {
      name: "Pro", subtitle: "Gestion complète", monthlyPrice: 149, yearlyPrice: 129, highlighted: true,
      features: ["Tout Essentiel +", "Dossier médical complet", "Ordonnances numériques", "Téléconsultation vidéo", "Statistiques détaillées", "Assistant IA diagnostic", "Messagerie patient", "Support prioritaire"],
    },
    {
      name: "Cabinet +", subtitle: "Multi-praticiens", monthlyPrice: 299, yearlyPrice: 249,
      features: ["Tout Pro +", "Jusqu'à 5 praticiens", "Secrétariat partagé", "Facturation centralisée", "Compte-rendu automatisé", "API & intégrations", "Account manager dédié"],
    },
  ],
  specialiste: [
    {
      name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 59, yearlyPrice: 49,
      features: ["Agenda en ligne 24h/24", "Prise de RDV patients", "Rappels SMS automatiques", "Fiche patient basique", "Support email"],
    },
    {
      name: "Pro", subtitle: "Gestion clinique", monthlyPrice: 169, yearlyPrice: 139, highlighted: true,
      features: ["Tout Essentiel +", "Dossier médical complet", "Ordonnances spécialisées", "Téléconsultation HD", "Demandes d'analyses", "Statistiques avancées", "Assistant IA spécialisé", "Support prioritaire"],
    },
    {
      name: "Cabinet +", subtitle: "Multi-praticiens", monthlyPrice: 329, yearlyPrice: 279,
      features: ["Tout Pro +", "Jusqu'à 5 praticiens", "Secrétariat partagé", "Facturation centralisée", "Protocoles personnalisés", "API & intégrations", "Account manager dédié"],
    },
  ],
  dentiste: [
    {
      name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 49, yearlyPrice: 39,
      features: ["Agenda en ligne 24h/24", "Prise de RDV patients", "Rappels SMS automatiques", "Fiche patient basique", "Support email"],
    },
    {
      name: "Pro", subtitle: "Gestion complète", monthlyPrice: 149, yearlyPrice: 129, highlighted: true,
      features: ["Tout Essentiel +", "Dossier dentaire complet", "Schéma dentaire numérique", "Devis & plans de traitement", "Statistiques détaillées", "Messagerie patient", "Support prioritaire"],
    },
  ],
  kine: [
    {
      name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 39, yearlyPrice: 29,
      features: ["Agenda en ligne 24h/24", "Prise de RDV patients", "Rappels SMS automatiques", "Fiche patient basique", "Support email"],
    },
    {
      name: "Pro", subtitle: "Suivi complet", monthlyPrice: 119, yearlyPrice: 99, highlighted: true,
      features: ["Tout Essentiel +", "Bilan & suivi kinésithérapie", "Exercices à domicile", "Téléconsultation", "Statistiques", "Support prioritaire"],
    },
  ],
  laboratory: [
    {
      name: "Standard", subtitle: "Gestion labo", monthlyPrice: 79, yearlyPrice: 59,
      features: ["Réception demandes d'analyses", "Upload résultats PDF", "Notification patients", "Tableau de bord", "Support email"],
    },
    {
      name: "Premium", subtitle: "Labo connecté", monthlyPrice: 149, yearlyPrice: 129, highlighted: true,
      features: ["Tout Standard +", "Intégration automates", "Résultats en temps réel", "API praticiens", "Statistiques avancées", "Support prioritaire"],
    },
  ],
  pharmacy: [
    {
      name: "Standard", subtitle: "Gestion pharmacie", monthlyPrice: 79, yearlyPrice: 59,
      features: ["Réception ordonnances numériques", "Gestion de stock basique", "Pharmacie de garde", "Tableau de bord", "Support email"],
    },
    {
      name: "Premium", subtitle: "Pharmacie connectée", monthlyPrice: 149, yearlyPrice: 129, highlighted: true,
      features: ["Tout Standard +", "Stock avancé & alertes", "Substitution automatique", "Statistiques avancées", "Multi-points de vente", "Support prioritaire"],
    },
  ],
  clinic: [
    {
      name: "Établissement", subtitle: "Gestion multi-services", monthlyPrice: 499, yearlyPrice: 399, highlighted: true,
      features: ["Gestion multi-praticiens illimitée", "Secrétariat centralisé", "Dossier médical partagé", "Facturation & reporting", "Téléconsultation", "API & intégrations", "Account manager dédié", "Formation sur site"],
    },
  ],
};

// ── Feature comparison table ──
interface ComparisonFeature {
  category: string;
  features: { name: string; plans: boolean[] }[];
}

const getComparison = (activity: ActivityType): ComparisonFeature[] => {
  const plans = plansByActivity[activity];
  if (!plans || plans.length < 2) return [];

  return [
    {
      category: "Agenda & RDV",
      features: [
        { name: "Agenda en ligne 24h/24", plans: plans.map(p => p.features.some(f => f.includes("Agenda"))) },
        { name: "Rappels SMS automatiques", plans: plans.map(p => p.features.some(f => f.includes("Rappels"))) },
        { name: "Prise de RDV patients", plans: plans.map(p => p.features.some(f => f.includes("RDV"))) },
      ],
    },
    {
      category: "Dossier médical",
      features: [
        { name: "Fiche patient basique", plans: plans.map(() => true) },
        { name: "Dossier médical complet", plans: plans.map(p => p.features.some(f => f.includes("Dossier") && f.includes("complet"))) },
        { name: "Ordonnances numériques", plans: plans.map(p => p.features.some(f => f.includes("Ordonnances"))) },
      ],
    },
    {
      category: "Fonctionnalités avancées",
      features: [
        { name: "Téléconsultation vidéo", plans: plans.map(p => p.features.some(f => f.includes("Téléconsultation"))) },
        { name: "Assistant IA", plans: plans.map(p => p.features.some(f => f.includes("IA"))) },
        { name: "Statistiques détaillées", plans: plans.map(p => p.features.some(f => f.includes("Statistiques"))) },
        { name: "Messagerie patient", plans: plans.map(p => p.features.some(f => f.includes("Messagerie"))) },
      ],
    },
    {
      category: "Support & Services",
      features: [
        { name: "Support email", plans: plans.map(() => true) },
        { name: "Support prioritaire", plans: plans.map(p => p.features.some(f => f.includes("prioritaire"))) },
        { name: "Account manager dédié", plans: plans.map(p => p.features.some(f => f.includes("Account"))) },
      ],
    },
  ];
};

/** Describe a promo in a human-readable banner line */
const promoDescription = (p: Promotion): string => {
  switch (p.type) {
    case "free_months": return `${p.value} mois gratuits`;
    case "percent_discount": return `${p.value}% de réduction`;
    case "fixed_amount": return `${p.value} DT de remise`;
    case "free_trial": return `${p.value} mois d'essai gratuit`;
  }
};

// ── Component ──
const BecomePartner = () => {
  const [activity, setActivity] = useState<ActivityType>("generaliste");
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [step, setStep] = useState<"pricing" | "register" | "success">("pricing");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", organization: "", specialty: "", city: "", message: "",
  });

  const plans = plansByActivity[activity];
  const comparison = getComparison(activity);
  const currentActivity = activities.find(a => a.id === activity)!;

  // ── Get active promos from admin store ──
  const activePromos = useMemo(() => {
    const now = new Date();
    return getPromotions().filter(p =>
      p.status === "active" &&
      new Date(p.startDate) <= now &&
      new Date(p.endDate) >= now
    );
  }, []);

  // Applicable auto-apply promos for current plan selection
  const applicablePromo = useMemo(() => {
    const planKey = selectedPlan.toLowerCase().includes("pro") || selectedPlan.toLowerCase().includes("premium") ? "pro" : "basic";
    return activePromos.find(p => p.autoApply && p.newDoctorsOnly && (p.target === "all" || p.target === planKey));
  }, [activePromos, selectedPlan]);

  const handleSelectPlan = (plan: PlanConfig) => {
    const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    setSelectedPlan(plan.name);
    setSelectedPlanPrice(price);
    setStep("register");
    setTimeout(() => {
      document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const requiredDocs = useMemo(() => {
    if (["generaliste", "specialiste", "dentiste", "kine"].includes(activity))
      return ["Diplôme de médecine / d'exercice", "CIN recto/verso", "Attestation d'inscription à l'Ordre"];
    if (activity === "laboratory")
      return ["Autorisation d'exercice", "Registre de commerce", "CIN du gérant"];
    if (activity === "pharmacy")
      return ["Licence de pharmacie", "Registre de commerce", "CIN du titulaire"];
    return ["Autorisation sanitaire", "Registre de commerce", "Convention cadre"];
  }, [activity]);

  // Document uploads (simulated)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: string; uploaded: boolean }>>({});

  const handleFileSelect = (docLabel: string) => {
    // Simulate file selection
    const fakeNames = ["diplome_medecine.pdf", "cin_recto_verso.pdf", "attestation_ordre.pdf", "licence_pharmacie.pdf", "autorisation.pdf", "registre_commerce.pdf"];
    const fakeSizes = ["1.2 Mo", "856 Ko", "2.1 Mo", "1.8 Mo", "945 Ko", "1.5 Mo"];
    const idx = Math.floor(Math.random() * fakeNames.length);
    
    setUploadedDocs(prev => ({
      ...prev,
      [docLabel]: { name: fakeNames[idx], size: fakeSizes[idx], uploaded: true },
    }));
    toast({ title: "Document ajouté", description: docLabel });
  };

  const removeDoc = (docLabel: string) => {
    setUploadedDocs(prev => {
      const next = { ...prev };
      delete next[docLabel];
      return next;
    });
  };

  const allDocsUploaded = requiredDocs.every(doc => uploadedDocs[doc]?.uploaded);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Submit to shared store — appears in admin KYC
    const reg = submitRegistration({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization || undefined,
      activity,
      specialty: formData.specialty || undefined,
      city: formData.city,
      plan: selectedPlan,
      planPrice: selectedPlanPrice,
      billing,
      message: formData.message || undefined,
    });

    toast({ title: "Inscription envoyée !", description: "Votre dossier est en cours de vérification." });
    setStep("success");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requiredDocs = useMemo(() => {
    if (["generaliste", "specialiste", "dentiste", "kine"].includes(activity))
      return ["Diplôme de médecine / d'exercice", "CIN recto/verso", "Attestation d'inscription à l'Ordre"];
    if (activity === "laboratory")
      return ["Autorisation d'exercice", "Registre de commerce", "CIN du gérant"];
    if (activity === "pharmacy")
      return ["Licence de pharmacie", "Registre de commerce", "CIN du titulaire"];
    return ["Autorisation sanitaire", "Registre de commerce", "Convention cadre"];
  }, [activity]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet
        title="Tarifs & Abonnements | Medicare Tunisie"
        description="Découvrez nos tarifs personnalisés selon votre activité. Médecin, laboratoire, pharmacie ou clinique — rejoignez Medicare."
      />
      <PublicHeader />

      {/* Active promo banner — connected to admin promotions */}
      {activePromos.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 flex-wrap text-center">
            <Gift className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">
              🎉 Offre en cours : {activePromos.map(p => promoDescription(p)).join(" • ")}
              {activePromos[0]?.requireCode && activePromos[0]?.promoCode && (
                <span className="ml-2 bg-primary-foreground/20 px-2 py-0.5 rounded text-xs font-bold">
                  Code : {activePromos[0].promoCode}
                </span>
              )}
            </span>
            <span className="text-xs opacity-80">
              Valable jusqu'au {new Date(activePromos[0].endDate).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Découvrez nos tarifs personnalisés selon votre activité
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Choisissez l'offre adaptée à votre pratique. Sans engagement, résiliable à tout moment.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {[
              { value: "5 000+", label: "Praticiens" },
              { value: "500K+", label: "Patients" },
              { value: "2M+", label: "RDV pris" },
              { value: "98%", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <Breadcrumbs items={[{ label: "Tarifs & Abonnements" }]} />

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { key: "pricing", label: "1. Choisir un plan" },
            { key: "register", label: "2. Créer votre compte" },
            { key: "success", label: "3. Vérification KYC" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-8 ${step === s.key || (step === "success" && i <= 2) || (step === "register" && i <= 1) ? "bg-primary" : "bg-border"}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.key ? "bg-primary text-primary-foreground" :
                (step === "success" || (step === "register" && s.key === "pricing")) ? "bg-accent/10 text-accent" :
                "bg-muted text-muted-foreground"
              }`}>
                {(step === "success" || (step === "register" && s.key === "pricing")) && <CheckCircle2 className="h-3 w-3" />}
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Pricing ── */}
        {step === "pricing" && (
          <>
            {/* Activity Selector */}
            <div className="flex justify-center mb-10">
              <div className="rounded-2xl border bg-card p-6 shadow-card max-w-lg w-full">
                <p className="text-center font-semibold text-foreground mb-4">Sélectionnez votre activité</p>
                <Select value={activity} onValueChange={v => setActivity(v as ActivityType)}>
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="flex items-center gap-2"><a.icon className="h-4 w-4" />{a.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentActivity.specialties && (
                  <div className="mt-3">
                    <Select value={formData.specialty} onValueChange={v => handleChange("specialty", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Précisez votre spécialité..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentActivity.specialties.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Billing toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-1 rounded-full border bg-card p-1">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Annuel <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billing === "yearly" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent/10 text-accent"}`}>-20%</span>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className={`grid gap-6 mb-16 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {plans.map((plan, i) => {
                const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                // Check if there's a promo for this plan
                const planKey = plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("premium") ? "pro" : "basic";
                const promo = activePromos.find(p => p.autoApply && p.newDoctorsOnly && (p.target === "all" || p.target === planKey));

                return (
                  <div key={i} className={`rounded-2xl border p-6 shadow-card relative flex flex-col ${plan.highlighted ? "border-primary bg-primary/[0.02] ring-2 ring-primary/20" : "bg-card"}`}>
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                        Recommandé
                      </div>
                    )}
                    {/* Promo badge */}
                    {promo && (
                      <div className="absolute -top-3 right-4 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />{promoDescription(promo)}
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{price}</span>
                      <span className="text-muted-foreground ml-1">DT</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {billing === "yearly"
                          ? `TTC / mois / soignant. Facturé une fois par an, ou ${plan.monthlyPrice} DT en paiement mensuel.`
                          : "TTC / mois / soignant. Sans engagement."}
                      </p>
                      {promo && (
                        <p className="text-xs text-accent font-medium mt-2 flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          {promoDescription(promo)} — appliqué automatiquement à l'inscription
                        </p>
                      )}
                    </div>
                    <Button
                      className={`w-full mb-6 ${plan.highlighted ? "gradient-primary text-primary-foreground shadow-primary-glow" : ""}`}
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      S'inscrire maintenant <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <div className="flex-1 space-y-2.5">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table */}
            {comparison.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-foreground text-center mb-8">Comparatif détaillé</h2>
                <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
                  <div className="grid border-b" style={{ gridTemplateColumns: `1.5fr ${plans.map(() => "1fr").join(" ")}` }}>
                    <div className="p-4 bg-muted/30" />
                    {plans.map((plan, i) => (
                      <div key={i} className={`p-4 text-center ${plan.highlighted ? "bg-primary/5" : "bg-muted/30"}`}>
                        <p className="font-bold text-foreground">{plan.name}</p>
                        <p className="text-sm text-primary font-semibold">{billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice} DT</p>
                      </div>
                    ))}
                  </div>
                  {comparison.map((cat, ci) => (
                    <div key={ci}>
                      <div className="grid border-b bg-muted/20" style={{ gridTemplateColumns: `1.5fr ${plans.map(() => "1fr").join(" ")}` }}>
                        <div className="p-3 px-4"><p className="text-sm font-semibold text-primary">{cat.category}</p></div>
                        {plans.map((_, i) => <div key={i} />)}
                      </div>
                      {cat.features.map((feat, fi) => (
                        <div key={fi} className="grid border-b last:border-0" style={{ gridTemplateColumns: `1.5fr ${plans.map(() => "1fr").join(" ")}` }}>
                          <div className="p-3 px-4 flex items-center"><span className="text-sm text-foreground">{feat.name}</span></div>
                          {feat.plans.map((has, i) => (
                            <div key={i} className={`p-3 flex items-center justify-center ${plans[i]?.highlighted ? "bg-primary/[0.02]" : ""}`}>
                              {has ? (
                                <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center"><Check className="h-3 w-3 text-accent" /></div>
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Pourquoi rejoindre Medicare ?</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Calendar, title: "Agenda en ligne", desc: "Gérez votre planning et recevez des RDV 24h/24 depuis votre profil public." },
                  { icon: Users, title: "Nouveaux patients", desc: "Augmentez votre visibilité et attirez de nouveaux patients sur la plateforme." },
                  { icon: Video, title: "Téléconsultation", desc: "Proposez des consultations vidéo sécurisées avec paiement intégré." },
                  { icon: Shield, title: "Dossier patient", desc: "Accédez à l'historique médical complet et partagé de vos patients." },
                  { icon: Bot, title: "Assistant IA", desc: "Aide au diagnostic et suggestions thérapeutiques basées sur l'IA." },
                  { icon: Clock, title: "Gain de temps", desc: "Réduisez les absences de 50% avec les rappels SMS automatiques." },
                ].map((b, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                    <b.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Registration Form ── */}
        {step === "register" && (
          <div id="partner-form" className="max-w-2xl mx-auto">
            {/* Plan summary */}
            <div className="rounded-xl border bg-primary/5 p-4 mb-6 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Plan sélectionné</p>
                <p className="font-bold text-foreground">{selectedPlan} — {selectedPlanPrice} DT/{billing === "yearly" ? "mois (annuel)" : "mois"}</p>
                {applicablePromo && (
                  <p className="text-xs text-accent flex items-center gap-1 mt-1">
                    <Gift className="h-3 w-3" />{promoDescription(applicablePromo)} sera appliqué à votre compte
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep("pricing")}>Changer de plan</Button>
            </div>

            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-elevated">
              <h2 className="text-xl font-bold text-foreground text-center mb-2">
                Créer votre compte {currentActivity.label}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Remplissez vos informations. Votre compte sera activé après vérification de vos documents (KYC).
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Prénom *</label>
                    <Input value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nom *</label>
                    <Input value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email professionnel *</label>
                  <Input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Téléphone *</label>
                  <Input value={formData.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+216 XX XXX XXX" required className="mt-1" />
                </div>

                {(activity === "laboratory" || activity === "pharmacy" || activity === "clinic") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nom de l'établissement *</label>
                    <Input value={formData.organization} onChange={e => handleChange("organization", e.target.value)} required className="mt-1" />
                  </div>
                )}

                {currentActivity.specialties && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Spécialité *</label>
                    <Select value={formData.specialty} onValueChange={v => handleChange("specialty", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                      <SelectContent>
                        {currentActivity.specialties.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ville *</label>
                  <Select value={formData.city} onValueChange={v => handleChange("city", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                    <SelectContent>
                      {["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte", "Gabès", "Kairouan", "Autre"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required documents */}
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-warning" />
                    Documents requis pour la vérification
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Votre compte sera activé après vérification de ces documents par notre équipe.
                  </p>
                  <ul className="space-y-1.5">
                    {requiredDocs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <FileText className="h-3.5 w-3.5 text-warning" />
                        {doc}
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">requis</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    📧 Les documents seront demandés par email après soumission du formulaire.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Message (optionnel)</label>
                  <Textarea value={formData.message} onChange={e => handleChange("message", e.target.value)} placeholder="Présentez-vous brièvement..." rows={3} className="mt-1" />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-primary-glow">
                  Soumettre mon inscription <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En soumettant ce formulaire, vous acceptez nos <Link to="/legal" className="underline">CGU</Link> et notre politique de confidentialité.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success / KYC Pending ── */}
        {step === "success" && (
          <div className="max-w-xl mx-auto text-center py-8">
            <div className="rounded-2xl border bg-card p-8 shadow-elevated">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Inscription envoyée ! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Votre dossier est en cours de vérification par notre équipe. 
                Vous recevrez un email de confirmation sous <strong>24 à 48h</strong>.
              </p>

              {/* KYC timeline */}
              <div className="rounded-xl border p-5 text-left mb-6">
                <p className="text-sm font-semibold text-foreground mb-4">Prochaines étapes</p>
                <div className="space-y-4">
                  {[
                    { done: true, label: "Formulaire d'inscription complété", desc: "Vos informations ont été enregistrées" },
                    { done: false, label: "Envoi des documents justificatifs", desc: "Un email vous sera envoyé avec les instructions" },
                    { done: false, label: "Vérification KYC par notre équipe", desc: "Délai moyen : 24-48h ouvrables" },
                    { done: false, label: "Activation de votre compte", desc: "Accès à votre espace professionnel" },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                          {s.done ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                        </div>
                        {i < 3 && <div className={`h-full w-px mt-1 ${s.done ? "bg-accent" : "bg-border"}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {applicablePromo && (
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent" />Offre appliquée à votre futur compte
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {promoDescription(applicablePromo)} — sera activé dès la validation de votre dossier.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button variant="outline" onClick={() => { setStep("pricing"); setFormData({ firstName: "", lastName: "", email: "", phone: "", organization: "", specialty: "", city: "", message: "" }); }}>
                  Nouvelle inscription
                </Button>
                <Link to="/">
                  <Button variant="ghost">Retour à l'accueil</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CTA bottom */}
        {step === "pricing" && (
          <div className="text-center pb-12">
            <p className="text-muted-foreground mb-4">Des questions ? Contactez notre équipe commerciale</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button variant="outline" size="lg" className="gap-2"><Phone className="h-4 w-4" />+216 71 000 000</Button>
              <Button variant="outline" size="lg" className="gap-2"><MessageSquare className="h-4 w-4" />commercial@medicare.tn</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomePartner;
