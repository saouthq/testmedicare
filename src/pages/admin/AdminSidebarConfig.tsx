/**
 * AdminSidebarConfig — Admin page to toggle sidebar items per role & specialty.
 * Reads navItems from DashboardLayout config and uses sidebarVisibilityStore.
 *
 * // TODO BACKEND: Replace with GET/PUT /api/admin/sidebar-config
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  useSidebarVisibility,
  toggleSidebarItem,
  toggleSidebarItemBySpecialty,
  resetSidebarVisibility,
} from "@/stores/sidebarVisibilityStore";
import { Eye, EyeOff, RotateCcw, Shield, ChevronDown } from "lucide-react";

// ── Sidebar items by role (mirrored from DashboardLayout) ──
const sidebarItemsByRole: Record<string, { title: string; url: string }[]> = {
  patient: [
    { title: "Tableau de bord", url: "/dashboard/patient" },
    { title: "Mes rendez-vous", url: "/dashboard/patient/appointments" },
    { title: "Prendre RDV", url: "/search" },
    { title: "Mon espace santé", url: "/dashboard/patient/health" },
    { title: "Ordonnances", url: "/dashboard/patient/prescriptions" },
    { title: "Assistant IA", url: "/dashboard/patient/health?section=ai" },
    { title: "Messagerie", url: "/dashboard/patient/messages" },
    { title: "Notifications", url: "/dashboard/patient/notifications" },
  ],
  doctor: [
    { title: "Tableau de bord", url: "/dashboard/doctor" },
    { title: "Planning", url: "/dashboard/doctor/schedule" },
    { title: "Salle d'attente", url: "/dashboard/doctor/waiting-room" },
    { title: "Mes patients", url: "/dashboard/doctor/patients" },
    { title: "Consultations", url: "/dashboard/doctor/consultations" },
    { title: "Facturation", url: "/dashboard/doctor/billing" },
    { title: "Tarifs & Actes", url: "/dashboard/doctor/tarifs" },
    { title: "Secrétaires", url: "/dashboard/doctor/secretary" },
    { title: "Documents", url: "/dashboard/doctor/documents" },
    { title: "Congés", url: "/dashboard/doctor/leaves" },
    { title: "Messagerie", url: "/dashboard/doctor/messages" },
    { title: "Téléconsultation", url: "/dashboard/doctor/teleconsultation" },
    { title: "Assistant IA", url: "/dashboard/doctor/ai-assistant" },
    { title: "Protocoles", url: "/dashboard/doctor/protocols" },
    { title: "Connect", url: "/dashboard/doctor/connect" },
    { title: "Statistiques", url: "/dashboard/doctor/stats" },
  ],
  secretary: [
    { title: "Tableau de bord", url: "/dashboard/secretary" },
    { title: "Agenda", url: "/dashboard/secretary/agenda" },
    { title: "Patients", url: "/dashboard/secretary/patients" },
    { title: "Journal d'appels", url: "/dashboard/secretary/call-log" },
    { title: "SMS & Rappels", url: "/dashboard/secretary/sms" },
    { title: "Facturation", url: "/dashboard/secretary/billing" },
    { title: "Cabinet", url: "/dashboard/secretary/office" },
    { title: "Documents", url: "/dashboard/secretary/documents" },
    { title: "Statistiques", url: "/dashboard/secretary/stats" },
    { title: "Messagerie", url: "/dashboard/secretary/messages" },
  ],
  pharmacy: [
    { title: "Tableau de bord", url: "/dashboard/pharmacy" },
    { title: "Ordonnances", url: "/dashboard/pharmacy/prescriptions" },
    { title: "Stock", url: "/dashboard/pharmacy/stock" },
    { title: "Mes patients", url: "/dashboard/pharmacy/patients" },
    { title: "Historique", url: "/dashboard/pharmacy/history" },
    { title: "Connect", url: "/dashboard/pharmacy/connect" },
    { title: "Messagerie", url: "/dashboard/pharmacy/messages" },
  ],
  laboratory: [
    { title: "Tableau de bord", url: "/dashboard/laboratory" },
    { title: "Analyses", url: "/dashboard/laboratory/analyses" },
    { title: "Résultats", url: "/dashboard/laboratory/results" },
    { title: "Patients", url: "/dashboard/laboratory/patients" },
    { title: "Qualité & Conformité", url: "/dashboard/laboratory/quality" },
    { title: "Statistiques", url: "/dashboard/laboratory/reporting" },
    { title: "Messagerie", url: "/dashboard/laboratory/messages" },
  ],
  hospital: [
    { title: "Tableau de bord", url: "/dashboard/hospital" },
    { title: "Services", url: "/dashboard/hospital/departments" },
    { title: "Patients", url: "/dashboard/hospital/patients" },
    { title: "Personnel", url: "/dashboard/hospital/staff" },
    { title: "Équipements", url: "/dashboard/hospital/equipment" },
    { title: "Messagerie", url: "/dashboard/hospital/messages" },
  ],
  clinic: [
    { title: "Tableau de bord", url: "/dashboard/clinic" },
    { title: "Médecins", url: "/dashboard/clinic/doctors" },
    { title: "Rendez-vous", url: "/dashboard/clinic/appointments" },
    { title: "Salles", url: "/dashboard/clinic/rooms" },
    { title: "Messagerie", url: "/dashboard/clinic/messages" },
  ],
};

const roleLabels: Record<string, string> = {
  patient: "Patient",
  doctor: "Médecin",
  secretary: "Secrétaire",
  pharmacy: "Pharmacie",
  laboratory: "Laboratoire",
  hospital: "Hôpital",
  clinic: "Clinique",
};

const specialties = [
  "Cardiologue", "Dermatologue", "Gynécologue", "Ophtalmologue", "ORL",
  "Pédiatre", "Pneumologue", "Rhumatologue", "Urologue", "Neurologue",
];

const AdminSidebarConfig = () => {
  const [config] = useSidebarVisibility();
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const items = sidebarItemsByRole[selectedRole] || [];

  const getItemState = (url: string): boolean => {
    // Check specialty first
    if (selectedSpecialty && config.bySpecialty[selectedSpecialty]) {
      const v = config.bySpecialty[selectedSpecialty][url];
      if (v === false) return false;
    }
    // Check role
    if (config.byRole[selectedRole]) {
      const v = config.byRole[selectedRole][url];
      if (v === false) return false;
    }
    return true;
  };

  const handleToggle = (url: string, enabled: boolean) => {
    if (selectedSpecialty) {
      toggleSidebarItemBySpecialty(selectedSpecialty, url, enabled);
    } else {
      toggleSidebarItem(selectedRole, url, enabled);
    }
    toast({
      title: enabled ? "Élément activé" : "Élément désactivé",
      description: `${url} ${enabled ? "visible" : "masqué"} pour ${selectedSpecialty || roleLabels[selectedRole]}`,
    });
  };

  const handleReset = () => {
    resetSidebarVisibility();
    toast({ title: "Configuration réinitialisée", description: "Tous les éléments de sidebar sont à nouveau visibles." });
  };

  const disabledCount = items.filter(i => !getItemState(i.url)).length;

  return (
    <DashboardLayout role="admin" title="Configuration Sidebar">
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Contrôle de la navigation par rôle</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activez ou désactivez chaque entrée de la sidebar pour chaque rôle.
                Les changements prennent effet immédiatement.
              </p>
            </div>
          </div>
        </div>

        {/* Role selector */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(roleLabels).map(([role, label]) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setSelectedSpecialty(""); }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                selectedRole === role
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-primary/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Specialty filter (for doctor) */}
        {selectedRole === "doctor" && (
          <div>
            <button
              onClick={() => setShowSpecialties(!showSpecialties)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSpecialties ? "rotate-180" : ""}`} />
              Filtrer par spécialité (optionnel)
            </button>
            {showSpecialties && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  onClick={() => setSelectedSpecialty("")}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    !selectedSpecialty ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  Toutes spécialités
                </button>
                {specialties.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSpecialty(s)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      selectedSpecialty === s ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Items grid */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {roleLabels[selectedRole]} {selectedSpecialty && `— ${selectedSpecialty}`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {items.length} éléments · {disabledCount} désactivé{disabledCount > 1 ? "s" : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Réinitialiser
            </Button>
          </div>

          <div className="divide-y">
            {items.map(item => {
              const enabled = getItemState(item.url);
              return (
                <div
                  key={item.url}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    enabled ? "" : "bg-muted/20 opacity-70"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{item.url}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.url, !enabled)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      enabled
                        ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
                        : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    }`}
                  >
                    {enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {enabled ? "Visible" : "Masqué"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSidebarConfig;
