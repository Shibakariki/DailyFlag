// Niveaux de difficulté : facile (0), moyen (1), difficile (2, tout le reste).
const EASY = "FR IT DE JP IE BE NL CH ES GB US CA BR PT CN RU AU MX EG IN".split(" ");
const MEDIUM = "DK FI NO PL AT HU GR TR AR CL CO PE CU ZA NG MA DZ TN SN CI IL SA IR KR TH UA CZ SK HR RO BG IS NZ JM KE ET PK ID PH VN SG SE UY".split(" ");

export const TIER_LABELS = ["Facile", "Moyen", "Difficile"];

/** Composition du défi quotidien : [niveau, nombre de questions] */
export const DAILY_PLAN = [[0, 3], [1, 3], [2, 4]];

export const tierOf = code => EASY.includes(code) ? 0 : MEDIUM.includes(code) ? 1 : 2;
