import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Search, Upload, Download, Eye, Trash2, Image, File, Shield, X, CheckCircle2, Printer, Send, FolderOpen, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Document {
  id: number; name: string; type: string; size: string; date: string; category: string;
  icon: any; patient?: string; status?: "validated" | "pending" | "draft";
}

const initialDocuments: Document[] = [
  { id: 1, name: "Fiche patient - Amine Ben Ali", type: "PDF", size: "245 Ko", date: "20 Fév 2026", category: "Fiches patients", icon: FileText, patient: "Amine Ben Ali", status: "validated" },
  { id: 2, name: "Bulletin de soins CNAM - Fatma Trabelsi", type: "PDF", size: "120 Ko", date: "18 Fév 2026", category: "CNAM", icon: Shield, patient: "Fatma Trabelsi", status: "validated" },
  { id: 3, name: "Ordonnance ORD-2026-045", type: "PDF", size: "89 Ko", date: "20 Fév 2026", category: "Ordonnances", icon: FileText, patient: "Amine Ben Ali", status: "validated" },
  { id: 4, name: "Résultats analyses - Mohamed Sfar", type: "PDF", size: "1.2 Mo", date: "15 Fév 2026", category: "Analyses", icon: File, patient: "Mohamed Sfar", status: "pending" },
  { id: 5, name: "Facture Février 2026", type: "PDF", size: "56 Ko", date: "1 Fév 2026", category: "Comptabilité", icon: FileText, status: "validated" },
  { id: 6, name: "Certificat médical - Sami Ayari", type: "PDF", size: "34 Ko", date: "19 Fév 2026", category: "Certificats", icon: FileText, patient: "Sami Ayari", status: "draft" },
  { id: 7, name: "Déclaration CNAM mensuelle", type: "PDF", size: "180 Ko", date: "1 Fév 2026", category: "CNAM", icon: Shield, status: "validated" },
  { id: 8, name: "Convention CNAM - Dr. Bouazizi", type: "PDF", size: "450 Ko", date: "1 Jan 2026", category: "CNAM", icon: Shield, status: "validated" },
  { id: 9, name: "Radiographie thorax - Nadia Jemni", type: "DICOM", size: "8.5 Mo", date: "12 Fév 2026", category: "Imagerie", icon: Image, patient: "Nadia Jemni", status: "validated" },
];

const categories = ["Tous", "Fiches patients", "Ordonnances", "CNAM", "Analyses", "Certificats", "Comptabilité", "Imagerie"];

const statusConfig: Record<string, { label: string; class: string }> = {
  validated: { label: "Validé", class: "bg-accent/10 text-accent" },
  pending: { label: "En attente", class: "bg-warning/10 text-warning" },
  draft: { label: "Brouillon", class: "bg-muted text-muted-foreground" },
};

const SecretaryDocuments = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{ name: string; size: string; category: string; patient: string }[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filtered = documents.filter(d => {
    if (selectedCategory !== "Tous" && d.category !== selectedCategory) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = categories.map(c => ({
    name: c,
    count: c === "Tous" ? documents.length : documents.filter(d => d.category === c).length,
  }));

  const simulateUpload = () => {
    // Simulate adding a file to upload queue
    setUploadFiles(prev => [...prev, {
      name: `Document_${Date.now().toString().slice(-6)}.pdf`,
      size: `${Math.floor(Math.random() * 500 + 50)} Ko`,
      category: "Fiches patients",
      patient: "",
    }]);
  };

  const confirmUpload = () => {
    const newDocs = uploadFiles.map((f, i) => ({
      id: documents.length + i + 1,
      name: f.name,
      type: "PDF",
      size: f.size,
      date: "20 Fév 2026",
      category: f.category,
      icon: FileText,
      patient: f.patient || undefined,
      status: "pending" as const,
    }));
    setDocuments(prev => [...newDocs, ...prev]);
    setUploadFiles([]);
    setShowUpload(false);
  };

  const deleteDoc = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  return (
    <DashboardLayout role="secretary" title="Documents">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un document..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter tout</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />Importer
            </Button>
          </div>
        </div>

        {/* Upload modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
            <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />Importer des documents
                </h3>
                <button onClick={() => { setShowUpload(false); setUploadFiles([]); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); simulateUpload(); }}
                onClick={simulateUpload}
                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging ? "border-primary bg-primary/10" : "border-primary/30 bg-primary/5 hover:border-primary/50"
                }`}
              >
                <Upload className={`h-8 w-8 mx-auto mb-3 ${isDragging ? "text-primary" : "text-primary/50"}`} />
                <p className="font-medium text-foreground text-sm">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner</p>
                <p className="text-[10px] text-muted-foreground mt-2">PDF, images, DICOM (max 20 Mo)</p>
              </div>

              {/* Uploaded files list */}
              {uploadFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fichiers à importer ({uploadFiles.length})</p>
                  {uploadFiles.map((f, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{f.name}</span>
                          <span className="text-xs text-muted-foreground">{f.size}</span>
                        </div>
                        <button onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px]">Catégorie</Label>
                          <select
                            value={f.category}
                            onChange={e => { const u = [...uploadFiles]; u[i] = { ...u[i], category: e.target.value }; setUploadFiles(u); }}
                            className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
                          >
                            {categories.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-[10px]">Patient (optionnel)</Label>
                          <Input
                            value={f.patient}
                            onChange={e => { const u = [...uploadFiles]; u[i] = { ...u[i], patient: e.target.value }; setUploadFiles(u); }}
                            placeholder="Nom du patient"
                            className="mt-0.5 h-8 text-xs"
                          />
                        </div>
                      </div>
                      {/* Progress bar simulation */}
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: "100%" }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setShowUpload(false); setUploadFiles([]); }}>Annuler</Button>
                    <Button className="flex-1 gradient-primary text-primary-foreground" onClick={confirmUpload}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />Confirmer l'import ({uploadFiles.length})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categoryCounts.map(c => (
            <button
              key={c.name} onClick={() => setSelectedCategory(c.name)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === c.name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              {c.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === c.name ? "bg-primary-foreground/20" : "bg-muted"}`}>{c.count}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} document(s)</p>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Documents table */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground">Document</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Statut</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(d => {
                  const IconComponent = d.icon;
                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedDoc?.id === d.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDoc(d)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            d.category === "CNAM" ? "bg-primary/10" : d.category === "Analyses" ? "bg-accent/10" : "bg-muted"
                          }`}>
                            <IconComponent className={`h-4 w-4 ${
                              d.category === "CNAM" ? "text-primary" : d.category === "Analyses" ? "text-accent" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm truncate max-w-[200px]">{d.name}</p>
                            <p className="text-[11px] text-muted-foreground">{d.type} · {d.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.category === "CNAM" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                        }`}>{d.category}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {d.status && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[d.status].class}`}>
                            {statusConfig[d.status].label}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{d.date}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); }}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); }}><Download className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); deleteDoc(d.id); }}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Document detail panel */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedDoc ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <selectedDoc.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate">{selectedDoc.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedDoc.type} · {selectedDoc.size}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Catégorie</p>
                      <p className="text-xs font-medium text-foreground">{selectedDoc.category}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Date</p>
                      <p className="text-xs font-medium text-foreground">{selectedDoc.date}</p>
                    </div>
                    {selectedDoc.patient && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 col-span-2">
                        <p className="text-[10px] text-primary font-medium">Patient associé</p>
                        <p className="text-xs font-semibold text-foreground">{selectedDoc.patient}</p>
                      </div>
                    )}
                    {selectedDoc.status && (
                      <div className="rounded-lg bg-muted/50 p-3 col-span-2">
                        <p className="text-[10px] text-muted-foreground">Statut</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[selectedDoc.status].class}`}>
                          {statusConfig[selectedDoc.status].label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Eye className="h-3.5 w-3.5 mr-2 text-primary" />Aperçu</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Download className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Télécharger</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Printer className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Imprimer</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Send className="h-3.5 w-3.5 mr-2 text-accent" />Envoyer par email</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start text-destructive" onClick={() => deleteDoc(selectedDoc.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un document pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDocuments;
