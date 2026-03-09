/**
 * CareSheetModal — Feuille de soins (PDF)
 * Generate/preview/download/send care sheet to patient
 * 
 * // TODO BACKEND: POST /api/care-sheet/generate, POST /api/care-sheet/send
 */
import { useState } from "react";
import { FileText, Download, Send, Printer, X, CheckCircle2, User, Calendar, Stethoscope, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { mockDoctorProfile } from "@/data/mockData";

interface CareSheetModalProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  patientId: number;
  consultationDate: string;
  motif: string;
  amount: string;
  assurance?: string;
  assuranceNumber?: string;
  actes?: string[];
}

const CareSheetModal = ({
  open,
  onClose,
  patientName,
  patientId,
  consultationDate,
  motif,
  amount,
  assurance = "Sans assurance",
  assuranceNumber,
  actes = ["Consultation générale"],
}: CareSheetModalProps) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const doctor = mockDoctorProfile;

  const handleDownload = () => {
    // TODO BACKEND: Generate actual PDF
    toast({ title: "Téléchargement", description: "Feuille de soins téléchargée (mock)." });
  };

  const handlePrint = () => {
    // TODO: Trigger print
    window.print();
    toast({ title: "Impression", description: "Impression lancée." });
  };

  const handleSend = async () => {
    setSending(true);
    // TODO BACKEND: POST /api/care-sheet/send
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setSent(true);
    toast({ 
      title: "Envoyé au patient", 
      description: "La feuille de soins a été envoyée dans les documents du patient." 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-card shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Feuille de soins
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            {/* Header officiel */}
            <div className="text-center border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-foreground">FEUILLE DE SOINS</h3>
              <p className="text-sm text-muted-foreground">Document à conserver pour remboursement assurance</p>
            </div>

            {/* Médecin */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5" />Praticien
                </p>
                <p className="font-semibold text-foreground">{doctor.name}</p>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                <p className="text-xs text-muted-foreground mt-1">{doctor.address}</p>
                <p className="text-xs text-muted-foreground">{doctor.phone}</p>
                <p className="text-xs text-primary mt-1">N° Ordre: {doctor.orderNumber}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />Patient
                </p>
                <p className="font-semibold text-foreground">{patientName}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" />{assurance}
                </p>
                {assuranceNumber && (
                  <p className="text-xs text-muted-foreground">N° Assuré: {assuranceNumber}</p>
                )}
              </div>
            </div>

            {/* Consultation details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Date: <strong>{consultationDate}</strong></span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Motif de consultation</p>
                <p className="text-sm text-foreground">{motif}</p>
              </div>
            </div>

            {/* Actes */}
            <div className="rounded-lg border overflow-hidden mb-6">
              <div className="bg-muted/50 px-4 py-2 border-b">
                <p className="text-xs font-medium text-muted-foreground uppercase">Actes réalisés</p>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Désignation</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {actes.map((acte, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-2 text-foreground">{acte}</td>
                      <td className="px-4 py-2 text-right text-foreground">{i === 0 ? amount : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary/5">
                  <tr>
                    <td className="px-4 py-2 font-semibold text-foreground">Total</td>
                    <td className="px-4 py-2 text-right font-bold text-primary">{amount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Paiement */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Mode de paiement: Espèces / Carte / Chèque</span>
            </div>

            {/* Signature */}
            <div className="mt-6 pt-4 border-t grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Signature du praticien</p>
                <div className="h-16 border-b-2 border-dashed border-muted-foreground/30" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Cachet du cabinet</p>
                <div className="h-16 border rounded-lg border-dashed border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">
                  [Cachet]
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />Imprimer
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />Télécharger PDF
            </Button>
            <Button 
              className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" 
              onClick={handleSend}
              disabled={sending || sent}
            >
              {sent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />Envoyé
                </>
              ) : sending ? (
                "Envoi..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />Envoyer au patient
                </>
              )}
            </Button>
          </div>

          {sent && (
            <p className="text-xs text-accent text-center mt-3 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              La feuille de soins apparaîtra dans les documents du patient
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareSheetModal;
