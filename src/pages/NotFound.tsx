import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-6">
          <Stethoscope className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Page introuvable</h2>
        <p className="text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />Retour à l'accueil
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="w-full sm:w-auto">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
