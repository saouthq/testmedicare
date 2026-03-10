/**
 * Admin RGPD & Compliance — Data requests management, consent logs, retention policies
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Shield, Search, Eye, CheckCircle, Clock, Trash2, Download,
  FileText, User, AlertTriangle, RefreshCw, Database, Lock,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

// ── Types ──
type RequestType = "export" | "delete" | "rectify" | "access";
type RequestStatus = "pending" | "processing" | "completed" | "rejected";

interface DataRequest {
  id: string;
  type: RequestType;
  userName: string;
  userEmail: string;
  userRole: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

interface ConsentLog {
  id: string;
  userName: string;
  userEmail: string;
  consentType: string;
  action: "granted" | "revoked";
  timestamp: string;
  ip: string;
}

interface RetentionPolicy {
  id: string;
  dataType: string;
  description: string;
  retentionDays: number;
  autoDelete: boolean;
  lastPurge?: string;
}

// ── Mock Data ──
const mockRequests: DataRequest[] = [
  { id: "dr-1", type: "export", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", userRole: "patient", reason: "Je souhaite obtenir une copie de toutes mes données personnelles", status: "pending", createdAt: "2026-03-08T10:00:00" },
  { id: "dr-2", type: "delete", userName: "Ali Ben Salem", userEmail: "ali@email.tn", userRole: "patient", reason: "Suppression complète de mon compte et données associées", status: "processing", createdAt: "2026-03-06T14:00:00" },
  { id: "dr-3", type: "rectify", userName: "Dr. Karim Bouzid", userEmail: "karim@email.tn", userRole: "doctor", reason: "Correction de mon adresse professionnelle", status: "completed", createdAt: "2026-03-01T09:00:00", processedAt: "2026-03-02T11:00:00", processedBy: "Admin" },
  { id: "dr-4", type: "access", userName: "Sarra Mejri", userEmail: "sarra@email.tn", userRole: "patient", reason: "Consultation de l'historique de mes consentements", status: "completed", createdAt: "2026-02-28T16:00:00", processedAt: "2026-03-01T10:00:00", processedBy: "Admin" },
  { id: "dr-5", type: "export", userName: "Mohamed Kaabi", userEmail: "mohamed@email.tn", userRole: "patient", reason: "Portabilité des données vers un autre prestataire", status: "pending", createdAt: "2026-03-09T08:30:00" },
  { id: "dr-6", type: "delete", userName: "Labo XYZ", userEmail: "xyz@lab.tn", userRole: "laboratory", reason: "Fermeture définitive du compte laboratoire", status: "rejected", createdAt: "2026-02-20T11:00:00", processedAt: "2026-02-22T09:00:00", processedBy: "Admin", notes: "Données médicales en cours de traitement, suppression impossible avant finalisation" },
];

const mockConsents: ConsentLog[] = [
  { id: "cl-1", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", consentType: "Cookies analytiques", action: "granted", timestamp: "2026-03-08T10:00:00", ip: "196.203.45.12" },
  { id: "cl-2", userName: "Fatma Trabelsi", userEmail: "fatma@email.tn", consentType: "Notifications marketing", action: "revoked", timestamp: "2026-03-07T15:00:00", ip: "196.203.45.12" },
  { id: "cl-3", userName: "Ali Ben Salem", userEmail: "ali@email.tn", consentType: "Partage données avec labos", action: "granted", timestamp: "2026-03-06T09:00:00", ip: "197.15.22.45" },
  { id: "cl-4", userName: "Dr. Bouazizi", userEmail: "ahmed@email.tn", consentType: "CGU v2.4", action: "granted", timestamp: "2026-03-05T08:00:00", ip: "196.203.78.90" },
  { id: "cl-5", userName: "Sarra Mejri", userEmail: "sarra@email.tn", consentType: "Cookies analytiques", action: "revoked", timestamp: "2026-03-04T12:00:00", ip: "41.226.55.77" },
  { id: "cl-6", userName: "Mohamed Kaabi", userEmail: "mohamed@email.tn", consentType: "CGU v2.4", action: "granted", timestamp: "2026-03-03T14:00:00", ip: "197.15.33.44" },
  { id: "cl-7", userName: "Pharmacie El Amal", userEmail: "elamal@pharmacy.tn", consentType: "Conditions partenaires", action: "granted", timestamp: "2026-03-02T11:00:00", ip: "197.15.11.22" },
  { id: "cl-8", userName: "Ali Ben Salem", userEmail: "ali@email.tn", consentType: "Notifications SMS", action: "granted", timestamp: "2026-03-01T09:00:00", ip: "197.15.22.45" },
];

const mockPolicies: RetentionPolicy[] = [
  { id: "rp-1", dataType: "Sessions utilisateurs", description: "Tokens de session et logs de connexion", retentionDays: 30, autoDelete: true, lastPurge: "2026-03-07" },
  { id: "rp-2", dataType: "Logs d'audit", description: "Actions administratives et modifications", retentionDays: 365, autoDelete: true, lastPurge: "2026-03-01" },
  { id: "rp-3", dataType: "Dossiers médicaux", description: "Consultations, prescriptions, résultats d'analyses", retentionDays: 3650, autoDelete: false },
  { id: "rp-4", dataType: "Messages archivés", description: "Conversations patient-médecin terminées", retentionDays: 730, autoDelete: true, lastPurge: "2026-02-15" },
  { id: "rp-5", dataType: "Fichiers temporaires", description: "Uploads en attente, brouillons", retentionDays: 7, autoDelete: true, lastPurge: "2026-03-09" },
  { id: "rp-6", dataType: "Consentements", description: "Historique des acceptations/révocations", retentionDays: 1825, autoDelete: false },
  { id: "rp-7", dataType: "Comptes supprimés", description: "Données anonymisées post-suppression", retentionDays: 90, autoDelete: true, lastPurge: "2026-02-28" },
];

// ── Labels & colors ──
const typeLabels: Record<RequestType, string> = { export: "Export", delete: "Suppression", rectify: "Rectification", access: "Accès" };
const typeColors: Record<RequestType, string> = { export: "bg-primary/10 text-primary", delete: "bg-destructive/10 text-destructive", rectify: "bg-warning/10 text-warning", access: "bg-accent/10 text-accent" };
const statusLabels: Record<RequestStatus, string> = { pending: "En attente", processing: "En cours", completed: "Traité", rejected: "Refusé" };
const statusColors: Record<RequestStatus, string> = { pending: "bg-warning/10 text-warning border-warning/20", processing: "bg-primary/10 text-primary border-primary/20", completed: "bg-accent/10 text-accent border-accent/20", rejected: "bg-destructive/10 text-destructive border-destructive/20" };

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const AdminCompliance = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [consents] = useState(mockConsents);
  const [policies, setPolicies] = useState(mockPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailRequest, setDetailRequest] = useState<DataRequest | null>(null);
  const [motifAction, setMotifAction] = useState<{ id: string; type: "process" | "reject" } | null>(null);

  // Requests filtering
  const filteredRequests = useMemo(() => {
    let list = requests;
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    if (typeFilter !== "all") list = list.filter(r => r.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q));
    }
    return list;
  }, [requests, statusFilter, typeFilter, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    processing: requests.filter(r => r.status === "processing").length,
    completed: requests.filter(r => r.status === "completed").length,
    avgDays: "1.8",
  }), [requests]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const req = requests.find(r => r.id === motifAction.id);
    if (!req) return;
    const newStatus = motifAction.type === "process" ? "completed" : "rejected";
    setRequests(prev => prev.map(r => r.id === motifAction.id ? {
      ...r, status: newStatus as RequestStatus,
      processedAt: new Date().toISOString(),
      processedBy: "Admin",
      notes: motif,
    } : r));
    appendLog(`data_request_${newStatus}`, "compliance", motifAction.id, `Demande ${typeLabels[req.type]} de ${req.userName} — ${newStatus === "completed" ? "Traitée" : "Refusée"} — ${motif}`);
    toast({ title: newStatus === "completed" ? "Demande traitée" : "Demande refusée", description: req.userName });
    setMotifAction(null);
    if (detailRequest?.id === motifAction.id) setDetailRequest(null);
  };

  const handleToggleAutoDelete = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, autoDelete: !p.autoDelete } : p));
    const policy = policies.find(p => p.id === id);
    appendLog("retention_policy_changed", "compliance", id, `Politique "${policy?.dataType}" — Suppression auto ${policy?.autoDelete ? "désactivée" : "activée"}`);
    toast({ title: "Politique mise à jour" });
  };

  const handlePurge = (id: string) => {
    const policy = policies.find(p => p.id === id);
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, lastPurge: new Date().toISOString().split("T")[0] } : p));
    appendLog("data_purge", "compliance", id, `Purge manuelle "${policy?.dataType}"`);
    toast({ title: "Purge effectuée (mock)", description: policy?.dataType });
  };

  const handleExportConsents = () => {
    const csv = ["Utilisateur,Email,Type,Action,Date,IP"]
      .concat(consents.map(c => `"${c.userName}","${c.userEmail}","${c.consentType}","${c.action}","${c.timestamp}","${c.ip}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `consents_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  return (
    <DashboardLayout role="admin" title="RGPD & Conformité">
      <div className="space-y-6">
        <Tabs defaultValue="requests">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="requests" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Demandes données ({stats.pending} en attente)</TabsTrigger>
            <TabsTrigger value="consents" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Consentements</TabsTrigger>
            <TabsTrigger value="retention" className="gap-1.5 text-xs"><Database className="h-3.5 w-3.5" />Rétention</TabsTrigger>
          </TabsList>

          {/* ═══ REQUESTS TAB ═══ */}
          <TabsContent value="requests" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border bg-card p-4 shadow-card text-center">
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-[11px] text-muted-foreground">Total demandes</p>
              </div>
              <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-[11px] text-muted-foreground">En attente</p>
              </div>
              <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
                <p className="text-2xl font-bold text-primary">{stats.processing}</p>
                <p className="text-[11px] text-muted-foreground">En cours</p>
              </div>
              <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
                <p className="text-2xl font-bold text-accent">{stats.completed}</p>
                <p className="text-[11px] text-muted-foreground">Traités</p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card text-center">
                <p className="text-2xl font-bold text-foreground">{stats.avgDays}j</p>
                <p className="text-[11px] text-muted-foreground">Délai moyen</p>
              </div>
            </div>

            {/* SLA Warning */}
            {stats.pending > 0 && (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Conformité RGPD : 30 jours max</p>
                  <p className="text-xs text-muted-foreground mt-1">Les demandes d'exercice de droits doivent être traitées dans un délai maximum de 30 jours (Art. 12 RGPD). {stats.pending} demande(s) en attente.</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher utilisateur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="delete">Suppression</SelectItem>
                  <SelectItem value="rectify">Rectification</SelectItem>
                  <SelectItem value="access">Accès</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Traités</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucune demande trouvée</TableCell></TableRow>
                  )}
                  {filteredRequests.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailRequest(r)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{r.userName}</p>
                          <p className="text-[10px] text-muted-foreground">{r.userEmail} · {r.userRole}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${typeColors[r.type]}`}>{typeLabels[r.type]}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailRequest(r)}><Eye className="h-3.5 w-3.5" /></Button>
                          {r.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-accent" onClick={() => setMotifAction({ id: r.id, type: "process" })}>
                                <CheckCircle className="h-3 w-3 mr-1" />Traiter
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setMotifAction({ id: r.id, type: "reject" })}>
                                Refuser
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ═══ CONSENTS TAB ═══ */}
          <TabsContent value="consents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Historique des consentements</h3>
                <p className="text-xs text-muted-foreground">{consents.length} entrée(s) — Traçabilité complète des acceptations et révocations</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleExportConsents}>
                <Download className="h-3.5 w-3.5 mr-1" />Export CSV
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type de consentement</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{c.userName}</p>
                          <p className="text-[10px] text-muted-foreground">{c.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{c.consentType}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${c.action === "granted" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                          {c.action === "granted" ? <CheckCircle className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                          {c.action === "granted" ? "Accepté" : "Révoqué"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(c.timestamp)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{c.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ═══ RETENTION TAB ═══ */}
          <TabsContent value="retention" className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Politiques de rétention des données</h3>
              <p className="text-xs text-muted-foreground">Configurez la durée de conservation et la purge automatique des données.</p>
            </div>

            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Données médicales protégées</p>
                <p className="text-xs text-muted-foreground mt-1">Les dossiers médicaux ont une rétention de 10 ans minimum (Article 45 du code de santé publique tunisien). La suppression automatique est désactivée pour ces données.</p>
              </div>
            </div>

            <div className="space-y-3">
              {policies.map(p => (
                <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">{p.dataType}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Rétention : <strong className="text-foreground">{p.retentionDays}j</strong> ({Math.round(p.retentionDays / 365)} an(s))</span>
                        {p.lastPurge && <span>Dernière purge : {p.lastPurge}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-muted-foreground">Auto-purge</Label>
                        <Switch checked={p.autoDelete} onCheckedChange={() => handleToggleAutoDelete(p.id)} />
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handlePurge(p.id)} disabled={!p.autoDelete}>
                        <RefreshCw className="h-3 w-3 mr-1" />Purger
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle>Demande d'exercice de droits</SheetTitle>
            <SheetDescription className="sr-only">Détail de la demande RGPD</SheetDescription>
          </SheetHeader>
          {detailRequest && (
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                <div className="rounded-lg border p-4 space-y-3">
                  {[
                    ["Type", typeLabels[detailRequest.type]],
                    ["Utilisateur", detailRequest.userName],
                    ["Email", detailRequest.userEmail],
                    ["Rôle", detailRequest.userRole],
                    ["Date", formatDate(detailRequest.createdAt)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[detailRequest.status]}`}>{statusLabels[detailRequest.status]}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Motif de la demande</p>
                  <p className="text-sm text-foreground leading-relaxed">{detailRequest.reason}</p>
                </div>

                {detailRequest.processedAt && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Traitement</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Par</span>
                      <span className="text-foreground">{detailRequest.processedBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">{formatDate(detailRequest.processedAt)}</span>
                    </div>
                    {detailRequest.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{detailRequest.notes}</p>
                    )}
                  </div>
                )}

                {detailRequest.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => { setDetailRequest(null); setMotifAction({ id: detailRequest.id, type: "process" }); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Traiter
                    </Button>
                    <Button variant="outline" className="flex-1 text-destructive" onClick={() => { setDetailRequest(null); setMotifAction({ id: detailRequest.id, type: "reject" }); }}>
                      Refuser
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Motif dialog */}
      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifAction.type === "process" ? "Traiter la demande" : "Refuser la demande"}
          description="Cette action sera enregistrée dans les audit logs conformément à la réglementation."
          confirmLabel={motifAction.type === "process" ? "Confirmer le traitement" : "Confirmer le refus"}
          destructive={motifAction.type === "reject"}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminCompliance;
