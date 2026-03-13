/**
 * ProfileTab — Refonte Doctolib-style.
 * 2 colonnes : aperçu profil + sections éditables avec indicateur de complétion.
 * Data source: doctorProfileStore (dual-mode demo/production, syncs to Supabase).
 */
import { useState, useMemo } from "react";
import { Award, Briefcase, Camera, CreditCard, Globe, GraduationCap, MapPin, Navigation, Plus, Trash2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoctorProfile, updateDoctorProfile } from "@/stores/doctorProfileStore";
import { toast } from "@/hooks/use-toast";
import ProfileCompletionBar, { type CompletionItem } from "./ProfileCompletionBar";
import ProfilePreview from "./ProfilePreview";
import ProfileSection from "./ProfileSection";
import ProfileSectionEditor from "./ProfileSectionEditor";

type EditingSection = null | "identity" | "cabinet" | "specialties" | "tarifs" | "actes" | "languages" | "diplomas" | "affiliations" | "description";

const ProfileTab = () => {
  const [p] = useDoctorProfile();

  // State
  const [firstName, setFirstName] = useState(p.name.replace("Dr. ", "").split(" ")[0]);
  const [lastName, setLastName] = useState(p.name.replace("Dr. ", "").split(" ").slice(1).join(" "));
  const [email, setEmail] = useState(p.email);
  const [phone, setPhone] = useState(p.phone);
  const [address, setAddress] = useState(p.address);
  const [presentation, setPresentation] = useState(p.presentation);
  const [specialty] = useState(p.specialty);
  const [subSpecialties, setSubSpecialties] = useState(p.subSpecialties);
  const [newSubSpec, setNewSubSpec] = useState("");
  const [diplomas, setDiplomas] = useState(p.diplomas);
  const [actes, setActes] = useState(p.actes);
  const [newActe, setNewActe] = useState("");
  const [memberships, setMemberships] = useState(p.memberships);
  const [newMembership, setNewMembership] = useState("");
  const [motifs, setMotifs] = useState(p.motifs);
  const [languages, setLanguages] = useState(p.languages);
  const [newLang, setNewLang] = useState("");
  const [accessInfo, setAccessInfo] = useState(p.accessInfo);

  // Editing
  const [editing, setEditing] = useState<EditingSection>(null);
  const [diplomaForm, setDiplomaForm] = useState({ title: "", school: "", year: "" });
  const [motifForm, setMotifForm] = useState({ name: "", duration: "", price: "" });

  // Completion
  const completionItems = useMemo<CompletionItem[]>(() => [
    { key: "photo", label: "Photo de profil", done: false, onClick: () => toast({ title: "Photo", description: "Upload à brancher." }) },
    { key: "presentation", label: "Description / Présentation", done: !!presentation.trim(), onClick: () => setEditing("description") },
    { key: "address", label: "Adresse du cabinet", done: !!address.trim(), onClick: () => setEditing("cabinet") },
    { key: "phone", label: "Téléphone", done: !!phone.trim(), onClick: () => setEditing("identity") },
    { key: "subspecialties", label: "Sous-spécialités", done: subSpecialties.length > 0, onClick: () => setEditing("specialties") },
    { key: "tarifs", label: "Au moins 1 tarif", done: motifs.length > 0, onClick: () => setEditing("tarifs") },
    { key: "diplomas", label: "Diplômes", done: diplomas.length > 0, onClick: () => setEditing("diplomas") },
    { key: "languages", label: "Langues parlées", done: languages.length > 0, onClick: () => setEditing("languages") },
  ], [presentation, address, phone, subSpecialties, motifs, diplomas, languages]);

  // Preview data
  const previewData = useMemo(() => ({
    initials: p.initials,
    name: `Dr. ${firstName} ${lastName}`,
    specialty, subSpecialties, address, phone, languages,
    reviewCount: p.reviewCount,
    consultationDuration: String(p.consultationDuration),
    priceConsultation: String(p.priceRange.consultation),
    presentation,
  }), [firstName, lastName, specialty, subSpecialties, address, phone, languages, presentation, p]);

  const addChip = (value: string, list: string[], setter: (v: string[]) => void, inputSetter: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputSetter("");
    }
  };

  const handleSave = (section: EditingSection) => {
    // Persist all current state to doctorProfileStore (which handles Supabase sync)
    updateDoctorProfile({
      name: `Dr. ${firstName} ${lastName}`,
      email,
      phone,
      address,
      presentation,
      subSpecialties,
      languages,
      diplomas,
      actes,
      memberships,
      motifs,
      accessInfo,
    });
    setEditing(null);
    toast({ title: "Enregistré", description: "Modifications sauvegardées." });
  };

  return (
    <div className="space-y-6">
      <ProfileCompletionBar items={completionItems} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Sections éditables */}
        <div className="space-y-4">
          {/* Identity */}
          <ProfileSection icon={User} title="Identité" onEdit={() => setEditing("identity")}>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
                {p.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Dr. {firstName} {lastName}</p>
                <p className="text-xs text-muted-foreground">{email} · {phone}</p>
              </div>
            </div>
          </ProfileSection>

          {/* Cabinet */}
          <ProfileSection icon={MapPin} title="Cabinet" summary={address || "Adresse non renseignée"} onEdit={() => setEditing("cabinet")}>
            <div className="text-sm text-foreground">{address || "—"}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {accessInfo.parking && <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">🅿️ Parking</span>}
              {accessInfo.handicap && <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">♿ Accès handicapé</span>}
              {accessInfo.elevator && <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">🛗 Ascenseur</span>}
            </div>
          </ProfileSection>

          {/* Specialties */}
          <ProfileSection icon={Briefcase} title="Spécialités" onEdit={() => setEditing("specialties")}>
            <p className="text-sm font-medium text-foreground mb-2">{specialty}</p>
            <div className="flex flex-wrap gap-1.5">
              {subSpecialties.map(s => (
                <span key={s} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {subSpecialties.length === 0 && <span className="text-xs text-muted-foreground">Aucune sous-spécialité</span>}
            </div>
          </ProfileSection>

          {/* Tarifs */}
          <ProfileSection icon={CreditCard} title="Tarifs par motif" onEdit={() => setEditing("tarifs")}>
            {motifs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {motifs.map((m, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium text-foreground">{m.name}</td>
                        <td className="py-2 text-muted-foreground">{m.duration}</td>
                        <td className="py-2 font-bold text-primary">{m.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-xs text-muted-foreground">Aucun tarif configuré</p>}
          </ProfileSection>

          {/* Actes */}
          <ProfileSection icon={Briefcase} title="Expertises & Actes" onEdit={() => setEditing("actes")}>
            <div className="flex flex-wrap gap-1.5">
              {actes.map(a => (
                <span key={a} className="text-[11px] bg-primary/5 text-foreground border border-primary/20 px-2 py-0.5 rounded-lg">{a}</span>
              ))}
              {actes.length === 0 && <span className="text-xs text-muted-foreground">Aucun acte</span>}
            </div>
          </ProfileSection>

          {/* Languages */}
          <ProfileSection icon={Globe} title="Langues" onEdit={() => setEditing("languages")}>
            <div className="flex flex-wrap gap-1.5">
              {languages.map(l => (
                <span key={l} className="text-[11px] bg-muted px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          </ProfileSection>

          {/* Diplomas */}
          <ProfileSection icon={GraduationCap} title="Formations & Diplômes" onEdit={() => setEditing("diplomas")}>
            <div className="space-y-2">
              {diplomas.map((d, i) => (
                <div key={i} className="rounded-lg border p-3 bg-muted/20">
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.school} · {d.year}</p>
                </div>
              ))}
              {diplomas.length === 0 && <p className="text-xs text-muted-foreground">Aucun diplôme</p>}
            </div>
          </ProfileSection>

          {/* Affiliations */}
          <ProfileSection icon={Award} title="Affiliations" onEdit={() => setEditing("affiliations")}>
            <div className="space-y-1.5">
              {memberships.map((m, i) => (
                <p key={i} className="text-sm text-foreground">{m}</p>
              ))}
              {memberships.length === 0 && <p className="text-xs text-muted-foreground">Aucune affiliation</p>}
            </div>
          </ProfileSection>

          {/* Description */}
          <ProfileSection icon={User} title="Description" onEdit={() => setEditing("description")}>
            <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">
              {presentation || "Aucune description."}
            </p>
          </ProfileSection>
        </div>

        {/* Preview */}
        <div className="hidden lg:block">
          <ProfilePreview data={previewData} />
        </div>
      </div>

      {/* ═══ EDITORS ═══ */}

      {/* Identity */}
      <ProfileSectionEditor open={editing === "identity"} onClose={() => setEditing(null)} title="Identité" description="Informations personnelles" onSave={() => handleSave("identity")}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">{p.initials}</div>
          <div>
            <Button variant="outline" size="sm" className="text-xs"><Camera className="h-3.5 w-3.5 mr-1" />Changer la photo</Button>
            <p className="text-[11px] text-muted-foreground mt-1">JPG ou PNG, max 2 Mo</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Prénom</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Nom</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Téléphone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
        </div>
      </ProfileSectionEditor>

      {/* Cabinet */}
      <ProfileSectionEditor open={editing === "cabinet"} onClose={() => setEditing(null)} title="Cabinet" description="Adresse et informations d'accès" onSave={() => handleSave("cabinet")}>
        <div><Label className="text-xs">Adresse</Label><Input value={address} onChange={e => setAddress(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Transport en commun</Label><Input value={accessInfo.publicTransport} onChange={e => setAccessInfo(a => ({ ...a, publicTransport: e.target.value }))} className="mt-1" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={accessInfo.parking} onChange={() => setAccessInfo(a => ({ ...a, parking: !a.parking }))} className="rounded border-input h-4 w-4" /><span className="text-sm">🅿️ Parking</span></label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={accessInfo.handicap} onChange={() => setAccessInfo(a => ({ ...a, handicap: !a.handicap }))} className="rounded border-input h-4 w-4" /><span className="text-sm">♿ Accès handicapé</span></label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={accessInfo.elevator} onChange={() => setAccessInfo(a => ({ ...a, elevator: !a.elevator }))} className="rounded border-input h-4 w-4" /><span className="text-sm">🛗 Ascenseur</span></label>
        </div>
      </ProfileSectionEditor>

      {/* Specialties */}
      <ProfileSectionEditor open={editing === "specialties"} onClose={() => setEditing(null)} title="Spécialités" description="Spécialité principale et sous-spécialités" onSave={() => handleSave("specialties")}>
        <div><Label className="text-xs">Spécialité principale</Label><Input value={specialty} readOnly className="mt-1 bg-muted/50" /></div>
        <div>
          <Label className="text-xs">Sous-spécialités</Label>
          <div className="flex flex-wrap gap-2 my-2">
            {subSpecialties.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {s}<button onClick={() => setSubSpecialties(prev => prev.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSubSpec} onChange={e => setNewSubSpec(e.target.value)} placeholder="Ajouter…" className="flex-1" onKeyDown={e => e.key === "Enter" && addChip(newSubSpec, subSpecialties, setSubSpecialties, setNewSubSpec)} />
            <Button variant="outline" size="sm" onClick={() => addChip(newSubSpec, subSpecialties, setSubSpecialties, setNewSubSpec)}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </ProfileSectionEditor>

      {/* Tarifs */}
      <ProfileSectionEditor open={editing === "tarifs"} onClose={() => setEditing(null)} title="Tarifs par motif" description="Configurez vos tarifs de consultation" onSave={() => handleSave("tarifs")}>
        <div className="space-y-2">
          {motifs.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex-1 grid gap-2 sm:grid-cols-3">
                <Input value={m.name} onChange={e => setMotifs(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Motif" className="text-xs h-8" />
                <Input value={m.duration} onChange={e => setMotifs(prev => prev.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} placeholder="Durée" className="text-xs h-8" />
                <Input value={m.price} onChange={e => setMotifs(prev => prev.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} placeholder="Prix" className="text-xs h-8" />
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setMotifs(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => setMotifs(prev => [...prev, { name: "", duration: "", price: "" }])}>
            <Plus className="h-3.5 w-3.5 mr-1" />Ajouter un motif
          </Button>
        </div>
      </ProfileSectionEditor>

      {/* Actes */}
      <ProfileSectionEditor open={editing === "actes"} onClose={() => setEditing(null)} title="Expertises & Actes" onSave={() => handleSave("actes")}>
        <div className="flex flex-wrap gap-2 mb-3">
          {actes.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-lg">
              {a}<button onClick={() => setActes(prev => prev.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newActe} onChange={e => setNewActe(e.target.value)} placeholder="Ajouter un acte…" className="flex-1" onKeyDown={e => e.key === "Enter" && addChip(newActe, actes, setActes, setNewActe)} />
          <Button variant="outline" size="sm" onClick={() => addChip(newActe, actes, setActes, setNewActe)}><Plus className="h-4 w-4" /></Button>
        </div>
      </ProfileSectionEditor>

      {/* Languages */}
      <ProfileSectionEditor open={editing === "languages"} onClose={() => setEditing(null)} title="Langues parlées" onSave={() => handleSave("languages")}>
        <div className="flex flex-wrap gap-2 mb-3">
          {languages.map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-3 py-1.5 rounded-full">
              {l}<button onClick={() => setLanguages(prev => prev.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="Ajouter une langue…" className="flex-1" onKeyDown={e => e.key === "Enter" && addChip(newLang, languages, setLanguages, setNewLang)} />
          <Button variant="outline" size="sm" onClick={() => addChip(newLang, languages, setLanguages, setNewLang)}><Plus className="h-4 w-4" /></Button>
        </div>
      </ProfileSectionEditor>

      {/* Diplomas */}
      <ProfileSectionEditor open={editing === "diplomas"} onClose={() => setEditing(null)} title="Formations & Diplômes" onSave={() => handleSave("diplomas")}>
        <div className="space-y-2">
          {diplomas.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div>
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.school} · {d.year}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDiplomas(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label className="text-xs">Titre *</Label><Input value={diplomaForm.title} onChange={e => setDiplomaForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Établissement</Label><Input value={diplomaForm.school} onChange={e => setDiplomaForm(f => ({ ...f, school: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Année</Label><Input value={diplomaForm.year} onChange={e => setDiplomaForm(f => ({ ...f, year: e.target.value }))} className="mt-1" /></div>
            </div>
            <Button size="sm" className="text-xs mt-3" disabled={!diplomaForm.title.trim()} onClick={() => {
              setDiplomas(prev => [...prev, diplomaForm]);
              setDiplomaForm({ title: "", school: "", year: "" });
            }}><Plus className="h-3.5 w-3.5 mr-1" />Ajouter</Button>
          </div>
        </div>
      </ProfileSectionEditor>

      {/* Affiliations */}
      <ProfileSectionEditor open={editing === "affiliations"} onClose={() => setEditing(null)} title="Affiliations" onSave={() => handleSave("affiliations")}>
        <div className="space-y-2 mb-3">
          {memberships.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <p className="text-sm text-foreground">{m}</p>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setMemberships(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newMembership} onChange={e => setNewMembership(e.target.value)} placeholder="Ajouter…" className="flex-1" onKeyDown={e => { if (e.key === "Enter") addChip(newMembership, memberships, setMemberships, setNewMembership); }} />
          <Button variant="outline" size="sm" onClick={() => addChip(newMembership, memberships, setMemberships, setNewMembership)}><Plus className="h-4 w-4" /></Button>
        </div>
      </ProfileSectionEditor>

      {/* Description */}
      <ProfileSectionEditor open={editing === "description"} onClose={() => setEditing(null)} title="Description" description="Présentez-vous aux patients" onSave={() => handleSave("description")}>
        <textarea
          value={presentation}
          onChange={e => setPresentation(e.target.value)}
          rows={8}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Décrivez votre parcours, votre approche, vos domaines d'expertise…"
        />
        <p className="text-[11px] text-muted-foreground">{presentation.length} caractères</p>
      </ProfileSectionEditor>
    </div>
  );
};

export default ProfileTab;
