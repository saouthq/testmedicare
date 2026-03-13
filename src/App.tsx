import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { seedAllStores } from "@/stores/seedStores";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// Seed all shared stores with mock data on first load
seedAllStores();

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
import DoctorProtocols from "./pages/doctor/DoctorProtocols";
import DoctorLeaves from "./pages/doctor/DoctorLeaves";
import DoctorDocuments from "./pages/doctor/DoctorDocuments";
import DoctorTarifs from "./pages/doctor/DoctorTarifs";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyStock from "./pages/pharmacy/PharmacyStock";
import PharmacyHistory from "./pages/pharmacy/PharmacyHistory";
import PharmacySettings from "./pages/pharmacy/PharmacySettings";
import PharmacyConnect from "./pages/pharmacy/PharmacyConnect";
import PharmacyPatients from "./pages/pharmacy/PharmacyPatients";

// Laboratory
import LaboratoryDashboard from "./pages/laboratory/LaboratoryDashboard";
import LaboratoryAnalyses from "./pages/laboratory/LaboratoryAnalyses";
import LaboratoryResults from "./pages/laboratory/LaboratoryResults";
import LaboratoryPatients from "./pages/laboratory/LaboratoryPatients";
import LaboratorySettings from "./pages/laboratory/LaboratorySettings";
import LaboratoryReporting from "./pages/laboratory/LaboratoryReporting";
import LaboratoryQuality from "./pages/laboratory/LaboratoryQuality";

// Secretary
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import SecretaryAgenda from "./pages/secretary/SecretaryAgenda";
import SecretaryPatients from "./pages/secretary/SecretaryPatients";
import SecretaryOffice from "./pages/secretary/SecretaryOffice";
import SecretaryDocuments from "./pages/secretary/SecretaryDocuments";
import SecretaryBilling from "./pages/secretary/SecretaryBilling";
import SecretarySettings from "./pages/secretary/SecretarySettings";
import SecretaryCallLog from "./pages/secretary/SecretaryCallLog";
import SecretaryStats from "./pages/secretary/SecretaryStats";
import SecretarySMS from "./pages/secretary/SecretarySMS";

// Hospital
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalDepartments from "./pages/hospital/HospitalDepartments";
import HospitalPatients from "./pages/hospital/HospitalPatients";
import HospitalStaff from "./pages/hospital/HospitalStaff";
import HospitalEquipment from "./pages/hospital/HospitalEquipment";
import HospitalSettings from "./pages/hospital/HospitalSettings";

// Clinic
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import ClinicDoctors from "./pages/clinic/ClinicDoctors";
import ClinicAppointments from "./pages/clinic/ClinicAppointments";
import ClinicRooms from "./pages/clinic/ClinicRooms";
import ClinicSettings from "./pages/clinic/ClinicSettings";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReferenceData from "./pages/admin/AdminReferenceData";
import AdminNotificationTemplates from "./pages/admin/AdminNotificationTemplates";
import AdminGuardPharmacies from "./pages/admin/AdminGuardPharmacies";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminIAM from "./pages/admin/AdminIAM";
import AdminFeatureMatrix from "./pages/admin/AdminFeatureMatrix";
import AdminPlanManager from "./pages/admin/AdminPlanManager";
import AdminOverrides from "./pages/admin/AdminOverrides";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminSpecialties from "./pages/admin/AdminSpecialties";
import AdminActions from "./pages/admin/AdminActions";
import AdminEmailConfig from "./pages/admin/AdminEmailConfig";
import AdminOnboarding from "./pages/admin/AdminOnboarding";
import AdminContentPages from "./pages/admin/AdminContentPages";
import AdminAPIPartners from "./pages/admin/AdminAPIPartners";
import AdminReports from "./pages/admin/AdminReports";
import AdminSidebarConfig from "./pages/admin/AdminSidebarConfig";
import AdminResolution from "./pages/admin/AdminResolution";
import AdminConfiguration from "./pages/admin/AdminConfiguration";
import AdminGuard from "./components/admin/AdminGuard";
// DoctorSubscription removed — route redirects to billing

// Shared
import Messages from "./pages/messaging/Messages";
import Teleconsultation from "./pages/teleconsultation/Teleconsultation";
import SimulationPanel from "./components/shared/SimulationPanel";
import ScrollToTop from "./components/shared/ScrollToTop";
import { RouteModuleGate } from "./components/shared/ModuleGate";
import AuthGuard from "./components/shared/AuthGuard";

const queryClient = new QueryClient();

/** Wrap a page element with RouteModuleGate for automatic module checking */
const Gated = ({ children, role }: { children: React.ReactNode; role?: string }) => (
  <RouteModuleGate role={role}>{children}</RouteModuleGate>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
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
          <Route path="/dashboard/patient" element={<AuthGuard allowedRoles={["patient"]}><PatientDashboard /></AuthGuard>} />
          <Route path="/dashboard/patient/appointments" element={<AuthGuard allowedRoles={["patient"]}><PatientAppointments /></AuthGuard>} />
          <Route path="/dashboard/patient/prescriptions" element={<AuthGuard allowedRoles={["patient"]}><PatientPrescriptions /></AuthGuard>} />
          <Route path="/dashboard/patient/notifications" element={<AuthGuard allowedRoles={["patient"]}><PatientNotifications /></AuthGuard>} />
          <Route path="/dashboard/patient/health" element={<AuthGuard allowedRoles={["patient"]}><PatientHealth /></AuthGuard>} />
          <Route path="/dashboard/patient/settings" element={<AuthGuard allowedRoles={["patient"]}><PatientSettings /></AuthGuard>} />
          <Route path="/dashboard/patient/messages" element={<AuthGuard allowedRoles={["patient"]}><Messages role="patient" /></AuthGuard>} />
          <Route path="/dashboard/patient/teleconsultation" element={<AuthGuard allowedRoles={["patient"]}><Teleconsultation role="patient" /></AuthGuard>} />
          <Route path="/dashboard/patient/profile" element={<Navigate to="/dashboard/patient/settings" replace />} />
          <Route path="/dashboard/patient/records" element={<Navigate to="/dashboard/patient/health" replace />} />

          {/* Doctor */}
          <Route path="/dashboard/doctor" element={<AuthGuard allowedRoles={["doctor"]}><DoctorDashboard /></AuthGuard>} />
          <Route path="/dashboard/doctor/onboarding" element={<AuthGuard allowedRoles={["doctor"]}><DoctorOnboarding /></AuthGuard>} />
          <Route path="/dashboard/doctor/schedule" element={<AuthGuard allowedRoles={["doctor"]}><DoctorSchedule /></AuthGuard>} />
          <Route path="/dashboard/doctor/patients" element={<AuthGuard allowedRoles={["doctor"]}><DoctorPatients /></AuthGuard>} />
          <Route path="/dashboard/doctor/patients/:id" element={<AuthGuard allowedRoles={["doctor"]}><DoctorPatientDetail /></AuthGuard>} />
          <Route path="/dashboard/doctor/consultations" element={<AuthGuard allowedRoles={["doctor"]}><DoctorConsultations /></AuthGuard>} />
          <Route path="/dashboard/doctor/consultation/new" element={<AuthGuard allowedRoles={["doctor"]}><DoctorConsultationDetail /></AuthGuard>} />
          <Route path="/dashboard/doctor/prescriptions" element={<AuthGuard allowedRoles={["doctor"]}><DoctorPrescriptions /></AuthGuard>} />
          <Route path="/dashboard/doctor/stats" element={<AuthGuard allowedRoles={["doctor"]}><DoctorStats /></AuthGuard>} />
          <Route path="/dashboard/doctor/settings" element={<AuthGuard allowedRoles={["doctor"]}><DoctorSettings /></AuthGuard>} />
          <Route path="/dashboard/doctor/secretary" element={<AuthGuard allowedRoles={["doctor"]}><DoctorSecretary /></AuthGuard>} />
          <Route path="/dashboard/doctor/subscription" element={<Navigate to="/dashboard/doctor/billing" replace />} />
          <Route path="/dashboard/doctor/messages" element={<AuthGuard allowedRoles={["doctor"]}><Messages role="doctor" /></AuthGuard>} />
          <Route path="/dashboard/doctor/connect" element={<AuthGuard allowedRoles={["doctor"]}><DoctorConnect /></AuthGuard>} />
          <Route path="/dashboard/doctor/billing" element={<AuthGuard allowedRoles={["doctor"]}><DoctorBilling /></AuthGuard>} />
          <Route path="/dashboard/doctor/ai-assistant" element={<AuthGuard allowedRoles={["doctor"]}><DoctorAIAssistant /></AuthGuard>} />
          <Route path="/dashboard/doctor/teleconsultation" element={<AuthGuard allowedRoles={["doctor"]}><Teleconsultation role="doctor" /></AuthGuard>} />
          <Route path="/dashboard/doctor/waiting-room" element={<AuthGuard allowedRoles={["doctor"]}><DoctorWaitingRoom /></AuthGuard>} />
          <Route path="/dashboard/doctor/protocols" element={<AuthGuard allowedRoles={["doctor"]}><DoctorProtocols /></AuthGuard>} />
          <Route path="/dashboard/doctor/leaves" element={<AuthGuard allowedRoles={["doctor"]}><DoctorLeaves /></AuthGuard>} />
          <Route path="/dashboard/doctor/documents" element={<AuthGuard allowedRoles={["doctor"]}><DoctorDocuments /></AuthGuard>} />
          <Route path="/dashboard/doctor/tarifs" element={<AuthGuard allowedRoles={["doctor"]}><DoctorTarifs /></AuthGuard>} />
          {/* duplicate removed */}

          {/* Pharmacy */}
          <Route path="/dashboard/pharmacy" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyDashboard /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/prescriptions" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyPrescriptions /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/stock" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyStock /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/history" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyHistory /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/settings" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacySettings /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/connect" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyConnect /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/patients" element={<AuthGuard allowedRoles={["pharmacy"]}><PharmacyPatients /></AuthGuard>} />
          <Route path="/dashboard/pharmacy/messages" element={<AuthGuard allowedRoles={["pharmacy"]}><Messages role="pharmacy" /></AuthGuard>} />

          {/* Laboratory */}
          <Route path="/dashboard/laboratory" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryDashboard /></AuthGuard>} />
          <Route path="/dashboard/laboratory/analyses" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryAnalyses /></AuthGuard>} />
          <Route path="/dashboard/laboratory/results" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryResults /></AuthGuard>} />
          <Route path="/dashboard/laboratory/patients" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryPatients /></AuthGuard>} />
          <Route path="/dashboard/laboratory/reporting" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryReporting /></AuthGuard>} />
          <Route path="/dashboard/laboratory/quality" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratoryQuality /></AuthGuard>} />
          <Route path="/dashboard/laboratory/settings" element={<AuthGuard allowedRoles={["laboratory"]}><LaboratorySettings /></AuthGuard>} />
          <Route path="/dashboard/laboratory/messages" element={<AuthGuard allowedRoles={["laboratory"]}><Messages role="laboratory" /></AuthGuard>} />

          {/* Secretary */}
          <Route path="/dashboard/secretary" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryDashboard /></AuthGuard>} />
          <Route path="/dashboard/secretary/agenda" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryAgenda /></AuthGuard>} />
          <Route path="/dashboard/secretary/patients" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryPatients /></AuthGuard>} />
          <Route path="/dashboard/secretary/office" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryOffice /></AuthGuard>} />
          <Route path="/dashboard/secretary/documents" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryDocuments /></AuthGuard>} />
          <Route path="/dashboard/secretary/billing" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryBilling /></AuthGuard>} />
          <Route path="/dashboard/secretary/call-log" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryCallLog /></AuthGuard>} />
          <Route path="/dashboard/secretary/stats" element={<AuthGuard allowedRoles={["secretary"]}><SecretaryStats /></AuthGuard>} />
          <Route path="/dashboard/secretary/sms" element={<AuthGuard allowedRoles={["secretary"]}><SecretarySMS /></AuthGuard>} />
          <Route path="/dashboard/secretary/settings" element={<AuthGuard allowedRoles={["secretary"]}><SecretarySettings /></AuthGuard>} />
          <Route path="/dashboard/secretary/messages" element={<AuthGuard allowedRoles={["secretary"]}><Messages role="secretary" /></AuthGuard>} />

          {/* Hospital */}
          <Route path="/dashboard/hospital" element={<AuthGuard allowedRoles={["hospital"]}><HospitalDashboard /></AuthGuard>} />
          <Route path="/dashboard/hospital/departments" element={<AuthGuard allowedRoles={["hospital"]}><HospitalDepartments /></AuthGuard>} />
          <Route path="/dashboard/hospital/patients" element={<AuthGuard allowedRoles={["hospital"]}><HospitalPatients /></AuthGuard>} />
          <Route path="/dashboard/hospital/staff" element={<AuthGuard allowedRoles={["hospital"]}><HospitalStaff /></AuthGuard>} />
          <Route path="/dashboard/hospital/equipment" element={<AuthGuard allowedRoles={["hospital"]}><HospitalEquipment /></AuthGuard>} />
          <Route path="/dashboard/hospital/settings" element={<AuthGuard allowedRoles={["hospital"]}><HospitalSettings /></AuthGuard>} />
          <Route path="/dashboard/hospital/messages" element={<AuthGuard allowedRoles={["hospital"]}><Messages role="hospital" /></AuthGuard>} />

          {/* Clinic */}
          <Route path="/dashboard/clinic" element={<AuthGuard allowedRoles={["clinic"]}><ClinicDashboard /></AuthGuard>} />
          <Route path="/dashboard/clinic/doctors" element={<AuthGuard allowedRoles={["clinic"]}><ClinicDoctors /></AuthGuard>} />
          <Route path="/dashboard/clinic/appointments" element={<AuthGuard allowedRoles={["clinic"]}><ClinicAppointments /></AuthGuard>} />
          <Route path="/dashboard/clinic/rooms" element={<AuthGuard allowedRoles={["clinic"]}><ClinicRooms /></AuthGuard>} />
          <Route path="/dashboard/clinic/settings" element={<AuthGuard allowedRoles={["clinic"]}><ClinicSettings /></AuthGuard>} />
          <Route path="/dashboard/clinic/messages" element={<AuthGuard allowedRoles={["clinic"]}><Messages role="clinic" /></AuthGuard>} />

          {/* Admin — wrapped in AdminGuard */}
          <Route path="/dashboard/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/dashboard/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/dashboard/admin/organizations" element={<AdminGuard><AdminOrganizations /></AdminGuard>} />
          <Route path="/dashboard/admin/appointments" element={<AdminGuard><AdminAppointments /></AdminGuard>} />
          <Route path="/dashboard/admin/verifications" element={<AdminGuard><AdminVerifications /></AdminGuard>} />
          <Route path="/dashboard/admin/subscriptions" element={<AdminGuard><AdminSubscriptions /></AdminGuard>} />
          <Route path="/dashboard/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
          <Route path="/dashboard/admin/reference-data" element={<AdminGuard><AdminReferenceData /></AdminGuard>} />
          <Route path="/dashboard/admin/notification-templates" element={<AdminGuard><AdminNotificationTemplates /></AdminGuard>} />
          <Route path="/dashboard/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
          <Route path="/dashboard/admin/guard-pharmacies" element={<AdminGuard><AdminGuardPharmacies /></AdminGuard>} />
          <Route path="/dashboard/admin/campaigns" element={<AdminGuard><AdminCampaigns /></AdminGuard>} />
          <Route path="/dashboard/admin/promotions" element={<AdminGuard><AdminPromotions /></AdminGuard>} />
          <Route path="/dashboard/admin/iam" element={<AdminGuard><AdminIAM /></AdminGuard>} />
          <Route path="/dashboard/admin/feature-matrix" element={<AdminGuard><AdminFeatureMatrix /></AdminGuard>} />
          <Route path="/dashboard/admin/plans" element={<AdminGuard><AdminPlanManager /></AdminGuard>} />
          <Route path="/dashboard/admin/overrides" element={<AdminGuard><AdminOverrides /></AdminGuard>} />
          <Route path="/dashboard/admin/specialties" element={<AdminGuard><AdminSpecialties /></AdminGuard>} />
          <Route path="/dashboard/admin/actions" element={<AdminGuard><AdminActions /></AdminGuard>} />
          <Route path="/dashboard/admin/compliance" element={<AdminGuard><AdminCompliance /></AdminGuard>} />
          <Route path="/dashboard/admin/email-config" element={<AdminGuard><AdminEmailConfig /></AdminGuard>} />
          <Route path="/dashboard/admin/onboarding" element={<AdminGuard><AdminOnboarding /></AdminGuard>} />
          <Route path="/dashboard/admin/content" element={<AdminGuard><AdminContentPages /></AdminGuard>} />
          <Route path="/dashboard/admin/api-partners" element={<AdminGuard><AdminAPIPartners /></AdminGuard>} />
          <Route path="/dashboard/admin/reports" element={<AdminGuard><AdminReports /></AdminGuard>} />
          <Route path="/dashboard/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
          <Route path="/dashboard/admin/logs" element={<AdminGuard><AdminLogs /></AdminGuard>} />
          <Route path="/dashboard/admin/sidebar-config" element={<AdminGuard><AdminSidebarConfig /></AdminGuard>} />
          <Route path="/dashboard/admin/resolution" element={<AdminGuard><AdminResolution /></AdminGuard>} />
          <Route path="/dashboard/admin/configuration" element={<AdminGuard><AdminConfiguration /></AdminGuard>} />
          {/* Redirects from old merged routes */}
          <Route path="/dashboard/admin/revenue" element={<Navigate to="/dashboard/admin/analytics" replace />} />
          <Route path="/dashboard/admin/doctor-performance" element={<Navigate to="/dashboard/admin/analytics" replace />} />
          <Route path="/dashboard/admin/satisfaction" element={<Navigate to="/dashboard/admin/analytics" replace />} />
          <Route path="/dashboard/admin/audit-logs" element={<Navigate to="/dashboard/admin/logs" replace />} />
          <Route path="/dashboard/admin/moderation" element={<Navigate to="/dashboard/admin/resolution" replace />} />
          <Route path="/dashboard/admin/disputes" element={<Navigate to="/dashboard/admin/resolution" replace />} />
          <Route path="/dashboard/admin/support" element={<Navigate to="/dashboard/admin/resolution" replace />} />
          <Route path="/dashboard/admin/feature-flags" element={<Navigate to="/dashboard/admin/configuration" replace />} />
          <Route path="/dashboard/admin/modules" element={<Navigate to="/dashboard/admin/configuration" replace />} />
          <Route path="/dashboard/admin/action-gating" element={<Navigate to="/dashboard/admin/configuration" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Floating simulation panel for cross-role workflow testing */}
        <SimulationPanel />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
