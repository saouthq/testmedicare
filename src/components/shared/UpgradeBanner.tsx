import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UpgradeBannerProps {
  feature: string;
  description: string;
  role?: "doctor" | "secretary";
}

const UpgradeBanner = ({ feature, description, role = "doctor" }: UpgradeBannerProps) => (
  <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex items-center gap-4">
    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
      <Crown className="h-5 w-5 text-primary-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">{feature}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Link to={`/dashboard/${role}/subscription`}>
      <Button size="sm" variant="outline" className="shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
        Upgrade <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </Link>
  </div>
);

export default UpgradeBanner;
