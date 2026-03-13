/**
 * DoctorPrescriptions — Page Ordonnances (slim composer).
 * Data source: PrescriptionsContext → doctorPrescriptionsStore (dual-mode).
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PrescriptionsProvider } from "@/components/doctor-prescriptions/PrescriptionsContext";
import {
  PrescriptionsStats,
  PrescriptionsToolbar,
  PrescriptionsList,
  PrescriptionDetail,
} from "@/components/doctor-prescriptions/PrescriptionsComponents";

export default function DoctorPrescriptions() {
  return (
    <PrescriptionsProvider>
      <DashboardLayout role="doctor" title="Ordonnances">
        <div className="space-y-6">
          <div>
            <div className="text-2xl font-bold text-foreground">Ordonnances</div>
            <div className="text-sm text-muted-foreground">
              Gestion des ordonnances • recherche, filtres, détails et envoi
            </div>
          </div>

          <PrescriptionsStats />
          <PrescriptionsToolbar />
          <PrescriptionsList />
          <PrescriptionDetail />
        </div>
      </DashboardLayout>
    </PrescriptionsProvider>
  );
}
