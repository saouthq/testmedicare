/**
 * AppointmentRulesTab — Règles RDV style Doctolib
 * - Délai annulation
 * - Délai reprogrammation  
 * - Max reprogrammations gratuites
 * - Toggle messages patients
 * 
 * // TODO BACKEND: PUT /api/doctor/appointment-rules
 */
import { useState } from "react";
import { Clock, RefreshCw, MessageSquare, Save, RotateCcw, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const AppointmentRulesTab = () => {
  // Rules state
  const [cancellationDelay, setCancellationDelay] = useState("24"); // heures
  const [rescheduleDelay, setRescheduleDelay] = useState("12"); // heures
  const [maxFreeReschedules, setMaxFreeReschedules] = useState("2");
  const [requireDepositTeleconsult, setRequireDepositTeleconsult] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [reminderSms, setReminderSms] = useState(true);
  const [reminderEmail, setReminderEmail] = useState(true);
  const [acceptPatientMessages, setAcceptPatientMessages] = useState(true);

  // Save
  const handleSave = () => {
    // TODO BACKEND: PUT /api/doctor/appointment-rules
    toast({ title: "Règles enregistrées", description: "Vos paramètres de RDV ont été sauvegardés." });
  };

  // Reset
  const handleReset = () => {
    setCancellationDelay("24");
    setRescheduleDelay("12");
    setMaxFreeReschedules("2");
    setRequireDepositTeleconsult(true);
    setAutoConfirm(false);
    setReminderSms(true);
    setReminderEmail(true);
    setAcceptPatientMessages(true);
    toast({ title: "Réinitialisé", description: "Les règles ont été remises aux valeurs par défaut." });
  };

  return (
    <div className="space-y-6">
      {/* Cancellation & Reschedule */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Annulation & Reprogrammation</h3>
        </div>

        <div className="space-y-5">
          {/* Délai annulation */}
          <div>
            <Label className="text-sm font-medium text-foreground">Délai minimum d'annulation</Label>
            <p className="text-xs text-muted-foreground mb-2">Le patient ne pourra pas annuler moins de X heures avant le RDV.</p>
            <div className="flex gap-2 items-center">
              <select
                value={cancellationDelay}
                onChange={e => setCancellationDelay(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm w-32"
              >
                <option value="2">2 heures</option>
                <option value="6">6 heures</option>
                <option value="12">12 heures</option>
                <option value="24">24 heures</option>
                <option value="48">48 heures</option>
                <option value="72">72 heures</option>
              </select>
              <span className="text-sm text-muted-foreground">avant le RDV</span>
            </div>
          </div>

          {/* Délai reprogrammation */}
          <div>
            <Label className="text-sm font-medium text-foreground">Délai minimum de reprogrammation</Label>
            <p className="text-xs text-muted-foreground mb-2">Le patient ne pourra pas déplacer son RDV moins de X heures avant.</p>
            <div className="flex gap-2 items-center">
              <select
                value={rescheduleDelay}
                onChange={e => setRescheduleDelay(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm w-32"
              >
                <option value="2">2 heures</option>
                <option value="6">6 heures</option>
                <option value="12">12 heures</option>
                <option value="24">24 heures</option>
                <option value="48">48 heures</option>
              </select>
              <span className="text-sm text-muted-foreground">avant le RDV</span>
            </div>
          </div>

          {/* Max reprogrammations */}
          <div>
            <Label className="text-sm font-medium text-foreground">Nombre max de reprogrammations gratuites</Label>
            <p className="text-xs text-muted-foreground mb-2">Au-delà, le patient devra prendre un nouveau RDV.</p>
            <div className="flex gap-2 items-center">
              <select
                value={maxFreeReschedules}
                onChange={e => setMaxFreeReschedules(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm w-24"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="unlimited">Illimité</option>
              </select>
              <span className="text-sm text-muted-foreground">reprogrammation(s)</span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-5 rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Ces règles seront affichées au patient lors de la prise de RDV et dans le détail de son rendez-vous.
          </p>
        </div>
      </div>

      {/* Confirmation & Reminders */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Confirmation & Rappels</h3>
        </div>

        <div className="space-y-4">
          {/* Auto-confirm */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Confirmation automatique</Label>
              <p className="text-xs text-muted-foreground">Les RDV sont confirmés automatiquement sans validation manuelle</p>
            </div>
            <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
          </div>

          {/* Reminder SMS */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Rappel SMS</Label>
              <p className="text-xs text-muted-foreground">Envoyer un SMS de rappel 24h avant le RDV</p>
            </div>
            <Switch checked={reminderSms} onCheckedChange={setReminderSms} />
          </div>

          {/* Reminder Email */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Rappel Email</Label>
              <p className="text-xs text-muted-foreground">Envoyer un email de rappel 48h avant le RDV</p>
            </div>
            <Switch checked={reminderEmail} onCheckedChange={setReminderEmail} />
          </div>

          {/* Deposit for teleconsult */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Paiement avant téléconsultation</Label>
              <p className="text-xs text-muted-foreground">Le patient doit payer avant d'accéder à la téléconsultation</p>
            </div>
            <Switch checked={requireDepositTeleconsult} onCheckedChange={setRequireDepositTeleconsult} />
          </div>
        </div>
      </div>

      {/* Patient Messaging */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Messagerie patients</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">Accepter les messages des patients</Label>
            <p className="text-xs text-muted-foreground">
              {acceptPatientMessages 
                ? "Les patients peuvent vous envoyer des messages via la plateforme"
                : "Les patients ne peuvent pas vous envoyer de messages"}
            </p>
          </div>
          <Switch checked={acceptPatientMessages} onCheckedChange={setAcceptPatientMessages} />
        </div>

        {/* Warning when disabled */}
        {!acceptPatientMessages && (
          <div className="mt-4 rounded-lg border bg-warning/10 border-warning/20 p-3 flex items-start gap-2">
            <Shield className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Les patients verront un message indiquant qu'ils ne peuvent pas vous contacter par messagerie.
              Ils pourront uniquement vous joindre par téléphone.
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          Ce réglage contrôle la messagerie patient dans toute l'application.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />Réinitialiser
        </Button>
        <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default AppointmentRulesTab;
