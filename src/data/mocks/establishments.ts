/**
 * Mock data — Public establishments (clinics, hospitals, pharmacies)
 */

export interface MockClinic {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  services: string[];
  description: string;
}

export interface MockHospital {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  services: string[];
  urgences: boolean;
  description: string;
}

export interface MockPublicPharmacy {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  horaires: string;
  deGarde: boolean;
}

export const mockClinics: MockClinic[] = [
  { id: "cl-1", name: "Clinique El Manar", slug: "clinique-el-manar", city: "Tunis", address: "Rue du Lac Biwa, Les Berges du Lac, 1053 Tunis", phone: "+216 71 960 000", services: ["Cardiologie", "Chirurgie", "Maternité", "Pédiatrie", "Imagerie"], description: "Clinique privée pluridisciplinaire située aux Berges du Lac, offrant des soins de qualité depuis 1998." },
  { id: "cl-2", name: "Clinique Avicenne", slug: "clinique-avicenne", city: "Tunis", address: "15 Rue Avicenne, Mutuelleville, 1002 Tunis", phone: "+216 71 788 000", services: ["Ophtalmologie", "ORL", "Dermatologie", "Chirurgie esthétique"], description: "Clinique spécialisée en ophtalmologie et chirurgie esthétique, réputée pour son équipement de pointe." },
  { id: "cl-3", name: "Clinique Les Oliviers", slug: "clinique-les-oliviers", city: "Sousse", address: "Route de la Corniche, 4000 Sousse", phone: "+216 73 200 100", services: ["Chirurgie générale", "Orthopédie", "Urologie", "Gastro-entérologie"], description: "Clinique polyvalente offrant un large panel de spécialités chirurgicales à Sousse." },
  { id: "cl-4", name: "Clinique Hannibal", slug: "clinique-hannibal", city: "Tunis", address: "Rue du Lac Turkana, Les Berges du Lac, 1053 Tunis", phone: "+216 71 164 164", services: ["Chirurgie esthétique", "Chirurgie bariatrique", "Cardiologie", "Neurologie"], description: "Clinique internationale spécialisée dans la chirurgie esthétique et la médecine de pointe." },
  { id: "cl-5", name: "Clinique Pasteur", slug: "clinique-pasteur", city: "Tunis", address: "6 Place Pasteur, 1002 Tunis", phone: "+216 71 843 843", services: ["Médecine interne", "Pneumologie", "Rééducation", "Laboratoire"], description: "Clinique historique au cœur de Tunis, reconnue pour ses services de médecine interne." },
];

export const mockHospitals: MockHospital[] = [
  { id: "ho-1", name: "Hôpital Charles Nicolle", slug: "hopital-charles-nicolle", city: "Tunis", address: "Boulevard du 9 Avril 1938, 1006 Tunis", phone: "+216 71 578 000", services: ["Urgences", "Chirurgie", "Cardiologie", "Neurologie", "Pédiatrie", "Maternité"], urgences: true, description: "CHU de référence à Tunis, le plus grand hôpital universitaire du pays." },
  { id: "ho-2", name: "Hôpital La Rabta", slug: "hopital-la-rabta", city: "Tunis", address: "Place Bab Saadoun, 1007 Tunis", phone: "+216 71 578 400", services: ["Médecine interne", "Gastro-entérologie", "Pneumologie", "Rhumatologie"], urgences: true, description: "Hôpital universitaire spécialisé en médecine interne et pathologies chroniques." },
  { id: "ho-3", name: "Hôpital Sahloul", slug: "hopital-sahloul", city: "Sousse", address: "Route de la Ceinture, 4054 Sousse", phone: "+216 73 369 000", services: ["Urgences", "Cardiologie", "Orthopédie", "Oncologie", "Réanimation"], urgences: true, description: "CHU de Sousse, centre de référence pour le Sahel tunisien." },
  { id: "ho-4", name: "Hôpital Habib Bourguiba", slug: "hopital-habib-bourguiba-sfax", city: "Sfax", address: "Route El Ain, 3029 Sfax", phone: "+216 74 240 855", services: ["Urgences", "Chirurgie", "Pédiatrie", "Maternité"], urgences: true, description: "CHU de Sfax, principal centre hospitalier du sud tunisien." },
];

export const mockPublicPharmacies: MockPublicPharmacy[] = [
  { id: "ph-1", name: "Pharmacie Centrale de Tunis", slug: "pharmacie-centrale-tunis", city: "Tunis", address: "45 Avenue Habib Bourguiba, 1001 Tunis", phone: "+216 71 340 500", horaires: "Lun-Sam 8h-20h", deGarde: false },
  { id: "ph-2", name: "Pharmacie El Manar", slug: "pharmacie-el-manar", city: "Tunis", address: "12 Rue de l'Artisanat, El Manar 2, 2092 Tunis", phone: "+216 71 888 200", horaires: "Lun-Sam 8h-19h30", deGarde: true },
  { id: "ph-3", name: "Pharmacie Pasteur", slug: "pharmacie-pasteur", city: "Tunis", address: "8 Place Pasteur, 1002 Tunis", phone: "+216 71 792 300", horaires: "Lun-Sam 8h-20h, Dim 9h-13h", deGarde: false },
  { id: "ph-4", name: "Pharmacie de Nuit Sousse", slug: "pharmacie-nuit-sousse", city: "Sousse", address: "Avenue du 14 Janvier, 4000 Sousse", phone: "+216 73 225 500", horaires: "24h/24", deGarde: true },
  { id: "ph-5", name: "Pharmacie Ibn Sina", slug: "pharmacie-ibn-sina", city: "Sfax", address: "Rue Habib Maazoun, 3000 Sfax", phone: "+216 74 296 100", horaires: "Lun-Sam 8h-19h", deGarde: false },
  { id: "ph-6", name: "Pharmacie Les Berges", slug: "pharmacie-les-berges", city: "Tunis", address: "Rue du Lac Constance, Les Berges du Lac", phone: "+216 71 965 000", horaires: "Lun-Sam 8h30-20h", deGarde: true },
];
