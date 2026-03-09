/**
 * SimulationPanel — Dev tool to test cross-role workflows.
 * Appears as a floating button in dev mode.
 * Allows quick simulation of: pharmacy response, lab transmission, consultation end.
 */
import { useState } from "react";
import { Zap, X, FlaskConical, Pill, Stethoscope, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacyRespond, prescriptionsStore } from "@/stores/prescriptionsStore";
import { updateLabDemandStatus, addLabPdf, labStore, initLabStoreIfEmpty } from "@/stores/labStore";
import { endConsultation, markPatientAbsent } from "@/stores/appointmentsStore";
import { pushNotification } from "@/stores/notificationsStore";
import { mockLabDemands } from "@/data/mocks/lab";
import type { SharedLabDemand } from "@/stores/labStore";
import { toast } from "sonner";

const SimulationPanel = () => {
  const [open, setOpen] = useState(false);

  const simulatePharmacyReady = () => {
    const prescriptions = prescriptionsStore.read();
    const pending = prescriptions.flatMap((p) =>
      p.sentToPharmacies
        .filter((ph) => ph.status === "pending")
        .map((ph) => ({ prescriptionId: p.id, pharmacyId: ph.pharmacyId, pharmacyName: ph.pharmacyName }))
    );
    if (pending.length === 0) {
      toast.info("Aucune ordonnance en attente. Envoyez d'abord une ordonnance depuis l'espace patient.");
      return;
    }
    const item = pending[0];
    pharmacyRespond(item.prescriptionId, item.pharmacyId, {
      status: "ready",
      pickupTime: "Avant 18h",
    });
    toast.success(`✅ Pharmacie "${item.pharmacyName}" a répondu : prête à retirer pour ${item.prescriptionId}`);
  };

  const simulateLabTransmit = () => {
    initLabStoreIfEmpty(mockLabDemands as SharedLabDemand[]);
    const demands = labStore.read();
    const ready = demands.find((d) => d.status === "results_ready");
    const inProgress = demands.find((d) => d.status === "in_progress");
    const target = ready || inProgress;

    if (!target) {
      toast.info("Aucune demande labo en cours/prête. Les demandes mock sont déjà toutes transmises.");
      return;
    }

    if (target.status === "in_progress") {
      // First add a PDF, then mark results_ready, then transmit
      addLabPdf(target.id, {
        id: `PDF-sim-${Date.now()}`,
        name: `Simulation_${target.id}.pdf`,
        size: "250 Ko",
        uploadedAt: new Date().toLocaleDateString("fr-FR"),
      });
      updateLabDemandStatus(target.id, "results_ready");
      toast.success(`📄 PDF ajouté + résultat prêt pour ${target.id}. Cliquez à nouveau pour transmettre.`);
    } else {
      updateLabDemandStatus(target.id, "transmitted");
      toast.success(`📤 Demande ${target.id} transmise au médecin et au patient.`);
    }
  };

  const simulateConsultationEnd = () => {
    endConsultation(1, "Amine Ben Ali", "Dr. Ahmed Bouazizi");
    toast.success("🩺 Consultation terminée — feuille de soins visible côté patient.");
  };

  const simulateAbsent = () => {
    markPatientAbsent(99, "Patient Test", "Dr. Ahmed Bouazizi");
    toast.success("❌ Patient marqué absent — notification envoyée au patient.");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] h-12 w-12 rounded-full gradient-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Panel de simulation cross-rôles"
      >
        <Zap className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 rounded-2xl border bg-card shadow-elevated p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />Simulation cross-rôles
        </h3>
        <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Testez les workflows end-to-end sans backend. Les actions génèrent des notifications visibles dans les autres espaces.
      </p>

      <div className="space-y-2">
        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulatePharmacyReady}>
          <Pill className="h-3.5 w-3.5 mr-2 text-accent" />Simuler réponse pharmacie (prête)
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateLabTransmit}>
          <FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />Simuler transmission labo
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateConsultationEnd}>
          <Stethoscope className="h-3.5 w-3.5 mr-2 text-accent" />Simuler fin consultation
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateAbsent}>
          <UserX className="h-3.5 w-3.5 mr-2 text-destructive" />Simuler patient absent
        </Button>
      </div>

      <div className="border-t pt-2">
        <Button size="sm" variant="ghost" className="w-full text-[10px] text-destructive" onClick={() => {
          localStorage.removeItem("medicare_notifications");
          localStorage.removeItem("medicare_shared_prescriptions");
          localStorage.removeItem("medicare_lab_demands");
          localStorage.removeItem("medicare_appointment_events");
          window.location.reload();
        }}>
          🗑️ Réinitialiser tous les stores
        </Button>
      </div>
    </div>
  );
};

export default SimulationPanel;
