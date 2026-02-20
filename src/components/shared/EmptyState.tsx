import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionLink, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    {actionLabel && (actionLink ? (
      <Link to={actionLink}><Button className="mt-4 gradient-primary text-primary-foreground" size="sm">{actionLabel}</Button></Link>
    ) : onAction ? (
      <Button className="mt-4 gradient-primary text-primary-foreground" size="sm" onClick={onAction}>{actionLabel}</Button>
    ) : null)}
  </div>
);

export default EmptyState;
