import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockHospitalDepartments, type HospitalDepartment } from "@/data/mocks/hospital";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Bed, Users, Wrench } from "lucide-react";

const HospitalDepartments = () => {
  const [departments, setDepartments] = useState(mockHospitalDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHead, setNewHead] = useState("");
  const [newBeds, setNewBeds] = useState("20");

  const toggleMaintenance = (id: string) => {
    setDepartments(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === "maintenance" ? "active" as const : "maintenance" as const } : d
    ));
    toast({ title: "Statut mis à jour" });
  };

  const addDepartment = () => {
    if (!newName.trim()) return;
    const dep: HospitalDepartment = {
      id: `dep-${Date.now()}`, name: newName, head: newHead || "—",
      totalBeds: parseInt(newBeds) || 20, occupiedBeds: 0, staff: 0, status: "active",
    };
    setDepartments(prev => [...prev, dep]);
    setDialogOpen(false);
    setNewName(""); setNewHead(""); setNewBeds("20");
    toast({ title: "Service ajouté", description: dep.name });
  };

  return (
    <DashboardLayout role="hospital" title="Services">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{departments.length} services</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />Ajouter un service</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map(dep => {
            const rate = Math.round((dep.occupiedBeds / dep.totalBeds) * 100);
            return (
              <Card key={dep.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{dep.name}</h3>
                  <Badge variant={dep.status === "active" ? "secondary" : "destructive"} className="text-[10px]">
                    {dep.status === "active" ? "Actif" : "Maintenance"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Chef: {dep.head}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs"><Bed className="h-3.5 w-3.5" />{dep.occupiedBeds}/{dep.totalBeds} lits occupés</div>
                  <Progress value={rate} className="h-1.5" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{dep.staff} personnel</div>
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full text-xs" onClick={() => toggleMaintenance(dep.id)}>
                  <Wrench className="h-3.5 w-3.5 mr-1" />{dep.status === "maintenance" ? "Remettre en service" : "Mettre en maintenance"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Nouveau service</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label>Nom</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Oncologie" className="mt-1" /></div>
            <div><Label>Chef de service</Label><Input value={newHead} onChange={e => setNewHead(e.target.value)} placeholder="Pr. ..." className="mt-1" /></div>
            <div><Label>Nombre de lits</Label><Input type="number" value={newBeds} onChange={e => setNewBeds(e.target.value)} className="mt-1" /></div>
            <Button onClick={addDepartment} className="w-full">Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HospitalDepartments;
