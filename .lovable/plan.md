# Plan : Compléter les espaces Médecin et Admin

## Constat

### Espace Médecin — Manques identifiés

1. **Pas de page Congés & Absences** : aucun moyen pour le médecin de gérer ses indisponibilités, demander un remplaçant, notifier ses patients
2. **Protocoles non liés à la sidebar** : la route existe mais pas dans le nav `doctor`
3. **Pas de page Documents/Modèles** : le médecin ne peut pas gérer ses templates de certificats, lettres d'adressage, arrêts maladie en dehors de la consultation
4. **Pas de page Historique des actes** : pas de vue consolidée de tous les actes réalisés avec filtres date/patient/type pour la comptabilité
5. **Pas de gestion Tarifs/Actes** : le médecin ne peut pas configurer sa grille tarifaire (actes, majorations, conventionnement)

### Espace Admin — Manques identifiés

1. **Pas de page Tableau de bord Satisfaction** : pas de vue consolidée NPS, avis patients, tendances
2. **Pas de page Gestion des Partenaires API** : webhooks, clés API, intégrations tierces
3. **Pas de page Rapports planifiés** : exports programmés, rapports automatiques
4. **AdminSubscriptions** existe mais pas de workflow de relance impayés
5. **AdminPayments** manque de détail (pas de drawer transaction)

## Fichiers à créer


| Fichier                                 | Description                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/pages/doctor/DoctorLeaves.tsx`     | Gestion congés/absences avec calendrier, historique, notification patients, remplacement |
| `src/pages/doctor/DoctorDocuments.tsx`  | Bibliothèque de modèles (certificats, courriers, arrêts) avec création, édition, aperçu  |
| `src/pages/doctor/DoctorTarifs.tsx`     | Grille tarifaire : actes, prix, conventionné/non-conv, majorations                       |
| `src/pages/admin/AdminSatisfaction.tsx` | Dashboard NPS, avis patients agrégés, tendances, alertes praticiens mal notés            |
| `src/pages/admin/AdminAPIPartners.tsx`  | Gestion clés API, webhooks, intégrations tierces, logs d'appels                          |
| `src/pages/admin/AdminReports.tsx`      | Rapports planifiés : export CSV/PDF, programmation, historique des générations           |


## Fichiers à modifier


| Fichier                                     | Modifications                                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                               | Ajouter 6 nouvelles routes                                                                                       |
| `src/components/layout/DashboardLayout.tsx` | Ajouter les liens sidebar médecin (Protocoles, Documents, Congés, Tarifs) et admin (Satisfaction, API, Rapports) |
| `src/components/shared/SimulationPanel.tsx` | Ajouter les nouvelles pages au navigateur de test                                                                |


## Architecture des pages

Chaque page suit le pattern existant :

- `DashboardLayout` wrapper avec rôle
- État local `useState` + mock data inline
- Filtres, recherche, statistiques KPI en haut
- Liste/tableau principal avec actions
- Drawer (`Sheet`) pour les détails et l'édition
- Toasts pour les confirmations d'actions
- Commentaires `// TODO BACKEND:`

## Détails clés

### DoctorLeaves

- Calendrier visuel des absences (mois courant)
- Formulaire : dates début/fin, motif, remplaçant optionnel
- Toggle "Notifier les patients ayant un RDV"
- Historique des congés passés
- Stats : jours pris cette année, prochaine absence

### DoctorDocuments

- Templates : Certificat médical, Arrêt maladie, Lettre d'adressage, Certificat d'aptitude, Compte-rendu opératoire
- Actions : Dupliquer, Éditer, Aperçu, Supprimer
- Compteur d'utilisation par modèle
- Création depuis un formulaire structuré

### DoctorTarifs

- Grille d'actes avec prix, code acte, conventionné oui/non
- Majorations (nuit, dimanche, urgence)
- Actions : ajouter, modifier, supprimer un acte

### AdminSatisfaction

- NPS global + évolution (recharts)
- Derniers avis textuels
- Top/flop praticiens
- Alertes praticiens < seuil

### AdminAPIPartners

- Liste des clés API avec statut, quotas, dernière utilisation
- Webhooks configurés (URL, événements, statut)
- Logs des derniers appels API

### AdminReports

- Rapports disponibles (Utilisateurs, Revenus, RDV, etc.)
- Programmation (quotidien/hebdo/mensuel)
- Historique des exports avec téléchargement  
  
ajouter aussi onglet teleconsultation chez le medecin  
ajouter plus de practien dans la liste (ostheopathe etc ... toute specialité existante en tunisie  et met a jour les donnee partout 