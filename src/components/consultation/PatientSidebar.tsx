/**
 * PatientSidebar — Colonne gauche de la consultation
 * Adapté par spécialité : vitals, antécédents, badges patient
 */
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Droplets,
  FileText,
  Gauge,
  Heart,
  History,
  Scale,
  Thermometer,
  AlertTriangle,
  Stethoscope,
  Eye,
  Baby,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import { autoGrowCompact } from "./helpers";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { getSpecialtyConfig } from "./specialtyConfig";

// ── Vital chip ────────────────────────────────────────────────
function VitalChip({
  icon: Icon,
  label,
  value,
  color,
  unit,
  ok,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  unit?: string;
  ok?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-2.5 flex flex-col gap-0.5 ${ok === false ? "border-warning/40 bg-warning/5" : "bg-muted/20"}`}
    >
      <div className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-foreground">{value || "—"}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

// Icon mapping for config
const iconMap: Record<string, any> = {
  Gauge, Heart, Thermometer, Droplets, Scale, Activity, Eye, Baby,
};

export function PatientSidebar() {
  const ctx = useConsultation();
  const [sub] = useDoctorSubscription();
  const config = getSpecialtyConfig(sub.activity, sub.specialty);

  // Blood pressure ok check
  const bpOk =
    ctx.vitals.systolic && ctx.vitals.diastolic
      ? parseInt(ctx.vitals.systolic) < 140 && parseInt(ctx.vitals.diastolic) < 90
      : undefined;
  const bmiNum = parseFloat(ctx.bmi);
  const bmiOk = !isNaN(bmiNum) ? bmiNum >= 18.5 && bmiNum < 25 : undefined;
  const tempNum = parseFloat(ctx.vitals.temperature);
  const tempOk = !isNaN(tempNum) ? tempNum < 37.5 : undefined;
  const spo2Num = parseFloat(ctx.vitals.oxygenSat);
  const spo2Ok = !isNaN(spo2Num) ? spo2Num >= 95 : undefined;

  // Build vitals from config
  const getVitalValue = (key: string) => {
    if (key === "bp") return ctx.vitals.systolic && ctx.vitals.diastolic ? `${ctx.vitals.systolic}/${ctx.vitals.diastolic}` : "—";
    if (key === "heartRate") return ctx.vitals.heartRate;
    if (key === "temperature") return ctx.vitals.temperature;
    if (key === "oxygenSat") return ctx.vitals.oxygenSat;
    if (key === "weight") return ctx.vitals.weight;
    if (key === "bmi") return ctx.bmi;
    return "—";
  };

  const getVitalOk = (key: string) => {
    if (key === "bp") return bpOk;
    if (key === "bmi") return bmiOk;
    if (key === "temperature") return tempOk;
    if (key === "oxygenSat") return spo2Ok;
    return undefined;
  };

  const getVitalColor = (key: string) => {
    const map: Record<string, string> = { bp: "text-destructive", heartRate: "text-primary", temperature: "text-warning", oxygenSat: "text-primary", weight: "text-accent", bmi: "text-muted-foreground" };
    return map[key] || "text-primary";
  };

  // Antecedents config based on specialty
  const getAntecedents = () => {
    const base = [
      { label: "Médicaux", value: ctx.antMed, set: ctx.setAntMed, ph: "Diabète T2, HTA, asthme…", color: "border-l-primary" },
      { label: "Chirurgicaux", value: ctx.antSurg, set: ctx.setAntSurg, ph: "Appendicectomie, hernie…", color: "border-l-warning" },
      { label: "Traumatiques", value: ctx.antTrauma, set: ctx.setAntTrauma, ph: "Fracture, entorse…", color: "border-l-destructive" },
      { label: "Familiaux", value: ctx.antFamily, set: ctx.setAntFamily, ph: "Diabète, cardiopathie…", color: "border-l-accent" },
    ];

    // Customize placeholders per specialty
    if (sub.specialty === "Ophtalmologue") {
      base[0].ph = "Diabète, HTA, glaucome familial…";
      base[1].ph = "Chirurgie oculaire antérieure…";
    } else if (sub.specialty === "Cardiologue") {
      base[0].ph = "HTA, diabète, dyslipidémie…";
      base[3].ph = "Cardiopathie familiale, mort subite…";
    } else if (sub.specialty === "Pédiatre") {
      base[0].ph = "Néonatals, pathologies infantiles…";
      base[1].ph = "Chirurgie pédiatrique…";
      base[2].ph = "Traumatismes…";
      base[3].ph = "Maladies héréditaires, atopie…";
    } else if (sub.specialty === "Psychiatre") {
      base[0].ph = "ATCD psychiatriques, hospitalisations…";
      base[3].ph = "ATCD familiaux psychiatriques…";
    }

    return base;
  };

  return (
    <aside className="space-y-3">
      {/* ── Patient card ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="gradient-hero h-12 relative" />
        <div className="px-4 pb-4 -mt-6">
          <div className="flex items-end gap-3 mb-3">
            <div className="h-12 w-12 rounded-full border-3 border-card ring-2 ring-primary/20 gradient-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm shrink-0">
              {ctx.initials}
            </div>
            <div className="min-w-0 pb-0.5">
              <p className="font-bold text-foreground text-sm truncate leading-tight">{ctx.patient.name}</p>
              <p className="text-xs text-muted-foreground">
                {ctx.patient.age} ans · {ctx.patient.gender}
              </p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ctx.patient.bloodType && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/20">
                <Droplets className="h-2.5 w-2.5" />
                {ctx.patient.bloodType}
              </span>
            )}
            {ctx.patient.mutuelle && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                {ctx.patient.mutuelle}
              </span>
            )}
            {ctx.patient.allergies.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium border border-warning/20">
                <AlertTriangle className="h-2.5 w-2.5" />
                {ctx.patient.allergies.length} allergie{ctx.patient.allergies.length > 1 ? "s" : ""}
              </span>
            )}
            {ctx.patient.conditions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                <Stethoscope className="h-2.5 w-2.5" />
                {ctx.patient.conditions.length} patho.
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs flex-1 h-8" onClick={() => ctx.setHistoryOpen(true)}>
              <History className="h-3.5 w-3.5 mr-1.5" /> Historique
            </Button>
            <Link to="/dashboard/doctor/patients/1" className="flex-1">
              <Button variant="outline" size="sm" className="text-xs w-full h-8">
                <FileText className="h-3.5 w-3.5 mr-1.5" /> Dossier
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Constantes — dynamiques par spécialité ── */}
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Constantes
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                ctx.completion.vitalsOk
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-warning/10 text-warning border border-warning/20"
              }`}
            >
              {ctx.completion.vitalsOk ? "✓ OK" : "À compléter"}
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => ctx.setVitalsOpen(!ctx.vitalsOpen)}>
              {ctx.vitalsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Dynamic vitals grid from specialty config */}
        <div className="grid grid-cols-2 gap-2">
          {config.vitals.map((v) => (
            <VitalChip
              key={v.key}
              icon={iconMap[v.icon] || Activity}
              label={v.label}
              value={getVitalValue(v.key)}
              color={getVitalColor(v.key)}
              unit={v.unit}
              ok={getVitalOk(v.key)}
            />
          ))}
        </div>

        {/* Extra specialty-specific vitals */}
        {config.extraVitals && config.extraVitals.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {config.extraVitals.map((v) => (
              <div key={v.key} className="rounded-xl border p-2.5 bg-primary/5">
                <span className="text-[10px] text-primary font-medium">{v.label}</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{v.placeholder || "—"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Edit panel */}
        {ctx.vitalsOpen && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <p className="text-[11px] text-muted-foreground font-medium">Modifier les constantes</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Systolique</Label>
                <Input value={ctx.vitals.systolic} onChange={(e) => ctx.setVitals((v) => ({ ...v, systolic: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="120" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Diastolique</Label>
                <Input value={ctx.vitals.diastolic} onChange={(e) => ctx.setVitals((v) => ({ ...v, diastolic: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="80" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">FC (bpm)</Label>
                <Input value={ctx.vitals.heartRate} onChange={(e) => ctx.setVitals((v) => ({ ...v, heartRate: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="72" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Température (°C)</Label>
                <Input value={ctx.vitals.temperature} onChange={(e) => ctx.setVitals((v) => ({ ...v, temperature: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="37.0" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">SpO2 (%)</Label>
                <Input value={ctx.vitals.oxygenSat} onChange={(e) => ctx.setVitals((v) => ({ ...v, oxygenSat: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="98" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Poids (kg)</Label>
                <Input value={ctx.vitals.weight} onChange={(e) => ctx.setVitals((v) => ({ ...v, weight: e.target.value }))} className="h-7 text-xs mt-0.5" placeholder="75" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Antécédents — with specialty-adapted placeholders ── */}
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" /> Antécédents
        </h3>
        <div className="space-y-2.5">
          {getAntecedents().map((f) => (
            <div key={f.label} className={`border-l-2 pl-2.5 ${f.color}`}>
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                {f.label}
              </Label>
              <textarea
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                onInput={(e) => autoGrowCompact(e.currentTarget)}
                rows={1}
                placeholder={f.ph}
                className="mt-0.5 w-full resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none min-h-[24px] max-h-[72px] leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
