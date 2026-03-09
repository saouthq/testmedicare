/**
 * Admin Notification Campaigns — targeted push/sms/email with motif + audit
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Send, Eye, Bell, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

type CampaignStatus = "draft" | "sent";

interface Campaign {
  id: string;
  title: string;
  target: string;
  channel: string;
  message: string;
  status: CampaignStatus;
  sentAt?: string;
  recipientCount?: number;
}

const initialCampaigns: Campaign[] = [
  { id: "c-1", title: "Mise à jour conditions", target: "all", channel: "email", message: "Nos conditions d'utilisation ont été mises à jour...", status: "sent", sentAt: "15 Fév 2026", recipientCount: 12458 },
  { id: "c-2", title: "Rappel vaccin grippe", target: "patients", channel: "sms", message: "Pensez à vous faire vacciner contre la grippe...", status: "sent", sentAt: "10 Fév 2026", recipientCount: 8500 },
];

const targetLabels: Record<string, string> = { all: "Tous", patients: "Patients", doctors: "Médecins", pharmacies: "Pharmacies", laboratories: "Laboratoires" };
const channelLabels: Record<string, string> = { email: "Email", sms: "SMS", push: "Push" };

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("patients");
  const [channel, setChannel] = useState("sms");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [sendMotifOpen, setSendMotifOpen] = useState(false);

  const handleSend = (motif: string) => {
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      title: title || "Sans titre",
      target,
      channel,
      message,
      status: "sent",
      sentAt: new Date().toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }),
      recipientCount: target === "all" ? 12458 : target === "patients" ? 8500 : target === "doctors" ? 1245 : 300,
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    appendLog("campaign_sent", "notification_campaign", newCampaign.id, `Campagne "${title}" envoyée à ${targetLabels[target]} via ${channelLabels[channel]} — Motif : ${motif}`);
    toast({ title: "Campagne envoyée (mock)" });
    setTitle(""); setMessage(""); setShowCreate(false);
    setSendMotifOpen(false);
  };

  return (
    <DashboardLayout role="admin" title="Campagnes notifications">
      <div className="space-y-6 max-w-4xl">
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
                <label className="text-xs font-medium text-muted-foreground">Titre</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la campagne" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cible</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(targetLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Canal</label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Contenu du message..." className="mt-1 min-h-[100px]" />
            </div>

            {/* Preview */}
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
                <Send className="h-3 w-3 mr-1" />Envoyer
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
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{targetLabels[c.target]}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{channelLabels[c.channel]}</span>
                    <span className="text-[10px] text-accent flex items-center gap-0.5"><CheckCircle className="h-3 w-3" />Envoyé</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{c.sentAt}</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1 justify-end mt-1"><Users className="h-3 w-3" />{c.recipientCount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motif required before sending */}
      <MotifDialog
        open={sendMotifOpen}
        onClose={() => setSendMotifOpen(false)}
        onConfirm={handleSend}
        title="Confirmer l'envoi de la campagne"
        description={`${title} → ${targetLabels[target]} via ${channelLabels[channel]}`}
        confirmLabel="Envoyer la campagne"
      />
    </DashboardLayout>
  );
};

export default AdminCampaigns;
