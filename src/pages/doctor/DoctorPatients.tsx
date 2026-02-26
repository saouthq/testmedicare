import DashboardLayout from "@/components/layout/DashboardLayout";
import { PatientsProvider } from "@/components/doctor-patients/PatientsContext";
import {
  PatientsToolbar,
  PatientsStats,
  PatientsSelectedBar,
  PatientsList,
  PatientsPalette,
  PatientsNoteModal,
  PatientsNewModal,
} from "@/components/doctor-patients/PatientsComponents";

const DoctorPatients = () => {
  return (
    <PatientsProvider>
      <DashboardLayout role="doctor" title="Mes patients">
        <div className="space-y-6">
          <PatientsToolbar />
          <PatientsStats />
          <PatientsSelectedBar />
          <PatientsList />
          <PatientsPalette />
          <PatientsNoteModal />
          <PatientsNewModal />
        </div>
      </DashboardLayout>
    </PatientsProvider>
  );
};

export default DoctorPatients;
