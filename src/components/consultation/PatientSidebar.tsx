import { Activity, Droplets, FileText, Gauge, Heart, History, Scale, Thermometer } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import { autoGrowCompact } from "./helpers";

export function PatientSidebar() {
  const ctx = useConsultation();

  return (
    <aside className="space-y-4 lg:sticky lg:top-[160px] lg:self-start">
      {/* Patient card */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            {ctx.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Patient</p>
            <p className="font-semibold text-foreground truncate">{ctx.patient.name}</p>
            <p className="text-xs text-muted-foreground">{ctx.patient.age} ans · {ctx.patient.gender}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/30 border p-2">
            <p className="text-[10px] text-muted-foreground">IMC</p>
            <p className="text-sm font-bold text-foreground">{ctx.bmi}</p>
          </div>
          <div className="rounded-lg bg-muted/30 border p-2">
            <p className="text-[10px] text-muted-foreground">TA</p>
            <p className="text-sm font-bold text-foreground">{ctx.vitals.systolic}/{ctx.vitals.diastolic}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => ctx.setHistoryOpen(true)}>
            <History className="h-3.5 w-3.5 mr-1" /> Historique
          </Button>
          <Link to="/dashboard/doctor/patients/1" className="flex-1">
            <Button variant="outline" size="sm" className="text-xs w-full">
              <FileText className="h-3.5 w-3.5 mr-1" /> Dossier
            </Button>
          </Link>
        </div>
      </div>

      {/* Antécédents */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Antécédents
          </h3>
          <span className="text-[11px] text-muted-foreground">Saisie libre</span>
        </div>
        <div className="mt-3 space-y-3">
          {[
            { label: "Médicaux", value: ctx.antMed, set: ctx.setAntMed, ph: "Ex: diabète T2, HTA, asthme…" },
            { label: "Chirurgicaux", value: ctx.antSurg, set: ctx.setAntSurg, ph: "Ex: appendicectomie 2015…" },
            { label: "Traumatiques", value: ctx.antTrauma, set: ctx.setAntTrauma, ph: "Ex: fracture poignet 2022…" },
            { label: "Familiaux", value: ctx.antFamily, set: ctx.setAntFamily, ph: "Ex: diabète, cardiopathie…" },
          ].map(f => (
            <div key={f.label}>
              <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
              <textarea
                value={f.value} onChange={e => f.set(e.target.value)}
                onInput={e => autoGrowCompact(e.currentTarget)}
                rows={2} placeholder={f.ph}
                className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[56px] max-h-[120px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Constantes */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Constantes
          </h3>
          <span className={ctx.completion.vitalsOk
            ? "text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full"
            : "text-[11px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full"
          }>
            {ctx.completion.vitalsOk ? "OK" : "À compléter"}
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <p className="text-[11px] text-muted-foreground leading-4">
            TA {ctx.vitals.systolic}/{ctx.vitals.diastolic} · FC {ctx.vitals.heartRate} · T° {ctx.vitals.temperature} · SpO2 {ctx.vitals.oxygenSat}% · Poids {ctx.vitals.weight}kg
          </p>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => ctx.setVitalsOpen(!ctx.vitalsOpen)}>
            {ctx.vitalsOpen ? "Réduire" : "Modifier"}
          </Button>
        </div>
        {ctx.vitalsOpen && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { icon: Gauge, label: "Tension", color: "text-destructive", type: "bp" },
              { icon: Heart, label: "FC (bpm)", color: "text-primary", key: "heartRate" },
              { icon: Thermometer, label: "Temp (°C)", color: "text-warning", key: "temperature" },
              { icon: Droplets, label: "SpO2", color: "text-primary", key: "oxygenSat" },
            ].map((v, i) => (
              <div key={i} className="rounded-lg border bg-muted/30 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <v.icon className={`h-3 w-3 ${v.color}`} />
                  <Label className="text-[10px] text-muted-foreground">{v.label}</Label>
                </div>
                {v.type === "bp" ? (
                  <div className="flex items-center gap-1">
                    <Input value={ctx.vitals.systolic} onChange={e => ctx.setVitals(vt => ({ ...vt, systolic: e.target.value }))} className="text-center h-8 text-xs font-semibold" />
                    <span className="text-muted-foreground font-bold">/</span>
                    <Input value={ctx.vitals.diastolic} onChange={e => ctx.setVitals(vt => ({ ...vt, diastolic: e.target.value }))} className="text-center h-8 text-xs font-semibold" />
                  </div>
                ) : (
                  <Input value={ctx.vitals[v.key as keyof typeof ctx.vitals]} onChange={e => ctx.setVitals(vt => ({ ...vt, [v.key!]: e.target.value }))} className="h-8 text-xs font-semibold" />
                )}
              </div>
            ))}
            <div className="rounded-lg border bg-muted/30 p-2 col-span-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Scale className="h-3 w-3 text-accent" />
                <Label className="text-[10px] text-muted-foreground">Poids (kg)</Label>
              </div>
              <Input value={ctx.vitals.weight} onChange={e => ctx.setVitals(vt => ({ ...vt, weight: e.target.value }))} className="h-8 text-xs font-semibold" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
