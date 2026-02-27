import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  User, Clock, Bell, Shield, Save, Plus, Trash2, Pencil, X,
  Eye, GraduationCap, Briefcase, Award, CreditCard, Navigation,
  Camera,
} from "lucide-react";
import { mockDoctorProfile } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

type Tab = "profile" | "availability" | "notifications" | "security";
const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const DoctorSettings = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const p = mockDoctorProfile;

  // Profile state from centralized mock
  const [firstName] = useState(p.name.replace("Dr. ", "").split(" ")[0]);
  const [lastName] = useState(p.name.replace("Dr. ", "").split(" ").slice(1).join(" "));
  const [subSpecialties, setSubSpecialties] = useState(p.subSpecialties);
  const [newSubSpec, setNewSubSpec] = useState("");
  const [diplomas, setDiplomas] = useState(p.diplomas);
  const [actes, setActes] = useState(p.actes);
  const [newActe, setNewActe] = useState("");
  const [memberships, setMemberships] = useState(p.memberships);
  const [newMembership, setNewMembership] = useState("");
  const [motifs, setMotifs] = useState(p.motifs);
  const [accessInfo, setAccessInfo] = useState(p.accessInfo);

  // Diploma edit
  const [editDiploma, setEditDiploma] = useState<number | null>(null);
  const [diplomaForm, setDiplomaForm] = useState({ title: "", school: "", year: "" });

  // Motif edit
  const [editMotif, setEditMotif] = useState<number | null>(null);
  const [motifForm, setMotifForm] = useState({ name: "", duration: "", price: "" });

  const [availability, setAvailability] = useState<Record<string, { active: boolean; start: string; end: string; breakStart: string; breakEnd: string }>>({
    Lundi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mardi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Mercredi: { active: true, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
    Jeudi: { active: true, start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
    Vendredi: { active: true, start: "08:00", end: "17:00", breakStart: "12:00", breakEnd: "14:00" },
    Samedi: { active: false, start: "08:00", end: "12:00", breakStart: "", breakEnd: "" },
  });

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "availability" as Tab, label: "Disponibilités", icon: Clock },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  const addChip = (value: string, list: string[], setter: (v: string[]) => void, inputSetter: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputSetter("");
    }
  };

  const handleSave = () => {
    toast({ title: "Enregistré", description: "Vos modifications ont été sauvegardées." });
  };

  return (
    <DashboardLayout role="doctor" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-6">
            {/* View public profile link */}
            <Link to="/doctor/1" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Eye className="h-4 w-4" />Voir mon profil public
            </Link>

            {/* Photo + Personal info */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
                  {p.initials}
                </div>
                <div>
                  <Button variant="outline" size="sm" className="text-xs"><Camera className="h-3.5 w-3.5 mr-1" />Changer la photo</Button>
                  <p className="text-[11px] text-muted-foreground mt-1">JPG ou PNG, max 2 Mo</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Prénom</Label><Input defaultValue={firstName} className="mt-1" /></div>
                <div><Label>Nom</Label><Input defaultValue={lastName} className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue={p.email} className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue={p.phone} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse du cabinet</Label><Input defaultValue={p.address} className="mt-1" /></div>
              </div>
            </div>

            {/* Professional info */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations professionnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Spécialité</Label><Input defaultValue={p.specialty} className="mt-1" /></div>
                <div><Label>N° Ordre des Médecins</Label><Input defaultValue={p.orderNumber} className="mt-1" /></div>
                <div><Label>Convention CNAM</Label>
                  <select defaultValue={p.convention} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Conventionné Secteur 1</option><option>Conventionné Secteur 2</option><option>Non conventionné</option>
                  </select>
                </div>
                <div><Label>Tarif consultation (DT)</Label><Input defaultValue={p.priceRange.consultation} className="mt-1" type="number" /></div>
                <div className="sm:col-span-2"><Label>Présentation</Label><textarea defaultValue={p.presentation} rows={4} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
                <div><Label>Durée de consultation (min)</Label><Input defaultValue={p.consultationDuration} className="mt-1" type="number" /></div>
                <div><Label>Langues parlées</Label><Input defaultValue={p.languages.join(", ")} className="mt-1" /></div>
              </div>
            </div>

            {/* Sub-specialties */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />Sous-spécialités</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {subSpecialties.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    {s}
                    <button onClick={() => setSubSpecialties(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSubSpec} onChange={e => setNewSubSpec(e.target.value)} placeholder="Ajouter une sous-spécialité..." className="flex-1" onKeyDown={e => e.key === "Enter" && addChip(newSubSpec, subSpecialties, setSubSpecialties, setNewSubSpec)} />
                <Button variant="outline" size="sm" onClick={() => addChip(newSubSpec, subSpecialties, setSubSpecialties, setNewSubSpec)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Diplomas */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />Formations & Diplômes</h3>
                <Button variant="outline" size="sm" onClick={() => { setEditDiploma(-1); setDiplomaForm({ title: "", school: "", year: "" }); }}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
              </div>
              <div className="space-y-2">
                {diplomas.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.school} · {d.year}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditDiploma(i); setDiplomaForm(d); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDiplomas(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              {editDiploma !== null && (
                <div className="mt-3 rounded-lg border p-4 bg-primary/5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><Label className="text-xs">Titre *</Label><Input value={diplomaForm.title} onChange={e => setDiplomaForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Établissement</Label><Input value={diplomaForm.school} onChange={e => setDiplomaForm(f => ({ ...f, school: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Année</Label><Input value={diplomaForm.year} onChange={e => setDiplomaForm(f => ({ ...f, year: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditDiploma(null)}>Annuler</Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground" disabled={!diplomaForm.title.trim()} onClick={() => {
                      if (editDiploma === -1) setDiplomas(prev => [...prev, diplomaForm]);
                      else setDiplomas(prev => prev.map((d, i) => i === editDiploma ? diplomaForm : d));
                      setEditDiploma(null);
                      toast({ title: editDiploma === -1 ? "Ajouté" : "Modifié" });
                    }}><Save className="h-3.5 w-3.5 mr-1" />{editDiploma === -1 ? "Ajouter" : "Enregistrer"}</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Expertises & Actes */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />Expertises & Actes</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {actes.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-lg">
                    {a}
                    <button onClick={() => setActes(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newActe} onChange={e => setNewActe(e.target.value)} placeholder="Ajouter un acte..." className="flex-1" onKeyDown={e => e.key === "Enter" && addChip(newActe, actes, setActes, setNewActe)} />
                <Button variant="outline" size="sm" onClick={() => addChip(newActe, actes, setActes, setNewActe)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Affiliations */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Affiliations</h3>
              <div className="space-y-2 mb-3">
                {memberships.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                    <p className="text-sm text-foreground">{m}</p>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setMemberships(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newMembership} onChange={e => setNewMembership(e.target.value)} placeholder="Ajouter une affiliation..." className="flex-1" onKeyDown={e => { if (e.key === "Enter") addChip(newMembership, memberships, setMemberships, setNewMembership); }} />
                <Button variant="outline" size="sm" onClick={() => addChip(newMembership, memberships, setMemberships, setNewMembership)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Tarifs par motif */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Tarifs par motif</h3>
                <Button variant="outline" size="sm" onClick={() => { setEditMotif(-1); setMotifForm({ name: "", duration: "", price: "" }); }}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Motif</th>
                      <th className="pb-2 font-medium">Durée</th>
                      <th className="pb-2 font-medium">Prix</th>
                      <th className="pb-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {motifs.map((m, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2.5 font-medium text-foreground">{m.name}</td>
                        <td className="py-2.5 text-muted-foreground">{m.duration}</td>
                        <td className="py-2.5 font-bold text-primary">{m.price}</td>
                        <td className="py-2.5">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditMotif(i); setMotifForm(m); }}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setMotifs(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editMotif !== null && (
                <div className="mt-3 rounded-lg border p-4 bg-primary/5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><Label className="text-xs">Motif *</Label><Input value={motifForm.name} onChange={e => setMotifForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Durée</Label><Input value={motifForm.duration} onChange={e => setMotifForm(f => ({ ...f, duration: e.target.value }))} placeholder="Ex: 30 min" className="mt-1" /></div>
                    <div><Label className="text-xs">Prix</Label><Input value={motifForm.price} onChange={e => setMotifForm(f => ({ ...f, price: e.target.value }))} placeholder="Ex: 35 DT" className="mt-1" /></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditMotif(null)}>Annuler</Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground" disabled={!motifForm.name.trim()} onClick={() => {
                      if (editMotif === -1) setMotifs(prev => [...prev, motifForm]);
                      else setMotifs(prev => prev.map((m, i) => i === editMotif ? motifForm : m));
                      setEditMotif(null);
                      toast({ title: editMotif === -1 ? "Motif ajouté" : "Motif modifié" });
                    }}><Save className="h-3.5 w-3.5 mr-1" />{editMotif === -1 ? "Ajouter" : "Enregistrer"}</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Access info */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Navigation className="h-4 w-4 text-primary" />Informations d'accès</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={accessInfo.parking} onChange={() => setAccessInfo(a => ({ ...a, parking: !a.parking }))} className="rounded border-input h-5 w-5" />
                  <span className="text-sm text-foreground">🅿️ Parking disponible</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={accessInfo.handicap} onChange={() => setAccessInfo(a => ({ ...a, handicap: !a.handicap }))} className="rounded border-input h-5 w-5" />
                  <span className="text-sm text-foreground">♿ Accès handicapé</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={accessInfo.elevator} onChange={() => setAccessInfo(a => ({ ...a, elevator: !a.elevator }))} className="rounded border-input h-5 w-5" />
                  <span className="text-sm text-foreground">🛗 Ascenseur</span>
                </label>
                <div className="sm:col-span-2">
                  <Label>Transport en commun</Label>
                  <Input value={accessInfo.publicTransport} onChange={e => setAccessInfo(a => ({ ...a, publicTransport: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </div>

            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "availability" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Horaires d'ouverture</h3>
            <div className="space-y-4">
              {weekDays.map(day => {
                const d = availability[day];
                return (
                  <div key={day} className={`rounded-lg border p-4 transition-colors ${d.active ? "bg-card" : "bg-muted/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={d.active} onChange={() => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }))} className="rounded border-input" />
                        <span className={`text-sm font-medium ${d.active ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                      </label>
                      {!d.active && <span className="text-xs text-muted-foreground">Fermé</span>}
                    </div>
                    {d.active && (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <div><Label className="text-xs">Début</Label><Input type="time" value={d.start} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Fin</Label><Input type="time" value={d.end} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Pause début</Label><Input type="time" value={d.breakStart} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakStart: e.target.value } }))} className="mt-1" /></div>
                        <div><Label className="text-xs">Pause fin</Label><Input type="time" value={d.breakEnd} onChange={e => setAvailability(prev => ({ ...prev, [day]: { ...prev[day], breakEnd: e.target.value } }))} className="mt-1" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouveau rendez-vous", desc: "Recevoir une notification à chaque nouveau RDV" },
                { label: "Annulation de RDV", desc: "Être notifié quand un patient annule" },
                { label: "Résultats d'analyses", desc: "Notification quand de nouveaux résultats sont disponibles" },
                { label: "Messages patients", desc: "Recevoir une alerte pour chaque nouveau message" },
                { label: "Rappel planning", desc: "Rappel quotidien du planning du jour" },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Email</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />SMS</label>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer le nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow">Changer le mot de passe</Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
              <p className="text-sm text-muted-foreground mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettings;
