/**
 * ProfileSectionEditor — Sheet lateral pour éditer une section du profil.
 */
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSave: () => void;
  children: ReactNode;
}

export default function ProfileSectionEditor({ open, onClose, title, description, onSave, children }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4 space-y-4 pb-20">
          {children}
        </div>
        <SheetFooter className="absolute bottom-0 left-0 right-0 border-t bg-card p-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="h-3.5 w-3.5 mr-1" />Annuler
          </Button>
          <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={onSave}>
            <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
