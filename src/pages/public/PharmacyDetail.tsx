import { useParams, Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import SeoHelmet from "@/components/seo/SeoHelmet";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, Pill, Moon } from "lucide-react";
import { mockPublicPharmacies } from "@/data/mocks/establishments";

const PharmacyDetail = () => {
  const { slug } = useParams();
  const pharmacy = mockPublicPharmacies.find(p => p.slug === slug);

  if (!pharmacy) return <div className="min-h-screen bg-background"><PublicHeader /><div className="container mx-auto px-4 py-20 text-center"><h1 className="text-xl font-bold">Pharmacie non trouvée</h1><Link to="/pharmacies" className="text-primary mt-4 inline-block">← Retour à l'annuaire</Link></div></div>;

  const jsonLd = { "@context": "https://schema.org", "@type": "Pharmacy", name: pharmacy.name, address: { "@type": "PostalAddress", streetAddress: pharmacy.address, addressLocality: pharmacy.city, addressCountry: "TN" }, telephone: pharmacy.phone };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title={`${pharmacy.name} — Pharmacie à ${pharmacy.city} | Medicare`} description={`${pharmacy.name} à ${pharmacy.city}. Horaires: ${pharmacy.horaires}. ${pharmacy.deGarde ? "Pharmacie de garde." : ""}`} />
      <JsonLd data={jsonLd} />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs items={[{ label: "Pharmacies", href: "/pharmacies" }, { label: pharmacy.name }]} />
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{pharmacy.name}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5" />{pharmacy.address}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5"><Phone className="h-3.5 w-3.5" />{pharmacy.phone}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5"><Clock className="h-3.5 w-3.5" />{pharmacy.horaires}</p>
              {pharmacy.deGarde && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full"><Moon className="h-3 w-3" />Pharmacie de garde</span>
              )}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-muted h-32 flex items-center justify-center border">
            <div className="text-center"><MapPin className="h-5 w-5 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">{pharmacy.address}</p></div>
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

export default PharmacyDetail;
