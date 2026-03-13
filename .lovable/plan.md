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

## Phase 6 — Admin Analytics + Resolution ✅ DONE

27. ✅ AdminAnalytics branché sur appointments + reviews (agrégation temps réel)
28. ✅ AdminResolution branché sur support_tickets (CRUD conversation)
29. ✅ AdminDashboard widgets tickets + pharmacies de garde en temps réel

## Phase 7 — Mutations critiques médecin ✅ DONE

30. ✅ Availability: updateAvailabilityDay/setSlotDuration → doctor_availability upsert
31. ✅ Leaves: createLeave/deleteLeave → doctor_leaves insert/delete
32. ✅ Blocked slots: addBlockedSlot/removeBlockedSlot → blocked_slots insert/delete
33. ✅ Tarifs: addActe/updateActe/removeActe → tarifs CRUD
34. ✅ Doctor profile: updateDoctorProfile → doctors_directory update (déjà fait phase précédente)

## Phase 8 — Patient + transversal production-ready ✅ DONE

35. ✅ Patient→Pharmacy Rx flow → pharmacy_prescriptions insert via Supabase
36. ✅ Support tickets public → support_tickets insert via Supabase
37. ✅ usePatientId production → useResolvedPatientId query patients table
38. ✅ Doc templates CRUD → doctor_documents insert/update/delete
39. ✅ Protocols CRUD → doctor_protocols insert/update/delete
40. ✅ Lab PDFs sync → lab_demands.pdfs update via Supabase

## Phase 9 — À faire (prochaine itération)

- Tables manquantes pour subscriptions, organizations, campaigns (besoin migration DB)
- pharmacy_stock table + pharmacyStore CRUD
- cabinets table + cabinetStore
- Guest OTP → wire to send-otp edge function
- favoriteDoctorsStore → besoin table ou JSONB
- Health docs/vaccins → besoin table ou JSONB
