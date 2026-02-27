import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, Calendar, ChevronRight, Copy, Download, Droplet, Eye,
  FileText, Mail, MessageSquare, MoreVertical, Phone, Printer, Search,
  SortAsc, SortDesc, Star, UserPlus, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePatients, type PatientFilter, type SortKey } from "./PatientsContext";

/* ── Toolbar ── */
export function PatientsToolbar() {
  const ctx = usePatients();
  return (
    <div className="sticky top-0 z-20 -mx-1 px-1 pt-2 pb-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input ref={ctx.searchInputRef} placeholder="Rechercher un patient (nom, téléphone, email)…  (raccourci : /)" value={ctx.search} onChange={(e) => ctx.setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-end">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {([{ key: "all" as PatientFilter, label: "Tous" }, { key: "recent" as PatientFilter, label: "Récents" }, { key: "chronic" as PatientFilter, label: "Chroniques" }, { key: "new" as PatientFilter, label: "Nouveaux" }]).map((f) => (
              <button key={f.key} onClick={() => ctx.setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${ctx.filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs" title="Ctrl/Cmd+K" onClick={ctx.openPalette}><Search className="h-3.5 w-3.5 mr-1" />Actions</Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={ctx.handleExportCSV}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={() => ctx.setShowNewPatient(true)}><UserPlus className="h-3.5 w-3.5 mr-1" />Nouveau patient</Button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Trier :</span>
        {([{ key: "name" as SortKey, label: "Nom" }, { key: "age" as SortKey, label: "Âge" }, { key: "lastVisit" as SortKey, label: "Dernière visite" }]).map((s) => (
          <button key={s.key} onClick={() => ctx.toggleSort(s.key)} className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${ctx.sortBy === s.key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
            {s.label}{ctx.sortBy === s.key && (ctx.sortAsc ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
          </button>
        ))}
        <span className="ml-auto text-muted-foreground">{ctx.sortedPatients.length} patient(s)</span>
      </div>
    </div>
  );
}

/* ── Stats ── */
export function PatientsStats() {
  const ctx = usePatients();
  const stats = [
    { value: ctx.patients.length, label: "Total patients", color: "text-foreground" },
    { value: ctx.patients.filter((p) => p.chronicConditions.length > 0).length, label: "Chroniques", color: "text-primary" },
    { value: ctx.patients.filter((p) => p.nextAppointment).length, label: "RDV planifiés", color: "text-accent" },
    { value: ctx.patients.filter((p) => p.isNew).length, label: "Nouveaux", color: "text-warning" },
  ];
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border bg-card px-4 py-3 text-center">
          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Selected Patient Bottom Bar ── */
export function PatientsSelectedBar() {
  const ctx = usePatients();
  const p = ctx.selectedPatient;
  if (!p) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md shadow-elevated">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">{p.avatar}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                {ctx.isFavorite(p.id) && <Star className="h-3.5 w-3.5 text-warning fill-warning shrink-0" />}
                <span className="text-xs text-muted-foreground shrink-0">{p.age} ans</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {p.chronicConditions.slice(0, 2).map((c) => <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{c}</span>)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => ctx.openPhone(p.phone)}><Phone className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => ctx.openWhatsApp(p.phone)}><MessageSquare className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => ctx.planAppointment(p)}><Calendar className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => ctx.startConsultation(p)}><FileText className="h-3.5 w-3.5" /></Button>
            <Link to={`/dashboard/doctor/patients/${p.id}`}><Button variant="outline" size="sm" className="text-xs h-8">Ouvrir <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Désélectionner" onClick={() => ctx.setSelectedPatientId(null)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Patient List ── */
export function PatientsList() {
  const ctx = usePatients();
  return (
    <div className="space-y-3">
      {ctx.sortedPatients.map((p) => (
        <div key={p.id} onClick={() => ctx.setSelectedPatientId(p.id)}
          className={`rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer group ${ctx.selectedPatientId === p.id ? "ring-2 ring-primary border-primary/30" : ""}`}>
          <div className="flex items-start gap-4">
            <Link to={`/dashboard/doctor/patients/${p.id}`}
              className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 hover:opacity-80 transition-opacity ${p.isNew ? "bg-warning/10 text-warning border-2 border-warning/30" : "gradient-primary text-primary-foreground"}`}
              onClick={(e) => e.stopPropagation()}>{p.avatar}</Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link to={`/dashboard/doctor/patients/${p.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors truncate" onClick={(e) => e.stopPropagation()}>{p.name}</Link>
                    {ctx.isFavorite(p.id) && <Star className="h-4 w-4 text-warning fill-warning" />}
                    <span className="text-xs text-muted-foreground">{p.age} ans{p.gouvernorat ? ` • ${p.gouvernorat}` : ""}</span>
                    {p.isNew && <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Nouveau</span>}
                    {p.nextAppointment && <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-medium"><Calendar className="h-3 w-3" />{p.nextAppointment}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {p.chronicConditions.slice(0, 2).map((c) => <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c}</span>)}
                    {p.chronicConditions.length > 2 && <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">+{p.chronicConditions.length - 2}</span>}
                    {p.allergies.slice(0, 1).map((a) => <span key={a.name} className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-2.5 w-2.5" />{a.name}</span>)}
                    {p.allergies.length > 1 && <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">+{p.allergies.length - 1}</span>}
                    {p.lastVisit && <span className="text-[11px] text-muted-foreground">Dernière visite : {p.lastVisit}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/dashboard/doctor/patients/${p.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="text-xs h-8">Ouvrir <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
                  </Link>
                  <PatientRowMenu patient={p} />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                {p.email && <span className="flex items-center gap-1 min-w-0"><Mail className="h-3 w-3" /><span className="truncate max-w-[220px]">{p.email}</span></span>}
                {p.lastVitals.ta !== "—" && <span className="flex items-center gap-1"><Activity className="h-3 w-3" />TA {p.lastVitals.ta}</span>}
                {p.lastVitals.glycemia !== "—" && <span className="flex items-center gap-1"><Droplet className="h-3 w-3" />Glycémie {p.lastVitals.glycemia}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
      {ctx.sortedPatients.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Aucun patient trouvé</p>
          <p className="text-xs text-muted-foreground mt-1">Essayez un autre filtre ou modifiez la recherche.</p>
        </div>
      )}
    </div>
  );
}

/* ── Row Dropdown Menu ── */
function PatientRowMenu({ patient: p }: { patient: any }) {
  const ctx = usePatients();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Actions patient"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs">Actions patient</DropdownMenuLabel>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.navigate(`/dashboard/doctor/patients/${p.id}`)}><Eye className="h-3.5 w-3.5 mr-2" /> Ouvrir dossier</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.planAppointment(p)}><Calendar className="h-3.5 w-3.5 mr-2" /> Planifier RDV</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.startConsultation(p)}><FileText className="h-3.5 w-3.5 mr-2" /> Démarrer consultation</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.openQuickNote(p)}><FileText className="h-3.5 w-3.5 mr-2" /> Ajouter note rapide</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">Contact</DropdownMenuLabel>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.openPhone(p.phone)}><Phone className="h-3.5 w-3.5 mr-2" /> Appeler</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.openWhatsApp(p.phone)}><MessageSquare className="h-3.5 w-3.5 mr-2" /> WhatsApp</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" disabled={!p.email} onClick={() => ctx.openEmail(p.email, p.name)}><Mail className="h-3.5 w-3.5 mr-2" /> Email</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">Dossier</DropdownMenuLabel>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.exportPatientRecord(p)}><Download className="h-3.5 w-3.5 mr-2" /> Exporter dossier (PDF)</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.printPatientRecord(p)}><Printer className="h-3.5 w-3.5 mr-2" /> Imprimer dossier</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">Pratique</DropdownMenuLabel>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.copyToClipboard("Téléphone", p.phone)}><Copy className="h-3.5 w-3.5 mr-2" /> Copier téléphone</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" disabled={!p.email} onClick={() => ctx.copyToClipboard("Email", p.email || "")}><Copy className="h-3.5 w-3.5 mr-2" /> Copier email</DropdownMenuItem>
        <DropdownMenuItem className="text-xs" onClick={() => ctx.toggleFavorite(p.id)}>
          <Star className={`h-3.5 w-3.5 mr-2 ${ctx.isFavorite(p.id) ? "fill-warning text-warning" : ""}`} />
          {ctx.isFavorite(p.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Actions Palette ── */
export function PatientsPalette() {
  const ctx = usePatients();
  if (!ctx.actionsOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => ctx.setActionsOpen(false)}>
      <div className="bg-card rounded-xl border shadow-elevated w-full max-w-xl mx-4 animate-scale-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input ref={ctx.actionsInputRef} value={ctx.actionsQ} onChange={(e) => { ctx.setActionsQ(e.target.value); ctx.setActionsIndex(0); }}
                placeholder={ctx.palettePatient ? `Action pour ${ctx.palettePatient.name}…` : "Rechercher un patient ou une action…"} className="pl-10 h-10" />
            </div>
            {ctx.palettePatient && (
              <button className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => { ctx.setActionsQ(""); ctx.setActionsIndex(0); }}>{ctx.palettePatient.avatar} · Changer</button>
            )}
            <span className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground">Ctrl+K</span>
          </div>
        </div>
        <div className="max-h-[52vh] overflow-y-auto">
          {ctx.paletteSections.map((section) => (
            <div key={section.group} className="py-2">
              <div className="px-4 py-1 text-[11px] font-semibold text-muted-foreground">{section.group}</div>
              <div className="px-2">
                {section.items.map((a) => {
                  const idx = ctx.paletteFlat.findIndex((x) => x.id === a.id);
                  const active = idx === ctx.actionsIndex;
                  return (
                    <button key={a.id} disabled={a.disabled} onMouseEnter={() => ctx.setActionsIndex(idx)} onClick={() => !a.disabled && a.onRun()}
                      className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${a.disabled ? "opacity-50 cursor-not-allowed" : active ? "bg-primary/10" : "hover:bg-muted/60"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                          {a.meta && <div className="text-[11px] text-muted-foreground truncate">{a.meta}</div>}
                        </div>
                        <div className="text-xs text-muted-foreground">{a.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {ctx.paletteFlat.length === 0 && <div className="p-6 text-center"><p className="text-sm font-medium text-foreground">Aucune action</p></div>}
        </div>
        <div className="p-3 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">↑↓ naviguer · Entrée lancer · Esc fermer</div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setActionsOpen(false)}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Quick Note Modal ── */
export function PatientsNoteModal() {
  const ctx = usePatients();
  if (!ctx.noteOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => ctx.setNoteOpen(false)}>
      <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">Note rapide</h3>
          <button onClick={() => ctx.setNoteOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Cette note sera ajoutée au dossier (mock) avec horodatage.</p>
        <textarea className="w-full min-h-[140px] rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" value={ctx.noteText} onChange={(e) => ctx.setNoteText(e.target.value)} placeholder="Ex : Patient stable, renouvellement traitement…" />
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setNoteOpen(false)}>Annuler</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={ctx.saveQuickNote}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
}

/* ── New Patient Modal ── */
export function PatientsNewModal() {
  const ctx = usePatients();
  if (!ctx.showNewPatient) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => ctx.setShowNewPatient(false)}>
      <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Nouveau patient</h3>
          <button onClick={() => ctx.setShowNewPatient(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Prénom *</Label><Input value={ctx.newForm.firstName} onChange={(e) => ctx.setNewForm((f) => ({ ...f, firstName: e.target.value }))} className="mt-1 h-9" placeholder="Prénom" /></div>
            <div><Label className="text-xs">Nom *</Label><Input value={ctx.newForm.lastName} onChange={(e) => ctx.setNewForm((f) => ({ ...f, lastName: e.target.value }))} className="mt-1 h-9" placeholder="Nom" /></div>
            <div><Label className="text-xs">Date de naissance</Label><Input type="date" value={ctx.newForm.dob} onChange={(e) => ctx.setNewForm((f) => ({ ...f, dob: e.target.value }))} className="mt-1 h-9" /></div>
            <div><Label className="text-xs">Téléphone</Label><Input value={ctx.newForm.phone} onChange={(e) => ctx.setNewForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 h-9" placeholder="+216 XX XXX XXX" /></div>
            <div><Label className="text-xs">Email</Label><Input type="email" value={ctx.newForm.email} onChange={(e) => ctx.setNewForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 h-9" placeholder="email@..." /></div>
            <div><Label className="text-xs">Groupe sanguin</Label><Input value={ctx.newForm.bloodType} onChange={(e) => ctx.setNewForm((f) => ({ ...f, bloodType: e.target.value }))} className="mt-1 h-9" placeholder="A+" /></div>
            <div className="col-span-2"><Label className="text-xs">Allergies (virgules)</Label><Input value={ctx.newForm.allergies} onChange={(e) => ctx.setNewForm((f) => ({ ...f, allergies: e.target.value }))} className="mt-1 h-9" placeholder="Pénicilline, AINS..." /></div>
            <div className="col-span-2"><Label className="text-xs">Pathologies chroniques (virgules)</Label><Input value={ctx.newForm.conditions} onChange={(e) => ctx.setNewForm((f) => ({ ...f, conditions: e.target.value }))} className="mt-1 h-9" placeholder="Diabète type 2, HTA..." /></div>
            <div className="col-span-2"><Label className="text-xs">Identifiant CNAM</Label><Input value={ctx.newForm.cnamId} onChange={(e) => ctx.setNewForm((f) => ({ ...f, cnamId: e.target.value }))} className="mt-1 h-9" placeholder="CNAM..." /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setShowNewPatient(false)}>Annuler</Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={ctx.handleAddPatient} disabled={!ctx.newForm.firstName || !ctx.newForm.lastName}>Créer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
