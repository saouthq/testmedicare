/**
 * Admin Notification Campaigns — targeted push/sms/email with segments, motif + audit
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Send, Eye, Bell, Users, CheckCircle, Clock, MapPin, Stethoscope, Shield, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

type CampaignStatus = "draft" | "sent" | "scheduled";

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
}

const initialCampaigns: Campaign[] = [
  { id: "c-1", title: "Mise à jour conditions", target: "all", channel: "email", message: "Nos conditions d'utilisation ont été mises à jour...", status: "sent", sentAt: "15 Fév 2026", recipientCount: 12458 },
  { id: "c-2", title: "Rappel vaccin grippe", target: "patients", channel: "sms", message: "Pensez à vous faire vacciner contre la grippe...", status: "sent", sentAt: "10 Fév 2026", recipientCount: 8500, segmentCity: "Tunis" },
  { id: "c-3", title: "Nouvelle fonctionnalité téléconsultation", target: "doctors", channel: "push", message: "La téléconsultation est maintenant disponible sur votre espace.", status: "sent", sentAt: "5 Fév 2026", recipientCount: 1245 },
];

const targetLabels: Record<string, string> = { all: "Tous", patients: "Patients", doctors: "Médecins", pharmacies: "Pharmacies", laboratories: "Laboratoires" };
const channelLabels: Record<string, string> = { email: "Email", sms: "SMS", push: "Push" };

const CITIES = ["Tunis", "Ariana", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte"];
const SPECIALTIES = ["Généraliste", "Cardiologue", "Dermatologue", "Pédiatre", "Ophtalmologue"];

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("patients");
  const [channel, setChannel] = useState("sms");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [sendMotifOpen, setSendMotifOpen] = useState(false);
  // Segments
  const [segmentEnabled, setSegmentEnabled] = useState(false);
  const [segmentCity, setSegmentCity] = useState("all");
  const [segmentSpecialty, setSegmentSpecialty] = useState("all");
  // Schedule
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const estimatedRecipients = useMemo(() => {
    let base = target === "all" ? 12458 : target === "patients" ? 8500 : target === "doctors" ? 1245 : 300;
    if (segmentEnabled && segmentCity !== "all") base = Math.round(base * 0.15);
    if (segmentEnabled && segmentSpecialty !== "all") base = Math.round(base * 0.2);
    return base;
  }, [target, segmentEnabled, segmentCity, segmentSpecialty]);

  const handleSend = (motif: string) => {
    const segLabel = [segmentCity !== "all" ? segmentCity : "", segmentSpecialty !== "all" ? segmentSpecialty : ""].filter(Boolean).join(", ");
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      title: title || "Sans titre",
      target, channel, message,
      status: scheduleEnabled ? "scheduled" : "sent",
      sentAt: scheduleEnabled ? undefined : new Date().toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }),
      scheduledAt: scheduleEnabled ? `${scheduleDate} ${scheduleTime}` : undefined,
      recipientCount: estimatedRecipients,
      segmentCity: segmentCity || undefined,
      segmentSpecialty: segmentSpecialty || undefined,
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    appendLog("campaign_sent", "notification_campaign", newCampaign.id, 
      `Campagne "${title}" ${scheduleEnabled ? "programmée" : "envoyée"} à ${targetLabels[target]}${segLabel ? ` (${segLabel})` : ""} via ${channelLabels[channel]} — Motif : ${motif}`
    );
    toast({ title: scheduleEnabled ? "Campagne programmée (mock)" : "Campagne envoyée (mock)" });
    setTitle(""); setMessage(""); setShowCreate(false); setSendMotifOpen(false);
    setSegmentEnabled(false); setSegmentCity(""); setSegmentSpecialty("");
    setScheduleEnabled(false); setScheduleDate(""); setScheduleTime("09:00");
  };

  const stats = useMemo(() => ({
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === "sent").length,
    scheduled: campaigns.filter(c => c.status === "scheduled").length,
    totalRecipients: campaigns.reduce((s, c) => s + (c.recipientCount || 0), 0),
  }), [campaigns]);

  return (
    <DashboardLayout role="admin" title="Campagnes notifications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Bell className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Campagnes total</p>
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
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalRecipients.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Destinataires total</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Envoyez des notifications ciblées aux utilisateurs de la plateforme.</p>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowCreate(!showCreate)}>
            <Bell className="h-4 w-4 mr-1" />{showCreate ? "Annuler" : "Nouvelle campagne"}
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Nouvelle campagne</h3>
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
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Ville / Gouvernorat</Label>
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
              {segmentEnabled && (segmentCity || segmentSpecialty) && (
                <div className="flex gap-1">
                  {segmentCity && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{segmentCity}</span>}
                  {segmentSpecialty && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{segmentSpecialty}</span>}
                </div>
              )}
            </div>

            {preview && message && (
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Aperçu</p>
                <p className="text-sm text-foreground">{message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">→ {targetLabels[target]} · {channelLabels[channel]}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPreview(!preview)}>
                <Eye className="h-3 w-3 mr-1" />{preview ? "Masquer aperçu" : "Aperçu"}
              </Button>
              <Button size="sm" className="gradient-primary text-primary-foreground" disabled={!title.trim() || !message.trim()} onClick={() => setSendMotifOpen(true)}>
                <Send className="h-3 w-3 mr-1" />{scheduleEnabled ? "Programmer" : "Envoyer"}
              </Button>
            </div>
          </div>
        )}

        {/* Campaign history */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Historique des campagnes</h3>
          {campaigns.map(c => (
            <div key={c.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{c.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.message}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{targetLabels[c.target]}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{channelLabels[c.channel]}</span>
                    {c.status === "sent" && <span className="text-[10px] text-accent flex items-center gap-0.5"><CheckCircle className="h-3 w-3" />Envoyé</span>}
                    {c.status === "scheduled" && <span className="text-[10px] text-warning flex items-center gap-0.5"><Clock className="h-3 w-3" />Programmé</span>}
                    {c.segmentCity && <span className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-full">{c.segmentCity}</span>}
                    {c.segmentSpecialty && <span className="text-[10px] bg-accent/5 text-accent px-1.5 py-0.5 rounded-full">{c.segmentSpecialty}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{c.sentAt || c.scheduledAt}</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1 justify-end mt-1"><Users className="h-3 w-3" />{c.recipientCount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MotifDialog
        open={sendMotifOpen}
        onClose={() => setSendMotifOpen(false)}
        onConfirm={handleSend}
        title={scheduleEnabled ? "Confirmer la programmation" : "Confirmer l'envoi de la campagne"}
        description={`${title} → ${targetLabels[target]} via ${channelLabels[channel]}${segmentCity ? ` · ${segmentCity}` : ""}`}
        confirmLabel={scheduleEnabled ? "Programmer" : "Envoyer la campagne"}
      />
    </DashboardLayout>
  );
};

export default AdminCampaigns;
