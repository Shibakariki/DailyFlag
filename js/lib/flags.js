/** Code ISO ("FR") → URL SVG (FlagCDN). */
export const flagUrl = code => `https://flagcdn.com/${code.toLowerCase()}.svg`;

/** Fallback emoji si le SVG ne charge pas. */
export const flagEmoji = code => String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));

/** HTML d'un drapeau en image SVG, avec fallback emoji en data-attribute. */
export function flagImgHTML(code, label, className = "") {
  const cls = className ? ` class="${className}"` : "";
  const alt = `Drapeau ${label}`;
  return `<img${cls} src="${flagUrl(code)}" alt="${alt}" loading="lazy" decoding="async" data-fallback="${flagEmoji(code)}">`;
}
