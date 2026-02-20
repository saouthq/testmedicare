import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Send, Eye, Shield, ArrowUp, ArrowDown, Minus, User, Calendar, Banknote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const results = [
  {
    id: "RES-001",
    analysis: "ANA-002",
    patient: "Fatma Trabelsi",
    type: "Analyse d'urine",
    date: "19 Fév 2026",
    doctor: "Dr. Gharbi",
    sent: true,
    amount: "35 DT",
    cnam: true,
    avatar: "FT",
    values: [
      { name: "pH", value: "6.5", ref: "5.0 - 8.0", status: "normal" },
      { name: "Protéines", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Glucose", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Leucocytes", value: "Négatif", ref: "Négatif", status: "normal" },
    ],
  },
  {
    id: "RES-002",
    analysis: "ANA-004",
    patient: "Nadia Jemni",
    type: "Glycémie à jeun",
    date: "18 Fév 2026",
    doctor: "Dr. Bouazizi",
    sent: false,
    amount: "25 DT",
    cnam: true,
    avatar: "NJ",
    values: [
      { name: "Glycémie", value: "1.32 g/L", ref: "0.70 - 1.10 g/L", status: "high" },
    ],
  },
  {
    id: "RES-003",
    analysis: "ANA-006",
    patient: "Rania Meddeb",
    type: "Bilan lipidique",
    date: "17 Fév 2026",
    doctor: "Dr. Bouazizi",
    sent: true,
    amount: "55 DT",
    cnam: true,
    avatar: "RM",
    values: [
      { name: "Cholestérol total", value: "2.40 g/L", ref: "< 2.00 g/L", status: "high" },
      { name: "HDL", value: "0.55 g/L", ref: "> 0.40 g/L", status: "normal" },
      { name: "LDL", value: "1.60 g/L", ref: "< 1.30 g/L", status: "high" },
      { name: "Triglycérides", value: "1.20 g/L", ref: "< 1.50 g/L", status: "normal" },
    ],
  },
];

const LaboratoryResults = () => {
  return (
    <DashboardLayout role="laboratory" title="Résultats">
      <div className="space-y-6">
        {results.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between p-5 border-b flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {r.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{r.id}</h3>
                    {r.sent ? (
                      <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />Envoyé
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Non envoyé</span>
                    )}
                    {r.cnam && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        <Shield className="h-3 w-3" />CNAM
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 font-medium">{r.type}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />{r.patient} · <Calendar className="h-3.5 w-3.5" />{r.date} · Prescrit par {r.doctor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-foreground mr-2">{r.amount}</span>
                {!r.sent && (
                  <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow">
                    <Send className="h-3.5 w-3.5 mr-1" />Envoyer
                  </Button>
                )}
                <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
              </div>
            </div>
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs">
                    <th className="pb-3 font-medium text-muted-foreground">Paramètre</th>
                    <th className="pb-3 font-medium text-muted-foreground">Résultat</th>
                    <th className="pb-3 font-medium text-muted-foreground">Valeurs de référence</th>
                    <th className="pb-3 font-medium text-muted-foreground w-20">Indicateur</th>
                  </tr>
                </thead>
                <tbody>
                  {r.values.map((v, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-3 text-sm text-foreground font-medium">{v.name}</td>
                      <td className={`py-3 text-sm font-bold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-foreground"}`}>
                        {v.value}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{v.ref}</td>
                      <td className="py-3">
                        {v.status === "high" ? (
                          <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                            <ArrowUp className="h-3.5 w-3.5" />Élevé
                          </span>
                        ) : v.status === "low" ? (
                          <span className="flex items-center gap-1 text-warning text-xs font-medium">
                            <ArrowDown className="h-3.5 w-3.5" />Bas
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-accent text-xs font-medium">
                            <Minus className="h-3.5 w-3.5" />Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryResults;
