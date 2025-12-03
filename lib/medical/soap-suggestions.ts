/**
 * SOAP Autocomplete Suggestions
 * Common medical terms and phrases for Indonesian clinical practice
 */

import { Suggestion } from "@/components/ui/autocomplete-textarea"

/**
 * Subjective (S) - Common Complaints
 */
export const SUBJECTIVE_SUGGESTIONS: Suggestion[] = [
  // Common Symptoms - Fever
  { value: "Pasien mengeluh demam sejak ", label: "Demam", category: "Keluhan Umum" },
  {
    value: "Demam tinggi disertai menggigil",
    label: "Demam tinggi + menggigil",
    category: "Demam",
  },
  { value: "Demam naik turun", label: "Demam naik turun", category: "Demam" },

  // Respiratory
  { value: "Batuk berdahak sejak ", label: "Batuk berdahak", category: "Respirasi" },
  { value: "Batuk kering tidak berdahak", label: "Batuk kering", category: "Respirasi" },
  { value: "Sesak napas", label: "Sesak napas", category: "Respirasi" },
  { value: "Pilek/hidung tersumbat", label: "Pilek", category: "Respirasi" },
  { value: "Nyeri tenggorokan saat menelan", label: "Nyeri tenggorokan", category: "Respirasi" },

  // Gastrointestinal
  { value: "Mual dan muntah", label: "Mual muntah", category: "Gastrointestinal" },
  { value: "Diare cair sejak ", label: "Diare", category: "Gastrointestinal" },
  { value: "Nyeri perut", label: "Nyeri perut", category: "Gastrointestinal" },
  { value: "Perut kembung", label: "Perut kembung", category: "Gastrointestinal" },
  { value: "Sulit buang air besar/konstipasi", label: "Konstipasi", category: "Gastrointestinal" },

  // Pain
  { value: "Nyeri kepala", label: "Nyeri kepala", category: "Nyeri" },
  { value: "Pusing berputar (vertigo)", label: "Vertigo", category: "Nyeri" },
  { value: "Nyeri sendi", label: "Nyeri sendi", category: "Nyeri" },
  { value: "Nyeri otot", label: "Nyeri otot", category: "Nyeri" },

  // Skin
  { value: "Gatal-gatal pada kulit", label: "Gatal-gatal", category: "Kulit" },
  { value: "Ruam kemerahan", label: "Ruam", category: "Kulit" },

  // General
  { value: "Lemas/tidak bertenaga", label: "Lemas", category: "Keluhan Umum" },
  { value: "Nafsu makan menurun", label: "Nafsu makan menurun", category: "Keluhan Umum" },
  { value: "Sulit tidur/insomnia", label: "Insomnia", category: "Keluhan Umum" },
]

/**
 * Objective (O) - Physical Examination
 */
export const OBJECTIVE_SUGGESTIONS: Suggestion[] = [
  // Vital Signs
  {
    value: "TD: 120/80 mmHg, Nadi: 80x/menit, Suhu: 36.5°C, RR: 20x/menit",
    label: "Vital signs normal",
    category: "Tanda Vital",
  },
  { value: "TD: ", label: "Tekanan darah", category: "Tanda Vital" },
  { value: "Nadi: ", label: "Nadi", category: "Tanda Vital" },
  { value: "Suhu: ", label: "Suhu", category: "Tanda Vital" },
  { value: "RR: ", label: "Respiratory rate", category: "Tanda Vital" },
  { value: "SpO2: ", label: "Saturasi oksigen", category: "Tanda Vital" },

  // General Appearance
  {
    value: "Keadaan umum: Baik, Kesadaran: Compos mentis",
    label: "Keadaan umum baik",
    category: "Keadaan Umum",
  },
  { value: "Tampak sakit sedang", label: "Tampak sakit sedang", category: "Keadaan Umum" },

  // Head & Neck
  {
    value: "Kepala/Leher: Konjungtiva anemis (-), Sklera ikterik (-)",
    label: "Kepala normal",
    category: "Kepala/Leher",
  },
  { value: "Faring hiperemis (+)", label: "Faring hiperemis", category: "Kepala/Leher" },
  { value: "Tonsil membesar T1-T1", label: "Tonsil T1-T1", category: "Kepala/Leher" },

  // Thorax
  {
    value: "Thorax: Simetris, Retraksi (-), Suara napas vesikuler, Ronkhi (-), Wheezing (-)",
    label: "Thorax normal",
    category: "Thorax",
  },
  { value: "Suara napas: Ronkhi (+)", label: "Ronkhi positif", category: "Thorax" },
  { value: "Suara napas: Wheezing (+)", label: "Wheezing positif", category: "Thorax" },

  // Cardiovascular
  {
    value: "Jantung: BJ I-II regular, Murmur (-), Gallop (-)",
    label: "Jantung normal",
    category: "Kardiovaskular",
  },

  // Abdomen
  {
    value: "Abdomen: Datar, Supel, BU (+) normal, Nyeri tekan (-)",
    label: "Abdomen normal",
    category: "Abdomen",
  },
  { value: "Nyeri tekan epigastrium (+)", label: "Nyeri tekan epigastrium", category: "Abdomen" },
  {
    value: "Hepatomegali (-), Splenomegali (-)",
    label: "Hepatosplenomegali (-)",
    category: "Abdomen",
  },

  // Extremities
  {
    value: "Ekstremitas: Akral hangat, CRT <2 detik, Edema (-)",
    label: "Ekstremitas normal",
    category: "Ekstremitas",
  },
  { value: "Edema pretibial (+/+)", label: "Edema pretibial", category: "Ekstremitas" },
]

/**
 * Assessment (A) - Common Diagnoses
 */
export const ASSESSMENT_SUGGESTIONS: Suggestion[] = [
  // Respiratory
  { value: "ISPA (Infeksi Saluran Pernapasan Atas)", label: "ISPA", category: "Respirasi" },
  { value: "Faringitis akut", label: "Faringitis", category: "Respirasi" },
  { value: "Tonsilitis akut", label: "Tonsilitis", category: "Respirasi" },
  { value: "Bronkitis akut", label: "Bronkitis", category: "Respirasi" },
  { value: "Pneumonia", label: "Pneumonia", category: "Respirasi" },
  { value: "Asma bronkial", label: "Asma", category: "Respirasi" },

  // Gastrointestinal
  { value: "Gastritis akut", label: "Gastritis", category: "Gastrointestinal" },
  { value: "Dispepsia", label: "Dispepsia", category: "Gastrointestinal" },
  { value: "Diare akut", label: "Diare akut", category: "Gastrointestinal" },
  { value: "Gastroenteritis akut", label: "Gastroenteritis", category: "Gastrointestinal" },

  // Infections
  { value: "Demam tifoid (tersangka)", label: "Demam tifoid", category: "Infeksi" },
  { value: "Dengue fever (tersangka)", label: "Dengue fever", category: "Infeksi" },
  { value: "Infeksi saluran kemih (ISK)", label: "ISK", category: "Infeksi" },

  // Skin
  { value: "Dermatitis kontak", label: "Dermatitis kontak", category: "Kulit" },
  { value: "Urtikaria", label: "Urtikaria", category: "Kulit" },
  { value: "Tinea corporis", label: "Tinea corporis", category: "Kulit" },

  // Musculoskeletal
  { value: "Myalgia", label: "Myalgia", category: "Muskuloskeletal" },
  { value: "Arthralgia", label: "Arthralgia", category: "Muskuloskeletal" },

  // Cardiovascular
  { value: "Hipertensi stage 1", label: "Hipertensi stage 1", category: "Kardiovaskular" },
  { value: "Hipertensi stage 2", label: "Hipertensi stage 2", category: "Kardiovaskular" },

  // Metabolic
  { value: "Diabetes Mellitus tipe 2", label: "DM tipe 2", category: "Metabolik" },
  { value: "Dislipidemia", label: "Dislipidemia", category: "Metabolik" },

  // Other
  { value: "Anemia", label: "Anemia", category: "Hematologi" },
  { value: "Vertigo perifer", label: "Vertigo perifer", category: "Neurologi" },
  { value: "Migrain", label: "Migrain", category: "Neurologi" },
  { value: "Tension headache", label: "Tension headache", category: "Neurologi" },
]

/**
 * Plan (P) - Treatment Plans
 */
export const PLAN_SUGGESTIONS: Suggestion[] = [
  // Pharmacotherapy
  { value: "Terapi: Lihat resep terlampir", label: "Terapi (lihat resep)", category: "Terapi" },
  { value: "Terapi simptomatis sesuai keluhan", label: "Terapi simptomatis", category: "Terapi" },

  // Patient Education
  { value: "Edukasi: Istirahat cukup 7-8 jam/hari", label: "Istirahat cukup", category: "Edukasi" },
  {
    value: "Edukasi: Minum air putih minimal 8 gelas/hari",
    label: "Minum air putih",
    category: "Edukasi",
  },
  {
    value: "Edukasi: Hindari makanan pedas dan asam",
    label: "Hindari makanan pedas",
    category: "Edukasi",
  },
  {
    value: "Edukasi: Konsumsi obat sesuai aturan pakai",
    label: "Konsumsi obat teratur",
    category: "Edukasi",
  },
  { value: "Edukasi: Diet rendah garam", label: "Diet rendah garam", category: "Edukasi" },
  { value: "Edukasi: Diet rendah lemak", label: "Diet rendah lemak", category: "Edukasi" },
  {
    value: "Edukasi: Olahraga teratur 30 menit/hari",
    label: "Olahraga teratur",
    category: "Edukasi",
  },

  // Follow-up
  {
    value: "Kontrol: 3 hari lagi jika keluhan tidak membaik",
    label: "Kontrol 3 hari",
    category: "Kontrol",
  },
  { value: "Kontrol: 7 hari lagi untuk evaluasi", label: "Kontrol 7 hari", category: "Kontrol" },
  { value: "Kontrol: 1 minggu untuk cek lab ulang", label: "Kontrol + lab", category: "Kontrol" },
  {
    value: "Kontrol: Segera ke IGD jika kondisi memburuk",
    label: "Kontrol segera jika memburuk",
    category: "Kontrol",
  },

  // Laboratory
  { value: "Pemeriksaan penunjang: Darah rutin", label: "Lab: Darah rutin", category: "Lab" },
  { value: "Pemeriksaan penunjang: Urinalisis", label: "Lab: Urinalisis", category: "Lab" },
  { value: "Pemeriksaan penunjang: GDS (Gula Darah Sewaktu)", label: "Lab: GDS", category: "Lab" },
  { value: "Pemeriksaan penunjang: GDP, GD2PP, HbA1c", label: "Lab: Profil gula", category: "Lab" },
  { value: "Pemeriksaan penunjang: Profil lipid", label: "Lab: Profil lipid", category: "Lab" },
  { value: "Pemeriksaan penunjang: Foto thorax", label: "Imaging: Foto thorax", category: "Lab" },

  // Referral
  {
    value: "Rujuk ke spesialis untuk evaluasi lebih lanjut",
    label: "Rujuk spesialis",
    category: "Rujukan",
  },
  {
    value: "Rujuk ke rumah sakit untuk perawatan intensif",
    label: "Rujuk RS",
    category: "Rujukan",
  },
]
