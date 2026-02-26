

# Plan : Harmonisation du style et coherence des pages docteur

## Constat des incoherences

### 1. Composants UI dupliques
- **DoctorPatientDetail.tsx** (3096 lignes) definit ses propres composants `Card`, `TabsBar`, `Drawer` au lieu d'utiliser les composants shadcn/ui existants (`Card`, `Tabs`, `Sheet`)
- **DoctorPatients.tsx** (1632 lignes) et **DoctorPatientDetail.tsx** ont chacune leur propre `ActionsPaletteOverlay` custom, tandis que **DoctorPrescriptions.tsx** utilise le `CommandDialog` de shadcn

### 2. Styles visuels incoherents
- `DoctorPatientDetail` utilise `rounded-2xl` pour les cartes, alors que `DoctorDashboard`, `DoctorConsultations` et `DoctorConsultationDetail` utilisent `rounded-xl`
- Les barres de filtres/onglets ont des styles differents selon la page (padding, border-radius, espacement)
- Les boutons d'action primaires n'utilisent pas toujours la classe `gradient-primary shadow-primary-glow`

### 3. Workflow inter-pages
- Les liens de navigation entre pages doivent pointer correctement (consultations <-> patient <-> ordonnances)
- Le lien "Nouvelle consultation" pointe partout vers `/dashboard/doctor/consultation/new` -- coherent

---

## Modifications prevues

### Fichier 1 : `src/pages/doctor/DoctorPatientDetail.tsx`
- Remplacer le composant local `Card` par le composant shadcn `Card` + `CardHeader`/`CardContent` avec les memes classes que le reste de l'app (`rounded-xl border bg-card shadow-card`)
- Remplacer le `TabsBar` custom par le meme pattern de segmented buttons utilise dans `DoctorConsultations` et `DoctorPatients` (`rounded-lg border bg-card p-1`)
- Remplacer le `Drawer` custom par le composant shadcn `Sheet` (deja utilise dans `DoctorPrescriptions`)
- Remplacer le `ActionsPaletteOverlay` custom par le `CommandDialog` shadcn (comme `DoctorPrescriptions`)
- Uniformiser `rounded-2xl` -> `rounded-xl` partout

### Fichier 2 : `src/pages/doctor/DoctorPatients.tsx`
- Remplacer la palette custom par `CommandDialog` shadcn pour la coherence avec les autres pages
- Verifier que le modal "Nouveau patient" utilise `Dialog` shadcn
- Verifier les boutons primaires : `gradient-primary text-primary-foreground shadow-primary-glow`

### Fichier 3 : `src/pages/doctor/DoctorConsultations.tsx`
- Verifier la coherence du style des cartes de consultation (deja `rounded-xl border bg-card shadow-card`)
- Verifier que le formulaire de cloture utilise les memes patterns d'input/label

### Fichier 4 : `src/pages/doctor/DoctorPrescriptions.tsx`
- Verifier la coherence des cartes et des boutons avec le style global
- Mineure : aligner les classes de filtre avec le meme pattern segmented

### Fichier 5 : `src/pages/doctor/DoctorConsultationDetail.tsx`
- Deja bien structure, verifier juste la coherence des liens retour

---

## Verification workflow inter-pages

Verifications des parcours utilisateur :
1. **Dashboard** -> clic "Demarrer consultation" -> `/dashboard/doctor/consultation/new` -> OK
2. **Dashboard** -> clic "Dossier" patient -> `/dashboard/doctor/patients/1` -> OK
3. **Consultations** -> clic patient -> `/dashboard/doctor/patients/1` -> OK
4. **Consultations** -> "Nouvelle consultation" -> `/dashboard/doctor/consultation/new` -> OK
5. **ConsultationDetail** -> bouton retour -> `/dashboard/doctor/consultations` -> OK
6. **PatientDetail** -> bouton retour -> `/dashboard/doctor/patients` -> verifier
7. **Prescriptions** -> liens vers patients -> verifier

---

## Ordre d'execution

1. `DoctorPatientDetail.tsx` -- remplacement des composants custom par shadcn (Card, Sheet, CommandDialog, TabsBar) + uniformisation des border-radius
2. `DoctorPatients.tsx` -- remplacement palette custom par CommandDialog + alignement styles
3. `DoctorConsultations.tsx` -- ajustements mineurs de style
4. `DoctorPrescriptions.tsx` -- ajustements mineurs de style  
5. Verification des liens de navigation inter-pages sur les 5 fichiers

