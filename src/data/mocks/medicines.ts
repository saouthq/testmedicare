/**
 * Mock data — Medicines directory (SEO)
 */

export interface MockMedicine {
  id: string;
  name: string;
  slug: string;
  dosage: string;
  form: string;
  category: string;
  summary: string;
  indications: string[];
  dosageText: string;
  contraindications: string[];
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
  pregnancyInfo: string;
  storage: string;
  faq: { q: string; a: string }[];
  similarSlugs: string[];
}

export const mockMedicines: MockMedicine[] = [
  {
    id: "med-1", name: "Doliprane", slug: "doliprane-1000", dosage: "1000 mg", form: "Comprimé", category: "Antalgique",
    summary: "Le Doliprane 1000 mg est un médicament antalgique et antipyrétique contenant du paracétamol, utilisé pour le traitement des douleurs légères à modérées et de la fièvre.",
    indications: ["Douleurs d'intensité légère à modérée", "Fièvre", "Maux de tête", "Douleurs dentaires", "Courbatures", "Douleurs articulaires"],
    dosageText: "Adultes et enfants de plus de 50 kg : 1 comprimé (1000 mg) par prise, à renouveler si nécessaire au bout de 6 heures minimum. Ne pas dépasser 3 comprimés par jour (3000 mg).",
    contraindications: ["Allergie au paracétamol", "Insuffisance hépatique sévère", "Phénylcétonurie (pour les formes contenant de l'aspartam)"],
    sideEffects: ["Réactions allergiques cutanées (rares)", "Thrombocytopénie (très rare)", "Anomalies hépatiques en cas de surdosage"],
    interactions: ["Anticoagulants oraux (warfarine) : surveillance accrue", "Résines chélatrices : prendre à 2h d'intervalle"],
    warnings: ["Ne pas dépasser la dose recommandée", "En cas de surdosage, consulter immédiatement un médecin", "Éviter l'association avec d'autres médicaments contenant du paracétamol"],
    pregnancyInfo: "Peut être utilisé pendant la grossesse si nécessaire, à la dose efficace la plus faible et pendant la durée la plus courte possible.",
    storage: "Conserver à une température ne dépassant pas 30°C, à l'abri de l'humidité.",
    faq: [
      { q: "Peut-on prendre Doliprane avec un anti-inflammatoire ?", a: "Oui, le paracétamol peut être associé à un anti-inflammatoire non stéroïdien (AINS) comme l'ibuprofène, mais demandez conseil à votre médecin." },
      { q: "Peut-on donner Doliprane 1000 à un enfant ?", a: "Non, le Doliprane 1000 mg est réservé aux adultes et enfants de plus de 50 kg. Utilisez les formes pédiatriques adaptées au poids de l'enfant." },
    ],
    similarSlugs: ["efferalgan-1000", "paracetamol-biogaran-1000"],
  },
  {
    id: "med-2", name: "Efferalgan", slug: "efferalgan-1000", dosage: "1000 mg", form: "Comprimé effervescent", category: "Antalgique",
    summary: "Efferalgan 1000 mg est un médicament à base de paracétamol sous forme effervescente, utilisé pour soulager la douleur et faire baisser la fièvre.",
    indications: ["Douleurs légères à modérées", "Fièvre", "Maux de tête", "États grippaux"],
    dosageText: "1 comprimé par prise, à dissoudre dans un grand verre d'eau. Espacer les prises de 6 heures minimum. Maximum 3 comprimés par jour.",
    contraindications: ["Allergie au paracétamol", "Insuffisance hépatique"],
    sideEffects: ["Réactions cutanées allergiques (rare)", "Troubles hépatiques en cas de surdosage"],
    interactions: ["Anticoagulants oraux"],
    warnings: ["Ne pas dépasser la dose prescrite", "Contient du sodium : à prendre en compte pour les régimes sans sel"],
    pregnancyInfo: "Utilisation possible pendant la grossesse sous avis médical.",
    storage: "Conserver dans un endroit sec, à température ambiante.",
    faq: [{ q: "Peut-on le prendre à jeun ?", a: "Oui, l'Efferalgan peut être pris en dehors des repas sans problème." }],
    similarSlugs: ["doliprane-1000", "paracetamol-biogaran-1000"],
  },
  {
    id: "med-3", name: "Augmentin", slug: "augmentin-1g", dosage: "1g/125mg", form: "Comprimé pelliculé", category: "Antibiotique",
    summary: "Augmentin est un antibiotique associant amoxicilline et acide clavulanique, utilisé pour traiter les infections bactériennes.",
    indications: ["Infections ORL (sinusite, otite)", "Infections respiratoires basses", "Infections urinaires", "Infections cutanées"],
    dosageText: "1 comprimé 2 fois par jour pendant 7 à 10 jours selon la prescription médicale. Prendre au début des repas.",
    contraindications: ["Allergie aux pénicillines ou aux céphalosporines", "Antécédents d'ictère lié à l'amoxicilline", "Mononucléose infectieuse"],
    sideEffects: ["Diarrhée", "Nausées et vomissements", "Éruptions cutanées", "Candidose"],
    interactions: ["Méthotrexate : risque de toxicité accrue", "Anticoagulants oraux : surveillance de l'INR"],
    warnings: ["Toujours terminer le traitement prescrit", "Risque de résistance bactérienne en cas de mauvais usage"],
    pregnancyInfo: "L'utilisation est possible pendant la grossesse si le bénéfice attendu justifie le risque potentiel.",
    storage: "Conserver à température ambiante, à l'abri de l'humidité.",
    faq: [{ q: "Faut-il le prendre pendant ou en dehors des repas ?", a: "Il est recommandé de prendre Augmentin au début des repas pour limiter les troubles digestifs." }],
    similarSlugs: ["amoxicilline-1g"],
  },
  {
    id: "med-4", name: "Amoxicilline", slug: "amoxicilline-1g", dosage: "1g", form: "Gélule", category: "Antibiotique",
    summary: "L'amoxicilline est un antibiotique de la famille des pénicillines utilisé pour traiter un large éventail d'infections bactériennes.",
    indications: ["Angines", "Otites", "Sinusites", "Bronchites", "Infections urinaires non compliquées"],
    dosageText: "1 gélule (1g) 2 à 3 fois par jour pendant 5 à 7 jours selon prescription.",
    contraindications: ["Allergie aux pénicillines", "Mononucléose infectieuse"],
    sideEffects: ["Diarrhée", "Éruption cutanée", "Nausées"],
    interactions: ["Méthotrexate", "Allopurinol (risque accru d'éruption cutanée)"],
    warnings: ["Ne pas interrompre le traitement prématurément"],
    pregnancyInfo: "Utilisable pendant la grossesse sous avis médical.",
    storage: "Conserver en dessous de 25°C.",
    faq: [{ q: "Peut-on boire de l'alcool avec ce traitement ?", a: "Il est déconseillé de consommer de l'alcool pendant un traitement antibiotique." }],
    similarSlugs: ["augmentin-1g"],
  },
  {
    id: "med-5", name: "Voltarène", slug: "voltarene-75", dosage: "75 mg", form: "Comprimé gastro-résistant", category: "Anti-inflammatoire",
    summary: "Voltarène 75 mg est un anti-inflammatoire non stéroïdien (AINS) à base de diclofénac, utilisé pour soulager douleurs et inflammations.",
    indications: ["Douleurs rhumatismales", "Arthrose", "Polyarthrite rhumatoïde", "Douleurs post-opératoires", "Dysménorrhée"],
    dosageText: "1 comprimé 2 fois par jour pendant les repas. Durée la plus courte possible.",
    contraindications: ["Ulcère gastroduodénal", "Insuffisance cardiaque sévère", "Grossesse (3ème trimestre)", "Allergie aux AINS"],
    sideEffects: ["Douleurs gastriques", "Nausées", "Vertiges", "Céphalées", "Élévation de la pression artérielle"],
    interactions: ["Anticoagulants", "Lithium", "Methotrexate", "Autres AINS"],
    warnings: ["Prendre pendant les repas", "Risque cardiovasculaire accru en cas d'utilisation prolongée"],
    pregnancyInfo: "Contre-indiqué à partir du 6ème mois de grossesse. Déconseillé avant.",
    storage: "Conserver à température ambiante, à l'abri de la lumière.",
    faq: [{ q: "Peut-on appliquer un gel Voltarène en même temps ?", a: "Il est déconseillé d'associer la forme orale et topique sans avis médical." }],
    similarSlugs: ["ibuprofene-400"],
  },
  {
    id: "med-6", name: "Ibuprofène", slug: "ibuprofene-400", dosage: "400 mg", form: "Comprimé pelliculé", category: "Anti-inflammatoire",
    summary: "L'ibuprofène 400 mg est un anti-inflammatoire non stéroïdien (AINS) utilisé pour traiter la douleur, la fièvre et l'inflammation.",
    indications: ["Douleurs légères à modérées", "Fièvre", "Douleurs articulaires", "Douleurs dentaires", "Règles douloureuses"],
    dosageText: "1 comprimé toutes les 6 à 8 heures. Maximum 3 comprimés par jour. Prendre pendant les repas.",
    contraindications: ["Ulcère gastrique actif", "Insuffisance rénale sévère", "Grossesse (3ème trimestre)"],
    sideEffects: ["Troubles gastriques", "Nausées", "Vertiges"],
    interactions: ["Aspirine", "Anticoagulants", "Lithium"],
    warnings: ["Ne pas prendre avec d'autres AINS"],
    pregnancyInfo: "Contre-indiqué au 3ème trimestre.",
    storage: "Conserver à température ambiante.",
    faq: [{ q: "Quelle différence avec le paracétamol ?", a: "L'ibuprofène est un anti-inflammatoire, le paracétamol est un antalgique pur. L'ibuprofène agit aussi sur l'inflammation." }],
    similarSlugs: ["voltarene-75"],
  },
  {
    id: "med-7", name: "Oméprazole", slug: "omeprazole-20", dosage: "20 mg", form: "Gélule gastro-résistante", category: "Gastro-entérologie",
    summary: "L'oméprazole est un inhibiteur de la pompe à protons (IPP) utilisé pour réduire la production d'acide gastrique.",
    indications: ["Reflux gastro-œsophagien (RGO)", "Ulcère gastrique et duodénal", "Syndrome de Zollinger-Ellison", "Prévention des lésions gastriques sous AINS"],
    dosageText: "1 gélule par jour, le matin à jeun, pendant 4 à 8 semaines selon l'indication.",
    contraindications: ["Allergie à l'oméprazole ou aux IPP"],
    sideEffects: ["Céphalées", "Diarrhée", "Douleurs abdominales", "Constipation"],
    interactions: ["Clopidogrel (efficacité réduite)", "Méthotrexate"],
    warnings: ["Utilisation prolongée : risque de carence en magnésium et vitamine B12"],
    pregnancyInfo: "À utiliser avec prudence pendant la grossesse.",
    storage: "Conserver à température ambiante, à l'abri de l'humidité.",
    faq: [{ q: "Peut-on prendre l'oméprazole au long cours ?", a: "L'utilisation prolongée doit être réévaluée régulièrement par votre médecin en raison de risques potentiels." }],
    similarSlugs: ["pantoprazole-40"],
  },
  {
    id: "med-8", name: "Pantoprazole", slug: "pantoprazole-40", dosage: "40 mg", form: "Comprimé gastro-résistant", category: "Gastro-entérologie",
    summary: "Le pantoprazole est un inhibiteur de la pompe à protons (IPP) utilisé pour traiter les affections liées à l'excès d'acide gastrique.",
    indications: ["Reflux gastro-œsophagien", "Œsophagite par reflux", "Ulcère gastroduodénal"],
    dosageText: "1 comprimé par jour avant le petit-déjeuner. Durée selon prescription.",
    contraindications: ["Allergie au pantoprazole"],
    sideEffects: ["Céphalées", "Diarrhée", "Flatulences"],
    interactions: ["Atazanavir", "Méthotrexate"],
    warnings: ["Ne pas écraser ni mâcher le comprimé"],
    pregnancyInfo: "Utilisation possible si nécessaire, sous avis médical.",
    storage: "Conserver à l'abri de la lumière et de l'humidité.",
    faq: [{ q: "Quelle différence avec l'oméprazole ?", a: "Les deux sont des IPP avec une efficacité similaire. Le pantoprazole a moins d'interactions médicamenteuses." }],
    similarSlugs: ["omeprazole-20"],
  },
  {
    id: "med-9", name: "Paracétamol Biogaran", slug: "paracetamol-biogaran-1000", dosage: "1000 mg", form: "Comprimé", category: "Antalgique",
    summary: "Générique du paracétamol, utilisé pour le traitement symptomatique de la douleur et de la fièvre.",
    indications: ["Douleurs", "Fièvre", "Maux de tête"],
    dosageText: "1 comprimé par prise, maximum 3 par jour. Intervalle minimum de 6 heures entre les prises.",
    contraindications: ["Allergie au paracétamol", "Insuffisance hépatique"],
    sideEffects: ["Réactions allergiques (rares)"],
    interactions: ["Anticoagulants oraux"],
    warnings: ["Ne pas associer avec d'autres médicaments contenant du paracétamol"],
    pregnancyInfo: "Utilisable pendant la grossesse.",
    storage: "Conserver à température ambiante.",
    faq: [{ q: "Est-ce le même que le Doliprane ?", a: "Oui, c'est le même principe actif (paracétamol) mais sous un autre nom de marque." }],
    similarSlugs: ["doliprane-1000", "efferalgan-1000"],
  },
  {
    id: "med-10", name: "Levothyrox", slug: "levothyrox-100", dosage: "100 µg", form: "Comprimé sécable", category: "Endocrinologie",
    summary: "Levothyrox est un médicament contenant de la lévothyroxine, hormone thyroïdienne de synthèse utilisée dans le traitement de l'hypothyroïdie.",
    indications: ["Hypothyroïdie", "Goitre euthyroïdien", "Après thyroïdectomie", "Cancer thyroïdien (traitement substitutif)"],
    dosageText: "La dose est strictement individuelle, adaptée selon le bilan thyroïdien (TSH). Prendre le matin à jeun, 30 minutes avant le petit-déjeuner.",
    contraindications: ["Thyrotoxicose non traitée", "Insuffisance surrénalienne non corrigée", "Infarctus du myocarde récent"],
    sideEffects: ["Palpitations (si surdosage)", "Tremblements", "Insomnie", "Perte de poids (si dose trop élevée)"],
    interactions: ["Fer, calcium, antiacides : prendre à 2h d'intervalle", "Anticoagulants oraux"],
    warnings: ["Ne jamais modifier la dose sans avis médical", "Contrôle de la TSH tous les 6 à 12 mois"],
    pregnancyInfo: "Indispensable de poursuivre le traitement pendant la grossesse, avec surveillance et adaptation de la dose.",
    storage: "Conserver à l'abri de la lumière et de l'humidité, à température ambiante.",
    faq: [{ q: "Pourquoi faut-il le prendre à jeun ?", a: "L'absorption de la lévothyroxine est meilleure à jeun. Les aliments et certains médicaments réduisent son absorption." }],
    similarSlugs: [],
  },
];

export const mockTopMedicines = mockMedicines.slice(0, 6).map(m => ({
  id: m.id, name: m.name, slug: m.slug, form: m.form,
}));
