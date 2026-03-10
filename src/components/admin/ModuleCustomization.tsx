/**
 * ModuleCustomization — Admin UI to rename, reorder and customize module labels.
 * Persists in localStorage so label changes are reflected across the platform.
 */
import { useState, useEffect } from "react";
import { GripVertical, Pencil, Check, X, RotateCcw, Save, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { platformModules } from "@/stores/adminModulesStore";

const LABELS_KEY = "medicare_module_labels";
const ORDER_KEY = "medicare_module_order";

export interface ModuleLabel {
  moduleId: string;
  customLabel: string;
}

export function getModuleLabels(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LABELS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getModuleOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getCustomLabel(moduleId: string, fallback: string): string {
  const labels = getModuleLabels();
  return labels[moduleId] || fallback;
}

const ModuleCustomization = () => {
  const [labels, setLabels] = useState<Record<string, string>>(getModuleLabels);
  const [order, setOrder] = useState<string[]>(() => {
    const saved = getModuleOrder();
    return saved.length > 0 ? saved : platformModules.map(m => m.id);
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dragItem, setDragItem] = useState<string | null>(null);

  const orderedModules = order
    .map(id => platformModules.find(m => m.id === id))
    .filter(Boolean) as typeof platformModules;

  // Add any missing modules
  const allModules = [
    ...orderedModules,
    ...platformModules.filter(m => !order.includes(m.id)),
  ];

  const startEdit = (id: string) => {
    setEditing(id);
    const mod = platformModules.find(m => m.id === id);
    setEditValue(labels[id] || mod?.label || "");
  };

  const saveEdit = () => {
    if (!editing) return;
    const newLabels = { ...labels, [editing]: editValue };
    setLabels(newLabels);
    localStorage.setItem(LABELS_KEY, JSON.stringify(newLabels));
    toast({ title: "Label mis à jour", description: `"${editValue}" sera affiché partout.` });
    setEditing(null);
  };

  const resetLabel = (id: string) => {
    const newLabels = { ...labels };
    delete newLabels[id];
    setLabels(newLabels);
    localStorage.setItem(LABELS_KEY, JSON.stringify(newLabels));
    toast({ title: "Label réinitialisé" });
  };

  const handleDragStart = (id: string) => setDragItem(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragItem || dragItem === targetId) return;
    const newOrder = [...order];
    const fromIdx = newOrder.indexOf(dragItem);
    const toIdx = newOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragItem);
    setOrder(newOrder);
  };
  const handleDragEnd = () => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    setDragItem(null);
    toast({ title: "Ordre sauvegardé" });
  };

  const resetAll = () => {
    localStorage.removeItem(LABELS_KEY);
    localStorage.removeItem(ORDER_KEY);
    setLabels({});
    setOrder(platformModules.map(m => m.id));
    toast({ title: "Personnalisation réinitialisée" });
  };

  const customCount = Object.keys(labels).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />Personnalisation des modules
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{customCount} label(s) personnalisé(s) · Glissez pour réordonner</p>
        </div>
        <Button size="sm" variant="outline" className="text-xs" onClick={resetAll}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />Réinitialiser tout
        </Button>
      </div>

      {/* Module list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {allModules.map((mod, i) => {
          const isEditing = editing === mod.id;
          const hasCustom = !!labels[mod.id];
          const displayLabel = labels[mod.id] || mod.label;

          return (
            <div key={mod.id}
              draggable onDragStart={() => handleDragStart(mod.id)}
              onDragOver={e => handleDragOver(e, mod.id)} onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-colors ${
                dragItem === mod.id ? "bg-primary/5 opacity-60" : "hover:bg-muted/30"
              }`}>
              <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
              <span className="text-[10px] text-muted-foreground font-mono w-5 shrink-0">{i + 1}</span>
              
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-7 text-xs flex-1" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }} />
                    <button onClick={saveEdit} className="text-accent"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${hasCustom ? "text-primary" : "text-foreground"}`}>{displayLabel}</span>
                    {hasCustom && (
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Personnalisé</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">({mod.category})</span>
                  </div>
                )}
                {!isEditing && hasCustom && (
                  <p className="text-[10px] text-muted-foreground">Original : {mod.label}</p>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(mod.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {hasCustom && (
                    <button onClick={() => resetLabel(mod.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        💡 Les labels personnalisés seront affichés dans les sidebars, les pages et les menus de tous les rôles concernés.
      </p>
    </div>
  );
};

export default ModuleCustomization;
