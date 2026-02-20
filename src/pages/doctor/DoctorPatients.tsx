import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ChevronRight, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const patients = [
  { name: "Marie Dupont", age: 34, lastVisit: "10 Fév 2026", phone: "06 12 34 56 78", email: "marie@email.com", condition: "Suivi diabète" },
  { name: "Jean Martin", age: 56, lastVisit: "8 Fév 2026", phone: "06 98 76 54 32", email: "jean@email.com", condition: "Hypertension" },
  { name: "Claire Petit", age: 28, lastVisit: "5 Fév 2026", phone: "06 11 22 33 44", email: "claire@email.com", condition: "Grossesse" },
  { name: "Luc Bernard", age: 67, lastVisit: "1 Fév 2026", phone: "06 55 66 77 88", email: "luc@email.com", condition: "Arthrose" },
  { name: "Sophie Moreau", age: 42, lastVisit: "28 Jan 2026", phone: "06 99 88 77 66", email: "sophie@email.com", condition: "Asthme" },
  { name: "Paul Leroy", age: 51, lastVisit: "25 Jan 2026", phone: "06 44 33 22 11", email: "paul@email.com", condition: "Cholestérol" },
];

const DoctorPatients = () => {
  return (
    <DashboardLayout role="doctor" title="Mes patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." className="pl-10" />
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Âge</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Motif principal</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Dernière visite</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients.map((p, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{p.age} ans</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{p.condition}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{p.lastVisit}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4 text-muted-foreground" /></Button>
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

export default DoctorPatients;
