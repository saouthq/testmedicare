

# Audit complet + Branchement frontend-backend + Comptes test

## Diagnostic

### Problemes identifies

1. **Trigger manquant** : `handle_new_user()` existe comme fonction mais **aucun trigger n'est attache** sur `auth.users`. Resultat : l'inscription cree un user dans `auth.users` mais jamais de ligne dans `profiles` ni `user_roles`. Le login echoue ensuite car `loadSupabaseUser` ne trouve rien.

2. **Zero utilisateurs** : `auth.users`, `profiles`, `user_roles` sont tous vides. Aucun compte test n'existe.

3. **Login.tsx — navigate pendant render** (ligne 32-34) : `if (user) navigate(...)` est appele directement dans le corps du composant, pas dans un `useEffect`. React 18 interdit ca.

4. **DashboardLayout — deconnexion cassee** (ligne 413-420) : Le bouton fait juste `localStorage.removeItem("userRole")` + `<Link to="/login">`. Il ne vide pas le authStore ni la session Supabase. L'utilisateur reste connecte.

5. **Pas de mode dual explicite** : Aucun switch Demo/Production visible. Le mode est implicite selon qu'il y a un user Supabase ou demo.

6. **seedAllStores() sans try-catch** (App.tsx ligne 16) : Si un store crash au seed, page blanche sans erreur.

---

## Plan d'implementation

### 1. Migration SQL — Trigger + Seed data

Une seule migration qui :
- Attache le trigger `on_auth_user_created` sur `auth.users` → `handle_new_user()`
- Insere des donnees de reference (medecins, cliniques, pharmacies, medicaments dans les tables directory) pour que l'app ait du contenu visible meme sans localStorage

### 2. Edge Function — `seed-test-accounts`

Cree 6 comptes test via `supabase.auth.admin.createUser()` (service_role) :
- `patient@test.medicare.tn` / `Test1234!` → role patient
- `doctor@test.medicare.tn` / `Test1234!` → role doctor
- `pharmacy@test.medicare.tn` / `Test1234!` → role pharmacy
- `lab@test.medicare.tn` / `Test1234!` → role laboratory
- `secretary@test.medicare.tn` / `Test1234!` → role secretary
- `admin@test.medicare.tn` / `Test1234!` → role admin

Le trigger `handle_new_user` (une fois attache) creera automatiquement les `profiles` et `user_roles`. La function sera appelee une fois pour seeder puis disponible pour reset.

### 3. Fix Login.tsx

- Remplacer le `if (user) navigate(...)` en ligne 32-34 par un `useEffect`
- Remplacer le `setTimeout(300ms)` dans `handleLogin` par un `await` propre sur `signInWithEmail` + lecture immediate du store

### 4. Fix DashboardLayout.tsx — Deconnexion

Remplacer le `<Link to="/login" onClick={() => localStorage.removeItem("userRole")}>` par un bouton qui :
1. Appelle `await logout()` de authStore (vide store + session Supabase)
2. Redirige vers `/login` via `window.location.href`

### 5. App.tsx — Try-catch seedAllStores

Entourer `seedAllStores()` d'un try-catch pour eviter les pages blanches.

### 6. Mode dual Demo/Production — authStore.ts

- Ajouter `AppMode = "demo" | "production"` persiste dans localStorage
- Exposer `useAppMode()`, `setAppMode()`, `getAppMode()`
- Le mode affecte `useAuth()` : en mode demo, pas de check Supabase ; en mode production, pas de demo users

### 7. Toggle dans SimulationPanel.tsx

Ajouter un switch en haut du panel :
- Label : "Mode Demo" ↔ "Mode Production (Supabase)"
- En mode production, les boutons demo rapide sont desactives/grises
- Changer de mode appelle `logout()` pour eviter les conflits de session

### 8. config.toml

Ajouter `[functions.seed-test-accounts]` avec `verify_jwt = false`.

---

## Fichiers modifies (~8 fichiers)

| Fichier | Action |
|---|---|
| `supabase/migrations/...sql` | Trigger + seed directories |
| `supabase/functions/seed-test-accounts/index.ts` | Nouveau |
| `supabase/config.toml` | Ajouter seed-test-accounts |
| `src/App.tsx` | Try-catch seed |
| `src/pages/Login.tsx` | useEffect redirect + await login |
| `src/components/layout/DashboardLayout.tsx` | Logout propre |
| `src/stores/authStore.ts` | Mode dual (demo/production) |
| `src/components/shared/SimulationPanel.tsx` | Toggle mode |

