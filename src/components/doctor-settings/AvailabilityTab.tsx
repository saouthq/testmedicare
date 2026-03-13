import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useSharedAvailability,
  updateAvailabilityDay,
  setSlotDuration,
  saveAvailabilityToSupabase,
  WEEK_DAYS,
} from "@/stores/sharedAvailabilityStore";
import { sharedAppointmentsStore, cancelConflictingAppointments, getTodayDate } from "@/stores/sharedAppointmentsStore";

const AvailabilityTab = () => {
  const [config] = useSharedAvailability();
  const [conflictWarning, setConflictWarning] = useState<{ count: number; dayName: string } | null>(null);

  const handleToggleDay = (day: string) => {
    updateAvailabilityDay(day, { active: !config.days[day].active });
  };

  const handleUpdateDay = (day: string, field: string, value: string) => {
    updateAvailabilityDay(day, { [field]: value });
  };

  const handleSlotDuration = (duration: number) => {
    setSlotDuration(duration);
  };

  /** Check for conflicting appointments before saving */
  const checkConflicts = (): number => {
    const allApts = sharedAppointmentsStore.read();
    const today = getTodayDate();
    const dayMap: Record<string, number> = { "Dimanche": 0, "Lundi": 1, "Mardi": 2, "Mercredi": 3, "Jeudi": 4, "Vendredi": 5, "Samedi": 6 };
    
    let totalConflicts = 0;
    
    WEEK_DAYS.forEach(dayName => {
      const d = config.days[dayName];
      if (!d) return;
      const jsDay = dayMap[dayName];
      
      const futureApts = allApts.filter(a => {
        if (["cancelled", "absent", "done"].includes(a.status)) return false;
        if (a.date < today) return false;
        const aptDate = new Date(a.date + "T00:00:00");
        return aptDate.getDay() === jsDay;
      });

      futureApts.forEach(apt => {
        if (!d.active) { totalConflicts++; return; }
        const aptStartMin = timeToMin(apt.startTime);
        const aptEndMin = aptStartMin + apt.duration;
        const dayStartMin = timeToMin(d.start);
        const dayEndMin = timeToMin(d.end);
        if (aptStartMin < dayStartMin || aptEndMin > dayEndMin) { totalConflicts++; return; }
        if (d.breakStart && d.breakEnd) {
          const bsMin = timeToMin(d.breakStart);
          const beMin = timeToMin(d.breakEnd);
          if (aptStartMin < beMin && aptEndMin > bsMin) { totalConflicts++; return; }
        }
      });
    });
    
    return totalConflicts;
  };

  const handleSave = async () => {
    const conflicts = checkConflicts();
    if (conflicts > 0) {
      setConflictWarning({ count: conflicts, dayName: "tous les jours" });
    } else {
      await doSave();
    }
  };

  const doSave = async (cancelConflicts = false) => {
    if (cancelConflicts) {
      let totalCancelled = 0;
      WEEK_DAYS.forEach(dayName => {
        const d = config.days[dayName];
        if (!d) return;
        if (!d.active) {
          totalCancelled += cancelConflictingAppointments(dayName, "00:00", "00:00");
        } else {
          totalCancelled += cancelConflictingAppointments(dayName, d.start, d.end, d.breakStart || undefined, d.breakEnd || undefined);
        }
      });
      if (totalCancelled > 0) {
        toast({ title: `${totalCancelled} RDV annulé(s)`, description: "Les patients concernés ont été notifiés." });
      }
    }
    // Persist all days to Supabase
    await saveAvailabilityToSupabase();
    setConflictWarning(null);
    toast({ title: "Enregistré", description: "Vos disponibilités sont mises à jour partout (agenda, secrétaire, prise de RDV)." });
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="font-semibold text-foreground mb-1">Horaires d'ouverture</h3>
      <p className="text-xs text-muted-foreground mb-4">Ces horaires sont visibles par la secrétaire et les patients lors de la prise de RDV.</p>
      
      {/* Conflict warning */}
      {conflictWarning && (
        <div className="mb-4 rounded-lg bg-warning/10 border border-warning/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {conflictWarning.count} rendez-vous en conflit
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Les nouveaux horaires entrent en conflit avec des RDV existants. Voulez-vous les annuler automatiquement ? Les patients seront notifiés.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="destructive" onClick={() => doSave(true)} className="text-xs">
                  Annuler les {conflictWarning.count} RDV et sauvegarder
                </Button>
                <Button size="sm" variant="outline" onClick={() => doSave(false)} className="text-xs">
                  Sauvegarder sans annuler
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConflictWarning(null)} className="text-xs">
                  Revenir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {WEEK_DAYS.map(day => {
          const d = config.days[day];
          if (!d) return null;
          return (
            <div key={day} className={`rounded-lg border p-4 transition-colors ${d.active ? "bg-card" : "bg-muted/50"}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={d.active} onChange={() => handleToggleDay(day)} className="rounded border-input" />
                  <span className={`text-sm font-medium ${d.active ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                </label>
                {!d.active && <span className="text-xs text-muted-foreground">Fermé</span>}
              </div>
              {d.active && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  <div><Label className="text-xs">Début</Label><Input type="time" value={d.start} onChange={e => handleUpdateDay(day, "start", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">Fin</Label><Input type="time" value={d.end} onChange={e => handleUpdateDay(day, "end", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">Pause début</Label><Input type="time" value={d.breakStart} onChange={e => handleUpdateDay(day, "breakStart", e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">Pause fin</Label><Input type="time" value={d.breakEnd} onChange={e => handleUpdateDay(day, "breakEnd", e.target.value)} className="mt-1" /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <div>
          <Label className="text-xs">Durée créneau par défaut</Label>
          <select
            value={config.slotDuration}
            onChange={e => handleSlotDuration(+e.target.value)}
            className="mt-1 w-full rounded-lg border bg-background px-3 h-9 text-sm"
          >
            {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
      </div>
    </div>
  );
};

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default AvailabilityTab;
