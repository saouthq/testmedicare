# Audit complet Medicare — Plan d'implémentation

## Phase 1 — Corrections critiques ✅ DONE

1. ✅ Fix hardcoded doctor name → `getCurrentDoctor()` via `readAuthUser()` dans 4 pages
2. ✅ Fix Register role → passe `selectedRole` au lieu de `"patient"`
3. ✅ Null-safety complète sur toutes les pages patient
4. ✅ `loadSupabaseUser` génère `doctorName` pour les médecins production
5. ✅ Teleconsult → Consultation fusion (isTeleconsult, TeleconsultPanel, redirect route, sidebar cleanup)

## Phase 2 — Production readiness ✅ DONE

6. ✅ Loading skeletons sur DoctorDashboard, DoctorWaitingRoom, PatientDashboard, PatientAppointments
7. ✅ `doctorId` auto-populé via `readAuthUser()` dans `createAppointment()`
8. ✅ `assurance_number` déjà affiché dans PatientSettings (vérifié)
9. ✅ Type `SharedAppointment` enrichi avec `doctorId` + mappers Supabase mis à jour

## Phase 3 — UX & redirections ✅ DONE

10. ✅ Loading skeletons sur DoctorConsultations, DoctorSchedule
11. ✅ Empty states avec CTA sur DoctorConsultations, PatientPrescriptions
12. ✅ SecretaryTeleconsultPanel déjà intégré dans SecretaryDashboard
13. ✅ Redirection post-register vers /dashboard/doctor/onboarding
14. ✅ Post-confirm redirect dans Login.tsx via localStorage flag

## Phase 4 — Admin backend + Isolation praticien ✅ DONE

15. ✅ Créé `useAdminData.ts` avec hooks Supabase pour toutes les entités admin
16. ✅ AdminUsers connecté à `profiles` + `user_roles` (production mode)
17. ✅ AdminDashboard stats dérivées de Supabase (profiles, invoices, appointments, tickets)
18. ✅ AdminAppointments connecté à la table `appointments`
19. ✅ AdminLogs connecté à la table `audit_logs`
20. ✅ AdminPayments connecté à la table `invoices`
21. ✅ Isolation praticien via RLS (doctor_id, pharmacy_id, lab_id) + useDualQuery déjà en place
22. ✅ Toutes les pages fonctionnent en dual mode (Demo localStorage / Production Supabase)

## Phase 5 — Admin Supabase deep integration ✅ DONE

23. ✅ AdminVerifications connecté à `doctors_directory` + `pharmacies_directory` (dual-mode, approve/reject mutation)
24. ✅ AdminGuardPharmacies connecté à `pharmacies_directory` (is_guard toggle mutation, dual-mode)
25. ✅ Hooks Supabase ajoutés: `useAdminVerificationsSupabase`, `useAdminGuardPharmaciesSupabase`, `useAdminGuardPharmacyToggle`, `useAdminVerificationUpdate`, `useAdminTicketUpdateSupabase`
26. ✅ Isolation praticien via RLS (doctor_id, pharmacy_id, lab_id) — vérifié sur toutes les tables

## Phase 6 — À faire (prochaine itération)

- Tables manquantes pour subscriptions, organizations, disputes, campaigns (besoin migration DB)
- UI spécialité dynamique selon doctor profile (specialty-specific tools)
- AdminAnalytics en production avec données réelles agrégées
