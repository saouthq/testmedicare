import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Public pages
import PublicSearch from "./pages/public/PublicSearch";
import DoctorPublicProfile from "./pages/public/DoctorPublicProfile";
import PublicBooking from "./pages/public/PublicBooking";
import ClinicsDirectory from "./pages/public/ClinicsDirectory";
import ClinicDetail from "./pages/public/ClinicDetail";
import HospitalsDirectory from "./pages/public/HospitalsDirectory";
import HospitalDetail from "./pages/public/HospitalDetail";
import PharmaciesDirectory from "./pages/public/PharmaciesDirectory";
import PharmacyDetail from "./pages/public/PharmacyDetail";
import MedicinesDirectory from "./pages/public/MedicinesDirectory";
import MedicineDetail from "./pages/public/MedicineDetail";
import FindAppointments from "./pages/public/FindAppointments";
import MyAppointments from "./pages/public/MyAppointments";
import HowItWorks from "./pages/public/HowItWorks";
import Help from "./pages/public/Help";
import BecomePartner from "./pages/public/BecomePartner";
import Legal from "./pages/public/Legal";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientHealth from "./pages/patient/PatientHealth";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientBooking from "./pages/patient/PatientBooking";

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
import DoctorOnboarding from "./pages/doctor/DoctorOnboarding";
import DoctorBilling from "./pages/doctor/DoctorBilling";
import DoctorConnect from "./pages/doctor/DoctorConnect";
import DoctorAIAssistant from "./pages/doctor/DoctorAIAssistant";
import DoctorWaitingRoom from "./pages/doctor/DoctorWaitingRoom";

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
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminReferenceData from "./pages/admin/AdminReferenceData";
import AdminNotificationTemplates from "./pages/admin/AdminNotificationTemplates";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminGuardPharmacies from "./pages/admin/AdminGuardPharmacies";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminGuard from "./components/admin/AdminGuard";

// Shared
import Messages from "./pages/messaging/Messages";
import Teleconsultation from "./pages/teleconsultation/Teleconsultation";
import SimulationPanel from "./components/shared/SimulationPanel";

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

          {/* Public directories & pages */}
          <Route path="/search" element={<PublicSearch />} />
          <Route path="/doctor/:id" element={<DoctorPublicProfile />} />
          <Route path="/booking/:doctorId" element={<PublicBooking />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/clinics" element={<ClinicsDirectory />} />
          <Route path="/clinic/:slug" element={<ClinicDetail />} />
          <Route path="/hospitals" element={<HospitalsDirectory />} />
          <Route path="/hospital/:slug" element={<HospitalDetail />} />
          <Route path="/pharmacies" element={<PharmaciesDirectory />} />
          <Route path="/pharmacy/:slug" element={<PharmacyDetail />} />
          <Route path="/medicaments" element={<MedicinesDirectory />} />
          <Route path="/medicament/:slug" element={<MedicineDetail />} />
          <Route path="/find-appointments" element={<Navigate to="/my-appointments" replace />} />
          <Route path="/retrieve-appointments" element={<Navigate to="/my-appointments" replace />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/help" element={<Help />} />
          <Route path="/become-partner" element={<BecomePartner />} />
          <Route path="/legal/:page" element={<Legal />} />
          <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/legal/cgu" replace />} />
          <Route path="/cookies" element={<Navigate to="/legal/cookies" replace />} />

          {/* Legacy redirects */}
          <Route path="/dashboard/patient/search" element={<Navigate to="/search" replace />} />
          <Route path="/dashboard/patient/booking" element={<Navigate to="/booking/1" replace />} />

          {/* Patient */}
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
          <Route path="/dashboard/doctor/subscription" element={<Navigate to="/dashboard/doctor/billing" replace />} />
          <Route path="/dashboard/doctor/messages" element={<Messages role="doctor" />} />
          <Route path="/dashboard/doctor/connect" element={<DoctorConnect />} />
          <Route path="/dashboard/doctor/billing" element={<DoctorBilling />} />
          <Route path="/dashboard/doctor/ai-assistant" element={<DoctorAIAssistant />} />
          <Route path="/dashboard/doctor/teleconsultation" element={<Teleconsultation role="doctor" />} />
          <Route path="/dashboard/doctor/waiting-room" element={<DoctorWaitingRoom />} />

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

          {/* Admin — wrapped in AdminGuard */}
          <Route path="/dashboard/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/dashboard/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/dashboard/admin/organizations" element={<AdminGuard><AdminOrganizations /></AdminGuard>} />
          <Route path="/dashboard/admin/appointments" element={<AdminGuard><AdminAppointments /></AdminGuard>} />
          <Route path="/dashboard/admin/verifications" element={<AdminGuard><AdminVerifications /></AdminGuard>} />
          <Route path="/dashboard/admin/subscriptions" element={<AdminGuard><AdminSubscriptions /></AdminGuard>} />
          <Route path="/dashboard/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
          <Route path="/dashboard/admin/moderation" element={<AdminGuard><AdminModeration /></AdminGuard>} />
          <Route path="/dashboard/admin/audit-logs" element={<AdminGuard><AdminAuditLogs /></AdminGuard>} />
          <Route path="/dashboard/admin/reference-data" element={<AdminGuard><AdminReferenceData /></AdminGuard>} />
          <Route path="/dashboard/admin/notification-templates" element={<AdminGuard><AdminNotificationTemplates /></AdminGuard>} />
          <Route path="/dashboard/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
          <Route path="/dashboard/admin/support" element={<AdminGuard><AdminSupport /></AdminGuard>} />
          <Route path="/dashboard/admin/guard-pharmacies" element={<AdminGuard><AdminGuardPharmacies /></AdminGuard>} />
          <Route path="/dashboard/admin/campaigns" element={<AdminGuard><AdminCampaigns /></AdminGuard>} />
          <Route path="/dashboard/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
          <Route path="/dashboard/admin/logs" element={<AdminGuard><AdminLogs /></AdminGuard>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Floating simulation panel for cross-role workflow testing */}
        <SimulationPanel />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
