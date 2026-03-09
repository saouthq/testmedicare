/**
 * Mock data — Pharmacy domain
 * Model: Patient sends prescription → Pharmacy processes (per-item availability + alternatives)
 * Pickup time mandatory when "ready_pickup". CNAM → Assurance.
 */
import type { PharmacyPrescription } from "@/types";

/* ── Stats ─────────────────────────────────────────────── */
export const mockPharmacyStats = [
  { label: "Reçues", value: "8", color: "bg-warning/10 text-warning", change: "+3 aujourd'hui" },
  { label: "En préparation", value: "3", color: "bg-primary/10 text-primary", change: "" },
  { label: "Prêtes à retirer", value: "2", color: "bg-accent/10 text-accent", change: "" },
  { label: "Problèmes", value: "2", color: "bg-destructive/10 text-destructive", change: "1 partielle, 1 indispo" },
];

/* ── Stock (unchanged) ─────────────────────────────────── */
export const mockPharmacyStock = [
  { id: 1, name: "Amoxicilline 500mg", category: "Antibiotiques", quantity: 245, threshold: 50, status: "ok", price: "8.5 DT", expiry: "Mar 2027", supplier: "Siphat" },
  { id: 2, name: "Paracétamol 1g", category: "Antalgiques", quantity: 532, threshold: 100, status: "ok", price: "3.2 DT", expiry: "Juin 2027", supplier: "Adwya" },
  { id: 3, name: "Ibuprofène 400mg", category: "Anti-inflammatoires", quantity: 12, threshold: 50, status: "low", price: "6.8 DT", expiry: "Déc 2026", supplier: "Siphat" },
  { id: 4, name: "Metformine 850mg", category: "Antidiabétiques", quantity: 89, threshold: 30, status: "ok", price: "12 DT", expiry: "Sep 2027", supplier: "Sanofi" },
  { id: 5, name: "Ventoline 100µg", category: "Bronchodilatateurs", quantity: 5, threshold: 20, status: "critical", price: "18 DT", expiry: "Fév 2027", supplier: "GSK" },
  { id: 6, name: "Oméprazole 20mg", category: "Anti-acides", quantity: 8, threshold: 30, status: "critical", price: "9.5 DT", expiry: "Jan 2027", supplier: "Adwya" },
  { id: 7, name: "Amlodipine 10mg", category: "Antihypertenseurs", quantity: 67, threshold: 25, status: "ok", price: "15 DT", expiry: "Avr 2027", supplier: "Medis" },
  { id: 8, name: "Bisoprolol 5mg", category: "Bêtabloquants", quantity: 42, threshold: 20, status: "ok", price: "11 DT", expiry: "Mai 2027", supplier: "Sanofi" },
  { id: 9, name: "Glibenclamide 5mg", category: "Antidiabétiques", quantity: 18, threshold: 25, status: "low", price: "7 DT", expiry: "Nov 2026", supplier: "Siphat" },
];

export const mockPharmacyCategories = ["Tous", "Antibiotiques", "Antalgiques", "Anti-inflammatoires", "Antidiabétiques", "Antihypertenseurs", "Bronchodilatateurs", "Anti-acides", "Bêtabloquants"];

/* ── Prescriptions (new model) ─────────────────────────── */
export const mockPharmacyPrescriptions: PharmacyPrescription[] = [
  {
    id: "ORD-2026-045", patient: "Amine Ben Ali", avatar: "AB", doctor: "Dr. Bouazizi",
    date: "20 Fév 2026", assurance: "CNAM", numAssurance: "12345678",
    patientPhone: "+216 71 234 567", urgent: false, total: "28.5 DT", status: "received",
    items: [
      { name: "Metformine", dosage: "850mg", quantity: 60, availability: "available", price: "12 DT" },
      { name: "Glibenclamide", dosage: "5mg", quantity: 30, availability: "available", price: "7 DT" },
      { name: "Oméprazole", dosage: "20mg", quantity: 14, availability: "unavailable", alternative: "Esoméprazole 20mg disponible", price: "9.5 DT" },
    ],
  },
  {
    id: "ORD-2026-044", patient: "Fatma Trabelsi", avatar: "FT", doctor: "Dr. Gharbi",
    date: "20 Fév 2026", assurance: "CNRPS", numAssurance: "87654321",
    patientPhone: "+216 22 345 678", urgent: true, total: "15 DT", status: "preparing",
    items: [
      { name: "Amlodipine", dosage: "10mg", quantity: 30, availability: "available", price: "15 DT" },
    ],
  },
  {
    id: "ORD-2026-043", patient: "Mohamed Sfar", avatar: "MS", doctor: "Dr. Hammami",
    date: "19 Fév 2026", assurance: "Sans assurance",
    patientPhone: "+216 55 456 789", urgent: false, total: "17.8 DT", status: "ready_pickup",
    pickupTime: "14:30",
    items: [
      { name: "Ibuprofène", dosage: "400mg", quantity: 20, availability: "available", price: "6.8 DT" },
      { name: "Tramadol", dosage: "50mg", quantity: 10, availability: "available", price: "11 DT" },
    ],
    comment: "Présenter la CIN à la délivrance",
  },
  {
    id: "ORD-2026-042", patient: "Nadia Jemni", avatar: "NJ", doctor: "Dr. Bouazizi",
    date: "18 Fév 2026", assurance: "CNAM", numAssurance: "11223344",
    patientPhone: "+216 98 567 890", urgent: false, total: "18 DT", status: "delivered",
    pickupTime: "10:00",
    items: [
      { name: "Ventoline", dosage: "100µg", quantity: 1, availability: "available", price: "18 DT" },
    ],
  },
  {
    id: "ORD-2026-041", patient: "Sami Ayari", avatar: "SA", doctor: "Dr. Bouazizi",
    date: "17 Fév 2026", assurance: "Maghrebia", numAssurance: "MG-55667",
    patientPhone: "+216 29 678 901", urgent: false, total: "11.7 DT", status: "delivered",
    items: [
      { name: "Paracétamol", dosage: "1g", quantity: 16, availability: "available", price: "3.2 DT" },
      { name: "Amoxicilline", dosage: "500mg", quantity: 24, availability: "available", price: "8.5 DT" },
    ],
  },
  {
    id: "ORD-2026-040", patient: "Rania Meddeb", avatar: "RM", doctor: "Dr. Gharbi",
    date: "16 Fév 2026", assurance: "CNAM", numAssurance: "99887766",
    patientPhone: "+216 52 789 012", urgent: false, total: "11 DT", status: "partial",
    items: [
      { name: "Bisoprolol", dosage: "5mg", quantity: 30, availability: "available", price: "11 DT" },
      { name: "Losartan", dosage: "50mg", quantity: 30, availability: "unavailable", alternative: "Valsartan 80mg en stock", price: "14 DT" },
    ],
    comment: "Patiente informée, revient pour le Losartan",
  },
  {
    id: "ORD-2026-039", patient: "Karim Mansour", avatar: "KM", doctor: "Dr. Hammami",
    date: "20 Fév 2026", assurance: "STAR",
    patientPhone: "+216 50 890 123", urgent: false, total: "0 DT", status: "unavailable",
    items: [
      { name: "Augmentin", dosage: "1g", quantity: 12, availability: "unavailable", alternative: "Amoxicilline + Acide clavulanique dispo demain", price: "22 DT" },
    ],
    comment: "Tout le stock Augmentin en rupture fournisseur",
  },
  {
    id: "ORD-2026-038", patient: "Leila Chahed", avatar: "LC", doctor: "Dr. Bouazizi",
    date: "20 Fév 2026", assurance: "GAT", numAssurance: "GT-12340",
    patientPhone: "+216 23 901 234", urgent: true, total: "45 DT", status: "received",
    items: [
      { name: "Amoxicilline", dosage: "1g", quantity: 14, availability: "available", price: "12 DT" },
      { name: "Paracétamol", dosage: "1g", quantity: 20, availability: "available", price: "3.2 DT" },
      { name: "Vitamine C", dosage: "1000mg", quantity: 30, availability: "partial", alternative: "Disponible en 500mg x60", price: "8 DT" },
    ],
  },
];

/* ── Pickup time presets ───────────────────────────────── */
export const mockPickupTimePresets = [
  "Dans 30 min", "Dans 1h", "Dans 2h", "14:00", "15:00", "16:00", "17:00", "Demain matin",
];

/* ── History (deliveries) ──────────────────────────────── */
export const mockPharmacyHistory = [
  { id: "DEL-078", patient: "Nadia Jemni", prescription: "ORD-2026-042", items: ["Ventoline 100µg"], date: "18 Fév 2026", time: "10:00", pharmacist: "S. Maalej", amount: 18, assurance: "CNAM", avatar: "NJ", type: "full" as const },
  { id: "DEL-077", patient: "Sami Ayari", prescription: "ORD-2026-041", items: ["Paracétamol 1g", "Amoxicilline 500mg"], date: "17 Fév 2026", time: "11:20", pharmacist: "A. Kchaou", amount: 11.7, assurance: "Maghrebia", avatar: "SA", type: "full" as const },
  { id: "DEL-076", patient: "Rania Meddeb", prescription: "ORD-2026-040", items: ["Bisoprolol 5mg"], date: "16 Fév 2026", time: "15:30", pharmacist: "A. Kchaou", amount: 11, assurance: "CNAM", avatar: "RM", type: "partial" as const },
  { id: "DEL-075", patient: "Mohamed Sfar", prescription: "ORD-2026-043", items: ["Ibuprofène 400mg", "Tramadol 50mg"], date: "19 Fév 2026", time: "14:30", pharmacist: "S. Maalej", amount: 17.8, assurance: "Sans assurance", avatar: "MS", type: "full" as const },
];

/* ── Simplified dashboard prescriptions ────────────────── */
export const mockPharmacyDeliveries = [
  { patient: "Nadia Jemni", time: "10:00", items: ["Ventoline"], amount: 18 },
  { patient: "Mohamed Sfar", time: "14:30", items: ["Ibuprofène", "Tramadol"], amount: 17.8 },
];
