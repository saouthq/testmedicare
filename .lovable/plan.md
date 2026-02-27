
# Audit Complet Medicare — Patient + Medecin

## Problemes identifies par priorite

---

### BUG CRITIQUE 1 : Sidebar — Footer invisible sans scroller

**Cause racine** : Sur desktop, la sidebar a `lg:static` qui annule `fixed inset-y-0`. Sans `fixed`, il n'y a plus de contrainte de hauteur sur le `<aside>`. La structure flex (nav `flex-1 overflow-y-auto` + footer `shrink-0`) ne fonctionne que si le conteneur parent a une hauteur fixe.

**Solution** : Garder la sidebar `fixed` sur desktop aussi, ou ajouter `lg:h-screen lg:sticky lg:top-0` au lieu de `lg:static`. La meilleure approche : remplacer `lg:static` par `lg:sticky lg:top-0 lg:h-screen`. Cela fixe la sidebar a l'ecran sans la retirer du flux, et le footer reste ancre en bas.

**Fichier** : `src/components/layout/DashboardLayout.tsx` (lignes 148-154)

---

### BUG 2 : PatientBooking — donnees locales dupliquees (doctor hardcode)

Le fichier `PatientBooking.tsx` contient un objet `doctor` (lignes 12-37) avec `rating: 4.8`, `reviews: 234` et des motifs hardcodes, dupliquant `mockDoctorProfile`. Le rating par etoiles est toujours affiche (ligne 182 : `Star fill-yellow-400`).

**Solution** : Importer `mockDoctorProfile` depuis mockData. Supprimer le rating etoile et le remplacer par le nombre d'avis verifies.

**Fichier** : `src/pages/patient/PatientBooking.tsx`

---

### BUG 3 : SearchDoctors — Rating etoile toujours affiche

La page de recherche affiche encore un systeme de rating par etoiles pour chaque medecin (Star fill-yellow-400). Incoherent avec la decision de supprimer les etoiles.

**Solution** : Remplacer le rating etoile par un badge "X avis verifies" ou simplement "X avis".

**Fichier** : `src/pages/patient/SearchDoctors.tsx`

---

### BUG 4 : Initiales header "JD" hardcodees

Le header du dashboard affiche "JD" (ligne 247 DashboardLayout.tsx) au lieu des initiales dynamiques du patient ("AB" pour Amine Ben Ali) ou du medecin ("AB" pour Ahmed Bouazizi).

**Solution** : Calculer les initiales en fonction du role. Pour patient : "AB" (Amine Ben Ali). Pour doctor : "AB" (Ahmed Bouazizi). Importer les donnees depuis mockData.

**Fichier** : `src/components/layout/DashboardLayout.tsx` (ligne 246-248)

---

### INCOHERENCE 5 : mockReviews contient encore `rating` numerique

Chaque review dans `mockReviews` (mockData.ts ligne 400-406) a encore un champ `rating: 5` ou `rating: 4`. Le profil public ne l'affiche plus mais le champ persiste et pourrait etre utilise par erreur.

**Solution** : Supprimer le champ `rating` de chaque review dans mockData.

**Fichier** : `src/data/mockData.ts`

---

### WORKFLOW 6 : Lien "Prendre RDV" depuis le profil public ne passe pas les infos

Sur `DoctorPublicProfile`, les boutons "Prendre RDV" redirigent vers `/booking/1` mais ne transmettent pas le creneau selectionne (date/heure) en query params. Le workflow booking ne pre-remplit donc rien.

**Solution** : Modifier les liens dans DoctorPublicProfile pour passer `?date=...&time=...` quand un slot est selectionne. PatientBooking lit deja `searchParams` (ligne 73-75).

**Fichier** : `src/pages/public/DoctorPublicProfile.tsx`

---

### WORKFLOW 7 : Navigation patient "Voir le compte-rendu" / "Voir l'ordonnance" cassee

Dans PatientAppointments, les boutons "Voir le compte-rendu" et "Voir l'ordonnance" (lignes 212-213) sont affiches pour les RDV passes mais ne menent nulle part de concret (juste `/dashboard/patient/prescriptions`). Le compte-rendu n'a pas de page.

**Solution** : Ajouter une modale de visualisation du compte-rendu (mock) dans le drawer des RDV passes. Pour l'ordonnance, pre-filtrer sur l'ID quand on navigue.

**Fichier** : `src/pages/patient/PatientAppointments.tsx`

---

### WORKFLOW 8 : Consultation "Demarrer" depuis Dashboard/Planning — toujours `/consultation/new`

Tous les liens "Demarrer consultation" pointent vers `/dashboard/doctor/consultation/new` sans passer l'ID du patient. La consultation s'ouvre toujours avec le meme patient mock (`mockConsultationPatient`).

**Solution** : Passer le patient ID en query param (`/dashboard/doctor/consultation/new?patient=1`) et le lire dans `ConsultationContext` pour charger le bon patient depuis mockPatients.

**Fichier** : `src/pages/doctor/DoctorDashboard.tsx`, `src/pages/doctor/DoctorSchedule.tsx`, `src/components/consultation/ConsultationContext.tsx`

---

### WORKFLOW 9 : Dossier patient "Ouvrir dossier" — toujours `/patients/1`

Depuis le dashboard et le planning, "Ouvrir dossier" pointe vers `/dashboard/doctor/patients/1` quel que soit le patient. L'ID devrait correspondre au patient concerne.

**Solution** : Utiliser l'ID patient reel dans les liens. Pour les RDV du planning, mapper le nom du patient a son ID depuis mockPatients.

**Fichier** : `src/pages/doctor/DoctorDashboard.tsx`, `src/pages/doctor/DoctorSchedule.tsx`

---

### WORKFLOW 10 : Patient "Laisser un avis" apres consultation — inexistant

Le workflow "apres consultation, le patient peut laisser un avis" n'existe pas. Il n'y a aucun moyen pour le patient de laisser un avis verifie.

**Solution** : Dans les RDV passes (tab "Passes" de PatientAppointments), ajouter un bouton "Laisser un avis" qui ouvre une modale avec un champ texte (pas d'etoiles). L'avis est marque "Consultation verifiee" automatiquement.

**Fichier** : `src/pages/patient/PatientAppointments.tsx`

---

### WORKFLOW 11 : Notifications badge "3" hardcode

Le badge de notification dans le header affiche toujours "3" (ligne 241-243 DashboardLayout). Il devrait reflechir le nombre reel de notifications non lues depuis mockData.

**Solution** : Importer `mockNotifications` et compter les non lues.

**Fichier** : `src/components/layout/DashboardLayout.tsx`

---

### INCOHERENCE 12 : PatientHealth menuItems counts statiques

Les compteurs dans le menu de PatientHealth (lignes 13-21 : `count: 5`, `count: 4`, etc.) sont hardcodes. Ils ne refletent pas les ajouts/suppressions faits par l'utilisateur.

**Solution** : Calculer les counts dynamiquement a partir des states (`documents.length`, `antecedents.length`, etc.).

**Fichier** : `src/pages/patient/PatientHealth.tsx`

---

### INCOHERENCE 13 : DoctorPatientDetail 3089 lignes — fichier monolithique

Le fichier fait 3089 lignes, ce qui le rend tres difficile a maintenir. Il melange types, composants UI, logique metier et donnees.

**Solution** : Pas de refactoring structural dans cette iteration, mais noter pour le futur. Priorite aux corrections fonctionnelles.

---

## Plan d'execution (ordre de priorite)

1. **Sidebar fix** (`DashboardLayout.tsx`) : `lg:sticky lg:top-0 lg:h-screen` + initiales dynamiques + badge notifications dynamique
2. **Supprimer ratings etoiles** restants (`PatientBooking.tsx`, `SearchDoctors.tsx`, `mockData.ts`)
3. **PatientBooking** : importer mockDoctorProfile au lieu de donnees locales
4. **DoctorPublicProfile** : passer date/time en query params dans les liens booking
5. **PatientAppointments** : ajouter workflow "Laisser un avis" + modale compte-rendu
6. **PatientHealth** : counts dynamiques dans le menu
7. **Links patient-ID corrects** : Dashboard et Planning du medecin passent le bon patient ID
8. **Consultation context** : lire patient ID depuis query params

---

## Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `DashboardLayout.tsx` | Sidebar sticky desktop, initiales dynamiques, badge notifs dynamique |
| `PatientBooking.tsx` | Import mockDoctorProfile, supprimer etoiles |
| `SearchDoctors.tsx` | Supprimer etoiles, badge avis |
| `mockData.ts` | Supprimer `rating` des reviews |
| `DoctorPublicProfile.tsx` | Query params sur liens booking |
| `PatientAppointments.tsx` | Modale avis, modale compte-rendu |
| `PatientHealth.tsx` | Counts dynamiques |
| `DoctorDashboard.tsx` | IDs patients corrects dans liens |
| `DoctorSchedule.tsx` | IDs patients corrects dans liens |
| `ConsultationContext.tsx` | Lire patient ID depuis URL |
