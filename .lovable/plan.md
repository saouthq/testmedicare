

# Plan : ActionPalette unifiee + Teleconsultation complete + Profil Doctolib-style

## Partie A : ActionPalette unifiee pour tout l'espace Medecin

### Constat actuel
4 implementations differentes de la palette d'actions :
1. `PatientsPalette` dans `PatientsComponents.tsx` (la plus complete - overlay blur, sections, hints, footer, bouton Fermer, mode patient selectionne)
2. `PatientDetailActions` dans `patient-detail/PatientDetailActions.tsx`
3. `CommandPalette` dans `consultation/ConsultationModals.tsx`
4. Palette inline dans `ConsultationsComponents.tsx` (via ConsultationsContext)

### Solution
Refondre `src/components/shared/ActionPalette.tsx` en s'alignant sur le design de `PatientsPalette` (la version la plus aboutie), puis remplacer les 4 implementations.

#### Nouveau `ActionPalette.tsx` — Interface unifiee
```text
Props:
  open: boolean
  onClose: () => void
  actions: ActionItem[]
  placeholder?: string
  contextLabel?: string        // Ex: "Amine Ben Ali" quand patient selectionne
  contextAction?: () => void   // "Changer" bouton
  inputRef?: RefObject<HTMLInputElement>
  query: string
  onQueryChange: (v: string) => void
  activeIndex: number
  onActiveIndexChange: (v: number) => void
```

Design identique partout :
- Overlay `bg-foreground/20 backdrop-blur-sm`
- Card `rounded-xl border bg-card shadow-elevated max-w-xl`
- Header : Search icon + Input + badge contextuel optionnel + badge `Ctrl+K`
- Body : sections groupees avec titre `text-[11px] font-semibold text-muted-foreground`
- Items : `rounded-xl px-3 py-2`, active = `bg-primary/10`, hint a droite, meta en dessous
- Footer : `↑↓ naviguer · Entree lancer · Esc fermer` + bouton `Fermer`
- Keyboard : ArrowDown/Up/Enter/Escape geres en interne

#### `ActionItem` type unifie
```text
{
  id: string
  label: string
  hint?: string
  icon?: ReactNode
  group?: string
  meta?: string
  disabled?: boolean
  onRun: () => void
}
```

#### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/shared/ActionPalette.tsx` | Refonte complete, design PatientsPalette |
| `src/components/doctor-patients/PatientsComponents.tsx` | Supprimer `PatientsPalette`, utiliser `ActionPalette` |
| `src/components/doctor-patients/PatientsContext.tsx` | Adapter les types palette pour matcher `ActionItem` |
| `src/components/patient-detail/PatientDetailActions.tsx` | Remplacer par wrapper autour de `ActionPalette` |
| `src/components/consultation/ConsultationModals.tsx` | `CommandPalette` utilise `ActionPalette` |
| `src/components/consultation/ConsultationContext.tsx` | Adapter types palette |
| `src/components/doctor-consultations/ConsultationsComponents.tsx` | Palette locale remplacee par `ActionPalette` |
| `src/components/doctor-consultations/ConsultationsContext.tsx` | Adapter types palette |
| `src/components/doctor-prescriptions/PrescriptionsComponents.tsx` | Ajouter bouton Actions + `ActionPalette` |
| `src/components/doctor-prescriptions/PrescriptionsContext.tsx` | Ajouter state palette + actions |

---

## Partie B : Teleconsultation video complete

### Constat actuel
`Teleconsultation.tsx` (592L) = un seul fichier monolithique avec 3 phases (checklist, call, summary). Manque : ecran d'attente, panneau dossier/notes pendant l'appel, flow de fin structure, qualite reseau, partage ecran UI, notes rapides.

### Solution
Decouper en composants modulaires + ajouter les ecrans manquants.

#### Nouvelles phases
```text
patient: checklist -> waiting -> call -> summary
doctor:  waiting -> call -> notes-panel -> end-confirm -> summary -> done
```

#### Structure fichiers
```text
src/components/teleconsultation/
  TeleconsultationContext.tsx   -- State global (phase, media, chat, notes, summary)
  PreCheckScreen.tsx            -- Checklist patient (camera/micro/audio test, device picker, preview video, connexion)
  WaitingScreen.tsx             -- Ecran attente (statut patient, copier lien, envoyer message, re-test micro)
  CallScreen.tsx                -- Layout video (video principale, mini preview, controles, timer, qualite reseau)
  CallControls.tsx              -- Boutons (mute, camera, haut-parleur, partage ecran UI, chat, notes)
  ChatPanel.tsx                 -- Panel chat lateral
  DossierPanel.tsx              -- Panel dossier/notes pendant l'appel (notes, Rx, analyses, docs, historique)
  EndConfirmDialog.tsx          -- "Terminer la consultation" -> confirmation
  SummaryScreen.tsx             -- Recap (notes + docs generes) + actions finales (envoyer, PDF, retour)
  types.ts                      -- Types UI locaux
```

#### Page finale `Teleconsultation.tsx` : ~30L
```text
<TeleconsultationProvider role={role}>
  <DashboardLayout role={role} title="Teleconsultation">
    <TeleconsultationRouter />  -- switch sur phase
  </DashboardLayout>
</TeleconsultationProvider>
```

#### Fonctionnalites ajoutees
- **Pre-check** : preview video (placeholder), test audio avec feedback visuel, selecteur device (dropdown), indicateur connexion
- **Attente** : statut anime ("En attente" / "Patient rejoint" / "Connexion faible"), actions (copier lien, envoyer message, re-tester)
- **Appel** : indicateur qualite reseau (Excellente/Bonne/Faible avec couleurs), bouton partage ecran (toast UI-only), bouton haut-parleur, bouton notes rapides
- **Panel Dossier** : onglets (Notes | Rx | Analyses | Docs | Historique), editable en live, apercu docs
- **Fin** : dialog confirmation -> ecran recap avec tout, boutons envoyer/PDF/retour

Tous les handlers : `// TODO BACKEND: POST /api/teleconsultation/...`

---

## Partie C : Profil medecin Doctolib-style

### Constat actuel
`ProfileTab.tsx` (262L) = formulaire brut lineaire. Pas d'apercu, pas de completion, pas d'edition par section.

### Solution
Page "Mon profil" en 2 zones avec indicateur de completion et edition par section.

#### Structure fichiers
```text
src/components/doctor-settings/
  ProfileTab.tsx               -- Refonte : layout 2 colonnes (preview + sections editables)
  ProfilePreview.tsx           -- Apercu profil tel que vu par les patients (mini DoctorPublicProfile)
  ProfileSection.tsx           -- Composant section generique (titre, icone, bouton Modifier, contenu)
  ProfileCompletionBar.tsx     -- Barre "Profil : 65%" + checklist elements manquants
  ProfileSectionEditor.tsx     -- Sheet/Drawer edition d'une section (champs + preview live)
```

#### UX Flow
1. En haut : `ProfileCompletionBar` — barre de progression + checklist clickable
2. Layout 2 colonnes (desktop) / 1 colonne (mobile) :
   - **Gauche** : `ProfilePreview` — rendu identique au profil public (avatar, nom, specialite, infos, horaires, avis)
   - **Droite** : Sections editables empilees, chacune avec bouton "Modifier"
3. Clic "Modifier" sur une section -> `Sheet` lateral avec formulaire de la section + preview live dans le `ProfilePreview`
4. "Enregistrer" / "Annuler" dans le Sheet

#### Sections editables
| Section | Champs |
|---------|--------|
| Identite | Photo, prenom, nom, email, telephone |
| Cabinet | Adresse, acces (parking, handicap, ascenseur, transport) |
| Specialites | Specialite principale, sous-specialites (chips) |
| Tarifs | Tableau motifs (nom, duree, prix) |
| Actes & Expertises | Liste chips |
| Langues | Liste chips |
| Horaires | Grille semaine AM/PM |
| Diplomes & Experience | Liste editable (titre, ecole, annee) |
| Affiliations | Liste editable |
| Description | Textarea presentation |

#### Indicateur de completion
Calcul base sur : photo uploaded, description remplie, au moins 1 horaire, au moins 1 tarif, telephone, adresse, sous-specialites, diplomes. Affiche pourcentage + items manquants cliquables (scroll vers la section).

---

## Resume technique

### Fichiers crees (~15)
| Dossier | Fichiers |
|---------|----------|
| `src/components/teleconsultation/` | TeleconsultationContext.tsx, PreCheckScreen.tsx, WaitingScreen.tsx, CallScreen.tsx, CallControls.tsx, ChatPanel.tsx, DossierPanel.tsx, EndConfirmDialog.tsx, SummaryScreen.tsx, types.ts |
| `src/components/doctor-settings/` | ProfilePreview.tsx, ProfileSection.tsx, ProfileCompletionBar.tsx, ProfileSectionEditor.tsx |

### Fichiers modifies (~12)
| Fichier | Modification |
|---------|-------------|
| `src/components/shared/ActionPalette.tsx` | Refonte complete |
| `src/components/doctor-patients/PatientsComponents.tsx` | Supprimer PatientsPalette, utiliser ActionPalette |
| `src/components/doctor-patients/PatientsContext.tsx` | Adapter types |
| `src/components/patient-detail/PatientDetailActions.tsx` | Utiliser ActionPalette |
| `src/components/patient-detail/PatientDetailContext.tsx` | Adapter types |
| `src/components/consultation/ConsultationModals.tsx` | CommandPalette utilise ActionPalette |
| `src/components/consultation/ConsultationContext.tsx` | Adapter types |
| `src/components/doctor-consultations/ConsultationsComponents.tsx` | Utiliser ActionPalette |
| `src/components/doctor-consultations/ConsultationsContext.tsx` | Adapter types |
| `src/components/doctor-prescriptions/PrescriptionsComponents.tsx` | Ajouter palette |
| `src/components/doctor-prescriptions/PrescriptionsContext.tsx` | Ajouter state palette |
| `src/components/doctor-settings/ProfileTab.tsx` | Refonte Doctolib-style |
| `src/pages/teleconsultation/Teleconsultation.tsx` | Slim ~30L |

### Ordre d'execution
1. Refondre `ActionPalette.tsx` (le composant partage)
2. Remplacer les 4 palettes locales par `ActionPalette`
3. Ajouter palette aux Ordonnances
4. Creer les composants teleconsultation + refondre la page
5. Creer les composants profil + refondre `ProfileTab`

