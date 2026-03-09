/**
 * SecretaryOffice — Cabinet management page.
 * Uses centralized mock data. Edit mode for office info.
 * // TODO BACKEND: PUT /api/office
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  Building2, Users, Clock, MapPin, Phone, Mail, 
  Calendar, TrendingUp, AlertTriangle, CheckCircle2, 
  Stethoscope, Shield, Banknote, BarChart3, Globe, Edit, Save, X,
  Plus, Wrench, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { mockSecretaryOfficeDoctors, mockOfficeInfo, mockOfficeWeeklyStats, mockOfficeEquipment } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Disponible", class: "bg-accent/10 text-accent" },
  in_consultation: { label: "En consultation", class: "bg-primary/10 text-primary" },
  absent: { label: "Absent", class: "bg-muted text-muted-foreground" },
};

const statIcons = [Calendar, TrendingUp, AlertTriangle, Users];

const SecretaryOffice = () => {
  const [editMode, setEditMode] = useState(false);
  const [officeData, setOfficeData] = useState(mockOfficeInfo);
  const [doctors] = useState(mockSecretaryOfficeDoctors);
  const [equipment, setEquipment] = useState(mockOfficeEquipment);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipName, setNewEquipName] = useState("");

  const handleSaveOffice = () => {
    // TODO BACKEND: PUT /api/office
    setEditMode(false);
    toast({ title: "Informations mises à jour", description: "Les données du cabinet ont été sauvegardées." });
  };

  const handleAddEquipment = () => {
    if (!newEquipName.trim()) return;
    setEquipment(prev => [...prev, { name: newEquipName, status: "ok", lastMaintenance: "Mar 2026" }]);
    setNewEquipName("");
    setShowAddEquipment(false);
    toast({ title: "Équipement ajouté" });
  };

  const handleToggleEquipmentStatus = (idx: number) => {
    setEquipment(prev => prev.map((e, i) => i === idx ? { ...e, status: e.status === "ok" ? "maintenance" : "ok" } : e));
  };

  return (
    <DashboardLayout role="secretary" title="Gestion du cabinet">
      <div className="space-y-6">
        {/* Office info */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-primary-foreground" />
              </div>
              {editMode ? (
                <div className="flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label className="text-xs">Nom du cabinet</Label><Input value={officeData.name} onChange={e => setOfficeData(prev => ({ ...prev, name: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Adresse</Label><Input value={officeData.address} onChange={e => setOfficeData(prev => ({ ...prev, address: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Téléphone</Label><Input value={officeData.phone} onChange={e => setOfficeData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Fax</Label><Input value={officeData.fax} onChange={e => setOfficeData(prev => ({ ...prev, fax: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Email</Label><Input value={officeData.email} onChange={e => setOfficeData(prev => ({ ...prev, email: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Horaires</Label><Input value={officeData.openingHours} onChange={e => setOfficeData(prev => ({ ...prev, openingHours: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleSaveOffice}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setOfficeData(mockOfficeInfo); }}><X className="h-3.5 w-3.5 mr-1" />Annuler</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{officeData.name}</h2>
                    {officeData.conventionAssurance && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Shield className="h-3 w-3" />Conventionné
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{officeData.address}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" />{officeData.phone} · Fax: {officeData.fax}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" />{officeData.email}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" />{officeData.openingHours}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4 shrink-0" />RC: {officeData.registreCommerce}</p>
                  </div>
                </div>
              )}
            </div>
            {!editMode && (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}><Edit className="h-4 w-4 mr-2" />Modifier</Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {mockOfficeWeeklyStats.map((s, i) => {
            const Icon = statIcons[i] || Calendar;
            const colors = ["bg-primary/10 text-primary", "bg-accent/10 text-accent", "bg-warning/10 text-warning", "bg-primary/10 text-primary"];
            return (
              <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[i]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-[11px] text-accent mt-1">{s.trend}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doctors */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />Médecins du cabinet
              </h2>
              <span className="text-xs text-muted-foreground">{doctors.length} praticien(s)</span>
            </div>
            <div className="divide-y">
              {doctors.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {d.name.split(". ")[1]?.[0] || "D"}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                        d.status === "available" ? "bg-accent" : d.status === "in_consultation" ? "bg-primary" : "bg-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{d.name}</p>
                        {d.conventionAssurance && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{d.specialty} · {d.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">{d.patients} patients</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[d.status]?.class || "bg-muted text-muted-foreground"}`}>
                      {statusConfig[d.status]?.label || d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />Équipements
              </h2>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAddEquipment(!showAddEquipment)}>
                <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
              </Button>
            </div>
            {showAddEquipment && (
              <div className="p-4 border-b bg-muted/20 flex gap-2">
                <Input placeholder="Nom de l'équipement" value={newEquipName} onChange={e => setNewEquipName(e.target.value)} className="flex-1" />
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAddEquipment}>Ajouter</Button>
              </div>
            )}
            <div className="divide-y">
              {equipment.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">Dernière maintenance : {e.lastMaintenance}</p>
                  </div>
                  <button
                    onClick={() => handleToggleEquipmentStatus(i)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${
                      e.status === "ok" ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-warning/10 text-warning hover:bg-warning/20"
                    }`}
                  >
                    {e.status === "ok" ? "Opérationnel" : "En maintenance"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial summary */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4 text-accent" />Résumé financier du mois
            </h2>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Export PDF", description: "Résumé financier exporté (mock)." })}>
              <Printer className="h-3.5 w-3.5 mr-1" />Exporter
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total facturé</p>
              <p className="text-xl font-bold text-foreground mt-1">8 450 DT</p>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="text-xs text-primary font-medium">Part Assurance</p>
              <p className="text-xl font-bold text-foreground mt-1">5 915 DT</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Paiement direct</p>
              <p className="text-xl font-bold text-foreground mt-1">1 690 DT</p>
            </div>
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-center">
              <p className="text-xs text-destructive font-medium">Impayés</p>
              <p className="text-xl font-bold text-destructive mt-1">320 DT</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryOffice;
