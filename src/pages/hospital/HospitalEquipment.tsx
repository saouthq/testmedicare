import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockHospitalEquipment, type HospitalEquipment } from "@/data/mocks/hospital";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  operational: { label: "Opérationnel", variant: "secondary", icon: CheckCircle },
  maintenance: { label: "En maintenance", variant: "outline", icon: Wrench },
  out_of_service: { label: "Hors service", variant: "destructive", icon: XCircle },
  reserved: { label: "Réservé", variant: "default", icon: AlertTriangle },
};

const HospitalEquipment = () => {
  const [equipment, setEquipment] = useState(mockHospitalEquipment);

  const toggleStatus = (id: string, newStatus: HospitalEquipment["status"]) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    toast({ title: "Statut mis à jour" });
  };

  return (
    <DashboardLayout role="hospital" title="Équipements">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>✅ {equipment.filter(e => e.status === "operational").length} opérationnels</span>
          <span>🔧 {equipment.filter(e => e.status === "maintenance").length} en maintenance</span>
          <span>❌ {equipment.filter(e => e.status === "out_of_service").length} hors service</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map(eq => {
            const cfg = statusConfig[eq.status];
            const Icon = cfg.icon;
            return (
              <Card key={eq.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{eq.name}</h3>
                  <Badge variant={cfg.variant} className="text-[10px] shrink-0"><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{eq.department} · S/N: {eq.serialNumber}</p>
                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  <p>Dernière maintenance: {eq.lastMaintenance}</p>
                  <p>Prochaine: {eq.nextMaintenance}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  {eq.status === "operational" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => toggleStatus(eq.id, "maintenance")}><Wrench className="h-3 w-3 mr-1" />Maintenance</Button>}
                  {eq.status === "maintenance" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => toggleStatus(eq.id, "operational")}><CheckCircle className="h-3 w-3 mr-1" />Remettre en service</Button>}
                  {eq.status === "out_of_service" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => toggleStatus(eq.id, "maintenance")}><Wrench className="h-3 w-3 mr-1" />Envoyer en maintenance</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HospitalEquipment;
