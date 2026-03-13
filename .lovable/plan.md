

# Phase 6 + Fix page blanche

## Diagnostic page blanche

L'app a **zero requetes reseau et zero logs console**, ce qui indique un echec de build Vite. La cause la plus probable : les appels `require()` disperses dans le codebase (9 fichiers, 53 occurrences). Vite en mode ESM ne supporte pas `require()` de maniere fiable — ca marche parfois via le CJS interop mais c'est fragile et une des recentes modifications a pu casser la resolution.

**Correction** : Remplacer TOUS les `require()` dans `src/` par des imports statiques ou `await import()`. Fichiers concernes :
- `seedStores.ts` (ligne 179)
- `directoryStore.ts` (lignes 73-75)
- `ConsultationContext.tsx` (ligne 700)
- `PublicBooking.tsx` (ligne 335)
- `sharedAppointmentsStore.ts` (lignes 249-250)
- `AdminVerifications.tsx` (ligne 216)
- `PharmacyPrescriptions.tsx` (lignes 80, 105)
- `DashboardLayout.tsx` (ligne 309)
- `PatientDashboard.tsx` (ligne 94)

## Phase 6 — Finalisation production

### 1. Storage buckets
Creer 3 buckets Supabase : `avatars`, `documents`, `lab-results` avec policies RLS.

### 2. Edge Function OTP (placeholder)
`supabase/functions/send-otp/index.ts` — structure prete pour Twilio/SMS. Accepte `{ phone, locale }`, genere un code 6 chiffres, le stocke dans une table `otp_codes`, retourne success. L'integration SMS sera branchee plus tard par l'equipe.

### 3. Edge Function teleconsult-session (placeholder)
`supabase/functions/teleconsult-session/index.ts` — genere un token/room ID placeholder pour Daily.co/LiveKit.

### 4. config.toml
Ajouter les 2 edge functions avec `verify_jwt = false` (validation manuelle dans le code).

### 5. Seed SQL
Migration SQL avec donnees de demo : 3 medecins, 2 cliniques, 1 hopital, 5 pharmacies, 10 medicaments, tarifs de base. Permettra de tester l'app en mode Supabase sans localStorage.

### 6. Cleanup
Supprimer `src/data/mockData.ts` (fichier legacy) si vide/inutilise.

## Fichiers modifies (~15 fichiers)
- 9 fichiers pour remplacer `require()` → `import`
- 2 edge functions creees
- 1 migration SQL (seed)
- `supabase/config.toml` mis a jour
- Storage buckets via migration

