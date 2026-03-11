/**
 * AdminAPIPartners — Gestion des clés API, webhooks, intégrations
 * // TODO BACKEND: Gérer les clés API et webhooks côté serveur
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Key, Webhook, Activity, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: "active" | "revoked";
  quotaUsed: number;
  quotaMax: number;
  lastUsed: string;
  createdAt: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  lastTriggered: string;
  failCount: number;
}

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  apiKeyName: string;
  timestamp: string;
  duration: string;
}

const initialKeys: ApiKey[] = [
  { id: "1", name: "Production - App Mobile", key: "mk_live_4f8a9b2c3d1e5f6g7h8i9j0k", status: "active", quotaUsed: 12450, quotaMax: 50000, lastUsed: "Il y a 2 min", createdAt: "Jan 2026" },
  { id: "2", name: "Staging - Tests", key: "mk_test_1a2b3c4d5e6f7g8h9i0j1k2l", status: "active", quotaUsed: 3200, quotaMax: 10000, lastUsed: "Il y a 1h", createdAt: "Fév 2026" },
  { id: "3", name: "Ancien partenaire", key: "mk_live_old_9z8y7x6w5v4u3t2s1r0q", status: "revoked", quotaUsed: 0, quotaMax: 50000, lastUsed: "15 Jan 2026", createdAt: "Nov 2025" },
];

const initialWebhooks: WebhookConfig[] = [
  { id: "1", url: "https://api.partenaire.tn/webhooks/appointments", events: ["appointment.created", "appointment.cancelled"], status: "active", lastTriggered: "Il y a 5 min", failCount: 0 },
  { id: "2", url: "https://crm.clinique-tunis.tn/api/hooks", events: ["patient.registered", "consultation.completed"], status: "active", lastTriggered: "Il y a 30 min", failCount: 2 },
  { id: "3", url: "https://old-system.tn/webhook", events: ["prescription.created"], status: "failing", lastTriggered: "Il y a 3j", failCount: 15 },
];

const initialLogs: ApiLog[] = [
  { id: "1", endpoint: "/api/v1/appointments", method: "GET", status: 200, apiKeyName: "Production", timestamp: "11:42:15", duration: "45ms" },
  { id: "2", endpoint: "/api/v1/patients/search", method: "POST", status: 200, apiKeyName: "Production", timestamp: "11:41:52", duration: "120ms" },
  { id: "3", endpoint: "/api/v1/prescriptions", method: "POST", status: 201, apiKeyName: "Staging", timestamp: "11:40:30", duration: "89ms" },
  { id: "4", endpoint: "/api/v1/doctors/5/slots", method: "GET", status: 200, apiKeyName: "Production", timestamp: "11:39:10", duration: "32ms" },
  { id: "5", endpoint: "/api/v1/teleconsult/session", method: "POST", status: 500, apiKeyName: "Production", timestamp: "11:38:45", duration: "2100ms" },
  { id: "6", endpoint: "/api/v1/notifications/send", method: "POST", status: 429, apiKeyName: "Staging", timestamp: "11:37:20", duration: "15ms" },
];

const allEvents = ["appointment.created", "appointment.cancelled", "appointment.updated", "patient.registered", "consultation.completed", "prescription.created", "payment.received"];

const AdminAPIPartners = () => {
  const [keys, setKeys] = useState(initialKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"key" | "webhook">("key");
  const [keyForm, setKeyForm] = useState({ name: "" });
  const [whForm, setWhForm] = useState({ url: "", events: [] as string[] });

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
    toast.success("Clé API révoquée");
  };

  const createKey = () => {
    if (!keyForm.name) { toast.error("Nom requis"); return; }
    const newKey: ApiKey = { id: String(Date.now()), name: keyForm.name, key: `mk_live_${Math.random().toString(36).slice(2, 26)}`, status: "active", quotaUsed: 0, quotaMax: 50000, lastUsed: "—", createdAt: "Mar 2026" };
    setKeys(prev => [newKey, ...prev]);
    setDrawerOpen(false);
    toast.success("Clé API créée");
  };

  const createWebhook = () => {
    if (!whForm.url || whForm.events.length === 0) { toast.error("URL et événements requis"); return; }
    setWebhooks(prev => [{ id: String(Date.now()), url: whForm.url, events: whForm.events, status: "active", lastTriggered: "—", failCount: 0 }, ...prev]);
    setDrawerOpen(false);
    toast.success("Webhook créé");
  };

  const toggleWebhook = (id: string) => setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "inactive" as const : "active" as const } : w));
  const deleteWebhook = (id: string) => { setWebhooks(prev => prev.filter(w => w.id !== id)); toast.success("Webhook supprimé"); };

  const statusColor = (s: number) => s >= 500 ? "text-destructive" : s >= 400 ? "text-warning" : "text-primary";

  return (
    <DashboardLayout role="admin" title="API & Partenaires">
      <Tabs defaultValue="keys">
        <TabsList className="mb-4"><TabsTrigger value="keys">Clés API</TabsTrigger><TabsTrigger value="webhooks">Webhooks</TabsTrigger><TabsTrigger value="logs">Logs API</TabsTrigger></TabsList>

        <TabsContent value="keys">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => { setDrawerType("key"); setKeyForm({ name: "" }); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" />Nouvelle clé</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Nom</TableHead><TableHead>Clé</TableHead><TableHead>Statut</TableHead>
                  <TableHead>Quota</TableHead><TableHead>Dernière utilisation</TableHead><TableHead />
                </TableRow></TableHeader>
                <TableBody>
                  {keys.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium text-sm">{k.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{showKey === k.id ? k.key : `${k.key.slice(0, 12)}…`}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowKey(showKey === k.id ? null : k.id)}>
                            {showKey === k.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copié"); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={k.status === "active" ? "default" : "destructive"}>{k.status === "active" ? "Active" : "Révoquée"}</Badge></TableCell>
                      <TableCell className="text-sm">{k.quotaUsed.toLocaleString()} / {k.quotaMax.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{k.lastUsed}</TableCell>
                      <TableCell>{k.status === "active" && <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => revokeKey(k.id)}>Révoquer</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => { setDrawerType("webhook"); setWhForm({ url: "", events: [] }); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" />Nouveau webhook</Button>
          </div>
          <div className="space-y-3">
            {webhooks.map(w => (
              <Card key={w.id} className={w.status === "failing" ? "border-destructive/30" : ""}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Webhook className="h-4 w-4 text-primary shrink-0" />
                      <code className="text-xs truncate">{w.url}</code>
                      <Badge variant={w.status === "active" ? "default" : w.status === "failing" ? "destructive" : "secondary"} className="text-[10px]">{w.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">{w.events.map(e => <Badge key={e} variant="outline" className="text-[9px]">{e}</Badge>)}</div>
                    <p className="text-xs text-muted-foreground">Dernier envoi : {w.lastTriggered} {w.failCount > 0 && `· ${w.failCount} échecs`}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Switch checked={w.status === "active"} onCheckedChange={() => toggleWebhook(w.id)} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteWebhook(w.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Heure</TableHead><TableHead>Méthode</TableHead><TableHead>Endpoint</TableHead>
                  <TableHead>Statut</TableHead><TableHead>Clé</TableHead><TableHead>Durée</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {initialLogs.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.timestamp}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] font-mono">{l.method}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{l.endpoint}</TableCell>
                      <TableCell><span className={`font-mono text-xs font-bold ${statusColor(l.status)}`}>{l.status}</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.apiKeyName}</TableCell>
                      <TableCell className="text-xs">{l.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{drawerType === "key" ? "Nouvelle clé API" : "Nouveau webhook"}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            {drawerType === "key" ? (
              <>
                <div><Label>Nom de la clé</Label><Input value={keyForm.name} onChange={e => setKeyForm({ name: e.target.value })} placeholder="Ex: Production App" /></div>
                <Button className="w-full" onClick={createKey}>Créer la clé</Button>
              </>
            ) : (
              <>
                <div><Label>URL du webhook</Label><Input value={whForm.url} onChange={e => setWhForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…" /></div>
                <div>
                  <Label>Événements</Label>
                  <div className="space-y-2 mt-2">
                    {allEvents.map(ev => (
                      <label key={ev} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={whForm.events.includes(ev)} onChange={e => setWhForm(p => ({ ...p, events: e.target.checked ? [...p.events, ev] : p.events.filter(x => x !== ev) }))} className="rounded" />
                        <code className="text-xs">{ev}</code>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={createWebhook}>Créer le webhook</Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminAPIPartners;
