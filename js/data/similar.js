import { COUNTRIES } from "./countries.js";

// Familles de drapeaux qui se ressemblent : servent à choisir les mauvaises réponses.
// Un pays peut appartenir à plusieurs familles. Pour ajouter une famille : une ligne.
const FAMILIES = [
  "FR IT IE BE CI NG ML GN SN CM TD RO AD MD NE IN",
  "NL LU RU SI SK HR RS PY AM",
  "ID MC PL SG",
  "SE NO DK FI IS",
  "US LR MY CU SG",
  "GB AU NZ FJ TV",
  "GH SN ET BO GN ML CM BF",
  "EG SY IQ YE SD LY KW JO PS AE",
  "AR UY HN SV NI GT CR",
  "TR TN PK DZ MR AZ UZ MV MY",
  "CO EC VE",
  "LT LV EE AT PE",
  "DE BE UG GA",
  "BD JP PW",
  "CR TH PY",
  "CA PE AT LV",
  "HT LI",
  "CZ PL PH",
  "BG HU IT LT",
  "KG KZ",
  "BF GH GW",
  "RO MD AD",
  "TD CM",
  "ST GQ",
  "SO TW",
  "GM TZ",
  "LB MA",
  "MG IN",
  "CN VN",
  "BA KZ",
  "ZW ZM SD",
].map(f => f.split(" ").filter(c => COUNTRIES[c]));

/** Codes des pays dont le drapeau ressemble à celui de `code`. */
export const similarTo = code => [...new Set(FAMILIES.filter(f => f.includes(code)).flat())].filter(c => c !== code);
