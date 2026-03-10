/**
 * AdminSpotlight — Cmd+K command palette for admin space
 * Centralized actions: navigate anywhere, act on users, subscriptions, KYC, settings
 * Uses the shared ActionPalette component
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActionPalette, { type ActionItem } from "@/components/shared/ActionPalette";
import {
  LayoutDashboard, Users, ShieldCheck, Building2, Calendar, Gavel, Pill,
  MessageSquare, Flag, CreditCard, Banknote, Bell, ClipboardList, ScrollText,
  Settings, BarChart3, Activity, Search, UserPlus, Ban, RefreshCw, Eye,
  FileText, Zap, Server, Gift, Mail, Download, Power, Crown, UserCog,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { appendLog } from "@/services/admin/adminAuditService";

interface AdminSpotlightProps {
  open: boolean;
  onClose: () => void;
}

const AdminSpotlight = ({ open, onClose }: AdminSpotlightProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Reset query on open
  useEffect(() => { if (open) setQuery(""); }, [open]);

  const go = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const actions: ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [
      // ── Navigation ──
      { id: "nav-dashboard", label: "Tableau de bord", hint: "Vue d'ensemble admin", icon: <LayoutDashboard className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin") },
      { id: "nav-analytics", label: "Analytiques", hint: "Graphiques & tendances", icon: <BarChart3 className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/analytics") },
      { id: "nav-users", label: "Utilisateurs", hint: "Gestion des comptes", icon: <Users className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/users") },
      { id: "nav-orgs", label: "Organisations", hint: "Cliniques, labos", icon: <Building2 className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/organizations") },
      { id: "nav-kyc", label: "Validations KYC", hint: "Dossiers en attente", icon: <ShieldCheck className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/verifications") },
      { id: "nav-iam", label: "Gestion Admin (IAM)", hint: "Rôles et permissions", icon: <ShieldCheck className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/iam") },
      { id: "nav-rdv", label: "Supervision RDV", hint: "Tous les rendez-vous", icon: <Calendar className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/appointments") },
      { id: "nav-disputes", label: "Litiges", hint: "Résolution de conflits", icon: <Gavel className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/disputes") },
      { id: "nav-guard", label: "Pharmacies de garde", hint: "Planning gardes", icon: <Pill className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/guard-pharmacies") },
      { id: "nav-support", label: "Support", hint: "Tickets & SAV", icon: <MessageSquare className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/support") },
      { id: "nav-moderation", label: "Modération", hint: "Signalements", icon: <Flag className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/moderation") },
      { id: "nav-subs", label: "Abonnements", hint: "Plans & facturation", icon: <CreditCard className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/subscriptions") },
      { id: "nav-matrix", label: "Matrice fonctionnalités", hint: "Features par plan/spécialité", icon: <Activity className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/feature-matrix") },
      { id: "nav-payments", label: "Paiements", hint: "Transactions & remboursements", icon: <Banknote className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/payments") },
      { id: "nav-promos", label: "Promotions", hint: "Offres & codes promo", icon: <Gift className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/promotions") },
      { id: "nav-campaigns", label: "Campagnes", hint: "Notifications push", icon: <Bell className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/campaigns") },
      { id: "nav-templates", label: "Templates notifs", hint: "Modèles de notifications", icon: <Bell className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/notification-templates") },
      { id: "nav-refs", label: "Référentiels", hint: "Spécialités, villes, assurances", icon: <ClipboardList className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/reference-data") },
      { id: "nav-audit", label: "Audit logs", hint: "Journal d'activité", icon: <ScrollText className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/audit-logs") },
      { id: "nav-settings", label: "Paramètres système", hint: "Feature flags, maintenance", icon: <Settings className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/settings") },
      { id: "nav-modules", label: "Modules plateforme", hint: "Activer/désactiver des modules globaux", icon: <Power className="h-4 w-4" />, group: "Navigation", onRun: () => go("/dashboard/admin/modules") },

      // ── Actions rapides ──
      { id: "act-approve-kyc", label: "Aller aux validations KYC en attente", hint: "Voir les dossiers à traiter", icon: <ShieldCheck className="h-4 w-4" />, group: "Actions rapides", onRun: () => go("/dashboard/admin/verifications") },
      { id: "act-suspend-user", label: "Suspendre un utilisateur", hint: "Rechercher et suspendre un compte", icon: <Ban className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/users"); toast({ title: "Sélectionnez un utilisateur à suspendre" }); } },
      { id: "act-create-promo", label: "Créer une promotion", hint: "Nouvelle offre ou code promo", icon: <Gift className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/promotions"); toast({ title: "Cliquez sur '+ Créer' pour une nouvelle promotion" }); } },
      { id: "act-export-users", label: "Exporter les utilisateurs (CSV)", hint: "Télécharger la liste complète", icon: <Download className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/users"); toast({ title: "Utilisez le bouton Export CSV sur la page Utilisateurs" }); } },
      { id: "act-send-campaign", label: "Envoyer une campagne", hint: "Notification push à un segment", icon: <Mail className="h-4 w-4" />, group: "Actions rapides", onRun: () => go("/dashboard/admin/campaigns") },
      { id: "act-toggle-maintenance", label: "Mode maintenance", hint: "Activer/désactiver la maintenance", icon: <Server className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/settings"); toast({ title: "Allez dans l'onglet Maintenance" }); } },
      { id: "act-toggle-feature", label: "Feature flags", hint: "Activer/désactiver une fonctionnalité", icon: <Zap className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/settings"); toast({ title: "Allez dans l'onglet Feature flags" }); } },
      { id: "act-view-audit", label: "Voir le dernier audit", hint: "Consulter les dernières actions", icon: <ScrollText className="h-4 w-4" />, group: "Actions rapides", onRun: () => go("/dashboard/admin/audit-logs") },
      { id: "act-change-plan", label: "Changer le plan d'un partenaire", hint: "Upgrade/downgrade d'abonnement", icon: <CreditCard className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/subscriptions"); toast({ title: "Cliquez sur la flèche ↑↓ pour changer de plan" }); } },
      { id: "act-refund", label: "Effectuer un remboursement", hint: "Rembourser une transaction", icon: <RefreshCw className="h-4 w-4" />, group: "Actions rapides", onRun: () => { go("/dashboard/admin/payments"); toast({ title: "Ouvrez une transaction et cliquez Rembourser" }); } },

      // ── Recherche ──
      { id: "search-user", label: "Rechercher un utilisateur", hint: "Par nom, email ou téléphone", icon: <Search className="h-4 w-4" />, group: "Recherche", onRun: () => go("/dashboard/admin/users") },
      { id: "search-rdv", label: "Rechercher un RDV", hint: "Par patient ou médecin", icon: <Search className="h-4 w-4" />, group: "Recherche", onRun: () => go("/dashboard/admin/appointments") },
      { id: "search-ticket", label: "Rechercher un ticket support", hint: "Par demandeur ou sujet", icon: <Search className="h-4 w-4" />, group: "Recherche", onRun: () => go("/dashboard/admin/support") },
    ];

    // Filter by query
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.hint || "").toLowerCase().includes(q) ||
      (a.group || "").toLowerCase().includes(q)
    );
  }, [query, go]);

  return (
    <ActionPalette
      open={open}
      onClose={onClose}
      actions={actions}
      placeholder="Rechercher une page, une action..."
      query={query}
      onQueryChange={setQuery}
      contextLabel="Admin"
    />
  );
};

export default AdminSpotlight;
