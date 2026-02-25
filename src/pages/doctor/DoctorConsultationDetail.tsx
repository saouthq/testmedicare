import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, CheckCircle2, ClipboardList, Clock, Printer, Save, Search, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConsultationProvider, useConsultation } from "@/components/consultation/ConsultationContext";
import { PatientSidebar } from "@/components/consultation/PatientSidebar";
import { ConsultationNotes } from "@/components/consultation/ConsultationNotes";
import { ActionDock } from "@/components/consultation/ActionDock";
import { SlidePanel } from "@/components/consultation/SlidePanel";
import { CloseModal, HistoryDrawer, CommandPalette, ClosedView } from "@/components/consultation/ConsultationModals";
import { scrollToId } from "@/components/consultation/helpers";

/**
 * DoctorConsultationDetail — Page principale
 * Toute la logique est dans ConsultationContext.
 * Ce fichier ne fait que composer les sous-composants.
 */
const DoctorConsultationDetail = () => {
  return (
    <ConsultationProvider>
      <ConsultationInner />
    </ConsultationProvider>
  );
};

function ConsultationInner() {
  const ctx = useConsultation();

  if (ctx.closed) {
    return (
      <DashboardLayout role="doctor" title="Consultation terminée">
        <ClosedView />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-4">
        <CloseModal />
        <HistoryDrawer />
        <CommandPalette />

        {/* Top bar */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <Link to="/dashboard/doctor/consultations">
                <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">{ctx.patient.name}</h2>
                  <span className="text-xs text-muted-foreground">{ctx.patient.age} ans · {ctx.patient.gender}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">En cours</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 12:45</span>
                  <span className="inline-flex items-center gap-1"><Save className="h-3.5 w-3.5" /> {ctx.lastSavedAt ? `Sauvegardé à ${ctx.lastSavedAt.toLocaleTimeString().slice(0, 5)}` : "Non sauvegardé"}</span>
                  <span className="inline-flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> {ctx.completion.doneCount}/{ctx.completion.total}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { ctx.setPaletteOpen(true); ctx.setPaletteQuery(""); ctx.setPaletteIndex(0); }}>
                <Search className="h-3.5 w-3.5 mr-1" /> Actions
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setLeftCollapsed(v => !v)}>
                <Stethoscope className="h-3.5 w-3.5 mr-1" /> {ctx.leftCollapsed ? "Afficher patient" : "Mode focus"}
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Imprimer
              </Button>
              <Button size="sm" className="text-xs gradient-primary text-primary-foreground shadow-primary-glow" onClick={ctx.nextAction.onClick}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {ctx.nextAction.label}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.round((ctx.completion.doneCount / ctx.completion.total) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Workbench grid */}
        <div className={ctx.leftCollapsed
          ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"
          : "grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_360px]"
        }>
          {!ctx.leftCollapsed && <PatientSidebar />}
          <ConsultationNotes />
          <ActionDock />
        </div>

        <SlidePanel />
      </div>
    </DashboardLayout>
  );
}

export default DoctorConsultationDetail;
