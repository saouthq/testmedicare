import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Eye, Pill, Shield, Send, Printer, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { mockPatientPrescriptions as initialPrescriptions } from "@/data/mockData";

const PatientPrescriptions = () => {
  const [filter, setFilter] = useState("all");
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingToPharmacy, setSendingToPharmacy] = useState<string | null>(null);

  const filtered = filter === "all" ? prescriptions : prescriptions.filter(p => p.status === filter);

  const handleSendToPharmacy = (id: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, pharmacy: "Pharmacie El Amal" } : p));
    setSendingToPharmacy(null);
  };

  return (
    <DashboardLayout role="patient" title="Mes ordonnances">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "all", label: "Toutes", count: prescriptions.length }, { key: "active", label: "Actives", count: prescriptions.filter(p => p.status === "active").length }, { key: "expired", label: "Expirées", count: prescriptions.filter(p => p.status === "expired").length }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${p.status === "active" ? "bg-accent/10" : "bg-muted"}`}>
                      <FileText className={`h-5 w-5 ${p.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{p.id}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                          {p.status === "active" ? "Active" : "Expirée"}
                        </span>
                        {p.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                        {p.pharmacy && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">📦 {p.pharmacy}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{p.doctor} · {p.date}</p>
                      <div className="mt-3 space-y-1">
                        {p.items.map((item, i) => (
                          <p key={i} className="text-sm text-foreground flex items-center gap-2"><Pill className="h-3.5 w-3.5 text-primary" />{item}</p>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-foreground mt-2">{p.total}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedId === p.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              {expandedId === p.id && (
                <div className="border-t px-5 py-4 bg-muted/10">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Voir le détail</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Télécharger PDF</Button>
                    <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                    {p.status === "active" && !p.pharmacy && (
                      sendingToPharmacy === p.id ? (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-primary font-medium">Envoyer à Pharmacie El Amal ?</span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-primary" onClick={() => handleSendToPharmacy(p.id)}>Confirmer</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSendingToPharmacy(null)}><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setSendingToPharmacy(p.id)}>
                          <Send className="h-4 w-4 mr-1" />Envoyer à ma pharmacie
                        </Button>
                      )
                    )}
                  </div>
                  {p.status === "active" && (
                    <p className="text-xs text-muted-foreground mt-3">💡 Vous pouvez envoyer cette ordonnance directement à votre pharmacie pour préparer vos médicaments.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
