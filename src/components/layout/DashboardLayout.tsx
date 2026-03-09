import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { mockNotifications, mockDoctorProfile, mockPatients } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/stores/notificationsStore";
import NotificationCenter from "@/components/shared/NotificationCenter";
import AdminSpotlight from "@/components/admin/AdminSpotlight";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { sidebarFeatureMap, blurredFeatures } from "@/hooks/useFeatureGating";
import { getEnabledFeatures } from "@/stores/featureMatrixStore";
import { useAdminModules, isSidebarUrlEnabled, getDisabledModuleForRoute } from "@/stores/adminModulesStore";
import { Lock, Power } from "lucide-react";
import {
  Stethoscope, ShieldCheck, CreditCard, Flag, BarChart3, LayoutDashboard,
  Calendar, Users, Search, FileText, Settings, LogOut, Bell, Pill,
  FlaskConical, ClipboardList, Clock, UserCircle, Building2, Menu, X,
  Activity, ScrollText, MessageSquare, Plug, Banknote, Bot, Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

/** Admin sidebar sections for better organization */
interface NavSection {
  label: string;
  items: NavItem[];
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin";
  title: string;
}

const navItems: Record<string, NavItem[]> = {
  patient: [
    { title: "Tableau de bord", url: "/dashboard/patient", icon: LayoutDashboard },
    { title: "Mes rendez-vous", url: "/dashboard/patient/appointments", icon: Calendar },
    { title: "Prendre RDV", url: "/search", icon: Search },
    { title: "Mon espace santé", url: "/dashboard/patient/health", icon: Activity },
    { title: "Ordonnances", url: "/dashboard/patient/prescriptions", icon: FileText },
    { title: "Messagerie", url: "/dashboard/patient/messages", icon: MessageSquare },
    { title: "Notifications", url: "/dashboard/patient/notifications", icon: Bell },
  ],
  doctor: [
    { title: "Tableau de bord", url: "/dashboard/doctor", icon: LayoutDashboard },
    { title: "Planning", url: "/dashboard/doctor/schedule", icon: Calendar },
    { title: "Salle d'attente", url: "/dashboard/doctor/waiting-room", icon: Clock },
    { title: "Mes patients", url: "/dashboard/doctor/patients", icon: Users },
    { title: "Consultations", url: "/dashboard/doctor/consultations", icon: ClipboardList },
    { title: "Ordonnances", url: "/dashboard/doctor/prescriptions", icon: FileText },
    { title: "Facturation", url: "/dashboard/doctor/billing", icon: Banknote },
    { title: "Messagerie", url: "/dashboard/doctor/messages", icon: MessageSquare },
    { title: "Connect", url: "/dashboard/doctor/connect", icon: Plug },
    { title: "Assistant IA", url: "/dashboard/doctor/ai-assistant", icon: Bot },
    { title: "Secrétaires", url: "/dashboard/doctor/secretary", icon: Building2 },
    { title: "Statistiques", url: "/dashboard/doctor/stats", icon: BarChart3 },
  ],
  pharmacy: [
    { title: "Tableau de bord", url: "/dashboard/pharmacy", icon: LayoutDashboard },
    { title: "Ordonnances", url: "/dashboard/pharmacy/prescriptions", icon: FileText },
    { title: "Stock", url: "/dashboard/pharmacy/stock", icon: Pill },
    { title: "Historique", url: "/dashboard/pharmacy/history", icon: Clock },
    { title: "Messagerie", url: "/dashboard/pharmacy/messages", icon: MessageSquare },
  ],
  laboratory: [
    { title: "Tableau de bord", url: "/dashboard/laboratory", icon: LayoutDashboard },
    { title: "Analyses", url: "/dashboard/laboratory/analyses", icon: FlaskConical },
    { title: "Résultats", url: "/dashboard/laboratory/results", icon: ClipboardList },
    { title: "Patients", url: "/dashboard/laboratory/patients", icon: Users },
    { title: "Messagerie", url: "/dashboard/laboratory/messages", icon: MessageSquare },
  ],
  secretary: [
    { title: "Tableau de bord", url: "/dashboard/secretary", icon: LayoutDashboard },
    { title: "Agenda", url: "/dashboard/secretary/agenda", icon: Calendar },
    { title: "Patients", url: "/dashboard/secretary/patients", icon: Users },
    { title: "Facturation", url: "/dashboard/secretary/billing", icon: CreditCard },
    { title: "Cabinet", url: "/dashboard/secretary/office", icon: Building2 },
    { title: "Documents", url: "/dashboard/secretary/documents", icon: ScrollText },
    { title: "Messagerie", url: "/dashboard/secretary/messages", icon: MessageSquare },
  ],
};

/**
 * Admin nav grouped by sections for clarity and scalability
 */
const adminSections: NavSection[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { title: "Tableau de bord", url: "/dashboard/admin", icon: LayoutDashboard },
      { title: "Analytiques", url: "/dashboard/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Gouvernance",
    items: [
      { title: "Gestion Admin", url: "/dashboard/admin/iam", icon: ShieldCheck },
      { title: "Utilisateurs", url: "/dashboard/admin/users", icon: Users },
      { title: "Organisations", url: "/dashboard/admin/organizations", icon: Building2 },
      { title: "Validations KYC", url: "/dashboard/admin/verifications", icon: ShieldCheck },
    ],
  },
  {
    label: "Opérations",
    items: [
      { title: "Supervision RDV", url: "/dashboard/admin/appointments", icon: Calendar },
      { title: "Litiges", url: "/dashboard/admin/disputes", icon: Gavel },
      { title: "Pharmacies garde", url: "/dashboard/admin/guard-pharmacies", icon: Pill },
      { title: "Support", url: "/dashboard/admin/support", icon: MessageSquare },
      { title: "Modération", url: "/dashboard/admin/moderation", icon: Flag },
    ],
  },
  {
    label: "Finance & Offres",
    items: [
      { title: "Abonnements", url: "/dashboard/admin/subscriptions", icon: CreditCard },
      { title: "Matrice fonctionnalités", url: "/dashboard/admin/feature-matrix", icon: Activity },
      { title: "Paiements", url: "/dashboard/admin/payments", icon: Banknote },
      { title: "Promotions", url: "/dashboard/admin/promotions", icon: CreditCard },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Modules plateforme", url: "/dashboard/admin/modules", icon: Power },
      { title: "Campagnes", url: "/dashboard/admin/campaigns", icon: Bell },
      { title: "Templates notifs", url: "/dashboard/admin/notification-templates", icon: Bell },
      { title: "Référentiels", url: "/dashboard/admin/reference-data", icon: ClipboardList },
      { title: "Audit logs", url: "/dashboard/admin/audit-logs", icon: ScrollText },
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
};

const DashboardLayout = ({ children, role, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const items = navItems[role];
  const [moduleStates] = useAdminModules();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  // Global Cmd+K shortcut for admin spotlight
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

  const expanded = pinned || hovered || sidebarOpen;

  // Cross-role notifications count
  const { notifications: crossNotifs } = useNotifications(role);
  const crossUnread = crossNotifs.filter((n) => !n.read).length;
  const mockUnread = useMemo(() => mockNotifications.filter(n => !n.read).length, []);
  const unreadCount = crossUnread + mockUnread;

  const userInitials = useMemo(() => {
    if (role === "doctor") return mockDoctorProfile.initials;
    if (role === "patient") return mockPatients[0]?.avatar || "AB";
    return role.slice(0, 2).toUpperCase();
  }, [role]);

  /** Render admin sidebar with grouped sections */
  const renderAdminNav = () => (
    <>
      {adminSections.map((section) => (
        <div key={section.label} className="mb-1">
          {/* Section label — visible only when expanded */}
          <div className={`px-3 pt-3 pb-1 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden pt-1 pb-0"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.label}
            </p>
          </div>
          {!expanded && <div className="h-px bg-border mx-2 my-1" />}
          {section.items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                title={!expanded ? item.title : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors whitespace-nowrap active-scale mx-1 ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  /** Render standard sidebar nav — with feature gating for doctor */
  const [doctorSub] = useDoctorSubscription();
  const doctorEnabledIds = useMemo(() => {
    if (role !== "doctor") return new Set<string>();
    return new Set(getEnabledFeatures(doctorSub.activity, doctorSub.plan, doctorSub.specialty).map(f => f.id));
  }, [role, doctorSub]);

  const renderStandardNav = () => (
    <>
      {(items || []).map((item) => {
        const isActive = location.pathname === item.url;
        // Admin module gating — hide sidebar items for disabled modules
        if (role !== "admin" && !isSidebarUrlEnabled(item.url)) return null;
        // Feature gating for doctor subscription
        const requiredFeature = role === "doctor" ? sidebarFeatureMap[item.url] : undefined;
        const isLocked = requiredFeature ? !doctorEnabledIds.has(requiredFeature) : false;
        const isBlurred = requiredFeature ? blurredFeatures.has(requiredFeature) : false;

        // Hidden features (not blurred) - don't show in sidebar
        if (isLocked && !isBlurred) return null;

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
              setSidebarOpen(false);
            }}
            title={!expanded ? item.title : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors whitespace-nowrap active-scale ${
              isLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 ${isLocked ? "opacity-40" : ""}`} />
            <span className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
              {item.title}
            </span>
            {isLocked && expanded && <Lock className="h-3 w-3 text-muted-foreground/50 ml-auto shrink-0" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Toggle button when sidebar is hidden */}
      {hidden && (
        <button
          onClick={() => setHidden(false)}
          className="fixed top-4 left-3 z-50 h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
          title="Afficher la sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Sidebar */}
      {!hidden && (
        <aside
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`
            fixed inset-y-0 left-0 z-50 border-r bg-card flex flex-col
            transition-all duration-300 ease-in-out overflow-x-hidden
            ${expanded ? "w-56" : "w-[52px]"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
            ${sidebarOpen ? "translate-x-0 w-56" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Header */}
          <div className="flex h-14 items-center border-b px-2.5 shrink-0 justify-between">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                <Stethoscope className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className={`font-bold text-sm text-foreground whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                Medicare
              </span>
            </Link>
            <div className={`flex items-center gap-1 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
              <button
                onClick={() => setHidden(true)}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Masquer la sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 min-h-0 px-1.5 py-1.5 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin">
            {role === "admin" ? renderAdminNav() : renderStandardNav()}
          </nav>

          {/* Footer — hide settings link for admin (already in nav) */}
          <div className="border-t px-1.5 py-2 space-y-0.5 shrink-0 flex-shrink-0">
            {role !== "admin" && (
              <Link
                to={`/dashboard/${role}/settings`}
                title={!expanded ? "Paramètres" : undefined}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap active-scale"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>Paramètres</span>
              </Link>
            )}
            <Link
              to="/login"
              title={!expanded ? "Déconnexion" : undefined}
              onClick={() => localStorage.removeItem("userRole")}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap active-scale"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>Déconnexion</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 glass-header px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground active-scale p-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">{title}</h1>
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

        {/* Page content — with admin module gating */}
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
