import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Download, Banknote, FileText, CheckCircle2, Clock,
  AlertCircle, CreditCard, ArrowUpRight, Eye, Printer, Send, Receipt, Shield, X, Save, Trash2
} from "lucide-react";
import { mockSecretaryBillingInvoices, mockSecretaryBillingActTypes } from "@/data/mockData";

interface Invoice {
  id: string; patient: string; doctor: string; date: string; amount: number;
  type: string; payment: string; status: string; avatar: string; cnam: boolean;
}

const actTypes = mockSecretaryBillingActTypes;

const paymentMethods = [
  { method: "CNAM", count: 45, icon: Shield },
  { method: "Espèces", count: 28, icon: Banknote },
  { method: "Chèque", count: 15, icon: Receipt },
  { method: "Virement", count: 12, icon: CreditCard },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  paid: { label: "Payée", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  pending: { label: "En attente", class: "bg-warning/10 text-warning", icon: Clock },
  overdue: { label: "Impayée", class: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const SecretaryBilling = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockSecretaryBillingInvoices);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [showPayModal, setShowPayModal] = useState<Invoice | null>(null);

  // New invoice form
  const [newPatient, setNewPatient] = useState("");
  const [newDoctor, setNewDoctor] = useState("Dr. Bouazizi");
  const [newActs, setNewActs] = useState([{ type: actTypes[0].label, price: actTypes[0].price }]);
  const [newPayment, setNewPayment] = useState("—");
  const [newCnam, setNewCnam] = useState(true);
  const [payMethod, setPayMethod] = useState("Espèces");

  const filtered = invoices.filter(i => {
    if (filter !== "all" && i.status !== filter) return false;
    if (search && !i.patient.toLowerCase().includes(search.toLowerCase()) && !i.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const handleCreateInvoice = () => {
    // TODO BACKEND: POST /api/invoices
    if (!newPatient.trim()) return;
    const total = newActs.reduce((s, a) => s + a.price, 0);
    const newId = `FAC-2026-${String(88 + invoices.length).padStart(3, "0")}`;
    const avatar = newPatient.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const status = newPayment !== "—" ? "paid" : "pending";
    setInvoices(prev => [{
      id: newId, patient: newPatient, doctor: newDoctor, date: "20 Fév",
      amount: total, type: newActs.map(a => a.type).join(", "), payment: newPayment,
      status, avatar, cnam: newCnam,
    }, ...prev]);
    setShowNew(false);
    setNewPatient(""); setNewActs([{ type: actTypes[0].label, price: actTypes[0].price }]); setNewPayment("—");
  };

  const handleMarkPaid = (inv: Invoice) => {
    // TODO BACKEND: PATCH /api/invoices/{id} { status: "paid", payment }
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "paid", payment: payMethod } : i));
    setShowPayModal(null);
    setSelectedInv(null);
  };

  const stats = [
    { label: "Total encaissé", value: `${totalPaid} DT`, icon: Banknote, color: "bg-accent/10 text-accent" },
    { label: "En attente", value: `${totalPending} DT`, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Payées", value: String(invoices.filter(i => i.status === "paid").length), icon: CheckCircle2, color: "bg-accent/10 text-accent" },
    { label: "Impayés", value: `${totalOverdue} DT`, icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <DashboardLayout role="secretary" title="Facturation">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color} mb-2`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {[{ key: "all", label: "Toutes" }, { key: "pending", label: "En attente" }, { key: "paid", label: "Payées" }, { key: "overdue", label: "Impayées" }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48 text-xs" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />Nouvelle facture
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Invoices table */}
          <div className="lg:col-span-3 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Facture</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Patient</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Montant</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Paiement</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Statut</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(inv => {
                  const config = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedInv?.id === inv.id ? "bg-primary/5" : ""}`} onClick={() => setSelectedInv(inv)}>
                      <td className="p-3"><p className="text-xs font-semibold text-foreground">{inv.id}</p><p className="text-[10px] text-muted-foreground">{inv.date}</p></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">{inv.avatar}</div>
                          <div><span className="text-xs font-medium text-foreground">{inv.patient}</span>{inv.cnam && <p className="text-[9px] text-primary font-medium">CNAM</p>}</div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{inv.doctor}</td>
                      <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{inv.type}</td>
                      <td className="p-3 text-xs font-bold text-foreground">{inv.amount} DT</td>
                      <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{inv.payment}</td>
                      <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit ${config.class}`}><config.icon className="h-3 w-3" />{config.label}</span></td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3 w-3 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3 w-3 text-muted-foreground" /></Button>
                          {(inv.status === "pending" || inv.status === "overdue") && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setShowPayModal(inv); }}>
                              <Banknote className="h-3 w-3 text-accent" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {selectedInv ? (
              <div className="rounded-xl border bg-card shadow-card">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">{selectedInv.id}</h3>
                  <button onClick={() => setSelectedInv(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{selectedInv.avatar}</div>
                    <div><p className="font-bold text-foreground text-sm">{selectedInv.patient}</p><p className="text-xs text-muted-foreground">{selectedInv.doctor}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Date</p><p className="text-xs font-semibold text-foreground">{selectedInv.date}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Type</p><p className="text-xs font-semibold text-foreground">{selectedInv.type}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Montant</p><p className="text-xs font-bold text-foreground">{selectedInv.amount} DT</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Paiement</p><p className="text-xs font-semibold text-foreground">{selectedInv.payment}</p></div>
                  </div>
                  {selectedInv.cnam && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-primary">Assuré CNAM</p>
                    </div>
                  )}
                  <div className="space-y-1.5 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Printer className="h-3.5 w-3.5 mr-2" />Imprimer la facture</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Send className="h-3.5 w-3.5 mr-2" />Envoyer par email</Button>
                    {(selectedInv.status === "pending" || selectedInv.status === "overdue") && (
                      <Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground" onClick={() => setShowPayModal(selectedInv)}>
                        <Banknote className="h-3.5 w-3.5 mr-2" />Encaisser
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-card shadow-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Moyens de paiement</h3>
                <div className="space-y-3">
                  {paymentMethods.map(pm => (
                    <div key={pm.method} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><pm.icon className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1"><p className="text-xs font-medium text-foreground">{pm.method}</p>
                        <div className="h-1.5 w-full bg-muted rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${pm.count}%` }} /></div>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{pm.count}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Invoice Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Nouvelle facture</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Patient</Label><Input value={newPatient} onChange={e => setNewPatient(e.target.value)} className="mt-1" placeholder="Nom du patient" /></div>
                <div><Label className="text-xs">Médecin</Label>
                  <select value={newDoctor} onChange={e => setNewDoctor(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Dr. Bouazizi</option><option>Dr. Gharbi</option><option>Dr. Hammami</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Actes</Label>
                <div className="space-y-2 mt-1">
                  {newActs.map((act, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={act.type} onChange={e => {
                        const selected = actTypes.find(a => a.label === e.target.value);
                        const u = [...newActs]; u[i] = { type: e.target.value, price: selected?.price || 0 }; setNewActs(u);
                      }} className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm">
                        {actTypes.map(a => <option key={a.label}>{a.label}</option>)}
                      </select>
                      <Input value={act.price} onChange={e => { const u = [...newActs]; u[i].price = parseInt(e.target.value) || 0; setNewActs(u); }} className="w-20 text-center" type="number" />
                      <span className="text-xs text-muted-foreground">DT</span>
                      {newActs.length > 1 && <button onClick={() => setNewActs(p => p.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setNewActs(p => [...p, { type: actTypes[0].label, price: actTypes[0].price }])}>
                    <Plus className="h-3 w-3 mr-1" />Ajouter un acte
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Moyen de paiement</Label>
                  <select value={newPayment} onChange={e => setNewPayment(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="—">Non encaissé</option>
                    <option>Espèces</option><option>CNAM</option><option>Chèque</option><option>Virement</option><option>Carte</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-1.5 text-xs mb-2">
                    <input type="checkbox" checked={newCnam} onChange={e => setNewCnam(e.target.checked)} className="rounded border-input" />
                    <Shield className="h-3 w-3 text-primary" />CNAM
                  </label>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">{newActs.reduce((s, a) => s + a.price, 0)} DT</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleCreateInvoice}>
                  <Save className="h-4 w-4 mr-2" />Créer la facture
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Modal ── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowPayModal(null)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-sm mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">Encaisser {showPayModal.id}</h3>
            <p className="text-sm text-muted-foreground mb-4">{showPayModal.patient} · <span className="font-bold text-foreground">{showPayModal.amount} DT</span></p>
            <div className="space-y-3 mb-5">
              <Label className="text-xs">Moyen de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Espèces", "CNAM", "Chèque", "Virement", "Carte"].map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`rounded-lg border p-3 text-xs font-medium transition-all text-center ${payMethod === m ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/50"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayModal(null)}>Annuler</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => handleMarkPaid(showPayModal)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Encaisser
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SecretaryBilling;
