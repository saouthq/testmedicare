import { Link } from "react-router-dom";
import { MapPin, Phone, ChevronRight } from "lucide-react";

interface DirectoryCardProps {
  name: string;
  city: string;
  address: string;
  phone: string;
  tags?: string[];
  href: string;
  badge?: string;
  badgeColor?: string;
}

const DirectoryCard = ({ name, city, address, phone, tags, href, badge, badgeColor }: DirectoryCardProps) => (
  <Link to={href} className="group block rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="h-3 w-3 shrink-0" />{address}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Phone className="h-3 w-3 shrink-0" />{phone}</p>
      </div>
      {badge && (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${badgeColor || "bg-primary/10 text-primary"}`}>{badge}</span>
      )}
    </div>
    {tags && tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-3">
        {tags.slice(0, 4).map(t => (
          <span key={t} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
        ))}
        {tags.length > 4 && <span className="text-[10px] text-muted-foreground">+{tags.length - 4}</span>}
      </div>
    )}
    <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
      Voir la fiche <ChevronRight className="ml-0.5 h-3 w-3" />
    </div>
  </Link>
);

export default DirectoryCard;
