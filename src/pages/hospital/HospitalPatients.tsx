import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockHospitalPatients, type HospitalPatient } from "@/data/mocks/hospital";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Search, UserPlus, LogOut as Discharge } from "lucide-react";

const statusLabels: Record<string, string> = {
  hospitalized: "Hospitalisé", icu: "Réanimation", observation: "Observation",
  pending_admission: "Admission en attente", discharged: "Sorti",
};
const statusVariant = (s: string) => s === "icu" ? "destructive" as const : s === "discharged" ? "outline" as const : "secondary" as const;

const HospitalPatients = () => {
  const [patients, setPatients] = useState(mockHospitalPatients);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.department.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "hospitalized") return p.status === "hospitalized" || p.status === "icu";
    if (tab === "pending") return p.status === "pending_admission";
    if (tab === "discharged") return p.status === "discharged";
    return true;
  });

  const admit = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: "hospitalized" as const, roomNumber: `R-${Math.floor(Math.random() * 300) + 100}`, admissionDate: new Date().toISOString().slice(0, 10) } : p));
    toast({ title: "Patient admis" });
  };

  const discharge = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status: "discharged" as const } : p));
    toast({ title: "Patient sorti" });
  };

  return (
    <DashboardLayout role="hospital" title="Patients">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher un patient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="all">Tous ({patients.length})</TabsTrigger><TabsTrigger value="hospitalized">Hospitalisés</TabsTrigger><TabsTrigger value="pending">En attente</TabsTrigger><TabsTrigger value="discharged">Sortis</TabsTrigger></TabsList>
        </Tabs>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-xs">
                <th className="text-left p-3">Patient</th><th className="text-left p-3">Âge</th><th className="text-left p-3">Service</th><th className="text-left p-3">Chambre</th><th className="text-left p-3">Diagnostic</th><th className="text-left p-3">Médecin</th><th className="text-left p-3">Statut</th><th className="text-left p-3">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.age}</td>
                    <td className="p-3 text-muted-foreground">{p.department}</td>
                    <td className="p-3 text-muted-foreground">{p.roomNumber}</td>
                    <td className="p-3 text-muted-foreground truncate max-w-[180px]">{p.diagnosis}</td>
                    <td className="p-3 text-muted-foreground">{p.doctor.split(" ").slice(-1)}</td>
                    <td className="p-3"><Badge variant={statusVariant(p.status)} className="text-[10px]">{statusLabels[p.status]}</Badge></td>
                    <td className="p-3">
                      {p.status === "pending_admission" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => admit(p.id)}><UserPlus className="h-3 w-3 mr-1" />Admettre</Button>}
                      {(p.status === "hospitalized" || p.status === "observation") && <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => discharge(p.id)}><Discharge className="h-3 w-3 mr-1" />Sortie</Button>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Aucun patient trouvé</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HospitalPatients;
