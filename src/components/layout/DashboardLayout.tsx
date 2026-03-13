import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/stores/notificationsStore";
import { useAppMode } from "@/stores/authStore";
import { useSharedPatients } from "@/stores/sharedPatientsStore";
import NotificationCenter from "@/components/shared/NotificationCenter";
import AdminSpotlight from "@/components/admin/AdminSpotlight";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { sidebarFeatureMap, blurredFeatures } from "@/hooks/useFeatureGating";
import { getEnabledFeatures } from "@/stores/featureMatrixStore";
import { useAdminModules, isSidebarUrlEnabled, getDisabledModuleForRoute } from "@/stores/adminModulesStore";
import { isSidebarItemVisible } from "@/stores/sidebarVisibilityStore";
import { getSpecialtyConfig } from "@/components/consultation/specialtyConfig";
import { Lock, Power, Crown, UserCog, Flag as FlagIcon, Zap } from "lucide-react";
import {
  Stethoscope, ShieldCheck, CreditCard, Flag, BarChart3, LayoutDashboard,
  Calendar, Users, Search, FileText, Settings, LogOut, Bell, Pill,
  FlaskConical, ClipboardList, Clock, UserCircle, Building2, Menu, X,
  Activity, ScrollText, MessageSquare, Plug, Banknote, Bot, Gavel, Send,
  Video, CalendarDays, FileDown, Key, Star, BookOpen,
  ChevronLeft, ChevronRight, ChevronDown, PanelLeftClose, PanelLeft, Pin, PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

/** Small badge showing current app mode */
function ModeBadge() {
  const [mode] = useAppMode();
  if (mode === "production") {
    return (
      <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-2 py-0.5 text-[9px] font-semibold text-accent uppercase tracking-wider">
        🔗 Production
      </span>
    );
  }
  return (
    <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
      🎭 Démo
    </span>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin" | "hospital" | "clinic";
  title: string;
}

const navItems: Record<string, NavItem[]> = {
  patient: [
    { title: "Tableau de bord", url: "/dashboard/patient", icon: LayoutDashboard },
    { title: "Mes rendez-vous", url: "/dashboard/patient/appointments", icon: Calendar },
    { title: "Prendre RDV", url: "/search", icon: Search },
    { title: "Mon espace santé", url: "/dashboard/patient/health", icon: Activity },
    { title: "Ordonnances", url: "/dashboard/patient/prescriptions", icon: FileText },
    { title: "Assistant IA", url: "/dashboard/patient/health?section=ai", icon: Bot },
    { title: "Messagerie", url: "/dashboard/patient/messages", icon: MessageSquare },
    { title: "Notifications", url: "/dashboard/patient/notifications", icon: Bell },
  ],
  doctor: [
    { title: "Tableau de bord", url: "/dashboard/doctor", icon: LayoutDashboard },
    { title: "Planning", url: "/dashboard/doctor/schedule", icon: Calendar },
    { title: "Salle d'attente", url: "/dashboard/doctor/waiting-room", icon: Clock },
    { title: "Mes patients", url: "/dashboard/doctor/patients", icon: Users },
    { title: "Consultations", url: "/dashboard/doctor/consultations", icon: ClipboardList },
    { title: "Facturation", url: "/dashboard/doctor/billing", icon: Banknote },
    { title: "Tarifs & Actes", url: "/dashboard/doctor/tarifs", icon: CreditCard },
    { title: "Secrétaires", url: "/dashboard/doctor/secretary", icon: Building2 },
    { title: "Documents", url: "/dashboard/doctor/documents", icon: FileDown },
    { title: "Congés", url: "/dashboard/doctor/leaves", icon: CalendarDays },
    { title: "Messagerie", url: "/dashboard/doctor/messages", icon: MessageSquare },
    
    { title: "Assistant IA", url: "/dashboard/doctor/ai-assistant", icon: Bot },
    { title: "Protocoles", url: "/dashboard/doctor/protocols", icon: BookOpen },
    { title: "Connect", url: "/dashboard/doctor/connect", icon: Plug },
    { title: "Statistiques", url: "/dashboard/doctor/stats", icon: BarChart3 },
  ],
  pharmacy: [
    { title: "Tableau de bord", url: "/dashboard/pharmacy", icon: LayoutDashboard },
    { title: "Ordonnances", url: "/dashboard/pharmacy/prescriptions", icon: FileText },
    { title: "Stock", url: "/dashboard/pharmacy/stock", icon: Pill },
    { title: "Mes patients", url: "/dashboard/pharmacy/patients", icon: Users },
    { title: "Historique", url: "/dashboard/pharmacy/history", icon: Clock },
    { title: "Connect", url: "/dashboard/pharmacy/connect", icon: Plug },
    { title: "Messagerie", url: "/dashboard/pharmacy/messages", icon: MessageSquare },
  ],
  laboratory: [
    { title: "Tableau de bord", url: "/dashboard/laboratory", icon: LayoutDashboard },
    { title: "Analyses", url: "/dashboard/laboratory/analyses", icon: FlaskConical },
    { title: "Résultats", url: "/dashboard/laboratory/results", icon: ClipboardList },
    { title: "Patients", url: "/dashboard/laboratory/patients", icon: Users },
    { title: "Qualité & Conformité", url: "/dashboard/laboratory/quality", icon: ShieldCheck },
    { title: "Statistiques", url: "/dashboard/laboratory/reporting", icon: BarChart3 },
    { title: "Messagerie", url: "/dashboard/laboratory/messages", icon: MessageSquare },
  ],
  secretary: [
    { title: "Tableau de bord", url: "/dashboard/secretary", icon: LayoutDashboard },
    { title: "Agenda", url: "/dashboard/secretary/agenda", icon: Calendar },
    { title: "Patients", url: "/dashboard/secretary/patients", icon: Users },
    { title: "Journal d'appels", url: "/dashboard/secretary/call-log", icon: Activity },
    { title: "SMS & Rappels", url: "/dashboard/secretary/sms", icon: Send },
    { title: "Facturation", url: "/dashboard/secretary/billing", icon: CreditCard },
    { title: "Cabinet", url: "/dashboard/secretary/office", icon: Building2 },
    { title: "Documents", url: "/dashboard/secretary/documents", icon: ScrollText },
    { title: "Statistiques", url: "/dashboard/secretary/stats", icon: BarChart3 },
    { title: "Messagerie", url: "/dashboard/secretary/messages", icon: MessageSquare },
  ],
  hospital: [
    { title: "Tableau de bord", url: "/dashboard/hospital", icon: LayoutDashboard },
    { title: "Services", url: "/dashboard/hospital/departments", icon: Building2 },
    { title: "Patients", url: "/dashboard/hospital/patients", icon: Users },
    { title: "Personnel", url: "/dashboard/hospital/staff", icon: Stethoscope },
    { title: "Équipements", url: "/dashboard/hospital/equipment", icon: Activity },
    { title: "Messagerie", url: "/dashboard/hospital/messages", icon: MessageSquare },
  ],
  clinic: [
    { title: "Tableau de bord", url: "/dashboard/clinic", icon: LayoutDashboard },
    { title: "Médecins", url: "/dashboard/clinic/doctors", icon: Stethoscope },
    { title: "Rendez-vous", url: "/dashboard/clinic/appointments", icon: Calendar },
    { title: "Salles", url: "/dashboard/clinic/rooms", icon: Building2 },
    { title: "Messagerie", url: "/dashboard/clinic/messages", icon: MessageSquare },
  ],
};

const adminSections: NavSection[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { title: "Tableau de bord", url: "/dashboard/admin", icon: LayoutDashboard },
      { title: "Analytiques", url: "/dashboard/admin/analytics", icon: BarChart3 },
      { title: "Onboarding Funnel", url: "/dashboard/admin/onboarding", icon: Users },
      { title: "Rapports & Exports", url: "/dashboard/admin/reports", icon: FileDown },
    ],
  },
  {
    label: "Utilisateurs",
    items: [
      { title: "Utilisateurs", url: "/dashboard/admin/users", icon: Users },
      { title: "Organisations", url: "/dashboard/admin/organizations", icon: Building2 },
      { title: "Validations KYC", url: "/dashboard/admin/verifications", icon: ShieldCheck },
      { title: "Gestion Admin (IAM)", url: "/dashboard/admin/iam", icon: ShieldCheck },
    ],
  },
  {
    label: "Opérations",
    items: [
      { title: "Supervision RDV", url: "/dashboard/admin/appointments", icon: Calendar },
      { title: "Centre de résolution", url: "/dashboard/admin/resolution", icon: Gavel },
      { title: "Pharmacies de garde", url: "/dashboard/admin/guard-pharmacies", icon: Pill },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Plans & Tarifs", url: "/dashboard/admin/plans", icon: Crown },
      { title: "Abonnements", url: "/dashboard/admin/subscriptions", icon: CreditCard },
      { title: "Paiements", url: "/dashboard/admin/payments", icon: Banknote },
      { title: "Promotions", url: "/dashboard/admin/promotions", icon: CreditCard },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Fonctionnalités", url: "/dashboard/admin/configuration", icon: Power },
      { title: "Spécialités & Référentiels", url: "/dashboard/admin/specialties", icon: Stethoscope },
      { title: "Données de référence", url: "/dashboard/admin/reference-data", icon: Activity },
      { title: "Matrice Features", url: "/dashboard/admin/feature-matrix", icon: FlagIcon },
      { title: "Overrides", url: "/dashboard/admin/overrides", icon: UserCog },
      { title: "Centre d'actions", url: "/dashboard/admin/actions", icon: Zap },
      { title: "Sidebar", url: "/dashboard/admin/sidebar-config", icon: UserCog },
    ],
  },
  {
    label: "Contenu & Comm.",
    items: [
      { title: "Notifications & Emails", url: "/dashboard/admin/email-config", icon: MessageSquare },
      { title: "Templates Notifs", url: "/dashboard/admin/notification-templates", icon: Bell },
      { title: "Pages & Contenu", url: "/dashboard/admin/content", icon: ScrollText },
      { title: "Campagnes", url: "/dashboard/admin/campaigns", icon: Bell },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "RGPD & Conformité", url: "/dashboard/admin/compliance", icon: ShieldCheck },
      { title: "Journaux", url: "/dashboard/admin/logs", icon: Activity },
      { title: "API & Partenaires", url: "/dashboard/admin/api-partners", icon: Key },
      { title: "Paramètres", url: "/dashboard/admin/settings", icon: Settings },
    ],
  },
];

const roleLabels: Record<string, string> = {
  patient: "Patient",
  doctor: "Médecin",
  pharmacy: "Pharmacie",
  laboratory: "Laboratoire",
  secretary: "Secrétaire",
  admin: "Administrateur",
  hospital: "Hôpital",
  clinic: "Clinique",
};

const SIDEBAR_PINNED_KEY = "medicare_sidebar_pinned";

const DashboardLayout = ({ children, role, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const items = navItems[role];
  const [moduleStates] = useAdminModules();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_PINNED_KEY) === "true"; } catch { return true; }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Persist pin state
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_PINNED_KEY, String(pinned)); } catch {}
  }, [pinned]);

  // Cmd+K for admin
  useEffect(() => {
    if (role !== "admin") return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [role]);

  const { notifications: crossNotifs } = useNotifications(role);
  const unreadCount = crossNotifs.filter((n) => !n.read).length;
  const [patients] = useSharedPatients();

  const userInitials = useMemo(() => {
    if (role === "doctor") return "AB";
    if (role === "patient") return patients[0]?.avatar || "AB";
    if (role === "secretary") return "LH";
    if (role === "pharmacy") return "PH";
    if (role === "laboratory") return "LB";
    if (role === "admin") return "AD";
    return role.slice(0, 2).toUpperCase();
  }, [role, patients]);

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-expand the section containing the active route
  useEffect(() => {
    if (role !== "admin") return;
    for (const section of adminSections) {
      if (section.items.some(i => location.pathname === i.url)) {
        setCollapsedSections(prev => ({ ...prev, [section.label]: false }));
        break;
      }
    }
  }, [location.pathname, role]);

  /** Render admin sidebar with collapsible sections */
  const renderAdminNav = () => (
    <>
      {adminSections.map((section) => {
        const isCollapsed = collapsedSections[section.label] ?? false;
        const hasActive = section.items.some(i => location.pathname === i.url);
        return (
          <div key={section.label} className="mb-0.5">
            <button
              onClick={() => toggleSection(section.label)}
              className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors rounded-md ${
                hasActive ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <span>{section.label}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
            </button>
            {!isCollapsed && section.items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors whitespace-nowrap active-scale mx-1 ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );

  /** Render standard sidebar nav */
  const [doctorSub] = useDoctorSubscription();
  const doctorEnabledIds = useMemo(() => {
    if (role !== "doctor") return new Set<string>();
    return new Set(getEnabledFeatures(doctorSub.activity, doctorSub.plan, doctorSub.specialty).map(f => f.id));
  }, [role, doctorSub]);

  const specConfig = useMemo(() => {
    if (role !== "doctor") return null;
    try {
      return getSpecialtyConfig(doctorSub.activity, doctorSub.specialty);
    } catch { return null; }
  }, [role, doctorSub]);

  const renderStandardNav = () => (
    <>
      {(items || []).map((item) => {
        const isActive = location.pathname === item.url;
        if (role !== "admin" && !isSidebarUrlEnabled(item.url)) return null;
        if (role !== "admin" && !isSidebarItemVisible(role, item.url, role === "doctor" ? doctorSub.specialty : undefined)) return null;
        if (role === "doctor" && specConfig?.sidebarHidden?.includes(item.url)) return null;
        const requiredFeature = role === "doctor" ? sidebarFeatureMap[item.url] : undefined;
        const isLocked = requiredFeature ? !doctorEnabledIds.has(requiredFeature) : false;
        const isBlurred = requiredFeature ? blurredFeatures.has(requiredFeature) : false;
        if (isLocked && !isBlurred) return null;
        const displayTitle = (role === "doctor" && specConfig?.sidebarLabels?.[item.url]) || item.title;

        return (
          <Link
            key={item.url}
            to={isLocked ? "#" : item.url}
            onClick={(e) => {
              if (isLocked) {
                e.preventDefault();
                toast({ title: "Fonctionnalité Pro", description: "Passez au plan supérieur pour débloquer cette fonctionnalité." });
                return;
              }
              setMobileOpen(false);
            }}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors whitespace-nowrap active-scale ${
              isLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 ${isLocked ? "opacity-40" : ""}`} />
            <span>{displayTitle}</span>
            {isLocked && <Lock className="h-3 w-3 text-muted-foreground/50 ml-auto shrink-0" />}
          </Link>
        );
      })}
    </>
  );

  const sidebarWidth = pinned ? "w-56" : "w-0 lg:w-0";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 border-r bg-card flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${pinned ? "lg:w-56" : "lg:w-0 lg:border-0"}
          ${mobileOpen ? "w-56" : "w-0 border-0"}
          lg:sticky lg:top-0 lg:h-screen lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-2.5 shrink-0 justify-between min-w-[14rem]">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-foreground whitespace-nowrap">Medicare</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPinned(false)}
              className="hidden lg:flex h-7 w-7 rounded-md items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Replier la sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
            <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 px-1.5 py-1.5 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin min-w-[14rem]">
          {role === "admin" ? renderAdminNav() : renderStandardNav()}
        </nav>

        {/* Footer */}
        <div className="border-t px-1.5 py-2 space-y-0.5 shrink-0 min-w-[14rem]">
          {role !== "admin" && (
            <Link
              to={`/dashboard/${role}/settings`}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap active-scale"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Paramètres</span>
            </Link>
          )}
          <button
            onClick={async () => {
              const { logout } = await import("@/stores/authStore");
              await logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap active-scale w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 glass-header px-4 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button className="lg:hidden text-muted-foreground active-scale p-1" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop: show sidebar toggle when unpinned */}
            {!pinned && (
              <button
                onClick={() => setPinned(true)}
                className="hidden lg:flex h-8 w-8 rounded-lg items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Afficher la sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">{title}</h1>
            <ModeBadge />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Admin spotlight trigger */}
            {role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSpotlightOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Actions</span>
                <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
              </Button>
            )}
            {role === "admin" && (
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden h-9 w-9"
                onClick={() => setSpotlightOpen(true)}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {role === "patient" ? (
              <Link to="/dashboard/patient/notifications" className="relative">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center animate-scale-in">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            ) : (
              <button className="relative" onClick={() => setNotifOpen(true)}>
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                  <span>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center animate-scale-in">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                </Button>
              </button>
            )}
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium shadow-sm">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 pb-safe">
          {role !== "admin" && getDisabledModuleForRoute(location.pathname) ? (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Power className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Module désactivé</h2>
                <p className="text-muted-foreground mb-1">
                  Le module <span className="font-semibold text-foreground">« {getDisabledModuleForRoute(location.pathname)?.label} »</span> est temporairement désactivé par l'administrateur.
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-6">{getDisabledModuleForRoute(location.pathname)?.description}</p>
                <Link to={`/dashboard/${role}`}>
                  <Button variant="outline" size="sm">Retour au tableau de bord</Button>
                </Link>
              </div>
            </div>
          ) : children}
        </main>
      </div>

      {/* Notification Center drawer */}
      <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} role={role} />

      {/* Admin Spotlight */}
      {role === "admin" && (
        <AdminSpotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
