/**
 * PrescriptionsContext — State de la page Ordonnances.
 *
 * // TODO BACKEND: Remplacer mockDoctorPrescriptions par GET /api/prescriptions
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockDoctorPrescriptions } from "@/data/mockData";
import type { Prescription } from "@/types";
import type { PrescriptionFilter } from "./types";
import { toast } from "@/hooks/use-toast";

interface PrescriptionsValue {
  prescriptions: Prescription[];
  filter: PrescriptionFilter;
  setFilter: (f: PrescriptionFilter) => void;
  q: string;
  setQ: (v: string) => void;
  filtered: Prescription[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selected: Prescription | null;
  detailOpen: boolean;
  setDetailOpen: (v: boolean) => void;
  // Actions
  handleResend: (id: string) => void;
  handlePrint: (id: string) => void;
  handleDuplicate: (id: string) => void;
  // Stats
  totalActive: number;
  totalSent: number;
  totalPending: number;
}

const Ctx = createContext<PrescriptionsValue | null>(null);

export function usePrescriptions() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrescriptions must be used within PrescriptionsProvider");
  return v;
}

export function PrescriptionsProvider({ children }: { children: ReactNode }) {
  const [prescriptions] = useState<Prescription[]>(mockDoctorPrescriptions);
  const [filter, setFilter] = useState<PrescriptionFilter>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = prescriptions;
    if (filter === "active") list = list.filter((p) => p.status === "active");
    if (filter === "expired") list = list.filter((p) => p.status === "expired");
    if (filter === "sent") list = list.filter((p) => p.sent);
    const qq = q.trim().toLowerCase();
    if (qq) list = list.filter((p) => `${p.patient} ${p.id} ${p.items.join(" ")}`.toLowerCase().includes(qq));
    return list;
  }, [prescriptions, filter, q]);

  const selected = useMemo(() => (selectedId ? prescriptions.find((p) => p.id === selectedId) ?? null : null), [prescriptions, selectedId]);

  const totalActive = prescriptions.filter((p) => p.status === "active").length;
  const totalSent = prescriptions.filter((p) => p.sent).length;
  const totalPending = prescriptions.filter((p) => !p.sent).length;

  // TODO BACKEND: POST /api/prescriptions/{id}/resend
  const handleResend = (id: string) => toast({ title: "Renvoi", description: `Ordonnance ${id} renvoyée (mock).` });
  // TODO BACKEND: GET /api/prescriptions/{id}/pdf
  const handlePrint = (id: string) => toast({ title: "Impression", description: `Ordonnance ${id} — à brancher.` });
  // TODO BACKEND: POST /api/prescriptions/{id}/duplicate
  const handleDuplicate = (id: string) => toast({ title: "Dupliquer", description: `Ordonnance ${id} dupliquée (mock).` });

  const value: PrescriptionsValue = {
    prescriptions, filter, setFilter, q, setQ, filtered,
    selectedId, setSelectedId, selected, detailOpen, setDetailOpen,
    handleResend, handlePrint, handleDuplicate,
    totalActive, totalSent, totalPending,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
