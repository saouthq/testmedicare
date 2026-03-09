/**
 * DoctorSubscription — Subscription management page synced with doctorSubscriptionStore.
 * Uses featureMatrixStore for dynamic plan data. Allows upgrade/downgrade with mock payment.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CheckCircle, Crown, Zap, CreditCard, Calendar, X, Shield, Eye, ArrowRight, Star, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useDoctorSubscription, setDoctorPlan } from "@/stores/doctorSubscriptionStore";
import { plansByActivity, featureCatalog, getEnabledFeatures, activities, type PlanTier, type PlanConfig } from "@/stores/featureMatrixStore";

const DoctorSubscription = () => {
  const [sub] = useDoctorSubscription();
  const [showChangeCard, setShowChangeCard] = useState(false);
  const [showConfirmUpgrade, setShowConfirmUpgrade] = useState<PlanTier | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const currentPlans = plansByActivity[sub.activity] || [];
  const currentPlan = currentPlans.find(p => p.id === sub.plan);
  const currentActivity = activities.find(a => a.id === sub.activity);

  const invoices = [
    { date: "20 Fév 2026", amount: `${currentPlan?.price || 49} DT`, status: "Payé", plan: currentPlan?.label || "Essentiel", id: "INV-2026-002" },
    { date: "20 Jan 2026", amount: `${currentPlan?.price || 49} DT`, status: "Payé", plan: currentPlan?.label || "Essentiel", id: "INV-2026-001" },
    { date: "20 Déc 2025", amount: `${currentPlan?.price || 49} DT`, status: "Payé", plan: currentPlan?.label || "Essentiel", id: "INV-2025-012" },
  ];

  const handleChangePlan = (planId: PlanTier) => {
    setDoctorPlan(planId);
    setShowConfirmUpgrade(null);
    const plan = currentPlans.find(p => p.id === planId);
    toast({
      title: `Plan mis à jour → ${plan?.label}`,
      description: `Votre abonnement est maintenant ${plan?.label} à ${plan?.price} DT/mois. La sidebar et les fonctionnalités se sont mises à jour.`,
    });
  };

  // Get features per plan for comparison
  const getFeaturesForPlan = (planId: PlanTier) => {
    return getEnabledFeatures(sub.activity, planId, sub.specialty);
  };

  // Feature categories for comparison table
  const categories = [...new Set(featureCatalog.map(f => f.category))].filter(c => 
    !["Pharmacie"].includes(c)
  );

  const confirmPlan = showConfirmUpgrade ? currentPlans.find(p => p.id === showConfirmUpgrade) : null;
  const isUpgrade = showConfirmUpgrade ? currentPlans.findIndex(p => p.id === showConfirmUpgrade) > currentPlans.findIndex(p => p.id === sub.plan) : false;

  return (
    <DashboardLayout role="doctor" title="Mon abonnement">
      <div className="max-w-5xl space-y-6">
        {/* Current plan card */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Votre abonnement actuel</p>
              <h3 className="text-xl font-bold text-foreground mt-1 flex items-center gap-2">
                Plan {currentPlan?.label}
                <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {currentPlan?.price} DT/mois
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {currentActivity?.label}{sub.specialty ? ` · ${sub.specialty}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Prochain renouvellement</p>
              <p className="font-medium text-foreground flex items-center gap-1"><Calendar className="h-4 w-4" />20 Mars 2026</p>
            </div>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Mensuel</span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === "yearly" ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${billing === "yearly" ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
            Annuel <span className="text-xs text-accent font-semibold">-20%</span>
          </span>
        </div>

        {/* Plans grid */}
        <div className={`grid gap-6 ${currentPlans.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {currentPlans.map((plan, idx) => {
            const isActive = sub.plan === plan.id;
            const isPopular = idx === 1;
            const yearlyPrice = Math.round(plan.price * 0.8);
            const displayPrice = billing === "yearly" ? yearlyPrice : plan.price;
            const planFeatures = getFeaturesForPlan(plan.id);

            return (
              <div key={plan.id} className={`rounded-xl border bg-card p-6 shadow-card relative transition-all ${
                isPopular ? "border-primary ring-2 ring-primary/20" : ""
              } ${isActive ? "bg-primary/5" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" />RECOMMANDÉ
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-foreground">{plan.label}</h4>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                    <span className="text-muted-foreground ml-1">DT/{billing === "yearly" ? "mois" : "mois"}</span>
                  </div>
                  {billing === "yearly" && (
                    <p className="text-xs text-accent mt-1">
                      <s className="text-muted-foreground">{plan.price} DT</s> · Économisez {(plan.price - yearlyPrice) * 12} DT/an
                    </p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-6">
                  {planFeatures.slice(0, showAllFeatures ? 50 : 8).map(f => (
                    <li key={f.id} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                  {!showAllFeatures && planFeatures.length > 8 && (
                    <li className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setShowAllFeatures(true)}>
                      + {planFeatures.length - 8} autres fonctionnalités
                    </li>
                  )}
                </ul>

                {isActive ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-1.5" />Plan actuel
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${isPopular ? "gradient-primary text-primary-foreground shadow-primary-glow" : ""}`}
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => setShowConfirmUpgrade(plan.id)}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    {currentPlans.findIndex(p => p.id === plan.id) > currentPlans.findIndex(p => p.id === sub.plan)
                      ? `Passer au ${plan.label}`
                      : `Rétrograder vers ${plan.label}`
                    }
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <h3 className="font-semibold text-foreground">Comparaison détaillée des fonctionnalités</h3>
            {showAllFeatures ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>
          {showAllFeatures && (
            <div className="border-t overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Fonctionnalité</th>
                    {currentPlans.map(p => (
                      <th key={p.id} className={`text-center p-3 font-semibold ${p.id === sub.plan ? "text-primary" : "text-foreground"}`}>
                        {p.label}
                        {p.id === sub.plan && <span className="block text-[10px] text-primary">(actuel)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const catFeatures = featureCatalog.filter(f => f.category === cat);
                    if (catFeatures.length === 0) return null;
                    return (
                      <React.Fragment key={cat}>
                        <tr><td colSpan={currentPlans.length + 1} className="bg-muted/20 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cat}</td></tr>
                        {catFeatures.map(feat => (
                          <tr key={feat.id} className="border-b last:border-0 hover:bg-muted/10">
                            <td className="p-3 text-foreground">{feat.label}</td>
                            {currentPlans.map(p => {
                              const enabled = getFeaturesForPlan(p.id).some(f => f.id === feat.id);
                              return (
                                <td key={p.id} className="text-center p-3">
                                  {enabled
                                    ? <CheckCircle className="h-4 w-4 text-accent mx-auto" />
                                    : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />Méthode de paiement
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">VISA</div>
              <div>
                <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expire 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowChangeCard(true)}>Modifier</Button>
          </div>
        </div>

        {/* Payment history */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />Historique de paiement
            </h3>
          </div>
          <div className="divide-y">
            {invoices.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{p.date}</span>
                  <span className="text-sm font-medium text-foreground">Plan {p.plan}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{p.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{p.amount}</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p.status}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs"><Eye className="h-3.5 w-3.5 mr-1" />Voir</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm upgrade/downgrade modal */}
      {showConfirmUpgrade && confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowConfirmUpgrade(null)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">
                {isUpgrade ? "Passer au" : "Rétrograder vers"} {confirmPlan.label}
              </h3>
              <button onClick={() => setShowConfirmUpgrade(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border p-4 mb-4 text-center">
              <p className="text-3xl font-bold text-foreground">{confirmPlan.price} DT<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
              {isUpgrade && <p className="text-xs text-accent mt-1">🎉 Essai gratuit 14 jours</p>}
            </div>

            {isUpgrade ? (
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 mb-4">
                <p className="text-sm text-foreground font-medium mb-2">Nouvelles fonctionnalités :</p>
                <ul className="space-y-1.5">
                  {getFeaturesForPlan(showConfirmUpgrade)
                    .filter(f => !getFeaturesForPlan(sub.plan).some(cf => cf.id === f.id))
                    .slice(0, 6)
                    .map(f => (
                      <li key={f.id} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-accent" />{f.label}
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 mb-4">
                <p className="text-sm text-foreground font-medium mb-2">Fonctionnalités retirées :</p>
                <ul className="space-y-1.5">
                  {getFeaturesForPlan(sub.plan)
                    .filter(f => !getFeaturesForPlan(showConfirmUpgrade).some(cf => cf.id === f.id))
                    .slice(0, 6)
                    .map(f => (
                      <li key={f.id} className="flex items-center gap-2 text-sm text-destructive">
                        <X className="h-3.5 w-3.5" />{f.label}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmUpgrade(null)}>Annuler</Button>
              <Button
                className={`flex-1 ${isUpgrade ? "gradient-primary text-primary-foreground shadow-primary-glow" : ""}`}
                variant={isUpgrade ? "default" : "outline"}
                onClick={() => handleChangePlan(showConfirmUpgrade)}
              >
                {isUpgrade ? <><Zap className="h-4 w-4 mr-1" />Confirmer</> : "Rétrograder"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change card modal */}
      {showChangeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowChangeCard(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Modifier la carte</h3>
              <button onClick={() => setShowChangeCard(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-xs">Numéro de carte</Label><Input className="mt-1 font-mono" placeholder="1234 5678 9012 3456" maxLength={19} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Date d'expiration</Label><Input className="mt-1" placeholder="MM/AA" maxLength={5} /></div>
                <div><Label className="text-xs">CVC</Label><Input className="mt-1" placeholder="123" maxLength={3} type="password" /></div>
              </div>
              <div><Label className="text-xs">Nom sur la carte</Label><Input className="mt-1" placeholder="Nom complet" /></div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <Shield className="h-4 w-4 text-accent shrink-0" />
                <p className="text-xs text-muted-foreground">Paiement sécurisé. Vos données sont chiffrées.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowChangeCard(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => { setShowChangeCard(false); toast({ title: "Carte mise à jour" }); }}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorSubscription;
