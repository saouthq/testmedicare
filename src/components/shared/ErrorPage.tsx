/**
 * ErrorPage — Generic error state for dashboard pages.
 * Use when API calls fail after backend integration.
 */
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorPage = ({ 
  title = "Erreur de chargement", 
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
}: ErrorPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorPage;
