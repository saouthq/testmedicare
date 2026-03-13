import { useParams, Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, CheckCircle, Navigation, Building2 } from "lucide-react";
import { useClinicsDirectory } from "@/stores/directoryStore";

const ClinicDetail = () => {
  const { slug } = useParams();
  const clinics = useClinicsDirectory();
  const clinic = clinics.find(c => c.slug === slug);

  if (!clinic) return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center"><Building2 className="h-8 w-8 text-muted-foreground/40" /></div>
        <h1 className="text-xl font-bold text-foreground mb-2">Clinique non trouvée</h1>
        <p className="text-sm text-muted-foreground mb-4">L'établissement recherché n'existe pas ou a été supprimé.</p>
        <Link to="/clinics" className="text-primary hover:underline">← Retour à l'annuaire des cliniques</Link>
      </div>
    </div>
  );

  const jsonLd = { "@context": "https://schema.org", "@type": "MedicalClinic", name: clinic.name, address: { "@type": "PostalAddress", streetAddress: clinic.address, addressLocality: clinic.city, addressCountry: "TN" }, telephone: clinic.phone, medicalSpecialty: clinic.services };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title={`${clinic.name} — Clinique à ${clinic.city} | Medicare`} description={clinic.description} />
      <JsonLd data={jsonLd} />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs items={[{ label: "Cliniques", href: "/clinics" }, { label: clinic.name }]} />
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{clinic.name}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5" />{clinic.address}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5"><Phone className="h-3.5 w-3.5" />{clinic.phone}</p>
              <div className="flex items-center gap-1 mt-1"><CheckCircle className="h-3.5 w-3.5 text-accent" /><span className="text-sm font-medium">{clinic.services.length} services</span></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground leading-relaxed">{clinic.description}</p>
          <div className="mt-5">
            <h2 className="font-semibold text-foreground mb-2">Services</h2>
            <div className="flex flex-wrap gap-2">
              {clinic.services.map(s => <span key={s} className="text-xs bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-lg">{s}</span>)}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-muted h-32 flex items-center justify-center border">
            <div className="text-center"><MapPin className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">{clinic.address}</p></div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button className="gradient-primary text-primary-foreground flex-1"><Phone className="h-4 w-4 mr-1" />Appeler</Button>
            <Button variant="outline" className="flex-1"><Navigation className="h-4 w-4 mr-1" />Itinéraire</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetail;
