import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

interface Props {
  type: string;
  editData?: Record<string, string> | null;
  onClose: () => void;
  onAdd: (item: any) => void;
}

const configs: Record<string, { title: (isEdit: boolean) => string; fields: { key: string; label: string; placeholder: string; required?: boolean }[] }> = {
  antecedent: { title: e => e ? "Modifier l'antécédent" : "Ajouter un antécédent", fields: [
    { key: "name", label: "Nom de l'antécédent", placeholder: "Ex: Asthme", required: true },
    { key: "date", label: "Date / Année", placeholder: "Ex: 2020" },
    { key: "details", label: "Détails", placeholder: "Précisions..." },
  ]},
  treatment: { title: e => e ? "Modifier le traitement" : "Ajouter un traitement", fields: [
    { key: "name", label: "Nom du médicament", placeholder: "Ex: Metformine 850mg", required: true },
    { key: "dose", label: "Posologie", placeholder: "Ex: 1 comprimé matin et soir" },
    { key: "since", label: "Depuis", placeholder: "Ex: Janvier 2024" },
    { key: "prescriber", label: "Prescrit par", placeholder: "Ex: Dr. Bouazizi" },
  ]},
  allergy: { title: e => e ? "Modifier l'allergie" : "Ajouter une allergie", fields: [
    { key: "name", label: "Allergène", placeholder: "Ex: Pénicilline", required: true },
    { key: "severity", label: "Sévérité", placeholder: "Ex: Sévère" },
    { key: "reaction", label: "Type de réaction", placeholder: "Ex: Urticaire, œdème" },
  ]},
  family: { title: e => e ? "Modifier l'antécédent familial" : "Ajouter un antécédent familial", fields: [
    { key: "name", label: "Pathologie", placeholder: "Ex: Diabète type 2", required: true },
    { key: "details", label: "Détails (membre de la famille)", placeholder: "Ex: Père — diagnostiqué à 55 ans" },
  ]},
  surgery: { title: e => e ? "Modifier l'opération" : "Ajouter une opération", fields: [
    { key: "name", label: "Type d'opération", placeholder: "Ex: Appendicectomie", required: true },
    { key: "date", label: "Date", placeholder: "Ex: Mars 2019" },
    { key: "hospital", label: "Établissement", placeholder: "Ex: Hôpital Charles Nicolle" },
  ]},
  vaccination: { title: e => e ? "Modifier le vaccin" : "Ajouter un vaccin", fields: [
    { key: "name", label: "Nom du vaccin", placeholder: "Ex: Grippe saisonnière", required: true },
    { key: "doses", label: "Doses", placeholder: "Ex: 1 dose" },
    { key: "lastDate", label: "Date dernière dose", placeholder: "Ex: Oct 2025" },
    { key: "nextDate", label: "Prochain rappel (optionnel)", placeholder: "Ex: Oct 2026" },
  ]},
  measure: { title: e => e ? "Modifier la mesure" : "Ajouter une mesure", fields: [
    { key: "label", label: "Type de mesure", placeholder: "Ex: Poids", required: true },
    { key: "value", label: "Valeur", placeholder: "Ex: 75 kg", required: true },
    { key: "date", label: "Date", placeholder: "Ex: 20 Fév 2026" },
  ]},
  habit: { title: e => e ? "Modifier l'habitude" : "Ajouter une habitude", fields: [
    { key: "label", label: "Catégorie", placeholder: "Ex: Tabac, Alcool, Sport", required: true },
    { key: "value", label: "Valeur", placeholder: "Ex: Non-fumeur", required: true },
  ]},
};

const AddItemModal = ({ type, editData, onClose, onAdd }: Props) => {
  const [form, setForm] = useState<Record<string, string>>(editData || {});
  const isEdit = !!editData;

  const config = configs[type];
  if (!config) return null;

  const canSubmit = config.fields.filter(f => f.required).every(f => form[f.key]?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">{config.title(isEdit)}</h3>
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

export default AddItemModal;
