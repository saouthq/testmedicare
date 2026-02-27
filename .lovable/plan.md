

# Refactoring Global Medicare — Plan Corrige

## Corrections par rapport au plan precedent

1. **DoctorConsultations** : deja refactore (34L page, Context 357L, Components 481L). PAS besoin de le re-decouper. Par contre `DoctorPrescriptions.tsx` (1539L) est un **doublon mort** — il exporte `DoctorConsultations` et contient l'ancien code consultations. Il faut le **supprimer et reconstruire** une vraie page Ordonnances.

2. **Types UI locaux** : restent dans `components/<feature>/types.ts`. `src/types/` = uniquement modeles metier partages (Patient, Doctor, Consultation, Prescription, Document).

3. **0 mock inline** : sur TOUTES les pages, y compris secretaire, labo, pharmacie. Tout va dans `src/data/mocks/`.

4. **DropdownMenu modal={false}** : au cas par cas seulement. Pattern standard : `onSelect` avec `e.preventDefault()` quand necessaire, pas de boutons imbriques dans les triggers.

---

## Phase 1 : Types metier partages (`src/types/`)

Uniquement les interfaces metier reutilisees entre plusieurs features.

**Fichiers a creer :**

- `src/types/patient.ts` — Patient, HealthDocument, Antecedent, Treatment, Allergy, Habit, FamilyHistory, Surgery, Vaccination, HealthMeasure
- `src/types/doctor.ts` — Doctor, DoctorProfile, ScheduleAppointment, WaitingRoomEntry, UrgentAlert
- `src/types/prescription.ts` — Prescription, RxDraftItem
- `src/types/consultation.ts` — DoctorConsultation (le type infere de mockDoctorConsultations), ConsultationPatient
- `src/types/document.ts` — DocTemplate, GeneratedDoc
- `src/types/common.ts` — AppointmentStatus, Notification (metier), ChatMessage, ChatContact, StatsCard
- `src/types/index.ts` — barrel re-export

Les types UI locaux (MainTab, HistFilter, TimelineOpen, TimelineEvent, VersionText, etc.) restent dans `src/components/patient-detail/types.ts` et equivalent.

---

## Phase 2 : Split mockData.ts en modules

Decouper `src/data/mockData.ts` (1395L) en fichiers par domaine.

**Fichiers a creer :**

- `src/data/mocks/doctor.ts` — mockDoctorProfile, mockDoctors, mockAvailableSlots, mockReviews, mockFaqItems, mockDoctorConsultations, mockConsultationPatient, mockVitalsHistory, mockPatientConsultations, mockPatientDetailPrescriptions, mockPatientAnalyses, mockDoctorPrescriptions, mockDoctorStatsCards, mockMonthlyConsultations, mockPatientsByType, mockWeeklyRevenue, mockSchedule*, mockRecurDays, mockDefaultMotifs, mockDefaultHoraires, mockSubscription*, mockTeleconsultTransactions, mockAi* (doctor), mockProContacts, mockCabinetContacts, mockProMessages, mockCabinetMessages
- `src/data/mocks/patient.ts` — mockPatients, mockFavoriteDoctors, mockHealthSummary, mockPatientAppointments*, mockPastAppointments, mockCancelledAppointments, mockRecentPrescriptions, mockPatientPrescriptions, mockNotifications, mockHealth*, mockPatientAi*, mockMessagingContacts, mockConversationMessages, mockPartnerPharmacies
- `src/data/mocks/secretary.ts` — donnees extraites de SecretaryAgenda, SecretaryBilling, SecretaryDocuments, SecretaryPatients (actuellement inline)
- `src/data/mocks/lab.ts` — donnees extraites de LaboratoryDashboard, LaboratoryPatients (actuellement inline)
- `src/data/mocks/pharmacy.ts` — donnees extraites des pages pharmacy (si inline)
- `src/data/mocks/common.ts` — specialties, specialtiesWithAll, languages, availDates, landing data
- `src/data/mocks/admin.ts` — mockAdmin*
- `src/data/mocks/index.ts` — barrel re-export

**mockData.ts** : devient `export * from "./mocks";` — aucun import existant ne casse.

**Pages a nettoyer (mocks inline a supprimer) :**
- `SecretaryPatients.tsx` : `initialPatients` -> mocks/secretary.ts
- `SecretaryDocuments.tsx` : `initialDocuments` -> mocks/secretary.ts
- `SecretaryAgenda.tsx` : `initialAppointments` + `doctors` -> mocks/secretary.ts
- `SecretaryBilling.tsx` : `initialInvoices` -> mocks/secretary.ts
- `LaboratoryDashboard.tsx` : `initialAnalyses` -> mocks/lab.ts
- `LaboratoryPatients.tsx` : `mockPatientAnalyses` -> mocks/lab.ts
- `DoctorPatientDetail.tsx` : `mockTimeline` en useMemo inline -> extraire les donnees brutes

---

## Phase 3 : Composants partages

### 3a. `src/components/shared/ActionPalette.tsx`

Composant generique Cmd+K. Remplace les implementations dupliquees dans DoctorPatientDetail et ConsultationsComponents.

```text
Props:
  open, onClose
  actions: { id, label, hint?, icon, group?, onRun }[]
  placeholder?: string
```

### 3b. `src/components/shared/ConfirmDialog.tsx`

Dialog de confirmation generique.

```text
Props:
  open, onConfirm, onCancel
  title, description
  confirmLabel?, variant?: "danger" | "warning" | "default"
```

### 3c. `src/components/shared/WorkflowDrawer.tsx`

Sheet multi-etapes reutilisable (Rx, Labs, Documents).

```text
Props:
  open, onClose, title
  step, totalSteps, stepLabels[]
  footer: ReactNode, children: ReactNode
```

### 3d. `src/components/shared/StatsGrid.tsx`

Grille de stats cards uniforme.

```text
Props:
  items: { label, value, icon?, change?, color? }[]
```

---

## Phase 4 : Decoupage DoctorPatientDetail (3089L -> ~100L page)

### Types UI locaux :
`src/components/patient-detail/types.ts` — MainTab, HistFilter, TimelineOpen, TimelineEvent, DocFileKind, PatientFile, Ante, VersionText, VersionAnte, VersionVitals, WorkflowStep, LabPanel

### Composants :
```text
src/components/patient-detail/
  PatientDetailContext.tsx   -- State + handlers (notes, vitals, Rx, labs, docs, timeline)
  PatientDetailHeader.tsx    -- Toolbar (retour, nom patient, boutons Actions/Creer/Imprimer)
  PatientDetailTabs.tsx      -- Onglets + dispatch vers tab actif
  TimelineView.tsx           -- Historique filtrable
  NotesTab.tsx               -- Notes cliniques + versions
  PrivateNotesTab.tsx        -- Notes privees + versions
  AntecedentsTab.tsx         -- Antecedents + versions
  VitalsTab.tsx              -- Constantes + graphique + versions
  TreatmentTab.tsx           -- Traitement actif
  DocumentsTab.tsx           -- Documents + upload
  QuickNotesCard.tsx         -- Card notes rapides (colonne droite)
  RxWorkflow.tsx             -- Drawer ordonnance 3 etapes (utilise WorkflowDrawer)
  LabsWorkflow.tsx           -- Drawer analyses (utilise WorkflowDrawer)
  DocWorkflow.tsx            -- Drawer documents (utilise WorkflowDrawer)
  DetailSlide.tsx            -- Slide detail timeline item
  types.ts                   -- Types UI locaux
```

La palette Actions utilise `ActionPalette` partage.

**Page finale** (`DoctorPatientDetail.tsx`) : ~80L — Provider + layout grid + compose.

---

## Phase 5 : Reconstruire DoctorPrescriptions (1539L dead code -> vraie page ~30L)

Le fichier actuel est un doublon de l'ancien code consultations (il exporte `DoctorConsultations`). Il faut :

1. **Supprimer tout le contenu** de DoctorPrescriptions.tsx
2. **Creer une vraie page Ordonnances** avec le pattern Context+Components utilisant `mockDoctorPrescriptions`

### Structure :
```text
src/components/doctor-prescriptions/
  PrescriptionsContext.tsx    -- State (liste, filtres, detail, composer)
  PrescriptionsToolbar.tsx    -- Recherche + filtres (actives/toutes/envoyees)
  PrescriptionsStats.tsx      -- Stats (total, envoyees, en attente)
  PrescriptionsList.tsx       -- Liste groupee par date
  PrescriptionRow.tsx         -- Ligne + menu actions
  PrescriptionDetail.tsx      -- Sheet detail
  PrescriptionComposer.tsx    -- Drawer 3 etapes creer/modifier (utilise WorkflowDrawer)
  types.ts                    -- Types UI locaux (PrescriptionFilter, ComposerStep, etc.)
```

**Page finale** (`DoctorPrescriptions.tsx`) : ~30L.

---

## Phase 6 : Extractions secondaires

### DoctorSettings (376L -> ~100L)
```text
src/components/doctor-settings/
  ProfileTab.tsx, AvailabilityTab.tsx, NotificationsTab.tsx, SecurityTab.tsx
```

### PatientHealth (487L -> ~120L)
```text
src/components/patient-health/
  HealthMenu.tsx, SectionRenderer.tsx, AddItemModal.tsx, AiChat.tsx
```

### PatientAppointments (314L -> ~200L)
```text
src/components/patient-appointments/
  ReviewModal.tsx, ReportModal.tsx
```

---

## Phase 7 : Backend-ready handlers

Standardiser TOUS les handlers :

```typescript
const handleCancel = (id: string) => {
  // TODO BACKEND: POST /api/appointments/{id}/cancel
  setItems(prev => prev.filter(a => a.id !== id));
  toast({ title: "Annule", description: "Le RDV a ete annule." });
};
```

Concerne tous les Context files.

---

## Phase 8 : Uniformisation UI

- Boutons toolbar : `size="sm"` + `text-xs` partout
- Sheet/Dialog : `ScrollArea` dans tous les `SheetContent` longs
- DropdownMenu : corriger au cas par cas (pas de `modal={false}` global). Pattern :
  - Pas de `<button>` imbrique dans un trigger
  - `onSelect` au lieu de `onClick` dans les DropdownMenuItem
  - `e.preventDefault()` / `e.stopPropagation()` quand necessaire
- StatusBadge : utiliser le composant partage, supprimer les copies locales

---

## Resume fichiers

### Fichiers crees (~40)

| Dossier | Fichiers |
|---------|----------|
| `src/types/` | patient.ts, doctor.ts, prescription.ts, consultation.ts, document.ts, common.ts, index.ts |
| `src/data/mocks/` | doctor.ts, patient.ts, secretary.ts, lab.ts, pharmacy.ts, common.ts, admin.ts, index.ts |
| `src/components/shared/` | ActionPalette.tsx, ConfirmDialog.tsx, WorkflowDrawer.tsx, StatsGrid.tsx |
| `src/components/patient-detail/` | PatientDetailContext.tsx, PatientDetailHeader.tsx, PatientDetailTabs.tsx, TimelineView.tsx, NotesTab.tsx, PrivateNotesTab.tsx, AntecedentsTab.tsx, VitalsTab.tsx, TreatmentTab.tsx, DocumentsTab.tsx, QuickNotesCard.tsx, RxWorkflow.tsx, LabsWorkflow.tsx, DocWorkflow.tsx, DetailSlide.tsx, types.ts |
| `src/components/doctor-prescriptions/` | PrescriptionsContext.tsx, PrescriptionsToolbar.tsx, PrescriptionsStats.tsx, PrescriptionsList.tsx, PrescriptionRow.tsx, PrescriptionDetail.tsx, PrescriptionComposer.tsx, types.ts |
| `src/components/doctor-settings/` | ProfileTab.tsx, AvailabilityTab.tsx, NotificationsTab.tsx, SecurityTab.tsx |
| `src/components/patient-health/` | HealthMenu.tsx, SectionRenderer.tsx, AddItemModal.tsx, AiChat.tsx |
| `src/components/patient-appointments/` | ReviewModal.tsx, ReportModal.tsx |

### Fichiers modifies

| Fichier | Resultat |
|---------|----------|
| `src/data/mockData.ts` | Barrel re-export (~3 lignes) |
| `DoctorPatientDetail.tsx` | 3089L -> ~80L |
| `DoctorPrescriptions.tsx` | 1539L dead code -> ~30L vraie page |
| `DoctorSettings.tsx` | 376L -> ~100L |
| `PatientHealth.tsx` | 487L -> ~120L |
| `PatientAppointments.tsx` | 314L -> ~200L |
| `SecretaryPatients.tsx` | Supprime inline mocks, importe depuis mocks/ |
| `SecretaryDocuments.tsx` | Supprime inline mocks |
| `SecretaryAgenda.tsx` | Supprime inline mocks |
| `SecretaryBilling.tsx` | Supprime inline mocks |
| `LaboratoryDashboard.tsx` | Supprime inline mocks |
| `LaboratoryPatients.tsx` | Supprime inline mocks |

### Ordre d'execution

1. Types metier (`src/types/`)
2. Split mocks (`src/data/mocks/`) + barrel mockData.ts + nettoyer inline dans toutes les pages
3. Composants partages (ActionPalette, ConfirmDialog, WorkflowDrawer, StatsGrid)
4. Decouper DoctorPatientDetail (16 fichiers)
5. Reconstruire DoctorPrescriptions (8 fichiers)
6. Extraire DoctorSettings, PatientHealth, PatientAppointments
7. Backend-ready handlers (`// TODO BACKEND:`)
8. Uniformisation UI (boutons, scroll, dropdowns au cas par cas)

