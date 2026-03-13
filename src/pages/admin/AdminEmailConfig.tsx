/**
 * Admin Email & SMS Configuration — Connected to adminStore.settings
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo, useEffect } from "react";
import {
  Mail, MessageSquare, Send, CheckCircle, XCircle, Clock, AlertTriangle,
  Settings, Save, TestTube, Eye, BarChart3, RefreshCw, Zap, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/stores/adminStore";

// ── Mock delivery stats (badge "Données simulées") ──
const deliveryData = [
  { date: "01 Mar", emails: 342, sms: 189, push: 456, bounced: 12 },
  { date: "02 Mar", emails: 298, sms: 165, push: 423, bounced: 8 },
  { date: "03 Mar", emails: 415, sms: 210, push: 512, bounced: 15 },
  { date: "04 Mar", emails: 367, sms: 198, push: 478, bounced: 11 },
  { date: "05 Mar", emails: 445, sms: 234, push: 534, bounced: 9 },
  { date: "06 Mar", emails: 389, sms: 212, push: 498, bounced: 13 },
  { date: "07 Mar", emails: 478, sms: 256, push: 567, bounced: 7 },
  { date: "08 Mar", emails: 412, sms: 228, push: 523, bounced: 10 },
  { date: "09 Mar", emails: 356, sms: 201, push: 489, bounced: 14 },
];

const recentSends = [
  { id: "s-1", channel: "email", to: "fatma@email.tn", template: "RDV confirmé", status: "delivered", time: "09:45" },
  { id: "s-2", channel: "sms", to: "+216 71 234 567", template: "Rappel RDV", status: "delivered", time: "09:42" },
  { id: "s-3", channel: "email", to: "ali@email.tn", template: "Bienvenue patient", status: "bounced", time: "09:38" },
  { id: "s-4", channel: "push", to: "Dr. Bouazizi", template: "Nouveau RDV", status: "delivered", time: "09:30" },
  { id: "s-5", channel: "sms", to: "+216 73 456 789", template: "OTP Connexion", status: "delivered", time: "09:15" },
  { id: "s-6", channel: "email", to: "nadia@email.tn", template: "Ordonnance disponible", status: "failed", time: "09:10" },
];

const statusIcons: Record<string, any> = { delivered: CheckCircle, bounced: AlertTriangle, failed: XCircle };
const statusColors: Record<string, string> = { delivered: "text-accent", bounced: "text-warning", failed: "text-destructive" };
const statusLabels: Record<string, string> = { delivered: "Livré", bounced: "Rebondi", failed: "Échoué" };
const channelColors: Record<string, string> = { email: "bg-primary/10 text-primary", sms: "bg-accent/10 text-accent", push: "bg-warning/10 text-warning" };

const AdminEmailConfig = () => {
  const { settings, setSettings } = useAdminSettings();
  const [saved, setSaved] = useState(false);

  // Email config — initialize from store
  const [smtpHost, setSmtpHost] = useState(settings.emailConfig?.smtpHost || "smtp.medicare.tn");
  const [smtpPort, setSmtpPort] = useState(settings.emailConfig?.smtpPort || "587");
  const [smtpUser, setSmtpUser] = useState(settings.emailConfig?.smtpUser || "noreply@medicare.tn");
  const [smtpTls, setSmtpTls] = useState(settings.emailConfig?.smtpTls ?? true);
  const [fromName, setFromName] = useState(settings.emailConfig?.fromName || "Medicare.tn");
  const [fromEmail, setFromEmail] = useState(settings.emailConfig?.fromEmail || "noreply@medicare.tn");
  const [replyTo, setReplyTo] = useState(settings.emailConfig?.replyTo || "support@medicare.tn");

  // SMS config — from store
  const [smsProvider, setSmsProvider] = useState(settings.smsConfig?.provider || "tunisie_telecom");
  const [smsApiKey, setSmsApiKey] = useState("••••••••••••••••");
  const [smsSenderId, setSmsSenderId] = useState(settings.smsConfig?.senderId || "MEDICARE");
  const [smsEnabled, setSmsEnabled] = useState(settings.smsConfig?.enabled ?? true);
  const [smsRateLimit, setSmsRateLimit] = useState(settings.smsConfig?.rateLimit || "100");

  // Push config
  const [pushEnabled, setPushEnabled] = useState(settings.pushConfig?.enabled ?? true);
  const [pushVapidKey, setPushVapidKey] = useState("••••••••••••••••");

  // isDirty tracking
  const isDirty = useMemo(() => {
    const ec = settings.emailConfig || {};
    const sc = settings.smsConfig || {};
    return smtpHost !== (ec.smtpHost || "") || smtpPort !== (ec.smtpPort || "") ||
      smtpUser !== (ec.smtpUser || "") || smtpTls !== (ec.smtpTls ?? true) ||
      fromName !== (ec.fromName || "") || fromEmail !== (ec.fromEmail || "") || replyTo !== (ec.replyTo || "") ||
      smsProvider !== (sc.provider || "") || smsSenderId !== (sc.senderId || "") ||
      smsEnabled !== (sc.enabled ?? true) || smsRateLimit !== (sc.rateLimit || "") ||
      pushEnabled !== (settings.pushConfig?.enabled ?? true);
  }, [smtpHost, smtpPort, smtpUser, smtpTls, fromName, fromEmail, replyTo, smsProvider, smsSenderId, smsEnabled, smsRateLimit, pushEnabled, settings]);

  // Stats
  const totalEmails = deliveryData.reduce((s, d) => s + d.emails, 0);
  const totalSms = deliveryData.reduce((s, d) => s + d.sms, 0);
  const totalPush = deliveryData.reduce((s, d) => s + d.push, 0);
  const totalBounced = deliveryData.reduce((s, d) => s + d.bounced, 0);
  const deliveryRate = Math.round(((totalEmails + totalSms + totalPush - totalBounced) / (totalEmails + totalSms + totalPush)) * 100);

  const handleSave = () => {
    setSettings(prev => ({
      ...prev,
      emailConfig: { smtpHost, smtpPort, smtpUser, smtpTls, fromName, fromEmail, replyTo },
      smsConfig: { provider: smsProvider, senderId: smsSenderId, enabled: smsEnabled, rateLimit: smsRateLimit },
      pushConfig: { enabled: pushEnabled },
    }));
    appendLog("email_config_updated", "system", "email_config", "Configuration Email/SMS/Push mise à jour");
    setSaved(true);
    toast({ title: "Configuration sauvegardée" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestEmail = () => {
    appendLog("test_email_sent", "system", "email_test", "Email de test envoyé à support@medicare.tn");
    toast({ title: "Email de test envoyé (mock)", description: "support@medicare.tn" });
  };

  const handleTestSms = () => {
    appendLog("test_sms_sent", "system", "sms_test", "SMS de test envoyé");
    toast({ title: "SMS de test envoyé (mock)" });
  };

  return (
    <DashboardLayout role="admin" title="Email, SMS & Push">
      <div className="space-y-6">
        {isDirty && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning font-medium">Modifications non sauvegardées</span>
          </div>
        )}
        <Tabs defaultValue="stats">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="stats" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Statistiques</TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" />Email (SMTP)</TabsTrigger>
            <TabsTrigger value="sms" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />SMS</TabsTrigger>
            <TabsTrigger value="push" className="gap-1.5 text-xs"><Zap className="h-3.5 w-3.5" />Push</TabsTrigger>
          </TabsList>

          {/* ═══ STATS ═══ */}
          <TabsContent value="stats" className="space-y-6">
            <Badge variant="outline" className="text-xs text-muted-foreground"><Info className="h-3 w-3 mr-1" />Données simulées — Nécessite intégration backend</Badge>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border bg-card p-4 shadow-card text-center">
                <Mail className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{totalEmails.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Emails (9j)</p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card text-center">
                <MessageSquare className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{totalSms.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">SMS (9j)</p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card text-center">
                <Zap className="h-5 w-5 text-warning mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{totalPush.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Push (9j)</p>
              </div>
              <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{totalBounced}</p>
                <p className="text-[11px] text-muted-foreground">Rebonds</p>
              </div>
              <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
                <CheckCircle className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-2xl font-bold text-accent">{deliveryRate}%</p>
                <p className="text-[11px] text-muted-foreground">Taux livraison</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Volume d'envois (9 derniers jours)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deliveryData}>
                    <defs>
                      <linearGradient id="gEmail" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gSms" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                    <Area type="monotone" dataKey="emails" stroke="hsl(var(--primary))" fill="url(#gEmail)" strokeWidth={2} name="Emails" />
                    <Area type="monotone" dataKey="sms" stroke="hsl(var(--accent))" fill="url(#gSms)" strokeWidth={2} name="SMS" />
                    <Area type="monotone" dataKey="push" stroke="hsl(var(--warning))" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Push" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Envois récents</h3>
                <Button variant="ghost" size="sm" className="text-xs"><RefreshCw className="h-3 w-3 mr-1" />Actualiser</Button>
              </div>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Canal</TableHead><TableHead>Destinataire</TableHead><TableHead>Template</TableHead><TableHead>Statut</TableHead><TableHead>Heure</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {recentSends.map(s => {
                    const StatusIcon = statusIcons[s.status] || Clock;
                    return (
                      <TableRow key={s.id}>
                        <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase ${channelColors[s.channel]}`}>{s.channel}</span></TableCell>
                        <TableCell className="text-sm text-foreground font-mono text-xs">{s.to}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.template}</TableCell>
                        <TableCell><span className={`flex items-center gap-1 text-xs font-medium ${statusColors[s.status]}`}><StatusIcon className="h-3 w-3" />{statusLabels[s.status]}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.time}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ═══ EMAIL CONFIG ═══ */}
          <TabsContent value="email" className="space-y-6 max-w-2xl">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />Configuration SMTP</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs">Serveur SMTP</Label><Input className="mt-1" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} /></div>
                <div><Label className="text-xs">Port</Label><Input className="mt-1" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} /></div>
                <div><Label className="text-xs">Utilisateur</Label><Input className="mt-1" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} /></div>
                <div><Label className="text-xs">Mot de passe</Label><Input className="mt-1" type="password" value="••••••••" readOnly /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={smtpTls} onCheckedChange={setSmtpTls} />
                <Label className="text-xs">TLS / STARTTLS</Label>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <h3 className="font-semibold text-foreground">Expéditeur</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs">Nom affiché</Label><Input className="mt-1" value={fromName} onChange={e => setFromName(e.target.value)} /></div>
                <div><Label className="text-xs">Email expéditeur</Label><Input className="mt-1" value={fromEmail} onChange={e => setFromEmail(e.target.value)} /></div>
                <div><Label className="text-xs">Reply-To</Label><Input className="mt-1" value={replyTo} onChange={e => setReplyTo(e.target.value)} /></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleTestEmail}><TestTube className="h-3.5 w-3.5 mr-1" />Envoyer un email de test</Button>
              <div className="flex items-center gap-2">
                {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Sauvegardé</span>}
                <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ SMS CONFIG ═══ */}
          <TabsContent value="sms" className="space-y-6 max-w-2xl">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent" />Configuration SMS</h3>
                <div className="flex items-center gap-2"><Label className="text-xs text-muted-foreground">Service actif</Label><Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Fournisseur</Label>
                  <Select value={smsProvider} onValueChange={setSmsProvider}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunisie_telecom">Tunisie Telecom</SelectItem>
                      <SelectItem value="ooredoo">Ooredoo</SelectItem>
                      <SelectItem value="orange">Orange Tunisie</SelectItem>
                      <SelectItem value="twilio">Twilio (International)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Sender ID</Label><Input className="mt-1" value={smsSenderId} onChange={e => setSmsSenderId(e.target.value)} /></div>
                <div><Label className="text-xs">API Key</Label><Input className="mt-1" type="password" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} /></div>
                <div><Label className="text-xs">Rate limit (SMS/min)</Label><Input className="mt-1" type="number" value={smsRateLimit} onChange={e => setSmsRateLimit(e.target.value)} /></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleTestSms}><TestTube className="h-3.5 w-3.5 mr-1" />Envoyer un SMS de test</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
            </div>
          </TabsContent>

          {/* ═══ PUSH CONFIG ═══ */}
          <TabsContent value="push" className="space-y-6 max-w-2xl">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-warning" />Notifications Push</h3>
                <div className="flex items-center gap-2"><Label className="text-xs text-muted-foreground">Service actif</Label><Switch checked={pushEnabled} onCheckedChange={setPushEnabled} /></div>
              </div>
              <div className="grid gap-4">
                <div><Label className="text-xs">VAPID Public Key</Label><Input className="mt-1" type="password" value={pushVapidKey} onChange={e => setPushVapidKey(e.target.value)} /></div>
                <div><Label className="text-xs">VAPID Private Key</Label><Input className="mt-1" type="password" value="••••••••" readOnly /></div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmailConfig;
