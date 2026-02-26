import {
  Activity, CheckCircle2, ChevronDown, ClipboardList, Clock, Download,
  FileText, MoreVertical, Pencil, Printer, Search, Send, Stethoscope, User, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useConsultations, statusBadge, type ConsultFilter, type ConsultStatus, type ConsultUi } from "./ConsultationsContext";

// ── Toolbar ──────────────────────────────────────────────────

export function ConsultationsToolbar() {
  const ctx = useConsultations();

  return (
    <div className="sticky top-0 z-10 -mx-2 px-2 py-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input value={ctx.q} onChange={(e) => ctx.setQ(e.target.value)} placeholder="Rechercher (patient, motif, date, heure)…" className="pl-9" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" title="Raccourci : Ctrl/Cmd+K" onClick={() => { ctx.setActionsOpen(true); ctx.setActionsQ(""); ctx.setActionsIdx(0); setTimeout(() => ctx.actionsInputRef.current?.focus(), 0); }}>
              <Search className="mr-1 h-3.5 w-3.5" /> Actions
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Export CSV", description: "Export à brancher." })}>
              <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={() => toast({ title: "Nouvelle consultation", description: "Flow à brancher." })}>
              <Stethoscope className="mr-1 h-3.5 w-3.5" /> Nouvelle consultation
            </Button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <Tabs value={ctx.range} onValueChange={(v) => ctx.setRange(v as ConsultFilter)}>
              <TabsList className="h-8">
                <TabsTrigger value="today" className="text-xs px-3">Aujourd&apos;hui</TabsTrigger>
                <TabsTrigger value="week" className="text-xs px-3">7 jours</TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-3">Tout</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Statut :</span>
              {([
                { key: "all", label: "Tous" }, { key: "scheduled", label: "À venir" },
                { key: "in_progress", label: "En cours" }, { key: "completed", label: "Terminées" },
                { key: "cancelled", label: "Annulées" }, { key: "no_show", label: "No-show" },
              ] as const).map((s) => (
                <Button key={s.key} variant={ctx.statusFilter === s.key ? "default" : "outline"} size="sm" className="text-xs h-8 px-3" onClick={() => ctx.setStatusFilter(s.key)}>
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stats ────────────────────────────────────────────────────

export function ConsultationsStats() {
  const { stats } = useConsultations();

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        { title: "Aujourd'hui", value: stats.todayCount, desc: `${stats.todayDone} terminées • ${stats.todayInProgress} en cours • ${stats.todayScheduled} à venir` },
        { title: "CA jour", value: `${stats.todayCa} DT`, desc: "Basé sur les consultations terminées" },
        { title: "No-show", value: stats.todayNoShow, desc: "À suivre / reprogrammer" },
        { title: "Période", value: stats.rangeCount, desc: "Consultations dans la période" },
      ].map((s) => (
        <Card key={s.title} className="rounded-xl">
          <CardHeader className="py-3"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Consultation Card ────────────────────────────────────────

function ConsultationCard({ c }: { c: ConsultUi }) {
  const ctx = useConsultations();
  const isExpanded = ctx.expandedId === c.id;
  const badge = statusBadge(c.status);

  return (
    <div className={`rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden ${c.status === "cancelled" || c.status === "no_show" ? "opacity-70" : ""}`}>
      <div role="button" tabIndex={0} className="w-full text-left p-4 cursor-pointer select-none" onClick={() => ctx.setExpandedId(isExpanded ? null : c.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctx.setExpandedId(isExpanded ? null : c.id); } }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex h-10 w-10 rounded-xl border bg-muted/30 items-center justify-center">
              <span className="text-xs font-semibold text-foreground">{c.time}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{c.avatar}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground truncate">{c.patient}</span>
                <Badge variant={badge.variant} className="text-[11px] px-2 py-0.5">{badge.label}</Badge>
                {c.cnam && <Badge variant="secondary" className="text-[11px] px-2 py-0.5">CNAM</Badge>}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {c.motif} • <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm font-semibold text-foreground">{c.amount}</span>
            {c.status === "scheduled" && (
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={(e) => { e.stopPropagation(); ctx.setStatus(c.id, "in_progress"); toast({ title: "Consultation en cours", description: ctx.consultLabel(c) }); }}>
                <Stethoscope className="mr-1 h-3.5 w-3.5" /> Démarrer
              </Button>
            )}
            {c.status === "in_progress" && (
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={(e) => { e.stopPropagation(); ctx.openClose(c); }}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Clôturer
              </Button>
            )}
            <ConsultationKebab c={c} />
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/10 p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
              <div className="text-sm text-foreground">{c.notes || "—"}</div>
            </div>
            <div className="md:col-span-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">Raccourcis</div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Imprimer CR", description: "À brancher." })}>
                  <Printer className="mr-1 h-3.5 w-3.5" /> Imprimer
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "PDF", description: "Export à brancher." })}>
                  <Download className="mr-1 h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.openReschedule(c)} disabled={c.status === "completed"}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Reprogrammer
                </Button>
                {c.status !== "completed" && (
                  <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={() => ctx.openClose(c)} disabled={c.status === "cancelled" || c.status === "no_show"}>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Clôturer
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-muted-foreground">
              {c.prescriptions > 0 ? (
                <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""}</span>
              ) : "Aucune ordonnance liée"}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Dossier patient", description: "À brancher." })}>
                <User className="mr-1 h-3.5 w-3.5" /> Dossier patient
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Envoyer ordonnance", description: "À brancher." })}>
                <Send className="mr-1 h-3.5 w-3.5" /> Envoyer ordonnance
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConsultationKebab({ c }: { c: ConsultUi }) {
  const ctx = useConsultations();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => { ctx.setExpandedId(c.id); toast({ title: "Dossier patient", description: "À brancher." }); }}>
          <User className="mr-2 h-4 w-4" /> Ouvrir dossier patient
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Message", description: "Messagerie à brancher." })}>
          <Send className="mr-2 h-4 w-4" /> Envoyer un message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => ctx.openReschedule(c)} disabled={c.status === "completed"}>
          <Pencil className="mr-2 h-4 w-4" /> Reprogrammer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { ctx.setStatus(c.id, "cancelled"); toast({ title: "Annulé", description: ctx.consultLabel(c) }); }} disabled={c.status === "completed"}>
          <X className="mr-2 h-4 w-4" /> Annuler
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { ctx.setStatus(c.id, "no_show"); toast({ title: "No-show", description: ctx.consultLabel(c) }); }} disabled={c.status === "completed"}>
          <X className="mr-2 h-4 w-4" /> Marquer No-show
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast({ title: "Imprimer CR", description: "À brancher." })}>
          <Printer className="mr-2 h-4 w-4" /> Imprimer CR
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Exporter PDF", description: "À brancher." })}>
          <Download className="mr-2 h-4 w-4" /> Exporter PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => ctx.copy("Consultation", ctx.consultLabel(c))}>
          <FileText className="mr-2 h-4 w-4" /> Copier résumé
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── List ─────────────────────────────────────────────────────

export function ConsultationsList() {
  const ctx = useConsultations();

  if (ctx.filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Aucune consultation pour ces filtres</p>
        <p className="text-xs text-muted-foreground mt-1">Ajuste la période, le statut ou la recherche.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ctx.grouped.map(([date, items]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{date}</h3>
            <span className="text-xs text-muted-foreground">{items.length} consultation(s)</span>
          </div>
          <div className="space-y-2">
            {items.map((c) => <ConsultationCard key={c.id} c={c} />)}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground text-center">{ctx.filtered.length} consultation(s) affichée(s)</p>
    </div>
  );
}

// ── Actions Palette ──────────────────────────────────────────

export function ConsultationsActionsPalette() {
  const ctx = useConsultations();

  return (
    <Dialog open={ctx.actionsOpen} onOpenChange={ctx.setActionsOpen}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden">
        <div className="border-b p-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input ref={ctx.actionsInputRef} value={ctx.actionsQ} onChange={(e) => { ctx.setActionsQ(e.target.value); ctx.setActionsIdx(0); }} placeholder="Rechercher une action… (ex: amine, clôturer, reprogrammer, pdf)" className="h-9" />
            <Badge variant="secondary" className="text-[11px]">Ctrl+K</Badge>
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto">
          {ctx.actionsItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Aucune action trouvée</div>
          ) : (
            <div className="p-2">
              {ctx.actionsItems.map((item, idx) => (
                <button key={item.key} type="button" disabled={item.disabled}
                  className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${idx === ctx.actionsIdx ? "bg-primary/10" : "hover:bg-muted/40"} ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onMouseEnter={() => ctx.setActionsIdx(idx)}
                  onClick={() => { if (!item.disabled) item.run(); }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-3 flex items-center justify-between text-xs text-muted-foreground">
          <div>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => ctx.setActionsOpen(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Close Sheet ──────────────────────────────────────────────

export function ConsultationsCloseSheet() {
  const ctx = useConsultations();

  return (
    <Sheet open={ctx.closeOpen} onOpenChange={ctx.setCloseOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-base">Clôture de consultation</SheetTitle>
          <SheetDescription>{ctx.closingId ? `Consultation #${ctx.closingId}` : "—"} • Workflow (mock)</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            {([1, 2, 3] as const).map((s) => (
              <Button key={s} variant={ctx.closeStep === s ? "default" : "outline"} size="sm" className="text-xs h-8 px-3" onClick={() => ctx.setCloseStep(s)}>
                {s === 1 ? "1. Compte-rendu" : s === 2 ? "2. Prescriptions" : "3. Facturation"}
              </Button>
            ))}
          </div>

          {ctx.closeStep === 1 && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Diagnostic</Label>
                <Input value={ctx.closeForm.diagnosis} onChange={(e) => ctx.setCloseForm((f) => ({ ...f, diagnosis: e.target.value }))} placeholder="Ex: Angine virale, HTA non contrôlée…" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Compte-rendu</Label>
                <Textarea value={ctx.closeForm.notes} onChange={(e) => ctx.setCloseForm((f) => ({ ...f, notes: e.target.value }))} rows={5} className="mt-1" />
                <div className="mt-1 text-[11px] text-muted-foreground">Conseil : structure courte (motif → examen → décision).</div>
              </div>
            </div>
          )}

          {ctx.closeStep === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Ordonnance</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => ctx.setCloseForm((f) => ({ ...f, prescriptions: [...f.prescriptions, { medication: "", dosage: "" }] }))}>+ Ajouter</Button>
                </div>
                {ctx.closeForm.prescriptions.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <Input value={p.medication} onChange={(e) => { const u = [...ctx.closeForm.prescriptions]; u[i] = { ...u[i], medication: e.target.value }; ctx.setCloseForm((f) => ({ ...f, prescriptions: u })); }} placeholder="Médicament" className="h-9 text-xs" />
                    <Input value={p.dosage} onChange={(e) => { const u = [...ctx.closeForm.prescriptions]; u[i] = { ...u[i], dosage: e.target.value }; ctx.setCloseForm((f) => ({ ...f, prescriptions: u })); }} placeholder="Posologie" className="h-9 text-xs" />
                    {ctx.closeForm.prescriptions.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => ctx.setCloseForm((f) => ({ ...f, prescriptions: f.prescriptions.filter((_, j) => j !== i) }))}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Analyses prescrites</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => ctx.setCloseForm((f) => ({ ...f, analyses: [...f.analyses, ""] }))}>+ Ajouter</Button>
                </div>
                {ctx.closeForm.analyses.map((a, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <Input value={a} onChange={(e) => { const u = [...ctx.closeForm.analyses]; u[i] = e.target.value; ctx.setCloseForm((f) => ({ ...f, analyses: u })); }} placeholder="Type d'analyse" className="h-9 text-xs" />
                    {ctx.closeForm.analyses.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => ctx.setCloseForm((f) => ({ ...f, analyses: f.analyses.filter((_, j) => j !== i) }))}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ctx.closeStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Prochain RDV</Label>
                  <select value={ctx.closeForm.nextRdv} onChange={(e) => ctx.setCloseForm((f) => ({ ...f, nextRdv: e.target.value }))} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs">
                    <option value="">Pas de suivi</option>
                    <option value="1 semaine">1 semaine</option>
                    <option value="15 jours">15 jours</option>
                    <option value="1 mois">1 mois</option>
                    <option value="3 mois">3 mois</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Montant facturé (DT)</Label>
                  <Input value={ctx.closeForm.amount} onChange={(e) => ctx.setCloseForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1 h-9 text-xs" />
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Aperçu</div>
                <div className="text-sm font-medium text-foreground">{ctx.closingId ? `Consultation #${ctx.closingId}` : "—"}</div>
                <div className="text-xs text-muted-foreground">Diagnostic : {ctx.closeForm.diagnosis || "—"}</div>
                <div className="text-xs text-muted-foreground">Ordonnance : {ctx.closeForm.prescriptions.filter((p) => p.medication.trim()).length} médicament(s)</div>
                <div className="text-xs text-muted-foreground">Analyses : {ctx.closeForm.analyses.filter((a) => a.trim()).length} item(s)</div>
                <div className="text-xs text-muted-foreground">Suivi : {ctx.closeForm.nextRdv || "—"} • Montant : {ctx.closeForm.amount || "—"} DT</div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-4">
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Imprimer", description: "À brancher." })}>
              <Printer className="mr-1 h-3.5 w-3.5" /> Imprimer
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => ctx.setCloseOpen(false)}>Annuler</Button>
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={ctx.confirmClose}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Valider
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Reschedule Sheet ─────────────────────────────────────────

export function ConsultationsRescheduleSheet() {
  const ctx = useConsultations();

  return (
    <Sheet open={ctx.reschedOpen} onOpenChange={ctx.setReschedOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="text-base">Reprogrammer</SheetTitle>
          <SheetDescription>Modifier la date et l&apos;heure (mock).</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-xs">Date</Label>
            <Input value={ctx.reschedDate} onChange={(e) => ctx.setReschedDate(e.target.value)} className="mt-1" placeholder="Ex: 22 Fév 2026" />
          </div>
          <div>
            <Label className="text-xs">Heure</Label>
            <Input value={ctx.reschedTime} onChange={(e) => ctx.setReschedTime(e.target.value)} className="mt-1" placeholder="Ex: 14:30" />
          </div>
          <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
            Astuce : garde le format mock (ex: <span className="font-medium">20 Fév 2026</span>).
          </div>
        </div>
        <SheetFooter className="mt-4">
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => ctx.setReschedOpen(false)}>Annuler</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs" onClick={ctx.confirmReschedule}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Confirmer
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
