/**
 * AdminSatisfaction — Dashboard NPS, avis patients, tendances
 * // TODO BACKEND: Agréger les données de satisfaction depuis la DB
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Star, AlertTriangle, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const npsHistory = [
  { month: "Sep", nps: 62 }, { month: "Oct", nps: 65 }, { month: "Nov", nps: 68 },
  { month: "Déc", nps: 64 }, { month: "Jan", nps: 71 }, { month: "Fév", nps: 74 }, { month: "Mar", nps: 72 },
];

const ratingDistribution = [
  { stars: "5★", count: 1245 }, { stars: "4★", count: 890 }, { stars: "3★", count: 342 },
  { stars: "2★", count: 98 }, { stars: "1★", count: 45 },
];

const topDoctors = [
  { name: "Dr. Nabil Karray", specialty: "Pédiatre", nps: 92, reviews: 312, trend: "up" },
  { name: "Dr. Ines Mansour", specialty: "Gynécologue", nps: 89, reviews: 421, trend: "up" },
  { name: "Dr. Ahmed Bouazizi", specialty: "Généraliste", nps: 85, reviews: 234, trend: "stable" },
];

const flopDoctors = [
  { name: "Dr. Karim Mejri", specialty: "Dermatologue", nps: 32, reviews: 45, issue: "Temps d'attente" },
  { name: "Dr. Rania Slim", specialty: "ORL", nps: 38, reviews: 28, issue: "Communication" },
  { name: "Dr. Walid Hamza", specialty: "Chirurgien", nps: 41, reviews: 67, issue: "Disponibilité" },
];

const recentReviews = [
  { id: 1, patient: "Amine B.", doctor: "Dr. Bouazizi", rating: 5, text: "Excellent médecin, très à l'écoute et professionnel.", date: "10 Mar 2026" },
  { id: 2, patient: "Fatma T.", doctor: "Dr. Gharbi", rating: 4, text: "Bonne prise en charge, un peu d'attente.", date: "9 Mar 2026" },
  { id: 3, patient: "Salma D.", doctor: "Dr. Mejri", rating: 2, text: "Attente trop longue, consultation expédiée.", date: "8 Mar 2026" },
  { id: 4, patient: "Mohamed S.", doctor: "Dr. Mansour", rating: 5, text: "Excellente gynécologue, suivi parfait.", date: "8 Mar 2026" },
  { id: 5, patient: "Nadia J.", doctor: "Dr. Hamza", rating: 1, text: "Impossible d'avoir un RDV, aucun suivi.", date: "7 Mar 2026" },
];

const AdminSatisfaction = () => {
  const [period, setPeriod] = useState("30j");

  return (
    <DashboardLayout role="admin" title="Satisfaction & NPS">
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7j">7 derniers jours</SelectItem>
            <SelectItem value="30j">30 derniers jours</SelectItem>
            <SelectItem value="90j">3 mois</SelectItem>
            <SelectItem value="365j">12 mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">72</p><p className="text-xs text-muted-foreground">NPS global</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Star className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">4.3/5</p><p className="text-xs text-muted-foreground">Note moyenne</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><MessageSquare className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-2xl font-bold text-foreground">2 620</p><p className="text-xs text-muted-foreground">Avis total</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold text-foreground">3</p><p className="text-xs text-muted-foreground">Alertes praticiens</p></div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* NPS trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Évolution du NPS</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={npsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="nps" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution des notes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stars" type="category" tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top praticiens */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-primary" />Top praticiens</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topDoctors.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.specialty} · {d.reviews} avis</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-primary/10 text-primary">NPS {d.nps}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Flop / Alertes */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ThumbsDown className="h-4 w-4 text-destructive" />Alertes praticiens</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {flopDoctors.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-destructive/20 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.specialty} · {d.reviews} avis</p>
                  <Badge variant="outline" className="mt-1 text-[10px] text-destructive">{d.issue}</Badge>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">NPS {d.nps}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent reviews */}
      <Card>
        <CardHeader><CardTitle className="text-base">Derniers avis</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {recentReviews.map(r => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                {r.patient.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground">{r.patient}</span>
                  <span className="text-xs text-muted-foreground">→ {r.doctor}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{r.text}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminSatisfaction;
