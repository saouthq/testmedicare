

# Plan: Workflow Cross-Rôle Complet — Livraison 100% Fonctionnelle

## Problemes identifiés

### 1. SimulationPanel cassé
- `goTo()` ne set le `userRole` que pour "admin" → impossible de naviguer vers Pharmacie, Labo, Secrétaire, Patient, Médecin
- `simulateConsultationEnd` cible `"apt-1"` (n'existe pas, les IDs sont `"apt-001"`)
- `simulateAbsent` cible `"apt-99"` (n'existe pas)
- Les boutons d'accès rapide (grid 3 cols) ne set pas le rôle non plus

### 2. PublicBooking — Slots pas filtrés par disponibilité
- `generateSlots()` retourne 8h-17h30 en dur, ignore les horaires du médecin (`sharedAvailabilityStore`)
- Aucun filtrage des pauses ni des créneaux déjà pris
- Date affichée en dur : `"Fév 2026"` et `"Février 2026"` au lieu de la date dynamique sélectionnée
- Double-booking possible (pas de vérification des RDV existants)

### 3. AvailabilityTab déconnecté de l'agenda
- Les modifications de disponibilités écrivent dans `sharedAvailabilityStore` ✅
- Mais ni `DoctorSchedule`, ni `PublicBooking`, ni `SecretaryAgenda` ne lisent ce store pour filtrer les créneaux
- Pas de gestion des conflits quand on réduit les horaires avec des RDV existants

### 4. Workflow cross-rôle incomplet
- Patient réserve un RDV → apparaît chez médecin/secrétaire ✅ (déjà fait)
- Médecin termine consultation → ordonnance visible chez patient ✅ (déjà fait via ConsultationContext)
- **MANQUANT** : Quand secrétaire crée un RDV → pas de notification patient
- **MANQUANT** : Facturation auto après consultation terminée

## Plan d'implémentation

### Fichier 1: `src/components/shared/SimulationPanel.tsx`
**Fix `goTo()` pour tous les rôles :**
```typescript
const goTo = (url: string, role?: string) => {
  const resolved = role || 
    (url.startsWith("/dashboard/pharmacy") ? "pharmacy" :
     url.startsWith("/dashboard/laboratory") ? "laboratory" :
     url.startsWith("/dashboard/secretary") ? "secretary" :
     url.startsWith("/dashboard/doctor") ? "doctor" :
     url.startsWith("/dashboard/patient") ? "patient" :
     url.startsWith("/dashboard/admin") ? "admin" : undefined);
  if (resolved) localStorage.setItem("userRole", resolved);
  navigate(url);
};
```

**Fix simulation actions :**
- `simulateConsultationEnd` : cherche dynamiquement le premier RDV `in_progress`
- `simulateAbsent` : cherche dynamiquement le premier RDV `confirmed`/`pending`
- Ajouter action "Simuler arrivée patient" (trouve premier `confirmed` et passe à `arrived`)
- Ajouter action "Simuler nouveau RDV aujourd'hui"

**Fix accès rapide :** Les 6 boutons de la grid doivent passer leur rôle correct

### Fichier 2: `src/pages/public/PublicBooking.tsx`
**Filtrer slots par disponibilité :**
- Importer `sharedAvailabilityStore` et `sharedAppointmentsStore`
- `generateSlots()` → utilise les horaires du jour sélectionné (start/end) depuis le store
- Exclure les slots pendant la pause (breakStart/breakEnd)
- Exclure les slots déjà pris (RDV existants non-annulés)
- Marquer les jours fermés (active === false) comme indisponibles dans `generateDays()`

**Fix dates en dur :**
- Ligne 544 : `{selectedDay} Fév 2026` → `{selectedDay}`
- Ligne 601 : `{selectedDay} Fév` → `{selectedDay}`
- Ligne 646 : `{selectedDay} Février 2026` → `{selectedDay}`

### Fichier 3: `src/pages/doctor/DoctorSchedule.tsx`
**Visualiser la disponibilité dans la grille :**
- Importer `useSharedAvailability` et `WEEK_DAYS`
- Dans `DayCol`, griser les créneaux hors horaires et pendant les pauses
- Mapper jour de la semaine (Date → "Lundi", "Mardi"...) vers la config du store

### Fichier 4: `src/components/doctor-settings/AvailabilityTab.tsx`
**Détection de conflits :**
- Au save, vérifier si des RDV existants tombent dans les nouveaux créneaux de pause ou hors horaires
- Afficher un avertissement avec le nombre de RDV impactés
- Option de les annuler automatiquement avec notification

### Fichier 5: `src/stores/sharedAppointmentsStore.ts`
- Ajouter helper `getBookedSlotsForDate(date, doctor)` pour le booking
- Ajouter action `createAppointmentFromSecretary()` avec notification patient

### Fichier 6: `src/pages/secretary/SecretaryAgenda.tsx`
- Le formulaire "Nouveau RDV" doit utiliser `createAppointment` du store (c'est déjà le cas) mais vérifier que la notification patient est bien émise

## Résumé des changements

| Fichier | Action |
|---------|--------|
| SimulationPanel.tsx | Fix goTo() tous rôles + fix simulation IDs + ajout actions |
| PublicBooking.tsx | Slots filtrés par dispo + fix dates en dur + anti-double-booking |
| DoctorSchedule.tsx | Griser créneaux hors dispo/pause dans la grille |
| AvailabilityTab.tsx | Détection conflits RDV lors changement horaires |
| sharedAppointmentsStore.ts | Helper getBookedSlotsForDate |
| SecretaryAgenda.tsx | Vérifier notifications cross-rôle sur création RDV |

~6 fichiers modifiés, ~250 lignes changées

