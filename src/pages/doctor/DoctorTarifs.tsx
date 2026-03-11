/**
 * DoctorTarifs — Grille tarifaire du médecin
 * Actes, prix, conventionnement, majorations
 * // TODO BACKEND: Persister la grille tarifaire
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Banknote, Plus, Pencil, Trash2, Moon, Sun, AlertTriangle } from "lucide-react";

interface Acte {
  id: number;
  code: string;
  name: string;
  price: number;
  conventionne: boolean;
  duration: number; // minutes
  active: boolean;
}

interface Majoration {
  id: string;
  label: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
}

const initialActes: Acte[] = [
  { id: 1, code: "CS", name: "Consultation standard", price: 35, conventionne: true, duration: 30, active: true },
  { id: 2, code: "CS-P", name: "Première consultation", price: 50, conventionne: true, duration: 45, active: true },
  { id: 3, code: "CS-S", name: "Consultation de suivi", price: 25, conventionne: true, duration: 20, active: true },
  { id: 4, code: "TC", name: "Téléconsultation", price: 30, conventionne: false, duration: 20, active: true },
  { id: 5, code: "CERT", name: "Certificat médical", price: 20, conventionne: false, duration: 15, active: true },
  { id: 6, code: "ECG", name: "Électrocardiogramme", price: 40, conventionne: true, duration: 20, active: true },
  { id: 7, code: "ECHO", name: "Échographie abdominale", price: 60, conventionne: true, duration: 30, active: true },
  { id: 8, code: "VAC", name: "Vaccination", price: 25, conventionne: true, duration: 15, active: true },
  { id: 9, code: "BIL", name: "Bilan de santé complet", price: 80, conventionne: false, duration: 60, active: true },
  { id: 10, code: "SPIRO", name: "Spirométrie", price: 45, conventionne: true, duration: 25, active: false },
];

const initialMajorations: Majoration[] = [
  { id: "nuit", label: "Majoration de nuit (20h-8h)", type: "percentage", value: 50, active: true },
  { id: "dimanche", label: "Dimanche & jours fériés", type: "percentage", value: 100, active: true },
  { id: "urgence", label: "Majoration d'urgence", type: "fixed", value: 15, active: true },
  { id: "deplacement", label: "Visite à domicile", type: "fixed", value: 20, active: false },
];

const DoctorTarifs = () => {
  const [actes, setActes] = useState<Acte[]>(initialActes);
  const [majorations, setMajorations] = useState<Majoration[]>(initialMajorations);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editActe, setEditActe] = useState<Acte | null>(null);
  const [form, setForm] = useState({ code: "", name: "", price: "", duration: "", conventionne: true });

  const activeActes = actes.filter(a => a.active);
  const avgPrice = activeActes.length ? Math.round(activeActes.reduce((s, a) => s + a.price, 0) / activeActes.length) : 0;

  const openNew = () => {
    setEditActe(null);
    setForm({ code: "", name: "", price: "", duration: "", conventionne: true });
    setDrawerOpen(true);
  };

  const openEdit = (a: Acte) => {
    setEditActe(a);
    setForm({ code: a.code, name: a.name, price: String(a.price), duration: String(a.duration), conventionne: a.conventionne });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.price) { toast.error("Champs obligatoires manquants"); return; }
    if (editActe) {
      setActes(prev => prev.map(a => a.id === editActe.id ? { ...a, code: form.code, name: form.name, price: Number(form.price), duration: Number(form.duration) || 30, conventionne: form.conventionne } : a));
      toast.success("Acte mis à jour");
    } else {
      setActes(prev => [...prev, { id: Date.now(), code: form.code, name: form.name, price: Number(form.price), duration: Number(form.duration) || 30, conventionne: form.conventionne, active: true }]);
      toast.success("Acte ajouté");
    }
    setDrawerOpen(false);
  };

  const toggleActe = (id: number) => setActes(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const deleteActe = (id: number) => { setActes(prev => prev.filter(a => a.id !== id)); toast.success("Acte supprimé"); };
  const toggleMajoration = (id: string) => setMajorations(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));

  return (
    <DashboardLayout role="doctor" title="Tarifs & Actes">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{activeActes.length}</p><p className="text-xs text-muted-foreground">Actes actifs</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-2xl font-bold text-foreground">{avgPrice} DT</p><p className="text-xs text-muted-foreground">Prix moyen</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Sun className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">{actes.filter(a => a.conventionne).length}</p><p className="text-xs text-muted-foreground">Conventionnés</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Moon className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold text-foreground">{majorations.filter(m => m.active).length}</p><p className="text-xs text-muted-foreground">Majorations actives</p></div>
        </CardContent></Card>
      </div>

      {/* Actes table */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Grille des actes</CardTitle>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter un acte</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Code</TableHead>
                  <TableHead>Acte</TableHead>
                  <TableHead className="text-right">Prix (DT)</TableHead>
                  <TableHead className="text-center">Durée</TableHead>
                  <TableHead className="text-center">Conv.</TableHead>
                  <TableHead className="text-center">Actif</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {actes.map(a => (
                  <TableRow key={a.id} className={!a.active ? "opacity-50" : ""}>
                    <TableCell><Badge variant="outline" className="font-mono text-[10px]">{a.code}</Badge></TableCell>
                    <TableCell className="font-medium text-sm">{a.name}</TableCell>
                    <TableCell className="text-right font-semibold">{a.price}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{a.duration} min</TableCell>
                    <TableCell className="text-center">{a.conventionne ? <Badge className="bg-primary/10 text-primary text-[10px]">Oui</Badge> : <span className="text-xs text-muted-foreground">Non</span>}</TableCell>
                    <TableCell className="text-center"><Switch checked={a.active} onCheckedChange={() => toggleActe(a.id)} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteActe(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Majorations */}
      <Card>
        <CardHeader><CardTitle className="text-base">Majorations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {majorations.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">
                  {m.type === "percentage" ? `+${m.value}% du tarif de base` : `+${m.value} DT forfaitaire`}
                </p>
              </div>
              <Switch checked={m.active} onCheckedChange={() => toggleMajoration(m.id)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editActe ? "Modifier l'acte" : "Nouvel acte"}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Code acte *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="CS" /></div>
            <div><Label>Nom de l'acte *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix (DT) *</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
              <div><Label>Durée (min)</Label><Input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Conventionné</p><p className="text-xs text-muted-foreground">Pris en charge par l'assurance</p></div>
              <Switch checked={form.conventionne} onCheckedChange={v => setForm(p => ({ ...p, conventionne: v }))} />
            </div>
            <Button className="w-full" onClick={handleSave}>{editActe ? "Mettre à jour" : "Ajouter l'acte"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default DoctorTarifs;
