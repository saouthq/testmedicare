/**
 * Admin RGPD & Compliance — with manual request creation, retention editing, bulk processing, CSV export
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Shield, Search, Eye, CheckCircle, Clock, Trash2, Download, Plus,
  FileText, User, AlertTriangle, RefreshCw, Database, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { useAdminCompliance } from "@/stores/adminStore";
import type { AdminDataRequest, AdminConsentLog, AdminRetentionPolicy, DataRequestType, DataRequestStatus } from "@/types/admin";

const typeLabels: Record<DataRequestType, string> = { export: "Export", delete: "Suppression", rectify: "Rectification", access: "Accès" };
const typeColors: Record<DataRequestType, string> = { export: "bg-primary/10 text-primary", delete: "bg-destructive/10 text-destructive", rectify: "bg-warning/10 text-warning", access: "bg-accent/10 text-accent" };
const statusLabels: Record<DataRequestStatus, string> = { pending: "En attente", processing: "En cours", completed: "Traité", rejected: "Refusé" };
const statusColors: Record<DataRequestStatus, string> = { pending: "bg-warning/10 text-warning border-warning/20", processing: "bg-primary/10 text-primary border-primary/20", completed: "bg-accent/10 text-accent border-accent/20", rejected: "bg-destructive/10 text-destructive border-destructive/20" };

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const AdminCompliance = () => {
  const { dataRequests: requests, consentLogs: consents, retentionPolicies: policies, setDataRequests: setRequests, setRetentionPolicies: setPolicies } = useAdminCompliance();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailRequest, setDetailRequest] = useState<AdminDataRequest | null>(null);
  const [motifAction, setMotifAction] = useState<{ id: string; type: "process" | "reject" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMotifOpen, setBulkMotifOpen] = useState(false);

  // Create request dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ userName: "", userEmail: "", type: "export" as DataRequestType, reason: "" });

  // Retention editing
  const [editingRetention, setEditingRetention] = useState<string | null>(null);
  const [retentionDays, setRetentionDays] = useState(0);

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
      ...r, status: newStatus as DataRequestStatus,
      processedAt: new Date().toISOString(),
      processedBy: "Admin",
      notes: motif,
    } : r));
    appendLog(`data_request_${newStatus}`, "compliance", motifAction.id, `Demande ${typeLabels[req.type]} de ${req.userName} — ${newStatus === "completed" ? "Traitée" : "Refusée"} — ${motif}`);
    toast({ title: newStatus === "completed" ? "Demande traitée" : "Demande refusée", description: req.userName });
    setMotifAction(null);
    if (detailRequest?.id === motifAction.id) setDetailRequest(null);
  };

  // Bulk process
  const handleBulkProcess = (motif: string) => {
    const ids = Array.from(selectedIds);
    setRequests(prev => prev.map(r => ids.includes(r.id) && r.status === "pending" ? {
      ...r, status: "completed" as DataRequestStatus, processedAt: new Date().toISOString(), processedBy: "Admin", notes: motif,
    } : r));
    appendLog("bulk_data_request_processed", "compliance", ids.join(","), `${ids.length} demande(s) traitées en masse — ${motif}`);
    toast({ title: `${ids.length} demande(s) traitée(s)` });
    setSelectedIds(new Set());
    setBulkMotifOpen(false);
  };

  // Create request
  const handleCreateRequest = () => {
    if (!createForm.userName || !createForm.userEmail || !createForm.reason) {
      toast({ title: "Tous les champs sont requis", variant: "destructive" }); return;
    }
    const newReq: AdminDataRequest = {
      id: `req-${Date.now()}`,
      type: createForm.type,
      userName: createForm.userName,
      userEmail: createForm.userEmail,
      userRole: "patient",
      reason: createForm.reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);
    appendLog("data_request_created", "compliance", newReq.id, `Demande ${typeLabels[newReq.type]} créée manuellement pour ${newReq.userName}`);
    toast({ title: "Demande créée", description: newReq.userName });
    setCreateOpen(false);
    setCreateForm({ userName: "", userEmail: "", type: "export", reason: "" });
  };

  // Retention editing
  const handleSaveRetention = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, retentionDays } : p));
    appendLog("retention_policy_edited", "compliance", id, `Jours de rétention modifiés à ${retentionDays}`);
    toast({ title: "Rétention mise à jour" });
    setEditingRetention(null);
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

  // Export requests CSV
  const handleExportRequests = () => {
    const csv = ["Utilisateur,Email,Type,Motif,Statut,Date,Traité par"]
      .concat(filteredRequests.map(r => `"${r.userName}","${r.userEmail}","${typeLabels[r.type]}","${r.reason}","${statusLabels[r.status]}","${r.createdAt}","${r.processedBy || "—"}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `rgpd_requests_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
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

          {/* REQUESTS TAB */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              {[
                { v: stats.total, l: "Total demandes", c: "" },
                { v: stats.pending, l: "En attente", c: "text-warning" },
                { v: stats.processing, l: "En cours", c: "text-primary" },
                { v: stats.completed, l: "Traités", c: "text-accent" },
                { v: stats.avgDays + "j", l: "Délai moyen", c: "" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 shadow-card text-center">
                  <p className={`text-2xl font-bold ${s.c || "text-foreground"}`}>{s.v}</p>
                  <p className="text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>

            {stats.pending > 0 && (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Conformité RGPD : 30 jours max</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.pending} demande(s) en attente de traitement.</p>
                </div>
              </div>
            )}

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
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" className="text-xs" onClick={handleExportRequests}>
                  <Download className="h-3.5 w-3.5 mr-1" />Export CSV
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Nouvelle demande
                </Button>
              </div>
            </div>

            {/* Bulk bar */}
            {selectedIds.size > 0 && (
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{selectedIds.size} sélectionnée(s)</span>
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => setBulkMotifOpen(true)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Traiter en masse
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setSelectedIds(new Set())}>Annuler</Button>
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><input type="checkbox" onChange={() => {
                      const pendingIds = filteredRequests.filter(r => r.status === "pending").map(r => r.id);
                      setSelectedIds(prev => prev.size === pendingIds.length ? new Set() : new Set(pendingIds));
                    }} /></TableHead>
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
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune demande trouvée</TableCell></TableRow>
                  )}
                  {filteredRequests.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailRequest(r)}>
                      <TableCell onClick={e => e.stopPropagation()}>
                        {r.status === "pending" && <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} />}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{r.userName}</p>
                          <p className="text-[10px] text-muted-foreground">{r.userEmail} · {r.userRole}</p>
                        </div>
                      </TableCell>
                      <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${typeColors[r.type]}`}>{typeLabels[r.type]}</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                      <TableCell><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailRequest(r)}><Eye className="h-3.5 w-3.5" /></Button>
                          {r.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-accent" onClick={() => setMotifAction({ id: r.id, type: "process" })}>
                                <CheckCircle className="h-3 w-3 mr-1" />Traiter
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => setMotifAction({ id: r.id, type: "reject" })}>Refuser</Button>
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

          {/* CONSENTS TAB */}
          <TabsContent value="consents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Historique des consentements</h3>
                <p className="text-xs text-muted-foreground">{consents.length} entrée(s)</p>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div><p className="font-medium text-foreground text-sm">{c.userName}</p><p className="text-[10px] text-muted-foreground">{c.userEmail}</p></div>
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

          {/* RETENTION TAB */}
          <TabsContent value="retention" className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Politiques de rétention des données</h3>
              <p className="text-xs text-muted-foreground">Configurez la durée de conservation et la purge automatique.</p>
            </div>

            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Données médicales protégées</p>
                <p className="text-xs text-muted-foreground mt-1">Rétention de 10 ans minimum (Art. 45 code santé publique tunisien).</p>
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
                        {editingRetention === p.id ? (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Rétention :</span>
                            <Input type="number" min={1} value={retentionDays} onChange={e => setRetentionDays(Number(e.target.value))} className="h-7 w-20 text-xs" />
                            <span>jours</span>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSaveRetention(p.id)}>OK</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingRetention(null)}>✕</Button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={() => { setEditingRetention(p.id); setRetentionDays(p.retentionDays); }}>
                            <Clock className="h-3 w-3" />Rétention : <strong className="text-foreground">{p.retentionDays}j</strong> ({Math.round(p.retentionDays / 365)} an(s)) ✎
                          </span>
                        )}
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
                  {[["Type", typeLabels[detailRequest.type]], ["Utilisateur", detailRequest.userName], ["Email", detailRequest.userEmail], ["Rôle", detailRequest.userRole], ["Date", formatDate(detailRequest.createdAt)]].map(([label, val]) => (
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
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Motif</p>
                  <p className="text-sm text-foreground leading-relaxed">{detailRequest.reason}</p>
                </div>
                {detailRequest.processedAt && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Traitement</p>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Par</span><span className="text-foreground">{detailRequest.processedBy}</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="text-foreground">{formatDate(detailRequest.processedAt)}</span></div>
                    {detailRequest.notes && <p className="text-xs text-muted-foreground mt-2 italic">{detailRequest.notes}</p>}
                  </div>
                )}
                {detailRequest.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => { setDetailRequest(null); setMotifAction({ id: detailRequest.id, type: "process" }); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Traiter
                    </Button>
                    <Button variant="outline" className="flex-1 text-destructive" onClick={() => { setDetailRequest(null); setMotifAction({ id: detailRequest.id, type: "reject" }); }}>Refuser</Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Create request dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nouvelle demande RGPD</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs">Nom *</Label><Input className="mt-1" value={createForm.userName} onChange={e => setCreateForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nom de l'utilisateur" /></div>
            <div><Label className="text-xs">Email *</Label><Input className="mt-1" type="email" value={createForm.userEmail} onChange={e => setCreateForm(f => ({ ...f, userEmail: e.target.value }))} placeholder="email@example.com" /></div>
            <div>
              <Label className="text-xs">Type de demande *</Label>
              <Select value={createForm.type} onValueChange={v => setCreateForm(f => ({ ...f, type: v as DataRequestType }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Export de données</SelectItem>
                  <SelectItem value="delete">Suppression</SelectItem>
                  <SelectItem value="rectify">Rectification</SelectItem>
                  <SelectItem value="access">Droit d'accès</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Motif *</Label><textarea className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]" value={createForm.reason} onChange={e => setCreateForm(f => ({ ...f, reason: e.target.value }))} placeholder="Raison de la demande..." /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleCreateRequest}><Plus className="h-4 w-4 mr-1" />Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motif dialogs */}
      {motifAction && (
        <MotifDialog open={!!motifAction} onClose={() => setMotifAction(null)} onConfirm={handleMotifConfirm}
          title={motifAction.type === "process" ? "Traiter la demande" : "Refuser la demande"}
          description="Cette action sera enregistrée dans les audit logs." confirmLabel={motifAction.type === "process" ? "Confirmer" : "Refuser"} destructive={motifAction.type === "reject"} />
      )}
      <MotifDialog open={bulkMotifOpen} onClose={() => setBulkMotifOpen(false)} onConfirm={handleBulkProcess}
        title={`Traiter ${selectedIds.size} demande(s) en masse`} description="Toutes les demandes sélectionnées seront marquées comme traitées." confirmLabel="Traiter toutes" />
    </DashboardLayout>
  );
};

export default AdminCompliance;
