import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockClinicRooms, type ClinicRoom } from "@/data/mocks/clinic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { DoorOpen, Wrench, Sparkles, User } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  available: { label: "Libre", variant: "secondary", color: "text-green-600" },
  occupied: { label: "Occupée", variant: "default", color: "text-blue-600" },
  cleaning: { label: "Nettoyage", variant: "outline", color: "text-yellow-600" },
  maintenance: { label: "Maintenance", variant: "destructive", color: "text-red-600" },
};
const typeLabels: Record<string, string> = { consultation: "Consultation", surgery: "Bloc opératoire", examination: "Examen", waiting: "Salle d'attente", recovery: "Réveil" };

const ClinicRooms = () => {
  const [rooms, setRooms] = useState(mockClinicRooms);

  const setStatus = (id: string, status: ClinicRoom["status"]) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status, currentDoctor: status === "available" ? undefined : r.currentDoctor, currentPatient: status === "available" ? undefined : r.currentPatient } : r));
    toast({ title: `Salle: ${statusConfig[status].label}` });
  };

  return (
    <DashboardLayout role="clinic" title="Salles">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>🟢 {rooms.filter(r => r.status === "available").length} libres</span>
          <span>🔵 {rooms.filter(r => r.status === "occupied").length} occupées</span>
          <span>🟡 {rooms.filter(r => r.status === "cleaning").length} nettoyage</span>
          <span>🔴 {rooms.filter(r => r.status === "maintenance").length} maintenance</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map(r => {
            const cfg = statusConfig[r.status];
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DoorOpen className={`h-4 w-4 ${cfg.color}`} />
                    <h3 className="font-semibold text-sm">{r.name}</h3>
                  </div>
                  <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{typeLabels[r.type]} · Étage: {r.floor}</p>
                {r.currentDoctor && <p className="text-xs mt-1 flex items-center gap-1"><User className="h-3 w-3" />{r.currentDoctor}</p>}
                {r.currentPatient && <p className="text-xs text-muted-foreground">Patient: {r.currentPatient}</p>}
                <p className="text-[11px] text-muted-foreground mt-2">Équipement: {r.equipment.join(", ")}</p>
                <div className="flex gap-2 mt-3">
                  {r.status === "occupied" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => setStatus(r.id, "cleaning")}><Sparkles className="h-3 w-3 mr-1" />Libérer</Button>}
                  {r.status === "cleaning" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => setStatus(r.id, "available")}><DoorOpen className="h-3 w-3 mr-1" />Prête</Button>}
                  {r.status === "maintenance" && <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => setStatus(r.id, "available")}><Wrench className="h-3 w-3 mr-1" />Remettre en service</Button>}
                  {r.status === "available" && <Button size="sm" variant="ghost" className="text-xs h-7 flex-1" onClick={() => setStatus(r.id, "maintenance")}><Wrench className="h-3 w-3 mr-1" />Maintenance</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClinicRooms;
