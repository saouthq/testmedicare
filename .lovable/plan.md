

# Plan : Coherence Globale, Bugs et Centralisation des Donnees

Ce plan couvre les corrections de bugs, la centralisation de toutes les donnees mock, et l'enrichissement de DoctorSettings pour une coherence parfaite entre les pages.

---

## 1. Sidebar : footer toujours visible

**Fichier** : `src/components/layout/DashboardLayout.tsx`

Le `<aside>` a `overflow-hidden` (ligne 150) qui empeche le flex layout de fonctionner correctement. Le footer (Parametres/Deconnexion) est pousse hors ecran sur les roles avec beaucoup d'items (medecin: 11 liens).

**Correction** : Remplacer `overflow-hidden` par `overflow-x-hidden` sur le `<aside>`. La structure flex existante (nav `flex-1 overflow-y-auto` + footer `shrink-0`) fera le reste : seule la nav scrollera, le footer restera ancre en bas.

---

## 2. Dropdown "3 points" qui bloque le scroll

**Fichier** : `src/components/doctor-patients/PatientsComponents.tsx`

**Correction** : Ajouter `modal={false}` sur `<DropdownMenu>` dans `PatientRowMenu` (ligne 171). Cela desactive le comportement modal de Radix qui bloque le scroll et les interactions sur le reste de la page.

---

## 3. Habitudes de vie editables

**Fichier** : `src/pages/patient/PatientHealth.tsx`

Actuellement `habits` est importe en `const` depuis mockData (ligne 29). Les autres categories sont en `useState` avec CRUD complet.

**Corrections** :
- Convertir en `useState` : `const [habits, setHabits] = useState(initialHabits)`
- Ajouter `habit: setHabits` dans les maps `handleDelete` et `handleSave`
- Ajouter `ItemActions` sur chaque ligne de la section habitudes
- Ajouter le bouton "Ajouter" dans le `SectionHeader`
- Ajouter la config `habit` dans `AddItemModal` (champs : label, value)

---

## 4. PatientSettings : corriger le nom

**Fichier** : `src/pages/patient/PatientSettings.tsx`

Le profil affiche "Jean Dupont" alors que toutes les donnees mock utilisent "Amine Ben Ali". Corriger les `defaultValue` pour correspondre aux donnees de `mockPatients[0]`.

---

## 5. Centraliser mockDoctorProfile et supprimer les doublons

**Fichier cible** : `src/data/mockData.ts`

Le `mockDoctorProfile` existe deja dans mockData.ts (ligne 343) avec la plupart des champs. Il faut :
- Ajouter les champs manquants : `verifiedReviewCount`, `email`, `convention` (pour DoctorSettings), `consultationDuration`
- Supprimer `rating` du mockDoctorProfile (pas de notation par etoiles)
- Supprimer `mockRatingDistribution` (lignes 413-419)

**Fichier** : `src/pages/public/DoctorPublicProfile.tsx`

Supprimer les 170 lignes de donnees locales (`doctorData`, `availableSlots`, `reviews`, `faqItems`) et importer depuis `@/data/mockData` :
- `mockDoctorProfile` au lieu de `doctorData`
- `mockAvailableSlots` au lieu de `availableSlots`
- `mockReviews` au lieu de `reviews`
- `mockFaqItems` au lieu de `faqItems`

**Fichier** : `src/pages/doctor/DoctorDashboard.tsx`

Importer `mockDoctorProfile` et remplacer le texte en dur "Dr. Ahmed Bouazizi" par `mockDoctorProfile.name`. Ajouter un lien "Completer mon profil" vers `/dashboard/doctor/settings`.

---

## 6. DoctorSettings enrichi

**Fichier** : `src/pages/doctor/DoctorSettings.tsx`

Actuellement l'onglet Profil n'a que 2 cartes (infos perso + infos pro) avec des champs basiques. Le profil public affiche diplomes, actes, sous-specialites, affiliations, tarifs par motif, infos d'acces -- tout cela n'est pas editable.

**Enrichissements de l'onglet Profil** (toutes les valeurs initiales lues depuis `mockDoctorProfile`) :

- **Photo de profil** : zone avec initiales + bouton "Changer la photo"
- **Sous-specialites** : chips editables avec ajout/suppression (tag input)
- **Formations et Diplomes** : liste editable (titre, etablissement, annee) avec boutons ajouter/modifier/supprimer
- **Expertises et Actes** : chips editables
- **Affiliations** : liste editable
- **Tarifs par motif** : tableau editable (nom, duree, prix) avec ajout/suppression de lignes
- **Informations d'acces** : checkboxes (parking, handicap, ascenseur) + champ transport
- **Bouton "Voir mon profil public"** : lien vers `/doctor/1`

Les champs existants (nom, email, tel, adresse, specialite, n° ordre, convention, tarif, presentation, duree, langues) restent mais leurs `defaultValue` seront lues depuis `mockDoctorProfile` au lieu d'etre en dur.

---

## 7. Liens de navigation inter-pages

| Depuis | Vers | Element |
|--------|------|---------|
| DoctorDashboard hero | DoctorSettings | Bouton "Completer mon profil" |
| DoctorSettings profil | DoctorPublicProfile | Bouton "Voir mon profil public" |

---

## Fichiers modifies (ordre d'execution)

1. `src/data/mockData.ts` -- enrichir mockDoctorProfile, supprimer ratingDistribution
2. `src/components/layout/DashboardLayout.tsx` -- `overflow-hidden` -> `overflow-x-hidden`
3. `src/components/doctor-patients/PatientsComponents.tsx` -- `modal={false}`
4. `src/pages/patient/PatientHealth.tsx` -- habits editable avec CRUD
5. `src/pages/patient/PatientSettings.tsx` -- corriger nom vers Amine Ben Ali
6. `src/pages/public/DoctorPublicProfile.tsx` -- importer depuis mockData, supprimer doublons locaux
7. `src/pages/doctor/DoctorDashboard.tsx` -- importer mockDoctorProfile, lien profil
8. `src/pages/doctor/DoctorSettings.tsx` -- enrichir avec tous les champs editables

