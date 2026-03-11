import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSharedAvailability, WEEK_DAYS } from "@/stores/sharedAvailabilityStore";

const AvailabilityTab = () => {
  const [config, setConfig] = useSharedAvailability();

  const handleToggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      days: { ...prev.days, [day]: { ...prev.days[day], active: !prev.days[day].active } },
    }));
  };

  const handleUpdateDay = (day: string, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      days: { ...prev.days, [day]: { ...prev.days[day], [field]: value } },
    }));
  };

  const handleSave = () => {
    // TODO BACKEND: PUT /api/doctor/availability
    toast({ title: "Enregistré", description: "Vos disponibilités sont mises à jour partout (agenda, secrétaire, prise de RDV)." });
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="font-semibold text-foreground mb-1">Horaires d'ouverture</h3>
      <p className="text-xs text-muted-foreground mb-4">Ces horaires sont visibles par la secrétaire et les patients lors de la prise de RDV.</p>
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
            onChange={e => setConfig(prev => ({ ...prev, slotDuration: +e.target.value }))}
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

export default AvailabilityTab;
