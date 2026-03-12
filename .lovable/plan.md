

# Plan : Compléter les fonctionnalités admin manquantes

## Audit des lacunes par page

| Page | Manques identifiés |
|---|---|
| **Utilisateurs** | Pas d'édition inline (changer rôle/plan), pas d'envoi email, pas de création manuelle |
| **Paiements** | Pas de "marquer payé", "relancer échoué", "générer facture", pas de lien vers profil user, pas de filtre date |
| **Promotions** | Utilise service local au lieu du store, pas de suppression, pas de stats, pas d'export CSV, pas de drawer détail |
| **Spécialités** | Pas de duplication, pas de bulk toggle, pas de réordonnancement |
| **Centre d'actions** | Actions dangereuses sans MotifDialog, pas d'historique d'exécution |
| **RGPD** | Pas de création manuelle de demande, pas d'édition des jours de rétention, pas de bulk process |
| **Plans & Tarifs** | Pas de duplication de plan, pas de compteur abonnés par plan, pas d'export |
| **Paramètres** | Complet (5 onglets). Mineurs : ajouter reset to defaults |

## Implémentation (7 fichiers)

### 1. AdminUsers — Actions enrichies
- Bouton "Modifier" dans le drawer 360° : dialog pour changer rôle, plan, email, téléphone
- Bouton "Envoyer un email" (mock) avec toast de confirmation
- Bouton "Créer un utilisateur" en haut de page (dialog avec nom, email, rôle, statut)
- Actions dans le drawer : changer plan → ouvre select, enregistre avec motif

### 2. AdminPayments — Workflows complets
- Action "Marquer payé" sur les paiements `pending` (avec MotifDialog)
- Action "Relancer" sur les paiements `failed` (avec toast mock)
- Bouton "Générer facture" dans le drawer détail (mock PDF download)
- Lien "Voir le profil" dans le drawer → navigate vers AdminUsers
- Filtre par période (date picker from/to)

### 3. AdminPromotions — Migration store + fonctionnalités
- Migrer de `adminPromotionsService` local vers un hook store centralisé (ajouter `useAdminPromotions` dans adminStore ou créer promotionsStore)
- Ajouter suppression avec MotifDialog
- Ajouter bandeau stats (total, actives, usage total, expire bientôt)
- Ajouter export CSV
- Drawer détail au clic (résumé, conditions, historique d'usage mock)

### 4. AdminPlanManager — Complétions
- Action "Dupliquer" un plan (crée copie brouillon)
- Colonne "Abonnés" dans le tableau (lookup croisé depuis subscriptions store)
- Export CSV des plans
- Badge "X abonnés actifs" dans le comparatif preview

### 5. AdminActions — Sécurité + historique
- MotifDialog obligatoire pour les actions `dangerous: true`
- Historique d'exécution persisté en localStorage (dernières 50 exécutions)
- Section "Dernières exécutions" en bas de page avec timestamp, action, statut, motif
- ConfirmDialog simple pour les actions non-dangereuses

### 6. AdminCompliance — Workflows avancés
- Bouton "Nouvelle demande" → dialog pour créer une demande RGPD manuellement (nom, email, type, motif)
- Édition inline des jours de rétention dans l'onglet Rétention (Input number + save)
- Sélection multiple + bouton "Traiter en masse" pour les demandes pending
- Export CSV des demandes

### 7. AdminSpecialties — Compléments
- Action "Dupliquer" une spécialité
- Bulk toggle (sélection multiple + activer/désactiver)
- Drag-to-reorder ou boutons ↑↓ pour l'ordre d'affichage

## Principes appliqués
- Toute action sensible → MotifDialog + audit log (pattern existant)
- Toutes les données persistent via le store central (pas de mocks locaux)
- Réutilisation de `AdminDataTable` là où possible (Promotions)
- EmptyState cohérent partout
- Navigation croisée (payment → user profile, plan → subscriber count)

