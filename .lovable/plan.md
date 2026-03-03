# Plan : Teleconsultation Patient Join + Workflow Secretaire + Uniformisation

## 1. JoinTeleconsultButton et helper (Teleconsultation Patient)

### Nouveau fichier : `src/components/teleconsultation/teleconsultHelpers.ts`

Helper pur `getTeleconsultJoinState(appointment, now)` :

- Input : un objet RDV (avec `date`, `time`, `type`) + Date courante
- Output : `{ state: "too_early" | "countdown" | "ready" | "in_call" | "ended" | "expired", minutesToOpen: number, label: string, disabled: boolean }`
- Logique : T-15min = ready, T+60min = expired, entre = countdown avec minutes

### Nouveau fichier : `src/components/teleconsultation/JoinTeleconsultButton.tsx`

Composant reutilisable avec :

- Accepte un appointment en props + optionnel `now` pour tests
- Appelle `getTeleconsultJoinState` en interne avec `useEffect` + interval (actualise toutes les 30s)
- Affiche un `Button` avec etats visuels :
  - `too_early` : disabled, gris, "Disponible dans X min"
  - `countdown` : disabled, pulse, "Disponible dans X min"
  - `ready` : gradient-primary, "Rejoindre la consultation"
  - `in_call` : accent, "Consultation en cours"
  - `ended` / `expired` : muted, "Consultation terminee" ou "Expiree" + CTA "Contacter le cabinet"
- `onClick` : navigate vers `/dashboard/patient/teleconsultation` avec `// TODO BACKEND: validate join / session`

### Modification : `src/pages/patient/PatientAppointments.tsx`

- Remplacer le bouton "Rejoindre la teleconsultation" statique (ligne 184) par `<JoinTeleconsultButton appointment={currentApt} />`
- Ajouter `JoinTeleconsultButton` dans les cartes "upcoming" pour les RDV de type teleconsultation
- Supprimer le lien direct `/dashboard/patient/teleconsultation` en dur

### Modification : mock data `src/data/mocks/patient.ts`

- Ajouter un champ `scheduledAt` (ISO string) aux appointments mock pour que le helper puisse calculer les etats temporels
- Un RDV mock sera regle a "dans 10 min" pour demo du countdown

---

## 2. Teleconsultation Secretaire — Supervision

### Nouveau fichier : `src/components/secretary-teleconsult/SecretaryTeleconsultPanel.tsx`

Panel de supervision des teleconsultations du jour :

- Liste des teleconsultations extraites des appointments (`type === "Teleconsultation"`)
- Pour chaque : nom patient, heure, statut (A venir / Patient pret / En cours / Termine)
- Actions : "Envoyer rappel" (toast), "Reprogrammer" (toast), "Voir statut connexion" (badge)
- Pas de video, juste supervision textuelle

### Modification : `src/pages/secretary/SecretaryDashboard.tsx`

- Ajouter une section "Teleconsultations du jour" dans l'onglet overview, sous le planning
- Filtrer les appointments avec `teleconsultation: true` et afficher le panel
- Actions avec `// TODO BACKEND: secretary teleconsult supervision`

---

## 3. Workflow Secretaire rattachee (Doctor Settings + Secretary Dashboard)

### Modification : `src/pages/doctor/DoctorSecretary.tsx`

Refonte pour ajouter :

- State local `secretaries` avec mock (au lieu du const statique) avec champs `status: "invited" | "active" | "suspended"`
- Bouton "Activer" pour les invitees (change status -> active + toast)
- Bouton "Suspendre" / "Reactiver" pour les actives (toggle + toast + ConfirmDialog)
- Modal "Ajouter secretaire" : genere un mock avec statut "Invitee" + toast "Invitation envoyee"
- Tous handlers : `// TODO BACKEND: POST /api/secretary/invite`, `PATCH /api/secretary/{id}/activate`

### Modification : `src/pages/secretary/SecretaryDashboard.tsx`

Enrichir la salle d'attente avec :

- Statuts complets : "A venir" -> "Arrive" -> "En attente" -> "En consultation" -> "Termine" -> "Absent"
- Actions contextuelles par statut :
  - A venir : "Check-in" (passe a Arrive)
  - Arrive/En attente : "Appeler", "Note interne"
  - Appele : "En consultation"
  - En consultation : "Terminer"
  - Tout statut : "Marquer absent"
- Notes internes (modal simple avec Textarea + toast)
- Label "Absent" au lieu de "No-show" partout

### Ajout mock : `src/data/mocks/secretary.ts`

- Ajouter `mockSecretaryTeam` : liste de secretaires mock avec statuts
- Ajouter champ `teleconsultation: true` sur certains appointments existants (deja present sur id:8)

---

## 4. Uniformisation UI/UX

### ActionPalette sur pages Secretaire

- Modification : `src/pages/secretary/SecretaryDashboard.tsx` — Ajouter un bouton "Actions" + raccourci Ctrl+K utilisant le composant `ActionPalette` partage
- Actions secretaire : Check-in patient, Appeler, Encaisser, Nouveau RDV, Nouveau patient, Voir agenda, Documents, Messagerie

### ConfirmDialog unique

- Remplacement dans `SecretaryDashboard` et `DoctorSecretary` : utiliser `ConfirmDialog` (deja existant dans `src/components/shared/ConfirmDialog.tsx`) pour les actions destructives (annuler RDV, suspendre secretaire, marquer absent)

### Labels FR coherents

- Remplacer "No-show" par "Absent" dans `StatusBadge`, `SecretaryDashboard`, `PatientAppointments`

### Boutons uniformes

- Verifier que toutes les toolbars utilisent `size="sm"` + `text-xs`

---

## Resume technique

### Fichiers crees (3)


| Fichier                                                              | Description                                 |
| -------------------------------------------------------------------- | ------------------------------------------- |
| `src/components/teleconsultation/teleconsultHelpers.ts`              | Helper `getTeleconsultJoinState`            |
| `src/components/teleconsultation/JoinTeleconsultButton.tsx`          | Bouton rejoindre teleconsult avec countdown |
| `src/components/secretary-teleconsult/SecretaryTeleconsultPanel.tsx` | Panel supervision teleconsult secretaire    |


### Fichiers modifies (7)


| Fichier                                      | Modification                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `src/pages/patient/PatientAppointments.tsx`  | Utiliser JoinTeleconsultButton                                         |
| `src/pages/secretary/SecretaryDashboard.tsx` | Salle attente enrichie + teleconsult panel + ActionPalette + labels FR |
| `src/pages/doctor/DoctorSecretary.tsx`       | Workflow invitation/activation/suspension                              |
| `src/data/mocks/patient.ts`                  | Ajouter scheduledAt aux mocks                                          |
| `src/data/mocks/secretary.ts`                | Ajouter mockSecretaryTeam                                              |
| `src/components/shared/StatusBadge.tsx`      | "Absent" au lieu de "No-show"                                          |
| `src/data/mocks/index.ts`                    | Re-exports nouveaux mocks                                              |


### Ordre d'execution

1. Helper teleconsult + JoinTeleconsultButton + mocks patient
2. Integrer dans PatientAppointments
3. Refonte DoctorSecretary (invitation/activation)
4. Enrichir SecretaryDashboard (salle attente + teleconsult + palette)
5. Uniformisation labels + ConfirmDialog