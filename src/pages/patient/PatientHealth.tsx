import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Heart, Pill, Syringe, Upload, ChevronRight, Plus, AlertTriangle, X, Eye, Download, Calendar, Shield, Activity, Thermometer, Stethoscope, Scissors, Users, Apple, Bot, Send, Save, CheckCircle, Trash2, Pencil, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

type HealthSection = "menu" | "documents" | "antecedents" | "treatments" | "allergies" | "habits" | "family" | "surgeries" | "vaccinations" | "measures" | "ai";

const menuItemsDef: { key: HealthSection; label: string; icon: any }[] = [
  { key: "documents", label: "Documents", icon: FileText },
  { key: "antecedents", label: "Antécédents médicaux", icon: Shield },
  { key: "treatments", label: "Traitements réguliers", icon: Pill },
  { key: "allergies", label: "Allergies", icon: AlertTriangle },
  { key: "habits", label: "Habitudes de vie", icon: Apple },
  { key: "family", label: "Antécédents familiaux", icon: Users },
  { key: "surgeries", label: "Opérations chirurgicales", icon: Scissors },
  { key: "vaccinations", label: "Vaccins", icon: Syringe },
  { key: "measures", label: "Mesures", icon: Thermometer },
];

import {
  mockHealthDocuments as initialDocuments,
  mockAntecedents as initialAntecedents,
  mockTreatments as initialTreatments,
  mockAllergies as initialAllergies,
  mockHabits as initialHabits,
  mockFamilyHistory as initialFamily,
  mockSurgeries as initialSurgeries,
  mockVaccinations as initialVaccinations,
  mockMeasures as initialMeasures,
  mockPatientAiInitial as aiInitial,
  mockPatientAiResponses as aiMockResponses
} from "@/data/mockData";

import type { ChatMessage } from "@/data/mockData";

const PatientHealth = () => {
  const [section, setSection] = useState<HealthSection>("menu");
  const [showUpload, setShowUpload] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(aiInitial);
  const [aiInput, setAiInput] = useState("");
  const [aiIdx, setAiIdx] = useState(0);

  // Editable lists
  const [habits, setHabits] = useState(initialHabits);
  const [antecedents, setAntecedents] = useState(initialAntecedents);
  const [treatments, setTreatments] = useState(initialTreatments);
  const [allergies, setAllergies] = useState(initialAllergies);
  const [family, setFamily] = useState(initialFamily);
  const [surgeries, setSurgeries] = useState(initialSurgeries);
  const [vaccinations, setVaccinations] = useState(initialVaccinations);
  const [measures, setMeasures] = useState(initialMeasures);
  const [documents, setDocuments] = useState(initialDocuments);

  // Dynamic counts for menu
  const countMap: Record<string, number> = {
    documents: documents.length,
    antecedents: antecedents.length,
    treatments: treatments.length,
    allergies: allergies.length,
    habits: habits.length,
    family: family.length,
    surgeries: surgeries.length,
    vaccinations: vaccinations.length,
    measures: measures.length,
  };

  const menuItems = menuItemsDef.map(item => ({
    ...item,
    count: countMap[item.key],
  }));

  // Add/Edit modals
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, string> | null>(null);

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

  const handleDelete = (category: string, index: number) => {
    const setters: Record<string, (fn: (prev: any[]) => any[]) => void> = {
      antecedent: setAntecedents, treatment: setTreatments, allergy: setAllergies,
      habit: setHabits, family: setFamily, surgery: setSurgeries, vaccination: setVaccinations,
      measure: setMeasures, document: setDocuments,
    };
    const setter = setters[category];
    if (setter) {
      setter(prev => prev.filter((_, i) => i !== index));
      toast({ title: "Supprimé", description: "Élément supprimé avec succès." });
    }
  };

  const handleEdit = (category: string, index: number, item: any) => {
    setEditIndex(index);
    setEditData(Object.fromEntries(Object.entries(item).map(([k, v]) => [k, String(v ?? "")])));
    setShowAddModal(category);
  };

  const handleSave = (item: any) => {
    if (!showAddModal) return;
    const setters: Record<string, (fn: (prev: any[]) => any[]) => void> = {
      antecedent: setAntecedents, treatment: setTreatments, allergy: setAllergies,
      habit: setHabits, family: setFamily, surgery: setSurgeries, vaccination: setVaccinations,
      measure: setMeasures,
    };
    const setter = setters[showAddModal];
    if (setter) {
      if (editIndex !== null) {
        setter(prev => prev.map((p, i) => i === editIndex ? { ...p, ...item } : p));
        toast({ title: "Modifié", description: "Élément modifié avec succès." });
      } else {
        setter(prev => [...prev, item]);
        toast({ title: "Ajouté", description: "Élément ajouté avec succès." });
      }
    }
    setShowAddModal(null);
    setEditIndex(null);
    setEditData(null);
  };

  const ItemActions = ({ category, index, item }: { category: string; index: number; item: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => handleEdit(category, index, item)} className="text-xs">
          <Pencil className="h-3.5 w-3.5 mr-2" />Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(category, index)} className="text-xs text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-2" />Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SectionHeader = ({ title, onBack, onAdd }: { title: string; onBack: () => void; onAdd?: () => void }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-primary hover:underline text-sm">← Retour</button>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {onAdd && <Button size="sm" variant="outline" onClick={() => { setEditIndex(null); setEditData(null); onAdd(); }}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>}
    </div>
  );

  return (
    <DashboardLayout role="patient" title="Mon espace santé">
      <div className="max-w-2xl space-y-4">
        {/* MENU */}
        {section === "menu" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary/40 shrink-0" />
                <div><h3 className="font-bold text-foreground text-sm">Complétez votre profil santé</h3><p className="text-xs text-muted-foreground mt-0.5">Recevez des rappels personnalisés et préparez vos consultations</p></div>
              </div>
            </div>
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
            <button onClick={() => setSection("ai")} className="w-full rounded-xl border bg-card shadow-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-primary" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-foreground">Assistant virtuel IA</p><p className="text-[11px] text-muted-foreground">Aide à l'orientation · Ne remplace pas un diagnostic</p></div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* DOCUMENTS */}
        {section === "documents" && (
          <div>
            <SectionHeader title="Documents" onBack={() => setSection("menu")} />
            <div className="flex justify-end mb-3"><Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowUpload(!showUpload)}><Upload className="h-4 w-4 mr-1" />Importer</Button></div>
            {showUpload && (
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center mb-3">
                <Upload className="h-6 w-6 text-primary mx-auto mb-2" /><p className="font-medium text-foreground text-sm">Glissez vos fichiers ici</p><p className="text-xs text-muted-foreground mt-1">PDF, images (max 10 Mo)</p>
              </div>
            )}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                  <div className={`p-2 rounded-lg ${d.type === "Analyse" ? "bg-accent/10" : d.type === "Ordonnance" ? "bg-primary/10" : "bg-muted"}`}><FileText className={`h-4 w-4 ${d.type === "Analyse" ? "text-accent" : d.type === "Ordonnance" ? "text-primary" : "text-muted-foreground"}`} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.source} · {d.date}</p></div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete("document", i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANTECEDENTS */}
        {section === "antecedents" && (
          <div>
            <SectionHeader title="Antécédents médicaux" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("antecedent")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {antecedents.map((a, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{a.name}</p>{a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}</div>
                    {a.details && <p className="text-xs text-muted-foreground mt-0.5">{a.details}</p>}
                  </div>
                  <ItemActions category="antecedent" index={i} item={a} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TREATMENTS */}
        {section === "treatments" && (
          <div>
            <SectionHeader title="Traitements réguliers" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("treatment")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {treatments.map((t, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{t.name}</p><span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">En cours</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.dose} · Depuis {t.since}</p><p className="text-[11px] text-muted-foreground">Prescrit par {t.prescriber}</p>
                  </div>
                  <ItemActions category="treatment" index={i} item={t} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALLERGIES */}
        {section === "allergies" && (
          <div>
            <SectionHeader title="Allergies" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("allergy")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {allergies.map((a, i) => (
                <div key={i} className="p-3 bg-destructive/5 hover:bg-destructive/10 transition-colors flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-destructive" />{a.name}</p><span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{a.severity}</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.reaction}</p>
                  </div>
                  <ItemActions category="allergy" index={i} item={a} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HABITS */}
        {section === "habits" && (
          <div>
            <SectionHeader title="Habitudes de vie" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("habit")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {habits.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                  <p className="text-sm text-foreground">{h.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{h.value}</p>
                    <ItemActions category="habit" index={i} item={h} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAMILY */}
        {section === "family" && (
          <div>
            <SectionHeader title="Antécédents familiaux" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("family")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {family.map((f, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors flex items-start gap-2">
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">{f.name}</p>{f.details && <p className="text-xs text-muted-foreground mt-0.5">{f.details}</p>}</div>
                  <ItemActions category="family" index={i} item={f} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SURGERIES */}
        {section === "surgeries" && (
          <div>
            <SectionHeader title="Opérations chirurgicales" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("surgery")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {surgeries.map((s, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{s.name}</p><span className="text-xs text-muted-foreground">{s.date}</span></div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.hospital}</p>
                  </div>
                  <ItemActions category="surgery" index={i} item={s} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VACCINATIONS */}
        {section === "vaccinations" && (
          <div>
            <SectionHeader title="Vaccins" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("vaccination")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {vaccinations.map((v, i) => (
                <div key={i} className="p-3 hover:bg-muted/20 transition-colors flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{v.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span>{v.doses}</span><span>·</span><span>Dernière : {v.lastDate}</span>
                      {v.nextDate && <><span>·</span><span className="text-primary font-medium">Prochain : {v.nextDate}</span></>}
                    </div>
                  </div>
                  <ItemActions category="vaccination" index={i} item={v} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEASURES */}
        {section === "measures" && (
          <div>
            <SectionHeader title="Mesures" onBack={() => setSection("menu")} onAdd={() => setShowAddModal("measure")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden divide-y">
              {measures.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
                  <div><p className="text-sm text-foreground">{m.label}</p><p className="text-[11px] text-muted-foreground">{m.date}</p></div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{m.value}</p>
                    <ItemActions category="measure" index={i} item={m} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI */}
        {section === "ai" && (
          <div>
            <SectionHeader title="Assistant virtuel IA" onBack={() => setSection("menu")} />
            <div className="rounded-xl border bg-card shadow-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
              <div className="bg-warning/5 border-b border-warning/20 px-4 py-2.5"><p className="text-[11px] text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Cet assistant est informatif. Il ne remplace pas un diagnostic médical.</p></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-primary/5 border border-primary/20 text-foreground rounded-bl-sm"}`}>
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

      {/* ADD/EDIT MODAL */}
      {showAddModal && (
        <AddItemModal
          type={showAddModal}
          editData={editData}
          onClose={() => { setShowAddModal(null); setEditIndex(null); setEditData(null); }}
          onAdd={handleSave}
        />
      )}
    </DashboardLayout>
  );
};

const AddItemModal = ({ type, editData, onClose, onAdd }: { type: string; editData?: Record<string, string> | null; onClose: () => void; onAdd: (item: any) => void }) => {
  const [form, setForm] = useState<Record<string, string>>(editData || {});
  const isEdit = !!editData;

  const configs: Record<string, { title: string; fields: { key: string; label: string; placeholder: string; required?: boolean }[] }> = {
    antecedent: { title: isEdit ? "Modifier l'antécédent" : "Ajouter un antécédent", fields: [
      { key: "name", label: "Nom de l'antécédent", placeholder: "Ex: Asthme", required: true },
      { key: "date", label: "Date / Année", placeholder: "Ex: 2020" },
      { key: "details", label: "Détails", placeholder: "Précisions..." },
    ]},
    treatment: { title: isEdit ? "Modifier le traitement" : "Ajouter un traitement", fields: [
      { key: "name", label: "Nom du médicament", placeholder: "Ex: Metformine 850mg", required: true },
      { key: "dose", label: "Posologie", placeholder: "Ex: 1 comprimé matin et soir" },
      { key: "since", label: "Depuis", placeholder: "Ex: Janvier 2024" },
      { key: "prescriber", label: "Prescrit par", placeholder: "Ex: Dr. Bouazizi" },
    ]},
    allergy: { title: isEdit ? "Modifier l'allergie" : "Ajouter une allergie", fields: [
      { key: "name", label: "Allergène", placeholder: "Ex: Pénicilline", required: true },
      { key: "severity", label: "Sévérité", placeholder: "Ex: Sévère" },
      { key: "reaction", label: "Type de réaction", placeholder: "Ex: Urticaire, œdème" },
    ]},
    family: { title: isEdit ? "Modifier l'antécédent familial" : "Ajouter un antécédent familial", fields: [
      { key: "name", label: "Pathologie", placeholder: "Ex: Diabète type 2", required: true },
      { key: "details", label: "Détails (membre de la famille)", placeholder: "Ex: Père — diagnostiqué à 55 ans" },
    ]},
    surgery: { title: isEdit ? "Modifier l'opération" : "Ajouter une opération", fields: [
      { key: "name", label: "Type d'opération", placeholder: "Ex: Appendicectomie", required: true },
      { key: "date", label: "Date", placeholder: "Ex: Mars 2019" },
      { key: "hospital", label: "Établissement", placeholder: "Ex: Hôpital Charles Nicolle" },
    ]},
    vaccination: { title: isEdit ? "Modifier le vaccin" : "Ajouter un vaccin", fields: [
      { key: "name", label: "Nom du vaccin", placeholder: "Ex: Grippe saisonnière", required: true },
      { key: "doses", label: "Doses", placeholder: "Ex: 1 dose" },
      { key: "lastDate", label: "Date dernière dose", placeholder: "Ex: Oct 2025" },
      { key: "nextDate", label: "Prochain rappel (optionnel)", placeholder: "Ex: Oct 2026" },
    ]},
    measure: { title: isEdit ? "Modifier la mesure" : "Ajouter une mesure", fields: [
      { key: "label", label: "Type de mesure", placeholder: "Ex: Poids", required: true },
      { key: "value", label: "Valeur", placeholder: "Ex: 75 kg", required: true },
      { key: "date", label: "Date", placeholder: "Ex: 20 Fév 2026" },
    ]},
    habit: { title: isEdit ? "Modifier l'habitude" : "Ajouter une habitude", fields: [
      { key: "label", label: "Catégorie", placeholder: "Ex: Tabac, Alcool, Sport", required: true },
      { key: "value", label: "Valeur", placeholder: "Ex: Non-fumeur", required: true },
    ]},
  };

  const config = configs[type];
  if (!config) return null;

  const canSubmit = config.fields.filter(f => f.required).every(f => form[f.key]?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">{config.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          {config.fields.map(f => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}{f.required && " *"}</Label>
              <Input
                value={form[f.key] || ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
            <Button className="flex-1 gradient-primary text-primary-foreground" disabled={!canSubmit} onClick={() => onAdd(form)}>
              <Save className="h-4 w-4 mr-1" />{isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHealth;
