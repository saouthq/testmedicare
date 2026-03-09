/**
 * Mock data — Common (specialties, languages, landing, assurances, etc.)
 */

export const specialties = [
  "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue",
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute",
  "Psychiatre", "Rhumatologue", "Chirurgien",
];

export const specialtiesWithAll = ["Tous", ...specialties.slice(0, 9)];

export const languages = ["Français", "Arabe", "Anglais", "Allemand", "Italien", "Espagnol"];

// ─── Assurances (référentiel unique Tunisie) ─────────────────
// Note: Remplace CNAM par système "Assurance" générique

export const mockAssurances = [
  { id: "publique", name: "Assurance publique", type: "public" },
  { id: "cnrps", name: "CNRPS (retraités)", type: "public" },
  { id: "cnss", name: "CNSS", type: "public" },
  { id: "maghrebia", name: "Assurances Maghrebia", type: "private" },
  { id: "star", name: "STAR Assurances", type: "private" },
  { id: "gat", name: "GAT Assurances", type: "private" },
  { id: "carte", name: "CARTE Assurance", type: "private" },
  { id: "ami", name: "AMI Assurances", type: "private" },
  { id: "bh", name: "BH Assurance", type: "private" },
  { id: "ctama", name: "CTAMA", type: "private" },
  { id: "lloyd", name: "Lloyd Assurances", type: "private" },
  { id: "none", name: "Sans assurance", type: "none" },
];

// Helper to get assurance options for select inputs
export const getAssuranceOptions = () => mockAssurances.map(a => ({ value: a.id, label: a.name }));

export const availDates = [
  { label: "Lun 17", short: "17/02", morning: true, afternoon: true },
  { label: "Mar 18", short: "18/02", morning: true, afternoon: false },
  { label: "Mer 19", short: "19/02", morning: false, afternoon: false },
  { label: "Jeu 20", short: "20/02", morning: true, afternoon: true },
  { label: "Ven 21", short: "21/02", morning: false, afternoon: true },
  { label: "Sam 22", short: "22/02", morning: true, afternoon: false },
  { label: "Dim 23", short: "23/02", morning: false, afternoon: false },
];

// ─── Landing Page ────────────────────────────────────────────

export const mockLandingSpecialties = ["Médecin généraliste", "Dentiste", "Ophtalmologue", "Dermatologue", "Gynécologue", "Pédiatre", "Kinésithérapeute", "Cardiologue"];

export const mockLandingFeatures = [
  { title: "Prise de RDV en ligne", description: "Réservez votre rendez-vous 24h/24, 7j/7 en quelques clics." },
  { title: "Rappels automatiques", description: "Recevez des rappels par SMS au +216 avant chaque consultation." },
  { title: "Prise en charge Assurance", description: "Trouvez des praticiens conventionnés partout en Tunisie." },
  { title: "Téléconsultation", description: "Consultez votre médecin à distance depuis votre domicile." },
];

export const mockLandingRoles = [
  { title: "Médecins", description: "Gérez votre agenda, vos patients et vos consultations.", link: "/dashboard/doctor", color: "bg-primary/10 text-primary" },
  { title: "Patients", description: "Prenez RDV, consultez vos ordonnances et votre historique.", link: "/dashboard/patient", color: "bg-accent/10 text-accent" },
  { title: "Pharmacies", description: "Recevez et gérez les ordonnances de vos patients.", link: "/dashboard/pharmacy", color: "bg-warning/10 text-warning" },
  { title: "Laboratoires", description: "Gérez les analyses et partagez les résultats.", link: "/dashboard/laboratory", color: "bg-destructive/10 text-destructive" },
  { title: "Secrétariat", description: "Pilotez le cabinet : agenda, facturation, patients.", link: "/dashboard/secretary", color: "bg-primary/10 text-primary" },
];

export const mockLandingStats = [
  { value: "5 000+", label: "Praticiens" },
  { value: "500K+", label: "Patients" },
  { value: "2M+", label: "RDV pris" },
  { value: "98%", label: "Satisfaction" },
];

// ─── Cabinet Rules (règles du cabinet) ──────────────────────

export const mockCabinetRules = {
  cancellationHours: 24,
  maxReschedules: 2,
  noShowPolicy: "Après 2 absences non justifiées, une caution pourra être demandée.",
  latePolicy: "Un retard de plus de 15 minutes peut entraîner l'annulation du RDV.",
  paymentMethods: ["Espèces", "Carte bancaire", "Virement"],
};

// ─── Tunisian Governorates ───────────────────────────────────

export const gouvernorats = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
  "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine",
  "Tataouine", "Gafsa", "Tozeur", "Kébili",
];
