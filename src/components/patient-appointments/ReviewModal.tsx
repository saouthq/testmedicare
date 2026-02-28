import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, CheckCircle2, Send } from "lucide-react";

interface Props {
  appointment: { id: number; doctor: string; date: string; motif: string };
  onClose: () => void;
  onSubmit: (id: number, text: string) => void;
}

const ReviewModal = ({ appointment, onClose, onSubmit }: Props) => {
  const [reviewText, setReviewText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Laisser un avis</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Consultation avec {appointment.doctor}</p>
        <p className="text-xs text-muted-foreground mb-4">{appointment.date} · {appointment.motif}</p>
        <div className="flex items-center gap-1.5 mb-3 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="font-medium">Consultation vérifiée</span>
          <span className="text-muted-foreground">— Votre avis sera marqué comme vérifié</span>
        </div>
        <Textarea
          placeholder="Partagez votre expérience avec ce praticien..."
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          className="min-h-[100px] mb-4"
        />
        <Button
          className="w-full gradient-primary text-primary-foreground"
          disabled={!reviewText.trim()}
          onClick={() => {
            // TODO BACKEND: POST /api/reviews — envoyer l'avis
            onSubmit(appointment.id, reviewText);
          }}
        >
          <Send className="h-4 w-4 mr-2" />Envoyer mon avis
        </Button>
      </div>
    </div>
  );
};

export default ReviewModal;
