/**
 * Admin RDV Supervision — Enhanced with detail drawer, city/type/date filters, export CSV, pagination
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Search, Calendar, XCircle, Eye, Download, User, Clock, MapPin, Video, Building, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminAppointmentsSupabase } from "@/hooks/useAdminData";
import { getAppMode } from "@/stores/authStore";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface AdminApt {
  id: number;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "presentiel" | "teleconsultation";
  status: string;
  city: string;
  amount: string;
  paymentStatus: "paid" | "pending" | "refunded";
  notes?: string;
}

const initialApts: AdminApt[] = [
  { id: 1, patientName: "Fatma Trabelsi", doctorName: "Dr. Bouazizi", specialty: "Cardiologue", date: "2026-03-09", time: "14:30", type: "presentiel", status: "confirmed", city: "Tunis", amount: "80 DT", paymentStatus: "paid" },
  { id: 2, patientName: "Ali Ben Salem", doctorName: "Dr. Gharbi", specialty: "Dermatologue", date: "2026-03-09", time: "15:00", type: "teleconsultation", status: "confirmed", city: "Ariana", amount: "60 DT", paymentStatus: "paid" },
  { id: 3, patientName: "Sarra Mejri", doctorName: "Dr. Hammami", specialty: "Généraliste", date: "2026-03-10", time: "09:00", type: "presentiel", status: "pending", city: "Tunis", amount: "50 DT", paymentStatus: "pending" },
  { id: 4, patientName: "Mohamed Kaabi", doctorName: "Dr. Chebbi", specialty: "ORL", date: "2026-03-10", time: "10:30", type: "teleconsultation", status: "cancelled", city: "Sousse", amount: "70 DT", paymentStatus: "refunded", notes: "Annulé par le patient" },
  { id: 5, patientName: "Ines Mansour", doctorName: "Dr. Karray", specialty: "Pédiatre", date: "2026-03-10", time: "11:00", type: "presentiel", status: "absent", city: "Tunis", amount: "65 DT", paymentStatus: "paid" },
  { id: 6, patientName: "Youssef Trabelsi", doctorName: "Dr. Bouazizi", specialty: "Cardiologue", date: "2026-03-08", time: "09:30", type: "presentiel", status: "completed", city: "Tunis", amount: "80 DT", paymentStatus: "paid" },
  { id: 7, patientName: "Nadia Khelifi", doctorName: "Dr. Gharbi", specialty: "Dermatologue", date: "2026-03-08", time: "14:00", type: "teleconsultation", status: "completed", city: "Ariana", amount: "60 DT", paymentStatus: "paid" },
  { id: 8, patientName: "Karim Brahmi", doctorName: "Dr. Sfar", specialty: "Pneumologue", date: "2026-03-11", time: "08:30", type: "presentiel", status: "confirmed", city: "Sfax", amount: "75 DT", paymentStatus: "pending" },
  { id: 9, patientName: "Leila Hamdi", doctorName: "Dr. Hammami", specialty: "Généraliste", date: "2026-03-11", time: "10:00", type: "presentiel", status: "confirmed", city: "Sousse", amount: "50 DT", paymentStatus: "pending" },
  { id: 10, patientName: "Amir Jouini", doctorName: "Dr. Chebbi", specialty: "ORL", date: "2026-03-07", time: "16:00", type: "teleconsultation", status: "completed", city: "Tunis", amount: "70 DT", paymentStatus: "paid" },
  { id: 11, patientName: "Salma Rebai", doctorName: "Dr. Karray", specialty: "Pédiatre", date: "2026-03-09", time: "09:00", type: "presentiel", status: "absent", city: "Ariana", amount: "65 DT", paymentStatus: "paid", notes: "2ème absence consécutive" },
  { id: 12, patientName: "Hedi Chaabane", doctorName: "Dr. Bouazizi", specialty: "Cardiologue", date: "2026-03-12", time: "11:30", type: "presentiel", status: "pending", city: "Tunis", amount: "80 DT", paymentStatus: "pending" },
];

const statusLabels: Record<string, string> = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", absent: "Absent", completed: "Terminé" };
const statusColors: Record<string, string> = { confirmed: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", cancelled: "bg-muted text-muted-foreground", absent: "bg-destructive/10 text-destructive", completed: "bg-primary/10 text-primary" };
const payColors: Record<string, string> = { paid: "text-accent", pending: "text-warning", refunded: "text-destructive" };
const payLabels: Record<string, string> = { paid: "Payé", pending: "En attente", refunded: "Remboursé" };

const PAGE_SIZE = 8;

const AdminAppointments = () => {
  const [search, setSearch] = useState("");
  const [apts, setApts] = useState(initialApts);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [motifAction, setMotifAction] = useState<{ id: number; type: "cancel" | "absent" } | null>(null);
  const [detailApt, setDetailApt] = useState<AdminApt | null>(null);
  const [page, setPage] = useState(0);

  const cities = useMemo(() => Array.from(new Set(apts.map(a => a.city))), [apts]);

  const filtered = useMemo(() => apts.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (cityFilter !== "all" && a.city !== cityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q);
    }
    return true;
  }), [apts, statusFilter, typeFilter, cityFilter, search]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = useMemo(() => ({
    total: apts.length,
    confirmed: apts.filter(a => a.status === "confirmed").length,
    completed: apts.filter(a => a.status === "completed").length,
    absent: apts.filter(a => a.status === "absent").length,
    noShowRate: apts.length > 0 ? Math.round((apts.filter(a => a.status === "absent").length / apts.length) * 100) : 0,
    teleRate: apts.length > 0 ? Math.round((apts.filter(a => a.type === "teleconsultation").length / apts.length) * 100) : 0,
  }), [apts]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const apt = apts.find(a => a.id === motifAction.id);
    if (!apt) return;
    const newStatus = motifAction.type === "cancel" ? "cancelled" : "absent";
    setApts(prev => prev.map(a => a.id === motifAction.id ? { ...a, status: newStatus } : a));
    appendLog(`appointment_${motifAction.type}_override`, "appointment", String(motifAction.id),
      `${motifAction.type === "cancel" ? "RDV annulé" : "Marqué absent"} (admin) — ${apt.patientName} / ${apt.doctorName} — Motif : ${motif}`);
    toast({ title: motifAction.type === "cancel" ? "RDV annulé par l'admin" : "Marqué absent" });
    setMotifAction(null);
  };

  const handleExport = () => {
    const csv = ["Patient,Médecin,Spécialité,Date,Heure,Type,Statut,Ville,Montant,Paiement"]
      .concat(filtered.map(a => `${a.patientName},${a.doctorName},${a.specialty},${a.date},${a.time},${a.type},${statusLabels[a.status]},${a.city},${a.amount},${payLabels[a.paymentStatus]}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `rdv_export_${new Date().toISOString().split("T")[0]}.csv`; el.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  return (
    <DashboardLayout role="admin" title="Supervision RDV">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{stats.confirmed}</p>
            <p className="text-[11px] text-muted-foreground">Confirmés</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{stats.completed}</p>
            <p className="text-[11px] text-muted-foreground">Terminés</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
            <p className="text-[11px] text-muted-foreground">Absents</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{stats.noShowRate}%</p>
            <p className="text-[11px] text-muted-foreground">No-show</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{stats.teleRate}%</p>
            <p className="text-[11px] text-muted-foreground">Téléconsult</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Patient, médecin, spécialité..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9 text-xs" />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="presentiel">Cabinet</SelectItem>
                <SelectItem value="teleconsultation">Téléconsult</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={v => { setCityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-28 h-9 text-xs"><SelectValue placeholder="Ville" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes villes</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />Exporter CSV
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} résultat(s)</p>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead className="hidden lg:table-cell">Date & Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Ville</TableHead>
                <TableHead className="hidden md:table-cell">Paiement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun RDV trouvé</TableCell></TableRow>
              )}
              {paged.map(a => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailApt(a)}>
                  <TableCell className="font-medium text-foreground text-sm">{a.patientName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{a.doctorName}</p>
                      <p className="text-[10px] text-muted-foreground">{a.specialty}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{a.date} à {a.time}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${a.type === "teleconsultation" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {a.type === "teleconsultation" ? <Video className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                      {a.type === "teleconsultation" ? "Télé" : "Cabinet"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{a.city}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`text-xs font-medium ${payColors[a.paymentStatus]}`}>{a.amount}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailApt(a)}><Eye className="h-3.5 w-3.5" /></Button>
                      {(a.status === "confirmed" || a.status === "pending") && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setMotifAction({ id: a.id, type: "cancel" })}>Annuler</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-warning" onClick={() => setMotifAction({ id: a.id, type: "absent" })}>Absent</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailApt} onOpenChange={() => setDetailApt(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détail du rendez-vous</SheetTitle>
          </SheetHeader>
          {detailApt && (
            <div className="space-y-5 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[detailApt.status]}`}>{statusLabels[detailApt.status]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm text-foreground flex items-center gap-1">
                    {detailApt.type === "teleconsultation" ? <Video className="h-3.5 w-3.5 text-primary" /> : <Building className="h-3.5 w-3.5" />}
                    {detailApt.type === "teleconsultation" ? "Téléconsultation" : "Cabinet"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><User className="h-4 w-4 text-primary" />Patient</h4>
                <p className="text-sm text-foreground">{detailApt.patientName}</p>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><User className="h-4 w-4 text-accent" />Médecin</h4>
                <p className="text-sm text-foreground">{detailApt.doctorName}</p>
                <p className="text-xs text-muted-foreground">{detailApt.specialty}</p>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Date</span>
                  <span className="text-sm text-foreground">{detailApt.date} à {detailApt.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Ville</span>
                  <span className="text-sm text-foreground">{detailApt.city}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Paiement</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="text-sm font-semibold text-foreground">{detailApt.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <span className={`text-xs font-medium ${payColors[detailApt.paymentStatus]}`}>{payLabels[detailApt.paymentStatus]}</span>
                </div>
              </div>

              {detailApt.notes && (
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                  <p className="text-xs font-medium text-foreground mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{detailApt.notes}</p>
                </div>
              )}

              {(detailApt.status === "confirmed" || detailApt.status === "pending") && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30" onClick={() => { setDetailApt(null); setMotifAction({ id: detailApt.id, type: "cancel" }); }}>
                    <XCircle className="h-4 w-4 mr-1" />Annuler (admin)
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-warning border-warning/30" onClick={() => { setDetailApt(null); setMotifAction({ id: detailApt.id, type: "absent" }); }}>
                    Marquer absent
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifAction.type === "cancel" ? "Annuler le RDV (override admin)" : "Marquer absent (override admin)"}
          description="Cette action sera enregistrée dans les audit logs."
          confirmLabel={motifAction.type === "cancel" ? "Annuler le RDV" : "Marquer absent"}
          destructive
        />
      )}
    </DashboardLayout>
  );
};

export default AdminAppointments;
