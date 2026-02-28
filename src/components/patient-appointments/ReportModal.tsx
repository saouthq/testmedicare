import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";

interface Props {
  appointment: { id: number; doctor: string; specialty: string; date: string; motif: string };
  onClose: () => void;
}

const ReportModal = ({ appointment, onClose }: Props) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Compte-rendu</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
      </div>
      <div className="text-sm text-muted-foreground mb-3">
        <p className="font-medium text-foreground">{appointment.doctor}</p>
        <p>{appointment.specialty} · {appointment.date}</p>
      </div>
      {/* TODO BACKEND: GET /api/consultations/{id}/report — charger le compte-rendu réel */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3 text-sm">
        <div><p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Motif</p><p className="text-foreground">{appointment.motif}</p></div>
        <div><p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Examen clinique</p><p className="text-muted-foreground">Examen physique normal. Constantes dans les normes. TA 12/8, FC 72 bpm.</p></div>
        <div><p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Diagnostic</p><p className="text-muted-foreground">État de santé satisfaisant. Poursuite du traitement en cours.</p></div>
        <div><p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Conduite à tenir</p><p className="text-muted-foreground">Continuer le traitement prescrit. Contrôle dans 3 mois. Bilan sanguin à réaliser avant la prochaine consultation.</p></div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1 text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Télécharger PDF</Button>
        <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  </div>
);

export default ReportModal;
