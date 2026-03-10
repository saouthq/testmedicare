/**
 * specialtyMedDB.ts — Specialty-specific medication databases, analysis suggestions, and favorites
 * Used by ActionDock to adapt the Rx and Labs columns per specialty.
 */

export interface MedItem { name: string; form: string; }
export interface RxFav { label: string; dosage: string; duration: string; instructions: string; }

// ── Base medications (généraliste) ──
export const baseMeds: MedItem[] = [
  { name: "Amoxicilline 500mg", form: "Gélule" },
  { name: "Amoxicilline 1g", form: "Comprimé" },
  { name: "Augmentin 1g/125mg", form: "Comprimé" },
  { name: "Voltarène 75mg", form: "Comprimé" },
  { name: "Ibuprofène 400mg", form: "Comprimé" },
  { name: "Oméprazole 20mg", form: "Gélule" },
  { name: "Metformine 850mg", form: "Comprimé" },
  { name: "Amlodipine 5mg", form: "Comprimé" },
  { name: "Losartan 50mg", form: "Comprimé" },
  { name: "Atorvastatine 20mg", form: "Comprimé" },
  { name: "Lévothyroxine 50µg", form: "Comprimé" },
  { name: "Prednisolone 20mg", form: "Comprimé" },
  { name: "Paracétamol 500mg", form: "Comprimé" },
  { name: "Tramadol 50mg", form: "Gélule" },
  { name: "Pantoprazole 40mg", form: "Comprimé" },
];

// ── Ophthalmology ──
export const ophtalmoMeds: MedItem[] = [
  { name: "Tobramycine 0.3% collyre", form: "Collyre" },
  { name: "Dexaméthasone 0.1% collyre", form: "Collyre" },
  { name: "Tobradex collyre", form: "Collyre" },
  { name: "Timolol 0.5% collyre", form: "Collyre" },
  { name: "Latanoprost 0.005% collyre", form: "Collyre" },
  { name: "Brimonidine 0.2% collyre", form: "Collyre" },
  { name: "Dorzolamide 2% collyre", form: "Collyre" },
  { name: "Ofloxacine 0.3% collyre", form: "Collyre" },
  { name: "Larmes artificielles hyaluroniques", form: "Collyre" },
  { name: "Ciclosporine 0.1% collyre", form: "Collyre" },
  { name: "Tropicamide 1% collyre", form: "Collyre" },
  { name: "Atropine 1% collyre", form: "Collyre" },
  { name: "Pilocarpine 2% collyre", form: "Collyre" },
  { name: "Kétorolac 0.5% collyre", form: "Collyre" },
  { name: "Vitamine A pommade ophtalmique", form: "Pommade" },
];
export const ophtalmoFavs: RxFav[] = [
  { label: "Tobradex 1gtt×4/j", dosage: "1 goutte 4 fois par jour dans l'œil atteint", duration: "7j", instructions: "Bien agiter avant usage. Espacer de 5 min avec autres collyres." },
  { label: "Larmes artificielles", dosage: "1 à 2 gouttes 4 à 6 fois par jour", duration: "1 mois", instructions: "À renouveler si besoin. Conserver au frais après ouverture." },
  { label: "Timolol 0.5%", dosage: "1 goutte matin et soir dans chaque œil", duration: "3 mois", instructions: "Comprimer le canthus interne 1 min après instillation." },
];
export const ophtalmoLabs: string[] = [
  "Champ visuel (Humphrey)", "OCT maculaire", "OCT papillaire RNFL", "Angiographie à la fluorescéine",
  "Topographie cornéenne", "Pachymétrie cornéenne", "Biométrie oculaire", "Échographie oculaire mode B",
  "Rétinographie", "Gonioscopie", "Test de Schirmer", "Glycémie à jeun (rétinopathie)",
];

// ── Cardiology ──
export const cardioMeds: MedItem[] = [
  { name: "Amlodipine 5mg", form: "Comprimé" },
  { name: "Amlodipine 10mg", form: "Comprimé" },
  { name: "Ramipril 5mg", form: "Comprimé" },
  { name: "Bisoprolol 5mg", form: "Comprimé" },
  { name: "Bisoprolol 2.5mg", form: "Comprimé" },
  { name: "Furosémide 40mg", form: "Comprimé" },
  { name: "Spironolactone 25mg", form: "Comprimé" },
  { name: "Clopidogrel 75mg", form: "Comprimé" },
  { name: "Aspirine 100mg", form: "Comprimé" },
  { name: "Rivaroxaban 20mg", form: "Comprimé" },
  { name: "Amiodarone 200mg", form: "Comprimé" },
  { name: "Atorvastatine 40mg", form: "Comprimé" },
  { name: "Sacubitril/Valsartan 97/103mg", form: "Comprimé" },
  { name: "Ivabradine 5mg", form: "Comprimé" },
  { name: "Ticagrelor 90mg", form: "Comprimé" },
  { name: "Trinitrine patch 10mg", form: "Patch" },
];
export const cardioFavs: RxFav[] = [
  { label: "Bisoprolol 5mg", dosage: "1 comprimé le matin", duration: "3 mois", instructions: "Ne pas arrêter brutalement. Surveillance FC." },
  { label: "Ramipril 5mg", dosage: "1 comprimé le matin", duration: "3 mois", instructions: "Contrôle créatinine + kaliémie à J15." },
  { label: "Aspirine 100mg", dosage: "1 comprimé au déjeuner", duration: "3 mois", instructions: "Associer IPP si facteurs de risque digestifs." },
];
export const cardioLabs: string[] = [
  "Troponine I/T", "BNP / NT-proBNP", "CPK-MB", "D-Dimères", "Bilan lipidique complet",
  "HbA1c", "Ionogramme sanguin", "Créatinine + DFG", "TSH", "Bilan hépatique",
  "NFS", "TP/INR", "ECG 12 dérivations", "Holter ECG 24h", "MAPA 24h",
  "Échocardiographie transthoracique", "Épreuve d'effort", "Coronarographie",
];

// ── Dermatology ──
export const dermatoMeds: MedItem[] = [
  { name: "Bétaméthasone 0.05% crème", form: "Crème" },
  { name: "Tacrolimus 0.1% pommade", form: "Pommade" },
  { name: "Adapalène 0.1% gel", form: "Gel" },
  { name: "Peroxyde de benzoyle 5% gel", form: "Gel" },
  { name: "Clindamycine 1% lotion", form: "Lotion" },
  { name: "Kétoconazole 2% crème", form: "Crème" },
  { name: "Méthotrexate 15mg", form: "Injectable" },
  { name: "Isotrétinoïne 20mg", form: "Capsule" },
  { name: "Ciclosporine 100mg", form: "Capsule" },
  { name: "Hydroxychloroquine 200mg", form: "Comprimé" },
  { name: "Antihistaminique (Cétirizine 10mg)", form: "Comprimé" },
  { name: "Émollient (Dexeryl)", form: "Crème" },
  { name: "Clobétasol 0.05% crème", form: "Crème" },
  { name: "Acide fusidique 2% crème", form: "Crème" },
];
export const dermatoLabs: string[] = [
  "Biopsie cutanée", "Dermatoscopie numérique", "Prélèvement mycologique",
  "IgE totales et spécifiques", "Patch tests allergologiques", "Bilan auto-immun (ANA, anti-ADN)",
  "NFS", "VS/CRP", "Bilan hépatique (avant isotrétinoïne)", "β-HCG (avant isotrétinoïne)",
];

// ── Pediatrics ──
export const pediatreMeds: MedItem[] = [
  { name: "Amoxicilline 250mg/5mL suspension", form: "Sirop" },
  { name: "Amoxicilline 500mg/5mL suspension", form: "Sirop" },
  { name: "Ibuprofène 100mg/5mL", form: "Sirop" },
  { name: "Paracétamol 120mg/5mL", form: "Sirop" },
  { name: "Paracétamol suppositoire 200mg", form: "Suppositoire" },
  { name: "Salbutamol 100µg aérosol", form: "Inhalateur" },
  { name: "Fluticasone 50µg spray nasal", form: "Spray" },
  { name: "Céfixime 40mg/5mL", form: "Sirop" },
  { name: "Azithromycine 200mg/5mL", form: "Sirop" },
  { name: "Desloratadine 2.5mg/5mL", form: "Sirop" },
  { name: "Fer (Ferrostrane)", form: "Sirop" },
  { name: "Vitamine D3 100 000 UI", form: "Ampoule" },
  { name: "Sérum physiologique", form: "Dosette" },
  { name: "Dompéridone 1mg/mL", form: "Sirop" },
];
export const pediatreFavs: RxFav[] = [
  { label: "Paracétamol sirop", dosage: "15mg/kg/prise toutes les 6h", duration: "5j", instructions: "Utiliser la pipette doseuse graduée en kg." },
  { label: "Amoxicilline sirop", dosage: "50mg/kg/j en 2 prises", duration: "7j", instructions: "Bien agiter avant usage. Conserver au réfrigérateur." },
  { label: "Vit D3 100 000 UI", dosage: "1 ampoule", duration: "Dose unique", instructions: "À renouveler tous les 3 mois de novembre à mars." },
];
export const pediatreLabs: string[] = [
  "NFS", "CRP", "Hémoculture", "ECBU", "Bandelette urinaire", "Glycémie",
  "Bilan martial (fer, ferritine)", "TSH néonatale", "Coproculture",
  "Test de diagnostic rapide (TDR) streptocoque", "Radiographie thoracique",
];

// ── Psychiatry ──
export const psychiatreMeds: MedItem[] = [
  { name: "Sertraline 50mg", form: "Comprimé" },
  { name: "Escitalopram 10mg", form: "Comprimé" },
  { name: "Fluoxétine 20mg", form: "Gélule" },
  { name: "Venlafaxine 75mg LP", form: "Gélule" },
  { name: "Mirtazapine 15mg", form: "Comprimé" },
  { name: "Alprazolam 0.25mg", form: "Comprimé" },
  { name: "Bromazépam 6mg", form: "Comprimé" },
  { name: "Hydroxyzine 25mg", form: "Comprimé" },
  { name: "Quétiapine 25mg", form: "Comprimé" },
  { name: "Olanzapine 5mg", form: "Comprimé" },
  { name: "Aripiprazole 10mg", form: "Comprimé" },
  { name: "Lithium 400mg LP", form: "Comprimé" },
  { name: "Valproate 500mg LP", form: "Comprimé" },
  { name: "Mélatonine 2mg LP", form: "Comprimé" },
  { name: "Zolpidem 10mg", form: "Comprimé" },
];
export const psychiatreFavs: RxFav[] = [
  { label: "Sertraline 50mg", dosage: "1 comprimé le matin au petit-déjeuner", duration: "1 mois", instructions: "Début progressif. RDV contrôle à J15. Ne pas arrêter brutalement." },
  { label: "Hydroxyzine 25mg SOS", dosage: "1 comprimé si anxiété aiguë (max 3/j)", duration: "1 mois", instructions: "Peut provoquer somnolence. Éviter conduite." },
];
export const psychiatreLabs: string[] = [
  "NFS", "Bilan hépatique", "Bilan rénal (créatinine, DFG)", "TSH", "Glycémie à jeun",
  "Lithiémie (si lithium)", "Bilan lipidique", "ECG (si neuroleptiques)", "Prolactinémie",
  "β-HCG (si femme en âge de procréer)", "Bilan psychométrique (PHQ-9, GAD-7)",
];

// ── ORL ──
export const orlMeds: MedItem[] = [
  { name: "Amoxicilline 1g", form: "Comprimé" },
  { name: "Amoxicilline-acide clavulanique 1g", form: "Comprimé" },
  { name: "Ofloxacine auriculaire", form: "Gouttes" },
  { name: "Ciprofloxacine auriculaire", form: "Gouttes" },
  { name: "Pseudoéphédrine/Ibuprofène", form: "Comprimé" },
  { name: "Mométasone spray nasal", form: "Spray" },
  { name: "Prednisone 20mg", form: "Comprimé" },
  { name: "Betahistine 24mg", form: "Comprimé" },
  { name: "Tanganil 500mg", form: "Comprimé" },
  { name: "Picloxydine auriculaire", form: "Gouttes" },
  { name: "Sérum physiologique hypertonique", form: "Spray nasal" },
];
export const orlLabs: string[] = [
  "Audiométrie tonale et vocale", "Impédancemétrie", "Potentiels évoqués auditifs",
  "TDM des sinus", "TDM des rochers", "IRM cérébrale (angle ponto-cérébelleux)",
  "Vidéonystagmographie", "Prélèvement bactériologique oreille", "Bilan allergologique",
  "Nasofibroscopie", "Laryngoscopie indirecte", "Polysomnographie",
];

// ── Neurology ──
export const neuroMeds: MedItem[] = [
  { name: "Lévétiracétam 500mg", form: "Comprimé" },
  { name: "Valproate 500mg", form: "Comprimé" },
  { name: "Carbamazépine 200mg", form: "Comprimé" },
  { name: "Gabapentine 300mg", form: "Gélule" },
  { name: "Prégabaline 75mg", form: "Gélule" },
  { name: "Sumatriptan 50mg", form: "Comprimé" },
  { name: "Topiramate 50mg", form: "Comprimé" },
  { name: "Levodopa/Carbidopa 250/25mg", form: "Comprimé" },
  { name: "Ropinirole 2mg", form: "Comprimé" },
  { name: "Donépézil 10mg", form: "Comprimé" },
  { name: "Mémantine 10mg", form: "Comprimé" },
  { name: "Interféron β-1a", form: "Injectable" },
  { name: "Baclofène 10mg", form: "Comprimé" },
];
export const neuroLabs: string[] = [
  "EEG standard", "EEG de sommeil", "IRM cérébrale", "IRM médullaire",
  "EMG / ENMG", "Potentiels évoqués visuels", "Potentiels évoqués somesthésiques",
  "Ponction lombaire", "Dosage antiépileptiques", "Bilan auto-immun (anti-MOG, anti-AQP4)",
  "Angiographie cérébrale", "Doppler transcrânien",
];

// ── Gynecology ──
export const gynecoMeds: MedItem[] = [
  { name: "Lévonorgestrel/Éthinylestradiol", form: "Comprimé" },
  { name: "Drospirénone/Éthinylestradiol", form: "Comprimé" },
  { name: "Étonogestrel implant", form: "Implant" },
  { name: "DIU cuivre", form: "Dispositif" },
  { name: "DIU hormonal (Mirena)", form: "Dispositif" },
  { name: "Progestérone 200mg", form: "Capsule" },
  { name: "Acide folique 5mg", form: "Comprimé" },
  { name: "Fer (Tardyferon 80mg)", form: "Comprimé" },
  { name: "Métronidazole 500mg", form: "Comprimé" },
  { name: "Fluconazole 150mg", form: "Gélule" },
  { name: "Ovule antifongique (Econazole)", form: "Ovule" },
  { name: "Misoprostol", form: "Comprimé" },
];
export const gynecoLabs: string[] = [
  "Frottis cervico-vaginal", "β-HCG quantitative", "Échographie pelvienne",
  "Échographie obstétricale", "Prélèvement vaginal", "Bilan hormonal (FSH, LH, E2)",
  "Prolactinémie", "Bilan thyroïdien", "Sérologies TORCH", "NFS",
  "Groupe sanguin + Rhésus", "RAI", "Test de O'Sullivan / HGPO",
  "Mammographie", "Biopsie endométriale",
];

// ── Dentistry ──
export const dentisteMeds: MedItem[] = [
  { name: "Amoxicilline 1g", form: "Comprimé" },
  { name: "Spiramycine/Métronidazole (Birodogyl)", form: "Comprimé" },
  { name: "Métronidazole 500mg", form: "Comprimé" },
  { name: "Clindamycine 300mg", form: "Gélule" },
  { name: "Ibuprofène 400mg", form: "Comprimé" },
  { name: "Paracétamol/Codéine", form: "Comprimé" },
  { name: "Chlorhexidine 0.12% bain de bouche", form: "Solution" },
  { name: "Hexétidine bain de bouche", form: "Solution" },
  { name: "Prednisone 20mg", form: "Comprimé" },
  { name: "Pansoral gel", form: "Gel buccal" },
];
export const dentisteFavs: RxFav[] = [
  { label: "Birodogyl 3×/j", dosage: "1 comprimé 3 fois par jour pendant les repas", duration: "7j", instructions: "Pas d'alcool pendant le traitement." },
  { label: "Ibuprofène 400mg", dosage: "1 comprimé 3 fois par jour après repas", duration: "5j", instructions: "Prendre avec un verre d'eau au milieu du repas." },
];

// ── Kinesitherapy ──
export const kineMeds: MedItem[] = [
  { name: "Paracétamol 1g", form: "Comprimé" },
  { name: "Ibuprofène 400mg", form: "Comprimé" },
  { name: "Kétoprofène gel", form: "Gel" },
  { name: "Thiocolchicoside 4mg", form: "Comprimé" },
  { name: "Méthocarbamol 750mg", form: "Comprimé" },
];

// ── Lookup functions ──
export function getSpecialtyMeds(activity: string, specialty?: string): MedItem[] {
  if (activity === "dentiste") return dentisteMeds;
  if (activity === "kine") return kineMeds;
  switch (specialty) {
    case "Ophtalmologue": return ophtalmoMeds;
    case "Cardiologue": return cardioMeds;
    case "Dermatologue": return dermatoMeds;
    case "Pédiatre": return pediatreMeds;
    case "Psychiatre": return psychiatreMeds;
    case "ORL": return orlMeds;
    case "Neurologue": return neuroMeds;
    case "Gynécologue": return gynecoMeds;
    default: return baseMeds;
  }
}

export function getSpecialtyFavs(activity: string, specialty?: string): RxFav[] {
  if (activity === "dentiste") return dentisteFavs;
  switch (specialty) {
    case "Ophtalmologue": return ophtalmoFavs;
    case "Cardiologue": return cardioFavs;
    case "Pédiatre": return pediatreFavs;
    case "Psychiatre": return psychiatreFavs;
    default: return [];
  }
}

export function getSpecialtyLabs(activity: string, specialty?: string): string[] {
  if (activity === "dentiste") return ["Panoramique dentaire", "Rétro-alvéolaire", "CBCT (Cone Beam)", "Bilan sanguin pré-opératoire", "Bilan de coagulation"];
  if (activity === "kine") return ["Radiographie", "IRM", "Échographie musculo-squelettique", "EMG"];
  switch (specialty) {
    case "Ophtalmologue": return ophtalmoLabs;
    case "Cardiologue": return cardioLabs;
    case "Dermatologue": return dermatoLabs;
    case "Pédiatre": return pediatreLabs;
    case "Psychiatre": return psychiatreLabs;
    case "ORL": return orlLabs;
    case "Neurologue": return neuroLabs;
    case "Gynécologue": return gynecoLabs;
    default: return [];
  }
}
