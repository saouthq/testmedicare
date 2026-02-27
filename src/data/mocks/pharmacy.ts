/**
 * Mock data — Pharmacy domain
 */
import type { PharmacyPrescription } from "@/types";

export const mockPharmacyStats = [
  { label: "Ordonnances", value: "18", color: "bg-primary/10 text-primary", change: "+5 aujourd'hui" },
  { label: "Délivrées", value: "12", color: "bg-accent/10 text-accent", change: "+8%" },
  { label: "En attente", value: "6", color: "bg-warning/10 text-warning", change: "2 urgentes" },
  { label: "CA du jour", value: "945 DT", color: "bg-primary/10 text-primary", change: "+12%" },
];

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

export const mockPharmacyPrescriptions = [
  { patient: "Amine Ben Ali", avatar: "AB", doctor: "Dr. Bouazizi", items: 3, date: "20 Fév", total: "85 DT", urgent: false, cnam: true },
  { patient: "Fatma Trabelsi", avatar: "FT", doctor: "Dr. Gharbi", items: 1, date: "20 Fév", total: "22 DT", urgent: true, cnam: true },
  { patient: "Karim Mansour", avatar: "KM", doctor: "Dr. Hammami", items: 2, date: "19 Fév", total: "54 DT", urgent: false, cnam: false },
];

export const mockPharmacyDeliveries = [
  { patient: "Leila Chahed", time: "09:45", items: ["Amoxicilline", "Paracétamol"], amount: 42 },
  { patient: "Mohamed Sfar", time: "09:20", items: ["Metformine"], amount: 18 },
  { patient: "Hana Kammoun", time: "08:50", items: ["Amlodipine", "Aspirine"], amount: 35 },
];

export const mockPharmacyPrescriptionsFull: PharmacyPrescription[] = [
  { id: "ORD-2026-045", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", items: [
    { name: "Metformine 850mg", available: true, quantity: 60, price: "12 DT" },
    { name: "Glibenclamide 5mg", available: true, quantity: 30, price: "7 DT" },
    { name: "Oméprazole 20mg", available: false, quantity: 0, price: "9.5 DT" },
  ], status: "pending", total: "28.5 DT", cnam: true, avatar: "AB", urgent: false },
  { id: "ORD-2026-044", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", items: [
    { name: "Amlodipine 10mg", available: true, quantity: 30, price: "15 DT" },
  ], status: "pending", total: "15 DT", cnam: true, avatar: "FT", urgent: true },
  { id: "ORD-2026-043", patient: "Mohamed Sfar", doctor: "Dr. Hammami", date: "17 Fév", items: [
    { name: "Ibuprofène 400mg", available: true, quantity: 20, price: "6.8 DT" },
    { name: "Tramadol 50mg", available: true, quantity: 10, price: "11 DT" },
  ], status: "delivered", total: "17.8 DT", cnam: false, avatar: "MS", urgent: false },
  { id: "ORD-2026-042", patient: "Nadia Jemni", doctor: "Dr. Bouazizi", date: "15 Fév", items: [
    { name: "Ventoline 100µg", available: true, quantity: 1, price: "18 DT" },
  ], status: "delivered", total: "18 DT", cnam: true, avatar: "NJ", urgent: false },
  { id: "ORD-2026-041", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "14 Fév", items: [
    { name: "Paracétamol 1g", available: true, quantity: 16, price: "3.2 DT" },
    { name: "Amoxicilline 500mg", available: true, quantity: 24, price: "8.5 DT" },
  ], status: "delivered", total: "11.7 DT", cnam: true, avatar: "SA", urgent: false },
  { id: "ORD-2026-040", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "12 Fév", items: [
    { name: "Bisoprolol 5mg", available: true, quantity: 30, price: "11 DT" },
  ], status: "partial", total: "11 DT", cnam: true, avatar: "RM", urgent: false },
];

export const mockPharmacyHistory = [
  { id: "DEL-078", patient: "Sami Ayari", prescription: "ORD-2026-043", items: ["Ibuprofène 400mg", "Tramadol 50mg"], date: "20 Fév 2026", time: "14:30", pharmacist: "S. Maalej", amount: 35, cnam: true, avatar: "SA", type: "full" },
  { id: "DEL-077", patient: "Rania Meddeb", prescription: "ORD-2026-042", items: ["Ventoline 100µg"], date: "20 Fév 2026", time: "10:15", pharmacist: "A. Kchaou", amount: 22, cnam: true, avatar: "RM", type: "full" },
  { id: "DEL-076", patient: "Youssef Belhadj", prescription: "ORD-2026-040", items: ["Paracétamol 1g", "Oméprazole 20mg"], date: "19 Fév 2026", time: "16:45", pharmacist: "S. Maalej", amount: 18, cnam: false, avatar: "YB", type: "full" },
  { id: "DEL-075", patient: "Mohamed Sfar", prescription: "ORD-2026-038", items: ["Amoxicilline 500mg"], date: "18 Fév 2026", time: "09:00", pharmacist: "A. Kchaou", amount: 8.5, cnam: false, avatar: "MS", type: "full" },
  { id: "DEL-074", patient: "Amine Ben Ali", prescription: "ORD-2026-035", items: ["Metformine 850mg", "Glibenclamide 5mg"], date: "17 Fév 2026", time: "11:20", pharmacist: "S. Maalej", amount: 45, cnam: true, avatar: "AB", type: "full" },
  { id: "DEL-073", patient: "Fatma Trabelsi", prescription: "ORD-2026-033", items: ["Amlodipine 10mg", "Bisoprolol 5mg"], date: "16 Fév 2026", time: "15:30", pharmacist: "A. Kchaou", amount: 38, cnam: true, avatar: "FT", type: "partial" },
  { id: "DEL-072", patient: "Nadia Jemni", prescription: "ORD-2026-030", items: ["Doliprane 1g"], date: "15 Fév 2026", time: "10:00", pharmacist: "S. Maalej", amount: 4.5, cnam: true, avatar: "NJ", type: "full" },
  { id: "DEL-071", patient: "Karim Mansour", prescription: "ORD-2026-028", items: ["Augmentin 1g", "Nifuroxazide 200mg"], date: "14 Fév 2026", time: "14:15", pharmacist: "A. Kchaou", amount: 25, cnam: false, avatar: "KM", type: "full" },
];
