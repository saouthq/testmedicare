import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Download, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const results = [
  {
    id: "RES-001",
    analysis: "ANA-002",
    patient: "Jean Bernard",
    type: "Analyse d'urine",
    date: "19 Fév 2026",
    doctor: "Dr. Lefebvre",
    sent: true,
    values: [
      { name: "pH", value: "6.5", ref: "5.0 - 8.0", status: "normal" },
      { name: "Protéines", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Glucose", value: "Négatif", ref: "Négatif", status: "normal" },
    ],
  },
  {
    id: "RES-002",
    analysis: "ANA-004",
    patient: "Paul Petit",
    type: "Glycémie à jeun",
    date: "18 Fév 2026",
    doctor: "Dr. Martin",
    sent: false,
    values: [
      { name: "Glycémie", value: "1.32 g/L", ref: "0.70 - 1.10 g/L", status: "high" },
    ],
  },
  {
    id: "RES-003",
    analysis: "ANA-006",
    patient: "Luc Garcia",
    type: "Bilan lipidique",
    date: "17 Fév 2026",
    doctor: "Dr. Martin",
    sent: true,
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
          <div key={r.id} className="rounded-xl border bg-card shadow-card">
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{r.id}</h3>
                  {r.sent ? (
                    <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">Envoyé</span>
                  ) : (
                    <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Non envoyé</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.type} · {r.patient} · {r.date}</p>
                <p className="text-sm text-muted-foreground">Prescrit par {r.doctor}</p>
              </div>
              <div className="flex gap-2">
                {!r.sent && (
                  <Button size="sm" className="gradient-primary text-primary-foreground">
                    <Send className="h-4 w-4 mr-1" />Envoyer
                  </Button>
                )}
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />PDF</Button>
              </div>
            </div>
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm">
                    <th className="pb-2 font-medium text-muted-foreground">Paramètre</th>
                    <th className="pb-2 font-medium text-muted-foreground">Résultat</th>
                    <th className="pb-2 font-medium text-muted-foreground">Valeurs de référence</th>
                  </tr>
                </thead>
                <tbody>
                  {r.values.map((v, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 text-sm text-foreground">{v.name}</td>
                      <td className={`py-2 text-sm font-medium ${v.status === "high" ? "text-destructive" : "text-foreground"}`}>{v.value}</td>
                      <td className="py-2 text-sm text-muted-foreground">{v.ref}</td>
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
