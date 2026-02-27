import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, MapPin, Phone, Clock, CreditCard, Shield, Calendar,
  ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Globe, Award,
  Video, Heart, Share2, Navigation, GraduationCap, ThumbsUp, Users,
  Building2, Briefcase, ChevronDown, ChevronUp, FileText, Verified,
  AlertCircle, User,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  mockDoctorProfile as doctorData,
  mockAvailableSlots as availableSlots,
  mockReviews as reviews,
  mockFaqItems as faqItems,
} from "@/data/mockData";

const DoctorPublicProfile = () => {
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "reviews" | "faq">("info");
  const [openSection, setOpenSection] = useState<string | null>("presentation");
  const isMobile = useIsMobile();

  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const verifiedCount = reviews.filter(r => r.verified).length;

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const AccordionSection = ({
    title, sectionKey, icon: Icon, children,
  }: {
    title: string; sectionKey: string; icon: any; children: React.ReactNode;
  }) => {
    if (!isMobile)
      return (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </h3>
          {children}
        </div>
      );

    const isOpen = openSection === sectionKey;
    return (
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <button onClick={() => toggleSection(sectionKey)} className="w-full flex items-center justify-between p-4 text-left">
          <span className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {isOpen && <div className="px-4 pb-4">{children}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Medicare</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="outline" size="sm">Se connecter</Button></Link>
            <Link to="/register"><Button size="sm" className="gradient-primary text-primary-foreground">S'inscrire</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <Link to="/search" className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" />Retour aux résultats
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr] max-w-3xl mx-auto">
          <div className="space-y-4 sm:space-y-5">
            {/* Hero doctor card */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-card">
              <div className="h-20 sm:h-28 gradient-hero relative my-0 mb-[34px]">
                <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40"><Heart className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/20 backdrop-blur-sm text-primary-foreground hover:bg-card/40"><Share2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="px-4 sm:px-6 pb-5 -mt-8 sm:-mt-10 relative">
                <div className="flex items-end gap-3 sm:gap-4">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl sm:text-3xl font-bold border-4 border-card shadow-elevated shrink-0">
                    {doctorData.initials}
                  </div>
                  <div className="flex-1 pb-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{doctorData.name}</h1>
                      <Verified className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    </div>
                    <p className="text-primary font-medium text-xs sm:text-sm">{doctorData.specialty}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctorData.subSpecialties.map((s) => (
                        <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3">
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-1.5 sm:p-2 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                      <span className="text-sm sm:text-base font-bold text-foreground">{doctorData.verifiedReviewCount}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Avis vérifiés</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-1.5 sm:p-2 text-center">
                    <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary mx-auto" />
                    <p className="text-[9px] sm:text-[10px] text-primary font-medium">CNAM</p>
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-1.5 sm:p-2 text-center">
                    <p className="text-sm sm:text-base font-bold text-foreground">{doctorData.experience}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Expérience</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-1.5 sm:p-2 text-center">
                    <p className="text-sm sm:text-base font-bold text-foreground">{doctorData.price}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Consultation</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{doctorData.address}</span></span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" />{doctorData.phone}</span>
                  {doctorData.teleconsultation && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium w-fit"><Video className="h-3 w-3" />Téléconsultation</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg border bg-card p-0.5 overflow-x-auto">
              {([
                { key: "info" as const, label: "Informations" },
                { key: "reviews" as const, label: `Avis (${doctorData.reviewCount})` },
                { key: "faq" as const, label: "FAQ" },
              ]).map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div className="space-y-3 sm:space-y-5">
                <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" />Présentation</h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{doctorData.presentation}</p>
                </div>

                <AccordionSection title="Expertises & Actes" sectionKey="actes" icon={Briefcase}>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {doctorData.actes.map((a, i) => (
                      <span key={i} className="text-xs bg-primary/5 text-foreground border border-primary/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">{a}</span>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Tarifs" sectionKey="tarifs" icon={CreditCard}>
                  <div className="space-y-1.5 sm:space-y-2">
                    {doctorData.motifs.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 sm:py-2 border-b last:border-0">
                        <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground truncate">{m.name}</p></div>
                        <span className="text-sm font-bold text-primary ml-2 shrink-0">{m.price}</span>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Formation & Diplômes" sectionKey="diplomas" icon={GraduationCap}>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/20 rounded-full" />
                    {doctorData.diplomas.map((d, i) => (
                      <div key={i} className="relative mb-3 last:mb-0">
                        <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.school}</p>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Langues parlées" sectionKey="languages" icon={Globe}>
                  <div className="flex flex-wrap gap-2">
                    {doctorData.languages.map((l) => (
                      <span key={l} className="text-sm bg-muted px-3 py-1.5 rounded-full text-foreground font-medium">{l}</span>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title="Horaires" sectionKey="horaires" icon={Clock}>
                  <div className="space-y-1">
                    {doctorData.horaires.map((h, i) => {
                      const isToday = h.day === "Jeudi";
                      return (
                        <div key={i} className={`flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-sm ${isToday ? "bg-primary/5 border border-primary/20" : ""} ${!h.open ? "text-muted-foreground" : "text-foreground"}`}>
                          <span className="font-medium text-xs sm:text-sm">{h.day}{" "}{isToday && <span className="text-[10px] text-primary font-semibold ml-1">Aujourd'hui</span>}</span>
                          <span className="text-[11px] sm:text-sm">{h.hours}</span>
                        </div>
                      );
                    })}
                  </div>
                </AccordionSection>

                <AccordionSection title="Accès & Infos pratiques" sectionKey="access" icon={Navigation}>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {doctorData.accessInfo.parking && <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm"><span className="text-base sm:text-lg">🅿️</span><span className="text-foreground">Parking</span></div>}
                    {doctorData.accessInfo.handicap && <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm"><span className="text-base sm:text-lg">♿</span><span className="text-foreground">Accès handicapé</span></div>}
                    {doctorData.accessInfo.elevator && <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm"><span className="text-base sm:text-lg">🛗</span><span className="text-foreground">Ascenseur</span></div>}
                    <div className="rounded-lg bg-muted/50 p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm"><span className="text-base sm:text-lg">🚇</span><span className="text-xs text-foreground">{doctorData.accessInfo.publicTransport}</span></div>
                  </div>
                  <div className="mt-3 sm:mt-4 rounded-xl bg-muted h-32 sm:h-40 flex items-center justify-center border">
                    <div className="text-center">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">{doctorData.address}</p>
                      <Button variant="link" size="sm" className="text-xs mt-1">Voir sur la carte</Button>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Affiliations" sectionKey="memberships" icon={Award}>
                  <ul className="space-y-2">
                    {doctorData.memberships.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0" />{m}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">N° Ordre : {doctorData.orderNumber} · Inscrit depuis {doctorData.registrationYear}</p>
                </AccordionSection>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-primary" /></div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{doctorData.verifiedReviewCount} <span className="text-sm font-medium text-muted-foreground">avis vérifiés</span></p>
                      <p className="text-xs text-muted-foreground">sur {doctorData.reviewCount} avis au total · Seuls les patients ayant consulté peuvent laisser un avis</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {displayReviews.map((r, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 sm:p-5 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{r.author.split(" ").map((n) => n[0]).join("")}</div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm text-foreground">{r.author}</span>
                              {r.verified && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Verified className="h-3 w-3" />Consultation vérifiée</span>}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <p className="text-sm text-foreground mt-3 leading-relaxed">{r.text}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><ThumbsUp className="h-3 w-3" />{r.helpful} utile{r.helpful > 1 ? "s" : ""}</button>
                      </div>
                    </div>
                  ))}
                </div>
                {reviews.length > 3 && (
                  <Button variant="outline" className="w-full" onClick={() => setShowAllReviews(!showAllReviews)}>
                    {showAllReviews ? "Voir moins" : `Voir tous les avis (${doctorData.reviewCount})`}
                  </Button>
                )}
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-3">
                {faqItems.map((f, i) => (
                  <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
                      <span className="text-sm font-medium text-foreground pr-2">{f.q}</span>
                      {expandedFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-2 animate-fade-in">
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-md p-3 sm:p-4">
        <div className="max-w-3xl mx-auto">
          <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow h-12 text-sm font-semibold" onClick={() => navigate("/booking/1")}>
            <Calendar className="h-4 w-4 mr-2" />Prendre rendez-vous
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1">Prise en charge CNAM · Annulation gratuite 24h avant</p>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
};

export default DoctorPublicProfile;
