

# Audit complet Medicare — Frontend, Backend, UI/UX, Workflow

## Constat principal : Téléconsultation isolée du workflow consultation

La téléconsultation est actuellement une page **séparée** (`/teleconsultation`) avec son propre contexte (`TeleconsultationContext`), son propre store (`teleconsultSessionStore`), et **aucun lien** avec le système de consultation standard (`ConsultationContext`, `DoctorConsultationDetail`). Quand un médecin termine une téléconsultation, rien ne se passe dans le dossier patient, la facturation, ou les ordonnances.

---

## 1. Téléconsultation → intégrée au workflow consultation

**Problème** : Deux systèmes parallèles et déconnectés.

**Plan** :
- Quand un RDV de type `Téléconsultation` est démarré (depuis `DoctorWaitingRoom` ou `DoctorDashboard`), ouvrir la page consultation standard (`DoctorConsultationDetail`) avec un flag `isTeleconsult: true`
- Ajouter un panneau vidéo intégré dans `CallScreen` directement dans le layout de `DoctorConsultationDetail` (en remplacement ou overlay du sidebar patient)
- Le `SummaryScreen` actuel doit être supprimé au profit de la clôture standard de consultation (qui génère déjà ordonnance, feuille de soins, facture, etc.)
- Le `PreCheckScreen` reste pour le patient uniquement
- Côté patient : garder la page `/dashboard/patient/teleconsultation` comme point d'entrée (precheck → waiting → call → summary simplifié)
- Côté médecin : rediriger `/dashboard/doctor/teleconsultation` vers `/dashboard/doctor/consultation/new?teleconsult=true&appointmentId=X`

---

## 2. Audit Frontend — Pages incomplètes ou cassées

| Page | Problème | Correction |
|------|----------|------------|
| **PatientDashboard** | Crash `undefined.length` en mode Production (déjà partiellement fixé) | Ajouter `?.` et `?? []` sur TOUTES les propriétés dérivées de stores |
| **PatientSettings** | Crash `profile?.insurance` — encore fragile | Null-safety complète |
| **PatientPrescriptions** | Pas de lien avec Supabase `prescriptions` table | Brancher `useDualQuery` |
| **DoctorConsultations** | 1588 lignes, hardcode `CURRENT_DOCTOR = "Dr. Bouazizi"` | Utiliser `readAuthUser()?.doctorName` |
| **DoctorWaitingRoom** | Hardcode `CURRENT_DOCTOR = "Dr. Bouazizi"` | Idem |
| **DoctorDashboard** | Hardcode `CURRENT_DOCTOR = "Dr. Bouazizi"` | Idem |
| **DoctorSchedule** | 2581 lignes, hardcode doctor name | Idem |
| **Register** | Role toujours forcé à `"patient"` même si doctor/pharmacy sélectionné | Passer `selectedRole` à `signUpWithEmail` |
| **SecretarySettings** | Mock sessions hardcodées | Acceptable en démo, marquer clairement |
| **Teleconsultation** | Store interne isolé, pas lié aux appointments | Fusionner avec consultation |

---

## 3. Audit Backend — Tables et données manquantes

| Élément | Statut | Action |
|---------|--------|--------|
| **`appointments.doctor_id`** | Existe mais jamais peuplé par le frontend | Peupler `doctor_id = auth.uid()` à la création |
| **`patients.user_id`** | Rarement peuplé | Auto-lier lors de la création de compte patient |
| **`teleconsult-session` Edge Function** | Placeholder (retourne des tokens fictifs) | Acceptable pour MVP, documenter |
| **`profiles.assurance_number`** | Colonne existe mais jamais affichée côté patient settings | Afficher dans PatientSettings |
| **Pas de table `teleconsult_sessions`** | Le store est en localStorage uniquement | Créer une table ou utiliser `appointments` avec `teleconsultation=true` |
| **RLS `appointments`** | Patient ne peut voir que via `patients.user_id` — souvent null | Ajouter policy basée sur email ou phone fallback |
| **`doctors_directory.id`** | Doit être le même UUID que `auth.users.id` | Vérifier que l'onboarding doctor crée l'entrée |

---

## 4. Audit UI/UX — Problèmes d'expérience

| Problème | Impact | Correction |
|----------|--------|------------|
| **Logout ne redirige pas** | Critique — l'utilisateur reste sur le dashboard | Déjà fixé, mais ajouter un guard `useEffect` dans `DashboardLayout` |
| **Toggle Demo/Production** | Parfois ne réagit pas | Simplifier : `setAppMode` + `window.location.href = "/login"` |
| **`ProfileSectionEditor` ref warning** | Console warning pollue les logs | Ajouter `React.forwardRef` |
| **Hardcoded "Dr. Bouazizi" partout** | En production, tous les médecins voient les mêmes données | Remplacer par user authentifié |
| **Pas de loading states** | En mode Production, les pages sont vides sans indication | Ajouter `LoadingSkeleton` dans les pages qui utilisent `useDualQuery` |
| **Pas de empty states Production** | Pages vides sans message en Production | Ajouter `EmptyState` avec CTA (ex: "Créez votre premier RDV") |
| **Sidebar "Téléconsultation" lien séparé** | Confusion médecin : 2 entrées pour consulter | Fusionner dans "Consultations" avec badge vidéo |

---

## 5. Audit Workflow — Flux cassés ou incomplets

| Workflow | Problème | Fix |
|----------|----------|-----|
| **Patient prend RDV téléconsult → Médecin consulte** | Aucun lien entre booking et téléconsultation | Le RDV doit porter `teleconsultation: true` et le bouton "Démarrer" ouvre la consultation avec vidéo |
| **Médecin termine téléconsult** | Pas de facture, pas d'ordonnance, pas de feuille de soins | Utiliser le workflow `ConsultationContext.closeConsultation()` standard |
| **Patient voit résumé téléconsult** | Summary screen isolé, pas de trace dans le dossier | Le patient doit voir les documents dans `/health` |
| **Inscription médecin** | Role forcé à `patient` dans `Register.tsx` | Passer le role sélectionné |
| **Inscription → onboarding doctor** | Pas de redirection automatique vers `/dashboard/doctor/onboarding` | Ajouter la redirection post-register pour role `doctor` |
| **Secretary → Téléconsultation** | Le panneau `SecretaryTeleconsultPanel` existe mais n'est pas branché | Intégrer dans SecretaryDashboard |

---

## Plan d'implémentation (priorité)

### Phase 1 — Corrections critiques (stabilité)
1. **Fix hardcoded doctor name** : Remplacer `"Dr. Bouazizi"` par `readAuthUser()?.doctorName` dans 4 pages
2. **Fix Register role** : Passer `selectedRole` au lieu de `"patient"` dans `signUpWithEmail`
3. **Null-safety complète** : Auditer toutes les pages pour `undefined.length`, `undefined.map`, etc.
4. **Fix `ProfileSectionEditor`** : Ajouter `forwardRef`
5. **Peupler `doctor_id`** dans les créations d'appointments

### Phase 2 — Fusion téléconsultation (workflow)
6. **Ajouter flag `isTeleconsult` dans ConsultationContext** pour activer le panneau vidéo
7. **Intégrer `CallScreen` simplifié** dans le layout de `DoctorConsultationDetail`
8. **Rediriger `/doctor/teleconsultation`** vers la consultation standard avec paramètre
9. **Garder la page patient teleconsultation** (precheck + waiting + call) mais connecter la fin au dossier patient

### Phase 3 — Production-readiness (backend)
10. **Loading & empty states** sur toutes les pages en mode Production
11. **Brancher `doctor_id = auth.uid()`** dans toutes les queries Supabase
12. **Auto-lier `patients.user_id`** lors du signup patient

**Estimation** : ~3-4 itérations d'implémentation.

