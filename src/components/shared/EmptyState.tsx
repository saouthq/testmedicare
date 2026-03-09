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
  compact?: boolean;
}

/**
 * EmptyState — Placeholder when lists are empty.
 * Supports compact mode for inline use within cards.
 */
const EmptyState = ({ icon: Icon, title, description, actionLabel, actionLink, onAction, compact }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8 px-3" : "py-16 px-4"}`}>
    <div className={`rounded-2xl bg-muted/50 flex items-center justify-center mb-4 ${compact ? "h-12 w-12" : "h-16 w-16"}`}>
      <Icon className={`text-muted-foreground/40 ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
    </div>
    <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : "text-lg"}`}>{title}</h3>
    <p className={`text-muted-foreground mt-1 max-w-sm ${compact ? "text-xs" : "text-sm"}`}>{description}</p>
    {actionLabel && (actionLink ? (
      <Link to={actionLink}><Button className="mt-4 gradient-primary text-primary-foreground active-scale" size="sm">{actionLabel}</Button></Link>
    ) : onAction ? (
      <Button className="mt-4 gradient-primary text-primary-foreground active-scale" size="sm" onClick={onAction}>{actionLabel}</Button>
    ) : null)}
  </div>
);

export default EmptyState;
