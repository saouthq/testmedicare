import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Clock, User, Pill, CheckCircle2, Search, Download, Calendar, Shield, Banknote, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const history = [
  { id: "DEL-078", patient: "Sami Ayari", prescription: "ORD-2026-043", items: ["Ibuprofène 400mg", "Tramadol 50mg"], date: "20 Fév 2026", time: "14:30", pharmacist: "S. Maalej", amount: "35 DT", cnam: true, avatar: "SA" },
  { id: "DEL-077", patient: "Rania Meddeb", prescription: "ORD-2026-042", items: ["Ventoline 100µg"], date: "20 Fév 2026", time: "10:15", pharmacist: "A. Kchaou", amount: "22 DT", cnam: true, avatar: "RM" },
  { id: "DEL-076", patient: "Youssef Belhadj", prescription: "ORD-2026-040", items: ["Paracétamol 1g", "Oméprazole 20mg"], date: "19 Fév 2026", time: "16:45", pharmacist: "S. Maalej", amount: "18 DT", cnam: false, avatar: "YB" },
  { id: "DEL-075", patient: "Mohamed Sfar", prescription: "ORD-2026-038", items: ["Amoxicilline 500mg"], date: "18 Fév 2026", time: "09:00", pharmacist: "A. Kchaou", amount: "8.5 DT", cnam: false, avatar: "MS" },
  { id: "DEL-074", patient: "Amine Ben Ali", prescription: "ORD-2026-035", items: ["Metformine 850mg", "Glibenclamide 5mg"], date: "17 Fév 2026", time: "11:20", pharmacist: "S. Maalej", amount: "45 DT", cnam: true, avatar: "AB" },
  { id: "DEL-073", patient: "Fatma Trabelsi", prescription: "ORD-2026-033", items: ["Amlodipine 10mg", "Bisoprolol 5mg"], date: "16 Fév 2026", time: "15:30", pharmacist: "A. Kchaou", amount: "38 DT", cnam: true, avatar: "FT" },
];

const PharmacyHistory = () => {
  const [search, setSearch] = useState("");

  const filtered = history.filter(h =>
    !search || h.patient.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = history.reduce((sum, h) => sum + parseFloat(h.amount), 0);

  return (
    <DashboardLayout role="pharmacy" title="Historique des délivrances">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 h-9 w-56 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-right mr-3">
              <p className="text-xs text-muted-foreground">Total période</p>
              <p className="text-sm font-bold text-foreground">{totalAmount.toFixed(1)} DT</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />Exporter
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filtered.map((h) => (
            <div key={h.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent shrink-0">
                    {h.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{h.id}</h3>
                      <span className="text-xs text-muted-foreground">· {h.prescription}</span>
                      <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />Délivrée
                      </span>
                      {h.cnam && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Shield className="h-3 w-3" />CNAM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{h.patient}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{h.date} à {h.time}</span>
                      <span>Par {h.pharmacist}</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      {h.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-primary" />{item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground flex items-center gap-1">
                    <Banknote className="h-4 w-4 text-accent" />{h.amount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyHistory;
