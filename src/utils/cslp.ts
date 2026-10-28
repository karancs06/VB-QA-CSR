/**
 * Returns only the Live Preview edit-tag attributes from an entry field's `$`
 * object. `addEditableTags` (from `@contentstack/utils`) only ever emits
 * `data-cslp` and `data-cslp-parent-field` — both inert `data-*` attributes.
 *
 * Spreading the raw `$` object (`{...entry.$.field}`) flags as DOM-XSS in static
 * analysis because an object derived from fetched content is spread as arbitrary
 * JSX attributes. Whitelisting the known `data-cslp*` keys is behaviourally
 * identical for the Visual Builder edit overlay (it keys off `data-cslp`) while
 * provably carrying no event handlers or other dangerous attributes.
 */
const CSLP_ATTRS = ["data-cslp", "data-cslp-parent-field"] as const;

// `tag` is the entry field's `$` value. The CSR types declare it loosely
// (often `string`), but at runtime `addEditableTags` makes it an attribute
// object — so accept `unknown` and guard, instead of casting at each call site.
export const cslp = (tag?: unknown): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!tag || typeof tag !== "object") return out;
  const obj = tag as Record<string, unknown>;
  for (const key of CSLP_ATTRS) {
    if (typeof obj[key] === "string") out[key] = obj[key] as string;
  }
  return out;
};
