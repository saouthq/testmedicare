import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import SearchDoctors from "./pages/patient/SearchDoctors";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientProfile from "./pages/patient/PatientProfile";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyStock from "./pages/pharmacy/PharmacyStock";
import PharmacyHistory from "./pages/pharmacy/PharmacyHistory";

// Laboratory
import LaboratoryDashboard from "./pages/laboratory/LaboratoryDashboard";
import LaboratoryAnalyses from "./pages/laboratory/LaboratoryAnalyses";
import LaboratoryResults from "./pages/laboratory/LaboratoryResults";
import LaboratoryPatients from "./pages/laboratory/LaboratoryPatients";

// Secretary
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import SecretaryAgenda from "./pages/secretary/SecretaryAgenda";
import SecretaryPatients from "./pages/secretary/SecretaryPatients";
import SecretaryOffice from "./pages/secretary/SecretaryOffice";
import SecretaryDocuments from "./pages/secretary/SecretaryDocuments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient */}
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/patient/appointments" element={<PatientAppointments />} />
          <Route path="/dashboard/patient/search" element={<SearchDoctors />} />
          <Route path="/dashboard/patient/prescriptions" element={<PatientPrescriptions />} />
          <Route path="/dashboard/patient/profile" element={<PatientProfile />} />

          {/* Doctor */}
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/dashboard/doctor/patients" element={<DoctorPatients />} />
          <Route path="/dashboard/doctor/consultations" element={<DoctorConsultations />} />
          <Route path="/dashboard/doctor/prescriptions" element={<DoctorPrescriptions />} />

          {/* Pharmacy */}
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/dashboard/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
          <Route path="/dashboard/pharmacy/stock" element={<PharmacyStock />} />
          <Route path="/dashboard/pharmacy/history" element={<PharmacyHistory />} />

          {/* Laboratory */}
          <Route path="/dashboard/laboratory" element={<LaboratoryDashboard />} />
          <Route path="/dashboard/laboratory/analyses" element={<LaboratoryAnalyses />} />
          <Route path="/dashboard/laboratory/results" element={<LaboratoryResults />} />
          <Route path="/dashboard/laboratory/patients" element={<LaboratoryPatients />} />

          {/* Secretary */}
          <Route path="/dashboard/secretary" element={<SecretaryDashboard />} />
          <Route path="/dashboard/secretary/agenda" element={<SecretaryAgenda />} />
          <Route path="/dashboard/secretary/patients" element={<SecretaryPatients />} />
          <Route path="/dashboard/secretary/office" element={<SecretaryOffice />} />
          <Route path="/dashboard/secretary/documents" element={<SecretaryDocuments />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
