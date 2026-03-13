# Plan : Pages Publiques + Annuaires + Médicaments SEO + Booking OTP invité + Admin Complet

Ce plan est découpé en **5 blocs indépendants**. L’implémentation des 5 bloc se fera en une fois simultanement, obligation de finir les 5 blocs avant de me donner une reponse 

  
Bloc 0 (pré-requis) : Conventions mocks + SEO framework + utilitaires

## Conventions mocks (IMPORTANT)

- Choisir **UNE seule source** de mocks pour éviter la dispersion.
- **Décision appliquée dans ce plan :** centraliser dans `src/data/mockData.ts`
- Donc : **ne pas créer** `src/data/mocks/*` (ou si déjà créé, migrer le contenu vers `src/data/mockData.ts` et supprimer les doublons).

## SEO (IMPORTANT pour l’objectif “notice Google → mon site”)

- Installer et utiliser `react-helmet-async` pour gérer proprement :
  - `<title>`
  - `<meta name="description">`
  - (option) canonical
- Ajouter **robots.txt** + **sitemap.xml** (génération simple mock) :
  - inclure routes : `/medicaments`, `/medicament/:slug`, `/clinics`, `/clinic/:slug`, `/hospitals`, `/hospital/:slug`, `/pharmacies`, `/pharmacy/:slug`, `/search`, `/doctor/:id`
- Ajouter **JSON-LD [schema.org](http://schema.org)** :
  - Médicament : `Drug`
  - Pharmacie : `Pharmacy`
  - Clinique : `MedicalClinic`
  - Hôpital : `Hospital`
- Ajouter un composant `Breadcrumbs` réutilisable pour pages détail (UX + SEO).

---

# Bloc 1 : Landing publique améliorée + Recherche multi-annuaires

## Fichiers modifiés

- `src/pages/Landing.tsx` — refonte complète avec header public enrichi + hero multi-onglets + sections

## Design Landing

**Header :**  
Logo | Rechercher | Annuaire (dropdown: Médecins, Cliniques, Hôpitaux, Pharmacies) | Médicaments | Comment ça marche | Devenir partenaire | Aide | Connexion

**Hero :**  
Tabs recherche : **Médecins | Cliniques | Hôpitaux | Pharmacies | Médicaments**  
Chaque onglet avec champs adaptés (spécialité+ville, ville+service, ville+de garde toggle, nom médicament…)

**Sections :**  
Spécialités populaires (cards vers /search) | Établissements recommandés (cards cliniques/hôpitaux) | Pharmacies proches/de garde | Médicaments recherchés (chips links /medicament/:slug) | Comment ça marche (3 étapes) | Confiance & confidentialité | CTA Devenir partenaire | Footer enrichi

## Mock data (dans `src/data/mockData.ts`)

- `mockClinics[]` : id, name, slug, city, address, phone, services[], image(placeholder), rating
- `mockHospitals[]` : id, name, slug, city, address, phone, services[], urgences(bool)
- `mockPublicPharmacies[]` : id, name, slug, city, address, phone, horaires, deGarde(bool)
- `mockTopMedicines[]` : id, name, slug, form

---

# Bloc 2 : Annuaires publics (Cliniques, Hôpitaux, Pharmacies) + Fiches

## Fichiers créés (~6 pages)


| Fichier                                    | Route             | Description                                                |
| ------------------------------------------ | ----------------- | ---------------------------------------------------------- |
| `src/pages/public/ClinicsDirectory.tsx`    | `/clinics`        | Liste + filtres ville/service                              |
| `src/pages/public/ClinicDetail.tsx`        | `/clinic/:slug`   | Fiche clinique (infos, services, contact, map placeholder) |
| `src/pages/public/HospitalsDirectory.tsx`  | `/hospitals`      | Liste + filtres ville/service                              |
| `src/pages/public/HospitalDetail.tsx`      | `/hospital/:slug` | Fiche hôpital                                              |
| `src/pages/public/PharmaciesDirectory.tsx` | `/pharmacies`     | Liste + filtres ville + “de garde” toggle                  |
| `src/pages/public/PharmacyDetail.tsx`      | `/pharmacy/:slug` | Fiche pharmacie                                            |


## Composants partagés

- `src/components/public/PublicHeader.tsx` — header public réutilisable (même nav que Landing)
- `src/components/public/DirectoryCard.tsx` — card générique (nom, ville, services, CTA)
- `src/components/public/EntityDetailLayout.tsx` — layout fiche (infos structurées, CTA, breadcrumbs)
- `src/components/seo/SeoHelmet.tsx` — wrapper Helmet (title/description)
- `src/components/seo/JsonLd.tsx` — injection JSON-LD
- `src/components/ui/Breadcrumbs.tsx`

## SEO (IMPORTANT)

- Chaque page détail utilise `react-helmet-async` (pas document.title + useEffect).
- Ajouter meta description dynamique.
- Ajouter JSON-LD :
  - ClinicDetail => MedicalClinic
  - HospitalDetail => Hospital
  - PharmacyDetail => Pharmacy

## Routes ajoutées dans `App.tsx`

- `/clinics`, `/clinic/:slug`, `/hospitals`, `/hospital/:slug`, `/pharmacies`, `/pharmacy/:slug`

---

# Bloc 3 : Annuaire Médicaments SEO (objectif Google)

## Mock data (dans `src/data/mockData.ts`)

`mockMedicines[]` : ~10 médicaments avec :  
id, name, slug, dosage, form, category, summary,  
indications[], dosageText, contraindications[], sideEffects[],  
interactions[], warnings[], pregnancyInfo, storage,  
faq[{q,a}], similarSlugs[]

## Fichiers créés


| Fichier                                   | Route               | Description                                    |
| ----------------------------------------- | ------------------- | ---------------------------------------------- |
| `src/pages/public/MedicinesDirectory.tsx` | `/medicaments`      | Liste + recherche + filtres (forme, catégorie) |
| `src/pages/public/MedicineDetail.tsx`     | `/medicament/:slug` | Page notice complète + FAQ + similaires        |


## Contenu page /medicament/:slug

Header : Nom + dosage + forme + badge catégorie  
Sections (accordéon) : Résumé | Indications | Posologie | Contre-indications | Effets indésirables | Interactions | Grossesse/allaitement | Mise en garde | Conservation  
FAQ + Avertissement légal + Médicaments similaires

## SEO Médicaments (IMPORTANT)

- Helmet : title + meta description
- JSON-LD : `Drug`
- Breadcrumbs
- (option) alias `/medicament/:slug/notice` → redirect vers `/medicament/:slug`

## Routes dans `App.tsx`

- `/medicaments`, `/medicament/:slug` (+ option `/medicament/:slug/notice`)

---

# Bloc 4 : Booking invité OTP (visiteur → RDV sans compte initial)

## Correction clé : booking visiteur sur route publique

➡️ **Ne pas modifier une page “patient” pour un visiteur.**  
Créer une route publique dédiée :

- **Nouvelle page** : `src/pages/public/PublicBooking.tsx`  
Route : `/booking/:doctorId`

## Flow

- Visiteur choisit motif + créneau + saisit infos (nom/prénom/téléphone/email optionnel)
- OTP téléphone (mock) :
  - envoi OTP => toast “OTP envoyé (code: 123456)”
  - validation si code == 123456
- Après OTP validé :
  - création automatique “session patient mock” dans localStorage (ex: userRole=patient + patientId)
  - création RDV mock
  - redirection vers confirmation + “Voir mes RDV”

## Fichiers créés

- `src/components/booking/GuestOtpFlow.tsx` — OTP inline (téléphone → code → validation)
- `src/services/authOtpService.ts` — mock (sendOtp, verifyOtp) avec TODO endpoints backend
- `src/pages/public/PublicBooking.tsx` — page booking visiteur

## Intégration

- Depuis `/doctor/:id` et `/search` : bouton “Prendre RDV” renvoie vers `/booking/:doctorId`

---

# Bloc 5 : Admin plateforme complet (avec audit logs persistants + RBAC)

## Services mock : `src/services/admin/`


| Fichier                       | Fonctions                                                    |
| ----------------------------- | ------------------------------------------------------------ |
| `adminAuditService.ts`        | appendLog(...) + getLogs(filters) + **persist localStorage** |
| `adminUsersService.ts`        | updateUserStatus(...) → appelle audit                        |
| `adminVerificationService.ts` | approve/reject(reason) → appelle audit                       |
| `adminPaymentsService.ts`     | refund(...) → appelle audit                                  |
| `adminModerationService.ts`   | hideReview/restoreReview/closeReport → appelle audit         |


⚠️ **Audit logs** : pas “store en mémoire uniquement”.  
➡️ Persister dans `localStorage` pour survivre aux refresh.

## Mock data (dans `src/data/mockData.ts`)

Ajouter :

- `mockAdminOrganizations[]` : id, type, name, city, status, membersCount
- `mockAdminAppointments[]` : id, patientName, doctorName, date, type, status, city
- `mockAdminVerifications[]` : id, entityType, entityName, city, submittedAt, status, docsCount
- `mockAdminPlans[]` : id, name, priceMonthly, features[], isActive
- `mockAdminSubscriptionsDetailed[]` : id, doctorName, planName, status, startedAt, renewalAt
- `mockAdminPayments[]` : id, type, amount, currency, status, createdAt, payerName
- `mockAdminReviews[]` : id, doctorName, patientName, rating, comment, status, createdAt
- `mockAdminReports[]` : id, targetType, reason, status, createdAt
- `mockAdminAuditLogs[]` : id, actorAdminName, actorRole, actionType, targetType, targetId, summary, createdAt
- `mockAdminNotificationTemplates[]` : id, name, channel, subject, body, variables[]
- `mockAdminReferenceData` : specialties[], cities[], languages[], motifs[]
- (AJOUT) `mockAdminSupportTickets[]` : id, requester, category, status, priority, createdAt, assignedTo

## Pages admin créées / modifiées

### Nouvelles pages

- `src/pages/admin/AdminOrganizations.tsx` → `/dashboard/admin/organizations`
- `src/pages/admin/AdminAppointments.tsx` → `/dashboard/admin/appointments`
- `src/pages/admin/AdminVerifications.tsx` → `/dashboard/admin/verifications` (tabs Médecins/Labos/Pharmacies)
- `src/pages/admin/AdminPayments.tsx` → `/dashboard/admin/payments`
- `src/pages/admin/AdminAuditLogs.tsx` → `/dashboard/admin/audit-logs`
- `src/pages/admin/AdminReferenceData.tsx` → `/dashboard/admin/reference-data`
- `src/pages/admin/AdminNotificationTemplates.tsx` → `/dashboard/admin/notification-templates`
- (AJOUT) `src/pages/admin/AdminSupport.tsx` → `/dashboard/admin/support` (tickets)

### Pages existantes enrichies

- `AdminDashboard.tsx` — KPIs + validations en attente + derniers audit logs
- `AdminUsers.tsx` — actions + audit
- `AdminModeration.tsx` — tabs Avis/Signalements + audit
- `AdminSubscriptions.tsx` — abonnements détaillés + actions + audit
- `AdminSettings.tsx` — feature flags + mode maintenance + audit
- `AdminAnalytics.tsx` — KPIs + funnels mock

## Sidebar admin : `DashboardLayout.tsx`

Mettre à jour `navItems.admin` avec :  
Dashboard, Utilisateurs, Organisations, Rendez-vous, Validations, Abonnements, Paiements, Modération, Audit logs, Référentiels, Templates notifs, Analytics, Support, Paramètres

## RBAC guard mock (amélioré)

- `src/components/admin/AdminGuard.tsx`
- Vérifie d’abord la session auth/store existant (si présent), sinon fallback localStorage.
- Condition minimale : role === "admin"
- Préparer sous-rôles (option mock) : support/verification/finance/moderation/compliance/superadmin (même si pas encore appliqués partout)

## Routes admin dans `App.tsx`

Wrapper toutes les routes `/dashboard/admin/*` avec `AdminGuard`.

---

# Ordre d’exécution recommandé

1. Mettre en place **convention mocks unique** (`src/data/mockData.ts`) + SEO utils (Helmet/JSON-LD/robots/sitemap)
2. PublicHeader + refonte Landing + mocks établissements/top meds
3. Annuaires publics + pages détail + SEO Helmet + JSON-LD
4. Médicaments SEO (directory + notice) + SEO complet
5. Booking visiteur OTP sur `/booking/:doctorId`
6. Admin : services mock + audit logs persistants + AdminGuard
7. Pages admin nouvelles + enrichir existantes + sidebar + routes