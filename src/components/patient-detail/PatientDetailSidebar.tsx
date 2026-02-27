/**
 * PatientDetailSidebar — Colonne droite du dossier patient.
 * Rappels + Traitements/ordonnance active + Notes rapides.
 */
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePatientDetail } from "./PatientDetailContext";
import { toast } from "@/hooks/use-toast";

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function PatientDetailSidebar() {
  const {
    activeRx, activeTreatments, openRx,
    quickNotes, setQuickNotes, quickNotesSavedAt, quickNotesRef, setTab, appendQuickNote,
  } = usePatientDetail();

  return (
    <>
      {/* Rappels */}
      <Card title="Rappels" right={
        <Button variant="outline" size="sm" onClick={() => toast({ title: "Nouveau rappel", description: "Formulaire de création de rappel à brancher." })}>
          <Plus className="h-3.5 w-3.5 mr-1" />Créer un rappel
        </Button>
      }>
        <div className="space-y-2">
          <div className="rounded-xl border bg-warning/10 px-3 py-2">
            <div className="text-sm font-medium text-foreground">Bilan HbA1c à prescrire</div>
            <div className="text-xs text-muted-foreground">3 mois</div>
          </div>
          <div className="rounded-xl border bg-background px-3 py-2">
            <div className="text-sm font-medium text-foreground">Fond d'œil annuel</div>
            <div className="text-xs text-muted-foreground">à prévoir</div>
          </div>
        </div>
      </Card>

      {/* Traitements / ordonnance active */}
      <Card title="Traitements / ordonnance active" right={
        <Button variant="outline" size="sm" onClick={openRx}>Ouvrir</Button>
      }>
        <div className="rounded-xl border bg-background px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-foreground">{activeRx?.[0]?.id || "ORD-045"}</div>
            <div className="text-xs text-muted-foreground">{activeRx?.[0]?.date || "—"}</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {activeTreatments.length ? activeTreatments.join(" • ") : "Aucun traitement actif."}
          </div>
        </div>
      </Card>

      {/* Notes rapides */}
      <Card title="Notes rapides" right={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTab("notes")}>Ouvrir notes</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => { const trimmed = (quickNotes || "").trim(); if (!trimmed) return; appendQuickNote(trimmed); setQuickNotes(""); }}>
            Ajouter
          </Button>
        </div>
      }>
        <div ref={quickNotesRef} className="space-y-2" id="patient-quick-notes">
          <div className="text-xs text-muted-foreground">
            Note interne rapide (auto-sauvegardée)
            {quickNotesSavedAt ? ` • sauvegardée à ${quickNotesSavedAt.toLocaleTimeString().slice(0, 5)}` : ""}
          </div>
          <textarea id="patient-quick-notes-textarea" value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)}
            rows={6} className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25"
            placeholder="Ex : patient stressé, rappeler bilan, priorité…" />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setQuickNotes("")}>Effacer</Button>
            <div className="text-[11px] text-muted-foreground">Astuce : Ctrl/Cmd+K → "note rapide"</div>
          </div>
        </div>
      </Card>
    </>
  );
}
