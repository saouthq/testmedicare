/**
 * Become Partner Page — Devenir partenaire Medicare
 */
import { useState } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Stethoscope, FlaskConical, Pill, Building2, CheckCircle2, Users,
  Calendar, TrendingUp, Shield, Video, Clock, ChevronRight,
} from "lucide-react";

type PartnerType = "doctor" | "laboratory" | "pharmacy" | "clinic";

const BecomePartner = () => {
  const [selectedType, setSelectedType] = useState<PartnerType>("doctor");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    specialty: "",
    city: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const partnerTypes = [
    { id: "doctor" as const, icon: Stethoscope, label: "Médecin / Praticien" },
    { id: "laboratory" as const, icon: FlaskConical, label: "Laboratoire d'analyses" },
    { id: "pharmacy" as const, icon: Pill, label: "Pharmacie" },
    { id: "clinic" as const, icon: Building2, label: "Clinique / Établissement" },
  ];

  const benefits = [
    { icon: Calendar, title: "Agenda en ligne", description: "Gérez votre planning et recevez des rendez-vous 24h/24." },
    { icon: Users, title: "Nouveaux patients", description: "Augmentez votre visibilité et attirez de nouveaux patients." },
    { icon: TrendingUp, title: "Statistiques", description: "Suivez votre activité avec des tableaux de bord détaillés." },
    { icon: Shield, title: "Dossier patient", description: "Accédez à l'historique médical complet de vos patients." },
    { icon: Video, title: "Téléconsultation", description: "Proposez des consultations vidéo sécurisées." },
    { icon: Clock, title: "Gain de temps", description: "Réduisez les tâches administratives et les absences." },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO BACKEND: POST /api/partners/request
    console.log("Partner request:", { type: selectedType, ...formData });
    toast({ title: "Demande envoyée !", description: "Notre équipe vous contactera sous 48h." });
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Devenir partenaire | Medicare Tunisie" 
        description="Rejoignez Medicare en tant que médecin, laboratoire, pharmacie ou clinique. Gérez votre agenda, vos patients et développez votre activité." 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Devenir partenaire" }]} />

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Rejoignez Medicare
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Développez votre activité, gérez vos patients et simplifiez votre quotidien 
            avec la plateforme médicale n°1 en Tunisie.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { value: "5 000+", label: "Praticiens" },
            { value: "500K+", label: "Patients" },
            { value: "2M+", label: "RDV pris" },
            { value: "98%", label: "Satisfaction" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 text-center shadow-card">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Pourquoi rejoindre Medicare ?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <b.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-elevated max-w-2xl mx-auto">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Demande d'inscription
              </h2>

              {/* Partner type selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Vous êtes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {partnerTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        selectedType === t.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "hover:border-primary/50"
                      }`}
                    >
                      <t.icon className={`h-5 w-5 ${selectedType === t.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${selectedType === t.id ? "text-primary" : "text-foreground"}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Prénom *</label>
                    <Input 
                      value={formData.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                      required 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nom *</label>
                    <Input 
                      value={formData.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                      required 
                      className="mt-1" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange("email", e.target.value)}
                    required 
                    className="mt-1" 
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Téléphone *</label>
                  <Input 
                    value={formData.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    required 
                    className="mt-1" 
                  />
                </div>

                {selectedType === "doctor" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Spécialité *</label>
                    <select 
                      value={formData.specialty}
                      onChange={e => handleChange("specialty", e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Sélectionnez...</option>
                      <option>Médecin généraliste</option>
                      <option>Cardiologue</option>
                      <option>Dentiste</option>
                      <option>Dermatologue</option>
                      <option>Gynécologue</option>
                      <option>Ophtalmologue</option>
                      <option>Pédiatre</option>
                      <option>Autre</option>
                    </select>
                  </div>
                )}

                {(selectedType === "laboratory" || selectedType === "pharmacy" || selectedType === "clinic") && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Nom de l'établissement *
                    </label>
                    <Input 
                      value={formData.organization}
                      onChange={e => handleChange("organization", e.target.value)}
                      required 
                      className="mt-1" 
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ville *</label>
                  <select 
                    value={formData.city}
                    onChange={e => handleChange("city", e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionnez...</option>
                    <option>Tunis</option>
                    <option>Ariana</option>
                    <option>Ben Arous</option>
                    <option>Sousse</option>
                    <option>Sfax</option>
                    <option>Monastir</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Message (optionnel)
                  </label>
                  <Textarea 
                    value={formData.message}
                    onChange={e => handleChange("message", e.target.value)}
                    placeholder="Présentez-vous brièvement..."
                    rows={3}
                    className="mt-1" 
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                  Envoyer ma demande <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En soumettant ce formulaire, vous acceptez nos CGU et notre politique de confidentialité.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Demande envoyée !
              </h2>
              <p className="text-muted-foreground mb-6">
                Merci pour votre intérêt. Notre équipe vous contactera sous 48h 
                pour finaliser votre inscription.
              </p>
              <Button 
                variant="outline" 
                onClick={() => { setSubmitted(false); setFormData({ firstName: "", lastName: "", email: "", phone: "", organization: "", specialty: "", city: "", message: "" }); }}
              >
                Envoyer une autre demande
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomePartner;
