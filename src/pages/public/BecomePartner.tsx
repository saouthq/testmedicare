/**
 * Become Partner Page — Doctolib-style pricing with activity selector, plan comparison table
 * Connected to admin promos/promotions store — shows active promos dynamically
 * Features shown per plan come from the shared Feature Matrix store (admin-configurable)
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
import {
  activities as matrixActivities,
  publicPlansByActivity,
  getEnabledFeatureLabels,
  planNameToTier,
  featureCatalog,
  plansByActivity as matrixPlansByActivity,
  type ActivityType,
  type PublicPlanConfig,
} from "@/stores/featureMatrixStore";
import type { Promotion } from "@/types/promotion";

// Icons per activity
const activityIcons: Record<ActivityType, any> = {
  generaliste: Stethoscope,
  specialiste: Stethoscope,
  dentiste: Stethoscope,
  kine: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  clinic: Building2,
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

  const plans = publicPlansByActivity[activity];
  const currentActivity = matrixActivities.find(a => a.id === activity)!;
  const ActivityIcon = activityIcons[activity];

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

  // Get features for each plan from the shared matrix (respects admin config)
  const getFeaturesForPlan = (plan: PublicPlanConfig): string[] => {
    const tier = plan.planTier;
    const specialty = formData.specialty || undefined;
    return getEnabledFeatureLabels(activity, tier, specialty);
  };

  // Build comparison table from the matrix
  const comparison = useMemo(() => {
    if (plans.length < 2) return [];
    const categories = [...new Set(featureCatalog.map(f => f.category))];
    // Only show categories that have at least one enabled feature for this activity
    return categories.map(cat => {
      const catFeatures = featureCatalog.filter(f => f.category === cat);
      const rows = catFeatures.map(f => ({
        name: f.label,
        plans: plans.map(p => {
          const labels = getEnabledFeatureLabels(activity, p.planTier, formData.specialty || undefined);
          return labels.includes(f.label);
        }),
      })).filter(row => row.plans.some(Boolean)); // only show features that are enabled for at least one plan
      return { category: cat, features: rows };
    }).filter(c => c.features.length > 0);
  }, [activity, plans, formData.specialty]);

  const handleSelectPlan = (plan: PublicPlanConfig) => {
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

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet
        title="Tarifs & Abonnements | Medicare Tunisie"
        description="Découvrez nos tarifs personnalisés selon votre activité. Médecin, laboratoire, pharmacie ou clinique — rejoignez Medicare."
      />
      <PublicHeader />

      {/* Active promo banner */}
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
                <Select value={activity} onValueChange={v => { setActivity(v as ActivityType); setFormData(prev => ({ ...prev, specialty: "" })); }}>
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {matrixActivities.map(a => {
                      const Icon = activityIcons[a.id];
                      return (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{a.label}</span>
                        </SelectItem>
                      );
                    })}
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
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      💡 Les fonctionnalités affichées sont adaptées à votre spécialité
                    </p>
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

            {/* Plan Cards — features from matrix */}
            <div className={`grid gap-6 mb-16 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {plans.map((plan, i) => {
                const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                const planKey = plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("premium") ? "pro" : "basic";
                const promo = activePromos.find(p => p.autoApply && p.newDoctorsOnly && (p.target === "all" || p.target === planKey));
                const features = getFeaturesForPlan(plan);

                return (
                  <div key={i} className={`rounded-2xl border p-6 shadow-card relative flex flex-col ${plan.highlighted ? "border-primary bg-primary/[0.02] ring-2 ring-primary/20" : "bg-card"}`}>
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                        Recommandé
                      </div>
                    )}
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
                          {promoDescription(promo)} — appliqué automatiquement
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
                      {features.length > 0 ? features.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground italic">Aucune fonctionnalité configurée pour ce plan</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table — from matrix */}
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
            {/* Plan summary with features */}
            <div className="rounded-xl border bg-primary/5 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Plan sélectionné</p>
                  <p className="font-bold text-foreground">{selectedPlan} — {selectedPlanPrice} DT/{billing === "yearly" ? "mois (annuel)" : "mois"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentActivity.label}{formData.specialty ? ` — ${formData.specialty}` : ""}</p>
                  {applicablePromo && (
                    <p className="text-xs text-accent flex items-center gap-1 mt-1">
                      <Gift className="h-3 w-3" />{promoDescription(applicablePromo)} sera appliqué à votre compte
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep("pricing")}>Changer de plan</Button>
              </div>
              {/* Show selected plan features */}
              {(() => {
                const tier = planNameToTier(selectedPlan, activity);
                const features = getEnabledFeatureLabels(activity, tier, formData.specialty || undefined);
                return features.length > 0 ? (
                  <div className="border-t pt-3 mt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Fonctionnalités incluses ({features.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.slice(0, 12).map((f, i) => (
                        <span key={i} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {features.length > 12 && (
                        <span className="text-[10px] text-muted-foreground">+{features.length - 12} autres</span>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
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

                {/* Document upload workflow */}
                <div className="rounded-xl border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      Documents justificatifs
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      allDocsUploaded ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                    }`}>
                      {Object.keys(uploadedDocs).length}/{requiredDocs.length} uploadés
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joignez vos documents pour accélérer la vérification de votre dossier. Formats acceptés : PDF, JPG, PNG (max 10 Mo).
                  </p>
                  <div className="space-y-2.5">
                    {requiredDocs.map((doc, i) => {
                      const uploaded = uploadedDocs[doc];
                      return (
                        <div key={i} className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${uploaded ? "border-accent/30 bg-accent/5" : "border-dashed border-border hover:border-primary/30 hover:bg-primary/[0.02]"}`}>
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${uploaded ? "bg-accent/10" : "bg-muted"}`}>
                            {uploaded ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{doc}</p>
                            {uploaded ? (
                              <p className="text-[10px] text-accent">{uploaded.name} — {uploaded.size}</p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">Requis — Cliquez pour ajouter</p>
                            )}
                          </div>
                          {uploaded ? (
                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => removeDoc(doc)}>
                              Supprimer
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleFileSelect(doc)}>
                              <Upload className="h-3 w-3 mr-1" />Ajouter
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!allDocsUploaded && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      💡 Vous pouvez soumettre sans tous les documents, mais votre inscription sera traitée plus rapidement avec un dossier complet.
                    </p>
                  )}
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
                    { done: allDocsUploaded, label: "Documents justificatifs soumis", desc: allDocsUploaded ? "Tous les documents ont été envoyés" : "Un email vous sera envoyé avec les instructions" },
                    { done: false, label: "Vérification KYC par notre équipe", desc: "Délai moyen : 24-48h ouvrables" },
                    { done: false, label: "Activation de votre compte", desc: `Accès à votre espace ${currentActivity.label}` },
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

              {/* Show what features will be enabled */}
              {(() => {
                const tier = planNameToTier(selectedPlan, activity);
                const features = getEnabledFeatureLabels(activity, tier, formData.specialty || undefined);
                return features.length > 0 ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />Fonctionnalités de votre plan {selectedPlan}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((f, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

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
                <Button variant="outline" onClick={() => { setStep("pricing"); setFormData({ firstName: "", lastName: "", email: "", phone: "", organization: "", specialty: "", city: "", message: "" }); setUploadedDocs({}); }}>
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
