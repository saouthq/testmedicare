/**
 * PreCheckScreen — Checklist pré-téléconsultation patient.
 * Vérification caméra/micro/audio, choix device, preview vidéo, état connexion.
 */
import { AlertTriangle, Camera, CheckCircle2, Clock, FileText, Mic, Shield, User, Video, Volume2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeleconsultation } from "./TeleconsultationContext";

const checklistItems = [
  { key: "internet", label: "Connexion internet stable", desc: "Privilégiez le Wi-Fi ou la 4G", icon: Wifi },
  { key: "camera", label: "Caméra fonctionnelle", desc: "Testez votre caméra avant l'appel", icon: Camera },
  { key: "micro", label: "Microphone activé", desc: "Vérifiez que le son fonctionne", icon: Mic },
  { key: "quiet", label: "Environnement calme", desc: "Installez-vous dans un endroit calme et privé", icon: Shield },
  { key: "documents", label: "Documents à portée de main", desc: "Ordonnances, résultats d'analyses...", icon: FileText },
  { key: "identity", label: "Pièce d'identité prête", desc: "Le médecin peut la demander pour vérification", icon: User },
];

export default function PreCheckScreen() {
  const ctx = useTeleconsultation();
  const checkedCount = Object.values(ctx.checks).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* RDV info banner */}
      <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Video className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Téléconsultation à venir</h2>
            <p className="text-primary-foreground/80 text-sm mt-0.5">{ctx.otherPerson.name} · {ctx.otherPerson.role}</p>
            <p className="text-primary-foreground/80 text-xs mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />Aujourd'hui à 14:30 · Durée estimée : 20 min
            </p>
          </div>
        </div>
      </div>

      {/* Video preview + device selection */}
      <div className="rounded-xl border bg-card shadow-card p-5">
        <h3 className="font-semibold text-foreground mb-3">Aperçu vidéo & audio</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Video preview placeholder */}
          <div className="aspect-video rounded-xl bg-foreground/90 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <User className="h-8 w-8 text-primary-foreground/50" />
              </div>
              <p className="text-primary-foreground/60 text-xs">Aperçu caméra</p>
            </div>
          </div>
          {/* Device selection */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Caméra</p>
              <Select defaultValue="default">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-xs">Caméra intégrée</SelectItem>
                  <SelectItem value="ext" className="text-xs">Webcam externe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Microphone</p>
              <Select defaultValue="default">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-xs">Micro intégré</SelectItem>
                  <SelectItem value="ext" className="text-xs">Micro externe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Haut-parleur</p>
              <Select defaultValue="default">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-xs">Haut-parleur intégré</SelectItem>
                  <SelectItem value="ext" className="text-xs">Casque audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Audio test */}
            <Button variant="outline" size="sm" className="text-xs w-full" onClick={ctx.retestMic}>
              <Volume2 className="h-3.5 w-3.5 mr-1" /> Tester le son
            </Button>
            {/* Connection indicator */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div className={`h-2 w-2 rounded-full ${ctx.connection === "excellent" ? "bg-accent" : ctx.connection === "checking" ? "bg-warning animate-pulse" : "bg-destructive"}`} />
              <span className="text-xs text-muted-foreground">
                {ctx.connection === "checking" ? "Vérification connexion…" : ctx.connection === "excellent" ? "Connexion excellente" : "Connexion faible"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border bg-card shadow-card p-5">
        <h3 className="font-semibold text-foreground mb-1">Checklist pré-consultation</h3>
        <p className="text-xs text-muted-foreground mb-4">Vérifiez ces points avant de rejoindre</p>
        <div className="space-y-3">
          {checklistItems.map(item => (
            <button
              key={item.key}
              onClick={() => ctx.toggleCheck(item.key)}
              className={`w-full flex items-center gap-3 rounded-xl border p-4 transition-all text-left ${
                ctx.checks[item.key] ? "border-accent bg-accent/5" : "hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                ctx.checks[item.key] ? "border-accent bg-accent" : "border-muted-foreground/30"
              }`}>
                {ctx.checks[item.key] && <CheckCircle2 className="h-4 w-4 text-accent-foreground" />}
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                ctx.checks[item.key] ? "bg-accent/10" : "bg-muted"
              }`}>
                <item.icon className={`h-4 w-4 ${ctx.checks[item.key] ? "text-accent" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{checkedCount}/{checklistItems.length} vérifié(s)</p>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" disabled={!ctx.allChecked} onClick={ctx.startCall}>
            <Video className="h-4 w-4 mr-2" />Rejoindre la téléconsultation
          </Button>
        </div>
        {!ctx.allChecked && (
          <p className="text-xs text-warning mt-3 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />Veuillez valider tous les points avant de rejoindre
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl border bg-card shadow-card p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">💡 Conseils</h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>• Préparez vos questions à l'avance</li>
          <li>• Ayez vos médicaments actuels sous les yeux</li>
          <li>• Notez les symptômes que vous souhaitez décrire</li>
          <li>• La consultation est chiffrée de bout en bout</li>
        </ul>
      </div>
    </div>
  );
}
