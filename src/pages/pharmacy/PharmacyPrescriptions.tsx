/**
 * Pharmacy Prescriptions — Now reads from cross-role store + local mocks.
 * Pharmacy responses write back to store → patient sees updates.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  FileText, Search, CheckCircle2, Clock, Pill, Eye, Shield, AlertCircle,
  User, X, Package, AlertTriangle, Inbox, Activity, Send, Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockPickupTimePresets } from "@/data/mocks/pharmacy";
import { usePharmacyPrescriptions, updatePharmacyRxStatus, updatePharmacyRxItemAvailability } from "@/stores/pharmacyStore";
import type {
  PharmacyPrescription, PharmacyPrescriptionStatus, PharmacyItemAvailability,
} from "@/types";
import { toast } from "sonner";
import { useSharedPrescriptions, pharmacyRespond } from "@/stores/prescriptionsStore";
import { useNotifications } from "@/stores/notificationsStore";

const statusCfg: Record<string, { label: string; cls: string; icon: any }> = {
  received:     { label: "Reçue",            cls: "bg-warning/10 text-warning",              icon: Inbox },
  preparing:    { label: "En préparation",   cls: "bg-primary/10 text-primary",              icon: Activity },
  ready_pickup: { label: "Prête à retirer",  cls: "bg-accent/10 text-accent",                icon: CheckCircle2 },
  delivered:    { label: "Délivrée",         cls: "bg-muted text-muted-foreground",           icon: CheckCircle2 },
  partial:      { label: "Partielle",        cls: "bg-warning/10 text-warning",              icon: Package },
  unavailable:  { label: "Indisponible",     cls: "bg-destructive/10 text-destructive",      icon: AlertTriangle },
};

const PharmacyPrescriptions = () => {
  // Use centralized pharmacy store
  const [storeRx] = usePharmacyPrescriptions();
  // Merge local mock prescriptions with any sent via cross-role store
  const [sharedPrescriptions] = useSharedPrescriptions();
  const { notifications: pharmNotifs } = useNotifications("pharmacy");

  const prescriptions = storeRx;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PharmacyPrescription | null>(null);

  // Drawer state
  const [pickupTime, setPickupTime] = useState("");
  const [comment, setComment] = useState("");
  const [itemAvail, setItemAvail] = useState<Record<number, { availability: PharmacyItemAvailability; alternative: string }>>({});

  // Inject shared prescriptions from patients into pharmacy store
  useEffect(() => {
    if (sharedPrescriptions.length === 0) return;
    const currentRx = storeRx;
    let needsUpdate = false;
    const newItems: PharmacyPrescription[] = [];
    for (const sp of sharedPrescriptions) {
      if (!currentRx.find((p) => p.id === sp.id)) {
        needsUpdate = true;
        newItems.push({
          id: sp.id,
          patient: sp.patientName,
          avatar: sp.patientName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
          doctor: sp.doctorName,
          date: sp.date,
          assurance: sp.assurance,
          patientPhone: "",
          urgent: false,
          total: sp.total,
          status: "received" as PharmacyPrescriptionStatus,
          items: sp.items.map((name) => ({
            name,
            dosage: "",
            quantity: 1,
            availability: "available" as PharmacyItemAvailability,
            price: "—",
          })),
        });
      }
    }
    if (needsUpdate && newItems.length > 0) {
      const { pharmacyRxStore } = await import("@/stores/pharmacyStore");
      pharmacyRxStore.set((prev: PharmacyPrescription[]) => [...newItems, ...prev]);
    }
  }, [sharedPrescriptions, storeRx]);

  const filtered = prescriptions.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.patient.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ── Open drawer ── */
  const openDrawer = (p: PharmacyPrescription) => {
    setSelected(p);
    setPickupTime(p.pickupTime || "");
    setComment(p.comment || "");
    const avail: Record<number, { availability: PharmacyItemAvailability; alternative: string }> = {};
    p.items.forEach((item, i) => {
      avail[i] = { availability: item.availability, alternative: item.alternative || "" };
    });
    setItemAvail(avail);
  };

  /* ── Save item changes to pharmacy store ── */
  const saveItems = (id: string) => {
    const { pharmacyRxStore } = await import("@/stores/pharmacyStore");
    pharmacyRxStore.set((prev: PharmacyPrescription[]) => prev.map((p: PharmacyPrescription) => {
      if (p.id !== id) return p;
      return {
        ...p,
        comment,
        pickupTime: pickupTime || p.pickupTime,
        items: p.items.map((item, i) => ({
          ...item,
          availability: itemAvail[i]?.availability ?? item.availability,
          alternative: itemAvail[i]?.alternative ?? item.alternative,
        })),
      };
    }));
  };

  /* ── Status change — also writes to cross-role store ── */
  const handleStatus = (id: string, status: PharmacyPrescriptionStatus) => {
    if (status === "ready_pickup" && !pickupTime) {
      toast.error("Veuillez indiquer une heure de retrait");
      return;
    }
    saveItems(id);
    updatePharmacyRxStatus(id, status, { pickupTime: pickupTime || undefined, comment: comment || undefined });
    toast.success(`Ordonnance ${id} → ${statusCfg[status].label}`);

    // Write response to cross-role store so patient sees it
    const shared = sharedPrescriptions.find((sp) => sp.id === id);
    if (shared) {
      // Find all pharmacy entries for this prescription and update them
      for (const ph of shared.sentToPharmacies) {
        if (ph.status === "pending") {
          const mappedStatus = status === "ready_pickup" ? "ready" : status === "preparing" ? "preparing" : status === "unavailable" ? "unavailable" : "preparing";
          pharmacyRespond(id, ph.pharmacyId, {
            status: mappedStatus as "preparing" | "ready" | "unavailable",
            pickupTime: status === "ready_pickup" ? pickupTime : undefined,
          });
          break; // respond for first pending pharmacy entry
        }
      }
    }

    if (status === "ready_pickup") {
      toast.info("✅ Notification envoyée au patient via le store");
    }
    setSelected(null);
  };

  const isReadOnly = selected?.status === "delivered";

  // Unread pharmacy notifications count
  const unreadPharmNotifs = pharmNotifs.filter((n) => !n.read).length;

  return (
    <DashboardLayout role="pharmacy" title="Ordonnances">
      <div className="space-y-5">
        {/* Unread notifications banner */}
        {unreadPharmNotifs > 0 && (
          <div className="rounded-xl bg-warning/5 border border-warning/20 p-3 flex items-center gap-3">
            <Inbox className="h-5 w-5 text-warning" />
            <p className="text-sm text-foreground font-medium">
              {unreadPharmNotifs} nouvelle(s) ordonnance(s) reçue(s) de patients
            </p>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "received", label: `Reçues (${prescriptions.filter(p => p.status === "received").length})` },
                { key: "preparing", label: "En prép." },
                { key: "ready_pickup", label: "Prêtes" },
                { key: "partial", label: "Partielles" },
                { key: "delivered", label: "Délivrées" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Patient, ID..." className="pl-9 h-9 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} ordonnance(s)</p>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground">Ordonnance</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Médicaments</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="p-4 text-xs font-medium text-muted-foreground w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => {
                const cfg = statusCfg[p.status];
                const hasProblems = p.items.some(i => i.availability !== "available");
                return (
                  <tr key={p.id}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selected?.id === p.id ? "bg-primary/5" : ""} ${p.urgent ? "border-l-4 border-l-destructive" : ""}`}
                    onClick={() => openDrawer(p)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          p.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        }`}>{p.avatar}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-sm">{p.patient}</span>
                            {p.urgent && <span className="text-[9px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-medium">URG</span>}
                            {p.assurance !== "Sans assurance" && <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-medium"><Shield className="h-2.5 w-2.5 inline mr-0.5" />{p.assurance}</span>}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{p.id} · {p.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{p.items.length} item(s)</span>
                        {hasProblems && <AlertCircle className="h-3 w-3 text-destructive" />}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{p.doctor}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit ${cfg.cls}`}>
                        <cfg.icon className="h-3 w-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={e => { e.stopPropagation(); openDrawer(p); }}>
                        <Eye className="h-3 w-3 mr-1" />Ouvrir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucune ordonnance</p></div>
          )}
        </div>
      </div>

      {/* ══ Detail Drawer ══ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.id}</h3>
                <p className="text-xs text-muted-foreground">{selected.date} · Envoyée par {selected.patient}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            {/* Patient + assurance */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Patient</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{selected.patient}</p>
                {selected.patientPhone && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{selected.patientPhone}</p>}
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-[10px] text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{selected.assurance}</p>
                {selected.numAssurance && <p className="text-[10px] text-muted-foreground">N° {selected.numAssurance}</p>}
              </div>
            </div>

            {/* Medications with availability */}
            <div className="rounded-lg border p-3 mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Médicaments ({selected.items.length})</p>
              <div className="space-y-2">
                {selected.items.map((item, i) => {
                  const avail = itemAvail[i] || { availability: item.availability, alternative: item.alternative || "" };
                  const availCls = avail.availability === "available" ? "bg-accent/10 text-accent" : avail.availability === "partial" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
                  const availLabel = avail.availability === "available" ? "Disponible" : avail.availability === "partial" ? "Partiel" : "Indisponible";
                  return (
                    <div key={i} className={`rounded-lg border p-3 ${avail.availability !== "available" ? "border-destructive/20 bg-destructive/5" : ""}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground">{item.name} {item.dosage}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{item.price}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground ml-6">Qté prescrite : {item.quantity}</p>

                      {!isReadOnly && (
                        <div className="ml-6 mt-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            {(["available", "partial", "unavailable"] as PharmacyItemAvailability[]).map(a => (
                              <button key={a} onClick={() => setItemAvail(prev => ({ ...prev, [i]: { ...prev[i], availability: a } }))}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                  avail.availability === a
                                    ? a === "available" ? "bg-accent text-accent-foreground" : a === "partial" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                {a === "available" ? "Dispo" : a === "partial" ? "Partiel" : "Indispo"}
                              </button>
                            ))}
                          </div>
                          {avail.availability !== "available" && (
                            <Input
                              placeholder="Alternative proposée..."
                              className="h-7 text-xs"
                              value={avail.alternative}
                              onChange={e => setItemAvail(prev => ({ ...prev, [i]: { ...prev[i], alternative: e.target.value } }))}
                            />
                          )}
                        </div>
                      )}

                      {isReadOnly && (
                        <div className="ml-6 mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${availCls}`}>{availLabel}</span>
                          {avail.alternative && <p className="text-[10px] text-muted-foreground mt-0.5">Alternative : {avail.alternative}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup time */}
            {!isReadOnly && (
              <div className="rounded-lg border p-3 mb-4">
                <Label className="text-xs font-semibold">Heure de retrait</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mockPickupTimePresets.map(t => (
                    <button key={t} onClick={() => setPickupTime(t)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors ${
                        pickupTime === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground"
                      }`}>{t}</button>
                  ))}
                </div>
                <Input placeholder="Ou saisir une heure..." className="mt-2 h-8 text-xs" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
              </div>
            )}

            {/* Comment */}
            {!isReadOnly && (
              <div className="mb-4">
                <Label className="text-xs font-semibold">Commentaire pharmacien</Label>
                <textarea rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs resize-none"
                  placeholder="Notes pour le patient..." value={comment} onChange={e => setComment(e.target.value)} />
              </div>
            )}

            {selected.comment && isReadOnly && (
              <div className="rounded-lg bg-muted/50 p-3 mb-4">
                <p className="text-[10px] text-muted-foreground font-medium">Commentaire</p>
                <p className="text-xs text-foreground">{selected.comment}</p>
              </div>
            )}

            {/* Status + pickup display */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusCfg[selected.status].cls}`}>
                {statusCfg[selected.status].label}
              </span>
              {selected.pickupTime && (
                <span className="text-xs text-accent font-medium flex items-center gap-1"><Clock className="h-3 w-3" />Retrait : {selected.pickupTime}</span>
              )}
            </div>

            {/* Action buttons */}
            {!isReadOnly && (
              <div className="space-y-2">
                {selected.status === "received" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs" onClick={() => handleStatus(selected.id, "preparing")}>
                    <Activity className="h-3.5 w-3.5 mr-1.5" />En préparation
                  </Button>
                )}
                {(selected.status === "received" || selected.status === "preparing") && (
                  <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs" onClick={() => handleStatus(selected.id, "ready_pickup")}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Prête à retirer {!pickupTime && "(heure requise)"}
                  </Button>
                )}
                {selected.status === "ready_pickup" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs" onClick={() => handleStatus(selected.id, "delivered")}>
                    <Send className="h-3.5 w-3.5 mr-1.5" />Délivrée
                  </Button>
                )}
                {selected.status !== "delivered" && selected.status !== "partial" && selected.status !== "unavailable" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs text-warning" onClick={() => handleStatus(selected.id, "partial")}>
                      <Package className="h-3.5 w-3.5 mr-1" />Partielle
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive" onClick={() => handleStatus(selected.id, "unavailable")}>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />Indisponible
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
