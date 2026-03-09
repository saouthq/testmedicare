import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockHospitalStaff } from "@/data/mocks/hospital";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone } from "lucide-react";

const roleLabels: Record<string, string> = { doctor: "Médecin", nurse: "Infirmier(e)", technician: "Technicien", admin: "Administratif", surgeon: "Chirurgien" };
const shiftLabels: Record<string, string> = { morning: "Matin", afternoon: "Après-midi", night: "Nuit", off: "Repos" };
const shiftVariant = (s: string) => s === "off" ? "outline" as const : s === "night" ? "secondary" as const : "default" as const;

const HospitalStaff = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = mockHospitalStaff.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.department.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    return true;
  });

  return (
    <DashboardLayout role="hospital" title="Personnel">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les rôles</SelectItem><SelectItem value="doctor">Médecins</SelectItem><SelectItem value="surgeon">Chirurgiens</SelectItem><SelectItem value="nurse">Infirmiers</SelectItem><SelectItem value="technician">Techniciens</SelectItem><SelectItem value="admin">Administratifs</SelectItem></SelectContent></Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{s.name}</h3>
                <Badge variant={shiftVariant(s.shift)} className="text-[10px]">{shiftLabels[s.shift]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{roleLabels[s.role]} · {s.department}</p>
              {s.specialty && <p className="text-xs text-primary mt-0.5">{s.specialty}</p>}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{s.phone}</div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun membre du personnel trouvé</p>}
      </div>
    </DashboardLayout>
  );
};

export default HospitalStaff;
