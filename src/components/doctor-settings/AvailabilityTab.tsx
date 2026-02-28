import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const AvailabilityTab = () => {
  const [availability, setAvailability] = useState<Record<string, { active: boolean; start: string; end: string; breakStart: string; breakEnd: string }>>({
    Lundi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mardi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mercredi: { active: true, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
    Jeudi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Vendredi: { active: true, start: "08:00", end: "17:00", breakStart: "12:00", breakEnd: "14:00" },
    Samedi: { active: false, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
  });

  const handleSave = () => {
    // TODO BACKEND: PUT /api/doctor/availability — envoyer les horaires
    toast({ title: "Enregistré", description: "Vos modifications ont été sauvegardées." });
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">Horaires d'ouverture</h3>
      <div className="space-y-4">
        {weekDays.map(day => {
          const d = availability[day];
          return (
            <div key={day} className={`rounded-lg border p-4 transition-colors ${d.active ? "bg-card" : "bg-muted/50"}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={d.active} onChange={() => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }))} className="rounded border-input" />
                  <span className={`text-sm font-medium ${d.active ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                </label>
                {!d.active && <span className="text-xs text-muted-foreground">Fermé</span>}
              </div>
              {d.active && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  <div><Label className="text-xs">Début</Label><Input type="time" value={d.start} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} className="mt-1" /></div>
                  <div><Label className="text-xs">Fin</Label><Input type="time" value={d.end} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} className="mt-1" /></div>
                  <div><Label className="text-xs">Pause début</Label><Input type="time" value={d.breakStart} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakStart: e.target.value } }))} className="mt-1" /></div>
                  <div><Label className="text-xs">Pause fin</Label><Input type="time" value={d.breakEnd} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakEnd: e.target.value } }))} className="mt-1" /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
    </div>
  );
};

export default AvailabilityTab;
