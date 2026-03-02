/**
 * SummaryScreen — Écran récapitulatif post-appel.
 * Notes + docs générés + actions finales (envoyer, PDF, retour).
 */
import { ArrowRight, CheckCircle2, Download, FileText, Mail, Pill, Printer, Send, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTeleconsultation } from "./TeleconsultationContext";

export default function SummaryScreen() {
  const ctx = useTeleconsultation();

  const handleSendDocs = () => {
    // TODO BACKEND: POST /api/teleconsultation/send-documents
    toast({ title: "Documents envoyés", description: "Ordonnance et résultats envoyés au patient (mock)." });
  };

  const handleExportPDF = () => {
    // TODO BACKEND: GET /api/teleconsultation/export-pdf
    toast({ title: "Export PDF", description: "Export du résumé en PDF (à brancher)." });
  };

  const handlePrint = () => {
    // TODO BACKEND: Print
    toast({ title: "Impression", description: "Impression du résumé (à brancher)." });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-8 shadow-card text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Téléconsultation terminée</h2>
        <p className="text-muted-foreground mt-2">
          La consultation avec {ctx.otherPerson.name} a été terminée avec succès.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Durée : {ctx.callDuration}</p>
      </div>

      {/* Summary details */}
      {ctx.role === "doctor" && (
        <>
          {/* Notes */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />Notes de consultation
            </h3>
            <Textarea
              value={ctx.summary.notes}
              onChange={e => ctx.setSummary(s => ({ ...s, notes: e.target.value }))}
              className="min-h-[100px] text-sm"
            />
          </div>

          {/* Prescriptions */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />Ordonnance
            </h3>
            <div className="space-y-2">
              {ctx.summary.prescriptions.map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={p.medication}
                      onChange={e => ctx.setSummary(s => ({
                        ...s,
                        prescriptions: s.prescriptions.map((x, j) => j === i ? { ...x, medication: e.target.value } : x)
                      }))}
                      className="h-8 text-sm font-medium mb-1"
                      placeholder="Médicament"
                    />
                    <Input
                      value={p.dosage}
                      onChange={e => ctx.setSummary(s => ({
                        ...s,
                        prescriptions: s.prescriptions.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x)
                      }))}
                      className="h-8 text-xs"
                      placeholder="Posologie"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyses */}
          {ctx.summary.analyses.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />Analyses prescrites
              </h3>
              <div className="flex flex-wrap gap-2">
                {ctx.summary.analyses.map(a => (
                  <span key={a} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Next RDV */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Prochain RDV</Label>
                <Input
                  value={ctx.summary.nextRdv}
                  onChange={e => ctx.setSummary(s => ({ ...s, nextRdv: e.target.value }))}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Montant (DT)</Label>
                <Input
                  value={ctx.summary.amount}
                  onChange={e => ctx.setSummary(s => ({ ...s, amount: e.target.value }))}
                  className="mt-1 h-9"
                  type="number"
                />
              </div>
              <div className="sm:col-span-2">
                <div className={`rounded-lg p-3 flex items-center gap-2 ${
                  ctx.summary.paymentStatus === "captured" ? "bg-accent/5 border border-accent/20" : "bg-warning/5 border border-warning/20"
                }`}>
                  <CheckCircle2 className={`h-4 w-4 ${ctx.summary.paymentStatus === "captured" ? "text-accent" : "text-warning"}`} />
                  <span className="text-sm font-medium text-foreground">
                    {ctx.summary.paymentStatus === "captured" ? "Paiement capturé" : "Paiement en attente"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Patient simple view */}
      {ctx.role === "patient" && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">Résumé</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Médecin</span>
              <span className="font-medium text-foreground">{ctx.otherPerson.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{ctx.callDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prochain RDV</span>
              <span className="font-medium text-foreground">{ctx.summary.nextRdv}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Vos documents (ordonnance, analyses) seront disponibles dans votre espace patient.
          </p>
        </div>
      )}

      {/* Final actions */}
      <div className="flex gap-3 justify-center flex-wrap">
        {ctx.role === "doctor" && (
          <>
            <Button variant="outline" size="sm" className="text-xs" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" />Imprimer
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleExportPDF}>
              <Download className="h-3.5 w-3.5 mr-1" />Exporter PDF
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleSendDocs}>
              <Send className="h-3.5 w-3.5 mr-1" />Envoyer au patient
            </Button>
          </>
        )}
        <Button size="sm" className="text-xs gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => window.history.back()}>
          <ArrowRight className="h-3.5 w-3.5 mr-1" />Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
