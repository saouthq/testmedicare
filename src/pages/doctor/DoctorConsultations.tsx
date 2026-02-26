import DashboardLayout from "@/components/layout/DashboardLayout";
import { ConsultationsProvider } from "@/components/doctor-consultations/ConsultationsContext";
import {
  ConsultationsToolbar,
  ConsultationsStats,
  ConsultationsList,
  ConsultationsActionsPalette,
  ConsultationsCloseSheet,
  ConsultationsRescheduleSheet,
} from "@/components/doctor-consultations/ConsultationsComponents";

/**
 * DoctorConsultations — Page "Consultations"
 * Toute la logique est dans ConsultationsContext.
 * Ce fichier ne fait que composer les sous-composants.
 */
const DoctorConsultations = () => {
  return (
    <ConsultationsProvider>
      <DashboardLayout role="doctor" title="Consultations">
        <div className="space-y-6">
          <ConsultationsToolbar />
          <ConsultationsStats />
          <ConsultationsList />
          <ConsultationsActionsPalette />
          <ConsultationsCloseSheet />
          <ConsultationsRescheduleSheet />
        </div>
      </DashboardLayout>
    </ConsultationsProvider>
  );
};

export default DoctorConsultations;
