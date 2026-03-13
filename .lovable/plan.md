

# Audit Final Medicare — Bilan Pré-Production

## Synthèse

L'application a 6 espaces (Admin, Médecin, Patient, Secrétaire, Pharmacie, Laboratoire) + pages publiques. Le dual-mode (Demo/Production) est en place mais **de nombreux stores et actions ne persistent pas en Supabase**. Voici l'état exact.

---

## 1. ESPACE ADMIN — 85% branché

### Branché Supabase
- AdminUsers (profiles + user_roles)
- AdminDashboard stats (appointments, invoices, profiles, reviews, support_tickets)
- AdminAppointments (appointments table)
- AdminPayments (invoices table)
- AdminLogs (audit_logs table)
- AdminVerifications (doctors_directory, pharmacies_directory)
- AdminGuardPharmacies (pharmacies_directory)
- AdminAnalytics (appointments + reviews aggregation)
- AdminResolution/Support (support_tickets)

### PAS branché (localStorage only)
- **AdminSubscriptions** — pas de table `subscriptions` en BDD
- **AdminOrganizations** — pas de table `organizations`
- **AdminCampaigns** — pas de table `campaigns`
- **AdminConfiguration** — localStorage (adminModulesStore, featureMatrixStore, actionGatingStore)
- **AdminPromotions** — localStorage (adminStore.promotions)
- **AdminOnboarding** — actions mock (relance/approve/reject sur adminStore)
- **AdminSidebarConfig** — localStorage (sidebarVisibilityStore)
- **AdminPlanManager** — localStorage (adminPlanStore)
- **AdminEmailConfig** — localStorage
- **AdminNotificationTemplates** — mock (TODO BACKEND)
- **AdminContentPages** — localStorage (adminStore.pages)
- **AdminReferenceData** — localStorage (specialtyStore)
- **AdminAPIPartners** — localStorage
- **AdminCompliance** — localStorage
- **AdminIAM** — localStorage

### Tables Supabase manquantes pour admin complet
- `subscriptions` (plans, stripe_id, status)
- `organizations` (name, type, members)
- `campaigns` (sms/email, target, status)

---

## 2. ESPACE MÉDECIN — 70% branché

### Branché Supabase (lecture + écriture)
- **Appointments** — CRUD complet via sharedAppointmentsStore
- **Patients** — CRUD via sharedPatientsStore
- **Prescriptions** — create + read via doctorPrescriptionsStore
- **Billing/Invoices** — create via billingStore
- **Availability** — lecture via sharedAvailabilityStore
- **Leaves** — lecture via useDualQuery (doctor_leaves)
- **Tarifs** — lecture via useDualQuery (tarifs)
- **Documents templates** — lecture via useDualQuery (doctor_documents)
- **Protocols** — lecture via useDualQuery (doctor_protocols)
- **Lab demands** — create + update status (lab_demands)
- **Notifications** — push vers Supabase
- **Blocked slots** — lecture via useDualQuery

### PAS branché (mutations localStorage only)
- **updateAvailabilityDay / setSlotDuration** — écrit seulement dans localStorage, pas de `supabase.from("doctor_availability").upsert()`
- **createLeave / deleteLeave** — écrit seulement localStorage, pas d'insert/delete Supabase sur `doctor_leaves`
- **addBlockedSlot / removeBlockedSlot** — localStorage only, pas de mutation Supabase `blocked_slots`
- **updateActe / addActe / removeActe** — localStorage only, pas de mutation Supabase `tarifs`
- **Doctor documents** — pas de CRUD mutations (create/update/delete templates)
- **Doctor protocols** — pas de CRUD mutations (create/update/delete protocols)
- **Doctor profile (doctorProfileStore)** — `updateDoctorProfile()` écrit dans localStorage mais pas dans `doctors_directory`
- **Cabinet/Secretary management (cabinetStore)** — 100% localStorage, pas de table Supabase correspondante
- **DoctorSubscription** — localStorage only, pas de table `subscriptions`
- **DoctorConnect (messaging toggle)** — localStorage

### Pages médecin sans mutation Supabase
- `DoctorSettings` — profil, horaires, tarifs : les saves sont localStorage only
- `DoctorLeaves` — create/delete ne persiste pas
- `DoctorSchedule` — blocked slots ne persistent pas
- `DoctorDocuments` — CRUD templates ne persiste pas
- `DoctorProtocols` — CRUD ne persiste pas
- `DoctorSecretary` — gestion secrétaire 100% mock
- `DoctorTarifs` — ajout/modification ne persiste pas
- `DoctorBilling` — la lecture fonctionne mais l'export CSV est mock

---

## 3. ESPACE PATIENT — 60% branché

### Branché Supabase
- **Appointments** — lecture + cancel via sharedAppointmentsStore
- **Patient profile** — lecture + update (profiles table)
- **Notifications** — lecture (notifications table)
- **Health data (allergies/antecedents)** — sync vers patients table
- **Prescriptions (doctor-side)** — lecture via doctorPrescriptionsStore

### PAS branché
- **prescriptionsStore (patient→pharmacy flow)** — 100% localStorage, le workflow "envoyer ordonnance à pharmacie" ne touche pas Supabase
- **favoriteDoctorsStore** — localStorage only, pas de table
- **reviewsStore.submitReview** — tente Supabase mais la RLS exige `patient_id` qui nécessite une résolution via `patients` table (potentiel RLS error)
- **PatientHealth** — les documents/prescriptions/vaccins dans healthStore sont localStorage only (seuls allergies/antecedents sont synchés)
- **usePatientId** — en production retourne `null` si pas de record dans `patients` table lié au user → les filtres côté client ne marchent pas
- **supportService.createSupportTicket** — écrit dans adminStore localStorage, pas dans `support_tickets` Supabase
- **Patient booking flow (PublicBooking)** — crée un RDV mais sans `patient_id` résolu dynamiquement

---

## 4. ESPACE SECRÉTAIRE — 50% branché

### Branché (via stores partagés)
- **Appointments** — via sharedAppointmentsStore (lecture + mutations)
- **Patients** — via sharedPatientsStore
- **Billing** — via billingStore

### PAS branché
- **SecretaryCallLog** — 100% localStorage/mock
- **SecretarySMS** — 100% mock
- **SecretaryDocuments** — utilise les mêmes templates doctor mais pas de CRUD Supabase
- **SecretaryStats** — stats calculées localement, pas d'agrégation Supabase
- **SecretaryOffice (cabinet management)** — cabinetStore = 100% localStorage
- **SecretarySettings** — localStorage

---

## 5. ESPACE PHARMACIE — 40% branché

### Branché
- **Pharmacy prescriptions** — lecture via useDualQuery (`pharmacy_prescriptions`)
- **updatePharmacyRxStatus** — persiste dans Supabase

### PAS branché
- **Stock management (pharmacyStore.stockStore)** — 100% localStorage, pas de table `pharmacy_stock`
- **updatePharmacyRxItemAvailability** — localStorage only
- **PharmacyConnect** — localStorage
- **PharmacyHistory** — localStorage
- **PharmacyPatients** — localStorage
- **PharmacySettings** — localStorage

### Table manquante
- `pharmacy_stock` (name, quantity, threshold, expiry, supplier)

---

## 6. ESPACE LABORATOIRE — 60% branché

### Branché
- **Lab demands** — lecture + create + update status via labStore (lab_demands table)
- **PDF upload** — storage bucket `lab-results` existe

### PAS branché
- **addLabPdf / removeLabPdf** — localStorage only, ne met pas à jour la colonne `pdfs` dans Supabase
- **LaboratoryQuality** — 100% mock
- **LaboratoryReporting** — 100% mock
- **LaboratorySettings** — localStorage
- **LaboratoryPatients** — localStorage (pas de filtrage par lab_id côté query)

---

## 7. PAGES PUBLIQUES & VISITEUR — 70% branché

### Branché
- **Annuaires** (doctors_directory, pharmacies_directory, clinics_directory, hospitals_directory, medicines) — lecture Supabase via directoryStore
- **PublicBooking** — crée un appointment avec `created_by='public'`

### PAS branché
- **supportService.createSupportTicket** — localStorage only
- **authOtpService (guest OTP flow)** — mock, n'utilise pas l'edge function `send-otp` déployée
- **Reviews sur profil public** — lecture fonctionne, soumission potentiellement bloquée par RLS

---

## 8. TRANSVERSAL — Problèmes Critiques

### Messagerie (messagesStore)
- **sendMessage** — persiste dans Supabase (`chat_messages` + `chat_threads`)
- **createThread** — persiste dans Supabase
- **markThreadRead** — persiste dans Supabase
- Status: **OK** pour la messagerie

### Notifications (notificationsStore)
- **pushNotification** — persiste dans Supabase (quand user_id disponible)
- **markRead / markAllRead** — persiste dans Supabase
- Status: **OK** mais `user_id` est parfois celui de l'émetteur, pas du destinataire

### Auth
- **Register** — fonctionne (Supabase Auth + handle_new_user trigger)
- **Login** — fonctionne (Supabase Auth)
- **Demo mode** — fonctionne
- **loadSupabaseUser** — charge profil + rôle depuis Supabase
- Status: **OK**

---

## 9. Résumé des Mutations Manquantes (Priorité)

```text
CRITIQUE (workflows cassés en production):
┌─────────────────────────────────────────────────────┐
│ 1. Availability: save → doctor_availability upsert  │
│ 2. Leaves: create/delete → doctor_leaves insert/del │
│ 3. Blocked slots: add/remove → blocked_slots CRUD   │
│ 4. Tarifs: add/update/remove → tarifs CRUD           │
│ 5. Doctor profile: save → doctors_directory update   │
│ 6. Patient→Pharmacy Rx flow → pharmacy_prescriptions│
│ 7. Support tickets (public) → support_tickets insert│
│ 8. usePatientId production → resolve via patients   │
└─────────────────────────────────────────────────────┘

IMPORTANT (fonctionnel mais incomplet):
┌─────────────────────────────────────────────────────┐
│ 9.  Doc templates CRUD → doctor_documents           │
│ 10. Protocols CRUD → doctor_protocols               │
│ 11. Lab PDFs sync → lab_demands.pdfs update         │
│ 12. Favorites doctors → besoin table ou JSONB       │
│ 13. Health docs/vaccins → besoin table ou JSONB     │
│ 14. Guest OTP → wire to send-otp edge function      │
└─────────────────────────────────────────────────────┘

TABLES MANQUANTES (admin complet):
┌─────────────────────────────────────────────────────┐
│ 15. subscriptions (doctor plans)                     │
│ 16. organizations (clinics/hospitals membership)     │
│ 17. campaigns (SMS/email marketing)                  │
│ 18. pharmacy_stock (inventory management)            │
│ 19. cabinets (multi-doctor practice)                 │
└─────────────────────────────────────────────────────┘
```

## 10. Plan d'Action Recommandé

**Phase 7** — Mutations critiques médecin (items 1-5): wirer les saves Supabase pour availability, leaves, blocked_slots, tarifs, doctor profile.

**Phase 8** — Patient production-ready (items 6-8): wirer le flow Rx patient→pharmacie, support tickets public, résoudre usePatientId.

**Phase 9** — CRUD complet stores restants (items 9-14): templates, protocols, lab PDFs, favorites, health docs, OTP.

**Phase 10** — Tables manquantes + admin final (items 15-19): créer les tables Supabase, wirer les pages admin restantes.

Chaque phase est indépendante et peut être implémentée en une seule itération.

