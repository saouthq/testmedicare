import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CheckCircle, Crown, Zap, CreditCard, Calendar, X, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DoctorSubscription = () => {
  const [currentPlan] = useState("basic");
  const [showChangeCard, setShowChangeCard] = useState(false);

  const plans = [
    {
      key: "basic", name: "Basic", price: "39", period: "DT/mois",
      features: ["Agenda en ligne", "Prise de rendez-vous patients", "Fiche praticien publique", "5 SMS de rappel / mois", "Messagerie patients", "Support email"],
      notIncluded: ["Téléconsultation", "Gestion secrétaire", "Ordonnances numériques", "SMS illimités", "Statistiques avancées"],
    },
    {
      key: "pro", name: "Pro", price: "129", period: "DT/mois", popular: true,
      features: ["Tout le plan Basic +", "Téléconsultation vidéo", "Gestion de secrétaire(s)", "Ordonnances numériques", "SMS de rappel illimités", "Statistiques avancées", "Dossier patient complet", "Support prioritaire", "Multi-cabinet"],
      notIncluded: [],
    },
  ];

  const invoices = [
    { date: "20 Fév 2026", amount: "39 DT", status: "Payé", plan: "Basic", id: "INV-2026-002" },
    { date: "20 Jan 2026", amount: "39 DT", status: "Payé", plan: "Basic", id: "INV-2026-001" },
    { date: "20 Déc 2025", amount: "39 DT", status: "Payé", plan: "Basic", id: "INV-2025-012" },
  ];

  return (
    <DashboardLayout role="doctor" title="Mon abonnement">
      <div className="max-w-4xl space-y-6">
        {/* Current plan */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-3">
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
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1"><Crown className="h-3 w-3" />RECOMMANDÉ</span>
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                <div className="mt-2"><span className="text-4xl font-bold text-foreground">{plan.price}</span><span className="text-muted-foreground ml-1">{plan.period}</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0" />{f}</li>)}
                {plan.notIncluded.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground line-through"><span className="h-4 w-4 shrink-0" />{f}</li>)}
              </ul>
              {currentPlan === plan.key ? (
                <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
              ) : (
                <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow"><Zap className="h-4 w-4 mr-1" />Passer au {plan.name}</Button>
              )}
            </div>
          ))}
        </div>

        {/* Payment method */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Méthode de paiement</h3>
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
            <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Historique de paiement</h3>
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
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setShowChangeCard(false)}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorSubscription;
