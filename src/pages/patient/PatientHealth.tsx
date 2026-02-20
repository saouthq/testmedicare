import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Heart, Pill, Syringe, Upload, ChevronRight, Plus, AlertTriangle, X, Eye, Download, Calendar, Shield, Activity, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthTab = "overview" | "history" | "documents" | "antecedents" | "treatments" | "vaccinations";

const vitals = [
  { label: "Tension artérielle", value: "13/8", unit: "mmHg", icon: Heart, trend: "stable" },
  { label: "Glycémie", value: "1.05", unit: "g/L", icon: Activity, trend: "down" },
  { label: "Poids", value: "75", unit: "kg", icon: Thermometer, trend: "stable" },
  { label: "IMC", value: "24.2", unit: "", icon: Activity, trend: "stable" },
];

const healthReminders = [
  { title: "Consultez votre dentiste", desc: "Recommandé une fois par an", icon: "🦷", action: "Prendre rendez-vous" },
  { title: "Bilan sanguin annuel", desc: "Dernier bilan il y a 14 mois", icon: "🩸", action: "Prendre rendez-vous" },
];

const consultationHistory = [
  { date: "10 Fév 2026", doctor: "Dr. Bouazizi", motif: "Suivi diabète", notes: "Glycémie stable 1.05 g/L. Maintien traitement. Contrôle dans 3 mois.", prescriptions: 1, analyses: 0 },
  { date: "15 Jan 2026", doctor: "Dr. Gharbi", motif: "Bilan cardiaque annuel", notes: "ECG normal. TA 13/8. Aucune anomalie détectée.", prescriptions: 0, analyses: 1 },
  { date: "5 Déc 2025", doctor: "Dr. Hammami", motif: "Consultation dermatologie", notes: "Eczéma atopique léger. Prescription crème dermocorticoïde.", prescriptions: 1, analyses: 0 },
  { date: "20 Nov 2025", doctor: "Dr. Bouazizi", motif: "Gastro-entérite", notes: "Prescription antiacide et anti-émétique. Repos recommandé.", prescriptions: 1, analyses: 0 },
];

const documents = [
  { name: "Résultats analyses - Glycémie", type: "Analyse", date: "15 Fév 2026", source: "Labo BioSanté", size: "245 Ko" },
  { name: "Ordonnance Dr. Bouazizi", type: "Ordonnance", date: "10 Fév 2026", source: "Dr. Ahmed Bouazizi", size: "120 Ko" },
  { name: "Radio thoracique", type: "Imagerie", date: "5 Jan 2026", source: "Centre Imagerie Tunis", size: "2.1 Mo" },
  { name: "Compte-rendu consultation", type: "Consultation", date: "20 Déc 2025", source: "Dr. Sonia Gharbi", size: "85 Ko" },
  { name: "Certificat médical", type: "Certificat", date: "15 Nov 2025", source: "Dr. Ahmed Bouazizi", size: "55 Ko" },
];

const antecedents = [
  { category: "Chirurgicaux", items: [{ name: "Appendicectomie", date: "Mars 2015", details: "Hôpital Charles Nicolle, Tunis" }] },
  { category: "Médicaux", items: [{ name: "Diabète type 2", date: "Depuis 2020", details: "Suivi régulier, traitement oral" }, { name: "Hypertension artérielle", date: "Depuis 2022", details: "Traitement par Amlodipine 5mg" }] },
  { category: "Allergies", items: [{ name: "Pénicilline", date: "Depuis l'enfance", details: "Réaction cutanée sévère" }, { name: "Acariens", date: "Depuis 2010", details: "Rhinite allergique" }] },
  { category: "Familiaux", items: [{ name: "Diabète (père)", date: "", details: "Type 2" }, { name: "Hypertension (mère)", date: "", details: "" }] },
];

const treatments = [
  { name: "Metformine 850mg", dose: "1 comprimé matin et soir", prescriber: "Dr. Ahmed Bouazizi", since: "Depuis Jan 2021", status: "active" },
  { name: "Amlodipine 5mg", dose: "1 comprimé le matin", prescriber: "Dr. Ahmed Bouazizi", since: "Depuis Mar 2022", status: "active" },
  { name: "Oméprazole 20mg", dose: "1 gélule avant le dîner", prescriber: "Dr. Sonia Gharbi", since: "Oct 2025 - Déc 2025", status: "ended" },
];

const vaccinations = [
  { name: "COVID-19 (Pfizer)", doses: "3 doses", lastDate: "15 Jan 2022", nextDate: null },
  { name: "Grippe saisonnière", doses: "1 dose", lastDate: "10 Oct 2025", nextDate: "Oct 2026" },
  { name: "Hépatite B", doses: "3 doses", lastDate: "2005", nextDate: null },
  { name: "Tétanos", doses: "Rappel", lastDate: "Mar 2020", nextDate: "Mar 2030" },
];

const PatientHealth = () => {
  const [tab, setTab] = useState<HealthTab>("overview");
  const [showUpload, setShowUpload] = useState(false);

  const tabs = [
    { key: "overview" as HealthTab, label: "Vue d'ensemble", icon: Heart },
    { key: "history" as HealthTab, label: "Historique", icon: Activity },
    { key: "documents" as HealthTab, label: "Documents", icon: FileText },
    { key: "antecedents" as HealthTab, label: "Antécédents", icon: Shield },
    { key: "treatments" as HealthTab, label: "Traitements", icon: Pill },
    { key: "vaccinations" as HealthTab, label: "Vaccinations", icon: Syringe },
  ];

  return (
    <DashboardLayout role="patient" title="Mon espace santé">
      <div className="space-y-6">
        {/* Vitals cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vitals.map((v) => (
            <div key={v.label} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{v.label}</p><v.icon className="h-4 w-4 text-primary" /></div>
              <p className="mt-1 text-2xl font-bold text-foreground">{v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span></p>
              <p className="text-xs text-accent mt-1">{v.trend === "stable" ? "↔ Stable" : v.trend === "down" ? "↓ En baisse" : "↑ En hausse"}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">Complétez votre profil santé</h3>
                  <p className="text-sm text-muted-foreground mt-1">Recevez des rappels personnalisés et préparez au mieux vos consultations</p>
                  <Button className="mt-4 gradient-primary text-primary-foreground">Commencer</Button>
                </div>
                <Heart className="h-12 w-12 text-primary/30 shrink-0" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">Rappels santé <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{healthReminders.length}</span></h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {healthReminders.map((r, i) => (
                  <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-sm">{r.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                        <Button variant="outline" size="sm" className="mt-3 text-primary border-primary/30">
                          <Calendar className="h-3 w-3 mr-1" />{r.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Profil santé</h3>
              <div className="space-y-2">
                {[
                  { label: "Historique consultations", count: consultationHistory.length, icon: Activity, tab: "history" as HealthTab },
                  { label: "Documents médicaux", count: documents.length, icon: FileText, tab: "documents" as HealthTab },
                  { label: "Antécédents médicaux", count: antecedents.reduce((a, c) => a + c.items.length, 0), icon: Shield, tab: "antecedents" as HealthTab },
                  { label: "Traitements en cours", count: treatments.filter(t => t.status === "active").length, icon: Pill, tab: "treatments" as HealthTab },
                  { label: "Vaccinations", count: vaccinations.length, icon: Syringe, tab: "vaccinations" as HealthTab },
                ].map((s, i) => (
                  <button key={i} onClick={() => setTab(s.tab)} className="w-full flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card hover:bg-muted/20 transition-colors text-left">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.count} élément(s)</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History (merged from PatientRecords) */}
        {tab === "history" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Historique des consultations</h3>
            {consultationHistory.map((c, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Activity className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{c.motif}</h3>
                      <p className="text-sm text-muted-foreground">{c.doctor} · {c.date}</p>
                      <p className="mt-2 text-sm text-foreground">{c.notes}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {c.prescriptions > 0 && <span className="text-xs text-primary flex items-center gap-1"><FileText className="h-3 w-3" />{c.prescriptions} ordonnance(s)</span>}
                        {c.analyses > 0 && <span className="text-xs text-accent flex items-center gap-1"><Activity className="h-3 w-3" />{c.analyses} analyse(s)</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0"><Eye className="h-4 w-4 mr-1" />Détail</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {tab === "documents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Mes documents médicaux</h3>
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowUpload(!showUpload)}>
                <Upload className="h-4 w-4 mr-1" />Importer
              </Button>
            </div>

            {showUpload && (
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, images, documents (max 10 Mo)</p>
                <Button variant="outline" size="sm" className="mt-4">Parcourir les fichiers</Button>
              </div>
            )}

            <div className="space-y-2">
              {documents.map((d, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 shadow-card hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${d.type === "Analyse" ? "bg-accent/10" : d.type === "Ordonnance" ? "bg-primary/10" : d.type === "Imagerie" ? "bg-warning/10" : "bg-muted"}`}>
                      <FileText className={`h-4 w-4 ${d.type === "Analyse" ? "text-accent" : d.type === "Ordonnance" ? "text-primary" : d.type === "Imagerie" ? "text-warning" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{d.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{d.source}</span><span>•</span><span>{d.date}</span><span>•</span><span>{d.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Antecedents */}
        {tab === "antecedents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Mes antécédents médicaux</h3>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </div>
            {antecedents.map((cat, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  {cat.category === "Allergies" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  {cat.category}
                </h4>
                <div className="space-y-3">
                  {cat.items.map((item, j) => (
                    <div key={j} className={`rounded-lg p-3 ${cat.category === "Allergies" ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50"}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
                      </div>
                      {item.details && <p className="text-xs text-muted-foreground mt-1">{item.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Treatments */}
        {tab === "treatments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Mes traitements</h3>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </div>
            <div className="space-y-3">
              {treatments.map((t, i) => (
                <div key={i} className={`rounded-xl border bg-card p-5 shadow-card ${t.status === "ended" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.status === "active" ? "bg-accent/10" : "bg-muted"}`}>
                        <Pill className={`h-4 w-4 ${t.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.dose}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {t.status === "active" ? "En cours" : "Terminé"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>Prescrit par {t.prescriber}</span><span>•</span><span>{t.since}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {tab === "vaccinations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Mon carnet de vaccination</h3>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </div>
            <div className="space-y-3">
              {vaccinations.map((v, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Syringe className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{v.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{v.doses}</span><span>•</span><span>Dernière : {v.lastDate}</span>
                        {v.nextDate && <><span>•</span><span className="text-primary font-medium">Prochain : {v.nextDate}</span></>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientHealth;
