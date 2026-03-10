/**
 * SpecialtyTools — Specialty-specific consultation components
 * Renders the appropriate tools based on doctor's current specialty.
 * Each specialty gets its own interactive section inside the consultation.
 */
import { useState } from "react";
import {
  Eye, Heart, Baby, Ear, Brain, Smile, Bone, Camera, Activity,
  ChevronDown, ChevronUp, CheckCircle2, Plus, X, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";

// ── Ophthalmology ────────────────────────────────────────────
function OphtalmoTools() {
  const [acuityOD, setAcuityOD] = useState("10/10");
  const [acuityOG, setAcuityOG] = useState("10/10");
  const [correctionOD, setCorrectionOD] = useState("");
  const [correctionOG, setCorrectionOG] = useState("");
  const [tonometry, setTonometry] = useState("");
  const [fundus, setFundus] = useState("Normal");
  const [slitLamp, setSlitLamp] = useState("");
  const [prescType, setPrescType] = useState<"lunettes" | "lentilles" | "">("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-blue-500" />Acuité visuelle
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Œil droit (OD)</label>
            <Input value={acuityOD} onChange={e => setAcuityOD(e.target.value)} className="h-8 text-xs mt-1" placeholder="10/10" />
            <Input value={correctionOD} onChange={e => setCorrectionOD(e.target.value)} className="h-8 text-xs mt-1.5" placeholder="Correction: -2.5 (+0.75 à 90°)" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Œil gauche (OG)</label>
            <Input value={acuityOG} onChange={e => setAcuityOG(e.target.value)} className="h-8 text-xs mt-1" placeholder="10/10" />
            <Input value={correctionOG} onChange={e => setCorrectionOG(e.target.value)} className="h-8 text-xs mt-1.5" placeholder="Correction: -1.75 (+0.50 à 85°)" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <label className="text-xs font-medium text-muted-foreground">Tonométrie (mmHg)</label>
          <Input value={tonometry} onChange={e => setTonometry(e.target.value)} className="h-8 text-xs mt-1" placeholder="OD: 14 / OG: 15" />
        </div>
        <div className="rounded-lg border p-3">
          <label className="text-xs font-medium text-muted-foreground">Fond d'œil</label>
          <select value={fundus} onChange={e => setFundus(e.target.value)} className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs mt-1">
            <option value="Normal">Normal</option>
            <option value="Rétinopathie">Rétinopathie</option>
            <option value="Glaucome suspecté">Glaucome suspecté</option>
            <option value="DMLA">DMLA</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <label className="text-xs font-medium text-muted-foreground">Examen à la lampe à fente</label>
        <textarea value={slitLamp} onChange={e => setSlitLamp(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={2} placeholder="Segment antérieur normal, cornée claire, cristallin transparent..." />
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <label className="text-xs font-medium text-muted-foreground">Prescription optique</label>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant={prescType === "lunettes" ? "default" : "outline"} className="text-xs h-7" onClick={() => setPrescType("lunettes")}>
            👓 Lunettes
          </Button>
          <Button size="sm" variant={prescType === "lentilles" ? "default" : "outline"} className="text-xs h-7" onClick={() => setPrescType("lentilles")}>
            🔵 Lentilles
          </Button>
          {prescType && (
            <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive" onClick={() => setPrescType("")}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {prescType && (
          <div className="mt-2">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs resize-none" rows={2}
              placeholder={prescType === "lunettes" ? "Verres progressifs, antireflet, photochromiques..." : "Lentilles souples journalières, rayon 8.5, diamètre 14.2..."} />
            <Button size="sm" className="mt-2 text-xs h-7 gradient-primary text-primary-foreground" onClick={() => toast({ title: `Prescription ${prescType} ajoutée` })}>
              <Printer className="h-3 w-3 mr-1" />Générer prescription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cardiology ───────────────────────────────────────────────
function CardioTools() {
  const [ecgResult, setEcgResult] = useState("Rythme sinusal régulier");
  const [fc, setFc] = useState("72");
  const [pr, setPr] = useState("160");
  const [qrs, setQrs] = useState("80");
  const [qt, setQt] = useState("400");
  const [axis, setAxis] = useState("Normal");
  const [echoFindings, setEchoFindings] = useState("");
  const [tensionSys, setTensionSys] = useState("");
  const [tensionDia, setTensionDia] = useState("");

  const ecgOptions = [
    "Rythme sinusal régulier", "Tachycardie sinusale", "Bradycardie sinusale",
    "Fibrillation auriculaire", "Flutter auriculaire", "Extrasystoles ventriculaires",
    "Bloc AV 1er degré", "Bloc AV 2ème degré", "BBG complet", "BBD complet",
    "Ischémie antérieure", "Infarctus ancien", "Hypertrophie VG",
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-red-500" />Interprétation ECG
        </h4>
        <select value={ecgResult} onChange={e => setEcgResult(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mb-3">
          {ecgOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">FC (bpm)</label>
            <Input value={fc} onChange={e => setFc(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">PR (ms)</label>
            <Input value={pr} onChange={e => setPr(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">QRS (ms)</label>
            <Input value={qrs} onChange={e => setQrs(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">QT (ms)</label>
            <Input value={qt} onChange={e => setQt(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
        </div>
        <div className="mt-2">
          <label className="text-[10px] text-muted-foreground">Axe électrique</label>
          <select value={axis} onChange={e => setAxis(e.target.value)} className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs mt-0.5">
            <option>Normal</option><option>Déviation gauche</option><option>Déviation droite</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <label className="text-xs font-medium text-muted-foreground">Tension artérielle</label>
          <div className="flex items-center gap-1 mt-1">
            <Input value={tensionSys} onChange={e => setTensionSys(e.target.value)} className="h-7 text-xs w-16" placeholder="120" />
            <span className="text-xs text-muted-foreground">/</span>
            <Input value={tensionDia} onChange={e => setTensionDia(e.target.value)} className="h-7 text-xs w-16" placeholder="80" />
            <span className="text-xs text-muted-foreground">mmHg</span>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <label className="text-xs font-medium text-muted-foreground">Auscultation</label>
          <select className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs mt-1">
            <option>Bruits réguliers, pas de souffle</option>
            <option>Souffle systolique</option>
            <option>Souffle diastolique</option>
            <option>Frottement péricardique</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <label className="text-xs font-medium text-muted-foreground">Échocardiographie</label>
        <textarea value={echoFindings} onChange={e => setEchoFindings(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={2} placeholder="FEVG 60%, pas de valvulopathie significative, cavités de taille normale..." />
      </div>
    </div>
  );
}

// ── Dermatology ──────────────────────────────────────────────
function DermatoTools() {
  const [lesions, setLesions] = useState<{ zone: string; type: string; desc: string }[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const addLesion = () => setLesions([...lesions, { zone: "", type: "Macule", desc: "" }]);
  const lesionTypes = ["Macule", "Papule", "Nodule", "Vésicule", "Pustule", "Plaque", "Naevus", "Ulcère", "Kératose"];
  const bodyZones = ["Visage", "Cuir chevelu", "Cou", "Thorax", "Dos", "Bras droit", "Bras gauche", "Main droite", "Main gauche", "Abdomen", "Jambe droite", "Jambe gauche", "Pied droit", "Pied gauche"];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-pink-200 bg-pink-50/50 dark:bg-pink-950/20 dark:border-pink-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-pink-500" />Lésions cutanées
          </h4>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={addLesion}>
            <Plus className="h-3 w-3 mr-1" />Ajouter
          </Button>
        </div>
        {lesions.length === 0 && <p className="text-xs text-muted-foreground">Aucune lésion documentée</p>}
        {lesions.map((l, i) => (
          <div key={i} className="rounded-lg border bg-background p-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <select value={l.zone} onChange={e => { const u = [...lesions]; u[i].zone = e.target.value; setLesions(u); }} className="rounded-lg border bg-background px-2 py-1 text-xs flex-1">
                <option value="">Zone</option>
                {bodyZones.map(z => <option key={z}>{z}</option>)}
              </select>
              <select value={l.type} onChange={e => { const u = [...lesions]; u[i].type = e.target.value; setLesions(u); }} className="rounded-lg border bg-background px-2 py-1 text-xs flex-1">
                {lesionTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={() => setLesions(lesions.filter((_, j) => j !== i))} className="text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
            <Input value={l.desc} onChange={e => { const u = [...lesions]; u[i].desc = e.target.value; setLesions(u); }} className="h-7 text-xs" placeholder="Description: taille, couleur, bords..." />
          </div>
        ))}
      </div>

      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setPhotos([...photos, `photo_${Date.now()}`]); toast({ title: "Photo ajoutée (simulation)" }); }}>
        <Camera className="h-3.5 w-3.5 mr-1" />Ajouter photo dermatoscopique
      </Button>
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={p} className="h-16 w-16 rounded-lg bg-muted border flex items-center justify-center text-[10px] text-muted-foreground relative">
              📷 {i + 1}
              <button className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}><X className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pediatrics ───────────────────────────────────────────────
function PediatrieTools() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [ageMonths, setAgeMonths] = useState("12");
  const [vaccinations, setVaccinations] = useState<string[]>(["BCG", "DTC-Polio", "ROR"]);
  const [newVacc, setNewVacc] = useState("");
  const [devMilestones, setDevMilestones] = useState<string[]>([]);

  const milestoneOptions = ["Tient sa tête", "Se retourne", "S'assoit seul", "Rampe", "Marche à 4 pattes", "Se met debout", "Premiers pas", "Premiers mots", "Phrases simples", "Propreté"];

  const bmi = weight && height ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Baby className="h-4 w-4 text-green-500" />Courbe de croissance
        </h4>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Âge (mois)</label>
            <Input value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Poids (kg)</label>
            <Input value={weight} onChange={e => setWeight(e.target.value)} className="h-7 text-xs mt-0.5" placeholder="10.5" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Taille (cm)</label>
            <Input value={height} onChange={e => setHeight(e.target.value)} className="h-7 text-xs mt-0.5" placeholder="75" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">PC (cm)</label>
            <Input value={headCirc} onChange={e => setHeadCirc(e.target.value)} className="h-7 text-xs mt-0.5" placeholder="46" />
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-background border p-2 text-xs text-muted-foreground">
          IMC: <strong className="text-foreground">{bmi}</strong> · Percentile estimé: <strong className="text-foreground">P50-P75</strong>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Carnet de vaccination</h4>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {vaccinations.map(v => (
            <span key={v} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />{v}
              <button onClick={() => setVaccinations(vaccinations.filter(x => x !== v))}><X className="h-2.5 w-2.5 text-muted-foreground" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input value={newVacc} onChange={e => setNewVacc(e.target.value)} className="h-7 text-xs flex-1" placeholder="Ajouter vaccin..." />
          <Button size="sm" className="h-7 text-xs" onClick={() => { if (newVacc) { setVaccinations([...vaccinations, newVacc]); setNewVacc(""); } }}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Développement psychomoteur</h4>
        <div className="flex flex-wrap gap-1.5">
          {milestoneOptions.map(m => (
            <button key={m} onClick={() => setDevMilestones(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${devMilestones.includes(m) ? "bg-accent/10 text-accent border-accent/30" : "text-muted-foreground hover:border-primary/30"}`}>
              {devMilestones.includes(m) && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5" />}{m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dentistry ────────────────────────────────────────────────
function DentisteTools() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothNotes, setToothNotes] = useState<Record<number, string>>({});
  const [toothStatus, setToothStatus] = useState<Record<number, string>>({});
  const [quoteItems, setQuoteItems] = useState<{ acte: string; dent: string; prix: string }[]>([]);

  const upperTeeth = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const lowerTeeth = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const statusColors: Record<string, string> = { healthy: "bg-accent/20 text-accent", cavity: "bg-warning/20 text-warning", crown: "bg-primary/20 text-primary", missing: "bg-destructive/20 text-destructive", treated: "bg-muted text-muted-foreground" };

  const addQuoteItem = () => setQuoteItems([...quoteItems, { acte: "Soin conservateur", dent: selectedTooth ? `${selectedTooth}` : "", prix: "80" }]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 dark:bg-cyan-950/20 dark:border-cyan-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Smile className="h-4 w-4 text-cyan-500" />Schéma dentaire
        </h4>
        {/* Upper jaw */}
        <div className="flex justify-center gap-0.5 mb-1">
          {upperTeeth.map(t => (
            <button key={t} onClick={() => setSelectedTooth(t)}
              className={`h-8 w-6 rounded text-[9px] font-medium border transition-all flex items-center justify-center ${
                selectedTooth === t ? "ring-2 ring-primary border-primary" : ""
              } ${statusColors[toothStatus[t] || "healthy"] || "bg-accent/10 text-foreground hover:bg-primary/10"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="h-px bg-border my-1" />
        {/* Lower jaw */}
        <div className="flex justify-center gap-0.5">
          {lowerTeeth.map(t => (
            <button key={t} onClick={() => setSelectedTooth(t)}
              className={`h-8 w-6 rounded text-[9px] font-medium border transition-all flex items-center justify-center ${
                selectedTooth === t ? "ring-2 ring-primary border-primary" : ""
              } ${statusColors[toothStatus[t] || "healthy"] || "bg-accent/10 text-foreground hover:bg-primary/10"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 justify-center">
          {Object.entries(statusColors).map(([k, cls]) => (
            <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded ${cls}`}>{k === "healthy" ? "Saine" : k === "cavity" ? "Carie" : k === "crown" ? "Couronne" : k === "missing" ? "Absente" : "Traitée"}</span>
          ))}
        </div>
      </div>

      {/* Selected tooth details */}
      {selectedTooth && (
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">Dent n°{selectedTooth}</h4>
            <button onClick={() => setSelectedTooth(null)} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
          <select value={toothStatus[selectedTooth] || "healthy"} onChange={e => setToothStatus({ ...toothStatus, [selectedTooth]: e.target.value })} className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs mb-2">
            <option value="healthy">Saine</option><option value="cavity">Carie</option><option value="crown">Couronne</option><option value="missing">Absente</option><option value="treated">Traitée</option>
          </select>
          <Input value={toothNotes[selectedTooth] || ""} onChange={e => setToothNotes({ ...toothNotes, [selectedTooth]: e.target.value })} className="h-7 text-xs" placeholder="Notes sur la dent..." />
        </div>
      )}

      {/* Devis */}
      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-foreground">Devis & Plan de traitement</h4>
          <Button size="sm" variant="outline" className="text-xs h-6" onClick={addQuoteItem}><Plus className="h-3 w-3 mr-1" />Acte</Button>
        </div>
        {quoteItems.map((item, i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <Input value={item.acte} onChange={e => { const u = [...quoteItems]; u[i].acte = e.target.value; setQuoteItems(u); }} className="h-7 text-xs flex-1" />
            <Input value={item.dent} onChange={e => { const u = [...quoteItems]; u[i].dent = e.target.value; setQuoteItems(u); }} className="h-7 text-xs w-14" placeholder="Dent" />
            <Input value={item.prix} onChange={e => { const u = [...quoteItems]; u[i].prix = e.target.value; setQuoteItems(u); }} className="h-7 text-xs w-20" placeholder="DT" />
            <button onClick={() => setQuoteItems(quoteItems.filter((_, j) => j !== i))} className="text-destructive"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {quoteItems.length > 0 && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="text-xs font-semibold text-foreground">Total: {quoteItems.reduce((s, i) => s + Number(i.prix || 0), 0)} DT</span>
            <Button size="sm" className="text-xs h-7 gradient-primary text-primary-foreground" onClick={() => toast({ title: "Devis généré" })}>
              <Printer className="h-3 w-3 mr-1" />Imprimer devis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ORL ──────────────────────────────────────────────────────
function ORLTools() {
  const [audioOD, setAudioOD] = useState({ "250": "", "500": "", "1000": "", "2000": "", "4000": "", "8000": "" });
  const [audioOG, setAudioOG] = useState({ "250": "", "500": "", "1000": "", "2000": "", "4000": "", "8000": "" });
  const [endoscopy, setEndoscopy] = useState("");
  const frequencies = ["250", "500", "1000", "2000", "4000", "8000"];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Ear className="h-4 w-4 text-amber-500" />Audiogramme
        </h4>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">OD (dB HL)</label>
            <div className="flex gap-1 mt-0.5">
              {frequencies.map(f => (
                <div key={`od-${f}`} className="flex-1">
                  <label className="text-[8px] text-muted-foreground block text-center">{f}</label>
                  <Input value={(audioOD as any)[f]} onChange={e => setAudioOD({ ...audioOD, [f]: e.target.value })} className="h-6 text-[10px] text-center px-0.5" placeholder="20" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">OG (dB HL)</label>
            <div className="flex gap-1 mt-0.5">
              {frequencies.map(f => (
                <div key={`og-${f}`} className="flex-1">
                  <Input value={(audioOG as any)[f]} onChange={e => setAudioOG({ ...audioOG, [f]: e.target.value })} className="h-6 text-[10px] text-center px-0.5" placeholder="20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <label className="text-xs font-medium text-muted-foreground">Examen endoscopique</label>
        <textarea value={endoscopy} onChange={e => setEndoscopy(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={3} placeholder="Fosses nasales, pharynx, larynx, tympans..." />
      </div>
    </div>
  );
}

// ── Kinésithérapie ───────────────────────────────────────────
function KineTools() {
  const [painScale, setPainScale] = useState(5);
  const [mobility, setMobility] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);
  const [sessions, setSessions] = useState("10");

  const exerciseLibrary = ["Étirements cervicaux", "Renforcement quadriceps", "Mobilisation lombaire", "Exercices de proprioception", "Étirements ischio-jambiers", "Gainage", "Exercices respiratoires", "Mobilisation épaule", "Rééducation périnéale", "Marche thérapeutique"];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Bone className="h-4 w-4 text-orange-500" />Bilan kinésithérapie
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Échelle de douleur (EVA)</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min="0" max="10" value={painScale} onChange={e => setPainScale(Number(e.target.value))} className="flex-1" />
              <span className={`text-sm font-bold ${painScale <= 3 ? "text-accent" : painScale <= 6 ? "text-warning" : "text-destructive"}`}>{painScale}/10</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bilan articulaire / mobilité</label>
            <textarea value={mobility} onChange={e => setMobility(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={2} placeholder="Flexion genou: 90°, Extension: -5°, Rotation..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Nombre de séances prescrites</label>
            <Input value={sessions} onChange={e => setSessions(e.target.value)} className="h-7 text-xs mt-1 w-24" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Exercices à domicile</h4>
        <div className="flex flex-wrap gap-1.5">
          {exerciseLibrary.map(ex => (
            <button key={ex} onClick={() => setExercises(prev => prev.includes(ex) ? prev.filter(x => x !== ex) : [...prev, ex])}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${exercises.includes(ex) ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:border-primary/30"}`}>
              {exercises.includes(ex) && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5" />}{ex}
            </button>
          ))}
        </div>
        {exercises.length > 0 && (
          <Button size="sm" className="mt-3 text-xs h-7 gradient-primary text-primary-foreground w-full" onClick={() => toast({ title: `Programme: ${exercises.length} exercices envoyés au patient` })}>
            <Printer className="h-3 w-3 mr-1" />Envoyer programme au patient
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Psychiatry ───────────────────────────────────────────────
function PsychiatreTools() {
  const [scales, setScales] = useState<Record<string, number>>({});
  const [sessionNotes, setSessionNotes] = useState("");

  const psychScales = [
    { id: "phq9", name: "PHQ-9 (Dépression)", max: 27 },
    { id: "gad7", name: "GAD-7 (Anxiété)", max: 21 },
    { id: "madrs", name: "MADRS", max: 60 },
    { id: "ham_a", name: "Hamilton Anxiété", max: 56 },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-indigo-500" />Échelles psychométriques
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {psychScales.map(s => (
            <div key={s.id} className="rounded-lg border bg-background p-2">
              <label className="text-[10px] text-muted-foreground">{s.name}</label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="number" min={0} max={s.max} value={scales[s.id] || ""} onChange={e => setScales({ ...scales, [s.id]: Number(e.target.value) })} className="h-7 text-xs w-16" placeholder="0" />
                <span className="text-[10px] text-muted-foreground">/ {s.max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <label className="text-xs font-medium text-muted-foreground">Notes de séance (confidentiel)</label>
        <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={4} placeholder="Notes thérapeutiques confidentielles..." />
        <p className="text-[9px] text-muted-foreground mt-1">🔒 Ces notes sont strictement confidentielles et ne sont pas partagées avec le patient.</p>
      </div>
    </div>
  );
}

// ── Gynecology ───────────────────────────────────────────────
function GynecoTools() {
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [lastPeriod, setLastPeriod] = useState("");
  const [ultrasoundNotes, setUltrasoundNotes] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800 p-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-rose-500" />Suivi gynécologique
        </h4>
        <div className="flex gap-2 mb-3">
          <Button size="sm" variant={!isPregnant ? "default" : "outline"} className="text-xs h-7" onClick={() => setIsPregnant(false)}>Suivi standard</Button>
          <Button size="sm" variant={isPregnant ? "default" : "outline"} className="text-xs h-7" onClick={() => setIsPregnant(true)}>Suivi grossesse</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground">Dernières règles</label>
            <Input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className="h-7 text-xs mt-0.5" />
          </div>
          {isPregnant && (
            <div>
              <label className="text-[10px] text-muted-foreground">Semaine de grossesse</label>
              <Input value={pregnancyWeek} onChange={e => setPregnancyWeek(e.target.value)} className="h-7 text-xs mt-0.5" placeholder="Ex: 28 SA" />
            </div>
          )}
        </div>
      </div>
      {isPregnant && (
        <div className="rounded-lg border p-3">
          <label className="text-xs font-medium text-muted-foreground">Échographie</label>
          <textarea value={ultrasoundNotes} onChange={e => setUltrasoundNotes(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs mt-1 resize-none" rows={3} placeholder="Biométrie fœtale, activité cardiaque, liquide amniotique, placenta..." />
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
const SpecialtyTools = () => {
  const [sub] = useDoctorSubscription();
  const [expanded, setExpanded] = useState(true);

  // Determine which specialty tool to show
  const getToolComponent = () => {
    if (sub.activity === "dentiste") return <DentisteTools />;
    if (sub.activity === "kine") return <KineTools />;
    if (sub.activity === "specialiste" && sub.specialty) {
      switch (sub.specialty) {
        case "Ophtalmologue": return <OphtalmoTools />;
        case "Cardiologue": return <CardioTools />;
        case "Dermatologue": return <DermatoTools />;
        case "Pédiatre": return <PediatrieTools />;
        case "ORL": return <ORLTools />;
        case "Psychiatre": return <PsychiatreTools />;
        case "Gynécologue": return <GynecoTools />;
        case "Neurologue": return <CardioTools />; // Shares similar neurology EEG-like tools
        default: return null;
      }
    }
    return null;
  };

  const tool = getToolComponent();
  if (!tool) return null;

  const specialtyLabel = sub.activity === "dentiste" ? "Dentiste" : sub.activity === "kine" ? "Kinésithérapeute" : sub.specialty || "";

  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          Outils {specialtyLabel}
        </h3>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && <div className="px-4 pb-4">{tool}</div>}
    </div>
  );
};

export default SpecialtyTools;
