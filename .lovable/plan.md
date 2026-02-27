

# Plan : Ameliorations multi-pages (Avis, Sidebar, Espace Sante, Espace Medecin)

Ce plan couvre 7 axes d'amelioration demandes.

---

## 1. Avis verifies sans notation par etoiles (DoctorPublicProfile)

**Probleme** : Le profil public affiche un systeme de notation 5 etoiles (rating 4.8, distribution par etoiles) ce qui n'est pas adapte au contexte medical.

**Solution** :
- Supprimer le champ `rating` numerique et la distribution par etoiles (`ratingDistribution`)
- Remplacer par un badge **"Avis verifies"** avec le nombre total d'avis
- Chaque avis affiche uniquement : auteur, date, texte, et un badge "Consultation verifiee" si `verified: true`
- Supprimer les `Star` des reviews individuelles
- Ajouter un compteur "X avis verifies sur Y" en en-tete de section

**Fichier** : `src/pages/public/DoctorPublicProfile.tsx`

---

## 2. Sidebar mobile amelioree (DashboardLayout)

**Probleme** : Sur mobile, la sidebar est cachee (`-translate-x-full`) et quand on l'ouvre via le hamburger, on ne voit pas les labels. De plus, il faut scroller pour voir Parametres et Deconnexion.

**Solution** :
- Sur mobile (quand `sidebarOpen` est vrai), forcer la sidebar en mode **expanded complet** (w-64) avec textes visibles
- Ajouter `overflow-y-auto` + `flex-shrink-0` sur le footer pour que Parametres/Deconnexion soient **toujours visibles** sans scroll
- La nav du milieu prend `flex-1 overflow-y-auto min-h-0` pour que seule la liste des liens scrolle si necessaire
- Sur desktop, garder le comportement actuel (icones seules + expand au hover)

**Fichier** : `src/components/layout/DashboardLayout.tsx`

---

## 3. Espace Sante : ajouter Supprimer et Modifier (PatientHealth)

**Probleme** : On peut ajouter des elements (antecedents, allergies, documents, etc.) mais pas les supprimer ni les modifier.

**Solution** :
- Ajouter un bouton **supprimer** (icone Trash) sur chaque ligne de chaque categorie (antecedents, traitements, allergies, famille, chirurgies, vaccins, mesures, documents)
- Ajouter un bouton **modifier** (icone Pencil) qui ouvre le meme `AddItemModal` pre-rempli avec les donnees existantes
- Le swipe-to-delete n'est pas necessaire, un simple bouton dans un menu contextuel (3 dots) suffit
- Confirmation via toast avant suppression definitive
- Rendre la liste `documents` editable aussi (`useState` au lieu de `const`)

**Fichier** : `src/pages/patient/PatientHealth.tsx`

---

## 4. Dashboard Medecin : Alertes cliquables

**Probleme** : Les alertes ne sont pas cliquables pour naviguer vers la page concernee.

**Solution** :
- Wrapper chaque alerte dans un `Link` vers la page pertinente (ex: dossier patient, resultats labo)
- Ajouter un `cursor-pointer` et un `hover:bg-muted/30` sur les cartes d'alerte
- Chaque alerte mock aura un champ `link` optionnel

**Fichier** : `src/pages/doctor/DoctorDashboard.tsx` + `src/data/mockData.ts`

---

## 5. Consultations : Ameliorer UI et workflow

**Probleme** : Le design de la page consultations n'est pas satisfaisant.

**Solution** :
- Simplifier la toolbar : fusionner la barre de recherche et les filtres sur une seule ligne plus aeree
- Les cartes de consultation : design plus clair avec separation visuelle du temps, du patient et du statut
- Ajouter une mini-timeline visuelle sur le cote gauche (trait vertical reliant les consultations d'un meme jour)
- Les boutons d'action principaux (Demarrer, Cloturer) plus visibles
- Le panel de cloture : simplifier les etapes (2 au lieu de 3)

**Fichiers** : `src/components/doctor-consultations/ConsultationsComponents.tsx`

---

## 6. Mes Patients : Sticky toolbar + scroll ameliore

**Probleme** : Quand on clique sur un patient, la barre d'info s'affiche en haut et pousse le contenu vers le bas. La toolbar et la premiere carte devraient rester visibles.

**Solution** :
- Rendre la toolbar (`PatientsToolbar`) **sticky** (deja fait avec `sticky top-0`)
- Deplacer `PatientsSelectedBar` en **panel lateral (Sheet)** ou en **barre flottante fixe en bas de page** au lieu de l'inserer dans le flux
- Alternative : afficher la barre du patient selectionne en **sticky** juste sous la toolbar, avec un scroll automatique vers le patient selectionne dans la liste

**Fichiers** : `src/components/doctor-patients/PatientsComponents.tsx`

---

## 7. Dossier Patient : Renommer Timeline, ameliorations

**Points demandes** :
- Renommer "Timeline" en "Historique" dans les onglets
- Retirer le bouton "Ramener les antecedents d'avant" (inutile)
- Les constantes de consultation doivent etre reliees au dossier patient (afficher une note indiquant la source)
- Clarifier comment creer un rappel (ajouter un bouton explicite)

**Fichier** : `src/pages/doctor/DoctorPatientDetail.tsx`

---

## Ordre d'execution

1. **DashboardLayout** : Sidebar mobile (impact global, toutes les pages)
2. **PatientHealth** : CRUD complet (supprimer, modifier)
3. **DoctorPublicProfile** : Avis verifies sans etoiles
4. **DoctorDashboard** : Alertes cliquables
5. **ConsultationsComponents** : Redesign UI consultations
6. **PatientsComponents** : Sticky toolbar + selected bar en bottom bar
7. **DoctorPatientDetail** : Renommage + ameliorations mineures

