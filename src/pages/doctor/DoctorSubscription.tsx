import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CheckCircle, Crown, Zap, CreditCard, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DoctorSubscription = () => {
  const [currentPlan] = useState("basic");

  const plans = [
    {
      key: "basic",
      name: "Basic",
      price: "39",
      period: "DT/mois",
      features: [
        "Agenda en ligne",
        "Prise de rendez-vous patients",
        "Fiche praticien publique",
        "5 SMS de rappel / mois",
        "Messagerie patients",
        "Support email",
      ],
      notIncluded: ["Téléconsultation", "Gestion secrétaire", "Ordonnances numériques", "SMS illimités", "Statistiques avancées"],
    },
    {
      key: "pro",
      name: "Pro",
      price: "129",
      period: "DT/mois",
      popular: true,
      features: [
        "Tout le plan Basic +",
        "Téléconsultation vidéo",
        "Gestion de secrétaire(s)",
        "Ordonnances numériques",
        "SMS de rappel illimités",
        "Statistiques avancées",
        "Dossier patient complet",
        "Support prioritaire",
        "Multi-cabinet",
      ],
      notIncluded: [],
    },
  ];

  return (
    <DashboardLayout role="doctor" title="Mon abonnement">
      <div className="max-w-4xl space-y-6">
        {/* Current plan */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Votre abonnement actuel</p>
              <h3 className="text-xl font-bold text-foreground mt-1 flex items-center gap-2">
                Plan Basic <span className="text-sm font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">39 DT/mois</span>
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Prochain renouvellement</p>
              <p className="font-medium text-foreground flex items-center gap-1"><Calendar className="h-4 w-4" />20 Mars 2026</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-6 sm:grid-cols-2">
          {plans.map(plan => (
            <div key={plan.key} className={`rounded-xl border bg-card p-6 shadow-card relative ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />RECOMMANDÉ
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0" />{f}
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                    <span className="h-4 w-4 shrink-0" />{f}
                  </li>
                ))}
              </ul>

              {currentPlan === plan.key ? (
                <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
              ) : (
                <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow">
                  <Zap className="h-4 w-4 mr-1" />Passer au {plan.name}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Payment history */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Historique de paiement</h3>
          </div>
          <div className="divide-y">
            {[
              { date: "20 Fév 2026", amount: "39 DT", status: "Payé", plan: "Basic" },
              { date: "20 Jan 2026", amount: "39 DT", status: "Payé", plan: "Basic" },
              { date: "20 Déc 2025", amount: "39 DT", status: "Payé", plan: "Basic" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{p.date}</span>
                  <span className="text-sm font-medium text-foreground">Plan {p.plan}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{p.amount}</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSubscription;
