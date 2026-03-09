/**
 * Mock data — Admin domain
 * TODO BACKEND: Replace with real API calls
 */
import type { ChartDataPoint } from "@/types";

export const mockAdminStats = [
  { label: "Utilisateurs", value: "12,458", color: "text-primary", change: "+12%" },
  { label: "Médecins", value: "1,245", color: "text-accent", change: "+8%" },
  { label: "Laboratoires", value: "87", color: "text-warning", change: "+3%" },
  { label: "Pharmacies", value: "234", color: "text-primary", change: "+5%" },
];

export const mockAdminRevenueData: ChartDataPoint[] = [
  { month: "Sep", value: 32000 }, { month: "Oct", value: 35200 }, { month: "Nov", value: 38100 },
  { month: "Déc", value: 41500 }, { month: "Jan", value: 45200 }, { month: "Fév", value: 48750 },
];

export const mockAdminRevenue = mockAdminRevenueData;

export const mockAdminRegistrationData: ChartDataPoint[] = [
  { day: "Lun", doctors: 3, patients: 18, others: 2 },
  { day: "Mar", doctors: 5, patients: 22, others: 1 },
  { day: "Mer", doctors: 2, patients: 15, others: 3 },
  { day: "Jeu", doctors: 4, patients: 25, others: 2 },
  { day: "Ven", doctors: 6, patients: 20, others: 4 },
  { day: "Sam", doctors: 1, patients: 8, others: 0 },
  { day: "Dim", doctors: 0, patients: 5, others: 0 },
];

export const mockAdminPendingApprovals = [
  { id: 1, name: "Dr. Karim Bouzid", role: "Médecin - Cardiologue", date: "18 Fév 2026", docs: "Diplôme + CIN", email: "karim@email.tn" },
  { id: 2, name: "Pharmacie El Amal", role: "Pharmacie - Sousse", date: "19 Fév 2026", docs: "Licence + Registre", email: "elamal@pharmacy.tn" },
  { id: 3, name: "Dr. Nadia Hamdi", role: "Médecin - Dermatologue", date: "20 Fév 2026", docs: "Diplôme + CIN", email: "nadia@email.tn" },
];

export const mockAdminRecentActivity = [
  { type: "inscription", desc: "Dr. Karim Bouzid - Cardiologue", time: "Il y a 2h", status: "pending" },
  { type: "abonnement", desc: "Dr. Sonia Gharbi a souscrit Pro (129 DT/mois)", time: "Il y a 3h", status: "success" },
  { type: "signalement", desc: "Signalement sur Dr. Fathi Mejri - Avis suspect", time: "Il y a 5h", status: "warning" },
  { type: "inscription", desc: "Pharmacie El Amal - Sousse", time: "Il y a 6h", status: "pending" },
  { type: "paiement", desc: "Paiement reçu - Labo BioSanté (59 DT)", time: "Il y a 8h", status: "success" },
  { type: "signalement", desc: "Patient signale un profil médecin frauduleux", time: "Il y a 12h", status: "warning" },
];

export const mockAdminUsers = [
  { id: 1, name: "Dr. Ahmed Bouazizi", email: "ahmed@email.tn", phone: "+216 71 234 567", role: "doctor", status: "active", subscription: "Pro", joined: "Jan 2024", lastLogin: "20 Fév 2026", verified: true },
  { id: 2, name: "Fatma Trabelsi", email: "fatma@email.tn", phone: "+216 55 987 654", role: "patient", status: "active", subscription: "Gratuit", joined: "Mar 2024", lastLogin: "19 Fév 2026", verified: true },
  { id: 3, name: "Pharmacie El Manar", email: "elmanar@pharmacy.tn", phone: "+216 71 555 666", role: "pharmacy", status: "active", subscription: "Standard", joined: "Juin 2024", lastLogin: "20 Fév 2026", verified: true },
  { id: 4, name: "Labo BioSanté", email: "biosante@lab.tn", phone: "+216 71 777 888", role: "laboratory", status: "active", subscription: "Pro", joined: "Sep 2024", lastLogin: "18 Fév 2026", verified: true },
  { id: 5, name: "Dr. Karim Bouzid", email: "karim@email.tn", phone: "+216 71 111 222", role: "doctor", status: "pending", subscription: "—", joined: "18 Fév 2026", lastLogin: "—", verified: false },
  { id: 6, name: "Dr. Nadia Hamdi", email: "nadia@email.tn", phone: "+216 71 333 444", role: "doctor", status: "pending", subscription: "—", joined: "20 Fév 2026", lastLogin: "—", verified: false },
  { id: 7, name: "Amine Ben Ali", email: "amine@email.tn", phone: "+216 22 345 678", role: "patient", status: "suspended", subscription: "Gratuit", joined: "Fév 2024", lastLogin: "10 Fév 2026", verified: true },
  { id: 8, name: "Sonia Gharbi", email: "sonia@email.tn", phone: "+216 55 123 456", role: "secretary", status: "active", subscription: "—", joined: "Nov 2024", lastLogin: "20 Fév 2026", verified: true },
];

export const mockAdminReports = [
  { id: 1, type: "profil", reason: "Profil médecin non vérifié avec activité suspecte", reporter: "Système auto", target: "Dr. Fathi Mejri", date: "18 Fév 2026", priority: "high", status: "pending" as string, details: "Ce compte a été créé il y a 3 jours et a déjà publié 15 consultations." },
  { id: 2, type: "comportement", reason: "Comportement inapproprié en téléconsultation", reporter: "Fatma Trabelsi", target: "Dr. Inconnu", date: "17 Fév 2026", priority: "medium", status: "pending" as string, details: "La patiente rapporte un comportement non professionnel durant une téléconsultation." },
  { id: 3, type: "contenu", reason: "Photo de profil inappropriée", reporter: "Système auto", target: "Utilisateur #4521", date: "15 Fév 2026", priority: "low", status: "resolved" as string, details: "Photo de profil ne correspondant pas aux normes de la plateforme." },
];

export const mockAdminSubscriptions = [
  { name: "Gratuit", count: 8500, revenue: "0 DT" },
  { name: "Starter (49 DT/mois)", count: 320, revenue: "15,680 DT" },
  { name: "Pro (129 DT/mois)", count: 145, revenue: "18,705 DT" },
];

export const mockAdminLogs = [
  { id: 1, time: "20 Fév 09:45", user: "Dr. Bouazizi", action: "Connexion", detail: "Connexion réussie depuis 196.203.xx.xx", level: "info" },
  { id: 2, time: "20 Fév 09:42", user: "Admin", action: "Validation compte", detail: "Dr. Karim Bouzid — Cardiologue approuvé", level: "info" },
  { id: 3, time: "20 Fév 09:38", user: "Système", action: "Alerte sécurité", detail: "3 tentatives de connexion échouées — IP 41.226.xx.xx", level: "security" },
  { id: 4, time: "20 Fév 09:30", user: "Dr. Gharbi", action: "Modification profil", detail: "Mise à jour des horaires d'ouverture", level: "info" },
  { id: 5, time: "20 Fév 09:15", user: "Admin", action: "Suspension compte", detail: "Dr. Fathi Mejri — Profil signalé pour fraude", level: "warning" },
  { id: 6, time: "20 Fév 09:10", user: "Pharmacie El Amal", action: "Inscription", detail: "Nouvelle inscription — En attente de validation", level: "info" },
  { id: 7, time: "20 Fév 09:00", user: "Système", action: "Sauvegarde automatique", detail: "Base de données sauvegardée avec succès", level: "info" },
  { id: 8, time: "20 Fév 08:55", user: "Admin", action: "Rejet inscription", detail: "Labo XYZ — Documents non conformes", level: "warning" },
  { id: 9, time: "19 Fév 22:00", user: "Système", action: "Maintenance planifiée", detail: "Nettoyage des sessions expirées", level: "info" },
  { id: 10, time: "19 Fév 18:30", user: "Patient inconnu", action: "Tentative d'accès", detail: "Accès refusé — Token expiré", level: "error" },
  { id: 11, time: "19 Fév 17:00", user: "Admin", action: "Export données", detail: "Export CSV des utilisateurs actifs", level: "info" },
  { id: 12, time: "19 Fév 15:30", user: "Dr. Hammami", action: "Suppression RDV", detail: "Annulation du RDV #4532", level: "warning" },
];

/** Guard pharmacies mock data */
export const mockGuardPharmacies = [
  { id: "ph-1", name: "Pharmacie El Manar", city: "Tunis", address: "12 Ave Habib Bourguiba", phone: "+216 71 555 666", isGuard: false },
  { id: "ph-2", name: "Pharmacie El Amal", city: "Sousse", address: "45 Rue de la Liberté", phone: "+216 73 222 333", isGuard: true },
  { id: "ph-3", name: "Pharmacie Centrale", city: "Tunis", address: "8 Rue Charles de Gaulle", phone: "+216 71 888 999", isGuard: false },
  { id: "ph-4", name: "Pharmacie Ibn Sina", city: "Ariana", address: "22 Ave de la République", phone: "+216 71 444 555", isGuard: true },
  { id: "ph-5", name: "Pharmacie Pasteur", city: "Sfax", address: "3 Rue Pasteur", phone: "+216 74 111 222", isGuard: false },
  { id: "ph-6", name: "Pharmacie El Fath", city: "Sousse", address: "67 Ave Farhat Hached", phone: "+216 73 333 444", isGuard: false },
];

/** Support tickets mock */
export const mockAdminTickets = [
  { id: "tk-1", requester: "Fatma Trabelsi", requesterRole: "patient", subject: "Impossible d'annuler un RDV", category: "rdv", status: "open" as string, priority: "high" as string, createdAt: "20 Fév 2026", assignedTo: "", messages: 2 },
  { id: "tk-2", requester: "Dr. Sonia Gharbi", requesterRole: "doctor", subject: "Problème de facturation abonnement Pro", category: "facturation", status: "open" as string, priority: "medium" as string, createdAt: "19 Fév 2026", assignedTo: "Support L1", messages: 4 },
  { id: "tk-3", requester: "Pharmacie El Manar", requesterRole: "pharmacy", subject: "Bug affichage ordonnances", category: "technique", status: "closed" as string, priority: "low" as string, createdAt: "17 Fév 2026", assignedTo: "Support L2", messages: 6 },
  { id: "tk-4", requester: "Ali Ben Salem", requesterRole: "patient", subject: "Demande suppression de compte", category: "compte", status: "open" as string, priority: "medium" as string, createdAt: "18 Fév 2026", assignedTo: "", messages: 1 },
  { id: "tk-5", requester: "Labo BioSanté", requesterRole: "laboratory", subject: "Erreur upload résultats PDF", category: "technique", status: "open" as string, priority: "high" as string, createdAt: "20 Fév 2026", assignedTo: "", messages: 3 },
];

/** Support macros */
export const mockSupportMacros = [
  { id: "m-1", label: "RDV annulé", text: "Votre RDV a été annulé avec succès. Vous pouvez en reprendre un nouveau à tout moment." },
  { id: "m-2", label: "Remboursement en cours", text: "Votre demande de remboursement est en cours de traitement. Comptez 5-7 jours ouvrables." },
  { id: "m-3", label: "Problème résolu", text: "Le problème signalé a été résolu. N'hésitez pas à nous recontacter si le souci persiste." },
  { id: "m-4", label: "Docs manquants", text: "Nous avons besoin de documents complémentaires pour traiter votre demande. Merci de les uploader dans votre espace." },
];

/** Top searched medicines */
export const mockTopSearchedMeds = [
  { name: "Doliprane 1000mg", searches: 1247 },
  { name: "Augmentin 1g", searches: 892 },
  { name: "Voltarène 75mg", searches: 654 },
  { name: "Amoxicilline 500mg", searches: 521 },
  { name: "Efferalgan 500mg", searches: 498 },
];
