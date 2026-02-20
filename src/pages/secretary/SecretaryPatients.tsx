import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Phone, Mail, Plus, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const patients = [
  { name: "Marie Dupont", phone: "06 12 34 56 78", email: "marie@email.com", lastVisit: "20 Fév 2026", doctor: "Dr. Martin", nextAppointment: "28 Fév 14:30" },
  { name: "Jean Martin", phone: "06 98 76 54 32", email: "jean@email.com", lastVisit: "18 Fév 2026", doctor: "Dr. Lefebvre", nextAppointment: "25 Fév 10:00" },
  { name: "Claire Petit", phone: "06 11 22 33 44", email: "claire@email.com", lastVisit: "15 Fév 2026", doctor: "Dr. Martin", nextAppointment: null },
  { name: "Luc Bernard", phone: "06 55 66 77 88", email: "luc@email.com", lastVisit: "10 Fév 2026", doctor: "Dr. Durand", nextAppointment: "3 Mar 09:00" },
  { name: "Sophie Moreau", phone: "06 99 88 77 66", email: "sophie@email.com", lastVisit: "8 Fév 2026", doctor: "Dr. Martin", nextAppointment: null },
];

const SecretaryPatients = () => {
  return (
    <DashboardLayout role="secretary" title="Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." className="pl-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau patient
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Dernière visite</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Prochain RDV</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.doctor}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{p.lastVisit}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {p.nextAppointment ? (
                      <span className="text-sm text-accent font-medium">{p.nextAppointment}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Aucun</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryPatients;
