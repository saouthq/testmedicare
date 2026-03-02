/**
 * PatientDetailActions — Wrapper autour de ActionPalette pour le dossier patient.
 */
import ActionPalette, { type ActionItem } from "@/components/shared/ActionPalette";
import { usePatientDetail } from "./PatientDetailContext";

export default function PatientDetailActions() {
  const { actionsOpen, setActionsOpen, actionsQ, setActionsQ, actions } = usePatientDetail();

  const mapped: ActionItem[] = actions.map(a => ({
    id: a.id,
    label: a.label,
    hint: a.hint,
    icon: a.icon,
    group: a.group,
    onRun: a.run,
  }));

  return (
    <ActionPalette
      open={actionsOpen}
      onClose={() => setActionsOpen(false)}
      actions={mapped}
      query={actionsQ}
      onQueryChange={v => { setActionsQ(v); }}
      placeholder="Rechercher une action… (ex: ordonnance, analyses, doc, notes)"
    />
  );
}
