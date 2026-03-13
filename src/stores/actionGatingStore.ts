/**
 * actionGatingStore.ts — Granular admin control over EVERY action/button/feature in the platform.
 * Goes beyond module-level toggling: each individual UI action can be enabled/disabled per role.
 *
 * Structure: Record<actionId, boolean>  (missing = true/enabled)
 *
 * Actions are organized by role + category for the admin UI.
 * Components check via `isActionEnabled(actionId)` or `useActionGating()` hook.
 *
 * // TODO BACKEND: Replace with GET/PUT /api/admin/action-gating
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { saveAdminConfig, loadAdminConfig } from "./adminConfigSync";

// ── Action Definition ──
export interface ActionDef {
  id: string;
  label: string;
  description: string;
  role: string;
  category: string;
  /** If true, disabling requires confirmation */
  critical?: boolean;
}

// ── Comprehensive Action Catalog ──
// Every single toggleable action/button/feature across all roles

export const actionCatalog: ActionDef[] = [
  // ═══════════════════════════════════════
  // PATIENT
  // ═══════════════════════════════════════
  // -- RDV --
  { id: "patient.book_appointment", label: "Prendre un rendez-vous", description: "Bouton de prise de RDV en ligne", role: "patient", category: "Rendez-vous", critical: true },
  { id: "patient.cancel_appointment", label: "Annuler un rendez-vous", description: "Annulation de RDV par le patient", role: "patient", category: "Rendez-vous" },
  { id: "patient.reschedule_appointment", label: "Reprogrammer un rendez-vous", description: "Modifier la date/heure d'un RDV", role: "patient", category: "Rendez-vous" },
  { id: "patient.view_appointment_history", label: "Voir historique RDV", description: "Accès à l'historique des rendez-vous passés", role: "patient", category: "Rendez-vous" },
  { id: "patient.rate_appointment", label: "Noter un rendez-vous", description: "Laisser un avis/note après consultation", role: "patient", category: "Rendez-vous" },
  { id: "patient.report_appointment", label: "Signaler un problème", description: "Signaler un litige ou un problème sur un RDV", role: "patient", category: "Rendez-vous" },
  // -- Santé --
  { id: "patient.view_health_records", label: "Voir dossier santé", description: "Accès au dossier médical complet", role: "patient", category: "Santé" },
  { id: "patient.add_health_item", label: "Ajouter un élément santé", description: "Ajouter allergie, antécédent, traitement, mesure", role: "patient", category: "Santé" },
  { id: "patient.view_documents", label: "Voir documents médicaux", description: "Accès aux comptes-rendus, ordonnances, analyses", role: "patient", category: "Santé" },
  { id: "patient.download_document", label: "Télécharger un document", description: "Téléchargement PDF de documents médicaux", role: "patient", category: "Santé" },
  { id: "patient.view_prescriptions", label: "Voir ordonnances", description: "Liste des ordonnances reçues", role: "patient", category: "Ordonnances" },
  { id: "patient.request_renewal", label: "Demander renouvellement", description: "Demande de renouvellement d'ordonnance", role: "patient", category: "Ordonnances" },
  { id: "patient.send_to_pharmacy", label: "Envoyer à la pharmacie", description: "Envoi d'ordonnance à une pharmacie", role: "patient", category: "Ordonnances" },
  // -- Téléconsultation --
  { id: "patient.join_teleconsult", label: "Rejoindre téléconsultation", description: "Accès à la salle de téléconsultation", role: "patient", category: "Téléconsultation" },
  { id: "patient.teleconsult_chat", label: "Chat en téléconsultation", description: "Messagerie durant la téléconsultation", role: "patient", category: "Téléconsultation" },
  { id: "patient.teleconsult_screen_share", label: "Partage d'écran patient", description: "Partager son écran en téléconsultation", role: "patient", category: "Téléconsultation" },
  // -- Communication --
  { id: "patient.send_message", label: "Envoyer un message", description: "Envoyer un message via la messagerie", role: "patient", category: "Communication" },
  { id: "patient.view_notifications", label: "Voir notifications", description: "Accès au centre de notifications", role: "patient", category: "Communication" },
  // -- Profil --
  { id: "patient.edit_profile", label: "Modifier profil", description: "Modifier informations personnelles", role: "patient", category: "Profil" },
  { id: "patient.edit_insurance", label: "Modifier assurance", description: "Modifier informations d'assurance", role: "patient", category: "Profil" },
  { id: "patient.change_password", label: "Changer mot de passe", description: "Modification du mot de passe", role: "patient", category: "Profil" },
  { id: "patient.delete_account", label: "Supprimer compte", description: "Suppression du compte patient", role: "patient", category: "Profil" },

  // ═══════════════════════════════════════
  // DOCTOR
  // ═══════════════════════════════════════
  // -- RDV & Planning --
  { id: "doctor.view_schedule", label: "Voir planning", description: "Affichage de l'agenda/planning", role: "doctor", category: "Planning", critical: true },
  { id: "doctor.create_appointment", label: "Créer un RDV manuellement", description: "Ajout manuel de RDV au planning", role: "doctor", category: "Planning" },
  { id: "doctor.cancel_appointment", label: "Annuler un RDV", description: "Annulation de RDV par le médecin", role: "doctor", category: "Planning" },
  { id: "doctor.block_slot", label: "Bloquer un créneau", description: "Bloquer un créneau ou une plage horaire", role: "doctor", category: "Planning" },
  { id: "doctor.declare_leave", label: "Déclarer un congé", description: "Déclarer un jour de congé/absence", role: "doctor", category: "Planning" },
  { id: "doctor.manage_availability", label: "Gérer disponibilités", description: "Configurer les plages de disponibilité", role: "doctor", category: "Planning" },
  // -- Salle d'attente --
  { id: "doctor.waiting_room", label: "Salle d'attente", description: "Voir et gérer la salle d'attente", role: "doctor", category: "Salle d'attente" },
  { id: "doctor.call_patient", label: "Appeler un patient", description: "Faire entrer un patient en consultation", role: "doctor", category: "Salle d'attente" },
  { id: "doctor.mark_arrived", label: "Marquer arrivé", description: "Marquer un patient comme arrivé", role: "doctor", category: "Salle d'attente" },
  { id: "doctor.mark_absent", label: "Marquer absent", description: "Marquer un patient comme absent", role: "doctor", category: "Salle d'attente" },
  // -- Patients --
  { id: "doctor.view_patients", label: "Voir liste patients", description: "Accès à la liste des patients", role: "doctor", category: "Patients", critical: true },
  { id: "doctor.view_patient_detail", label: "Voir fiche patient", description: "Accès au dossier détaillé du patient", role: "doctor", category: "Patients" },
  { id: "doctor.add_patient_note", label: "Ajouter note patient", description: "Ajouter une note privée au dossier", role: "doctor", category: "Patients" },
  { id: "doctor.view_patient_history", label: "Voir historique patient", description: "Consulter l'historique médical", role: "doctor", category: "Patients" },
  // -- Consultations --
  { id: "doctor.start_consultation", label: "Démarrer une consultation", description: "Ouvrir une nouvelle consultation", role: "doctor", category: "Consultations", critical: true },
  { id: "doctor.close_consultation", label: "Clôturer une consultation", description: "Fermer et sauvegarder la consultation", role: "doctor", category: "Consultations" },
  { id: "doctor.add_vitals", label: "Saisir constantes", description: "Ajout de constantes vitales", role: "doctor", category: "Consultations" },
  { id: "doctor.add_diagnosis", label: "Ajouter un diagnostic", description: "Diagnostic CIM-10/CISP", role: "doctor", category: "Consultations" },
  { id: "doctor.generate_report", label: "Générer compte-rendu", description: "Création du compte-rendu de consultation", role: "doctor", category: "Consultations" },
  { id: "doctor.generate_care_sheet", label: "Générer feuille de soins", description: "Création de la feuille de soins", role: "doctor", category: "Consultations" },
  { id: "doctor.request_lab", label: "Demander des analyses", description: "Envoi de demande d'analyses au labo", role: "doctor", category: "Consultations" },
  { id: "doctor.generate_certificate", label: "Générer un certificat", description: "Certificat médical, arrêt de travail", role: "doctor", category: "Consultations" },
  // -- Ordonnances --
  { id: "doctor.create_prescription", label: "Créer une ordonnance", description: "Rédiger une nouvelle ordonnance", role: "doctor", category: "Ordonnances" },
  { id: "doctor.send_prescription_pharmacy", label: "Envoyer ordonnance pharmacie", description: "Envoi numérique à la pharmacie", role: "doctor", category: "Ordonnances" },
  { id: "doctor.handle_renewal", label: "Gérer renouvellements", description: "Traiter les demandes de renouvellement", role: "doctor", category: "Ordonnances" },
  { id: "doctor.use_prescription_template", label: "Utiliser modèle ordonnance", description: "Ordonnances à partir de modèles", role: "doctor", category: "Ordonnances" },
  // -- Téléconsultation --
  { id: "doctor.start_teleconsult", label: "Démarrer téléconsultation", description: "Lancer une session de téléconsultation", role: "doctor", category: "Téléconsultation" },
  { id: "doctor.teleconsult_chat", label: "Chat en téléconsultation", description: "Messagerie durant la téléconsultation", role: "doctor", category: "Téléconsultation" },
  { id: "doctor.teleconsult_screen_share", label: "Partage d'écran médecin", description: "Partager son écran", role: "doctor", category: "Téléconsultation" },
  { id: "doctor.teleconsult_recording", label: "Enregistrer la consultation", description: "Enregistrement audio/vidéo", role: "doctor", category: "Téléconsultation" },
  // -- Facturation --
  { id: "doctor.view_billing", label: "Voir facturation", description: "Accès à la page de facturation", role: "doctor", category: "Facturation" },
  { id: "doctor.create_invoice", label: "Créer une facture", description: "Génération de facture", role: "doctor", category: "Facturation" },
  { id: "doctor.manage_tarifs", label: "Gérer les tarifs", description: "Modification des tarifs et actes", role: "doctor", category: "Facturation" },
  // -- Cabinet --
  { id: "doctor.invite_secretary", label: "Inviter une secrétaire", description: "Création de compte secrétaire", role: "doctor", category: "Cabinet" },
  { id: "doctor.manage_cabinet", label: "Gérer le cabinet", description: "Configuration du cabinet", role: "doctor", category: "Cabinet" },
  // -- IA --
  { id: "doctor.use_ai_assistant", label: "Utiliser l'assistant IA", description: "Accès à l'assistant IA diagnostic", role: "doctor", category: "IA & Outils" },
  { id: "doctor.use_ai_report", label: "CR automatisé (IA)", description: "Génération automatique de compte-rendu", role: "doctor", category: "IA & Outils" },
  // -- Communication --
  { id: "doctor.send_message", label: "Envoyer un message", description: "Messagerie avec patients/confrères", role: "doctor", category: "Communication" },
  { id: "doctor.view_documents", label: "Voir documents", description: "Gestion des documents du cabinet", role: "doctor", category: "Communication" },
  // -- Stats --
  { id: "doctor.view_stats", label: "Voir statistiques", description: "Tableaux de bord analytiques", role: "doctor", category: "Statistiques" },
  { id: "doctor.export_stats", label: "Exporter statistiques", description: "Export CSV/PDF des statistiques", role: "doctor", category: "Statistiques" },
  // -- Profil --
  { id: "doctor.edit_profile", label: "Modifier profil", description: "Modifier informations professionnelles", role: "doctor", category: "Profil" },
  { id: "doctor.manage_protocols", label: "Gérer protocoles", description: "Création/édition de protocoles médicaux", role: "doctor", category: "Profil" },
  { id: "doctor.manage_connect", label: "Gérer intégrations", description: "Connecteurs et API tierces", role: "doctor", category: "Profil" },

  // ═══════════════════════════════════════
  // SECRETARY
  // ═══════════════════════════════════════
  { id: "secretary.view_agenda", label: "Voir l'agenda", description: "Accès au planning des médecins", role: "secretary", category: "Planning", critical: true },
  { id: "secretary.create_appointment", label: "Créer un RDV", description: "Prise de RDV pour un patient", role: "secretary", category: "Planning" },
  { id: "secretary.cancel_appointment", label: "Annuler un RDV", description: "Annulation de RDV", role: "secretary", category: "Planning" },
  { id: "secretary.reschedule_appointment", label: "Reprogrammer un RDV", description: "Modifier date/heure d'un RDV", role: "secretary", category: "Planning" },
  { id: "secretary.manage_waiting_room", label: "Gérer salle d'attente", description: "Marquer arrivée, appeler patient", role: "secretary", category: "Salle d'attente" },
  { id: "secretary.view_patients", label: "Voir patients", description: "Accès à la liste des patients", role: "secretary", category: "Patients" },
  { id: "secretary.edit_patient_info", label: "Modifier info patient", description: "Modification coordonnées patient", role: "secretary", category: "Patients" },
  { id: "secretary.view_billing", label: "Voir facturation", description: "Accès facturation cabinet", role: "secretary", category: "Facturation" },
  { id: "secretary.create_invoice", label: "Créer facture", description: "Génération de facture", role: "secretary", category: "Facturation" },
  { id: "secretary.send_sms", label: "Envoyer SMS", description: "Envoi de SMS/rappels patients", role: "secretary", category: "Communication" },
  { id: "secretary.log_call", label: "Journal d'appels", description: "Enregistrement des appels téléphoniques", role: "secretary", category: "Communication" },
  { id: "secretary.send_message", label: "Envoyer un message", description: "Messagerie interne", role: "secretary", category: "Communication" },
  { id: "secretary.manage_documents", label: "Gérer documents", description: "Gestion des documents cabinet", role: "secretary", category: "Documents" },
  { id: "secretary.view_stats", label: "Voir statistiques", description: "Statistiques du cabinet", role: "secretary", category: "Statistiques" },
  { id: "secretary.manage_office", label: "Gérer le cabinet", description: "Paramètres du cabinet", role: "secretary", category: "Cabinet" },
  { id: "secretary.join_teleconsult", label: "Assister téléconsultation", description: "Rejoindre une téléconsultation en support", role: "secretary", category: "Téléconsultation" },

  // ═══════════════════════════════════════
  // PHARMACY
  // ═══════════════════════════════════════
  { id: "pharmacy.view_prescriptions", label: "Voir ordonnances", description: "Réception et liste des ordonnances", role: "pharmacy", category: "Ordonnances", critical: true },
  { id: "pharmacy.prepare_prescription", label: "Préparer ordonnance", description: "Marquer une ordonnance en préparation", role: "pharmacy", category: "Ordonnances" },
  { id: "pharmacy.mark_ready", label: "Marquer prêt", description: "Ordonnance prête au retrait", role: "pharmacy", category: "Ordonnances" },
  { id: "pharmacy.substitute_medication", label: "Substituer médicament", description: "Proposer un générique/substitut", role: "pharmacy", category: "Ordonnances" },
  { id: "pharmacy.view_stock", label: "Voir le stock", description: "Accès à la gestion de stock", role: "pharmacy", category: "Stock" },
  { id: "pharmacy.update_stock", label: "Modifier le stock", description: "Ajout/retrait de stock", role: "pharmacy", category: "Stock" },
  { id: "pharmacy.stock_alerts", label: "Alertes de stock", description: "Notifications de stock faible", role: "pharmacy", category: "Stock" },
  { id: "pharmacy.view_patients", label: "Voir patients", description: "Liste des patients de la pharmacie", role: "pharmacy", category: "Patients" },
  { id: "pharmacy.view_history", label: "Voir historique", description: "Historique des dispensations", role: "pharmacy", category: "Historique" },
  { id: "pharmacy.guard_schedule", label: "Planning de garde", description: "Gestion du calendrier de garde", role: "pharmacy", category: "Organisation" },
  { id: "pharmacy.send_message", label: "Envoyer un message", description: "Messagerie avec médecins/patients", role: "pharmacy", category: "Communication" },
  { id: "pharmacy.manage_connect", label: "Gérer intégrations", description: "Connecteurs et API", role: "pharmacy", category: "Organisation" },

  // ═══════════════════════════════════════
  // LABORATORY
  // ═══════════════════════════════════════
  { id: "lab.view_demands", label: "Voir demandes d'analyses", description: "Liste des demandes reçues", role: "laboratory", category: "Analyses", critical: true },
  { id: "lab.start_analysis", label: "Démarrer une analyse", description: "Passer en statut 'en cours'", role: "laboratory", category: "Analyses" },
  { id: "lab.upload_results", label: "Uploader résultats", description: "Ajouter des PDF de résultats", role: "laboratory", category: "Analyses" },
  { id: "lab.transmit_results", label: "Transmettre résultats", description: "Envoyer résultats au médecin/patient", role: "laboratory", category: "Analyses" },
  { id: "lab.validate_results", label: "Valider résultats", description: "Validation biologique des résultats", role: "laboratory", category: "Analyses" },
  { id: "lab.view_patients", label: "Voir patients", description: "Liste des patients du labo", role: "laboratory", category: "Patients" },
  { id: "lab.manage_reagents", label: "Gérer réactifs", description: "Stock et péremption des réactifs", role: "laboratory", category: "Qualité" },
  { id: "lab.quality_controls", label: "Contrôles qualité", description: "Gestion des contrôles CIQ/EEQ", role: "laboratory", category: "Qualité" },
  { id: "lab.home_sampling", label: "Prélèvements à domicile", description: "Gestion des prélèvements externes", role: "laboratory", category: "Organisation" },
  { id: "lab.view_reporting", label: "Voir reporting", description: "Statistiques et indicateurs labo", role: "laboratory", category: "Statistiques" },
  { id: "lab.send_message", label: "Envoyer un message", description: "Messagerie avec médecins", role: "laboratory", category: "Communication" },

  // ═══════════════════════════════════════
  // HOSPITAL
  // ═══════════════════════════════════════
  { id: "hospital.manage_departments", label: "Gérer les services", description: "Création/modification de services", role: "hospital", category: "Organisation" },
  { id: "hospital.manage_staff", label: "Gérer le personnel", description: "Affectation et gestion du personnel", role: "hospital", category: "Organisation" },
  { id: "hospital.manage_equipment", label: "Gérer les équipements", description: "Inventaire et maintenance équipements", role: "hospital", category: "Organisation" },
  { id: "hospital.view_patients", label: "Voir patients hospitalisés", description: "Liste des patients", role: "hospital", category: "Patients" },
  { id: "hospital.admit_patient", label: "Admettre un patient", description: "Admission d'un nouveau patient", role: "hospital", category: "Patients" },
  { id: "hospital.discharge_patient", label: "Sortie patient", description: "Décharge d'un patient", role: "hospital", category: "Patients" },
  { id: "hospital.send_message", label: "Envoyer un message", description: "Messagerie interne", role: "hospital", category: "Communication" },

  // ═══════════════════════════════════════
  // CLINIC
  // ═══════════════════════════════════════
  { id: "clinic.manage_doctors", label: "Gérer les médecins", description: "Ajout/retrait de médecins", role: "clinic", category: "Organisation" },
  { id: "clinic.manage_rooms", label: "Gérer les salles", description: "Configuration des salles de consultation", role: "clinic", category: "Organisation" },
  { id: "clinic.view_appointments", label: "Voir les RDV", description: "Planning global de la clinique", role: "clinic", category: "Planning" },
  { id: "clinic.manage_appointments", label: "Gérer les RDV", description: "Création/annulation de RDV", role: "clinic", category: "Planning" },
  { id: "clinic.send_message", label: "Envoyer un message", description: "Messagerie interne", role: "clinic", category: "Communication" },

  // ═══════════════════════════════════════
  // PUBLIC (non-logged)
  // ═══════════════════════════════════════
  { id: "public.search_doctors", label: "Rechercher un médecin", description: "Moteur de recherche de praticiens", role: "public", category: "Recherche" },
  { id: "public.view_doctor_profile", label: "Voir profil médecin", description: "Page de profil public du médecin", role: "public", category: "Recherche" },
  { id: "public.book_appointment", label: "Réserver un RDV (public)", description: "Réservation sans compte", role: "public", category: "Réservation" },
  { id: "public.view_directories", label: "Voir annuaires", description: "Annuaires cliniques, hôpitaux, pharmacies", role: "public", category: "Annuaires" },
  { id: "public.view_medicines", label: "Voir médicaments", description: "Annuaire des médicaments", role: "public", category: "Annuaires" },
  { id: "public.track_appointment", label: "Suivre un RDV (public)", description: "Suivi de RDV via téléphone", role: "public", category: "Réservation" },
  { id: "public.cancel_appointment", label: "Annuler RDV (public)", description: "Annulation sans compte", role: "public", category: "Réservation" },
];

// ── Store ──
export type ActionStates = Record<string, boolean>;

const store = createStore<ActionStates>("medicare_action_gating", {});

export function useActionGatingStore() {
  return useStore(store);
}

export function readActionStates(): ActionStates {
  return store.read();
}

/**
 * Check if an action is enabled. Defaults to true if not explicitly disabled.
 */
export function isActionEnabled(actionId: string): boolean {
  const states = store.read();
  return states[actionId] !== false;
}

/**
 * Toggle an action on/off.
 */
export function toggleAction(actionId: string, enabled: boolean, adminName = "Admin") {
  store.set(prev => ({ ...prev, [actionId]: enabled }));
  const action = actionCatalog.find(a => a.id === actionId);
  appendLog(
    enabled ? "action_enabled" : "action_disabled",
    "action_gating",
    actionId,
    `Action "${action?.label || actionId}" ${enabled ? "activée" : "désactivée"} par ${adminName}`,
    adminName
  );
}

/**
 * Bulk toggle all actions for a role.
 */
export function toggleAllForRole(role: string, enabled: boolean, adminName = "Admin") {
  const roleActions = actionCatalog.filter(a => a.role === role);
  store.set(prev => {
    const next = { ...prev };
    roleActions.forEach(a => { next[a.id] = enabled; });
    return next;
  });
  appendLog(
    enabled ? "actions_bulk_enabled" : "actions_bulk_disabled",
    "action_gating",
    role,
    `Toutes les actions du rôle "${role}" ${enabled ? "activées" : "désactivées"} par ${adminName}`,
    adminName
  );
}

/**
 * Bulk toggle all actions in a category for a role.
 */
export function toggleCategoryForRole(role: string, category: string, enabled: boolean, adminName = "Admin") {
  const catActions = actionCatalog.filter(a => a.role === role && a.category === category);
  store.set(prev => {
    const next = { ...prev };
    catActions.forEach(a => { next[a.id] = enabled; });
    return next;
  });
  appendLog(
    enabled ? "actions_category_enabled" : "actions_category_disabled",
    "action_gating",
    `${role}:${category}`,
    `Catégorie "${category}" du rôle "${role}" ${enabled ? "activée" : "désactivée"} par ${adminName}`,
    adminName
  );
}

/**
 * Reset all action states to defaults (all enabled).
 */
export function resetActionGating() {
  store.set({});
  saveAdminConfig("action_gating", {});
}

/** Load from Supabase */
export async function loadActionGating() {
  const data = await loadAdminConfig<Record<string, boolean>>("action_gating");
  if (data) store.set(data);
}

/**
 * Get stats for a given role.
 */
export function getRoleStats(role: string): { total: number; enabled: number; disabled: number } {
  const states = store.read();
  const roleActions = actionCatalog.filter(a => a.role === role);
  const disabled = roleActions.filter(a => states[a.id] === false).length;
  return { total: roleActions.length, enabled: roleActions.length - disabled, disabled };
}
