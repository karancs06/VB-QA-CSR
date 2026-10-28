import SDK, { type ReferenceCondition } from "../sdk/entry";

// Matches the preview_url_config structure from Visual Builder
export interface IncludeOnlyConfig {
  include: string[] | null;
  only: Record<string, string[]> | null;
}

export interface PathPattern {
  name: string;
  pattern: string;
  content_types: string[];
  branches: string[];
  include_only?: Record<string, IncludeOnlyConfig>;
}

export interface HostPattern {
  pattern: string;
  alias?: string;
}

export interface CustomUrlConfig {
  host_patterns?: HostPattern[];
  path_patterns: PathPattern[];
  enabled?: boolean;
}

export interface FieldValue {
  fieldPath: string; // e.g. "url_slug" or "reference.nested_url_slug"
  value: string;
  verified: boolean;
}

export interface ResolutionResult {
  matchedPattern: PathPattern;
  contentTypeUid: string;
  entry: Record<string, any>;
  fieldValues: FieldValue[];
}

// Split a host pattern URL (e.g. "http://localhost:3006/{{locale}}") into its
// origin ("http://localhost:3006") and path prefix ("/{{locale}}").
function parseHostPattern(pattern: string): {
  origin: string;
  pathPrefix: string;
} {
  const afterScheme = pattern.indexOf("//") + 2;
  const slashAfterHost = pattern.indexOf("/", afterScheme);
  if (slashAfterHost === -1) return { origin: pattern, pathPrefix: "" };
  return {
    origin: pattern.slice(0, slashAfterHost),
    pathPrefix: pattern.slice(slashAfterHost),
  };
}

// Convert a path prefix containing {{placeholder}} tokens into a prefix-anchored regex.
// Each {{…}} becomes a single-segment capture group ([^/]+).
// Literal parts are regex-escaped so characters like . or + in the prefix are safe.
function pathPrefixToRegex(pathPrefix: string): RegExp {
  const parts = pathPrefix.split(/(\{\{[^}]+\}\})/);
  const regexStr = parts
    .map((part) =>
      part.startsWith("{{")
        ? "([^/]+)"
        : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
  return new RegExp(`^${regexStr}(?=/|$)`);
}

// Given the current pathname and the config's host_patterns, determine which path
// segment to match against path_patterns and what locale (if any) was encoded in
// the host pattern.  Falls back to the full pathname with no locale if nothing matches.
function extractPathFromUrl(
  pathname: string,
  hostPatterns: HostPattern[],
  currentOrigin: string,
): { path: string; locale: string | null } {
  for (const hp of hostPatterns) {
    const { origin, pathPrefix } = parseHostPattern(hp.pattern);
    if (origin !== currentOrigin) continue;
    if (!pathPrefix) return { path: pathname, locale: null };

    const prefixRegex = pathPrefixToRegex(pathPrefix);
    const m = pathname.match(prefixRegex);
    if (!m) continue;

    const locale = m[1] ?? null;
    const path = pathname.slice(m[0].length) || "/";
    return { path, locale };
  }
  return { path: pathname, locale: null };
}

// Extract {{entry.X}} placeholder field paths from a pattern string.
// Returns them in order of appearance.
function extractPlaceholders(pattern: string): string[] {
  const regex = /\{\{entry\.([^}]+)\}\}/g;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(pattern)) !== null) {
    paths.push(match[1]); // strip "entry." prefix
  }
  return paths;
}

// Convert a path pattern string into a full-match regex.
// Each {{entry.X}} placeholder becomes a ([^/]+) capture group.
// The result anchors start/end so segment counts must match exactly.
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/\{\{entry\.[^}]+\}\}/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

// Safely traverse a dot-separated path on an object.
// Handles both plain objects and single-entry arrays at each step.
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((cur, key) => {
    if (cur == null) return undefined;
    const val = Array.isArray(cur) ? cur[0]?.[key] : cur[key];
    return val;
  }, obj as any);
}

// Determine candidate content types to query for a matched pattern.
// Prefer CTs whose include_only.only.BASE contains the primary field —
// this avoids sending queries to CTs that don't have that field. When the
// pattern has no include_only (the common simple-field case), fall back to the
// pattern's declared content_types so those patterns still resolve. "$all" can't
// be enumerated here, so it's skipped (render-tier specs target concrete CTs).
function getCandidateCTs(pattern: PathPattern, primaryField: string): string[] {
  const includeOnly = pattern.include_only ?? {};
  const includeOnlyCTs = Object.keys(includeOnly);

  if (includeOnlyCTs.length > 0) {
    const filtered = includeOnlyCTs.filter((ct) => {
      const baseFields = includeOnly[ct]?.only?.BASE ?? [];
      return baseFields.includes(primaryField);
    });
    return filtered.length > 0 ? filtered : includeOnlyCTs;
  }

  return (pattern.content_types ?? []).filter((ct) => ct !== "$all");
}

// Split non-primary field values into reference conditions (queryable via referenceIn)
// and inline nested fields (verified client-side after fetch).
// A field is a reference if its first path segment appears in includeOnly.include.
function classifyFieldValues(
  rawFieldValues: Array<{ fieldPath: string; value: string }>,
  primaryField: string,
  includeOnly: IncludeOnlyConfig | undefined,
): {
  referenceConditions: ReferenceCondition[];
  inlineNested: Array<{ fieldPath: string; value: string }>;
  apiVerifiedPaths: Set<string>;
} {
  const referenceFields = new Set(includeOnly?.include ?? []);
  const referenceConditions: ReferenceCondition[] = [];
  const inlineNested: Array<{ fieldPath: string; value: string }> = [];
  const apiVerifiedPaths = new Set<string>([primaryField]);

  for (const fv of rawFieldValues) {
    if (fv.fieldPath === primaryField) continue;

    const segments = fv.fieldPath.split(".");
    if (referenceFields.has(segments[0])) {
      // Reference field — queryable via referenceIn($in_query)
      referenceConditions.push({
        refField: segments[0],
        conditions: { [segments.slice(1).join(".")]: fv.value },
      });
      apiVerifiedPaths.add(fv.fieldPath);
    } else {
      // Inline nested (group, global field, modular block) — client-side only
      inlineNested.push(fv);
    }
  }

  return { referenceConditions, inlineNested, apiVerifiedPaths };
}

// Run a Contentstack query for one candidate CT using all available conditions.
// Returns the matching entries and the set of field paths verified by the API.
async function queryForCT(
  ct: string,
  rawFieldValues: Array<{ fieldPath: string; value: string }>,
  primaryField: string,
  includeOnly: IncludeOnlyConfig | undefined,
  locale: string | null,
): Promise<{ entries: any[]; apiVerifiedPaths: Set<string> }> {
  const include = includeOnly?.include ?? [];
  const { referenceConditions, apiVerifiedPaths } = classifyFieldValues(
    rawFieldValues,
    primaryField,
    includeOnly,
  );

  const primary = rawFieldValues.find((fv) => fv.fieldPath === primaryField)!;
  const entries = await SDK.getEntryByField({
    contentTypeUid: ct,
    field: primary.fieldPath,
    value: primary.value,
    include: include.length ? include : undefined,
    referenceConditions: referenceConditions.length
      ? referenceConditions
      : undefined,
    locale,
  });

  return { entries, apiVerifiedPaths };
}

// Verify field values against the fetched entry.
// Fields in apiVerifiedPaths are already guaranteed correct by the API query.
// Inline nested fields are checked via dot-path traversal.
function verifyFieldValues(
  entry: Record<string, any>,
  fieldValues: Array<{ fieldPath: string; value: string }>,
  apiVerifiedPaths: Set<string>,
): FieldValue[] {
  return fieldValues.map(({ fieldPath, value }) => {
    if (apiVerifiedPaths.has(fieldPath)) {
      return { fieldPath, value, verified: true };
    }
    const actual = getNestedValue(entry, fieldPath);
    return { fieldPath, value, verified: actual === value };
  });
}

/**
 * Resolve a full pathname to a Contentstack entry using the preview_url_config.
 * The base/path split and locale are derived from host_patterns in the config —
 * no manual stripping needed at the call site.
 *
 * @param pathname  The full window.location.pathname, e.g. "/en-us/custom/products/widget-x"
 * @param config    The customUrlConfig.json contents
 * @param origin    Current origin; defaults to window.location.origin
 */
export async function resolveEntryFromUrl(
  pathname: string,
  config: CustomUrlConfig,
  origin: string = typeof window !== "undefined" ? window.location.origin : "",
): Promise<ResolutionResult | null> {
  if (!config.enabled || config.path_patterns.length === 0) return null;

  const { path, locale } = extractPathFromUrl(
    pathname,
    config.host_patterns ?? [],
    origin,
  );

  for (const pattern of config.path_patterns) {
    // The matched path is window.location.pathname, which never carries a query
    // string or hash. A pattern may declare them (e.g. "/{{entry.url_slug}}?x=1#y"),
    // so match against the path-only portion; query/hash are display-only.
    const matchPattern = pattern.pattern.split(/[?#]/)[0];
    const placeholders = extractPlaceholders(matchPattern);
    if (placeholders.length === 0) continue;

    const regex = patternToRegex(matchPattern);
    const match = path.match(regex);
    if (!match) continue;

    // Map capture groups to field paths
    const rawFieldValues = placeholders.map((fieldPath, i) => ({
      fieldPath,
      value: match[i + 1],
    }));

    // Primary field: first flat (non-dotted, non-bracket) field — queryable via .where()
    const primary = rawFieldValues.find((fv) => !/[.[]/.test(fv.fieldPath));
    if (!primary) continue; // no flat field to query by — skip pattern

    const candidateCTs = getCandidateCTs(pattern, primary.fieldPath);
    if (candidateCTs.length === 0) continue;

    // Query all candidate CTs in parallel; take the first non-empty result
    const results = await Promise.allSettled(
      candidateCTs.map((ct) =>
        queryForCT(
          ct,
          rawFieldValues,
          primary.fieldPath,
          pattern.include_only?.[ct],
          locale,
        ).then(({ entries, apiVerifiedPaths }) => ({
          ct,
          entries,
          apiVerifiedPaths,
        })),
      ),
    );

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { ct, entries, apiVerifiedPaths } = result.value;
      if (!entries || entries.length === 0) continue;

      // Take the first entry and verify all field values
      const entry = entries[0];
      const fieldValues = verifyFieldValues(
        entry,
        rawFieldValues,
        apiVerifiedPaths,
      );

      return {
        matchedPattern: pattern,
        contentTypeUid: ct,
        entry,
        fieldValues,
      };
    }
  }

  return null;
}
