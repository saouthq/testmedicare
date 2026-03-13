import { useParams, Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Navigation, Hospital, AlertTriangle } from "lucide-react";
import { useHospitalsDirectory } from "@/stores/directoryStore";

const HospitalDetail = () => {
  const { slug } = useParams();
  const hospitals = useHospitalsDirectory();
  const hospital = hospitals.find(h => h.slug === slug);

  if (!hospital) return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center"><Hospital className="h-8 w-8 text-muted-foreground/40" /></div>
        <h1 className="text-xl font-bold text-foreground mb-2">Hôpital non trouvé</h1>
        <p className="text-sm text-muted-foreground mb-4">L'établissement recherché n'existe pas ou a été supprimé.</p>
        <Link to="/hospitals" className="text-primary hover:underline">← Retour à l'annuaire des hôpitaux</Link>
      </div>
    </div>
  );

  const jsonLd = { "@context": "https://schema.org", "@type": "Hospital", name: hospital.name, address: { "@type": "PostalAddress", streetAddress: hospital.address, addressLocality: hospital.city, addressCountry: "TN" }, telephone: hospital.phone };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title={`${hospital.name} — Hôpital à ${hospital.city} | Medicare`} description={hospital.description} />
      <JsonLd data={jsonLd} />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs items={[{ label: "Hôpitaux", href: "/hospitals" }, { label: hospital.name }]} />
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Hospital className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{hospital.name}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5" />{hospital.address}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5"><Phone className="h-3.5 w-3.5" />{hospital.phone}</p>
              {hospital.urgences && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />Service d'urgences</span>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground leading-relaxed">{hospital.description}</p>
          <div className="mt-5">
            <h2 className="font-semibold text-foreground mb-2">Services</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.services.map(s => <span key={s} className="text-xs bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-lg">{s}</span>)}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-muted h-32 flex items-center justify-center border">
            <div className="text-center"><MapPin className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">{hospital.address}</p></div>
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

export default HospitalDetail;
