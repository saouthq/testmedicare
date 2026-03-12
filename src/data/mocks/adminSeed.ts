/**
 * Admin seed data — Consolidated from all admin pages.
 * Cross-referenced via IDs for entity linking.
 * Called once by seedStores.ts on first load.
 */
import type { AdminState } from "@/types/admin";

export const adminSeedData: AdminState = {
  // ═══════════════════════════════════════════
  // USERS (cross-linked to orgs, subs)
  // ═══════════════════════════════════════════
  users: [
    { id: "usr-1", name: "Dr. Ahmed Bouazizi", email: "ahmed@email.tn", phone: "+216 71 234 567", role: "doctor", status: "active", subscription: "Pro", joined: "Jan 2024", lastLogin: "20 Fév 2026", verified: true, organizationId: "org-1", internalNotes: [] },
    { id: "usr-2", name: "Fatma Trabelsi", email: "fatma@email.tn", phone: "+216 55 987 654", role: "patient", status: "active", subscription: "Gratuit", joined: "Mar 2024", lastLogin: "19 Fév 2026", verified: true, internalNotes: [] },
    { id: "usr-3", name: "Pharmacie El Manar", email: "elmanar@pharmacy.tn", phone: "+216 71 555 666", role: "pharmacy", status: "active", subscription: "Standard", joined: "Juin 2024", lastLogin: "20 Fév 2026", verified: true, organizationId: "org-5", internalNotes: [] },
    { id: "usr-4", name: "Labo BioSanté", email: "biosante@lab.tn", phone: "+216 71 777 888", role: "laboratory", status: "active", subscription: "Pro", joined: "Sep 2024", lastLogin: "18 Fév 2026", verified: true, organizationId: "org-4", internalNotes: [] },
    { id: "usr-5", name: "Dr. Karim Bouzid", email: "karim@email.tn", phone: "+216 71 111 222", role: "doctor", status: "pending", subscription: "—", joined: "18 Fév 2026", lastLogin: "—", verified: false, kycApplicationId: "kyc-1", internalNotes: [] },
    { id: "usr-6", name: "Dr. Nadia Hamdi", email: "nadia@email.tn", phone: "+216 71 333 444", role: "doctor", status: "pending", subscription: "—", joined: "20 Fév 2026", lastLogin: "—", verified: false, kycApplicationId: "kyc-2", internalNotes: [] },
    { id: "usr-7", name: "Amine Ben Ali", email: "amine@email.tn", phone: "+216 22 345 678", role: "patient", status: "suspended", subscription: "Gratuit", joined: "Fév 2024", lastLogin: "10 Fév 2026", verified: true, internalNotes: [{ id: "note-1", author: "Admin", text: "Suspendu pour comportement abusif en téléconsultation", createdAt: "2026-02-10T09:00:00" }] },
    { id: "usr-8", name: "Sonia Gharbi", email: "sonia@email.tn", phone: "+216 55 123 456", role: "secretary", status: "active", subscription: "—", joined: "Nov 2024", lastLogin: "20 Fév 2026", verified: true, organizationId: "org-1", internalNotes: [] },
    { id: "usr-9", name: "Dr. Sami Trabelsi", email: "sami@email.tn", phone: "+216 74 111 222", role: "doctor", status: "active", subscription: "Pro", joined: "Mar 2025", lastLogin: "09 Mar 2026", verified: true, internalNotes: [] },
    { id: "usr-10", name: "Ali Ben Salem", email: "ali@email.tn", phone: "+216 22 111 333", role: "patient", status: "active", subscription: "Gratuit", joined: "Jan 2025", lastLogin: "08 Mar 2026", verified: true, internalNotes: [] },
    { id: "usr-11", name: "Sarra Mejri", email: "sarra@email.tn", phone: "+216 22 222 444", role: "patient", status: "active", subscription: "Gratuit", joined: "Jun 2025", lastLogin: "09 Mar 2026", verified: true, internalNotes: [] },
    { id: "usr-12", name: "Mohamed Kaabi", email: "mohamed@email.tn", phone: "+216 22 333 555", role: "patient", status: "active", subscription: "Gratuit", joined: "Sep 2025", lastLogin: "08 Mar 2026", verified: true, internalNotes: [] },
  ],

  // ═══════════════════════════════════════════
  // ORGANIZATIONS
  // ═══════════════════════════════════════════
  organizations: [
    { id: "org-1", type: "cabinet", name: "Cabinet Dr. Bouazizi", city: "Tunis", address: "12 Rue de la Liberté", phone: "+216 71 234 567", email: "bouazizi@cabinet.tn", status: "active", ownerId: "usr-1", memberIds: ["usr-1", "usr-8"], secretaryNames: ["Sonia Gharbi"], membersCount: 3, createdAt: "Jan 2025", subscriptionId: "sub-1", internalNotes: [] },
    { id: "org-2", type: "clinic", name: "Clinique El Manar", city: "Tunis", address: "Av. de la Clinique, El Manar", phone: "+216 71 890 123", email: "contact@elmanar.tn", status: "active", memberIds: [], secretaryNames: ["Amira Bouzid"], membersCount: 45, createdAt: "Mar 2024", internalNotes: [] },
    { id: "org-3", type: "hospital", name: "Hôpital Charles Nicolle", city: "Tunis", address: "Bab Souika", phone: "+216 71 578 000", email: "info@charles-nicolle.tn", status: "active", memberIds: [], secretaryNames: [], membersCount: 320, createdAt: "Jan 2020", internalNotes: [] },
    { id: "org-4", type: "lab", name: "Labo BioSanté", city: "Sousse", address: "45 Av. Bourguiba", phone: "+216 73 456 789", email: "contact@biosante.tn", status: "active", ownerId: "usr-4", memberIds: ["usr-4"], secretaryNames: [], membersCount: 12, createdAt: "Jun 2025", internalNotes: [] },
    { id: "org-5", type: "pharmacy", name: "Pharmacie El Manar", city: "Tunis", address: "12 Ave Habib Bourguiba", phone: "+216 71 555 666", email: "elmanar@pharmacy.tn", status: "active", ownerId: "usr-3", memberIds: ["usr-3"], secretaryNames: [], membersCount: 4, createdAt: "Juin 2024", internalNotes: [] },
    { id: "org-6", type: "cabinet", name: "Cabinet Dr. Gharbi", city: "Ariana", address: "15 Rue des Roses", phone: "+216 71 333 444", email: "gharbi@cabinet.tn", status: "suspended", memberIds: [], secretaryNames: [], membersCount: 2, createdAt: "Sep 2025", internalNotes: [{ id: "note-org-1", author: "Admin", text: "Suspendu suite à un contrôle de l'Ordre des Médecins", createdAt: "2026-02-15T10:00:00" }] },
  ],

  // ═══════════════════════════════════════════
  // ONBOARDING / KYC
  // ═══════════════════════════════════════════
  onboardingApplications: [
    { id: "kyc-1", userId: "usr-5", entityType: "doctor", entityName: "Dr. Karim Bouzid", specialty: "Cardiologue", activity: "specialiste", city: "Tunis", email: "karim@email.tn", phone: "+216 71 111 222", submittedAt: "2026-03-08T10:00:00", status: "pending", currentStep: "kyc_submitted", stuckDays: 2, lastActivity: "2026-03-08", docs: ["Diplôme de médecine", "CIN recto/verso", "Attestation d'inscription à l'Ordre"], events: [{ id: "e1", type: "submitted", text: "Dossier soumis avec 3 documents", author: "Dr. Karim Bouzid", createdAt: "2026-03-08T10:00:00" }], plan: "Pro", planPrice: 169, billing: "yearly" },
    { id: "kyc-2", userId: "usr-6", entityType: "doctor", entityName: "Dr. Nadia Hamdi", specialty: "Dermatologue", activity: "specialiste", city: "Ariana", email: "nadia@email.tn", phone: "+216 71 333 444", submittedAt: "2026-03-09T08:00:00", status: "pending", currentStep: "kyc_submitted", stuckDays: 1, lastActivity: "2026-03-09", docs: ["Diplôme de médecine", "CIN recto/verso"], events: [{ id: "e2", type: "submitted", text: "Dossier soumis avec 2 documents", author: "Dr. Nadia Hamdi", createdAt: "2026-03-09T08:00:00" }], plan: "Essentiel", planPrice: 59, billing: "monthly" },
    { id: "kyc-3", entityType: "lab", entityName: "Labo MedTest", specialty: "Analyses médicales", activity: "laboratory", city: "Sousse", email: "medtest@lab.tn", phone: "+216 73 555 666", submittedAt: "2026-03-07T14:00:00", status: "pending", currentStep: "kyc_submitted", stuckDays: 3, lastActivity: "2026-03-08", docs: ["Autorisation d'exercice", "Registre de commerce", "Certificat d'accréditation", "CIN gérant"], events: [{ id: "e3", type: "submitted", text: "Dossier soumis avec 4 documents", author: "Labo MedTest", createdAt: "2026-03-07T14:00:00" }, { id: "e4", type: "note", text: "Certificat d'accréditation à vérifier auprès du TUNAC", author: "Admin", createdAt: "2026-03-08T09:00:00" }], plan: "Premium", planPrice: 149, billing: "yearly" },
    { id: "kyc-4", entityType: "pharmacy", entityName: "Pharmacie El Amal", specialty: "Officine", activity: "pharmacy", city: "Sousse", email: "elamal@pharmacy.tn", phone: "+216 73 222 333", submittedAt: "2026-03-06T11:00:00", status: "pending", currentStep: "docs_uploaded", stuckDays: 4, lastActivity: "2026-03-07", docs: ["Licence de pharmacie", "Registre de commerce", "CIN titulaire"], events: [{ id: "e5", type: "submitted", text: "Dossier soumis avec 3 documents", author: "Pharmacie El Amal", createdAt: "2026-03-06T11:00:00" }, { id: "e6", type: "relance", text: "Relance envoyée par email pour complément (autorisation DPHM manquante)", author: "Admin", createdAt: "2026-03-07T10:00:00" }], plan: "Standard", planPrice: 79, billing: "monthly" },
    { id: "kyc-5", userId: "usr-9", entityType: "doctor", entityName: "Dr. Sami Trabelsi", specialty: "Généraliste", activity: "generaliste", city: "Sfax", email: "sami@email.tn", phone: "+216 74 111 222", submittedAt: "2026-03-01T09:00:00", status: "approved", currentStep: "activated", stuckDays: 0, lastActivity: "2026-03-02", docs: ["Diplôme", "CIN"], events: [{ id: "e7", type: "submitted", text: "Dossier soumis", author: "Dr. Sami Trabelsi", createdAt: "2026-03-01T09:00:00" }, { id: "e8", type: "approved", text: "Dossier approuvé — Tous les documents conformes", author: "Admin", createdAt: "2026-03-02T14:00:00" }], plan: "Pro", planPrice: 149, billing: "yearly" },
    { id: "kyc-6", entityType: "lab", entityName: "Labo XYZ", specialty: "Analyses", activity: "laboratory", city: "Tunis", email: "xyz@lab.tn", phone: "+216 71 999 000", submittedAt: "2026-02-25T10:00:00", status: "rejected", currentStep: "kyc_submitted", stuckDays: 0, lastActivity: "2026-03-05", docs: ["Document incomplet"], events: [{ id: "e9", type: "submitted", text: "Dossier soumis avec 1 document", author: "Labo XYZ", createdAt: "2026-02-25T10:00:00" }, { id: "e10", type: "docs_requested", text: "Documents complémentaires demandés (autorisation, RC)", author: "Admin", createdAt: "2026-02-26T09:00:00" }, { id: "e11", type: "rejected", text: "Dossier refusé — Aucun complément reçu après relance", author: "Admin", createdAt: "2026-03-05T16:00:00" }], plan: "Standard", planPrice: 79, billing: "monthly" },
    // Funnel tracking records
    { id: "kyc-7", entityType: "doctor", entityName: "Dr. Salah Zouari", specialty: "Médecine interne", activity: "specialiste", city: "Tunis", email: "salah@email.tn", phone: "+216 71 222 333", submittedAt: "2026-03-05T10:00:00", status: "pending", currentStep: "docs_uploaded", stuckDays: 5, lastActivity: "2026-03-07", docs: ["Diplôme"], events: [], plan: "Pro", planPrice: 169, billing: "yearly" },
    { id: "kyc-8", entityType: "doctor", entityName: "Dr. Leila Mansouri", specialty: "Pédiatre", activity: "specialiste", city: "Ariana", email: "leila@email.tn", phone: "+216 71 444 555", submittedAt: "2026-03-08T10:00:00", status: "pending", currentStep: "started", stuckDays: 2, lastActivity: "2026-03-08", docs: [], events: [] },
    { id: "kyc-9", entityType: "pharmacy", entityName: "Pharmacie Riadh", specialty: "Officine", activity: "pharmacy", city: "Sfax", email: "riadh@pharmacy.tn", phone: "+216 74 222 333", submittedAt: "2026-03-06T10:00:00", status: "pending", currentStep: "plan_chosen", stuckDays: 4, lastActivity: "2026-03-08", docs: ["Licence"], events: [], plan: "Standard", planPrice: 79, billing: "monthly" },
  ],

  // ═══════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════
  subscriptions: [
    { id: "sub-1", userId: "usr-1", organizationId: "org-1", doctorName: "Dr. Ahmed Bouazizi", plan: "Pro", monthlyPrice: 129, status: "active", startDate: "2025-01-15", renewalDate: "2026-04-15", history: [{ date: "2025-01-15", event: "Souscription initiale Pro" }] },
    { id: "sub-2", userId: "usr-9", doctorName: "Dr. Sami Trabelsi", plan: "Pro", monthlyPrice: 149, status: "active", startDate: "2025-03-02", renewalDate: "2026-03-02", promoName: "Early Bird", promoDiscount: 20, history: [{ date: "2025-03-02", event: "Souscription initiale Pro avec promo Early Bird" }] },
    { id: "sub-3", userId: "usr-3", organizationId: "org-5", doctorName: "Pharmacie El Manar", plan: "Standard", monthlyPrice: 79, status: "active", startDate: "2024-06-01", renewalDate: "2026-06-01", history: [{ date: "2024-06-01", event: "Souscription Standard" }] },
    { id: "sub-4", userId: "usr-4", organizationId: "org-4", doctorName: "Labo BioSanté", plan: "Pro", monthlyPrice: 149, status: "expired", startDate: "2025-06-01", renewalDate: "2026-02-01", history: [{ date: "2025-06-01", event: "Souscription Pro" }, { date: "2026-02-01", event: "Expiré — Renouvellement non effectué" }] },
    { id: "sub-5", userId: "usr-5", doctorName: "Dr. Karim Bouzid", plan: "Pro", monthlyPrice: 169, status: "trial", startDate: "2026-03-08", renewalDate: "2026-04-08", history: [{ date: "2026-03-08", event: "Période d'essai 30j" }] },
  ],

  // ═══════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════
  payments: [
    { id: "pay-1", type: "subscription", amount: 129, currency: "DT", status: "paid", createdAt: "2026-03-08", payerName: "Dr. Ahmed Bouazizi", payerEmail: "ahmed@email.tn", payerId: "usr-1", subscriptionId: "sub-1", organizationId: "org-1", method: "Carte bancaire", reference: "SUB-20260308-001" },
    { id: "pay-2", type: "teleconsult", amount: 35, currency: "DT", status: "paid", createdAt: "2026-03-07", payerName: "Fatma Trabelsi", payerEmail: "fatma@email.tn", payerId: "usr-2", method: "Carte bancaire", reference: "TC-20260307-042" },
    { id: "pay-3", type: "subscription", amount: 49, currency: "DT", status: "pending", createdAt: "2026-03-06", payerName: "Dr. Sonia Gharbi", payerEmail: "sonia@email.tn", method: "Virement", reference: "SUB-20260306-003" },
    { id: "pay-4", type: "teleconsult", amount: 60, currency: "DT", status: "failed", createdAt: "2026-03-05", payerName: "Ali Ben Salem", payerEmail: "ali@email.tn", payerId: "usr-10", method: "Carte bancaire", reference: "TC-20260305-018" },
    { id: "pay-5", type: "subscription", amount: 129, currency: "DT", status: "refunded", createdAt: "2026-03-03", payerName: "Dr. Khaled Hammami", payerEmail: "khaled@email.tn", method: "Carte bancaire", reference: "SUB-20260303-002" },
    { id: "pay-6", type: "teleconsult", amount: 35, currency: "DT", status: "paid", createdAt: "2026-03-02", payerName: "Sarra Mejri", payerEmail: "sarra@email.tn", payerId: "usr-11", method: "Carte bancaire", reference: "TC-20260302-007" },
    { id: "pay-7", type: "subscription", amount: 129, currency: "DT", status: "paid", createdAt: "2026-03-01", payerName: "Dr. Nadia Hamdi", payerEmail: "nadia@email.tn", payerId: "usr-6", method: "Carte bancaire", reference: "SUB-20260301-005" },
    { id: "pay-8", type: "teleconsult", amount: 45, currency: "DT", status: "paid", createdAt: "2026-02-28", payerName: "Mohamed Kaabi", payerEmail: "mohamed@email.tn", payerId: "usr-12", method: "Carte bancaire", reference: "TC-20260228-033" },
  ],

  // ═══════════════════════════════════════════
  // SUPPORT TICKETS
  // ═══════════════════════════════════════════
  tickets: [
    { id: "tk-1", subject: "Impossible d'annuler un RDV", category: "rdv", priority: "high", status: "open", requester: "Fatma Trabelsi", requesterId: "usr-2", requesterRole: "patient", assignedTo: "", createdAt: "20 Fév 2026", slaDeadline: "2h", conversation: [{ id: "tk1-m1", sender: "user", senderName: "Fatma Trabelsi", text: "Bonjour, impossible d'annuler un rdv. Merci de m'aider.", time: "20 Fév 2026 09:15" }] },
    { id: "tk-2", subject: "Problème de facturation abonnement Pro", category: "facturation", priority: "medium", status: "open", requester: "Dr. Sonia Gharbi", requesterRole: "doctor", assignedTo: "Support L1", createdAt: "19 Fév 2026", slaDeadline: "8h", conversation: [{ id: "tk2-m1", sender: "user", senderName: "Dr. Sonia Gharbi", text: "Bonjour, problème de facturation abonnement pro. Merci de m'aider.", time: "19 Fév 2026 09:15" }, { id: "tk2-m2", sender: "admin", senderName: "Support L1", text: "Nous vérifions votre dossier.", time: "19 Fév 2026 10:00" }] },
    { id: "tk-3", subject: "Bug affichage ordonnances", category: "technique", priority: "low", status: "closed", requester: "Pharmacie El Manar", requesterId: "usr-3", requesterRole: "pharmacy", assignedTo: "Support L2", createdAt: "17 Fév 2026", slaDeadline: "24h", conversation: [{ id: "tk3-m1", sender: "user", senderName: "Pharmacie El Manar", text: "Bonjour, bug affichage ordonnances. Merci de m'aider.", time: "17 Fév 2026 09:15" }, { id: "tk3-m2", sender: "admin", senderName: "Support L2", text: "Votre demande a été traitée.", time: "17 Fév 2026 10:30" }] },
    { id: "tk-4", subject: "Demande suppression de compte", category: "compte", priority: "medium", status: "open", requester: "Ali Ben Salem", requesterId: "usr-10", requesterRole: "patient", assignedTo: "", createdAt: "18 Fév 2026", slaDeadline: "8h", conversation: [{ id: "tk4-m1", sender: "user", senderName: "Ali Ben Salem", text: "Bonjour, demande suppression de compte. Merci de m'aider.", time: "18 Fév 2026 09:15" }] },
    { id: "tk-5", subject: "Erreur upload résultats PDF", category: "technique", priority: "high", status: "open", requester: "Labo BioSanté", requesterId: "usr-4", requesterRole: "laboratory", assignedTo: "", createdAt: "20 Fév 2026", slaDeadline: "2h", conversation: [{ id: "tk5-m1", sender: "user", senderName: "Labo BioSanté", text: "Bonjour, erreur upload résultats pdf. Merci de m'aider.", time: "20 Fév 2026 09:15" }] },
  ],

  // ═══════════════════════════════════════════
  // DISPUTES
  // ═══════════════════════════════════════════
  disputes: [
    { id: "disp-1", subject: "Consultation annulée sans remboursement", category: "paiement", priority: "high", status: "open", patientName: "Fatma Trabelsi", patientId: "usr-2", doctorName: "Dr. Bouazizi", doctorId: "usr-1", paymentId: "pay-2", createdAt: "2026-03-07T10:00:00", updatedAt: "2026-03-08T14:30:00", messages: [{ id: "m1", author: "Fatma Trabelsi", authorRole: "patient", text: "Le médecin a annulé ma téléconsultation et je n'ai pas été remboursée.", createdAt: "2026-03-07T10:00:00" }, { id: "m2", author: "Dr. Bouazizi", authorRole: "doctor", text: "J'ai eu une urgence. Le remboursement devrait être automatique.", createdAt: "2026-03-07T14:20:00" }] },
    { id: "disp-2", subject: "Retard de 45 minutes sans information", category: "rdv", priority: "medium", status: "investigating", patientName: "Ali Ben Salem", patientId: "usr-10", doctorName: "Dr. Gharbi", createdAt: "2026-03-06T16:00:00", updatedAt: "2026-03-07T11:00:00", messages: [{ id: "m4", author: "Ali Ben Salem", authorRole: "patient", text: "J'ai attendu 45 minutes sans information.", createdAt: "2026-03-06T16:00:00" }, { id: "m5", author: "Admin", authorRole: "admin", text: "Nous avons contacté le cabinet. Enquête en cours.", createdAt: "2026-03-07T11:00:00" }] },
    { id: "disp-3", subject: "Erreur de prescription signalée", category: "autre", priority: "high", status: "open", patientName: "Sarra Mejri", patientId: "usr-11", doctorName: "Dr. Hammami", createdAt: "2026-03-08T08:00:00", updatedAt: "2026-03-08T08:00:00", messages: [{ id: "m6", author: "Sarra Mejri", authorRole: "patient", text: "Le pharmacien dit que le dosage est anormalement élevé.", createdAt: "2026-03-08T08:00:00" }] },
  ],

  // ═══════════════════════════════════════════
  // MODERATION REPORTS
  // ═══════════════════════════════════════════
  moderationReports: [
    { id: "mod-1", type: "profil", reason: "Profil médecin non vérifié", reporter: "Système auto", reporterRole: "system", target: "Dr. Fathi Mejri", targetRole: "doctor", date: "08 Mar 2026", priority: "high", status: "pending", details: "Compte créé il y a 3 jours avec 15 consultations. Diplôme suspect.", evidence: ["Capture d'écran", "Diplôme (PDF)"], notes: [{ id: "n1", author: "Système", text: "Alerte automatique", type: "note", createdAt: "2026-03-08T08:00:00" }] },
    { id: "mod-2", type: "comportement", reason: "Comportement inapproprié en téléconsultation", reporter: "Fatma Trabelsi", reporterRole: "patient", target: "Dr. Inconnu", targetRole: "doctor", date: "07 Mar 2026", priority: "medium", status: "pending", details: "Remarques déplacées et raccroché avant la fin.", evidence: ["Témoignage patient"], notes: [] },
    { id: "mod-3", type: "contenu", reason: "Photo de profil inappropriée", reporter: "Système auto", reporterRole: "system", target: "Utilisateur #4521", targetRole: "patient", date: "05 Mar 2026", priority: "low", status: "resolved", details: "Image non-médicale détectée.", evidence: ["Image signalée"], notes: [{ id: "n2", author: "Admin", text: "Photo retirée", type: "action", createdAt: "2026-03-06T10:00:00" }] },
    { id: "mod-4", type: "avis", reason: "Avis diffamatoire sur un médecin", reporter: "Dr. Bouazizi", reporterRole: "doctor", target: "Avis #7832", targetRole: "review", date: "06 Mar 2026", priority: "medium", status: "pending", details: "Propos diffamatoires. L'auteur n'a jamais consulté.", evidence: ["Texte de l'avis"], notes: [] },
    { id: "mod-5", type: "fraude", reason: "Suspicion de faux profil pharmacie", reporter: "Système auto", reporterRole: "system", target: "Pharmacie Fictive", targetRole: "pharmacy", date: "09 Mar 2026", priority: "high", status: "pending", details: "Licence DPHM inexistante.", evidence: ["Licence (PDF)"], notes: [] },
  ],

  // ═══════════════════════════════════════════
  // CAMPAIGNS
  // ═══════════════════════════════════════════
  campaigns: [
    { id: "c-1", title: "Mise à jour conditions", target: "all", channel: "email", message: "Nos conditions d'utilisation ont été mises à jour.", status: "sent", sentAt: "15 Fév 2026", recipientCount: 12458, openRate: 42, clickRate: 12, deliveryRate: 98 },
    { id: "c-2", title: "Rappel vaccin grippe", target: "patients", channel: "sms", message: "Pensez à vous faire vacciner contre la grippe saisonnière.", status: "sent", sentAt: "10 Fév 2026", recipientCount: 8500, segmentCity: "Tunis", openRate: 68, clickRate: 18, deliveryRate: 96 },
    { id: "c-3", title: "Nouvelle fonctionnalité téléconsultation", target: "doctors", channel: "push", message: "La téléconsultation est maintenant disponible.", status: "sent", sentAt: "5 Fév 2026", recipientCount: 1245, openRate: 55, clickRate: 22, deliveryRate: 99 },
    { id: "c-4", title: "Promotion printemps médecins", target: "doctors", channel: "email", message: "Profitez de 3 mois offerts sur votre abonnement Pro !", status: "scheduled", scheduledAt: "15 Mar 2026 09:00", recipientCount: 1245, segmentSpecialty: "Généraliste" },
    { id: "c-5", title: "Rappel analyse en attente", target: "patients", channel: "sms", message: "Vous avez des résultats d'analyses en attente.", status: "draft", recipientCount: 3200 },
  ],

  // ═══════════════════════════════════════════
  // NOTIFICATION TEMPLATES
  // ═══════════════════════════════════════════
  notificationTemplates: [
    { id: "tpl-1", name: "RDV confirmé", channel: "sms", subject: "", body: "Votre RDV avec {{doctor_name}} est confirmé le {{date}} à {{time}}. — Medicare.tn", variables: ["doctor_name", "date", "time"], active: true, lastModified: "08 Mar 2026", usageCount: 4521 },
    { id: "tpl-2", name: "Rappel RDV", channel: "sms", subject: "", body: "Rappel : RDV demain à {{time}} avec {{doctor_name}}. Adresse : {{address}}.", variables: ["doctor_name", "time", "address"], active: true, lastModified: "07 Mar 2026", usageCount: 8900 },
    { id: "tpl-3", name: "Validation professionnelle", channel: "email", subject: "Votre compte Medicare a été validé", body: "Bonjour {{name}},\n\nVotre compte professionnel Medicare a été validé.\n\nCordialement,\nL'équipe Medicare.tn", variables: ["name"], active: true, lastModified: "05 Mar 2026", usageCount: 342 },
    { id: "tpl-4", name: "Résultat disponible", channel: "sms", subject: "", body: "Vos résultats d'analyses sont disponibles sur Medicare.tn.", variables: [], active: true, lastModified: "01 Mar 2026", usageCount: 1200 },
    { id: "tpl-5", name: "Bienvenue patient", channel: "email", subject: "Bienvenue sur Medicare", body: "Bonjour {{name}},\n\nBienvenue sur Medicare.tn !\nPrenez votre premier RDV en quelques clics.\n\nCordialement,\nL'équipe Medicare", variables: ["name"], active: true, lastModified: "28 Fév 2026", usageCount: 8500 },
    { id: "tpl-6", name: "OTP Connexion", channel: "sms", subject: "", body: "Votre code de connexion Medicare est : {{code}}. Valable 5 minutes.", variables: ["code"], active: true, lastModified: "01 Mar 2026", usageCount: 15000 },
    { id: "tpl-7", name: "Ordonnance disponible", channel: "push", subject: "Ordonnance prête", body: "Votre ordonnance de {{doctor_name}} est disponible.", variables: ["doctor_name"], active: true, lastModified: "06 Mar 2026", usageCount: 2100 },
    { id: "tpl-8", name: "Paiement reçu", channel: "email", subject: "Confirmation de paiement", body: "Bonjour {{name}},\n\nNous confirmons la réception de votre paiement de {{amount}} DT.\n\nRéférence : {{reference}}\n\nCordialement,\nMedicare.tn", variables: ["name", "amount", "reference"], active: true, lastModified: "05 Mar 2026", usageCount: 1800 },
    { id: "tpl-9", name: "RDV annulé", channel: "sms", subject: "", body: "Votre RDV du {{date}} avec {{doctor_name}} a été annulé.", variables: ["date", "doctor_name"], active: false, lastModified: "01 Mar 2026", usageCount: 450 },
  ],

  // ═══════════════════════════════════════════
  // CONTENT PAGES
  // ═══════════════════════════════════════════
  contentPages: [
    { id: "cp-1", title: "Conditions Générales d'Utilisation", type: "legal", status: "published", lastModified: "2026-02-15", content: "Les présentes CGU régissent l'utilisation de la plateforme Medicare..." },
    { id: "cp-2", title: "Politique de Confidentialité", type: "legal", status: "published", lastModified: "2026-02-10", content: "Medicare s'engage à protéger la vie privée des utilisateurs..." },
    { id: "cp-3", title: "Politique de Cookies", type: "legal", status: "published", lastModified: "2026-01-20", content: "Nous utilisons des cookies pour améliorer votre expérience..." },
    { id: "cp-4", title: "Comment prendre un rendez-vous ?", type: "faq", status: "published", lastModified: "2026-03-01", content: "Recherchez un médecin, choisissez un créneau et confirmez..." },
    { id: "cp-5", title: "Comment annuler un rendez-vous ?", type: "faq", status: "published", lastModified: "2026-03-01", content: "Allez dans Mes RDV, cliquez sur le RDV et sélectionnez Annuler..." },
    { id: "cp-6", title: "Maintenance prévue le 15 mars", type: "announcement", status: "draft", lastModified: "2026-03-08", content: "Une maintenance est prévue le 15 mars de 2h à 4h du matin." },
    { id: "cp-7", title: "Bannière promo : -20% premier mois", type: "banner", status: "published", lastModified: "2026-03-05", content: "Offre spéciale : -20% sur votre premier mois d'abonnement Pro !" },
  ],

  // ═══════════════════════════════════════════
  // API KEYS & WEBHOOKS
  // ═══════════════════════════════════════════
  apiKeys: [
    { id: "ak-1", name: "Production - App Mobile", key: "mk_live_4f8a9b2c3d1e5f6g7h8i9j0k", status: "active", quotaUsed: 12450, quotaMax: 50000, lastUsed: "Il y a 2 min", createdAt: "Jan 2026" },
    { id: "ak-2", name: "Staging - Tests", key: "mk_test_1a2b3c4d5e6f7g8h9i0j1k2l", status: "active", quotaUsed: 3200, quotaMax: 10000, lastUsed: "Il y a 1h", createdAt: "Fév 2026" },
    { id: "ak-3", name: "Ancien partenaire", key: "mk_live_old_9z8y7x6w5v4u3t2s1r0q", status: "revoked", quotaUsed: 0, quotaMax: 50000, lastUsed: "15 Jan 2026", createdAt: "Nov 2025" },
  ],
  webhooks: [
    { id: "wh-1", url: "https://api.partenaire.tn/webhooks/appointments", events: ["appointment.created", "appointment.cancelled"], status: "active", lastTriggered: "Il y a 5 min", failCount: 0 },
    { id: "wh-2", url: "https://crm.clinique-tunis.tn/api/hooks", events: ["patient.registered", "consultation.completed"], status: "active", lastTriggered: "Il y a 30 min", failCount: 2 },
    { id: "wh-3", url: "https://old-system.tn/webhook", events: ["prescription.created"], status: "failing", lastTriggered: "Il y a 3j", failCount: 15 },
  ],

  // ═══════════════════════════════════════════
  // COMPLIANCE / RGPD
  // ═══════════════════════════════════════════
  dataRequests: [
    { id: "dr-1", type: "export", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", userId: "usr-2", userRole: "patient", reason: "Je souhaite obtenir une copie de toutes mes données personnelles", status: "pending", createdAt: "2026-03-08T10:00:00" },
    { id: "dr-2", type: "delete", userName: "Ali Ben Salem", userEmail: "ali@email.tn", userId: "usr-10", userRole: "patient", reason: "Suppression complète de mon compte et données associées", status: "processing", createdAt: "2026-03-06T14:00:00" },
    { id: "dr-3", type: "rectify", userName: "Dr. Karim Bouzid", userEmail: "karim@email.tn", userId: "usr-5", userRole: "doctor", reason: "Correction de mon adresse professionnelle", status: "completed", createdAt: "2026-03-01T09:00:00", processedAt: "2026-03-02T11:00:00", processedBy: "Admin" },
    { id: "dr-4", type: "access", userName: "Sarra Mejri", userEmail: "sarra@email.tn", userId: "usr-11", userRole: "patient", reason: "Consultation de l'historique de mes consentements", status: "completed", createdAt: "2026-02-28T16:00:00", processedAt: "2026-03-01T10:00:00", processedBy: "Admin" },
    { id: "dr-5", type: "export", userName: "Mohamed Kaabi", userEmail: "mohamed@email.tn", userId: "usr-12", userRole: "patient", reason: "Portabilité des données vers un autre prestataire", status: "pending", createdAt: "2026-03-09T08:30:00" },
    { id: "dr-6", type: "delete", userName: "Labo XYZ", userEmail: "xyz@lab.tn", userRole: "laboratory", reason: "Fermeture définitive du compte laboratoire", status: "rejected", createdAt: "2026-02-20T11:00:00", processedAt: "2026-02-22T09:00:00", processedBy: "Admin", notes: "Données médicales en cours de traitement" },
  ],
  consentLogs: [
    { id: "cl-1", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", consentType: "Cookies analytiques", action: "granted", timestamp: "2026-03-08T10:00:00", ip: "196.203.45.12" },
    { id: "cl-2", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", consentType: "Notifications marketing", action: "revoked", timestamp: "2026-03-07T15:00:00", ip: "196.203.45.12" },
    { id: "cl-3", userName: "Ali Ben Salem", userEmail: "ali@email.tn", consentType: "Partage données avec labos", action: "granted", timestamp: "2026-03-06T09:00:00", ip: "197.15.22.45" },
    { id: "cl-4", userName: "Dr. Bouazizi", userEmail: "ahmed@email.tn", consentType: "CGU v2.4", action: "granted", timestamp: "2026-03-05T08:00:00", ip: "196.203.78.90" },
    { id: "cl-5", userName: "Sarra Mejri", userEmail: "sarra@email.tn", consentType: "Cookies analytiques", action: "revoked", timestamp: "2026-03-04T12:00:00", ip: "41.226.55.77" },
    { id: "cl-6", userName: "Mohamed Kaabi", userEmail: "mohamed@email.tn", consentType: "CGU v2.4", action: "granted", timestamp: "2026-03-03T14:00:00", ip: "197.15.33.44" },
    { id: "cl-7", userName: "Pharmacie El Amal", userEmail: "elamal@pharmacy.tn", consentType: "Conditions partenaires", action: "granted", timestamp: "2026-03-02T11:00:00", ip: "197.15.11.22" },
    { id: "cl-8", userName: "Ali Ben Salem", userEmail: "ali@email.tn", consentType: "Notifications SMS", action: "granted", timestamp: "2026-03-01T09:00:00", ip: "197.15.22.45" },
  ],
  retentionPolicies: [
    { id: "rp-1", dataType: "Sessions utilisateurs", description: "Tokens de session et logs de connexion", retentionDays: 30, autoDelete: true, lastPurge: "2026-03-07" },
    { id: "rp-2", dataType: "Logs d'audit", description: "Actions administratives et modifications", retentionDays: 365, autoDelete: true, lastPurge: "2026-03-01" },
    { id: "rp-3", dataType: "Dossiers médicaux", description: "Consultations, prescriptions, résultats", retentionDays: 3650, autoDelete: false },
    { id: "rp-4", dataType: "Messages archivés", description: "Conversations patient-médecin terminées", retentionDays: 730, autoDelete: true, lastPurge: "2026-02-15" },
    { id: "rp-5", dataType: "Fichiers temporaires", description: "Uploads en attente, brouillons", retentionDays: 7, autoDelete: true, lastPurge: "2026-03-09" },
    { id: "rp-6", dataType: "Consentements", description: "Historique des acceptations/révocations", retentionDays: 1825, autoDelete: false },
    { id: "rp-7", dataType: "Comptes supprimés", description: "Données anonymisées post-suppression", retentionDays: 90, autoDelete: true, lastPurge: "2026-02-28" },
  ],

  // ═══════════════════════════════════════════
  // IAM
  // ═══════════════════════════════════════════
  adminAccounts: [
    { id: "adm-1", name: "Mohamed Karoui", email: "m.karoui@medicare.tn", role: "superadmin", status: "active", lastLogin: "09 Mar 2026, 08:30", createdAt: "Jan 2025" },
    { id: "adm-2", name: "Sonia Trabelsi", email: "s.trabelsi@medicare.tn", role: "support", status: "active", lastLogin: "08 Mar 2026, 17:45", createdAt: "Mar 2025" },
    { id: "adm-3", name: "Karim Bouzid", email: "k.bouzid@medicare.tn", role: "verification", status: "active", lastLogin: "09 Mar 2026, 09:15", createdAt: "Jun 2025" },
    { id: "adm-4", name: "Nadia Hamdi", email: "n.hamdi@medicare.tn", role: "finance", status: "active", lastLogin: "07 Mar 2026, 14:20", createdAt: "Sep 2025" },
    { id: "adm-5", name: "Ali Sfar", email: "a.sfar@medicare.tn", role: "moderation", status: "suspended", lastLogin: "01 Mar 2026, 11:00", createdAt: "Nov 2025" },
  ],

  // ═══════════════════════════════════════════
  // GUARD PHARMACIES
  // ═══════════════════════════════════════════
  guardPharmacies: [
    { id: "gph-1", name: "Pharmacie El Manar", city: "Tunis", address: "12 Ave Habib Bourguiba", phone: "+216 71 555 666", isGuard: false },
    { id: "gph-2", name: "Pharmacie El Amal", city: "Sousse", address: "45 Rue de la Liberté", phone: "+216 73 222 333", isGuard: true },
    { id: "gph-3", name: "Pharmacie Centrale", city: "Tunis", address: "8 Rue Charles de Gaulle", phone: "+216 71 888 999", isGuard: false },
    { id: "gph-4", name: "Pharmacie Ibn Sina", city: "Ariana", address: "22 Ave de la République", phone: "+216 71 444 555", isGuard: true },
    { id: "gph-5", name: "Pharmacie Pasteur", city: "Sfax", address: "3 Rue Pasteur", phone: "+216 74 111 222", isGuard: false },
    { id: "gph-6", name: "Pharmacie El Fath", city: "Sousse", address: "67 Ave Farhat Hached", phone: "+216 73 333 444", isGuard: false },
  ],

  // ═══════════════════════════════════════════
  // SETTINGS (use defaults)
  // ═══════════════════════════════════════════
  settings: {
    platformName: "Medicare.tn",
    supportEmail: "support@medicare.tn",
    supportPhone: "+216 71 000 000",
    maxFileSize: "10",
    autoApprovePatients: true,
    defaultLanguage: "fr",
    timezone: "Africa/Tunis",
    termsUrl: "https://medicare.tn/legal/cgu",
    privacyUrl: "https://medicare.tn/legal/privacy",
    maintenanceMode: false,
    maintenanceMessage: "La plateforme est en maintenance. Nous serons de retour très bientôt.",
    features: {
      teleconsultation: true, aiAssistant: true, pharmacyGuard: true,
      labDemands: true, prescriptionSendPharmacy: true, prescriptionSendLab: true,
      patientMessaging: false, textReviews: true, medicinesDirectory: true,
      patientChat: false, onlinePayment: true, appointmentReminder: true,
      disputeReporting: true, commentReporting: true,
    },
    notifConfig: {
      rdvReminder: true, rdvReminderDelay: "24", rdvConfirmation: true,
      prescriptionReady: true, labResultReady: true, accountApproved: true,
      paymentReceipt: true, weeklyReport: false, marketingConsent: true,
    },
    security: {
      otpCooldown: "60", otpMaxRetries: "5", sessionTimeout: "30",
      twoFactor: false, passwordMinLength: "8", loginAttempts: "5", lockoutDuration: "15",
    },
    emailConfig: {
      smtpHost: "smtp.medicare.tn", smtpPort: "587", smtpUser: "noreply@medicare.tn",
      smtpTls: true, fromName: "Medicare.tn", fromEmail: "noreply@medicare.tn", replyTo: "support@medicare.tn",
    },
    smsConfig: { provider: "tunisie_telecom", senderId: "MEDICARE", enabled: true, rateLimit: "100" },
    pushConfig: { enabled: true },
  },
};
