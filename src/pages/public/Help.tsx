/**
 * Help / FAQ Page — FAQ par thèmes + OTP troubleshooting + formulaire contact mock
 * // TODO BACKEND: POST /api/support/contact
 */
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createSupportTicket } from "@/services/supportService";
import {
  Search, ChevronDown, ChevronUp, HelpCircle, Calendar, CreditCard,
  Video, Shield, User, Phone, Mail, AlertTriangle, MessageSquare, Pill, FlaskConical, Send,
} from "lucide-react";

const faqCategories = [
  {
    id: "appointments",
    icon: Calendar,
    title: "Rendez-vous",
    questions: [
      { q: "Comment prendre rendez-vous ?", a: "Recherchez un praticien par spécialité ou nom, sélectionnez un créneau disponible, et confirmez votre rendez-vous. Vous pouvez réserver sans compte en vérifiant votre numéro de téléphone." },
      { q: "Comment annuler ou modifier un rendez-vous ?", a: "Rendez-vous sur la page 'Retrouver mes RDV', entrez votre numéro de téléphone, puis sélectionnez le rendez-vous à modifier ou annuler." },
      { q: "Que faire si je suis en retard ?", a: "Contactez le cabinet directement. Un retard de plus de 15 minutes peut entraîner l'annulation du rendez-vous selon la politique du praticien." },
      { q: "Comment retrouver mes rendez-vous passés ?", a: "Depuis la page 'Retrouver mes RDV' avec votre numéro de téléphone, ou depuis votre espace patient si vous avez créé un compte." },
    ],
  },
  {
    id: "otp",
    icon: Phone,
    title: "OTP / Vérification téléphone",
    questions: [
      { q: "Je ne reçois pas le code OTP, que faire ?", a: "Vérifiez que votre numéro est correct et au format +216. Le code peut prendre jusqu'à 1 minute. Vérifiez vos SMS (pas les spams). Si le problème persiste, utilisez le bouton 'Renvoyer le code'." },
      { q: "Le code OTP est-il valide combien de temps ?", a: "Le code est valide pendant 5 minutes. Passé ce délai, demandez un nouveau code." },
      { q: "Puis-je utiliser un numéro étranger ?", a: "Non, actuellement seuls les numéros tunisiens (+216) sont acceptés." },
      { q: "J'ai changé de numéro, comment faire ?", a: "Si vous avez un compte, connectez-vous et mettez à jour votre numéro dans les paramètres. Sinon, créez un nouveau compte avec votre nouveau numéro." },
    ],
  },
  {
    id: "teleconsultation",
    icon: Video,
    title: "Téléconsultation",
    questions: [
      { q: "Comment fonctionne la téléconsultation ?", a: "La consultation se fait par visioconférence sécurisée. Vous recevez un lien par SMS quelques minutes avant le rendez-vous. Cliquez dessus pour rejoindre la salle d'attente virtuelle." },
      { q: "De quoi ai-je besoin pour une téléconsultation ?", a: "Un smartphone, tablette ou ordinateur avec une caméra et un microphone, ainsi qu'une connexion internet stable. Aucune application à installer." },
      { q: "Puis-je recevoir une ordonnance en téléconsultation ?", a: "Oui, le médecin peut vous délivrer une ordonnance numérique que vous pouvez présenter en pharmacie ou télécharger depuis votre espace." },
    ],
  },
  {
    id: "prescriptions",
    icon: Pill,
    title: "Ordonnances & Pharmacies",
    questions: [
      { q: "Comment envoyer mon ordonnance à une pharmacie ?", a: "Depuis votre espace patient, section 'Ordonnances', cliquez sur 'Envoyer à pharmacie'. Vous pouvez sélectionner jusqu'à 6 pharmacies partenaires." },
      { q: "Comment savoir si ma pharmacie a préparé ma commande ?", a: "Vous recevez une notification dès que la pharmacie répond. Le statut 'Prête à retirer' apparaît avec l'heure de retrait." },
      { q: "Et si un médicament n'est pas disponible ?", a: "La pharmacie peut proposer des alternatives. Vous verrez le détail dans le suivi de votre ordonnance." },
    ],
  },
  {
    id: "analyses",
    icon: FlaskConical,
    title: "Analyses & Résultats",
    questions: [
      { q: "Comment consulter mes résultats d'analyses ?", a: "Vos résultats sont disponibles dans votre espace patient, section 'Mon espace santé', une fois transmis par le laboratoire." },
      { q: "Mon médecin reçoit-il automatiquement mes résultats ?", a: "Oui, lorsque le laboratoire transmet les résultats, votre médecin prescripteur en est automatiquement informé." },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Paiement & Assurance",
    questions: [
      { q: "Comment payer ma consultation ?", a: "Le paiement se fait généralement au cabinet (espèces, carte bancaire). Pour les téléconsultations, le paiement en ligne peut être proposé." },
      { q: "Les consultations sont-elles prises en charge par l'assurance ?", a: "De nombreux praticiens sont conventionnés ou acceptent les assurances publiques et privées. Filtrez par 'Assurance' lors de votre recherche." },
    ],
  },
  {
    id: "account",
    icon: User,
    title: "Compte & Données",
    questions: [
      { q: "Dois-je créer un compte ?", a: "Non, vous pouvez prendre rendez-vous sans compte en vérifiant votre numéro de téléphone. Un compte vous permet cependant d'accéder à votre historique, documents et ordonnances." },
      { q: "Mes données sont-elles sécurisées ?", a: "Oui, vos données de santé sont chiffrées et stockées de manière sécurisée. Nous respectons les normes de protection des données de santé." },
      { q: "Comment supprimer mon compte ?", a: "Contactez-nous via le formulaire ci-dessous. Votre compte et vos données seront supprimés conformément à la réglementation." },
    ],
  },
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("appointments");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Contact form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const toggleQuestion = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(key)) newExpanded.delete(key);
    else newExpanded.add(key);
    setExpandedQuestions(newExpanded);
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      !searchQuery ||
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = createSupportTicket({
      name: contactName,
      email: contactEmail,
      subject: contactSubject,
      message: contactMessage,
    });
    setTicketNumber(number);
    toast({ title: "Demande enregistrée", description: `Votre demande a été enregistrée sous le numéro #${number}.` });
    setContactSent(true);
  };

  const handleResendOtp = () => {
    // TODO BACKEND: POST /api/auth/otp/resend
    toast({ title: "Code renvoyé", description: "Un nouveau code de vérification a été envoyé." });
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet
        title="Aide & FAQ | Medicare Tunisie"
        description="Trouvez des réponses à vos questions sur Medicare : rendez-vous, OTP, téléconsultation, ordonnances, pharmacies, analyses, compte."
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Aide" }]} />

        <div className="text-center mb-8">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Centre d'aide</h1>
          <p className="text-muted-foreground">Comment pouvons-nous vous aider ?</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* OTP Troubleshooting callout */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm mb-1">Problème avec le code OTP ?</h3>
              <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                <li>• Vérifiez que le numéro est au format +216 XX XXX XXX</li>
                <li>• Attendez jusqu'à 1 minute pour recevoir le SMS</li>
                <li>• Vérifiez que votre téléphone n'est pas en mode avion</li>
                <li>• Le code est valide 5 minutes</li>
              </ul>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleResendOtp}>
                <Phone className="h-3 w-3 mr-1" />Renvoyer un code test
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4 mb-12">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors active-scale"
              >
                <div className="flex items-center gap-3">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">{cat.title}</span>
                  <span className="text-xs text-muted-foreground">({cat.questions.length})</span>
                </div>
                {expandedCategory === cat.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {expandedCategory === cat.id && (
                <div className="border-t">
                  {cat.questions.map((q, i) => {
                    const isExpanded = expandedQuestions.has(`${cat.id}-${i}`);
                    return (
                      <div key={i} className="border-b last:border-0">
                        <button onClick={() => toggleQuestion(cat.id, i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
                          <span className="font-medium text-foreground pr-4 text-sm">{q.q}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">{q.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA — Retrouver mes RDV */}
        <div className="rounded-xl gradient-hero p-6 text-center mb-10">
          <h2 className="text-lg font-bold text-primary-foreground mb-2">Besoin de retrouver vos rendez-vous ?</h2>
          <p className="text-primary-foreground/80 text-sm mb-4">Accédez à vos RDV avec votre numéro de téléphone, sans compte.</p>
          <Link to="/my-appointments">
            <Button className="bg-white text-primary hover:bg-white/90">
              <Calendar className="h-4 w-4 mr-2" />Retrouver mes RDV
            </Button>
          </Link>
        </div>

        {/* Contact form */}
        <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Contacter le support</h2>
          </div>

          {!contactSent ? (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nom *</label>
                  <Input value={contactName} onChange={e => setContactName(e.target.value)} required className="mt-1" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="mt-1" placeholder="votre@email.tn" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sujet</label>
                <Input value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="mt-1" placeholder="Ex: Problème de connexion" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Message *</label>
                <Textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} required rows={4} className="mt-1" placeholder="Décrivez votre problème ou question..." />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={!contactName || !contactEmail || !contactMessage}>
                <Send className="h-4 w-4 mr-2" />Envoyer le message
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <Mail className="h-12 w-12 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Message envoyé !</h3>
              <p className="text-sm text-muted-foreground">Notre équipe vous répondra sous 24h à {contactEmail}.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setContactSent(false); setContactName(""); setContactEmail(""); setContactMessage(""); }}>
                Envoyer un autre message
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 pt-4 border-t">
            <a href="mailto:support@medicare.tn" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail className="h-4 w-4" />support@medicare.tn
            </a>
            <a href="tel:+21671234567" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Phone className="h-4 w-4" />+216 71 234 567
            </a>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Help;
