import { useParams, Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Pill, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { mockMedicines } from "@/data/mocks/medicines";
import { useState } from "react";

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 px-1 text-left">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 px-1 text-sm text-foreground leading-relaxed">{children}</div>}
    </div>
  );
};

const MedicineDetail = () => {
  const { slug } = useParams();
  const med = mockMedicines.find(m => m.slug === slug);

  if (!med) return <div className="min-h-screen bg-background"><PublicHeader /><div className="container mx-auto px-4 py-20 text-center"><h1 className="text-xl font-bold">Médicament non trouvé</h1><Link to="/medicaments" className="text-primary mt-4 inline-block">← Retour à l'annuaire</Link></div></div>;

  const jsonLd = { "@context": "https://schema.org", "@type": "Drug", name: med.name, dosageForm: med.form, activeIngredient: med.name, description: med.summary };
  const similars = mockMedicines.filter(m => med.similarSlugs.includes(m.slug));

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title={`${med.name} ${med.dosage} — Notice complète | Medicare Tunisie`} description={med.summary} />
      <JsonLd data={jsonLd} />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs items={[{ label: "Médicaments", href: "/medicaments" }, { label: `${med.name} ${med.dosage}` }]} />

        {/* Header card */}
        <div className="rounded-2xl border bg-card p-6 shadow-card mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{med.name} {med.dosage}</h1>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{med.form}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{med.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice sections */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          <Section title="📋 Résumé" defaultOpen>
            <p>{med.summary}</p>
          </Section>
          <Section title="🎯 Indications" defaultOpen>
            <ul className="list-disc list-inside space-y-1">
              {med.indications.map((ind, i) => <li key={i}>{ind}</li>)}
            </ul>
          </Section>
          <Section title="💊 Posologie">
            <p>{med.dosageText}</p>
          </Section>
          <Section title="🚫 Contre-indications">
            <ul className="list-disc list-inside space-y-1">
              {med.contraindications.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Section>
          <Section title="⚠️ Effets indésirables">
            <ul className="list-disc list-inside space-y-1">
              {med.sideEffects.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Section>
          <Section title="🔄 Interactions médicamenteuses">
            <ul className="list-disc list-inside space-y-1">
              {med.interactions.map((int, i) => <li key={i}>{int}</li>)}
            </ul>
          </Section>
          <Section title="🤰 Grossesse et allaitement">
            <p>{med.pregnancyInfo}</p>
          </Section>
          <Section title="⚡ Mises en garde">
            <ul className="list-disc list-inside space-y-1">
              {med.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </Section>
          <Section title="🧊 Conservation">
            <p>{med.storage}</p>
          </Section>
        </div>

        {/* FAQ */}
        {med.faq.length > 0 && (
          <div className="rounded-xl border bg-card shadow-card mt-6 p-5">
            <h2 className="font-semibold text-foreground mb-3">Questions fréquentes</h2>
            <div className="space-y-3">
              {med.faq.map((f, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-foreground">{f.q}</p>
                  <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal warning */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mt-6 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Avertissement</p>
            <p className="text-xs text-muted-foreground mt-1">Ces informations sont fournies à titre indicatif et ne remplacent en aucun cas l'avis d'un professionnel de santé. Consultez toujours votre médecin ou pharmacien avant de prendre un médicament.</p>
          </div>
        </div>

        {/* Similar medicines */}
        {similars.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-foreground mb-3">Médicaments similaires</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {similars.map(s => (
                <Link key={s.id} to={`/medicament/${s.slug}`} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
                  <h3 className="font-medium text-foreground hover:text-primary">{s.name} {s.dosage}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.form}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;
