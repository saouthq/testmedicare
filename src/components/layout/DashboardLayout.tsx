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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    { title: "Prendre RDV", url: "/dashboard/patient/search", icon: Search },
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
    { title: "Messagerie", url: "/dashboard/doctor/messages", icon: MessageSquare },
    { title: "Secrétaires", url: "/dashboard/doctor/secretary", icon: Building2 },
    { title: "Statistiques", url: "/dashboard/doctor/stats", icon: BarChart3 },
    { title: "Abonnement", url: "/dashboard/doctor/subscription", icon: CreditCard },
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MediConnect</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="rounded-lg bg-secondary px-3 py-2">
            <p className="text-xs text-muted-foreground">Connecté en tant que</p>
            <p className="text-sm font-medium text-secondary-foreground">{roleLabels[role]}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-1">
          <Link
            to={`/dashboard/${role}/settings`}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
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
