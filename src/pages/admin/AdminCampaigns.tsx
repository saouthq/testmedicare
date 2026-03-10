/**
 * Admin Notification Campaigns — Full CRUD: create, edit, duplicate, cancel, resend
 * With segments, scheduling, preview, motif + audit
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Send, Eye, Bell, Users, CheckCircle, Clock, MapPin, Stethoscope,
  Shield, Filter, Copy, Pencil, XCircle, RotateCcw, Trash2, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

type CampaignStatus = "draft" | "sent" | "scheduled" | "cancelled";

interface Campaign {
  id: string;
  title: string;
  target: string;
  channel: string;
  message: string;
  status: CampaignStatus;
  sentAt?: string;
  scheduledAt?: string;
  recipientCount?: number;
  segmentCity?: string;
  segmentSpecialty?: string;
  openRate?: number;
  clickRate?: number;
  deliveryRate?: number;
}

const initialCampaigns: Campaign[] = [
  { id: "c-1", title: "Mise à jour conditions", target: "all", channel: "email", message: "Nos conditions d'utilisation ont été mises à jour. Veuillez les consulter sur votre espace.", status: "sent", sentAt: "15 Fév 2026", recipientCount: 12458, openRate: 42, clickRate: 12, deliveryRate: 98 },
  { id: "c-2", title: "Rappel vaccin grippe", target: "patients", channel: "sms", message: "Pensez à vous faire vacciner contre la grippe saisonnière. Consultez votre médecin sur Medicare.tn", status: "sent", sentAt: "10 Fév 2026", recipientCount: 8500, segmentCity: "Tunis", openRate: 68, clickRate: 18, deliveryRate: 96 },
  { id: "c-3", title: "Nouvelle fonctionnalité téléconsultation", target: "doctors", channel: "push", message: "La téléconsultation est maintenant disponible sur votre espace. Activez-la dans vos paramètres.", status: "sent", sentAt: "5 Fév 2026", recipientCount: 1245, openRate: 55, clickRate: 22, deliveryRate: 99 },
  { id: "c-4", title: "Promotion printemps médecins", target: "doctors", channel: "email", message: "Profitez de 3 mois offerts sur votre abonnement Pro jusqu'au 31 mars 2026 !", status: "scheduled", scheduledAt: "15 Mar 2026 09:00", recipientCount: 1245, segmentSpecialty: "Généraliste" },
  { id: "c-5", title: "Rappel analyse en attente", target: "patients", channel: "sms", message: "Vous avez des résultats d'analyses en attente de consultation. Connectez-vous à Medicare.tn", status: "draft", recipientCount: 3200 },
];

const targetLabels: Record<string, string> = { all: "Tous", patients: "Patients", doctors: "Médecins", pharmacies: "Pharmacies", laboratories: "Laboratoires" };
const channelLabels: Record<string, string> = { email: "Email", sms: "SMS", push: "Push" };
const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-accent/10 text-accent",
  scheduled: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};
const statusLabels: Record<string, string> = { draft: "Brouillon", sent: "Envoyée", scheduled: "Programmée", cancelled: "Annulée" };

const CITIES = ["Tunis", "Ariana", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte"];
const SPECIALTIES = ["Généraliste", "Cardiologue", "Dermatologue", "Pédiatre", "Ophtalmologue"];

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("patients");
  const [channel, setChannel] = useState("sms");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [motifAction, setMotifAction] = useState<{ type: string; id?: string } | null>(null);
  // Segments
  const [segmentEnabled, setSegmentEnabled] = useState(false);
  const [segmentCity, setSegmentCity] = useState("all");
  const [segmentSpecialty, setSegmentSpecialty] = useState("all");
  // Schedule
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  // Detail
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);
  // Filter
  const [statusFilter, setStatusFilter] = useState("all");

  const estimatedRecipients = useMemo(() => {
    let base = target === "all" ? 12458 : target === "patients" ? 8500 : target === "doctors" ? 1245 : 300;
    if (segmentEnabled && segmentCity !== "all") base = Math.round(base * 0.15);
    if (segmentEnabled && segmentSpecialty !== "all") base = Math.round(base * 0.2);
    return base;
  }, [target, segmentEnabled, segmentCity, segmentSpecialty]);

  const resetForm = () => {
    setTitle(""); setMessage(""); setTarget("patients"); setChannel("sms");
    setSegmentEnabled(false); setSegmentCity("all"); setSegmentSpecialty("all");
    setScheduleEnabled(false); setScheduleDate(""); setScheduleTime("09:00");
    setEditingId(null); setShowForm(false); setPreview(false);
  };

  const loadCampaignIntoForm = (c: Campaign) => {
    setTitle(c.title);
    setTarget(c.target);
    setChannel(c.channel);
    setMessage(c.message);
    setSegmentEnabled(!!(c.segmentCity || c.segmentSpecialty));
    setSegmentCity(c.segmentCity || "all");
    setSegmentSpecialty(c.segmentSpecialty || "all");
    if (c.scheduledAt) {
      setScheduleEnabled(true);
      const parts = c.scheduledAt.split(" ");
      setScheduleDate(parts[0] || "");
      setScheduleTime(parts[1] || "09:00");
    } else {
      setScheduleEnabled(false);
    }
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSendConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, id } = motifAction;

    if (type === "send" || type === "save_edit") {
      const segLabel = [segmentCity !== "all" ? segmentCity : "", segmentSpecialty !== "all" ? segmentSpecialty : ""].filter(Boolean).join(", ");
      
      if (editingId && type === "save_edit") {
        // Update existing
        setCampaigns(prev => prev.map(c => c.id === editingId ? {
          ...c, title: title || "Sans titre", target, channel, message,
          status: scheduleEnabled ? "scheduled" : c.status === "draft" ? "draft" : c.status,
          scheduledAt: scheduleEnabled ? `${scheduleDate} ${scheduleTime}` : c.scheduledAt,
          recipientCount: estimatedRecipients,
          segmentCity: segmentCity !== "all" ? segmentCity : undefined,
          segmentSpecialty: segmentSpecialty !== "all" ? segmentSpecialty : undefined,
        } : c));
        appendLog("campaign_updated", "notification_campaign", editingId, `Campagne "${title}" modifiée — Motif : ${motif}`);
        toast({ title: "Campagne modifiée" });
      } else {
        // Create new
        const newCampaign: Campaign = {
          id: `c-${Date.now()}`, title: title || "Sans titre", target, channel, message,
          status: scheduleEnabled ? "scheduled" : "sent",
          sentAt: scheduleEnabled ? undefined : new Date().toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }),
          scheduledAt: scheduleEnabled ? `${scheduleDate} ${scheduleTime}` : undefined,
          recipientCount: estimatedRecipients,
          segmentCity: segmentCity !== "all" ? segmentCity : undefined,
          segmentSpecialty: segmentSpecialty !== "all" ? segmentSpecialty : undefined,
          openRate: 0, clickRate: 0, deliveryRate: 0,
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        appendLog("campaign_sent", "notification_campaign", newCampaign.id,
          `Campagne "${title}" ${scheduleEnabled ? "programmée" : "envoyée"} à ${targetLabels[target]}${segLabel ? ` (${segLabel})` : ""} via ${channelLabels[channel]} — Motif : ${motif}`
        );
        toast({ title: scheduleEnabled ? "Campagne programmée" : "Campagne envoyée" });
      }
      resetForm();
    } else if (type === "cancel" && id) {
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "cancelled" as CampaignStatus } : c));
      appendLog("campaign_cancelled", "notification_campaign", id, `Campagne annulée — Motif : ${motif}`);
      toast({ title: "Campagne annulée" });
      if (detailCampaign?.id === id) setDetailCampaign(prev => prev ? { ...prev, status: "cancelled" } : null);
    } else if (type === "resend" && id) {
      const orig = campaigns.find(c => c.id === id);
      setCampaigns(prev => prev.map(c => c.id === id ? {
        ...c, status: "sent" as CampaignStatus,
        sentAt: new Date().toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }),
        openRate: 0, clickRate: 0, deliveryRate: 0,
      } : c));
      appendLog("campaign_resent", "notification_campaign", id, `Campagne "${orig?.title}" renvoyée — Motif : ${motif}`);
      toast({ title: "Campagne renvoyée" });
      if (detailCampaign?.id === id) setDetailCampaign(prev => prev ? { ...prev, status: "sent" } : null);
    } else if (type === "delete" && id) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      appendLog("campaign_deleted", "notification_campaign", id, `Campagne supprimée — Motif : ${motif}`);
      toast({ title: "Campagne supprimée" });
      setDetailCampaign(null);
    }
    setMotifAction(null);
  };

  const handleDuplicate = (c: Campaign) => {
    const dup: Campaign = {
      ...c, id: `c-${Date.now()}`, title: `${c.title} (copie)`,
      status: "draft", sentAt: undefined, scheduledAt: undefined,
      openRate: undefined, clickRate: undefined, deliveryRate: undefined,
    };
    setCampaigns(prev => [dup, ...prev]);
    appendLog("campaign_duplicated", "notification_campaign", dup.id, `Campagne "${c.title}" dupliquée`);
    toast({ title: "Campagne dupliquée" });
  };

  const handleSaveDraft = () => {
    if (!title.trim()) { toast({ title: "Titre obligatoire", variant: "destructive" }); return; }
    const draft: Campaign = {
      id: editingId || `c-${Date.now()}`, title, target, channel, message, status: "draft",
      recipientCount: estimatedRecipients,
      segmentCity: segmentCity !== "all" ? segmentCity : undefined,
      segmentSpecialty: segmentSpecialty !== "all" ? segmentSpecialty : undefined,
    };
    if (editingId) {
      setCampaigns(prev => prev.map(c => c.id === editingId ? { ...c, ...draft } : c));
    } else {
      setCampaigns(prev => [draft, ...prev]);
    }
    toast({ title: "Brouillon sauvegardé" });
    resetForm();
  };

  const stats = useMemo(() => ({
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === "sent").length,
    scheduled: campaigns.filter(c => c.status === "scheduled").length,
    draft: campaigns.filter(c => c.status === "draft").length,
    totalRecipients: campaigns.reduce((s, c) => s + (c.recipientCount || 0), 0),
    avgOpenRate: Math.round(campaigns.filter(c => c.openRate).reduce((s, c) => s + (c.openRate || 0), 0) / (campaigns.filter(c => c.openRate).length || 1)),
  }), [campaigns]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter(c => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const motifConfig: Record<string, { title: string; label: string; destructive: boolean }> = {
    send: { title: scheduleEnabled ? "Confirmer la programmation" : "Confirmer l'envoi", label: scheduleEnabled ? "Programmer" : "Envoyer", destructive: false },
    save_edit: { title: "Confirmer la modification", label: "Sauvegarder", destructive: false },
    cancel: { title: "Annuler la campagne", label: "Annuler la campagne", destructive: true },
    resend: { title: "Renvoyer la campagne", label: "Renvoyer", destructive: false },
    delete: { title: "Supprimer la campagne", label: "Supprimer définitivement", destructive: true },
  };
  const currentMotif = motifAction ? motifConfig[motifAction.type] : null;

  return (
    <DashboardLayout role="admin" title="Campagnes notifications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Bell className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{stats.sent}</p>
            <p className="text-xs text-muted-foreground">Envoyées</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card">
            <Clock className="h-5 w-5 text-warning mb-2" />
            <p className="text-2xl font-bold text-warning">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Programmées</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-card">
            <Pencil className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
            <p className="text-xs text-muted-foreground">Brouillons</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalRecipients.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Destinataires</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card">
            <BarChart3 className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{stats.avgOpenRate}%</p>
            <p className="text-xs text-muted-foreground">Taux ouverture moy.</p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {(["all", "sent", "scheduled", "draft", "cancelled"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "Toutes" : statusLabels[s]}
              </button>
            ))}
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => { resetForm(); setShowForm(true); }}>
            <Bell className="h-4 w-4 mr-1" />Nouvelle campagne
          </Button>
        </div>

        {/* Create/Edit form */}
        {showForm && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">
                {editingId ? "Modifier la campagne" : "Nouvelle campagne"}
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Titre *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la campagne" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Cible *</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(targetLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Canal *</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Message *</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Contenu du message..." className="mt-1 min-h-[100px]" />
            </div>

            {/* Segments */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <Label className="text-xs font-semibold">Segmentation avancée</Label>
                </div>
                <Switch checked={segmentEnabled} onCheckedChange={setSegmentEnabled} />
              </div>
              {segmentEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Ville</Label>
                    <Select value={segmentCity} onValueChange={setSegmentCity}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Toutes" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {(target === "doctors" || target === "all") && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Stethoscope className="h-3 w-3" />Spécialité</Label>
                      <Select value={segmentSpecialty} onValueChange={setSegmentSpecialty}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Toutes" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <Label className="text-xs font-semibold">Programmer l'envoi</Label>
                </div>
                <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
              </div>
              {scheduleEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Heure</Label>
                    <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="mt-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Estimated + Preview */}
            <div className="rounded-lg border bg-muted/20 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" />Estimation : <strong className="text-foreground">{estimatedRecipients.toLocaleString()}</strong> destinataires</span>
              {segmentEnabled && (segmentCity !== "all" || segmentSpecialty !== "all") && (
                <div className="flex gap-1">
                  {segmentCity !== "all" && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{segmentCity}</span>}
                  {segmentSpecialty !== "all" && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{segmentSpecialty}</span>}
                </div>
              )}
            </div>

            {preview && message && (
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Aperçu</p>
                <div className="rounded-lg bg-card border p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">{title || "Sans titre"}</p>
                  <p className="text-sm text-foreground">{message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">→ {targetLabels[target]} · {channelLabels[channel]}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setPreview(!preview)}>
                <Eye className="h-3 w-3 mr-1" />{preview ? "Masquer aperçu" : "Aperçu"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleSaveDraft}>
                <Pencil className="h-3 w-3 mr-1" />Sauvegarder brouillon
              </Button>
              <Button size="sm" className="gradient-primary text-primary-foreground" disabled={!title.trim() || !message.trim()}
                onClick={() => setMotifAction({ type: editingId ? "save_edit" : "send" })}>
                <Send className="h-3 w-3 mr-1" />{editingId ? "Sauvegarder" : scheduleEnabled ? "Programmer" : "Envoyer"}
              </Button>
            </div>
          </div>
        )}

        {/* Campaign list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            {statusFilter === "all" ? "Toutes les campagnes" : `Campagnes ${statusLabels[statusFilter]?.toLowerCase()}`} ({filtered.length})
          </h3>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune campagne trouvée</p>
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id} className={`rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer ${c.status === "cancelled" ? "opacity-60" : ""}`}
              onClick={() => setDetailCampaign(c)}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-foreground text-sm">{c.title}</h4>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.message}</p>
                  <div className="flex gap-2 mt-2 flex-wrap items-center">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{targetLabels[c.target]}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{channelLabels[c.channel]}</span>
                    {c.segmentCity && <span className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-full">{c.segmentCity}</span>}
                    {c.segmentSpecialty && <span className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded-full">{c.segmentSpecialty}</span>}
                    {c.openRate !== undefined && c.status === "sent" && (
                      <span className="text-[10px] text-muted-foreground">Ouverture: {c.openRate}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                  {(c.status === "draft" || c.status === "scheduled") && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Modifier" onClick={() => loadCampaignIntoForm(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Dupliquer" onClick={() => handleDuplicate(c)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {c.status === "scheduled" && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Annuler" onClick={() => setMotifAction({ type: "cancel", id: c.id })}>
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {c.status === "sent" && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" title="Renvoyer" onClick={() => setMotifAction({ type: "resend", id: c.id })}>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{c.sentAt || c.scheduledAt || "Non envoyée"}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.recipientCount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailCampaign} onOpenChange={v => !v && setDetailCampaign(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {detailCampaign && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">{detailCampaign.title}</SheetTitle>
                <SheetDescription className="sr-only">Détail de la campagne</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                {/* Status + badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[detailCampaign.status]}`}>{statusLabels[detailCampaign.status]}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{targetLabels[detailCampaign.target]}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{channelLabels[detailCampaign.channel]}</span>
                </div>

                {/* Message preview */}
                <div className="rounded-lg border p-4 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Message</p>
                  <p className="text-sm text-foreground">{detailCampaign.message}</p>
                </div>

                {/* Info */}
                <div className="rounded-lg border p-4 space-y-3">
                  {[
                    { label: "Destinataires", value: detailCampaign.recipientCount?.toLocaleString() || "—" },
                    { label: "Date d'envoi", value: detailCampaign.sentAt || "—" },
                    { label: "Programmée", value: detailCampaign.scheduledAt || "—" },
                    { label: "Segmentation ville", value: detailCampaign.segmentCity || "Toutes" },
                    { label: "Segmentation spécialité", value: detailCampaign.segmentSpecialty || "Toutes" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Stats if sent */}
                {detailCampaign.status === "sent" && detailCampaign.openRate !== undefined && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />Statistiques
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">{detailCampaign.deliveryRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Délivrés</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{detailCampaign.openRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Ouverts</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-accent">{detailCampaign.clickRate}%</p>
                        <p className="text-[10px] text-muted-foreground">Cliqués</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {(detailCampaign.status === "draft" || detailCampaign.status === "scheduled") && (
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setDetailCampaign(null); loadCampaignIntoForm(detailCampaign); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Modifier
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setDetailCampaign(null); handleDuplicate(detailCampaign); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" />Dupliquer
                  </Button>
                  {detailCampaign.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="w-full text-xs text-destructive border-destructive/30" onClick={() => setMotifAction({ type: "cancel", id: detailCampaign.id })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Annuler la campagne
                    </Button>
                  )}
                  {detailCampaign.status === "sent" && (
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setMotifAction({ type: "resend", id: detailCampaign.id })}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />Renvoyer
                    </Button>
                  )}
                  {(detailCampaign.status === "draft" || detailCampaign.status === "cancelled") && (
                    <Button size="sm" variant="outline" className="w-full text-xs text-destructive border-destructive/30" onClick={() => setMotifAction({ type: "delete", id: detailCampaign.id })}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Motif dialog */}
      <MotifDialog
        open={!!motifAction}
        onClose={() => setMotifAction(null)}
        onConfirm={handleSendConfirm}
        title={currentMotif?.title || "Confirmer"}
        description={
          motifAction?.type === "cancel" ? `Campagne : "${campaigns.find(c => c.id === motifAction.id)?.title}"`
          : motifAction?.type === "send" ? `${title} → ${targetLabels[target]} via ${channelLabels[channel]}`
          : motifAction?.id ? `Campagne : "${campaigns.find(c => c.id === motifAction.id)?.title}"`
          : ""
        }
        confirmLabel={currentMotif?.label || "Confirmer"}
        destructive={currentMotif?.destructive}
      />
    </DashboardLayout>
  );
};

export default AdminCampaigns;
