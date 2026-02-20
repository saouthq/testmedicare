import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import SearchDoctors from "./pages/patient/SearchDoctors";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientBooking from "./pages/patient/PatientBooking";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientHealth from "./pages/patient/PatientHealth";
import PatientSettings from "./pages/patient/PatientSettings";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorConsultationDetail from "./pages/doctor/DoctorConsultationDetail";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorStats from "./pages/doctor/DoctorStats";
import DoctorSecretary from "./pages/doctor/DoctorSecretary";
import DoctorSubscription from "./pages/doctor/DoctorSubscription";
import DoctorOnboarding from "./pages/doctor/DoctorOnboarding";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyStock from "./pages/pharmacy/PharmacyStock";
import PharmacyHistory from "./pages/pharmacy/PharmacyHistory";
import PharmacySettings from "./pages/pharmacy/PharmacySettings";

// Laboratory
import LaboratoryDashboard from "./pages/laboratory/LaboratoryDashboard";
import LaboratoryAnalyses from "./pages/laboratory/LaboratoryAnalyses";
import LaboratoryResults from "./pages/laboratory/LaboratoryResults";
import LaboratoryPatients from "./pages/laboratory/LaboratoryPatients";
import LaboratorySettings from "./pages/laboratory/LaboratorySettings";

// Secretary
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import SecretaryAgenda from "./pages/secretary/SecretaryAgenda";
import SecretaryPatients from "./pages/secretary/SecretaryPatients";
import SecretaryOffice from "./pages/secretary/SecretaryOffice";
import SecretaryDocuments from "./pages/secretary/SecretaryDocuments";
import SecretaryBilling from "./pages/secretary/SecretaryBilling";
import SecretarySettings from "./pages/secretary/SecretarySettings";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Public
import DoctorPublicProfile from "./pages/public/DoctorPublicProfile";

// Shared
import Messages from "./pages/messaging/Messages";
import Teleconsultation from "./pages/teleconsultation/Teleconsultation";

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

          {/* Public doctor profile - clean route */}
          <Route path="/doctor/:id" element={<DoctorPublicProfile />} />

          {/* Patient - clean booking route */}
          <Route path="/search" element={<SearchDoctors />} />
          <Route path="/booking/:doctorId" element={<PatientBooking />} />
          {/* Legacy redirects */}
          <Route path="/dashboard/patient/search" element={<Navigate to="/search" replace />} />
          <Route path="/dashboard/patient/booking" element={<Navigate to="/booking/1" replace />} />

          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/patient/appointments" element={<PatientAppointments />} />
          <Route path="/dashboard/patient/prescriptions" element={<PatientPrescriptions />} />
          <Route path="/dashboard/patient/notifications" element={<PatientNotifications />} />
          <Route path="/dashboard/patient/health" element={<PatientHealth />} />
          <Route path="/dashboard/patient/settings" element={<PatientSettings />} />
          <Route path="/dashboard/patient/messages" element={<Messages role="patient" />} />
          <Route path="/dashboard/patient/teleconsultation" element={<Teleconsultation role="patient" />} />
          <Route path="/dashboard/patient/profile" element={<Navigate to="/dashboard/patient/settings" replace />} />
          <Route path="/dashboard/patient/records" element={<Navigate to="/dashboard/patient/health" replace />} />

          {/* Doctor */}
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/doctor/onboarding" element={<DoctorOnboarding />} />
          <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/dashboard/doctor/patients" element={<DoctorPatients />} />
          <Route path="/dashboard/doctor/patients/:id" element={<DoctorPatientDetail />} />
          <Route path="/dashboard/doctor/consultations" element={<DoctorConsultations />} />
          <Route path="/dashboard/doctor/consultation/new" element={<DoctorConsultationDetail />} />
          <Route path="/dashboard/doctor/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/dashboard/doctor/stats" element={<DoctorStats />} />
          <Route path="/dashboard/doctor/settings" element={<DoctorSettings />} />
          <Route path="/dashboard/doctor/secretary" element={<DoctorSecretary />} />
          <Route path="/dashboard/doctor/subscription" element={<DoctorSubscription />} />
          <Route path="/dashboard/doctor/messages" element={<Messages role="doctor" />} />
          <Route path="/dashboard/doctor/teleconsultation" element={<Teleconsultation role="doctor" />} />

          {/* Pharmacy */}
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/dashboard/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
          <Route path="/dashboard/pharmacy/stock" element={<PharmacyStock />} />
          <Route path="/dashboard/pharmacy/history" element={<PharmacyHistory />} />
          <Route path="/dashboard/pharmacy/settings" element={<PharmacySettings />} />
          <Route path="/dashboard/pharmacy/messages" element={<Messages role="pharmacy" />} />

          {/* Laboratory */}
          <Route path="/dashboard/laboratory" element={<LaboratoryDashboard />} />
          <Route path="/dashboard/laboratory/analyses" element={<LaboratoryAnalyses />} />
          <Route path="/dashboard/laboratory/results" element={<LaboratoryResults />} />
          <Route path="/dashboard/laboratory/patients" element={<LaboratoryPatients />} />
          <Route path="/dashboard/laboratory/settings" element={<LaboratorySettings />} />
          <Route path="/dashboard/laboratory/messages" element={<Messages role="laboratory" />} />

          {/* Secretary */}
          <Route path="/dashboard/secretary" element={<SecretaryDashboard />} />
          <Route path="/dashboard/secretary/agenda" element={<SecretaryAgenda />} />
          <Route path="/dashboard/secretary/patients" element={<SecretaryPatients />} />
          <Route path="/dashboard/secretary/office" element={<SecretaryOffice />} />
          <Route path="/dashboard/secretary/documents" element={<SecretaryDocuments />} />
          <Route path="/dashboard/secretary/billing" element={<SecretaryBilling />} />
          <Route path="/dashboard/secretary/settings" element={<SecretarySettings />} />
          <Route path="/dashboard/secretary/messages" element={<Messages role="secretary" />} />

          {/* Admin */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<AdminUsers />} />
          <Route path="/dashboard/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/dashboard/admin/moderation" element={<AdminModeration />} />
          <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
          <Route path="/dashboard/admin/logs" element={<AdminLogs />} />
          <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
