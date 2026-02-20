import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Activity, Syringe, AlertTriangle, Download, Heart, Thermometer, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "history" | "vaccinations" | "allergies" | "documents";

const consultationHistory = [
  { date: "10 Fév 2026", doctor: "Dr. Bouazizi", motif: "Suivi diabète", notes: "Glycémie stable 1.05 g/L. Maintien traitement. Contrôle dans 3 mois.", prescriptions: 1, analyses: 0 },
  { date: "15 Jan 2026", doctor: "Dr. Gharbi", motif: "Bilan cardiaque annuel", notes: "ECG normal. TA 13/8. Aucune anomalie détectée.", prescriptions: 0, analyses: 1 },
  { date: "5 Déc 2025", doctor: "Dr. Hammami", motif: "Consultation dermatologie", notes: "Eczéma atopique léger. Prescription crème dermocorticoïde.", prescriptions: 1, analyses: 0 },
  { date: "20 Nov 2025", doctor: "Dr. Bouazizi", motif: "Gastro-entérite", notes: "Prescription antiacide et anti-émétique. Repos recommandé.", prescriptions: 1, analyses: 0 },
];

const vaccinations = [
  { name: "COVID-19 (Pfizer)", date: "15 Mar 2024", dose: "3ème dose (rappel)", nextDue: "Mars 2025" },
  { name: "Grippe saisonnière", date: "10 Oct 2025", dose: "Annuel", nextDue: "Oct 2026" },
  { name: "Tétanos-Polio", date: "5 Juin 2022", dose: "Rappel", nextDue: "Juin 2032" },
  { name: "Hépatite B", date: "12 Jan 2020", dose: "3ème injection", nextDue: "Complet" },
];

const allergies = [
  { name: "Pénicilline", severity: "Sévère", reaction: "Éruption cutanée, œdème", diagnosed: "2015", icon: "🚨" },
  { name: "Acariens", severity: "Modérée", reaction: "Rhinite allergique", diagnosed: "2010", icon: "⚠️" },
  { name: "Pollen de bouleau", severity: "Légère", reaction: "Éternuements, yeux rouges", diagnosed: "2018", icon: "ℹ️" },
];

const medicalDocuments = [
  { name: "Bilan sanguin complet", date: "10 Fév 2026", type: "Résultat d'analyse", size: "1.2 Mo" },
  { name: "ECG - Bilan cardiaque", date: "15 Jan 2026", type: "Examen", size: "850 Ko" },
  { name: "Bulletin de soins CNAM", date: "20 Fév 2026", type: "CNAM", size: "120 Ko" },
  { name: "Ordonnance - Suivi diabète", date: "10 Fév 2026", type: "Ordonnance", size: "89 Ko" },
  { name: "Certificat médical sport", date: "5 Sep 2025", type: "Certificat", size: "45 Ko" },
];

const vitals = [
  { label: "Tension artérielle", value: "13/8", unit: "mmHg", icon: Heart, trend: "stable" },
  { label: "Glycémie", value: "1.05", unit: "g/L", icon: Activity, trend: "down" },
  { label: "Poids", value: "75", unit: "kg", icon: Thermometer, trend: "stable" },
  { label: "IMC", value: "24.2", unit: "", icon: Activity, trend: "stable" },
];

const PatientRecords = () => {
  const [tab, setTab] = useState<Tab>("history");
  const tabs = [
    { key: "history" as Tab, label: "Historique", icon: Activity },
    { key: "vaccinations" as Tab, label: "Vaccinations", icon: Syringe },
    { key: "allergies" as Tab, label: "Allergies", icon: AlertTriangle },
    { key: "documents" as Tab, label: "Documents", icon: FileText },
  ];

  return (
    <DashboardLayout role="patient" title="Dossier médical">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vitals.map((v) => (
            <div key={v.label} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{v.label}</p><v.icon className="h-4 w-4 text-primary" /></div>
              <p className="mt-1 text-2xl font-bold text-foreground">{v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span></p>
              <p className="text-xs text-accent mt-1">{v.trend === "stable" ? "↔ Stable" : v.trend === "down" ? "↓ En baisse" : "↑ En hausse"}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "history" && (
          <div className="space-y-4">
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

        {tab === "vaccinations" && (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b text-left"><th className="p-4 text-sm font-medium text-muted-foreground">Vaccin</th><th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Date</th><th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Dose</th><th className="p-4 text-sm font-medium text-muted-foreground">Prochain rappel</th></tr></thead>
              <tbody className="divide-y">
                {vaccinations.map((v, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3"><Syringe className="h-4 w-4 text-primary" /><span className="font-medium text-foreground">{v.name}</span></div></td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{v.date}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{v.dose}</td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${v.nextDue === "Complet" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>{v.nextDue}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "allergies" && (
          <div className="space-y-4">
            {allergies.map((a, i) => (
              <div key={i} className={`rounded-xl border p-5 shadow-card ${a.severity === "Sévère" ? "border-destructive/30 bg-destructive/5" : a.severity === "Modérée" ? "border-warning/30 bg-warning/5" : "bg-card"}`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">{a.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.severity === "Sévère" ? "bg-destructive/10 text-destructive" : a.severity === "Modérée" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>{a.severity}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">Réaction : {a.reaction}</p>
                    <p className="text-sm text-muted-foreground">Diagnostiqué en {a.diagnosed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "documents" && (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b text-left"><th className="p-4 text-sm font-medium text-muted-foreground">Document</th><th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th><th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th><th className="p-4"></th></tr></thead>
              <tbody className="divide-y">
                {medicalDocuments.map((d, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3">{d.type === "CNAM" ? <Shield className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}<span className="font-medium text-foreground text-sm">{d.name}</span></div></td>
                    <td className="p-4 hidden sm:table-cell"><span className={`rounded-full px-2.5 py-0.5 text-xs ${d.type === "CNAM" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>{d.type}</span></td>
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{d.date}</td>
                    <td className="p-4"><Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4 text-muted-foreground" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientRecords;
