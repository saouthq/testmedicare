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
11. ✅ Empty states avec CTA sur DoctorConsultations (liste vide), PatientPrescriptions
12. ✅ SecretaryTeleconsultPanel déjà intégré dans SecretaryDashboard (vérifié)
13. ✅ Redirection post-register vers /dashboard/doctor/onboarding pour les médecins
14. ✅ Post-confirm redirect dans Login.tsx via localStorage flag

## Phase 4 — À faire (prochaine itération)

- Empty states sur les pages pharmacy/lab en mode Production (inline déjà présents)
- Loading states sur pages pharmacy/lab
- Null-safety audit complet sur toutes les pages restantes
