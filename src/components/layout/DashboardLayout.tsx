import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Stethoscope,
  ShieldCheck,
  CreditCard,
  Flag,
  BarChart3,
  LayoutDashboard,
  Calendar,
  Users,
  Search,
  FileText,
  Settings,
  LogOut,
  Bell,
  Pill,
  FlaskConical,
  ClipboardList,
  Clock,
  UserCircle,
  Building2,
  Menu,
  X,
  Activity,
  ScrollText,
  MessageSquare,
  Plug,
  Banknote,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: any;
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
  admin: [
    { title: "Tableau de bord", url: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Utilisateurs", url: "/dashboard/admin/users", icon: Users },
    { title: "Abonnements", url: "/dashboard/admin/subscriptions", icon: CreditCard },
    { title: "Modération", url: "/dashboard/admin/moderation", icon: Flag },
    { title: "Analytiques", url: "/dashboard/admin/analytics", icon: BarChart3 },
    { title: "Journal", url: "/dashboard/admin/logs", icon: ScrollText },
  ],
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);

  const expanded = pinned || hovered;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
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
            transition-all duration-300 ease-in-out overflow-hidden
            ${expanded ? "w-56" : "w-[52px]"}
            lg:translate-x-0 lg:static lg:z-auto
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
          <nav className="flex-1 px-1.5 py-1.5 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  title={!expanded ? item.title : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors whitespace-nowrap ${
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
          </nav>

          {/* Footer */}
          <div className="border-t px-1.5 py-2 space-y-0.5 shrink-0">
            <Link
              to={`/dashboard/${role}/settings`}
              title={!expanded ? "Paramètres" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>Paramètres</span>
            </Link>
            <Link
              to="/login"
              title={!expanded ? "Déconnexion" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap"
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/${role}/notifications`} className="relative">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>
            <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
              JD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
