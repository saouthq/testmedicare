import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, User, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

const patients = [
  { name: "Marie Dupont", age: 34, lastAnalysis: "Bilan sanguin", date: "20 Fév 2026", status: "in_progress", total: 8 },
  { name: "Jean Bernard", age: 56, lastAnalysis: "Analyse d'urine", date: "19 Fév 2026", status: "ready", total: 12 },
  { name: "Claire Moreau", age: 28, lastAnalysis: "TSH", date: "20 Fév 2026", status: "waiting", total: 3 },
  { name: "Paul Petit", age: 67, lastAnalysis: "Glycémie", date: "18 Fév 2026", status: "ready", total: 15 },
  { name: "Sophie Leroy", age: 42, lastAnalysis: "Hémogramme", date: "20 Fév 2026", status: "in_progress", total: 6 },
];

const LaboratoryPatients = () => {
  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un patient..." className="pl-10" />
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Âge</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Dernière analyse</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Total analyses</th>
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
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{p.age} ans</td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.lastAnalysis}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{p.date}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;
