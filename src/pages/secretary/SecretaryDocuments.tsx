import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Search, Upload, Download, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const documents = [
  { name: "Fiche patient - Marie Dupont", type: "PDF", size: "245 Ko", date: "20 Fév 2026", category: "Fiches patients" },
  { name: "Compte-rendu consultation", type: "PDF", size: "120 Ko", date: "18 Fév 2026", category: "Compte-rendus" },
  { name: "Ordonnance ORD-2026-045", type: "PDF", size: "89 Ko", date: "20 Fév 2026", category: "Ordonnances" },
  { name: "Résultats analyses - Jean Martin", type: "PDF", size: "1.2 Mo", date: "15 Fév 2026", category: "Analyses" },
  { name: "Facture Février 2026", type: "PDF", size: "56 Ko", date: "1 Fév 2026", category: "Comptabilité" },
];

const categories = ["Tous", "Fiches patients", "Ordonnances", "Compte-rendus", "Analyses", "Comptabilité"];

const SecretaryDocuments = () => {
  return (
    <DashboardLayout role="secretary" title="Documents">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un document..." className="pl-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                i === 0
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">Document</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Taille</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((d, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{d.category}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{d.size}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{d.date}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
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

export default SecretaryDocuments;
