/**
 * DossierPanel — Panel dossier/notes pendant l'appel (côté médecin).
 * Onglets : Notes | Rx | Analyses | Docs | Historique
 */
import { Activity, ClipboardList, FileText, History, Pill, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTeleconsultation } from "./TeleconsultationContext";
import type { DossierTab } from "./types";

const tabs: Array<{ key: DossierTab; label: string; icon: typeof ClipboardList }> = [
  { key: "notes", label: "Notes", icon: ClipboardList },
  { key: "rx", label: "Rx", icon: Pill },
  { key: "analyses", label: "Analyses", icon: Activity },
  { key: "docs", label: "Docs", icon: FileText },
  { key: "historique", label: "Historique", icon: History },
];

export default function DossierPanel() {
  const ctx = useTeleconsultation();

  if (!ctx.dossierOpen || ctx.role !== "doctor") return null;

  return (
    <div className="absolute top-0 left-0 bottom-0 w-80 bg-card border-r flex flex-col z-10 shadow-elevated">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Dossier patient</h3>
        </div>
        <button onClick={() => ctx.setDossierOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => ctx.setDossierTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              ctx.dossierTab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {ctx.dossierTab === "notes" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Notes de consultation</p>
            <Textarea
              value={ctx.callNotes}
              onChange={e => ctx.setCallNotes(e.target.value)}
              placeholder="Saisissez vos notes pendant l'appel…"
              className="min-h-[200px] text-sm"
            />
          </div>
        )}
        {ctx.dossierTab === "rx" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Ordonnances en cours</p>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Metformine 500mg</p>
              <p className="text-xs">2x/jour · depuis 6 mois</p>
            </div>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Amlodipine 5mg</p>
              <p className="text-xs">1x/jour · depuis 3 mois</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs w-full mt-2">
              <Pill className="h-3.5 w-3.5 mr-1" />Créer ordonnance
            </Button>
          </div>
        )}
        {ctx.dossierTab === "analyses" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Dernières analyses</p>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium text-foreground">Bilan sanguin — 5 Fév 2026</p>
              <p className="text-xs text-muted-foreground">HbA1c: 7.2% · Glycémie: 1.15 g/L</p>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium text-foreground">Bilan lipidique — 10 Jan 2026</p>
              <p className="text-xs text-muted-foreground">Cholestérol total: 2.1 g/L · HDL: 0.55</p>
            </div>
          </div>
        )}
        {ctx.dossierTab === "docs" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Documents récents</p>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium text-foreground">CR consultation — 5 Fév 2026</p>
              <p className="text-xs text-muted-foreground">Signé · Envoyé au patient</p>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium text-foreground">Certificat médical — 20 Jan 2026</p>
              <p className="text-xs text-muted-foreground">Signé</p>
            </div>
          </div>
        )}
        {ctx.dossierTab === "historique" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Historique rapide</p>
            {[
              { date: "5 Fév 2026", motif: "Contrôle trimestriel DT2", notes: "HbA1c stable à 7.2%." },
              { date: "15 Nov 2025", motif: "Renouvellement ordonnance", notes: "Pas de modification." },
              { date: "1 Sep 2025", motif: "Bilan annuel", notes: "Fond d'œil normal." },
            ].map((c, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{c.date}</p>
                <p className="text-sm font-medium text-foreground">{c.motif}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
