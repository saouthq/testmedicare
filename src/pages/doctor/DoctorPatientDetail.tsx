/**
 * DoctorPatientDetail — Page dossier patient (slim composer).
 * Toute la logique est dans PatientDetailContext.
 * Toute l'UI est dans les composants patient-detail/.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PatientDetailProvider } from "@/components/patient-detail/PatientDetailContext";
import PatientDetailHeader from "@/components/patient-detail/PatientDetailHeader";
import PatientDetailTabs from "@/components/patient-detail/PatientDetailTabs";
import PatientDetailSidebar from "@/components/patient-detail/PatientDetailSidebar";
import PatientDetailDrawers from "@/components/patient-detail/PatientDetailDrawers";
import PatientDetailActions from "@/components/patient-detail/PatientDetailActions";

export default function DoctorPatientDetail() {
  return (
    <PatientDetailProvider>
      <DashboardLayout role="doctor" title="Dossier patient">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-6">
          <PatientDetailHeader />

          <div className="grid grid-cols-12 gap-4">
            {/* Left */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <PatientDetailTabs />
            </div>

            {/* Right */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <PatientDetailSidebar />
            </div>
          </div>

          {/* Overlays */}
          <PatientDetailActions />
          <PatientDetailDrawers />
        </div>
      </DashboardLayout>
    </PatientDetailProvider>
  );
}
