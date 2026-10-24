/** Code pays ISO ("FR") → emoji drapeau (🇫🇷), via les « regional indicators » Unicode. */
export const flagOf = code => String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
