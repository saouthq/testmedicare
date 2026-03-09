import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsGrid from "@/components/shared/StatsGrid";
import { mockHospitalDepartments, mockHospitalPatients, mockHospitalStaff, mockHospitalEquipment } from "@/data/mocks/hospital";
import { Building2, Users, Bed, AlertTriangle, Activity, HeartPulse, Stethoscope, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const HospitalDashboard = () => {
  const totalBeds = mockHospitalDepartments.reduce((a, d) => a + d.totalBeds, 0);
  const occupiedBeds = mockHospitalDepartments.reduce((a, d) => a + d.occupiedBeds, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const icuPatients = mockHospitalPatients.filter(p => p.status === "icu").length;
  const onDutyStaff = mockHospitalStaff.filter(s => s.shift !== "off").length;
  const pendingAdmissions = mockHospitalPatients.filter(p => p.status === "pending_admission").length;
  const equipmentIssues = mockHospitalEquipment.filter(e => e.status !== "operational").length;

  const items = [
    { label: "Taux d'occupation", value: `${occupancyRate}%`, icon: Bed },
    { label: "Patients hospitalisés", value: String(mockHospitalPatients.filter(p => p.status === "hospitalized" || p.status === "icu").length), icon: Users },
    { label: "Patients Réa/USI", value: String(icuPatients), icon: HeartPulse },
    { label: "Personnel en service", value: String(onDutyStaff), icon: Stethoscope },
  ];

  return (
    <DashboardLayout role="hospital" title="Tableau de bord – Hôpital">
      <div className="space-y-6">
        <StatsGrid items={items} />

        {/* Alerts */}
        {(pendingAdmissions > 0 || equipmentIssues > 0 || occupancyRate > 85) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {occupancyRate > 85 && (
              <Card className="p-4 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" /> Occupation élevée ({occupancyRate}%)
                </div>
                <p className="text-xs text-muted-foreground mt-1">Le taux d'occupation dépasse 85%. Envisagez des sorties anticipées.</p>
              </Card>
            )}
            {pendingAdmissions > 0 && (
              <Card className="p-4 border-orange-400/30 bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                  <Activity className="h-4 w-4" /> {pendingAdmissions} admission(s) en attente
                </div>
                <p className="text-xs text-muted-foreground mt-1">Des patients attendent leur admission dans un service.</p>
              </Card>
            )}
            {equipmentIssues > 0 && (
              <Card className="p-4 border-orange-500/30 bg-orange-500/5">
                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                  <Wrench className="h-4 w-4" /> {equipmentIssues} équipement(s) en alerte
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maintenance requise ou hors service.</p>
              </Card>
            )}
          </div>
        )}

        {/* Departments overview */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Services – Occupation</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mockHospitalDepartments.map(dep => {
              const rate = Math.round((dep.occupiedBeds / dep.totalBeds) * 100);
              return (
                <Card key={dep.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium truncate">{dep.name}</h3>
                    <Badge variant={dep.status === "active" ? "secondary" : "destructive"} className="text-[10px]">
                      {dep.status === "active" ? "Actif" : "Maintenance"}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className="text-lg font-bold">{dep.occupiedBeds}</span>
                    <span className="text-xs text-muted-foreground">/ {dep.totalBeds} lits</span>
                  </div>
                  <Progress value={rate} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground mt-1.5">{dep.staff} personnel · Chef: {dep.head.split(" ").slice(-1)}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent patients */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Patients récents</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-3">Patient</th><th className="text-left p-3">Service</th><th className="text-left p-3">Chambre</th><th className="text-left p-3">Diagnostic</th><th className="text-left p-3">Statut</th>
                </tr></thead>
                <tbody>
                  {mockHospitalPatients.filter(p => p.status !== "discharged").slice(0, 6).map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.department}</td>
                      <td className="p-3 text-muted-foreground">{p.roomNumber}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">{p.diagnosis}</td>
                      <td className="p-3">
                        <Badge variant={p.status === "icu" ? "destructive" : "secondary"} className="text-[10px]">
                          {p.status === "icu" ? "Réa" : p.status === "observation" ? "Observation" : p.status === "pending_admission" ? "En attente" : "Hospitalisé"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HospitalDashboard;
