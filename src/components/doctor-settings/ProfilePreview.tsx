/**
 * ProfilePreview — Aperçu du profil tel que vu par les patients.
 * Mini version du profil public.
 */
import { Calendar, Clock, Globe, MapPin, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileData {
  initials: string;
  name: string;
  specialty: string;
  subSpecialties: string[];
  address: string;
  phone: string;
  languages: string[];
  reviewCount: number;
  consultationDuration: string;
  priceConsultation: string;
  presentation: string;
  photoUrl?: string;
}

interface Props {
  data: ProfileData;
}

export default function ProfilePreview({ data }: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden sticky top-4">
      {/* Header */}
      <div className="gradient-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-xl font-bold shrink-0">
            {data.initials}
          </div>
          <div>
            <h2 className="text-lg font-bold">{data.name}</h2>
            <p className="text-primary-foreground/80 text-sm">{data.specialty}</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-medium">{data.reviewCount} avis vérifiés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Sub-specialties */}
        {data.subSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.subSpecialties.map(s => (
              <span key={s} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{data.address || "Adresse non renseignée"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{data.phone || "Téléphone non renseigné"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Consultation : {data.consultationDuration} · {data.priceConsultation}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span>{data.languages.join(", ") || "—"}</span>
          </div>
        </div>

        {/* Presentation */}
        {data.presentation && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Présentation</p>
            <p className="text-sm text-foreground line-clamp-4">{data.presentation}</p>
          </div>
        )}

        {/* CTA */}
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open("/doctor/1", "_blank")}>
          <Calendar className="h-3.5 w-3.5 mr-1" />Voir le profil public complet
        </Button>
      </div>
    </div>
  );
}
