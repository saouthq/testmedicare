import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Search, Upload, Download, Folder, Eye, Trash2, MoreHorizontal, Image, File, Shield, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const documents = [
  { name: "Fiche patient - Amine Ben Ali", type: "PDF", size: "245 Ko", date: "20 Fév 2026", category: "Fiches patients", icon: FileText },
  { name: "Bulletin de soins CNAM - Fatma Trabelsi", type: "PDF", size: "120 Ko", date: "18 Fév 2026", category: "CNAM", icon: Shield },
  { name: "Ordonnance ORD-2026-045", type: "PDF", size: "89 Ko", date: "20 Fév 2026", category: "Ordonnances", icon: FileText },
  { name: "Résultats analyses - Mohamed Sfar", type: "PDF", size: "1.2 Mo", date: "15 Fév 2026", category: "Analyses", icon: File },
  { name: "Facture Février 2026", type: "PDF", size: "56 Ko", date: "1 Fév 2026", category: "Comptabilité", icon: FileText },
  { name: "Certificat médical - Sami Ayari", type: "PDF", size: "34 Ko", date: "19 Fév 2026", category: "Certificats", icon: FileText },
  { name: "Déclaration CNAM mensuelle", type: "PDF", size: "180 Ko", date: "1 Fév 2026", category: "CNAM", icon: Shield },
  { name: "Convention CNAM - Dr. Bouazizi", type: "PDF", size: "450 Ko", date: "1 Jan 2026", category: "CNAM", icon: Shield },
  { name: "Radiographie thorax - Nadia Jemni", type: "DICOM", size: "8.5 Mo", date: "12 Fév 2026", category: "Imagerie", icon: Image },
];

const categories = ["Tous", "Fiches patients", "Ordonnances", "CNAM", "Analyses", "Certificats", "Comptabilité", "Imagerie"];

const SecretaryDocuments = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = documents.filter(d => {
    if (selectedCategory !== "Tous" && d.category !== selectedCategory) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = categories.map(c => ({
    name: c,
    count: c === "Tous" ? documents.length : documents.filter(d => d.category === c).length,
  }));

  return (
    <DashboardLayout role="secretary" title="Documents">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un document..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />Exporter tout
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categoryCounts.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCategory(c.name)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === c.name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              {c.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === c.name ? "bg-primary-foreground/20" : "bg-muted"
              }`}>{c.count}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">{filtered.length} document(s)</p>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground">Document</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Taille</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((d, i) => {
                const IconComponent = d.icon;
                return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          d.category === "CNAM" ? "bg-primary/10" : "bg-destructive/10"
                        }`}>
                          <IconComponent className={`h-4 w-4 ${d.category === "CNAM" ? "text-primary" : "text-destructive"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{d.name}</p>
                          <p className="text-[11px] text-muted-foreground">{d.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.category === "CNAM" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                      }`}>{d.category}</span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{d.size}</td>
                    <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{d.date}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDocuments;
