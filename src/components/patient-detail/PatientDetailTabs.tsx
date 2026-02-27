/**
 * PatientDetailTabs — Onglets principaux du dossier patient.
 * Contient la barre de recherche, le TabsBar, et le contenu de chaque onglet.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, Calendar } from "lucide-react";
import { usePatientDetail } from "./PatientDetailContext";
import { cx, humanSize } from "./helpers";
import type { MainTab } from "./types";

/* ── Card wrapper ── */
function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── TabsBar ── */
function TabsBar({ value, onChange, options }: { value: MainTab; onChange: (v: MainTab) => void; options: Array<{ value: MainTab; label: string }> }) {
  return (
    <div className="inline-flex rounded-lg border bg-card p-1 shadow-sm">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cx("rounded-md px-3 py-2 text-sm font-medium transition",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function PatientDetailTabs() {
  const ctx = usePatientDetail();
  const { tab, setTab, q, setQ, histFilter, setHistFilter, timeline, setDetailEvent, setDetailEdit, setDrawer } = ctx;

  return (
    <>
      {/* Search + TabsBar */}
      <Card title="Recherche dossier">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans le dossier… (ordonnance, analyse, note, date)" className="pl-9" />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <TabsBar value={tab} onChange={setTab} options={[
            { value: "historique", label: "Historique" },
            { value: "antecedents", label: "Antécédents" },
            { value: "traitement", label: "Traitement" },
            { value: "constantes", label: "Constantes" },
            { value: "notes", label: "Notes clinique" },
            { value: "notes_prive", label: "Notes privé" },
            { value: "documents", label: "Documents" },
          ]} />
          <div className="text-xs text-muted-foreground">La recherche filtre l'historique</div>
        </div>
      </Card>

      {/* Tab content */}
      {tab === "historique" && <HistoriqueContent />}
      {tab === "antecedents" && <AntecedentsContent />}
      {tab === "traitement" && <TraitementContent />}
      {tab === "constantes" && <ConstantesContent />}
      {tab === "notes" && <NotesContent />}
      {tab === "notes_prive" && <PrivateNotesContent />}
      {tab === "documents" && <DocumentsContent />}
    </>
  );
}

/* ════════════════════════════════════════════════ */
/* Individual tab contents                         */
/* ════════════════════════════════════════════════ */

function HistoriqueContent() {
  const { histFilter, setHistFilter, timeline, setDetailEvent, setDetailEdit, setDrawer } = usePatientDetail();
  return (
    <Card title="Historique" right={
      <div className="flex flex-wrap gap-2">
        {([["all", "Tout"], ["consult", "Consult"], ["rx", "Rx"], ["lab", "Analyses"], ["doc", "Docs"]] as const).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setHistFilter(k)}
            className={cx("rounded-full border px-3 py-1 text-xs",
              histFilter === k ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted")}>
            {label}
          </button>
        ))}
      </div>
    }>
      <div className="space-y-2">
        {timeline.slice(0, 20).map((e) => (
          <button key={e.id} type="button"
            className="flex w-full items-start justify-between gap-3 rounded-xl border bg-background px-3 py-2 text-left hover:bg-muted"
            onClick={() => { setDetailEvent(e); setDetailEdit(false); setDrawer("detail"); }}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-sm font-semibold text-foreground">{e.title}</div>
                <div className="text-xs text-muted-foreground">{e.at}</div>
              </div>
              {e.desc ? <div className="text-xs text-muted-foreground line-clamp-1">{e.desc}</div> : null}
            </div>
            <div className="text-xs text-muted-foreground">Ouvrir</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function AntecedentsContent() {
  const { ante, setAnte, anteHistory, saveAnte } = usePatientDetail();
  return (
    <>
      <Card title="Antécédents" right={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAnte({ medical: "", surgical: "", traumatic: "", family: "" })}>Vider</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveAnte}>Enregistrer</Button>
        </div>
      }>
        <div className="grid gap-3 md:grid-cols-2">
          {([["Médicaux", "medical"], ["Chirurgicaux", "surgical"], ["Traumatiques", "traumatic"], ["Familiaux", "family"]] as const).map(([label, key]) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <textarea value={(ante as any)[key]} onChange={(e) => setAnte({ ...ante, [key]: e.target.value })} rows={3}
                className="mt-1 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Historique antécédents">
        {anteHistory.length ? (
          <div className="space-y-2">
            {anteHistory.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{h.at}</div>
                  <div className="text-xs text-muted-foreground">M: {h.data.medical || "—"} • C: {h.data.surgical || "—"}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAnte(h.data)}>Restaurer</Button>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground">Aucune version enregistrée.</div>}
      </Card>
    </>
  );
}

function TraitementContent() {
  const { activeTreatments, activeRx, openRx } = usePatientDetail();
  return (
    <Card title="Traitement actif" right={
      <Button variant="outline" size="sm" onClick={openRx}>Nouvelle ordonnance</Button>
    }>
      {activeTreatments.length ? (
        <div className="space-y-2">
          {activeTreatments.map((t, i) => (
            <div key={i} className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground">{t}</div>
          ))}
          <div className="text-xs text-muted-foreground mt-2">
            Source : {activeRx.map((r: any) => r.id).join(", ")}
          </div>
        </div>
      ) : <div className="text-sm text-muted-foreground">Aucun traitement actif.</div>}
    </Card>
  );
}

function ConstantesContent() {
  const { vitals, setVitals, vitalsHistory, saveVitals } = usePatientDetail();
  return (
    <>
      <Card title="Constantes" right={
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveVitals}>Enregistrer</Button>
      }>
        <div className="grid gap-3 md:grid-cols-4">
          {([["TA", "ta"], ["FC", "fc"], ["Poids", "weight"], ["Glycémie", "gly"]] as const).map(([label, key]) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input value={(vitals as any)[key]} onChange={(e) => setVitals((p) => ({ ...p, [key]: e.target.value }))} className="mt-1" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Historique constantes">
        {vitalsHistory.length ? (
          <div className="space-y-2">
            {vitalsHistory.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{h.at}</div>
                  <div className="text-xs text-muted-foreground">TA {h.data.ta} • FC {h.data.fc} • {h.data.weight} kg • {h.data.gly}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setVitals(h.data)}>Restaurer</Button>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground">Aucun historique.</div>}
      </Card>
    </>
  );
}

function NotesContent() {
  const { notes, setNotes, notesHistory, saveNotes } = usePatientDetail();
  return (
    <>
      <Card title="Notes cliniques" right={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNotes("")}>Vider</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveNotes}>Enregistrer</Button>
        </div>
      }>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={12}
          className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
      </Card>
      <Card title="Historique notes cliniques">
        {notesHistory.length ? (
          <div className="space-y-2">
            {notesHistory.slice(0, 10).map((h) => (
              <div key={h.id} className="rounded-xl border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{h.at}</div>
                  <Button variant="outline" size="sm" onClick={() => setNotes(h.text)}>Restaurer</Button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground">Aucune version enregistrée.</div>}
      </Card>
    </>
  );
}

function PrivateNotesContent() {
  const { privateNotes, setPrivateNotes, privateHistory, savePrivate } = usePatientDetail();
  return (
    <>
      <Card title="Notes privées (internes)" right={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPrivateNotes("")}>Vider</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={savePrivate}>Enregistrer</Button>
        </div>
      }>
        <div className="text-xs text-muted-foreground">Non partagées au patient.</div>
        <textarea value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} rows={10}
          className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
      </Card>
      <Card title="Historique notes privées">
        {privateHistory.length ? (
          <div className="space-y-2">
            {privateHistory.slice(0, 10).map((h) => (
              <div key={h.id} className="rounded-xl border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{h.at}</div>
                  <Button variant="outline" size="sm" onClick={() => setPrivateNotes(h.text)}>Restaurer</Button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground">Aucune version enregistrée.</div>}
      </Card>
    </>
  );
}

function DocumentsContent() {
  const { files, fileInputRef, photoInputRef, addFiles, removeFile } = usePatientDetail();
  return (
    <Card title="Documents" right={
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp" className="hidden"
          onChange={(e) => { addFiles(e.target.files, "document"); e.currentTarget.value = ""; }} />
        <input ref={photoInputRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => { addFiles(e.target.files, "photo"); e.currentTarget.value = ""; }} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileText className="mr-2 h-4 w-4" /> Importer document
        </Button>
        <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
          <Calendar className="mr-2 h-4 w-4" /> Importer photo
        </Button>
      </div>
    }>
      <div className="text-xs text-muted-foreground">Mock : stockage local navigateur. (Backend → Supabase Storage).</div>
      <div className="mt-3 space-y-2">
        {files.length ? files.slice(0, 30).map((f) => (
          <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">{f.name}</span>
                <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium",
                  f.kind === "photo" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  {f.kind === "photo" ? "Photo" : "Document"}
                </span>
                <span className="text-[11px] text-muted-foreground">{f.at}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{f.mime}{typeof f.size === "number" ? ` • ${humanSize(f.size)}` : ""}</div>
            </div>
            <div className="flex items-center gap-2">
              {f.url ? <Button variant="outline" size="sm" onClick={() => window.open(f.url, "_blank", "noopener,noreferrer")}>Ouvrir</Button> : null}
              <Button variant="outline" size="sm" onClick={() => removeFile(f.id)}>Supprimer</Button>
            </div>
          </div>
        )) : (
          <div className="rounded-xl border bg-muted px-3 py-8 text-center text-sm text-muted-foreground">Aucun document importé.</div>
        )}
      </div>
    </Card>
  );
}
