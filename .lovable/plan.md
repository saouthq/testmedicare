

# Refonte "Dossier Patient" et "Poste de Consultation" -- Style Doctolib

Deux fichiers majeurs a transformer en interfaces professionnelles denses, style Doctolib.

---

## Fichier 1 : DoctorPatientDetail.tsx -- "Dossier Patient"

### Architecture : Layout 3 colonnes (responsive)

**Colonne gauche (sidebar 280px):**
- Carte identite patient compacte (avatar, nom, age, sexe, groupe sanguin, mutuelle, allergies en badges rouges, conditions en badges warning)
- Boutons rapides : Nouvelle consultation, Ordonnance, Planifier RDV, Certificat, Message
- Champ "Recherche dans le dossier" avec filtres chips (Tout, Consultations, Ordonnances, Biologie, Documents)
- Menu sections cliquable (scrollspy-like) : Historique, Antecedents, Mesures, Traitements, Vaccins, Biologie, Documents, Photos, Courbes
- Bouton "Demander document au patient" -> toast confirmation

**Colonne centrale (flex-1):**
- Bloc "Observation" toujours visible : notes cliniques editables (motif, examen, synthese)
- En dessous, les sections affichees selon le menu gauche :
  - **Historique** : Timeline unique fusionnant consultations + ordonnances + analyses. Chaque item cliquable ouvre un drawer avec details complets
  - **Antecedents** : liste editable depuis mockAntecedents + mockFamilyHistory + mockSurgeries
  - **Mesures** : tableau depuis mockMeasures + mockVitalsHistory
  - **Traitements** : depuis mockTreatments avec statut actif/arrete
  - **Vaccins** : mockVaccinations avec statut fait/a faire, bouton "Rappel" -> toast
  - **Biologie** : mockPatientAnalyses en tableau avec drapeaux haut/bas colores + bloc alertes
  - **Documents** : mockHealthDocuments avec actions (telecharger, imprimer, envoyer)
  - **Photos** : galerie mock (3-4 images placeholder) + bouton "Ajouter photo" -> toast + tags
  - **Courbes** : placeholder Recharts (poids/glycemie/TA dans le temps) avec points cliquables -> drawer

**Colonne droite (280px):**
- Bloc "Plan de soins" : prochains RDV + traitements en cours
- Bloc "Taches" : checklist mock (Fond d'oeil a programmer, Renouveler ordonnance, etc.)
- Bloc "Documents a generer" : boutons Certificat, Lettre d'adressage, Compte-rendu -> drawer preview
- Bloc "Prescription" : resume ordonnances actives

**Responsive mobile:**
- Colonne gauche -> burger/drawer
- Colonne droite -> accordeon en bas
- Colonne centrale pleine largeur

### Donnees utilisees (aucun ajout mockData)
mockConsultationPatient, mockVitalsHistory, mockPatientConsultations, mockPatientDetailPrescriptions, mockPatientAnalyses, mockAntecedents, mockTreatments, mockAllergies, mockVaccinations, mockMeasures, mockHealthDocuments, mockFamilyHistory, mockSurgeries

---

## Fichier 2 : DoctorConsultationDetail.tsx -- "Poste de Consultation"

### Architecture : Layout 3 colonnes

**Colonne gauche (260px, sticky):**
- Carte patient compacte (nom, age, allergies en rouge, conditions)
- Mini-timeline : 3 derniers items (consultations/ordonnances)
- Menu sections : Constantes, Notes, Ordonnance, Analyses, Documents, Taches
- Bouton "Dossier complet" -> lien vers /patients/1

**Colonne centrale (flex-1):**
- Notes consultation structurees : Motif, Anamnese, Examen clinique, Diagnostic, Conduite a tenir (existant, conserve)
- Nouveau bloc "Codification CIM-10" : champ autocomplete mock (recherche texte -> suggestions filtrees depuis liste locale) -> ajout en tags
- Constantes vitales (existant, conserve mais toujours visible, pas collapsible)

**Colonne droite (320px):**
- **A) PrescriptionBuilder avance** :
  - Champ recherche medicament avec mockDrugCatalog (liste locale de 15-20 medicaments courants)
  - Section "Favoris" (3-4 medicaments frequents, clic = ajout)
  - Section "Modeles" (2-3 templates : "Diabete T2", "HTA", "Douleurs") -> pre-remplit les items
  - Bouton "Renouveler precedente" -> copie derniere ordonnance
  - Statut : Brouillon / Signee / Envoyee (badges)
  - Bouton "Apercu" -> drawer preview ordonnance formatee
  - Bouton "Envoyer au patient" -> toast confirmation

- **B) Analyses a prescrire** : amelioration existante, ajout categories (Hematologie, Biochimie, Hormonologie) comme chips filtrables

- **C) Documents a generer** : templates mock (Certificat medical, Arret de travail, Lettre d'adressage, Compte-rendu) -> drawer preview avec contenu pre-rempli

- **D) Taches consultation** : checklist (Prendre constantes, Examiner patient, Ordonnance, Analyses, Prochain RDV)

**Modal "Terminer" amelioree** (existante, enrichie) :
- Ajout checkboxes : "Envoyer ordonnance au patient", "Envoyer documents generes", "Creer RDV de suivi"
- Recap diagnostic + ordonnance + analyses (existant)

**Responsive mobile:**
- Colonnes gauche/droite -> accordeons
- Colonne centrale pleine largeur

### Donnees locales ajoutees dans le fichier
- mockDrugCatalog : ~20 medicaments (nom, dosage, forme)
- mockCIM10Codes : ~15 codes (code, label)
- mockPrescriptionTemplates : 3 modeles
- mockDocTemplates : 4 templates documents

---

## Details techniques

- Tout reste dans les 2 fichiers respectifs (sous-composants locaux)
- Etat local uniquement (useState), aucun appel API
- Drawers via div fixe avec backdrop (pattern existant dans le projet)
- Toasts via sonner (import toast from sonner)
- Charts via Recharts (deja installe) pour la section Courbes
- Les TODO backend seront en commentaires dans le code
- Imports mockData existants, pas de modification de mockData.ts

