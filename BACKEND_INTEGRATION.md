# BACKEND_INTEGRATION.md — Guide d'intégration backend pour les développeurs

> Ce document recense **tous les endpoints API**, **modèles de données**, et **points d'intégration** nécessaires pour brancher un backend réel sur l'interface Medicare.tn.  
> Chaque section correspond à un service mock existant marqué `// TODO BACKEND:` dans le code.

---

## 1. Authentification & Sessions

### Endpoints requis

| Méthode | Route | Description | Fichier source |
|---------|-------|-------------|----------------|
| POST | `/api/auth/otp/send` | Envoie un OTP par SMS au numéro fourni | `src/services/authOtpService.ts` |
| POST | `/api/auth/otp/verify` | Vérifie le code OTP et retourne un token session | `src/services/authOtpService.ts` |
| POST | `/api/auth/register` | Inscription patient (email/phone/password) | `src/pages/Register.tsx` |
| POST | `/api/auth/login` | Connexion par email+password → retourne rôle + token | `src/pages/Login.tsx` |
| POST | `/api/auth/logout` | Déconnexion, invalidation session | `DashboardLayout.tsx` |
| GET | `/api/auth/session` | Vérifie session courante, retourne user+role | `AuthGuard.tsx` |

### Modèle User

```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin" | "hospital" | "clinic";
  gouvernorat?: string;
  assuranceNumber?: string;
  createdAt: string;
}
```

### Points critiques
- **AuthGuard** (`src/components/shared/AuthGuard.tsx`) : Actuellement lit `localStorage.userRole`. Remplacer par vérification de session JWT.
- **AdminGuard** (`src/components/admin/AdminGuard.tsx`) : Même logique, vérifier le rôle côté serveur.
- **OTP** : Le code hardcodé `123456` est dans `authOtpService.ts`. À remplacer par un vrai envoi SMS.

---

## 2. Rendez-vous (Appointments)

### Endpoints requis

| Méthode | Route | Description | Fichiers sources |
|---------|-------|-------------|-----------------|
| GET | `/api/appointments?doctor=X&date=Y` | Liste des RDV par médecin/date | `sharedAppointmentsStore.ts` |
| POST | `/api/appointments` | Créer un RDV (booking public ou interne) | `PublicBooking.tsx`, `SecretaryAgenda.tsx` |
| PATCH | `/api/appointments/:id/status` | Changer le statut (confirmed, arrived, cancelled, absent, done) | `DoctorSchedule.tsx`, `SecretaryDashboard.tsx` |
| PATCH | `/api/appointments/:id/reschedule` | Reporter un RDV (nouvelle date/heure) | `DoctorSchedule.tsx` |
| DELETE | `/api/appointments/:id` | Supprimer un RDV | `PatientDashboard.tsx` |
| GET | `/api/appointments/guest?phone=X` | RDV d'un visiteur (par téléphone après OTP) | `MyAppointments.tsx` |

### Modèle Appointment

```typescript
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  status: "pending" | "confirmed" | "arrived" | "in_waiting" | "in_progress" | "done" | "cancelled" | "absent";
  motif: string;
  type: "cabinet" | "teleconsultation" | "domicile";
  notes?: string;
  phone?: string;
  assurance?: string;
  createdAt: string;
}
```

### Stores concernés
- `src/stores/sharedAppointmentsStore.ts` — Store principal, à remplacer par API calls
- `src/stores/appointmentsStore.ts` — Events cross-role (fin consultation, absent, etc.)

---

## 3. Patients

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/patients` | Liste patients du médecin | `sharedPatientsStore.ts` |
| GET | `/api/patients/:id` | Détail patient + antécédents | `DoctorPatientDetail.tsx` |
| PATCH | `/api/patients/:id` | Mise à jour profil patient | `PatientSettings.tsx` |
| GET | `/api/patients/:id/health` | Dossier santé complet | `PatientHealth.tsx` |
| POST | `/api/patients/:id/documents` | Upload document santé | `PatientHealth.tsx` |

### Modèle Patient

```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email?: string;
  bloodType?: string;
  insurance?: string;
  treatingDoctor?: string;
  allergies: string[];
  antecedents: { medical: string[]; surgical: string[]; family: string[] };
  treatments: Treatment[];
  vaccinations: Vaccination[];
}
```

---

## 4. Disponibilités & Congés

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/doctors/:id/availability` | Horaires d'ouverture par jour | `sharedAvailabilityStore.ts` |
| PUT | `/api/doctors/:id/availability` | Mettre à jour les disponibilités | `DoctorSettings.tsx`, `DoctorSchedule.tsx` |
| GET | `/api/doctors/:id/leaves` | Liste des congés | `sharedLeavesStore.ts` |
| POST | `/api/doctors/:id/leaves` | Créer un congé | `DoctorLeaves.tsx` |
| DELETE | `/api/doctors/:id/leaves/:leaveId` | Supprimer un congé | `DoctorLeaves.tsx` |
| GET | `/api/doctors/:id/blocked-slots` | Créneaux bloqués ponctuels | `sharedBlockedSlotsStore.ts` |
| POST | `/api/doctors/:id/blocked-slots` | Bloquer un créneau | `DoctorSchedule.tsx` |

---

## 5. Ordonnances (Prescriptions)

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/prescriptions?patient=X` | Ordonnances d'un patient | `PatientPrescriptions.tsx` |
| POST | `/api/prescriptions` | Créer une ordonnance (médecin) | `DoctorPrescriptions.tsx` |
| POST | `/api/prescriptions/:id/send` | Envoyer à pharmacie(s) | `prescriptionsStore.ts` |
| PATCH | `/api/prescriptions/:id/pharmacy-response` | Pharmacie répond (prête/partielle) | `PharmacyPrescriptions.tsx` |
| POST | `/api/prescriptions/:id/renew` | Demande de renouvellement (patient) | `doctorStore.ts` |
| PATCH | `/api/prescriptions/:id/renew/respond` | Réponse médecin au renouvellement | `DoctorPrescriptions.tsx` |

---

## 6. Consultations

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/consultations?doctor=X` | Liste des consultations passées | `DoctorConsultations.tsx` |
| POST | `/api/consultations` | Créer/démarrer une consultation | `DoctorConsultationDetail.tsx` |
| PATCH | `/api/consultations/:id` | Mettre à jour (notes, diagnostic, etc.) | `ConsultationContext.tsx` |
| POST | `/api/consultations/:id/close` | Terminer la consultation | `ConsultationContext.tsx` |
| GET | `/api/consultations/:id/care-sheet` | Récupérer la feuille de soins | `CareSheetModal.tsx` |

---

## 7. Téléconsultation

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| POST | `/api/teleconsultation/join` | Rejoindre la session | `TeleconsultationContext.tsx` |
| POST | `/api/teleconsultation/end` | Terminer la téléconsultation | `TeleconsultationContext.tsx` |
| GET | `/api/teleconsultation/link` | Obtenir le lien de la session | `TeleconsultationContext.tsx` |
| POST | `/api/teleconsultation/reminder` | Envoyer un rappel SMS | `TeleconsultationContext.tsx` |

### Intégration WebRTC
- Le frontend est prêt pour WebRTC (contrôles caméra/micro/partage écran UI-only)
- Brancher un service WebRTC (Twilio, Daily.co, LiveKit, etc.)
- Les contrôles média sont dans `CallControls.tsx`

---

## 8. Laboratoire

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/lab/demands` | Liste des demandes d'analyses | `labStore.ts` |
| PATCH | `/api/lab/demands/:id/status` | Changer statut (en_cours, terminé) | `LaboratoryAnalyses.tsx` |
| POST | `/api/lab/demands/:id/results` | Upload résultats PDF | `LaboratoryAnalyses.tsx` |
| POST | `/api/lab/demands/:id/transmit` | Transmettre au patient/médecin | `LaboratoryAnalyses.tsx` |

---

## 9. Pharmacie

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/pharmacy/prescriptions` | Ordonnances reçues | `PharmacyPrescriptions.tsx` |
| PATCH | `/api/pharmacy/prescriptions/:id/respond` | Répondre (prête/partielle/rupture) | `PharmacyPrescriptions.tsx` |
| GET | `/api/pharmacy/stock` | Inventaire des médicaments | `PharmacyStock.tsx` |
| PATCH | `/api/pharmacy/stock/:id` | Mettre à jour le stock | `PharmacyStock.tsx` |

---

## 10. Facturation & Paiements

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/billing/invoices?doctor=X` | Factures du médecin | `DoctorBilling.tsx` |
| POST | `/api/billing/invoices` | Créer une facture | `SecretaryBilling.tsx` |
| GET | `/api/tarifs?doctor=X` | Tarifs et actes configurés | `sharedTarifsStore.ts` |
| PUT | `/api/tarifs` | Mettre à jour les tarifs | `DoctorTarifs.tsx` |
| POST | `/api/payments/process` | Traiter un paiement (téléconsultation) | `PublicBooking.tsx` |
| POST | `/api/admin/payments/:id/refund` | Rembourser (admin) | `adminPaymentsService.ts` |

---

## 11. Notifications

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/notifications?role=X` | Notifications pour un rôle | `notificationsStore.ts` |
| PATCH | `/api/notifications/:id/read` | Marquer comme lue | `NotificationCenter.tsx` |
| POST | `/api/notifications/send` | Envoyer une notification cross-role | `notificationsStore.ts` |

### Notifications temps réel
- Actuellement via `BroadcastChannel` (cross-tab uniquement)
- À remplacer par WebSocket ou Server-Sent Events pour le cross-device

---

## 12. Messagerie

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/messages/contacts` | Liste des contacts | `Messages.tsx` |
| GET | `/api/messages/:contactId` | Historique de conversation | `Messages.tsx` |
| POST | `/api/messages/:contactId` | Envoyer un message | `Messages.tsx` |

---

## 13. Administration

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/admin/users` | Liste des utilisateurs | `adminUsersService.ts` |
| PATCH | `/api/admin/users/:id/status` | Suspendre/activer un utilisateur | `adminUsersService.ts` |
| POST | `/api/admin/users/:id/reset-password` | Reset password admin | `adminUsersService.ts` |
| GET | `/api/admin/verifications` | Demandes de vérification KYC | `adminVerificationService.ts` |
| PATCH | `/api/admin/verifications/:id/approve` | Approuver une vérification | `adminVerificationService.ts` |
| PATCH | `/api/admin/verifications/:id/reject` | Rejeter une vérification | `adminVerificationService.ts` |
| GET | `/api/admin/audit-logs` | Journal d'audit | `adminAuditService.ts` |
| PATCH | `/api/admin/moderation/:id/remove` | Retirer un contenu signalé | `adminModerationService.ts` |
| PATCH | `/api/admin/moderation/:id/warn` | Avertir un utilisateur | `adminModerationService.ts` |
| GET | `/api/admin/organizations` | Organisations (cliniques, hôpitaux) | `AdminOrganizations.tsx` |
| GET | `/api/admin/support/tickets` | Tickets de support | `AdminSupport.tsx` |
| PATCH | `/api/admin/guard-pharmacies/:id` | Toggle pharmacie de garde | `AdminGuardPharmacies.tsx` |

---

## 14. Annuaires publics

### Endpoints requis

| Méthode | Route | Description | Fichiers |
|---------|-------|-------------|----------|
| GET | `/api/public/doctors?specialty=X&city=Y` | Recherche médecins | `PublicSearch.tsx` |
| GET | `/api/public/doctors/:id` | Profil public médecin | `DoctorPublicProfile.tsx` |
| GET | `/api/public/clinics` | Liste cliniques | `ClinicsDirectory.tsx` |
| GET | `/api/public/hospitals` | Liste hôpitaux | `HospitalsDirectory.tsx` |
| GET | `/api/public/pharmacies?garde=true` | Pharmacies (filtre garde) | `PharmaciesDirectory.tsx` |
| GET | `/api/public/medicines?q=X` | Recherche médicaments | `MedicinesDirectory.tsx` |
| GET | `/api/public/medicines/:slug` | Détail médicament (notice) | `MedicineDetail.tsx` |

---

## 15. Stores localStorage à migrer

| Store | Clé localStorage | Migration vers |
|-------|-----------------|----------------|
| `sharedAppointmentsStore` | `medicare_shared_appointments` | API REST + WebSocket |
| `sharedAvailabilityStore` | `medicare_shared_availability` | API REST |
| `sharedLeavesStore` | `medicare_shared_leaves` | API REST |
| `sharedBlockedSlotsStore` | `medicare_shared_blocked_slots` | API REST |
| `sharedPatientsStore` | `medicare_shared_patients` | API REST |
| `sharedTarifsStore` | `medicare_shared_tarifs` | API REST |
| `prescriptionsStore` | `medicare_shared_prescriptions` | API REST + WebSocket |
| `labStore` | `medicare_lab_demands` | API REST |
| `notificationsStore` | `medicare_notifications` | API REST + WebSocket/SSE |
| `patientStore` | `medicare_patient_*` | API REST |
| `doctorStore` | `medicare_doctor_*` | API REST |
| `billingStore` | `medicare_billing_*` | API REST |
| `adminAuditService` | `medicare_admin_audit_logs` | API REST |

### Pattern de migration

```typescript
// AVANT (localStorage store)
export const [useSharedAppointments] = createCrossRoleStore<SharedAppointment[]>("medicare_shared_appointments", [...]);

// APRÈS (API-backed store avec React Query)
export const useAppointments = (doctorId: string, date: string) => 
  useQuery({
    queryKey: ["appointments", doctorId, date],
    queryFn: () => api.get(`/api/appointments?doctor=${doctorId}&date=${date}`),
  });
```

---

## 16. Sécurité — Points d'attention

1. **AdminGuard** : Le rôle admin est vérifié côté client (`localStorage`). Migrer vers JWT avec claims de rôle.
2. **OTP** : Le code `123456` est hardcodé. Implémenter un vrai envoi SMS (Twilio, etc.).
3. **RBAC admin** : Les sous-rôles (superadmin, support, finance...) sont mockés dans `adminIAMStore`. Implémenter côté serveur.
4. **Paiements** : Le workflow de paiement téléconsultation est UI-only. Intégrer Stripe/Flouci/E-Dinar.
5. **Upload fichiers** : Les uploads (documents patient, résultats labo) sont mockés. Configurer un stockage S3/Supabase Storage.

---

## 17. Variables d'environnement requises

```env
VITE_API_URL=https://api.medicare.tn
VITE_WS_URL=wss://ws.medicare.tn
VITE_WEBRTC_PROVIDER=daily  # ou twilio, livekit
VITE_WEBRTC_API_KEY=xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
VITE_SENTRY_DSN=xxx
```

---

## 18. Checklist de migration

- [ ] Configurer l'authentification (JWT + refresh tokens)
- [ ] Migrer les stores localStorage vers des API calls (React Query)
- [ ] Implémenter les WebSockets pour les notifications temps réel
- [ ] Brancher le service OTP SMS
- [ ] Intégrer la passerelle de paiement
- [ ] Configurer le stockage fichiers (S3/Supabase Storage)
- [ ] Intégrer WebRTC pour la téléconsultation
- [ ] Implémenter les audit logs côté serveur
- [ ] Configurer les RLS policies pour la multi-tenancy
- [ ] Mettre en place le système de rôles et permissions côté serveur
