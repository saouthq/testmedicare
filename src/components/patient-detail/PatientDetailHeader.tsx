/**
 * PatientDetailHeader — Toolbar du dossier patient.
 * Boutons : Actions (Ctrl+K), Message, Imprimer, Créer, Nouvelle consultation.
 */
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, AlertTriangle, Calendar, Droplets, FileText, Mail, MessageSquare,
  Phone, Pill, Plus, Printer, Search, Send, Stethoscope,
} from "lucide-react";
import { usePatientDetail } from "./PatientDetailContext";
import { toast } from "@/hooks/use-toast";

export default function PatientDetailHeader() {
  const {
    patient, navigate, setActionsOpen, setActionsQ, printDossier,
    createOpen, setCreateOpen, createWrapRef, openRx, openLabs, openDoc, setTab,
  } = usePatientDetail();

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/doctor/patients")} aria-label="Retour">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-lg font-semibold text-foreground">{patient?.name || "Patient"}</div>
            <div className="text-xs text-muted-foreground">
              {patient?.age ?? "-"} ans • {patient?.gender || ""} • {patient?.city || "Tunis"}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {patient?.phone || "—"}</span>
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {patient?.email || "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" title="Raccourci : Ctrl/Cmd+K"
            onClick={() => { setActionsOpen(true); setActionsQ(""); }}>
            <Search className="h-3.5 w-3.5 mr-1" /> Actions
          </Button>
          <Button variant="outline" size="sm" className="text-xs"
            onClick={() => toast({ title: "Message", description: "À brancher : ouvrir la conversation patient." })}>
            <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={printDossier}>
            <Printer className="mr-1 h-3.5 w-3.5" /> Imprimer
          </Button>

          {/* Créer menu */}
          <div ref={createWrapRef} className="relative">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateOpen((v) => !v)} aria-label="Créer">
              <Plus className="mr-1 h-3.5 w-3.5" /> Créer
            </Button>
            {createOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-xl border bg-card p-2 shadow-lg">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Créer</div>
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Soins</div>
                <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { setCreateOpen(false); openRx(); }}>
                  <Pill className="h-4 w-4 text-muted-foreground" /><span className="flex-1">Ordonnance</span>
                  <span className="text-[11px] text-muted-foreground">Créer</span>
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { setCreateOpen(false); openLabs(); }}>
                  <Droplets className="h-4 w-4 text-muted-foreground" /><span className="flex-1">Demande d'analyses</span>
                  <span className="text-[11px] text-muted-foreground">Créer</span>
                </button>
                <div className="my-1 h-px bg-border" />
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Documents</div>
                {([["report", "Compte-rendu", <FileText key="r" className="h-4 w-4 text-muted-foreground" />],
                  ["certificate", "Certificat médical", <FileText key="c" className="h-4 w-4 text-muted-foreground" />],
                  ["referral", "Lettre d'adressage", <Mail key="l" className="h-4 w-4 text-muted-foreground" />],
                  ["sickleave", "Arrêt de travail", <Calendar key="s" className="h-4 w-4 text-muted-foreground" />],
                ] as const).map(([k, label, icon]) => (
                  <button key={k} type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => { setCreateOpen(false); openDoc(k as any); }}>
                    {icon}<span className="flex-1">{label}</span>
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Dossier</div>
                <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { setCreateOpen(false); setTab("documents"); }}>
                  <Plus className="h-4 w-4 text-muted-foreground" /><span className="flex-1">Importer document / photo</span>
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { setCreateOpen(false); toast({ title: "Demander un document", description: "À brancher : demande de document au patient." }); }}>
                  <Send className="h-4 w-4 text-muted-foreground" /><span className="flex-1">Demander un document</span>
                </button>
              </div>
            ) : null}
          </div>

          <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow text-xs"
            onClick={() => toast({ title: "Nouvelle consultation", description: "Workflow intra‑page (UI). À brancher." })}>
            <Stethoscope className="mr-1 h-3.5 w-3.5" /> Nouvelle consultation
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(patient?.allergies || []).map((a: string) => (
          <span key={a} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />{a}
          </span>
        ))}
        {(patient?.conditions || []).map((c: string) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">{c}</span>
        ))}
      </div>
    </>
  );
}
