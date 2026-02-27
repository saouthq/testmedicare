/**
 * Mock data — Common (specialties, languages, landing, etc.)
 */

export const specialties = [
  "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue",
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute",
  "Psychiatre", "Rhumatologue", "Chirurgien",
];

export const specialtiesWithAll = ["Tous", ...specialties.slice(0, 9)];

export const languages = ["Français", "Arabe", "Anglais", "Allemand", "Italien", "Espagnol"];

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
  { title: "Prise en charge CNAM", description: "Trouvez des praticiens conventionnés CNAM partout en Tunisie." },
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
  { value: "4.8/5", label: "Satisfaction" },
];
