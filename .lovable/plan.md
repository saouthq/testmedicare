

# Plan de migration backend — Medicare.tn vers Supabase

## Etat actuel

- **Base de données Supabase** : vide (0 tables, 0 fonctions, 0 triggers)
- **Frontend** : 35 stores localStorage via `crossRoleStore.ts`, tous marqués `// TODO BACKEND`
- **Auth** : simulée via `authStore.ts` avec des scénarios démo hardcodés
- **Supabase client** : déjà configuré dans `src/integrations/supabase/client.ts`

## Strategie globale

Migration incrémentale en **6 phases**, chaque phase livrant une fonctionnalité autonome testable. On garde le mode démo (fallback localStorage) fonctionnel en parallèle pour ne rien casser.

---

## Phase 1 — Fondations : Schema DB + Auth + Profils + Roles

**Migration SQL :**
- Table `profiles` (id FK auth.users, first_name, last_name, phone, email, gouvernorat, assurance_number, avatar_url, created_at)
- Enum `app_role` (patient, doctor, pharmacy, laboratory, secretary, admin, hospital, clinic)
- Table `user_roles` (user_id FK auth.users, role app_role, UNIQUE)
- Fonction `has_role(uuid, app_role)` SECURITY DEFINER
- Trigger auto-create profile on signup
- RLS sur profiles et user_roles

**Code frontend :**
- Refactorer `authStore.ts` : utiliser `supabase.auth` (signUp, signInWithPassword, signOut, onAuthStateChange)
- Mettre a jour `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx` avec Supabase Auth
- Refactorer `AuthGuard.tsx` et `AdminGuard.tsx` pour lire la session Supabase + `has_role()`
- Garder `DEMO_SCENARIOS` comme option de connexion rapide (login avec des comptes de test pre-seedés)

**Fichiers impactés :** authStore.ts, AuthGuard.tsx, AdminGuard.tsx, Login.tsx, Register.tsx, ForgotPassword.tsx

---

## Phase 2 — Tables metier core : Patients, Appointments, Availability

**Migration SQL :**
- `patients` (id, user_id nullable FK, first_name, last_name, dob, phone, email, blood_type, insurance, treating_doctor_id, allergies jsonb, antecedents jsonb, gouvernorat)
- `appointments` (id, patient_id FK, doctor_id FK, date, start_time, end_time, duration, status enum, type enum, motif, notes, phone, assurance, teleconsultation bool, arrived_at, created_at)
- `doctor_availability` (id, doctor_id FK, day_of_week int, start_time, end_time, active bool)
- `doctor_leaves` (id, doctor_id FK, start_date, end_date, reason, type)
- `blocked_slots` (id, doctor_id FK, date, start_time, end_time, reason)
- RLS : doctors voient leurs patients/rdv, patients voient les leurs, secretaries voient ceux de leur cabinet

**Code frontend :**
- Creer `src/hooks/useSupabaseQuery.ts` — wrapper React Query + Supabase
- Migrer `sharedAppointmentsStore` → hooks React Query (useAppointments, useCreateAppointment, etc.)
- Migrer `sharedPatientsStore` → usePatients, usePatient
- Migrer `sharedAvailabilityStore`, `sharedLeavesStore`, `sharedBlockedSlotsStore`
- Activer Supabase Realtime sur `appointments` pour sync cross-tabs

**Fichiers impactés :** 6 stores, ~15 pages (DoctorSchedule, SecretaryAgenda, PublicBooking, PatientDashboard, etc.)

---

## Phase 3 — Prescriptions, Pharmacie, Laboratoire

**Migration SQL :**
- `prescriptions` (id, doctor_id, patient_id, items jsonb, status, pharmacy_id nullable, created_at)
- `pharmacy_prescriptions` (id, prescription_id FK, pharmacy_id FK, status enum, response_note, responded_at)
- `lab_demands` (id, patient_id, doctor_id, lab_id, analyses jsonb, status enum, results_url, transmitted_at)
- `tarifs` (id, doctor_id FK, code, name, price, duration, active)
- Storage bucket `lab-results` pour les PDFs

**Code frontend :**
- Migrer `prescriptionsStore`, `pharmacyStore`, `labStore`, `sharedTarifsStore`
- Connecter les pages Pharmacy* et Laboratory* aux nouvelles queries

**Fichiers impactés :** 4 stores, ~10 pages

---

## Phase 4 — Facturation, Notifications, Messages

**Migration SQL :**
- `invoices` (id, doctor_id, patient_id, amount, type, status enum, date, created_by)
- `notifications` (id, user_id FK, role, title, message, type, read bool, link, created_at)
- `chat_threads` (id, participants uuid[], last_message_at)
- `chat_messages` (id, thread_id FK, sender_id FK, content, created_at)

**Code frontend :**
- Migrer `billingStore`, `notificationsStore`, `messagesStore`
- Activer Realtime sur `notifications` et `chat_messages` pour le temps réel
- Remplacer BroadcastChannel par Supabase Realtime channels

**Fichiers impactés :** 3 stores, ~8 pages

---

## Phase 5 — Annuaires, Avis, Documents, Admin

**Migration SQL :**
- `doctors_directory` (id FK profiles, specialty, city, address, lat, lng, consultation_price, rating, verified bool, bio, photo_url)
- `clinics` / `hospitals` / `pharmacies_directory` (id, name, city, address, phone, services jsonb, etc.)
- `medicines` (id, name, dci, form, category, lab, price, description)
- `reviews` (id, doctor_id FK, patient_id FK, rating, comment, created_at)
- `doctor_documents` (id, doctor_id FK, name, type, url, uploaded_at) + Storage bucket `doctor-documents`
- `doctor_protocols` (id, doctor_id FK, name, specialty, steps jsonb, is_template bool)
- `support_tickets` (id, subject, status, conversation jsonb, created_at)
- `audit_logs` (id, action, entity_type, entity_id, details, user_id, created_at)

**Code frontend :**
- Migrer `directoryStore`, `reviewsStore`, `doctorDocumentsStore`, `doctorProtocolsStore`, `adminStore`
- Connecter toutes les pages publiques et admin aux queries Supabase

**Fichiers impactés :** ~8 stores, ~20 pages

---

## Phase 6 — Finalisation production

- **Edge Function OTP** : `supabase/functions/send-otp/index.ts` — envoi SMS via Twilio (pour le booking guest)
- **Edge Function teleconsult-session** : génération de lien de session (placeholder pour Daily.co/LiveKit)
- **Storage** : buckets `avatars`, `lab-results`, `doctor-documents`, `patient-documents`
- **Seed data** : script SQL d'insertion des données de démo (médecins, cliniques, médicaments)
- **Cleanup** : supprimer les stores localStorage inutilisés, les mocks dans `data/mocks/`, `crossRoleStore.ts` (garder uniquement pour les stores non migrés ou le mode offline)
- **Variables d'env** : vérifier que tout est dans Supabase Secrets
- **Tests** : edge function tests avec `supabase--test_edge_functions`

---

## Ordre d'execution recommande

```text
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
 Auth        Core        Rx/Lab      Billing     Directory    Deploy
 ~2 msgs     ~3 msgs     ~2 msgs     ~2 msgs     ~3 msgs      ~2 msgs
```

Chaque phase est independante apres la Phase 1. Total estime : **~14 messages**.

---

## Details techniques

- **Pattern de migration** : chaque store migré conserve un fallback localStorage pour le mode démo/offline. On crée des hooks `useSupabase*` qui utilisent React Query + Supabase client, et on remplace les imports dans les pages une par une.
- **RLS** : chaque table a des policies basées sur `auth.uid()` et `has_role()`. Les données publiques (annuaires) utilisent des policies `FOR SELECT TO anon`.
- **Realtime** : activé sur `appointments`, `notifications`, `chat_messages` pour la sync instantanée cross-device.
- **Pas de breaking changes** : le mode démo reste fonctionnel en parallèle pendant toute la migration.

On commence par la Phase 1 (Auth + Profils + Roles) ?

