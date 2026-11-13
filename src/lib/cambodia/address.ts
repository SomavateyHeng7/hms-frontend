/**
 * Cambodian administrative areas: Province (Khaet) or Capital → District (Srok / Khan / Krong)
 * → Commune (Khum / Sangkat) → Village (Phum).
 *
 * SAMPLE DATA ONLY: four provinces with a few districts and communes, enough for the
 * prototype. The ids are placeholders, not official codes. Replace this file with the full
 * national gazetteer (official codes, all 25 provinces, villages) before a pilot; the form
 * and the patient record only store ids, so nothing else needs to change.
 * Khmer spellings should be checked by a Khmer-speaking reviewer.
 */

export interface AdminArea {
  id: string;
  nameEn: string;
  nameKm: string;
}

export type Commune = AdminArea;

export interface District extends AdminArea {
  communes: Commune[];
}

export interface Province extends AdminArea {
  districts: District[];
}

export const PROVINCES: Province[] = [
  {
    id: "phnom-penh",
    nameEn: "Phnom Penh",
    nameKm: "ភ្នំពេញ",
    districts: [
      {
        id: "pp-chamkar-mon",
        nameEn: "Chamkar Mon",
        nameKm: "ចំការមន",
        communes: [
          { id: "pp-cm-tonle-basak", nameEn: "Tonle Basak", nameKm: "ទន្លេបាសាក់" },
          { id: "pp-cm-tuol-tumpung-1", nameEn: "Tuol Tumpung Ti Muoy", nameKm: "ទួលទំពូងទី១" },
          { id: "pp-cm-phsar-daeum-thkov", nameEn: "Phsar Daeum Thkov", nameKm: "ផ្សារដើមថ្កូវ" },
        ],
      },
      {
        id: "pp-boeng-keng-kang",
        nameEn: "Boeng Keng Kang",
        nameKm: "បឹងកេងកង",
        communes: [
          { id: "pp-bkk-bkk-1", nameEn: "Boeng Keng Kang Ti Muoy", nameKm: "បឹងកេងកងទី១" },
          { id: "pp-bkk-olympic", nameEn: "Olympic", nameKm: "អូឡាំពិក" },
        ],
      },
      {
        id: "pp-daun-penh",
        nameEn: "Daun Penh",
        nameKm: "ដូនពេញ",
        communes: [
          { id: "pp-dp-phsar-thmei-1", nameEn: "Phsar Thmei Ti Muoy", nameKm: "ផ្សារថ្មីទី១" },
          { id: "pp-dp-wat-phnum", nameEn: "Wat Phnum", nameKm: "វត្តភ្នំ" },
          { id: "pp-dp-chey-chumneah", nameEn: "Chey Chumneah", nameKm: "ជ័យជំនះ" },
        ],
      },
      {
        id: "pp-tuol-kouk",
        nameEn: "Tuol Kouk",
        nameKm: "ទួលគោក",
        communes: [
          { id: "pp-tk-boeng-kak-1", nameEn: "Boeng Kak Ti Muoy", nameKm: "បឹងកក់ទី១" },
          { id: "pp-tk-tuek-laak-1", nameEn: "Tuek L'ak Ti Muoy", nameKm: "ទឹកល្អក់ទី១" },
        ],
      },
      {
        id: "pp-sen-sok",
        nameEn: "Sen Sok",
        nameKm: "សែនសុខ",
        communes: [
          { id: "pp-ss-tuek-thla", nameEn: "Tuek Thla", nameKm: "ទឹកថ្លា" },
          { id: "pp-ss-khmuonh", nameEn: "Khmuonh", nameKm: "ឃ្មួញ" },
        ],
      },
    ],
  },
  {
    id: "kandal",
    nameEn: "Kandal",
    nameKm: "កណ្ដាល",
    districts: [
      {
        id: "kd-ta-khmau",
        nameEn: "Ta Khmau",
        nameKm: "តាខ្មៅ",
        communes: [
          { id: "kd-tk-ta-khmau", nameEn: "Ta Khmau", nameKm: "តាខ្មៅ" },
          { id: "kd-tk-preaek-ruessei", nameEn: "Preaek Ruessei", nameKm: "ព្រែកឫស្សី" },
        ],
      },
      {
        id: "kd-kien-svay",
        nameEn: "Kien Svay",
        nameKm: "កៀនស្វាយ",
        communes: [
          { id: "kd-ks-kokir", nameEn: "Kokir", nameKm: "គគីរ" },
          { id: "kd-ks-banteay-daek", nameEn: "Banteay Daek", nameKm: "បន្ទាយដែក" },
        ],
      },
    ],
  },
  {
    id: "siem-reap",
    nameEn: "Siem Reap",
    nameKm: "សៀមរាប",
    districts: [
      {
        id: "sr-siem-reap",
        nameEn: "Siem Reap",
        nameKm: "សៀមរាប",
        communes: [
          { id: "sr-sr-svay-dankum", nameEn: "Svay Dankum", nameKm: "ស្វាយដង្គំ" },
          { id: "sr-sr-sala-kamraeuk", nameEn: "Sala Kamraeuk", nameKm: "សាលាកំរើក" },
          { id: "sr-sr-sla-kram", nameEn: "Sla Kram", nameKm: "ស្លក្រាម" },
        ],
      },
    ],
  },
  {
    id: "battambang",
    nameEn: "Battambang",
    nameKm: "បាត់ដំបង",
    districts: [
      {
        id: "bb-battambang",
        nameEn: "Battambang",
        nameKm: "បាត់ដំបង",
        communes: [
          { id: "bb-bb-svay-pao", nameEn: "Svay Pao", nameKm: "ស្វាយប៉ោ" },
          { id: "bb-bb-rottanak", nameEn: "Rotanak", nameKm: "រតនៈ" },
          { id: "bb-bb-tuol-ta-aek", nameEn: "Tuol Ta Aek", nameKm: "ទួលតាឯក" },
        ],
      },
    ],
  },
];

export function getProvince(id?: string) {
  return PROVINCES.find((p) => p.id === id);
}

export function getDistrict(provinceId?: string, districtId?: string) {
  return getProvince(provinceId)?.districts.find((d) => d.id === districtId);
}

export function getCommune(provinceId?: string, districtId?: string, communeId?: string) {
  return getDistrict(provinceId, districtId)?.communes.find((c) => c.id === communeId);
}

/** "Tonle Basak, Chamkar Mon, Phnom Penh" (most specific first). Unknown parts are skipped. */
export function formatAddressEn(a: { provinceId: string; districtId: string; communeId: string; village?: string }) {
  return [
    a.village,
    getCommune(a.provinceId, a.districtId, a.communeId)?.nameEn,
    getDistrict(a.provinceId, a.districtId)?.nameEn,
    getProvince(a.provinceId)?.nameEn,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatAddressKm(a: { provinceId: string; districtId: string; communeId: string; village?: string }) {
  return [
    a.village,
    getCommune(a.provinceId, a.districtId, a.communeId)?.nameKm,
    getDistrict(a.provinceId, a.districtId)?.nameKm,
    getProvince(a.provinceId)?.nameKm,
  ]
    .filter(Boolean)
    .join(" ");
}
