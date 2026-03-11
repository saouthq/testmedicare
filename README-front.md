# Medicare — Architecture Front-End

## Vue d'ensemble

Application multi-rôles (Patient, Médecin, Secrétaire, Pharmacie, Laboratoire, Admin)  
Stack : React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
State : localStorage-backed stores (`crossRoleStore`) avec `useSyncExternalStore`

---

## Sources de vérité par domaine

| Domaine | Store | Fichier | Actions métier |
|---------|-------|---------|----------------|
| **Rendez-vous** | `sharedAppointmentsStore` | `stores/sharedAppointmentsStore.ts` | `createAppointment`, `cancelAppointment`, `rescheduleAppointment`, `markPatientArrived`, `sendToWaitingRoom`, `startAppointmentConsultation`, `completeAppointmentConsultation`, `markAppointmentAbsent`, `toggleAppointmentTag`, `saveAppointmentNote`, `blockSlot` |
| **Patients** | `sharedPatientsStore` | `stores/sharedPatientsStore.ts` | `addPatient`, `updatePatient` |
| **Profil patient** | `patientStore` | `stores/patientStore.ts` | `updatePatientProfile` |
| **Profil médecin** | `doctorProfileStore` | `stores/doctorProfileStore.ts` | `updateDoctorProfile` |
| **Disponibilités** | `sharedAvailabilityStore` | `stores/sharedAvailabilityStore.ts` | `updateAvailabilityDay`, `setSlotDuration` |
| **Créneaux bloqués** | `sharedBlockedSlotsStore` | `stores/sharedBlockedSlotsStore.ts` | `addBlockedSlot`, `updateBlockedSlot`, `removeBlockedSlot` |
| **Congés / absences** | `sharedLeavesStore` | `stores/sharedLeavesStore.ts` | `createLeave`, `deleteLeave` |
| **Tarifs / actes** | `sharedTarifsStore` | `stores/sharedTarifsStore.ts` | `addActe`, `updateActe`, `removeActe` |
| **Ordonnances (médecin)** | `doctorPrescriptionsStore` | `stores/doctorPrescriptionsStore.ts` | `createPrescription`, `markPrescriptionSent`, `duplicatePrescription` |
| **Ordonnances (envoi pharmacie)** | `prescriptionsStore` | `stores/prescriptionsStore.ts` | `sendPrescriptionToPharmacies`, `pharmacyRespond` |
| **Renouvellements** | `renewalRequestsStore` (in doctorStore) | `stores/doctorStore.ts` | `requestRenewal`, `handleRenewal` |
| **Facturation** | `billingStore` | `stores/billingStore.ts` | `createInvoice`, `markInvoicePaid` |
| **Pharmacie stock** | `pharmacyStore` (stockStore) | `stores/pharmacyStore.ts` | `addStockItem`, `updateStockQuantity` |
| **Pharmacie ordonnances** | `pharmacyStore` (rxStore) | `stores/pharmacyStore.ts` | `updatePharmacyRxStatus`, `updatePharmacyRxItemAvailability` |
| **Laboratoire** | `labStore` | `stores/labStore.ts` | `createLabDemand`, `updateLabDemandStatus`, `addLabPdf`, `removeLabPdf` |
| **Santé patient** | `healthStore` | `stores/healthStore.ts` | `addDocument`, `addTreatment`, `addAllergy`, `addVaccination`, `addMeasure`, etc. |
| **Notifications** | `notificationsStore` | `stores/notificationsStore.ts` | `pushNotification`, `markAllRead`, `deleteNotification` |
| **Abonnement médecin** | `doctorSubscriptionStore` | `stores/doctorSubscriptionStore.ts` | `updateSubscription` |
| **Feature flags** | `featureMatrixStore` | `stores/featureMatrixStore.ts` | `setFeatureEnabled` |
| **Modules admin** | `adminModulesStore` | `stores/adminModulesStore.ts` | `toggleModule` |
| **Plans admin** | `adminPlanStore` | `stores/adminPlanStore.ts` | `updatePlan` |
| **Entitlements** | `entitlementStore` | `stores/entitlementStore.ts` | `setEntitlement`, `removeEntitlement` |

---

## Données de référence (statiques)

Ces données ne changent pas via interaction utilisateur et restent dans `src/data/mocks/` :

| Données | Fichier | Utilisé par |
|---------|---------|-------------|
| Spécialités, langues, assurances, gouvernorats | `mocks/common.ts` | Formulaires, filtres, référentiels |
| Médecins (annuaire public) | `mocks/doctor.ts` (`mockDoctors`) | PublicSearch, DoctorPublicProfile |
| Profil public médecin | `mocks/doctor.ts` (`mockDoctorProfile`) | DoctorPublicProfile, ProfileTab → **migré vers doctorProfileStore** |
| Templates SMS | `mocks/secretary.ts` | SecretarySMS |
| Médicaments (référentiel) | `mocks/medicines.ts` | MedicinesDirectory, PrescriptionBuilder |
| Hôpitaux, cliniques, pharmacies | `mocks/establishments.ts` | Annuaires publics |
| Données hôpital (départements, staff, etc.) | `mocks/hospital.ts` | Pages HospitalXxx |
| Données clinique (doctors, rooms, etc.) | `mocks/clinic.ts` | Pages ClinicXxx |
| Promotions admin | `mocks/promotions.ts` | AdminPromotions |
| Plans d'abonnement | `mocks/doctor.ts` (`mockPlans`) | DoctorBilling |
| Contacts messagerie | `mocks/doctor.ts` + `mocks/patient.ts` | Messages |

---

## Architecture des stores

```
crossRoleStore.ts          ← Factory générique (createStore + useStore)
    │
    ├── sharedAppointmentsStore.ts    ← RDV (toutes les pages)
    ├── sharedPatientsStore.ts        ← Patients partagés
    ├── sharedAvailabilityStore.ts    ← Horaires médecin
    ├── sharedBlockedSlotsStore.ts    ← Créneaux bloqués
    ├── sharedLeavesStore.ts          ← Congés (+ auto-block)
    ├── sharedTarifsStore.ts          ← Actes / tarifs
    ├── billingStore.ts               ← Factures
    ├── healthStore.ts                ← Dossier santé patient
    ├── pharmacyStore.ts              ← Stock + ordonnances pharmacie
    ├── labStore.ts                   ← Demandes d'analyses
    ├── prescriptionsStore.ts         ← Envoi ordonnances patient→pharmacie
    ├── doctorPrescriptionsStore.ts   ← Ordonnances côté médecin
    ├── doctorStore.ts                ← Renouvellements + profil completion
    ├── doctorProfileStore.ts         ← Profil public du médecin
    ├── patientStore.ts               ← Profil patient courant
    ├── notificationsStore.ts         ← Notifications cross-rôle
    ├── doctorSubscriptionStore.ts    ← Abonnement + spécialité
    └── appointmentsStore.ts          ← Events historiques (legacy, à fusionner)
```

---

## Seeding

`seedStores.ts` est appelé une fois au démarrage (`App.tsx`).  
Il injecte les données démo dans les stores vides.  
Les dates des RDV sont relatives à `today` et se rafraîchissent chaque jour.

**Réinitialiser la démo :**
```typescript
import { resetDemo } from "@/stores/seedStores";
resetDemo(); // Vide tous les stores + relance le seeding
```

---

## Conventions

### Statuts de rendez-vous (source unique : `types/appointment.ts`)

| Statut | Signification |
|--------|--------------|
| `pending` | En attente de confirmation |
| `confirmed` | Confirmé par le praticien/secrétaire |
| `arrived` | Patient arrivé au cabinet |
| `in_waiting` | En salle d'attente |
| `in_progress` | Consultation en cours |
| `done` | Consultation terminée |
| `cancelled` | Annulé (par patient, médecin ou secrétaire) |
| `absent` | Patient absent (no-show) |

### Règle d'or

> **Aucune page ne doit importer de mock pour des données dynamiques.**  
> Les mocks ne sont consommés que par `seedStores.ts` et les pages de référentiel statique.

### Migration backend

Chaque action de store est marquée `// TODO BACKEND: ...`.  
Pour migrer : remplacer le corps de chaque action par un appel API,  
et remplacer `useStore(store)` par `useQuery` / `useMutation` (React Query).
