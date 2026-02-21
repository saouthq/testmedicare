import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Heart, Pill, Syringe, Upload, ChevronRight, Plus, AlertTriangle, X, Eye, Download, Calendar, Shield, Activity, Thermometer, Stethoscope, Scissors, Users, Apple, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Health section = menu list (Doctolib / iOS style) */
type HealthSection = "menu" | "documents" | "antecedents" | "treatments" | "allergies" | "habits" | "family" | "surgeries" | "vaccinations" | "measures" | "ai";

const menuItems: { key: HealthSection; label: string; icon: any; count?: number }[] = [
  { key: "documents", label: "Documents", icon: FileText, count: 5 },
  { key: "antecedents", label: "Antécédents médicaux", icon: Shield, count: 4 },
  { key: "treatments", label: "Traitements réguliers", icon: Pill, count: 2 },
  { key: "allergies", label: "Allergies", icon: AlertTriangle, count: 2 },
  { key: "habits", label: "Habitudes de vie", icon: Apple },
  { key: "family", label: "Antécédents familiaux", icon: Users, count: 2 },
  { key: "surgeries", label: "Opérations chirurgicales", icon: Scissors, count: 1 },
  { key: "vaccinations", label: "Vaccins", icon: Syringe, count: 4 },
  { key: "measures", label: "Mesures", icon: Thermometer },
];

/* Mock data */
import {
  mockHealthDocuments as documents,
  mockAntecedents as antecedents,
  mockTreatments as treatments,
  mockAllergies as allergies,
  mockHabits as habits,
  mockFamilyHistory as familyHistory,
  mockSurgeries as surgeries,
  mockVaccinations as vaccinations,
  mockMeasures as measures,
  mockPatientAiInitial as aiInitial,
  mockPatientAiResponses as aiMockResponses
} from "@/data/mockData";

/* AI chat */
import type { ChatMessage } from "@/data/mockData";
// AI data imported from mockData

const PatientHealth = () => {
  const [section, setSection] = useState<HealthSection>("menu");
  const [showUpload, setShowUpload] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(aiInitial);
  const [aiInput, setAiInput] = useState("");
  const [aiIdx, setAiIdx] = useState(0);

  const sendAi = () => {
    if (!aiInput.trim()) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setAiMessages(prev => [...prev, { id: Date.now().toString(), sender: "me", text: aiInput, time }]);
    setAiInput("");
    setTimeout(() => {
      setAiMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: aiMockResponses[aiIdx % aiMockResponses.length], time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
      setAiIdx(prev => prev + 1);
    }, 1000);
  };

  const SectionHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="text-primary hover:underline text-sm">← Retour</button>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
  );

  return (
    <DashboardLayout role="patient" title="Mon espace santé">
      <div className="max-w-2xl space-y-4">

        {/* ── MENU LIST (iOS style) ── */}
        {section === "menu" && (
          <div className="space-y-4">
            {/* Health completion prompt */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary/40 shrink-0" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">Complétez votre profil santé</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Recevez des rappels personnalisés et préparez vos consultations</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {menuItems.map(item => (
                <button key={item.key} onClick={() => setSection(item.key)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><item.icon className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">{item.label}</p></div>
                  <div className="flex items-center gap-2">
                    {item.count !== undefined && <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{item.count}</span>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>

            {/* AI assistant entry */}
            <button onClick={() => setSection("ai")} className="w-full rounded-xl border bg-card shadow-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Assistant virtuel IA</p>
                <p className="text-[11px] text-muted-foreground">Aide à l'orientation · Ne remplace pas un diagnostic</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {section === "documents" && (
          <div>
            <SectionHeader title="Documents" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3">
              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowUpload(!showUpload)}><Upload className="h-4 w-4 mr-1" />Importer</Button>
            </div>
            {showUpload && (
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center mb-3">
                <Upload className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground text-sm">Glissez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, images (max 10 Mo)</p>
              </div>
            )}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                  <div className={`p-2 rounded-lg ${d.type === "Analyse" ? "bg-accent/10" : d.type === "Ordonnance" ? "bg-primary/10" : "bg-muted"}`}>
                    <FileText className={`h-4 w-4 ${d.type === "Analyse" ? "text-accent" : d.type === "Ordonnance" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.source} · {d.date}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANTECEDENTS ── */}
        {section === "antecedents" && (
          <div>
            <SectionHeader title="Antécédents médicaux" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {antecedents.map((a, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{a.name}</p>{a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}</div>
                  {a.details && <p className="text-xs text-muted-foreground mt-0.5">{a.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TREATMENTS ── */}
        {section === "treatments" && (
          <div>
            <SectionHeader title="Traitements réguliers" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {treatments.map((t, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">En cours</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.dose} · Depuis {t.since}</p>
                  <p className="text-[11px] text-muted-foreground">Prescrit par {t.prescriber}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALLERGIES ── */}
        {section === "allergies" && (
          <div>
            <SectionHeader title="Allergies" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {allergies.map((a, i) => (
                <div key={i} className="p-3 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-destructive" />{a.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{a.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.reaction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HABITS ── */}
        {section === "habits" && (
          <div>
            <SectionHeader title="Habitudes de vie" onBack={() => setSection("menu")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {habits.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                  <p className="text-sm text-foreground">{h.label}</p>
                  <p className="text-sm font-medium text-foreground">{h.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAMILY ── */}
        {section === "family" && (
          <div>
            <SectionHeader title="Antécédents familiaux" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {familyHistory.map((f, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors">
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  {f.details && <p className="text-xs text-muted-foreground mt-0.5">{f.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SURGERIES ── */}
        {section === "surgeries" && (
          <div>
            <SectionHeader title="Opérations chirurgicales" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {surgeries.map((s, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{s.name}</p><span className="text-xs text-muted-foreground">{s.date}</span></div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.hospital}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VACCINATIONS ── */}
        {section === "vaccinations" && (
          <div>
            <SectionHeader title="Vaccins" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {vaccinations.map((v, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors">
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    <span>{v.doses}</span><span>·</span><span>Dernière : {v.lastDate}</span>
                    {v.nextDate && <><span>·</span><span className="text-primary font-medium">Prochain : {v.nextDate}</span></>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEASURES ── */}
        {section === "measures" && (
          <div>
            <SectionHeader title="Mesures" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Ajouter</Button></div>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {measures.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                  <div><p className="text-sm text-foreground">{m.label}</p><p className="text-[11px] text-muted-foreground">{m.date}</p></div>
                  <p className="text-sm font-bold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI ASSISTANT ── */}
        {section === "ai" && (
          <div>
            <SectionHeader title="Assistant virtuel IA" onBack={() => setSection("menu")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
              <div className="bg-warning/5 border-b border-warning/20 px-4 py-2.5">
                <p className="text-[11px] text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Cet assistant est informatif. Il ne remplace pas un diagnostic médical ni un avis professionnel.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" :
                      "bg-primary/5 border border-primary/20 text-foreground rounded-bl-sm"
                    }`}>
                      {msg.sender === "ai" && <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Bot className="h-3 w-3" />Assistant</p>}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Posez votre question..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAi()} className="flex-1" />
                  <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={sendAi} disabled={!aiInput.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PatientHealth;
