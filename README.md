# Medicare.tn — Plateforme Médicale Tunisie (Démo UI)

> Application de prise de rendez-vous médicaux et gestion de cabinet, inspirée de Doctolib, adaptée au marché tunisien (DT, +216, assurances locales).  
> **Version : Release Candidate — UI + Workflow complets, prête à brancher backend.**

## Stack technique

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **react-router-dom** v6 (SPA)
- **localStorage** pour persistance cross-rôle (stores)
- Pas de backend — tous les appels sont marqués `// TODO BACKEND:`

---

## Rôles & Routes

| Rôle | Préfixe route | Pages principales |
|------|--------------|-------------------|
| **Visiteur** | `/`, `/search`, `/doctor/:id`, `/booking/:id` | Landing, recherche, profil médecin, réservation (OTP guest) |
| **Patient** | `/dashboard/patient/*` | Dashboard, RDV, ordonnances, santé, notifications, messagerie |
| **Médecin** | `/dashboard/doctor/*` | Dashboard, planning, patients, consultations, ordonnances, facturation, IA, stats |
| **Secrétaire** | `/dashboard/secretary/*` | Dashboard (salle d'attente), agenda, patients, facturation, documents |
| **Laboratoire** | `/dashboard/laboratory/*` | Dashboard, analyses (Kanban), résultats, patients |
| **Pharmacie** | `/dashboard/pharmacy/*` | Dashboard, ordonnances reçues, stock, historique |
| **Admin** | `/dashboard/admin/*` | Users, organisations, KYC, RDV, paiements, garde, support, modération, audit |
| **Public** | `/clinics`, `/hospitals`, `/pharmacies`, `/medicines` | Annuaires publics SEO |

### Accès rapide dev
- Sélectionner un rôle sur `/login` (patient/doctor/pharmacy/laboratory/secretary/admin)
- Le rôle est stocké dans `localStorage("userRole")`
- AdminGuard vérifie `userRole === "admin"` (jamais auto-set)

---

## Stores localStorage (`src/stores/`)

| Store | Clé localStorage | Structure | Usage |
|-------|-----------------|-----------|-------|
| `crossRoleStore` | — | Factory générique | Crée des stores synchronisés cross-tab via `BroadcastChannel` |
| `prescriptionsStore` | `medicare_shared_prescriptions` | `SharedPrescription[]` | Patient envoie → Pharmacie voit → Pharmacie répond (status/heure) |
| `labStore` | `medicare_lab_demands` | `SharedLabDemand[]` | Médecin demande → Labo traite → PDFs → transmission patient/médecin |
| `appointmentsStore` | `medicare_appointment_events` | `AppointmentEvent[]` | Fin consultation, absent, feuille de soins |
| `notificationsStore` | `medicare_notifications` | `CrossNotification[]` | Notifications cross-rôle (pharmacie prête, résultats labo, etc.) |

---

## Mocks (`src/data/mocks/`)

| Module | Contenu |
|--------|---------|
| `common.ts` | Spécialités, gouvernorats, assurances, notifications génériques |
| `doctor.ts` | Médecins, planning, consultations, ordonnances, stats, facturation |
| `patient.ts` | Patients, RDV, ordonnances patient, pharmacies partenaires, santé |
| `secretary.ts` | Salle d'attente, RDV secrétaire, facturation, patients avec historique |
| `lab.ts` | Demandes analyses, PDFs, patients labo |
| `pharmacy.ts` | Ordonnances reçues, stock, historique délivrances |
| `admin.ts` | Users admin, organisations, tickets support |
| `establishments.ts` | Cliniques, hôpitaux, pharmacies publiques |
| `medicines.ts` | Base médicaments Tunisie |

---

## Services mock (`src/services/`)

| Service | TODO Backend |
|---------|-------------|
| `authOtpService.ts` | POST /api/auth/otp/send, POST /api/auth/otp/verify |
| `admin/adminUsersService.ts` | CRUD users, suspend, reset-password |
| `admin/adminVerificationService.ts` | PATCH /api/admin/verifications/:id/approve\|reject |
| `admin/adminModerationService.ts` | PATCH /api/admin/moderation/:id/remove\|warn |
| `admin/adminPaymentsService.ts` | POST /api/admin/payments/:id/refund |
| `admin/adminAuditService.ts` | Audit logs (localStorage → API) |

---

## Workflows testables (checklist)

### 1. Visiteur → Patient (Booking OTP)
- `/search` → cliquer médecin → `/doctor/:id` → "Prendre RDV" → `/booking/:id`
- Tunnel 5 étapes (motif → créneau → infos → confirmation → récap)
- Guest OTP : code mock `123456`

### 2. Patient → Pharmacie (Ordonnances multi-pharmacies)
- Patient : `/dashboard/patient/prescriptions` → "Envoyer à pharmacie" → sélectionner 1-6 pharmacies
- Pharmacie : `/dashboard/pharmacy/prescriptions` → ordonnance apparaît
- Simulation : bouton ⚡ → "Simuler réponse pharmacie" → Patient voit statut + heure retrait

### 3. Médecin → Patient (Consultation + Feuille de soins)
- Médecin : `/dashboard/doctor/consultations` → ouvrir consultation → remplir → terminer
- Simulation : bouton ⚡ → "Simuler fin consultation" → Patient voit feuille de soins dans notifications

### 4. Médecin → Labo → Patient (Analyses)
- Labo : `/dashboard/laboratory/analyses` → traiter demande → uploader PDF → transmettre
- Simulation : bouton ⚡ → "Simuler transmission labo" → Patient/médecin notifiés

### 5. Secrétaire → Patient (Absent)
- Secrétaire : dashboard → salle d'attente → marquer "Absent"
- Simulation : bouton ⚡ → "Simuler patient absent" → Patient voit notification

### 6. Admin → Public (Pharmacie de garde)
- Admin : `/dashboard/admin/guard-pharmacies` → activer garde
- Public : `/pharmacies` → badge "🟢 De garde" visible

### 7. Téléconsultation
- Patient : pré-check → salle d'attente → appel
- Médecin : rejoint → dossier + notes → résumé

---

## Panel de Simulation (⚡)

Bouton flottant en bas à droite sur toutes les pages. Permet de :
- Simuler réponse pharmacie (prête)
- Simuler transmission labo
- Simuler fin consultation + feuille de soins
- Simuler patient absent
- Réinitialiser tous les stores

---

## Conventions

- **Devise** : DT (Dinar Tunisien)
- **Téléphone** : +216
- **Assurances** : "Assurance publique", "Maghrebia", "STAR", "Sans assurance"
- **Avis** : texte uniquement, pas d'étoiles/rating
- **Dates** : format FR (`20 Fév 2026`)
- **Tous les handlers** : pattern `// TODO BACKEND: VERB /api/...` + toast mock

---

## Lancer le projet

```bash
npm install
npm run dev
```

Build production :
```bash
npm run build
```
