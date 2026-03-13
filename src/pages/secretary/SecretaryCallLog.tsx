/**
 * SecretaryCallLog — Journal d'appels téléphoniques du cabinet.
 * Dual-mode: localStorage (demo) + Supabase call_log (production).
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Search,
  Plus, MessageSquare, Send, CheckCircle2, AlertCircle, X, Voicemail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { mockSecretaryTemplates } from "@/data/mockData";
import { getAppMode } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

type CallType = "incoming" | "outgoing" | "missed" | "voicemail";
type CallFilter = "all" | "incoming" | "outgoing" | "missed" | "voicemail";

interface CallEntry {
  id: number;
  caller: string;
  phone: string;
  type: CallType;
  time: string;
  date: string;
  duration?: string;
  motif: string;
  handled: boolean;
  note?: string;
  followUp?: string;
  priority?: boolean;
}

const mockCalls: CallEntry[] = [
  { id: 1, caller: "Hana Kammoun", phone: "+216 71 234 567", type: "incoming", time: "09:45", date: "20 Fév", duration: "3:22", motif: "Prise de RDV", handled: true, note: "RDV pris pour le 28 Fév 10:00" },
  { id: 2, caller: "Bilel Nasri", phone: "+216 22 345 678", type: "incoming", time: "09:30", date: "20 Fév", duration: "1:45", motif: "Annulation RDV", handled: true, note: "Annulé RDV du 25 Fév" },
  { id: 3, caller: "N° inconnu", phone: "+216 98 765 432", type: "missed", time: "09:15", date: "20 Fév", handled: false, motif: "Non répondu", priority: true },
  { id: 4, caller: "Olfa Ben Salah", phone: "+216 55 678 901", type: "incoming", time: "08:55", date: "20 Fév", duration: "5:10", motif: "Demande de résultats", handled: true, note: "Résultats pas encore prêts, rappeler" },
  { id: 5, caller: "Pharmacie El Manar", phone: "+216 71 888 999", type: "incoming", time: "08:40", date: "20 Fév", duration: "2:30", motif: "Vérification ordonnance", handled: true },
  { id: 6, caller: "Dr. Bouazizi → Sami Ayari", phone: "+216 29 678 901", type: "outgoing", time: "08:30", date: "20 Fév", duration: "1:15", motif: "Rappel RDV demain", handled: true },
  { id: 7, caller: "Fatma Trabelsi", phone: "+216 22 345 678", type: "voicemail", time: "08:10", date: "20 Fév", duration: "0:45", motif: "Message vocal", handled: false },
  { id: 8, caller: "Lab BioSanté", phone: "+216 71 789 012", type: "incoming", time: "17:30", date: "19 Fév", duration: "2:00", motif: "Résultats urgents prêts", handled: true, note: "Résultats Trabelsi disponibles" },
  { id: 9, caller: "Nadia Jemni", phone: "+216 98 567 890", type: "missed", time: "16:45", date: "19 Fév", handled: false, motif: "Non répondu", followUp: "Rappeler demain matin" },
  { id: 10, caller: "Assurance Maghrebia", phone: "+216 71 555 000", type: "incoming", time: "15:00", date: "19 Fév", duration: "8:20", motif: "Bulletin de soins", handled: true, note: "Convention OK pour patient Ben Ali" },
];

const typeConfig: Record<CallType, { label: string; icon: any; cls: string }> = {
  incoming: { label: "Entrant", icon: PhoneIncoming, cls: "text-accent bg-accent/10" },
  outgoing: { label: "Sortant", icon: PhoneOutgoing, cls: "text-primary bg-primary/10" },
  missed: { label: "Manqué", icon: PhoneMissed, cls: "text-destructive bg-destructive/10" },
  voicemail: { label: "Vocal", icon: Voicemail, cls: "text-warning bg-warning/10" },
};

/** Map Supabase row to local CallEntry */
function mapCallRow(row: any): CallEntry {
  return {
    id: row.id,
    caller: row.caller || "",
    phone: row.phone || "",
    type: row.call_type as CallType,
    time: row.time || "",
    date: row.date || "",
    duration: row.duration || undefined,
    motif: row.motif || "",
    handled: row.handled ?? false,
    note: row.note || undefined,
    followUp: row.follow_up || undefined,
    priority: row.priority ?? false,
  };
}

const SecretaryCallLog = () => {
  const [calls, setCalls] = useState(mockCalls);
  const [filter, setFilter] = useState<CallFilter>("all");
  const [search, setSearch] = useState("");
  const [showSMS, setShowSMS] = useState<CallEntry | null>(null);
  const [smsText, setSmsText] = useState("");
  const [showNewCall, setShowNewCall] = useState(false);
  const [newCallPatient, setNewCallPatient] = useState("");
  const [newCallPhone, setNewCallPhone] = useState("");
  const [newCallMotif, setNewCallMotif] = useState("");
  const [newCallNote, setNewCallNote] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Load from Supabase in production
  useEffect(() => {
    if (getAppMode() !== "production") return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setDoctorId(session.user.id);
      const { data } = await (supabase.from as any)("call_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data && data.length > 0) {
        setCalls(data.map(mapCallRow));
      }
    })();
  }, []);

  const filtered = calls.filter(c => {
    if (filter !== "all" && c.type !== filter) return false;
    if (search && !c.caller.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    return true;
  });

  const missedCount = calls.filter(c => c.type === "missed" && !c.handled).length;
  const voicemailCount = calls.filter(c => c.type === "voicemail" && !c.handled).length;
  const todayCount = calls.length;

  const handleMarkHandled = async (id: number) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, handled: true } : c));
    toast({ title: "Appel traité" });
    if (getAppMode() === "production") {
      try {
        await (supabase.from as any)("call_log").update({ handled: true }).eq("id", id);
      } catch {}
    }
  };

  const handleSendSMS = async () => {
    if (!showSMS || !smsText.trim()) return;
    toast({ title: "SMS envoyé", description: `Message envoyé à ${showSMS.caller} (${showSMS.phone})` });
    // Log SMS to sms_log in production
    if (getAppMode() === "production" && doctorId) {
      try {
        await (supabase.from as any)("sms_log").insert({
          doctor_id: doctorId,
          recipient: showSMS.caller,
          phone: showSMS.phone,
          message: smsText,
          sms_type: "manual",
          status: "sent",
          sent_at: new Date().toISOString(),
        });
      } catch {}
    }
    setShowSMS(null);
    setSmsText("");
  };

  const handleLogCall = async () => {
    if (!newCallPatient.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    const newCall: CallEntry = {
      id: Date.now(), caller: `Secrétaire → ${newCallPatient}`, phone: newCallPhone || "+216 XX XXX XXX",
      type: "outgoing", time: timeStr, date: dateStr, duration: "—",
      motif: newCallMotif || "Appel sortant", handled: true, note: newCallNote,
    };
    setCalls(prev => [newCall, ...prev]);
    setShowNewCall(false);
    setNewCallPatient(""); setNewCallPhone(""); setNewCallMotif(""); setNewCallNote("");
    toast({ title: "Appel enregistré" });

    // Persist to Supabase
    if (getAppMode() === "production" && doctorId) {
      try {
        await (supabase.from as any)("call_log").insert({
          doctor_id: doctorId,
          caller: newCall.caller,
          phone: newCall.phone,
          call_type: "outgoing",
          time: timeStr,
          date: dateStr,
          duration: "—",
          motif: newCall.motif,
          handled: true,
          note: newCallNote || "",
        });
      } catch (e) {
        console.warn("[SecretaryCallLog] insert failed:", e);
      }
    }
  };

  const applyTemplate = (tpl: typeof mockSecretaryTemplates[0]) => {
    const msg = tpl.message
      .replace("{patient}", showSMS?.caller || "Patient")
      .replace("{doctor}", "Dr. Bouazizi")
      .replace("{date}", "28 Fév 2026")
      .replace("{time}", "10:00");
    setSmsText(msg);
  };

  return (
    <DashboardLayout role="secretary" title="Journal d'appels">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Phone className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-foreground">{todayCount}</p><p className="text-[10px] text-muted-foreground">Total appels</p></div>
          </div>
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><PhoneMissed className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-lg font-bold text-destructive">{missedCount}</p><p className="text-[10px] text-muted-foreground">Non traités</p></div>
          </div>
          <div className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Voicemail className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{voicemailCount}</p><p className="text-[10px] text-muted-foreground">Vocaux</p></div>
          </div>
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{calls.filter(c => c.handled).length}</p><p className="text-[10px] text-muted-foreground">Traités</p></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {([
                { key: "all" as CallFilter, label: "Tous" },
                { key: "missed" as CallFilter, label: `Manqués (${missedCount})` },
                { key: "incoming" as CallFilter, label: "Entrants" },
                { key: "outgoing" as CallFilter, label: "Sortants" },
                { key: "voicemail" as CallFilter, label: "Vocaux" },
              ]).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 w-44 text-xs" />
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewCall(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Enregistrer un appel
          </Button>
        </div>

        {/* Call list */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="divide-y">
            {filtered.map(call => {
              const cfg = typeConfig[call.type];
              const Icon = cfg.icon;
              return (
                <div key={call.id} className={`p-4 hover:bg-muted/30 transition-colors ${!call.handled ? "bg-destructive/5" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${cfg.cls}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{call.caller}</span>
                        {call.priority && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                        {!call.handled && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Non traité</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{call.phone}</span>
                        <span>·</span>
                        <span>{call.date} à {call.time}</span>
                        {call.duration && <><span>·</span><span>{call.duration}</span></>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{call.motif}</p>
                      {call.note && <p className="text-xs text-foreground mt-1 bg-muted/50 rounded px-2 py-1">{call.note}</p>}
                      {call.followUp && <p className="text-xs text-warning mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{call.followUp}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!call.handled && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleMarkHandled(call.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Traité
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setShowSMS(call); setSmsText(""); }}>
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Phone className="h-3.5 w-3.5 text-accent" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun appel trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* SMS Modal */}
      {showSMS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowSMS(null)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Envoyer SMS</h3>
              <button onClick={() => setShowSMS(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">À : {showSMS.caller} · {showSMS.phone}</p>
            <div className="mb-3">
              <Label className="text-xs">Templates rapides</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {mockSecretaryTemplates.map(tpl => (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
            <Textarea value={smsText} onChange={e => setSmsText(e.target.value)} placeholder="Votre message..." rows={4} className="mb-3" />
            <p className="text-[10px] text-muted-foreground mb-3">{smsText.length}/160 caractères · {Math.ceil(smsText.length / 160) || 1} SMS</p>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSendSMS} disabled={!smsText.trim()}>
              <Send className="h-4 w-4 mr-2" />Envoyer
            </Button>
          </div>
        </div>
      )}

      {/* New Call Modal */}
      {showNewCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewCall(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><PhoneOutgoing className="h-5 w-5 text-primary" />Enregistrer un appel</h3>
              <button onClick={() => setShowNewCall(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><Label className="text-xs">Destinataire</Label><Input value={newCallPatient} onChange={e => setNewCallPatient(e.target.value)} placeholder="Nom du patient" className="mt-1" /></div>
              <div><Label className="text-xs">Téléphone</Label><Input value={newCallPhone} onChange={e => setNewCallPhone(e.target.value)} placeholder="+216 XX XXX XXX" className="mt-1" /></div>
              <div><Label className="text-xs">Motif</Label>
                <select value={newCallMotif} onChange={e => setNewCallMotif(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="">Sélectionner...</option>
                  <option>Rappel RDV</option><option>Confirmation RDV</option><option>Résultats disponibles</option>
                  <option>Demande de pièces</option><option>Suivi post-consultation</option><option>Information</option>
                </select>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea value={newCallNote} onChange={e => setNewCallNote(e.target.value)} rows={2} className="mt-1" placeholder="Notes de l'appel..." /></div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handleLogCall}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SecretaryCallLog;