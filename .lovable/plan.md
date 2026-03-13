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

23. ✅ AdminVerifications connecté à `doctors_directory` + `pharmacies_directory`
24. ✅ AdminGuardPharmacies connecté à `pharmacies_directory`
25. ✅ Hooks Supabase ajoutés pour modération admin

## Phase 6 — Admin Analytics + Resolution ✅ DONE

26. ✅ AdminAnalytics branché sur appointments + reviews (agrégation temps réel)
27. ✅ AdminResolution branché sur support_tickets (CRUD conversation)

## Phase 7 — Mutations critiques médecin ✅ DONE

28. ✅ Availability: updateAvailabilityDay/setSlotDuration → doctor_availability upsert
29. ✅ Leaves: createLeave/deleteLeave → doctor_leaves insert/delete
30. ✅ Blocked slots: addBlockedSlot/removeBlockedSlot → blocked_slots insert/delete
31. ✅ Tarifs: addActe/updateActe/removeActe → tarifs CRUD
32. ✅ Doctor profile: updateDoctorProfile → doctors_directory + profiles update

## Phase 8 — Patient + transversal production-ready ✅ DONE

33. ✅ Patient→Pharmacy Rx flow → pharmacy_prescriptions insert via Supabase
34. ✅ Support tickets public → support_tickets insert via Supabase
35. ✅ usePatientId production → useResolvedPatientId query patients table
36. ✅ Doc templates CRUD → doctor_documents insert/update/delete
37. ✅ Protocols CRUD → doctor_protocols insert/update/delete
38. ✅ Lab PDFs sync → lab_demands.pdfs update via Supabase

## Phase 9 — Wiring final + OTP + Reviews ✅ DONE

39. ✅ Guest OTP → wired to send-otp/verify-otp edge functions (fallback demo mock)
40. ✅ Reviews submitReview → resolves patient_id from patients table before insert
41. ✅ DoctorSettings ProfileTab → handleSave persists via updateDoctorProfile (profiles + doctors_directory)
42. ✅ PatientSettings → already wired via updatePatientProfile (profiles table)
43. ✅ Pharmacy updatePharmacyRxItemAvailability → syncs items to pharmacy_prescriptions
44. ✅ DoctorProfile upsert → doctors_directory + profiles (name, email, phone)

## Phase 10 — À faire (prochaine itération, nécessite nouvelles tables)

- Tables manquantes: subscriptions, organizations, campaigns, pharmacy_stock, cabinets
- favoriteDoctorsStore → besoin table dédiée
- Health docs/vaccins complet → besoin table health_records
- Secrétaire: call log, SMS → besoin tables dédiées
- Admin: subscriptions, organizations, campaigns → besoin tables
