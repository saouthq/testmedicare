/**
 * doctorProfileStore.ts — Doctor public profile (persistent, cross-role readable).
 * Dual-mode: Supabase (doctors_directory + profiles) in production, localStorage for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "./authStore";

export interface DoctorProfile {
  name: string;
  specialty: string;
  subSpecialties: string[];
  initials: string;
  email: string;
  address: string;
  phone: string;
  convention: string;
  price: string;
  consultationDuration: number;
  priceRange: Record<string, number>;
  languages: string[];
  experience: string;
  registrationYear: number;
  orderNumber: string;
  presentation: string;
  diplomas: { title: string; school: string; year: string }[];
  horaires: { day: string; hours: string; open: boolean }[];
  motifs: { name: string; duration: string; price: string }[];
  reviewCount: number;
  actes: string[];
  memberships: string[];
  accessInfo: { parking: boolean; handicap: boolean; elevator: boolean; publicTransport: string };
}

const defaultProfile: DoctorProfile = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  subSpecialties: ["Diabétologie", "Médecine du sport"],
  initials: "AB",
  email: "ahmed.bouazizi@mediconnect.tn",
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  convention: "Conventionné Secteur 1",
  price: "35 DT",
  consultationDuration: 30,
  priceRange: { consultation: 35, suivi: 25, premiere: 50, certificat: 20 },
  languages: ["Français", "Arabe", "Anglais"],
  experience: "15 ans",
  registrationYear: 2010,
  orderNumber: "TN-10101010",
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis, je vous accueille dans mon cabinet moderne à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé complets et vaccinations.\n\nJe porte une attention particulière à l'écoute de mes patients et à une approche globale de la santé. Mon cabinet est équipé d'un ECG, d'un échographe et d'un laboratoire d'analyses rapides.\n\nConventionné Assurance, je pratique le tiers payant pour faciliter vos démarches.",
  diplomas: [
    { title: "Doctorat en Médecine", school: "Faculté de Médecine de Tunis", year: "2010" },
    { title: "DU Diabétologie", school: "Université de Tunis El Manar", year: "2012" },
    { title: "DIU Médecine du Sport", school: "Université Paris Descartes", year: "2014" },
    { title: "Formation Échographie", school: "Institut Pasteur de Tunis", year: "2016" },
  ],
  horaires: [
    { day: "Lundi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mardi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mercredi", hours: "08:00 - 12:00", open: true },
    { day: "Jeudi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Vendredi", hours: "08:00 - 12:00 / 14:00 - 17:00", open: true },
    { day: "Samedi", hours: "08:00 - 13:00", open: true },
    { day: "Dimanche", hours: "Fermé", open: false },
  ],
  motifs: [
    { name: "Consultation générale", duration: "30 min", price: "35 DT" },
    { name: "Suivi maladie chronique", duration: "20 min", price: "25 DT" },
    { name: "Première consultation", duration: "45 min", price: "50 DT" },
    { name: "Certificat médical", duration: "15 min", price: "20 DT" },
    { name: "Vaccination", duration: "15 min", price: "25 DT" },
    { name: "ECG", duration: "20 min", price: "40 DT" },
  ],
  reviewCount: 127,
  actes: ["ECG", "Échographie abdominale", "Spirométrie", "Tests rapides (glycémie, CRP)", "Vaccinations", "Petite chirurgie"],
  memberships: ["Ordre National des Médecins de Tunisie", "Société Tunisienne de Médecine Générale", "Association Tunisienne de Diabétologie"],
  accessInfo: { parking: true, handicap: true, elevator: true, publicTransport: "Métro ligne 1 - Station El Manar (200m)" },
};

const store = createStore<DoctorProfile>("medicare_doctor_profile", defaultProfile);

export const doctorProfileStore = store;

export function useDoctorProfile() {
  return useDualQuery<DoctorProfile>({
    store,
    tableName: "doctors_directory",
    select: "*, profiles!doctors_directory_id_fkey(first_name, last_name, email, phone)",
    queryKey: ["doctor_profile"],
    mapRowToLocal: (row: any) => {
      const profile = row.profiles || {};
      const name = `Dr. ${profile.first_name || ""} ${profile.last_name || ""}`.trim();
      return {
        ...defaultProfile,
        name: name || defaultProfile.name,
        specialty: row.specialty || defaultProfile.specialty,
        email: profile.email || defaultProfile.email,
        phone: profile.phone || row.phone || defaultProfile.phone,
        address: row.address || defaultProfile.address,
        price: row.consultation_price ? `${row.consultation_price} DT` : defaultProfile.price,
        languages: row.languages || defaultProfile.languages,
        presentation: row.bio || defaultProfile.presentation,
        initials: ((profile.first_name || "")[0] || "") + ((profile.last_name || "")[0] || ""),
      };
    },
  });
}

/** Update doctor profile fields */
export async function updateDoctorProfile(updates: Partial<DoctorProfile>) {
  store.set(prev => ({ ...prev, ...updates }));

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Update doctors_directory
        const dirRow: Record<string, any> = {};
        if (updates.specialty) dirRow.specialty = updates.specialty;
        if (updates.address) dirRow.address = updates.address;
        if (updates.presentation) dirRow.bio = updates.presentation;
        if (updates.languages) dirRow.languages = updates.languages;
        if (updates.price) dirRow.consultation_price = parseInt(updates.price) || 0;
        if (Object.keys(dirRow).length > 0) {
          await (supabase.from as any)("doctors_directory").upsert({
            id: session.user.id,
            ...dirRow,
          }, { onConflict: "id" });
        }

        // Update profiles table (name, email, phone)
        const profileRow: Record<string, any> = {};
        if (updates.name) {
          const nameParts = updates.name.replace("Dr. ", "").split(" ");
          profileRow.first_name = nameParts[0] || "";
          profileRow.last_name = nameParts.slice(1).join(" ") || "";
        }
        if (updates.email) profileRow.email = updates.email;
        if (updates.phone) profileRow.phone = updates.phone;
        if (Object.keys(profileRow).length > 0) {
          await (supabase.from as any)("profiles").update(profileRow).eq("id", session.user.id);
        }
      }
    } catch (e) {
      console.warn("[updateDoctorProfile] Supabase update failed:", e);
    }
  }
}

/** Read-only access for non-React contexts */
export const readDoctorProfile = () => store.read();
