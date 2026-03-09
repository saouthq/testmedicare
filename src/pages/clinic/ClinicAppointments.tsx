import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockClinicAppointments, type ClinicAppointment } from "@/data/mocks/clinic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Search, CheckCircle, Play, UserCheck } from "lucide-react";

const statusLabel: Record<string, string> = { scheduled: "Planifié", arrived: "Arrivé", in_progress: "En cours", completed: "Terminé", cancelled: "Annulé", no_show: "Absent" };
const statusVariant = (s: string) => s === "cancelled" || s === "no_show" ? "destructive" as const : s === "completed" ? "outline" as const : s === "in_progress" ? "default" as const : "secondary" as const;

const ClinicAppointments = () => {
  const [appointments, setAppointments] = useState(mockClinicAppointments);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = appointments.filter(a => {
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase()) && !a.doctorName.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "active") return ["scheduled", "arrived", "in_progress"].includes(a.status);
    if (tab === "completed") return a.status === "completed";
    return true;
  });

  const updateStatus = (id: string, status: ClinicAppointment["status"]) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: `Statut: ${statusLabel[status]}` });
  };

  return (
    <DashboardLayout role="clinic" title="Rendez-vous">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="all">Tous</TabsTrigger><TabsTrigger value="active">En cours</TabsTrigger><TabsTrigger value="completed">Terminés</TabsTrigger></TabsList>
        </Tabs>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-xs">
                <th className="text-left p-3">Heure</th><th className="text-left p-3">Patient</th><th className="text-left p-3">Médecin</th><th className="text-left p-3">Type</th><th className="text-left p-3">Salle</th><th className="text-left p-3">Statut</th><th className="text-left p-3">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{a.time}</td>
                    <td className="p-3">{a.patientName}</td>
                    <td className="p-3 text-muted-foreground">{a.doctorName}</td>
                    <td className="p-3 text-muted-foreground capitalize">{a.type === "follow_up" ? "Suivi" : a.type === "surgery" ? "Chirurgie" : a.type === "emergency" ? "Urgence" : "Consultation"}</td>
                    <td className="p-3 text-muted-foreground">{a.room}</td>
                    <td className="p-3"><Badge variant={statusVariant(a.status)} className="text-[10px]">{statusLabel[a.status]}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {a.status === "scheduled" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateStatus(a.id, "arrived")}><UserCheck className="h-3 w-3 mr-1" />Arrivé</Button>}
                        {a.status === "arrived" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateStatus(a.id, "in_progress")}><Play className="h-3 w-3 mr-1" />Début</Button>}
                        {a.status === "in_progress" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateStatus(a.id, "completed")}><CheckCircle className="h-3 w-3 mr-1" />Terminer</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun rendez-vous</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClinicAppointments;
